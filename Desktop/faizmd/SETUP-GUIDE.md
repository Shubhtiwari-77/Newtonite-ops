# Quick Order System - Setup Guide

## 🎯 System Overview

This Quick Order System integrates with your existing web scraper to automatically extract product details from e-commerce sites (Amazon, Flipkart, Myntra, etc.) and calculate shipping costs for Nepal.

## 📋 Prerequisites

- PHP 8.0+
- Laravel 9+
- Your existing web scraper running
- MySQL/PostgreSQL database

## 🚀 Installation Steps

### 1. Copy Backend Files

```bash
# Copy controller
cp Laravel-Backend/QuickOrderController.php app/Http/Controllers/Api/

# Copy models
cp Laravel-Backend/QuickOrder.php app/Models/
cp Laravel-Backend/Quotation.php app/Models/

# Copy migrations
cp Laravel-Backend/migrations/*.php database/migrations/
```

### 2. Configure Environment

Add to your `.env` file:

```env
# Web Scraper Configuration
SCRAPER_API_URL=http://localhost/web-scraper/scrape.php

# Quick Order Limits
QUICK_ORDER_MIN_WEIGHT=0.1
QUICK_ORDER_MAX_WEIGHT=30
QUICK_ORDER_MIN_PRICE=100
QUICK_ORDER_MAX_PRICE=50000

# Shipping Rates
SHIPPING_STANDARD_BASE=50
SHIPPING_STANDARD_PER_KG=40
SHIPPING_EXPRESS_BASE=100
SHIPPING_EXPRESS_PER_KG=60
SHIPPING_PRIORITY_BASE=150
SHIPPING_PRIORITY_PER_KG=80

# Processing Fee
PROCESSING_FEE_PERCENT=2
SERVICE_MARGIN_PERCENT=15
```

### 3. Add Routes

In `routes/api.php`, add:

```php
use App\Http\Controllers\Api\QuickOrderController;

Route::prefix('quick-order')->group(function () {
    Route::post('/scrape-product', [QuickOrderController::class, 'scrapeProduct']);
    Route::post('/create-order', [QuickOrderController::class, 'createOrder']);
    Route::post('/create-quotation', [QuickOrderController::class, 'createQuotation']);
    Route::get('/orders', [QuickOrderController::class, 'getOrders']);
});
```

### 4. Run Migrations

```bash
php artisan migrate
```

### 5. Configure CORS (if needed)

In `config/cors.php`:

```php
'paths' => ['api/*'],
'allowed_methods' => ['*'],
'allowed_origins' => ['*'], // Or specify your frontend domain
'allowed_headers' => ['*'],
'supports_credentials' => true,
```

## 🔗 Web Scraper Integration

### Your Scraper Output Format (Expected):

```json
{
    "title": "Product Name",
    "price": "599",
    "image": "https://...",
    "availability": "In stock",
    "rating": "4.5 out of 5 stars",
    "reviews": "450 ratings",
    "description": "Product description",
    "category": "Electronics > Audio",
    "weight": "200 Grams",
    "seller": "Amazon India",
    "shipping_to_nepal": "Not Eligible for Shipping to Nepal",
    "delivery_price": "Pay on Delivery",
    "delivery_duration": "Delivery Time Not Found",
    "delivery_type": "Prime",
    "minimum_order_quantity": "Minimum Order: 2"
}
```

### Scraper API Endpoint:

Update `SCRAPER_API_URL` in `.env` to point to your scraper:

```
SCRAPER_API_URL=http://your-domain.com/web-scraper/api
```

The system will POST to this endpoint with:
```json
{
    "url": "https://www.amazon.in/product/..."
}
```

## 📊 Weight Parsing

The system automatically converts weight formats:
- "200 Grams" → 0.2 kg
- "1.5 kg" → 1.5 kg
- "500g" → 0.5 kg

## ✅ Eligibility Rules

Quick Order is APPROVED if:
- ✓ Weight is available
- ✓ Weight between 0.1kg - 30kg
- ✓ Price between ₹100 - ₹50,000
- ✓ Eligible for Nepal shipping

Manual Quotation if:
- ✗ Weight missing
- ✗ Weight/price out of range
- ✗ Not eligible for Nepal shipping

## 🎨 Frontend Setup

1. Open `index.html`
2. Update API URL in `app.js` (line 2):

```javascript
const CONFIG = {
    apiUrl: 'https://your-domain.com/api/quick-order',
    // ... rest of config
};
```

3. Add CSRF token meta tag in HTML `<head>`:

```html
<meta name="csrf-token" content="{{ csrf_token() }}">
```

## 🧪 Testing

### Test Scraper Integration:

```bash
curl -X POST http://localhost/api/quick-order/scrape-product \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.amazon.in/product/..."}'
```

### Expected Response:

```json
{
    "success": true,
    "message": "Product data scraped successfully",
    "data": {
        "title": "Product Name",
        "price": 599,
        "weight": 0.2,
        "availability": "In stock",
        ...
    }
}
```

## 🔍 Supported E-commerce Sites

Based on your scraper, supports:
- ✅ Amazon India
- ✅ Flipkart
- ✅ Myntra
- ✅ Ajio
- ✅ Nykaa

## 📧 Notifications (Optional)

To enable email notifications:

```bash
php artisan make:mail OrderConfirmationMail
php artisan make:mail QuotationRequestMail
```

Uncomment mail lines in controller.

## 🐛 Troubleshooting

### Scraper Not Working?

1. Check scraper URL in `.env`
2. Verify scraper is running
3. Check Laravel logs: `tail -f storage/logs/laravel.log`
4. System falls back to simulated data if scraper fails

### Weight Not Detected?

The system will automatically flag as "Manual Quotation Required" if:
- Weight field is null
- Weight is "Weight Not Found"

### Database Errors?

```bash
php artisan migrate:fresh
php artisan optimize:clear
```

## 📱 API Endpoints

### 1. Scrape Product
```
POST /api/quick-order/scrape-product
Body: {"url": "product_url"}
```

### 2. Create Order
```
POST /api/quick-order/create-order
Body: {order_data}
```

### 3. Create Quotation
```
POST /api/quick-order/create-quotation
Body: {quotation_data}
```

### 4. Get Orders
```
GET /api/quick-order/orders
```

## 🎯 Cost Calculation Formula

```
Product Cost = Product Price
Shipping Cost = Base Rate + (Weight × Per KG Rate)
Processing Fee = Product Cost × 2%
Subtotal = Product Cost + Shipping + Processing Fee
Service Margin = Subtotal × 15%
Final Cost = Subtotal + Service Margin
```

## 📝 Database Schema

### quick_orders
- order_id (unique)
- product_data (JSON)
- cost_breakdown (JSON)
- customer details
- status, payment_status

### quotations
- quotation_id (unique)
- product_url
- customer details
- status

## 🔐 Security

- ✅ CSRF protection enabled
- ✅ Input validation
- ✅ SQL injection prevention (Eloquent ORM)
- ✅ Rate limiting recommended
- ✅ HTTPS required for production

## 📊 Monitoring

Check order statistics:

```php
// In controller
QuickOrder::where('status', 'pending')->count();
Quotation::where('status', 'quotation_pending')->count();
```

## 🚀 Go Live

1. Update `.env` with production values
2. Set `APP_ENV=production`
3. Run `php artisan config:cache`
4. Run `php artisan route:cache`
5. Configure SSL certificate
6. Set up cron jobs (if needed)
7. Configure backup system

## 📞 Support

For issues:
1. Check Laravel logs
2. Enable debug mode: `APP_DEBUG=true`
3. Test scraper independently
4. Verify database connections

---

**Ready to use!** 🎉

System now fully integrates with your web scraper and handles both quick orders and manual quotations automatically.
