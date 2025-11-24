# QUICK Order System - Laravel Backend

## Overview
This is the Laravel PHP backend for the QUICK Order System that handles product scraping, cost calculation, order management, and quotation requests.

## Installation

### 1. Copy Files to Laravel Project

Copy the files to your Laravel project:

```bash
# Controllers
cp QuickOrderController.php app/Http/Controllers/Api/

# Models
cp QuickOrder.php app/Models/
cp Quotation.php app/Models/

# Migrations
cp migrations/*.php database/migrations/

# Routes (merge with your existing api.php)
# Add the routes from api.php to your routes/api.php
```

### 2. Run Migrations

```bash
php artisan migrate
```

### 3. Configure CORS (if frontend is on different domain)

In `config/cors.php`:

```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_methods' => ['*'],
'allowed_origins' => ['*'], // Or specify your frontend domain
'allowed_headers' => ['*'],
'supports_credentials' => true,
```

### 4. API Endpoints

All endpoints are prefixed with `/api/quick-order`

#### Scrape Product
```http
POST /api/quick-order/scrape-product
Content-Type: application/json

{
  "url": "https://example.com/product/sample-product"
}
```

#### Create Order
```http
POST /api/quick-order/create-order
Content-Type: application/json

{
  "product": {
    "name": "Product Name",
    "price": 1000,
    "weight": 2.5,
    "category": "Electronics"
  },
  "costs": {
    "productCost": 1000,
    "shippingCost": 150,
    "processingFee": 20,
    "serviceMargin": 175,
    "finalCost": 1345
  },
  "customer": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+91 9876543210",
    "city": "Mumbai",
    "address": "123 Main St, Mumbai"
  }
}
```

#### Create Quotation
```http
POST /api/quick-order/create-quotation
Content-Type: application/json

{
  "product_url": "https://example.com/product",
  "customer": {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "+91 9876543210",
    "additional_info": "Need bulk pricing"
  }
}
```

#### Get Orders
```http
GET /api/quick-order/orders
```

## Database Schema

### quick_orders Table
- `id` - Primary key
- `order_id` - Unique order identifier
- `product_data` - JSON (product details)
- `cost_breakdown` - JSON (cost calculation)
- `customer_name` - String
- `customer_email` - String
- `customer_phone` - String
- `customer_city` - String (nullable)
- `customer_address` - Text
- `status` - Enum (pending, processing, completed, cancelled)
- `payment_status` - Enum (pending, paid, failed, refunded)
- `payment_method` - String (nullable)
- `transaction_id` - String (nullable)
- `timestamps`

### quotations Table
- `id` - Primary key
- `quotation_id` - Unique quotation identifier
- `product_url` - Text
- `customer_name` - String
- `customer_email` - String
- `customer_phone` - String
- `additional_info` - Text (nullable)
- `status` - Enum (quotation_pending, quoted, approved, rejected)
- `quoted_price` - Decimal (nullable)
- `notes` - Text (nullable)
- `timestamps`

## Web Scraping Implementation

The current implementation uses simulated data. To implement actual web scraping:

### Option 1: Guzzle + DOMDocument
```bash
composer require guzzlehttp/guzzle
```

```php
use GuzzleHttp\Client;
use DOMDocument;
use DOMXPath;

private function scrapeProductData($url)
{
    $client = new Client();
    $response = $client->get($url);
    $html = $response->getBody()->getContents();
    
    $dom = new DOMDocument();
    @$dom->loadHTML($html);
    $xpath = new DOMXPath($dom);
    
    // Extract data using XPath
    $name = $xpath->query('//h1[@class="product-title"]')->item(0)->textContent;
    $price = $xpath->query('//span[@class="price"]')->item(0)->textContent;
    
    return [
        'name' => $name,
        'price' => $price,
        // ... more fields
    ];
}
```

### Option 2: Laravel HTTP Client + Regex
```php
use Illuminate\Support\Facades\Http;

private function scrapeProductData($url)
{
    $response = Http::get($url);
    $html = $response->body();
    
    // Use regex to extract data
    preg_match('/<h1 class="product-title">(.*?)<\/h1>/', $html, $name);
    preg_match('/<span class="price">(.*?)<\/span>/', $html, $price);
    
    return [
        'name' => $name[1] ?? 'N/A',
        'price' => $price[1] ?? 0,
    ];
}
```

### Option 3: Third-party API Service
Use services like:
- ScraperAPI
- Apify
- ParseHub

## Email Notifications (Optional)

To send email notifications, uncomment the Mail lines in the controller and create:

```bash
php artisan make:mail OrderConfirmationMail
php artisan make:mail QuotationRequestMail
```

## Payment Integration

To integrate payment gateways:

### Razorpay
```bash
composer require razorpay/razorpay
```

### Stripe
```bash
composer require stripe/stripe-php
```

## Testing

```bash
# Test API endpoints
php artisan test

# Or use Postman/Insomnia with the provided endpoints
```

## Security Considerations

1. **Rate Limiting**: Add rate limiting to scraping endpoints
2. **Authentication**: Consider adding API authentication (Sanctum/Passport)
3. **Validation**: Always validate and sanitize input
4. **CSRF Protection**: Ensure CSRF tokens are used
5. **SQL Injection**: Use Eloquent ORM (already implemented)

## Production Checklist

- [ ] Configure proper CORS settings
- [ ] Set up email notifications
- [ ] Implement actual web scraping
- [ ] Add payment gateway integration
- [ ] Set up rate limiting
- [ ] Configure error logging
- [ ] Add API authentication
- [ ] Set up database backups
- [ ] Configure queue for scraping tasks
- [ ] Add admin dashboard for order management

## Support

For issues or questions, contact your development team.
