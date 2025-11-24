// Quick Order System - Main Application

const CONFIG = {
    apiUrl: '/api/quick-order',
    shippingRates: {
        standard: { base: 50, perKg: 40 },
        express: { base: 100, perKg: 60 },
        priority: { base: 150, perKg: 80 }
    },
    processingFeePercent: 2,
    limits: {
        minWeight: 0.1,
        maxWeight: 30,
        minPrice: 100,
        maxPrice: 50000
    }
};

let currentProduct = null;
let currentCost = null;
let successModal = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    successModal = new bootstrap.Modal(document.getElementById('successModal'));
    initEventListeners();
    loadOrders();
});

function initEventListeners() {
    document.getElementById('fetchBtn').addEventListener('click', fetchProduct);
    document.getElementById('costForm').addEventListener('submit', calculateCost);
    document.getElementById('payNowBtn').addEventListener('click', processOrder);
    document.getElementById('submitQuoteBtn').addEventListener('click', submitQuotation);
    
    // Real-time calculation on input change
    ['productPrice', 'productWeight', 'shippingMethod', 'serviceMargin'].forEach(id => {
        document.getElementById(id).addEventListener('input', () => {
            if (document.getElementById('breakdown').classList.contains('d-none') === false) {
                calculateCost(new Event('submit'));
            }
        });
    });
}

// Fetch product from URL
async function fetchProduct() {
    const url = document.getElementById('productUrl').value.trim();
    
    console.log('Fetch button clicked, URL:', url);
    
    if (!url) {
        showToast('Please enter a product URL', 'warning');
        return;
    }
    
    if (!isValidUrl(url)) {
        showToast('Please enter a valid URL', 'danger');
        return;
    }
    
    console.log('Starting fetch process...');
    showLoading(true);
    
    try {
        // Try to call Laravel API first
        try {
            const response = await fetch(CONFIG.apiUrl + '/scrape-product', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken()
                },
                body: JSON.stringify({ url: url })
            });
            
            if (response.ok) {
                const data = await response.json();
                
                if (data.success) {
                    // Extract product data from scraper response
                    const scrapedData = data.data;
                    
                    const product = {
                        name: scrapedData.title || extractProductName(url),
                        url: url,
                        price: parseFloat(scrapedData.price) || 0,
                        weight: scrapedData.weight ? parseFloat(scrapedData.weight.toString().replace(/[^0-9.]/g, '')) : null,
                        category: scrapedData.category || 'General',
                        image: scrapedData.image || '',
                        availability: scrapedData.availability || 'Unknown',
                        rating: scrapedData.rating || 'N/A',
                        reviews: scrapedData.reviews || 'N/A',
                        description: scrapedData.description || '',
                        seller: scrapedData.seller || 'Unknown',
                        shipping_to_nepal: scrapedData.shipping_to_nepal || 'Unknown',
                        delivery_price: scrapedData.delivery_price || 'Unknown',
                        delivery_type: scrapedData.delivery_type || 'Unknown',
                        minimum_order_quantity: scrapedData.minimum_order_quantity || 1
                    };
                    
                    currentProduct = product;
                    displayProduct(product);
                    showToast('Product details fetched successfully!', 'success');
                    return;
                }
            }
        } catch (apiError) {
            console.log('API not available, using demo mode:', apiError.message);
        }
        
        // Fallback to demo mode with realistic data
        console.log('Loading demo product data...');
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate loading
        
        const product = {
            name: extractProductName(url),
            url: url,
            price: Math.floor(Math.random() * 9000) + 500,
            weight: Math.random() < 0.3 ? null : (Math.random() * 4 + 0.5).toFixed(2),
            category: ['Electronics', 'Home & Kitchen', 'Fashion', 'Books', 'Sports'][Math.floor(Math.random() * 5)],
            availability: 'In Stock',
            rating: (Math.random() * 2 + 3).toFixed(1) + ' out of 5 stars',
            reviews: Math.floor(Math.random() * 500) + 50 + ' ratings'
        };
        
        console.log('Demo product created:', product);
        
        currentProduct = product;
        displayProduct(product);
        showToast('Product loaded (Demo Mode - Connect Laravel API for real scraping)', 'info');
        
    } catch (error) {
        console.error('Error:', error);
        showToast('Failed to load product', 'danger');
    } finally {
        showLoading(false);
    }
}

// Get CSRF Token
function getCsrfToken() {
    const token = document.querySelector('meta[name="csrf-token"]');
    return token ? token.getAttribute('content') : '';
}

function displayProduct(product) {
    console.log('Displaying product:', product);
    document.getElementById('productName').textContent = product.name;
    document.getElementById('productUrlText').textContent = product.url;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productWeight').value = product.weight || '';
    
    console.log('Showing calculator section...');
    document.getElementById('calculator-section').classList.remove('d-none');
    
    // Scroll to calculator
    document.getElementById('calculator-section').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    console.log('Product display complete');
}

// Calculate cost
function calculateCost(e) {
    e.preventDefault();
    
    const price = parseFloat(document.getElementById('productPrice').value) || 0;
    const weight = parseFloat(document.getElementById('productWeight').value) || 0;
    const shippingMethod = document.getElementById('shippingMethod').value;
    const marginPercent = parseFloat(document.getElementById('serviceMargin').value) || 15;
    
    if (!weight) {
        showToast('Please enter product weight', 'warning');
        return;
    }
    
    // Calculate shipping
    const shipping = CONFIG.shippingRates[shippingMethod];
    const shippingCost = shipping.base + (weight * shipping.perKg);
    
    // Calculate processing fee
    const processingFee = (price * CONFIG.processingFeePercent) / 100;
    
    // Calculate subtotal
    const subtotal = price + shippingCost + processingFee;
    
    // Calculate margin
    const margin = (subtotal * marginPercent) / 100;
    
    // Final cost
    const finalCost = subtotal + margin;
    
    currentCost = {
        productCost: Math.round(price),
        shippingCost: Math.round(shippingCost),
        processingFee: Math.round(processingFee),
        serviceMargin: Math.round(margin),
        finalCost: Math.round(finalCost)
    };
    
    displayCostBreakdown(currentCost);
    checkEligibility(price, weight);
}

function displayCostBreakdown(costs) {
    document.getElementById('costProduct').textContent = `₹${costs.productCost}`;
    document.getElementById('costShipping').textContent = `₹${costs.shippingCost}`;
    document.getElementById('costProcessing').textContent = `₹${costs.processingFee}`;
    document.getElementById('costMargin').textContent = `₹${costs.serviceMargin}`;
    document.getElementById('finalCost').textContent = `₹${costs.finalCost}`;
    document.getElementById('payAmount').textContent = `₹${costs.finalCost}`;
    
    document.getElementById('breakdown').classList.remove('d-none');
}

function checkEligibility(price, weight) {
    const issues = [];
    
    // Weight validation
    if (!weight) {
        issues.push('⚠️ Weight information not available - Required for shipping calculation');
    } else {
        if (weight < CONFIG.limits.minWeight) issues.push(`Weight below minimum (${CONFIG.limits.minWeight}kg)`);
        if (weight > CONFIG.limits.maxWeight) issues.push(`Weight exceeds maximum (${CONFIG.limits.maxWeight}kg)`);
    }
    
    // Price validation
    if (price < CONFIG.limits.minPrice) issues.push(`Price below minimum (₹${CONFIG.limits.minPrice})`);
    if (price > CONFIG.limits.maxPrice) issues.push(`Price exceeds maximum (₹${CONFIG.limits.maxPrice})`);
    
    // Check shipping eligibility (if product data has this info)
    if (currentProduct && currentProduct.shipping_to_nepal) {
        if (currentProduct.shipping_to_nepal.includes('Not Eligible')) {
            issues.push('🚫 Not eligible for shipping to Nepal');
        }
    }
    
    const statusEl = document.getElementById('eligibilityStatus');
    const customerSection = document.getElementById('customerSection');
    const quotationSection = document.getElementById('quotationSection');
    
    if (issues.length === 0) {
        // Eligible for quick order
        statusEl.className = 'alert alert-success mb-4';
        statusEl.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="bi bi-check-circle-fill me-2 fs-4"></i>
                <div>
                    <strong>✅ Eligible for Quick Order!</strong>
                    <p class="mb-0 small mt-1">All parameters match. Please provide your details to proceed with instant checkout.</p>
                </div>
            </div>`;
        customerSection.classList.remove('d-none');
        quotationSection.classList.add('d-none');
    } else {
        // Requires quotation
        statusEl.className = 'alert alert-warning mb-4';
        statusEl.innerHTML = `
            <div class="d-flex align-items-start">
                <i class="bi bi-exclamation-triangle-fill me-2 fs-4"></i>
                <div>
                    <strong>⚠️ Manual Quotation Required</strong>
                    <p class="mb-0 small mt-1">This product doesn't qualify for Quick Order processing.</p>
                </div>
            </div>`;
        document.getElementById('quotationReason').innerHTML = `
            <strong>Reasons:</strong>
            <ul class="mb-0 mt-2 small">
                ${issues.map(issue => `<li>${issue}</li>`).join('')}
            </ul>
            <p class="mb-0 mt-2 small"><em>Please submit a quotation request below and our team will contact you within 24 hours.</em></p>
        `;
        customerSection.classList.add('d-none');
        quotationSection.classList.remove('d-none');
    }
}

// Process Order
async function processOrder() {
    const name = document.getElementById('customerName').value.trim();
    const email = document.getElementById('customerEmail').value.trim();
    const phone = document.getElementById('customerPhone').value.trim();
    const city = document.getElementById('customerCity').value.trim();
    const address = document.getElementById('customerAddress').value.trim();
    
    if (!name || !email || !phone || !city || !address) {
        showToast('Please fill all customer details', 'warning');
        return;
    }
    
    if (!isValidEmail(email)) {
        showToast('Please enter a valid email', 'danger');
        return;
    }
    
    const btn = document.getElementById('payNowBtn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Processing...';
    
    try {
        const order = {
            orderId: generateOrderId(),
            timestamp: new Date().toISOString(),
            product: currentProduct,
            costs: currentCost,
            customer: { name, email, phone, city, address },
            status: 'pending'
        };
        
        // Save to localStorage
        saveOrder(order);
        
        // Show success modal
        document.getElementById('modalOrderId').textContent = order.orderId;
        successModal.show();
        
        // Reset form
        setTimeout(() => {
            resetForm();
            loadOrders();
        }, 1000);
        
    } catch (error) {
        showToast('Failed to process order', 'danger');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-credit-card me-2"></i>Pay Now - <span id="payAmount">₹' + currentCost.finalCost + '</span>';
    }
}

// Submit Quotation
async function submitQuotation() {
    const name = document.getElementById('quoteName').value.trim();
    const email = document.getElementById('quoteEmail').value.trim();
    const phone = document.getElementById('quotePhone').value.trim();
    const info = document.getElementById('quoteInfo').value.trim();
    
    if (!name || !email || !phone) {
        showToast('Please fill all required fields', 'warning');
        return;
    }
    
    if (!isValidEmail(email)) {
        showToast('Please enter a valid email', 'danger');
        return;
    }
    
    const btn = document.getElementById('submitQuoteBtn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Submitting...';
    
    try {
        const quotation = {
            quotationId: generateOrderId(),
            timestamp: new Date().toISOString(),
            productUrl: currentProduct.url,
            customer: { name, email, phone, additionalInfo: info },
            status: 'quotation_pending'
        };
        
        saveOrder(quotation);
        showToast('Quotation request submitted successfully!', 'success');
        
        setTimeout(() => {
            resetForm();
            loadOrders();
        }, 1500);
        
    } catch (error) {
        showToast('Failed to submit quotation', 'danger');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-send me-2"></i>Submit Request';
    }
}

// Orders Management
function saveOrder(order) {
    const orders = JSON.parse(localStorage.getItem('quickOrders') || '[]');
    orders.unshift(order);
    localStorage.setItem('quickOrders', JSON.stringify(orders));
}

function loadOrders() {
    const orders = JSON.parse(localStorage.getItem('quickOrders') || '[]');
    const container = document.getElementById('ordersList');
    
    if (orders.length === 0) {
        container.innerHTML = `
            <div class="list-group-item text-center text-muted py-4">
                <i class="bi bi-inbox display-4 mb-2 d-block opacity-25"></i>
                <p class="mb-0 small">No orders yet</p>
            </div>`;
        return;
    }
    
    container.innerHTML = orders.slice(0, 10).map(order => {
        const id = order.orderId || order.quotationId;
        const status = getStatusBadge(order.status);
        const amount = order.costs ? `<span class="badge bg-success">₹${order.costs.finalCost}</span>` : '';
        
        return `
            <div class="list-group-item">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <h6 class="mb-0 fw-bold">#${id}</h6>
                    ${status}
                </div>
                <div class="small text-muted">
                    <i class="bi bi-person me-1"></i>${order.customer.name}
                    ${amount}
                    <div class="mt-1">
                        <i class="bi bi-calendar me-1"></i>${new Date(order.timestamp).toLocaleString()}
                    </div>
                </div>
            </div>`;
    }).join('');
}

function getStatusBadge(status) {
    const badges = {
        'pending': '<span class="badge bg-warning">Pending</span>',
        'quotation_pending': '<span class="badge bg-info">Quotation Pending</span>',
        'completed': '<span class="badge bg-success">Completed</span>',
        'processing': '<span class="badge bg-primary">Processing</span>'
    };
    return badges[status] || '<span class="badge bg-secondary">Unknown</span>';
}

// Utilities
function generateOrderId() {
    return 'ORD' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function extractProductName(url) {
    try {
        const urlObj = new URL(url);
        const segments = urlObj.pathname.split('/').filter(s => s);
        const lastSegment = segments[segments.length - 1] || 'Product';
        return lastSegment
            .replace(/-/g, ' ')
            .split(' ')
            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ')
            .substring(0, 80);
    } catch {
        return 'Product';
    }
}

function showLoading(show) {
    const loadingEl = document.getElementById('loading');
    const calculatorEl = document.getElementById('calculator-section');
    
    if (loadingEl) {
        loadingEl.classList.toggle('d-none', !show);
    }
    if (calculatorEl && show) {
        calculatorEl.classList.add('d-none');
    }
}

function resetForm() {
    document.getElementById('productUrl').value = '';
    document.getElementById('calculator').classList.add('d-none');
    document.getElementById('breakdown').classList.add('d-none');
    document.getElementById('customerName').value = '';
    document.getElementById('customerEmail').value = '';
    document.getElementById('customerPhone').value = '';
    document.getElementById('customerCity').value = '';
    document.getElementById('customerAddress').value = '';
    document.getElementById('quoteName').value = '';
    document.getElementById('quoteEmail').value = '';
    document.getElementById('quotePhone').value = '';
    document.getElementById('quoteInfo').value = '';
    currentProduct = null;
    currentCost = null;
}

function showToast(message, type = 'info') {
    const toastHtml = `
        <div class="toast align-items-center text-white bg-${type} border-0 position-fixed top-0 end-0 m-3" 
             role="alert" style="z-index: 9999;">
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>`;
    
    const div = document.createElement('div');
    div.innerHTML = toastHtml;
    const toastEl = div.firstElementChild;
    document.body.appendChild(toastEl);
    
    const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
    toast.show();
    
    toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
}
