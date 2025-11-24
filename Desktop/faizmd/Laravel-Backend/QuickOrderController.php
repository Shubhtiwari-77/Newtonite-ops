<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Http;
use App\Models\QuickOrder;
use App\Models\Quotation;

class QuickOrderController extends Controller
{
    /**
     * Scrape product data from URL
     * Integrates with your existing web scraper
     */
    public function scrapeProduct(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'url' => 'required|url'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid URL',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $url = $request->url;
            
            // Call your existing web scraper API/service
            // Replace this URL with your actual scraper endpoint
            $scraperUrl = env('SCRAPER_API_URL', 'http://localhost/web-scraper/scrape.php');
            
            $response = Http::timeout(30)->post($scraperUrl, [
                'url' => $url
            ]);
            
            if ($response->failed()) {
                throw new \Exception('Scraper service failed');
            }
            
            $scrapedData = $response->json();
            
            // Parse and format the scraped data
            $productData = $this->formatScrapedData($scrapedData, $url);
            
            return response()->json([
                'success' => true,
                'message' => 'Product data scraped successfully',
                'data' => $productData
            ]);

        } catch (\Exception $e) {
            // Fallback to simulation if scraper fails
            \Log::warning('Scraper failed, using simulated data: ' . $e->getMessage());
            
            $productData = $this->simulateProductScraping($url);
            
            return response()->json([
                'success' => true,
                'message' => 'Product data retrieved (simulated)',
                'data' => $productData
            ]);
        }
    }

    /**
     * Format scraped data from your web scraper
     */
    private function formatScrapedData($scrapedData, $url)
    {
        // Extract weight from text if present
        $weight = null;
        if (isset($scrapedData['weight']) && $scrapedData['weight'] !== 'Weight Not Found') {
            // Extract numeric value from weight string (e.g., "200 Grams" -> 0.2)
            preg_match('/(\d+(?:\.\d+)?)\s*(kg|gram|grams|g|kg)/i', $scrapedData['weight'], $matches);
            if (isset($matches[1])) {
                $weight = floatval($matches[1]);
                // Convert grams to kg
                if (isset($matches[2]) && strtolower($matches[2]) === 'grams' || strtolower($matches[2]) === 'g') {
                    $weight = $weight / 1000;
                }
            }
        }

        // Extract price from text if present
        $price = 0;
        if (isset($scrapedData['price'])) {
            preg_match('/[\d,]+(?:\.\d+)?/', $scrapedData['price'], $priceMatch);
            if (isset($priceMatch[0])) {
                $price = floatval(str_replace(',', '', $priceMatch[0]));
            }
        }

        return [
            'title' => $scrapedData['title'] ?? 'Product',
            'price' => $price,
            'image' => $scrapedData['image'] ?? '',
            'availability' => $scrapedData['availability'] ?? 'Unknown',
            'rating' => $scrapedData['rating'] ?? 'N/A',
            'reviews' => $scrapedData['reviews'] ?? 'N/A',
            'description' => $scrapedData['description'] ?? '',
            'category' => $scrapedData['category'] ?? 'General',
            'weight' => $weight,
            'weight_raw' => $scrapedData['weight'] ?? null,
            'seller' => $scrapedData['seller'] ?? 'Unknown',
            'shipping_to_nepal' => $scrapedData['shipping_to_nepal'] ?? 'Not Eligible',
            'delivery_price' => $scrapedData['delivery_price'] ?? 'Pay on Delivery',
            'delivery_duration' => $scrapedData['delivery_duration'] ?? 'Delivery Time Not Found',
            'delivery_type' => $scrapedData['delivery_type'] ?? 'Standard',
            'minimum_order_quantity' => $scrapedData['minimum_order_quantity'] ?? 1,
            'url' => $url
        ];
    }

    /**
     * Create a new quick order
     */
    public function createOrder(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product.name' => 'required|string',
            'product.price' => 'required|numeric',
            'product.weight' => 'nullable|numeric',
            'costs.finalCost' => 'required|numeric',
            'customer.name' => 'required|string',
            'customer.email' => 'required|email',
            'customer.phone' => 'required|string',
            'customer.address' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $order = QuickOrder::create([
                'order_id' => 'ORD' . time() . strtoupper(substr(md5(uniqid()), 0, 5)),
                'product_data' => json_encode($request->product),
                'cost_breakdown' => json_encode($request->costs),
                'customer_name' => $request->customer['name'],
                'customer_email' => $request->customer['email'],
                'customer_phone' => $request->customer['phone'],
                'customer_city' => $request->customer['city'] ?? null,
                'customer_address' => $request->customer['address'],
                'status' => 'pending',
                'payment_status' => 'pending'
            ]);

            // Send email notification (optional)
            // Mail::to($order->customer_email)->send(new OrderConfirmationMail($order));

            return response()->json([
                'success' => true,
                'message' => 'Order created successfully',
                'data' => [
                    'order_id' => $order->order_id,
                    'order' => $order
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create order: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create a quotation request
     */
    public function createQuotation(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_url' => 'required|url',
            'customer.name' => 'required|string',
            'customer.email' => 'required|email',
            'customer.phone' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $quotation = Quotation::create([
                'quotation_id' => 'QUO' . time() . strtoupper(substr(md5(uniqid()), 0, 5)),
                'product_url' => $request->product_url,
                'customer_name' => $request->customer['name'],
                'customer_email' => $request->customer['email'],
                'customer_phone' => $request->customer['phone'],
                'additional_info' => $request->customer['additional_info'] ?? null,
                'status' => 'quotation_pending'
            ]);

            // Send email notification to admin
            // Mail::to(config('mail.admin_email'))->send(new QuotationRequestMail($quotation));

            return response()->json([
                'success' => true,
                'message' => 'Quotation request submitted successfully',
                'data' => [
                    'quotation_id' => $quotation->quotation_id,
                    'quotation' => $quotation
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create quotation: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all orders and quotations
     */
    public function getOrders(Request $request)
    {
        try {
            $orders = QuickOrder::latest()->limit(20)->get()->map(function($order) {
                return [
                    'order_id' => $order->order_id,
                    'timestamp' => $order->created_at->toISOString(),
                    'status' => $order->status,
                    'product' => json_decode($order->product_data),
                    'costs' => json_decode($order->cost_breakdown),
                    'customer' => [
                        'name' => $order->customer_name,
                        'email' => $order->customer_email,
                        'phone' => $order->customer_phone,
                        'city' => $order->customer_city,
                        'address' => $order->customer_address
                    ]
                ];
            });

            $quotations = Quotation::latest()->limit(20)->get()->map(function($quotation) {
                return [
                    'quotation_id' => $quotation->quotation_id,
                    'timestamp' => $quotation->created_at->toISOString(),
                    'status' => $quotation->status,
                    'productUrl' => $quotation->product_url,
                    'customer' => [
                        'name' => $quotation->customer_name,
                        'email' => $quotation->customer_email,
                        'phone' => $quotation->customer_phone,
                        'additionalInfo' => $quotation->additional_info
                    ]
                ];
            });

            $allRecords = $orders->concat($quotations)->sortByDesc('timestamp')->values();

            return response()->json([
                'success' => true,
                'data' => $allRecords
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch orders: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Simulate product scraping (replace with actual implementation)
     */
    private function simulateProductScraping($url)
    {
        // Extract product name from URL
        $parsed = parse_url($url);
        $path = $parsed['path'] ?? '';
        $segments = array_filter(explode('/', $path));
        $lastSegment = end($segments) ?: 'Product';
        
        $productName = ucwords(str_replace(['-', '_'], ' ', $lastSegment));

        return [
            'url' => $url,
            'name' => substr($productName, 0, 100),
            'price' => rand(500, 10000),
            'weight' => rand(0, 100) < 30 ? null : round(rand(50, 5000) / 100, 2), // 30% null
            'category' => ['Electronics', 'Clothing', 'Home & Kitchen', 'Books', 'Sports'][rand(0, 4)],
            'imageUrl' => '',
            'description' => 'Product description extracted from page',
            'availability' => 'In Stock'
        ];
    }
}
