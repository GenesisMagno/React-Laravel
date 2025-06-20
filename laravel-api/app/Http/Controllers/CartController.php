<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
 use App\Models\Cart;
    use App\Models\CartItem;
    
class CartController extends Controller
{
    public function show(Request $request)
    {
        $cart = Cart::firstOrCreate(['user_id' => $request->user()->id]);
        return response()->json($cart->load('items.product'));
    }

    public function add(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'size'       => 'required|in:big,medium,platter,tub',
            'quantity'   => 'required|integer|min:1',
        ]);

        $cart = Cart::firstOrCreate(['user_id' => $request->user()->id]);

        $item = $cart->items()->where('product_id', $validated['product_id'])->where('size', $validated['size'])->first();

        if ($item) {
            $item->increment('quantity', $validated['quantity']);
        } else {
            $cart->items()->create($validated);
        }

        return response()->json(['message' => 'Added to cart']);
    }

    public function remove(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'size'       => 'required|in:big,medium,platter,tub',
        ]);

        $cart = Cart::where('user_id', $request->user()->id)->first();

        if ($cart) {
            $cart->items()
                ->where('product_id', $validated['product_id'])
                ->where('size', $validated['size'])
                ->delete();
        }

        return response()->json(['message' => 'Removed from cart']);
    }

}
