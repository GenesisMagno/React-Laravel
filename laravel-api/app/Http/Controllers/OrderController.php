<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Cart;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    // Place order using the current cart
    public function placeOrderFromCart(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'phone' => 'required|string',
            'street_address' => 'required|string',
            'city' => 'required|string',
            'zip_code' => 'required|string',
            'delivery_date' => 'required|date|after:today',
            'payment_method' => 'required|in:cash,gcash',
            'instructions' => 'nullable|string|max:500',
        ]);

        $user = $request->user();
        $cart = Cart::where('user_id', $user->id)->with('items')->first();

        if (!$cart || $cart->items->isEmpty()) {
            return response()->json(['message' => 'Cart is empty'], 400);
        }

        // Calculate total based on cart items
        $total = $cart->items->sum(function ($item) {
            return $item->product_price * $item->quantity;
        });

        DB::beginTransaction();
        
        try {
            $order = Order::create([
                'user_id' => $user->id,
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'street_address' => $validated['street_address'],
                'city' => $validated['city'],
                'zip_code' => $validated['zip_code'],
                'delivery_date' => $validated['delivery_date'],
                'total' => $total,
                'payment_method' => $validated['payment_method'],
                'instructions' => $validated['instructions'],
                'status' => 'pending',
            ]);

            foreach ($cart->items as $item) {
                $product = Product::find($item->product_id);
                
                OrderItem::create([
                    'order_id' => $order->id,
                    'cart_id' => $cart->id,
                    'product_id' => $item->product_id,
                    'product_image' => $item->product_image,
                    'product_name' => $product ? $product->name : 'Unknown Product',
                    'price_at_purchase' => $item->product_price,
                    'size' => $item->size,
                    'quantity' => $item->quantity,
                    'total_price' => $item->product_price * $item->quantity,
                ]);
            }

            // Clear cart
            $cart->items()->delete();

            DB::commit();

            return response()->json([
                'message' => 'Order placed from cart successfully',
                'order' => $order->load('items')
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json(['message' => 'Failed to place order'], 500);
        }
    }

    // Instant order from a single product (bypass cart)
    public function quickOrder(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'size' => 'required|in:big,medium,platter,tub',
            'quantity' => 'required|integer|min:1',
            'product_image' => 'required|string',
            'product_name' => 'required|string',
            'product_price' => 'required|numeric|min:0',
            'email' => 'required|email',
            'phone' => 'required|string',
            'street_address' => 'required|string',
            'city' => 'required|string',
            'zip_code' => 'required|string',
            'delivery_date' => 'required|date|after:today',
            'payment_method' => 'required|in:cash,gcash',
            'instructions' => 'nullable|string|max:500',
        ]);

        $user = $request->user();
        $total = $validated['product_price'] * $validated['quantity'];

        DB::beginTransaction();

        try {
            $order = Order::create([
                'user_id' => $user->id,
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'street_address' => $validated['street_address'],
                'city' => $validated['city'],
                'zip_code' => $validated['zip_code'],
                'delivery_date' => $validated['delivery_date'],
                'total' => $total,
                'payment_method' => $validated['payment_method'],
                'instructions' => $validated['instructions'],
                'status' => 'pending',
            ]);

            OrderItem::create([
                'order_id' => $order->id,
                'cart_id' => null, // No cart for quick orders
                'product_id' => $validated['product_id'],
                'product_image' => $validated['product_image'],
                'product_name' => $validated['product_name'],
                'price_at_purchase' => $validated['product_price'],
                'size' => $validated['size'],
                'quantity' => $validated['quantity'],
                'total_price' => $total,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Quick order placed successfully',
                'order' => $order->load('items')
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json(['message' => 'Failed to place order'], 500);
        }
    }

    // Get user orders
    public function getUserOrders(Request $request)
    {
        $user = $request->user();
        
        $orders = Order::where('user_id', $user->id)
                      ->with('items.product')
                      ->orderBy('created_at', 'desc')
                      ->paginate(10);

        return response()->json([
            'orders' => $orders
        ]);
    }

    // Get specific order details
    public function show(Request $request, $id)
    {
        $user = $request->user();
        
        $order = Order::where('user_id', $user->id)
                     ->where('id', $id)
                     ->with('items.product')
                     ->first();

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        return response()->json([
            'order' => $order
        ]);
    }

    // Update order status (admin only)
    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,confirmed,preparing,out_for_delivery,delivered,cancelled'
        ]);

        $order = Order::findOrFail($id);
        $order->update(['status' => $validated['status']]);

        return response()->json([
            'message' => 'Order status updated successfully',
            'order' => $order
        ]);
    }

    // Cancel order (if status is still pending)
    public function cancelOrder(Request $request, $id)
    { 
        $user = $request->user();
        
        $order = Order::where('user_id', $user->id)
                     ->where('id', $id)
                     ->first();

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        if ($order->status !== 'pending') {
            return response()->json(['message' => 'Cannot cancel order. Order is already being processed.'], 400);
        }

        $order->update(['status' => 'cancelled']);

        return response()->json([
            'message' => 'Order cancelled successfully',
            'order' => $order
        ]);
    }
}