<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;


class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $products= Product::all();

        return response()->json(['products'=>$products]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'big' => 'nullable|numeric',
            'medium' => 'nullable|numeric',
            'platter' => 'nullable|numeric',
            'tub' => 'nullable|numeric',
        ]);

        // Temporarily remove image from validation data
        $image = $request->file('image');
        unset($validated['image']);

        // Create the product first (without image)
        $product = Product::create($validated);

        // Handle the image upload (now that we have $product->id)
        if ($image) {
            $originalName = pathinfo($image->getClientOriginalName(), PATHINFO_FILENAME);
            $safeName = substr(preg_replace('/[^a-zA-Z0-9]/', '', $originalName), 0, 20);
            $newFilename = 'product_' . $product->id . '_' . $safeName . '_' . time() . '.' . 
            $image->getClientOriginalExtension();

            $storedPath = $image->storeAs(
                'productImages',
                $newFilename,
                'public'
            );

            // Optionally: delete old image if needed (not typical in store)
            // Product::destroyImage($product->image);

            // Update the product with image path
            $product->update(['image' => $storedPath]);
        }

    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $product=Product::findOrFail($id);
        return response()->json(['product'=>$product]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Product $product, Request $request )
    {
    
        $validated =  $request->validate ([
        'name' => 'required',
        'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        'big' => 'nullable|numeric',
        'medium' => 'nullable|numeric',
        'platter' => 'nullable|numeric',
        'tub' => 'nullable|numeric',
    ]);

    // Handle image separately
    if ($request->hasFile('image')) {
        // Generate a unique name with original extension but preserve part of original filename
        $originalName = pathinfo($request->file('image')->getClientOriginalName(), PATHINFO_FILENAME);
        // Limit to 20 chars and remove special chars
        $safeName = substr(preg_replace('/[^a-zA-Z0-9]/', '', $originalName), 0, 20);
        // Create a unique filename with timestamp
        $newFilename = 'product_' . $product->id . '_' . $safeName . '_' . time() . '.' . 
                      $request->file('image')->getClientOriginalExtension();
        
        // Delete old image if it exists
        if ($product->image) {
            Product::destroyImage($product->image);
        }
        
        // Store with custom filename
        $validated['image'] = $request->file('image')->storeAs(
            'productImages', 
            $newFilename,
            'public'
        );
        
    } else {
        // Remove image from validation array if no new image uploaded
        unset($validated['image']);
    }

    $product->update($validated);

    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        Product::destroyImage($product->image);
        $product->delete();

       

    }
}
