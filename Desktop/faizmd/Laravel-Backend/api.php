<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\QuickOrderController;

/*
|--------------------------------------------------------------------------
| Quick Order API Routes
|--------------------------------------------------------------------------
|
| Add these routes to your routes/api.php file
|
*/

Route::prefix('quick-order')->group(function () {
    Route::post('/scrape-product', [QuickOrderController::class, 'scrapeProduct']);
    Route::post('/create-order', [QuickOrderController::class, 'createOrder']);
    Route::post('/create-quotation', [QuickOrderController::class, 'createQuotation']);
    Route::get('/orders', [QuickOrderController::class, 'getOrders']);
});
