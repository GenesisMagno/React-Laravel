<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use App\Models\ProductIngredient;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $perPage = $request->get('per_page'); // default is 2 per page
        $query = Product::query();

        if ($request->has('q')) {
            $search = $request->get('q');

            // Example: search by name or email
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        $products = $query->paginate($perPage);

        return response()->json([
            'data' => $products->items(),
            'current_page' => $products->currentPage(),
            'last_page' => $products->lastPage(),
            'per_page' => $products->perPage(),
            'total' => $products->total(),
            'from' => $products->firstItem(),
            'to' => $products->lastItem(),
            'has_more_pages' => $products->hasMorePages()
        ]);
    }
    
    public function show($id)
    {
        $product = Product::with('ingredients')->findOrFail($id);
        return response()->json(['product' => $product]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'big' => 'nullable|numeric',
            'medium' => 'nullable|numeric',
            'platter' => 'nullable|numeric',
            'tub' => 'nullable|numeric',
            
            // Validate ingredients array
            'ingredients' => 'nullable|array',
            'ingredients.*.name' => 'required_with:ingredients|string|max:255',
            'ingredients.*.description' => 'nullable|string',
            'ingredients.*.image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        // Use database transaction to ensure data consistency
        DB::beginTransaction();

        try {
            // Extract files and ingredients from request
            $image = $request->file('image');
            $ingredientsData = $validated['ingredients'] ?? [];
            
            // Remove non-product fields from validation data for product creation
            $productData = collect($validated)->except(['image', 'ingredients'])->toArray();

            // Create the product first (without image)
            $product = Product::create($productData);

            // Handle the main product image upload
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

                // Update the product with image path
                $product->update(['image' => $storedPath]);
            }

            // Handle ingredients
            if (!empty($ingredientsData)) {
                
                foreach ($ingredientsData as $index => $ingredientData) {                    
                    // Skip empty ingredient entries - check if name exists and is not empty
                    if (!isset($ingredientData['name']) || empty(trim($ingredientData['name']))) {
                        continue;
                    }
                    
                    $ingredientImagePath = null;
                    
                    // Handle ingredient image if present
                    if ($request->hasFile("ingredients.{$index}.image")) {
                        $ingredientImage = $request->file("ingredients.{$index}.image");
                        
                        if ($ingredientImage && $ingredientImage->isValid()) {
                            $originalName = pathinfo($ingredientImage->getClientOriginalName(), PATHINFO_FILENAME);
                            $safeName = substr(preg_replace('/[^a-zA-Z0-9]/', '', $originalName), 0, 20);
                            $ingredientFilename = 'ingredient_' . $product->id . '_' . $index . '_' . $safeName . '_' . time() . '.' . 
                                                $ingredientImage->getClientOriginalExtension();
                            
                            $ingredientImagePath = $ingredientImage->storeAs(
                                'ingredientImages',
                                $ingredientFilename,
                                'public'
                            );
                        }
                    }

                    // Create the ingredient record - ENSURE product_id is set
                    $ingredientRecord = [
                        'product_id' => $product->id, // This is critical - make sure product_id is set
                        'name' => trim($ingredientData['name']),
                        'description' => isset($ingredientData['description']) ? trim($ingredientData['description']) : null,
                        'image' => $ingredientImagePath,
                    ];
                    
                    // Validate that product_id is not null before creating
                    if (empty($ingredientRecord['product_id'])) {
                        throw new \Exception("Product ID is missing for ingredient creation");
                    }
                    
                    $createdIngredient = ProductIngredient::create($ingredientRecord); 
                }
            }

            DB::commit();

            // Load the product with its ingredients for the response
            $product->load('ingredients');

            return response()->json([
                'success' => true,
                'message' => 'Product created successfully',
                'product' => $product
            ], 201);

        } catch (\Exception $e) {
            DB::rollback();
            
            // Clean up any uploaded files if there was an error
            if (isset($storedPath) && Storage::disk('public')->exists($storedPath)) {
                Storage::disk('public')->delete($storedPath);
            }
            
            return response()->json([
                'success' => false,
                'message' => 'Error creating product: ' . $e->getMessage(),
                'debug' => [
                    'line' => $e->getLine(),
                    'file' => $e->getFile()
                ]
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
     public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'big' => 'nullable|numeric',
            'medium' => 'nullable|numeric',
            'platter' => 'nullable|numeric',
            'tub' => 'nullable|numeric',
            'ingredients' => 'nullable|array',
            'ingredients.*.id' => 'nullable|exists:product_ingredients,id',
            'ingredients.*.name' => 'required_with:ingredients|string|max:255',
            'ingredients.*.description' => 'nullable|string',
            'ingredients.*.image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        DB::beginTransaction();

        try {
            $productData = collect($validated)->except(['image', 'ingredients'])->toArray();
            $product->update($productData);

            if ($request->hasFile('image')) {
                if ($product->image) {
                    Product::destroyImage($product->image);
                }

                $image = $request->file('image');
                $safeName = substr(preg_replace('/[^a-zA-Z0-9]/', '', pathinfo($image->getClientOriginalName(), PATHINFO_FILENAME)), 0, 20);
                $filename = 'product_' . $product->id . '_' . $safeName . '_' . time() . '.' . $image->getClientOriginalExtension();
                $storedPath = $image->storeAs('productImages', $filename, 'public');
                $product->update(['image' => $storedPath]);
            }

            $ingredientsData = $validated['ingredients'] ?? [];
            $currentIds = collect($ingredientsData)->pluck('id')->filter()->toArray();

            $product->ingredients()->whereNotIn('id', $currentIds)->each(function ($ingredient) {
                if ($ingredient->image) {
                    Product::destroyImage($ingredient->image);
                }
                $ingredient->delete();
            });

            foreach ($ingredientsData as $index => $data) {
                $ingredientImagePath = null;

                if ($request->hasFile("ingredients.$index.image")) {
                    $ingredientImage = $request->file("ingredients.$index.image");
                    $safeName = substr(preg_replace('/[^a-zA-Z0-9]/', '', pathinfo($ingredientImage->getClientOriginalName(), PATHINFO_FILENAME)), 0, 20);
                    $filename = 'ingredient_' . $product->id . '_' . $index . '_' . $safeName . '_' . time() . '.' . $ingredientImage->getClientOriginalExtension();
                    $ingredientImagePath = $ingredientImage->storeAs('ingredientImages', $filename, 'public');
                }

                if (!empty($data['id'])) {
                    $ingredient = ProductIngredient::find($data['id']);
                    if ($ingredient) {
                        if ($ingredientImagePath && $ingredient->image) {
                            Product::destroyImage($ingredient->image);
                        }

                        $ingredient->update([
                            'name' => trim($data['name']),
                            'description' => $data['description'] ?? null,
                            'image' => $ingredientImagePath ?? $ingredient->image,
                        ]);
                    }
                } else {
                    ProductIngredient::create([
                        'product_id' => $product->id,
                        'name' => trim($data['name']),
                        'description' => $data['description'] ?? null,
                        'image' => $ingredientImagePath,
                    ]);
                }
            }

            DB::commit();
            $product->load('ingredients');

            return response()->json([
                'success' => true,
                'message' => 'Product updated successfully',
                'product' => $product
            ]);

        } catch (\Exception $e) {
            DB::rollback();

            return response()->json([
                'success' => false,
                'message' => 'Update failed: ' . $e->getMessage(),
                'debug' => [
                    'line' => $e->getLine(),
                    'file' => $e->getFile()
                ]
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        // Delete product image
        if ($product->image) {
            Product::destroyImage($product->image);
        }

        // Delete each ingredient and its image
        foreach ($product->ingredients as $ingredient) {
            if ($ingredient->image) {
                Product::destroyImage($ingredient->image);
            }
            $ingredient->delete();
        }

        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Product and its ingredients deleted successfully'
        ]);
    }

    /**
     * Remove a specific ingredient from a product.
     */
    public function destroyIngredient($productId, $ingredientId)
    {
        try {
            // Find the product to ensure it exists and user has access
            $product = Product::findOrFail($productId);
            
            // Find the ingredient that belongs to this product
            $ingredient = ProductIngredient::where('id', $ingredientId)
                                         ->where('product_id', $productId)
                                         ->firstOrFail();

            // Delete the ingredient image if it exists
            if ($ingredient->image) {
                Product::destroyImage($ingredient->image);
            }

            // Delete the ingredient
            $ingredient->delete();

            return response()->json([
                'success' => true,
                'message' => 'Ingredient removed successfully'
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ingredient not found or does not belong to this product'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error removing ingredient: ' . $e->getMessage()
            ], 500);
        }
    }
}