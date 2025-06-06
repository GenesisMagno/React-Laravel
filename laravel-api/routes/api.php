<?php
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;

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
    Route::resource('products', ProductController::class);
});