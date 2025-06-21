<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;

class ProductSeeder extends Seeder
{
    public function run()
    {
        $products = [
            ['name' => 'Mango Sticky Rice', 'big'=>'1400', 'medium'=>'850', 'platter'=>'530',  'tub' => '240'],
            ['name' => 'Veggies Macaroni Salad', 'big'=>'1400', 'medium'=>'850', 'platter'=>'430',  'tub' => '240'],
            ['name' => 'Mango Grahams', 'tub' => '200'],
            ['name' => 'Mango Jelly', 'tub' => '115'],
            ['name' => 'Puto Flan', 'tub' => '170'],
            ['name' => 'Yema Cake', 'tub' => '150'],
            ['name' => 'Hardinera', 'tub' => '280'],
            ['name' => 'Banana Cake Loaf', 'tub' => '200'],
            ['name' => 'Espasol', 'tub' => '150'],
            
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}
