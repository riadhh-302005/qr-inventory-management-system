<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Product extends Model
{
    protected $connection = 'mongodb';

    protected $collection = 'products';

    protected $fillable = [
        'name',
        'product_id',
        'category',
        'quantity',
        'price',
        'qr_code',
        'image',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'price' => 'float',
    ];

    public function toApiArray(): array
    {
        return [
            'id'        => (string) $this->_id,
            'name'      => $this->name,
            'productId' => $this->product_id,
            'category'  => $this->category,
            'quantity'  => (int) $this->quantity,
            'price'     => (float) $this->price,
            'qrCode'    => $this->qr_code,
            'image'     => $this->image,
            'createdAt' => $this->created_at?->toIso8601String(),
            'updatedAt' => $this->updated_at?->toIso8601String(),
        ];
    }
}