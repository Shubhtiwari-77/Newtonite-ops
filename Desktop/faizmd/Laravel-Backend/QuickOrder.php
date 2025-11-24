<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QuickOrder extends Model
{
    use HasFactory;

    protected $table = 'quick_orders';

    protected $fillable = [
        'order_id',
        'product_data',
        'cost_breakdown',
        'customer_name',
        'customer_email',
        'customer_phone',
        'customer_city',
        'customer_address',
        'status',
        'payment_status',
        'payment_method',
        'transaction_id'
    ];

    protected $casts = [
        'product_data' => 'array',
        'cost_breakdown' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    public function getProductNameAttribute()
    {
        $productData = json_decode($this->product_data, true);
        return $productData['name'] ?? 'N/A';
    }

    public function getFinalCostAttribute()
    {
        $costBreakdown = json_decode($this->cost_breakdown, true);
        return $costBreakdown['finalCost'] ?? 0;
    }
}
