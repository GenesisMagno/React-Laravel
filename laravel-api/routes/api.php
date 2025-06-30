<?php
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CartController;

Route::middleware('guest')->group(function(){
    // REGISTER
    Route::post('/register', [AuthController::class , 'register']);
    // LOGIN
    Route::post('/login', [AuthController::class , 'login']);
});

// PROTECTED ROUTES
Route::middleware('jwt.cookie')->group(function () {
    Route::get('/user', [AuthController::class , 'user']);
    Route::post('/logout', [AuthController::class , 'logout']);
    Route::post('/refresh', [AuthController::class , 'refresh']); // Add refresh route
    Route::apiResource('products', ProductController::class);
    Route::apiResource('users', UserController::class);

    Route::get('/cart', [CartController::class, 'show']);
    Route::post('/cart/add', [CartController::class, 'add']);
    Route::post('/cart/remove', [CartController::class, 'remove']);
    Route::post('/cart/update-quantity', [CartController::class, 'updateQuantity']);
    Route::delete('products/{product}/ingredients/{ingredient}', [ProductController::class, 'destroyIngredient']);

});