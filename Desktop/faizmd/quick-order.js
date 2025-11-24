// QUICK Order System - Main JavaScript with Laravel Integration

// Configuration & Parameters
const CONFIG = {
    // Laravel API endpoints
    apiBaseUrl: '/api/quick-order', // Laravel API base URL
    endpoints: {
        scrapeProduct: '/scrape-product',
        createOrder: '/create-order',
        createQuotation: '/create-quotation',
        getOrders: '/orders'
    },
    
    // Parameters for Quick Order eligibility
    minWeight: 0.1, // Minimum weight in kg
    maxWeight: 30, // Maximum weight in kg for quick order
    minPrice: 100, // Minimum price in INR
    maxPrice: 50000, // Maximum price for quick order
    
    // Cost calculation parameters
    baseShippingRate: 50, // Base shipping cost
    shippingPerKg: 40, // Cost per kg
    processingFeePercent: 2, // 2% processing fee
    serviceMarginPercent: 15, // 15% service margin
    
    // Storage
    storageKey: 'quickOrders'
};

// Global state
let currentProduct = null;
let currentCost = null;
let successModal = null;

// DOM Elements
const elements = {
    analyzeForm: document.getElementById('analyzeForm'),
    productUrl: document.getElementById('productUrl'),
    analyzeBtn: document.getElementById('analyzeBtn'),
    loadingState: document.getElementById('loadingState'),
    productDisplay: document.getElementById('productDisplay'),
    manualQuotation: document.getElementById('manualQuotation'),
    statusBadge: document.getElementById('statusBadge'),
    
    // Product details
    productName: document.getElementById('productName'),
    originalPrice: document.getElementById('originalPrice'),
    productWeight: document.getElementById('productWeight'),
    productCategory: document.getElementById('productCategory'),
    
    // Cost breakdown
    costProduct: document.getElementById('costProduct'),
    costShipping: document.getElementById('costShipping'),
    costProcessing: document.getElementById('costProcessing'),
    costMargin: document.getElementById('costMargin'),
    finalCost: document.getElementById('finalCost'),
    
    // Forms and buttons
    customerForm: document.getElementById('customerForm'),
    actionButtons: document.getElementById('actionButtons'),
    payNowBtn: document.getElementById('payNowBtn'),
    payAmount: document.getElementById('payAmount'),
    
    // Manual quotation
    quotationReason: document.getElementById('quotationReason'),
    submitQuoteBtn: document.getElementById('submitQuoteBtn'),
    
    // Modal
    successModal: document.getElementById('successModal'),
    modalOrderId: document.getElementById('modalOrderId'),
    
    // Order list
    orderList: document.getElementById('orderList')
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeBootstrap();
    initializeEventListeners();
    loadOrderHistory();
});

// Initialize Bootstrap components
function initializeBootstrap() {
    successModal = new bootstrap.Modal(elements.successModal);
}

// Get CSRF token for Laravel
function getCsrfToken() {
    const token = document.querySelector('meta[name="csrf-token"]');
    return token ? token.getAttribute('content') : '';
}

// Event Listeners
function initializeEventListeners() {
    elements.analyzeForm.addEventListener('submit', handleAnalyzeProduct);
    elements.payNowBtn.addEventListener('click', handlePayNow);
    elements.submitQuoteBtn.addEventListener('click', handleQuotationRequest);
}

// Laravel API Helper
async function laravelAPI(endpoint, method = 'GET', data = null) {
    const url = CONFIG.apiBaseUrl + endpoint;
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': getCsrfToken(),
            'Accept': 'application/json'
        }
    };
    
    if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(url, options);
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'API request failed');
        }
        
        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Main function to analyze product
async function handleAnalyzeProduct(e) {
    e.preventDefault();
    
    const url = elements.productUrl.value.trim();
    
    if (!url) {
        showNotification('Please enter a product URL', 'warning');
        return;
    }
    
    if (!isValidUrl(url)) {
        showNotification('Please enter a valid URL', 'warning');
        return;
    }
    
    showLoading(true);
    hideAllSections();
    
    try {
        // Call Laravel API to scrape product data
        const response = await laravelAPI(CONFIG.endpoints.scrapeProduct, 'POST', { url: url });
        
        // If using simulated data (for testing without backend)
        // const productData = await scrapeProductData(url);
        
        const productData = response.data;
        
        if (!productData) {
            throw new Error('Could not extract product data');
        }
        
        currentProduct = productData;
        
        // Check if qualifies for quick order
        const qualificationResult = checkQuickOrderEligibility(productData);
        
        if (qualificationResult.eligible) {
            // Calculate costs
            currentCost = calculateCosts(productData);
            displayProductDetails(productData, currentCost);
            showQuickOrderForm();
        } else {
            showManualQuotationForm(qualificationResult.reasons);
        }
        
    } catch (error) {
        console.error('Analysis error:', error);
        showNotification('Failed to analyze product: ' + error.message, 'danger');
        
        // Fallback to simulated data for testing
        try {
            const productData = await scrapeProductData(url);
            currentProduct = productData;
            const qualificationResult = checkQuickOrderEligibility(productData);
            
            if (qualificationResult.eligible) {
                currentCost = calculateCosts(productData);
                displayProductDetails(productData, currentCost);
                showQuickOrderForm();
            } else {
                showManualQuotationForm(qualificationResult.reasons);
            }
        } catch (fallbackError) {
            console.error('Fallback error:', fallbackError);
        }
    } finally {
        showLoading(false);
    }
}

// Scrape product data (simulated - in production, use backend API)
async function scrapeProductData(url) {
    // This is a simulation. In production, you'd:
    // 1. Send URL to your backend
    // 2. Backend scrapes the page using Puppeteer/Cheerio
    // 3. Return extracted data
    
    // Simulated data extraction based on URL patterns
    const simulatedData = {
        url: url,
        name: extractProductNameFromUrl(url),
        price: Math.floor(Math.random() * 10000) + 500,
        weight: Math.random() < 0.3 ? null : (Math.random() * 5 + 0.5).toFixed(2), // 30% chance of missing weight
        category: 'Electronics',
        imageUrl: '',
        description: 'Product description',
        availability: 'In Stock'
    };
    
    return simulatedData;
}

// Extract product name from URL (helper)
function extractProductNameFromUrl(url) {
    try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        const segments = pathname.split('/').filter(s => s);
        const lastSegment = segments[segments.length - 1] || 'Product';
        return lastSegment
            .replace(/-/g, ' ')
            .replace(/_/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
            .substring(0, 100);
    } catch {
        return 'Product';
    }
}

// Check if product qualifies for quick order
function checkQuickOrderEligibility(product) {
    const reasons = [];
    
    // Check weight
    if (!product.weight || product.weight === null) {
        reasons.push('Weight information is not available');
    } else {
        const weight = parseFloat(product.weight);
        if (weight < CONFIG.minWeight) {
            reasons.push(`Weight too low (minimum: ${CONFIG.minWeight}kg)`);
        }
        if (weight > CONFIG.maxWeight) {
            reasons.push(`Weight exceeds limit (maximum: ${CONFIG.maxWeight}kg)`);
        }
    }
    
    // Check price
    if (!product.price || product.price === null) {
        reasons.push('Price information is not available');
    } else {
        if (product.price < CONFIG.minPrice) {
            reasons.push(`Price too low (minimum: ₹${CONFIG.minPrice})`);
        }
        if (product.price > CONFIG.maxPrice) {
            reasons.push(`Price exceeds limit (maximum: ₹${CONFIG.maxPrice})`);
        }
    }
    
    // Check availability
    if (product.availability && product.availability.toLowerCase().includes('out of stock')) {
        reasons.push('Product is out of stock');
    }
    
    return {
        eligible: reasons.length === 0,
        reasons: reasons
    };
}

// Calculate all costs
function calculateCosts(product) {
    const productCost = parseFloat(product.price) || 0;
    const weight = parseFloat(product.weight) || 1;
    
    // Calculate shipping
    const shippingCost = CONFIG.baseShippingRate + (weight * CONFIG.shippingPerKg);
    
    // Calculate processing fee
    const processingFee = (productCost * CONFIG.processingFeePercent) / 100;
    
    // Calculate subtotal
    const subtotal = productCost + shippingCost + processingFee;
    
    // Calculate service margin
    const serviceMargin = (subtotal * CONFIG.serviceMarginPercent) / 100;
    
    // Final cost
    const finalCost = subtotal + serviceMargin;
    
    return {
        productCost: Math.round(productCost),
        shippingCost: Math.round(shippingCost),
        processingFee: Math.round(processingFee),
        serviceMargin: Math.round(serviceMargin),
        finalCost: Math.round(finalCost)
    };
}

// Display product details
function displayProductDetails(product, costs) {
    elements.productName.textContent = product.name;
    elements.originalPrice.textContent = `₹${product.price}`;
    elements.productWeight.textContent = product.weight ? `${product.weight} kg` : 'N/A';
    elements.productCategory.textContent = product.category || 'General';
    
    elements.costProduct.textContent = `₹${costs.productCost}`;
    elements.costShipping.textContent = `₹${costs.shippingCost}`;
    elements.costProcessing.textContent = `₹${costs.processingFee}`;
    elements.costMargin.textContent = `₹${costs.serviceMargin}`;
    elements.finalCost.textContent = `₹${costs.finalCost}`;
    elements.payAmount.textContent = `₹${costs.finalCost}`;
    
    elements.statusBadge.textContent = '✓ Quick Order Available';
    elements.statusBadge.className = 'badge bg-success';
    
    elements.productDisplay.classList.remove('d-none');
}

// Show quick order form
function showQuickOrderForm() {
    elements.customerForm.classList.remove('d-none');
    elements.actionButtons.classList.remove('d-none');
}

// Show manual quotation form
function showManualQuotationForm(reasons) {
    const reasonText = reasons.length > 0 
        ? `This product doesn't qualify for Quick Order:\n\n${reasons.map(r => `• ${r}`).join('\n')}\n\nPlease submit a quotation request and we'll process it manually.`
        : 'This product requires manual quotation.';
    
    elements.quotationReason.textContent = reasonText;
    elements.manualQuotation.classList.remove('d-none');
}

// Handle payment
async function handlePayNow() {
    // Validate customer details
    const customerName = document.getElementById('customerName').value.trim();
    const customerEmail = document.getElementById('customerEmail').value.trim();
    const customerPhone = document.getElementById('customerPhone').value.trim();
    const customerCity = document.getElementById('customerCity').value.trim();
    const customerAddress = document.getElementById('customerAddress').value.trim();
    
    if (!customerName || !customerEmail || !customerPhone || !customerCity || !customerAddress) {
        showNotification('Please fill in all customer details', 'warning');
        return;
    }
    
    if (!isValidEmail(customerEmail)) {
        showNotification('Please enter a valid email address', 'warning');
        return;
    }
    
    // Show loading
    elements.payNowBtn.disabled = true;
    elements.payNowBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Processing...';
    
    // Create order object
    const orderData = {
        product: currentProduct,
        costs: currentCost,
        customer: {
            name: customerName,
            email: customerEmail,
            phone: customerPhone,
            city: customerCity,
            address: customerAddress
        }
    };
    
    try {
        // Send to Laravel backend
        const response = await laravelAPI(CONFIG.endpoints.createOrder, 'POST', orderData);
        
        // Show success modal
        showSuccessModal(response.data.order_id);
        
        // Save order locally as backup
        saveOrderLocally({
            orderId: response.data.order_id,
            timestamp: new Date().toISOString(),
            status: 'pending',
            ...orderData
        });
        
        // Reset form
        setTimeout(() => {
            resetForm();
            loadOrderHistory();
        }, 1000);
        
    } catch (error) {
        console.error('Order creation error:', error);
        showNotification('Failed to create order: ' + error.message, 'danger');
        
        // Fallback: Save locally if API fails
        const localOrder = {
            orderId: generateOrderId(),
            timestamp: new Date().toISOString(),
            status: 'pending',
            ...orderData
        };
        saveOrderLocally(localOrder);
        showSuccessModal(localOrder.orderId);
        
        setTimeout(() => {
            resetForm();
            loadOrderHistory();
        }, 1000);
    } finally {
        elements.payNowBtn.disabled = false;
        elements.payNowBtn.innerHTML = '<i class="bi bi-credit-card-fill me-2"></i>Pay Now - <span id="payAmount">₹' + currentCost.finalCost + '</span>';
    }
}

// Handle quotation request
async function handleQuotationRequest() {
    const name = document.getElementById('quoteCustomerName').value.trim();
    const email = document.getElementById('quoteCustomerEmail').value.trim();
    const phone = document.getElementById('quoteCustomerPhone').value.trim();
    const additionalInfo = document.getElementById('quoteAdditionalInfo').value.trim();
    
    if (!name || !email || !phone) {
        showNotification('Please fill in all required fields', 'warning');
        return;
    }
    
    if (!isValidEmail(email)) {
        showNotification('Please enter a valid email address', 'warning');
        return;
    }
    
    // Show loading
    elements.submitQuoteBtn.disabled = true;
    elements.submitQuoteBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Submitting...';
    
    const quotationData = {
        product_url: elements.productUrl.value,
        customer: {
            name: name,
            email: email,
            phone: phone,
            additional_info: additionalInfo
        }
    };
    
    try {
        // Send to Laravel backend
        const response = await laravelAPI(CONFIG.endpoints.createQuotation, 'POST', quotationData);
        
        showNotification('Quotation request submitted successfully! We will contact you soon.', 'success');
        
        // Save locally as backup
        saveOrderLocally({
            quotationId: response.data.quotation_id,
            timestamp: new Date().toISOString(),
            status: 'quotation_pending',
            productUrl: elements.productUrl.value,
            customer: quotationData.customer
        });
        
        setTimeout(() => {
            resetForm();
            loadOrderHistory();
        }, 1500);
        
    } catch (error) {
        console.error('Quotation error:', error);
        showNotification('Failed to submit quotation: ' + error.message, 'danger');
        
        // Fallback: Save locally
        const localQuotation = {
            quotationId: generateOrderId(),
            timestamp: new Date().toISOString(),
            status: 'quotation_pending',
            productUrl: elements.productUrl.value,
            customer: quotationData.customer
        };
        saveOrderLocally(localQuotation);
        showNotification('Quotation request saved locally. We will contact you soon.', 'info');
        
        setTimeout(() => {
            resetForm();
            loadOrderHistory();
        }, 1500);
    } finally {
        elements.submitQuoteBtn.disabled = false;
        elements.submitQuoteBtn.innerHTML = '<i class="bi bi-send-fill me-2"></i>Submit Quotation Request';
    }
}

// Save order locally (fallback/cache)
function saveOrderLocally(order) {
    const orders = getOrdersLocally();
    orders.unshift(order);
    localStorage.setItem(CONFIG.storageKey, JSON.stringify(orders));
}

// Get orders from local storage
function getOrdersLocally() {
    const data = localStorage.getItem(CONFIG.storageKey);
    return data ? JSON.parse(data) : [];
}

// Load order history
async function loadOrderHistory() {
    try {
        // Try to fetch from Laravel API
        const response = await laravelAPI(CONFIG.endpoints.getOrders);
        const orders = response.data;
        displayOrders(orders);
    } catch (error) {
        console.log('Loading from local storage');
        // Fallback to local storage
        const orders = getOrdersLocally();
        displayOrders(orders);
    }
}

// Display orders in UI
function displayOrders(orders) {
    if (orders.length === 0) {
        elements.orderList.innerHTML = `
            <div class="list-group-item text-center text-muted py-5">
                <i class="bi bi-inbox display-1 mb-3 d-block"></i>
                <p class="mb-0">No orders yet</p>
            </div>`;
        return;
    }
    
    elements.orderList.innerHTML = orders.slice(0, 10).map(order => {
        const orderId = order.orderId || order.order_id || order.quotationId || order.quotation_id;
        const statusClass = getStatusClass(order.status);
        const statusText = formatStatus(order.status);
        
        return `
            <div class="list-group-item">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <h6 class="mb-0 text-primary">#${orderId}</h6>
                    <span class="badge ${statusClass}">${statusText}</span>
                </div>
                <div class="text-muted small">
                    <p class="mb-1"><i class="bi bi-person me-1"></i><strong>Customer:</strong> ${order.customer.name}</p>
                    ${order.costs ? `<p class="mb-1"><i class="bi bi-currency-rupee me-1"></i><strong>Amount:</strong> ₹${order.costs.finalCost}</p>` : ''}
                    <p class="mb-0"><i class="bi bi-calendar me-1"></i>${new Date(order.timestamp).toLocaleString()}</p>
                </div>
            </div>`;
    }).join('');
}

// Get Bootstrap status class
function getStatusClass(status) {
    const statusMap = {
        'pending': 'bg-warning',
        'quotation_pending': 'bg-info',
        'completed': 'bg-success',
        'processing': 'bg-primary'
    };
    return statusMap[status] || 'bg-secondary';
}

// Utility functions
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

function formatStatus(status) {
    const statusMap = {
        'pending': 'Pending Payment',
        'quotation_pending': 'Quotation Pending',
        'completed': 'Completed',
        'processing': 'Processing'
    };
    return statusMap[status] || status;
}

function showLoading(show) {
    elements.loadingState.classList.toggle('d-none', !show);
}

function hideAllSections() {
    elements.productDisplay.classList.add('d-none');
    elements.manualQuotation.classList.add('d-none');
}

function resetForm() {
    elements.productUrl.value = '';
    document.getElementById('customerName').value = '';
    document.getElementById('customerEmail').value = '';
    document.getElementById('customerPhone').value = '';
    document.getElementById('customerCity').value = '';
    document.getElementById('customerAddress').value = '';
    document.getElementById('quoteCustomerName').value = '';
    document.getElementById('quoteCustomerEmail').value = '';
    document.getElementById('quoteCustomerPhone').value = '';
    document.getElementById('quoteAdditionalInfo').value = '';
    hideAllSections();
    currentProduct = null;
    currentCost = null;
}

function showSuccessModal(orderId) {
    elements.modalOrderId.textContent = orderId;
    successModal.show();
}

function showNotification(message, type = 'info') {
    // Create Bootstrap toast
    const toastHtml = `
        <div class="toast align-items-center text-white bg-${type} border-0 position-fixed top-0 end-0 m-3" role="alert" style="z-index: 9999;">
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>`;
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = toastHtml;
    const toastElement = tempDiv.firstElementChild;
    document.body.appendChild(toastElement);
    
    const toast = new bootstrap.Toast(toastElement, { delay: 4000 });
    toast.show();
    
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}
