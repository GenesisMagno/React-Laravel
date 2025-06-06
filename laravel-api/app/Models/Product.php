<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Product extends Model
{
    use HasFactory;

    // You can optionally define $fillable or $guarded fields here
    // protected $fillable = ['name', 'price', 'description'];
    protected $fillable = [
        'product_name',
        'product_image',
        'product_big',
        'product_medium',
        'product_platter',
        'product_tub'
    ];
}
