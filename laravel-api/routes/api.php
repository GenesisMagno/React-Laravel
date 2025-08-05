<?php
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\OrderController;


Route::middleware('guest')->group(function(){
    // REGISTER
    Route::post('/register', [AuthController::class , 'register']);
    // LOGIN
    Route::post('/login', [AuthController::class , 'login']);
});

// PROTECTED ROUTES (JWT Required)
Route::middleware('jwt.cookie')->group(function () {
    // Auth routes
    Route::get('/user', [AuthController::class , 'user']);
    Route::post('/logout', [AuthController::class , 'logout']);
    
    // User accessible routes
    Route::prefix('cart')->controller(CartController::class)->group(function () {
        Route::get('/', 'show');
        Route::post('/add', 'add');
        Route::post('/update-quantity', 'updateQuantity');
        Route::post('/update-selection/{cartItem}', 'updateSelection');
        Route::post('/selecteditems', 'selectedItems');
        Route::post('/remove', 'remove');
    });
    
    Route::post('/orders/place-from-cart', [OrderController::class, 'placeOrderFromCart']);
    Route::post('/orders/quick-order', [OrderController::class, 'quickOrder']);
    Route::get('/orders', [OrderController::class, 'getUserOrders']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::post('/orders/{id}/cancel', [OrderController::class, 'cancelOrder']);
    
    // Product viewing (authenticated users can view products)
    Route::apiResource('products', ProductController::class)->only(['index','show']);

    // User Profile
    Route::apiResource('users', UserController::class)->only([
    'show', 'update', 'destroy'
    ]);
    // ADMIN ONLY ROUTES
    Route::middleware('admin')->group(function () {
        // Product management (admin only)
        Route::apiResource('products', ProductController::class)->only(['store','update','destroy']);
        Route::delete('products/{product}/ingredients/{ingredient}', [ProductController::class, 'destroyIngredient']);
        
        // User management (admin only)
        Route::apiResource('users', UserController::class)->only([
        'index'
        ]);
        
        // Order status management (admin only)
        Route::patch('/orders/{id}/status', [OrderController::class, 'updateStatus']);
    });
});