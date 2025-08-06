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

// Add this to routes/api.php or routes/web.php
Route::get('/test-login/{email}/{password}', function($email, $password) {
    // URL decode the parameters (in case of encoding issues)
    $email = urldecode($email);
    $password = urldecode($password);
    
    $response = [
        'step1_data_received' => [
            'email' => $email,
            'password' => $password,
            'email_length' => strlen($email),
            'password_length' => strlen($password)
        ]
    ];
    
    // Step 2: Check if user exists  
    $user = User::where('email', $email)->first();
    $response['step2_user_lookup'] = $user ? 'found' : 'not_found';
    
    if ($user) {
        $response['user_data'] = [
            'id' => $user->id,
            'email' => $user->email,
            'password_hash_length' => strlen($user->password)
        ];
        
        // Step 3: Test password
        $passwordWorks = Hash::check($password, $user->password);
        $response['step3_password_check'] = $passwordWorks ? 'PASS' : 'FAIL';
    } else {
        $response['available_users'] = User::select('email')->get()->toArray();
    }
    
    return response()->json($response);
});
Route::middleware('guest')->group(function(){
    // REGISTER
    Route::post('/register', [AuthController::class , 'register']);
    // LOGIN
    Route::post('/login', [AuthController::class , 'login']);
});
 Route::apiResource('products', ProductController::class)->only(['index','show']);
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