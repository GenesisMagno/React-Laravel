<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductIngredient extends Model
{
    protected $fillable = ['product_id','ingredient_name','ingredient_image','ingredient_description'];

    

    public function product() {
        return $this->belongsTo(Product::class);
    }

}
