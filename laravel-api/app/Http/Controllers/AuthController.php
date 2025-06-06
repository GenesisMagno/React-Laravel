<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request){
        $validated= Validator::make($request->all(),[
            'email'=>'required|email|unique:users',
            'password'=>'required|min:6|confirmed',
        ]);

        if($validated->fails()){
            return response()->json(['error'=>$validated->errors()],422);
        };
        
        User::create([
            'email' => $request->input('email'),
            'password' => bcrypt($request->input('password')),
        ]);
        
        return response()->json($validated->validate());
    }

    public function login(Request $request)
{
    $credentials = $request->only('email', 'password');

    // Validate credentials first
    $validator = Validator::make($credentials, [
        'email' => 'required|email',
        'password' => 'required'
    ]);

    if ($validator->fails()) {
        return response()->json([
            'errors' => $validator->errors()
        ], 422);
    }

    $user = User::where('email', $credentials['email'])->first();

    if (!$user || !Hash::check($credentials['password'], $user->password)) {
        return response()->json([
            'message' => 'Invalid credentials'
        ], 401);
    }

    try {
        $customClaims = ['user_id' => $user->id];
        $token = JWTAuth::customClaims($customClaims)->fromUser($user);

        return response()->json([
            'message' => 'Logged in successfully',
            'user' => $user
        ])->cookie(
            'jwt_token',
            $token,
            1440,
            '/',
            null,
            true,
            true,
            false,
            'Strict'
        );

    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Could not create token'
        ], 500);
    }
}


    public function user(Request $request) {
        // Get the authenticated user from the API guard
        $user = Auth::guard('api')->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        return response()->json($user);
    }

    public function logout(Request $request) {
        try {
            // Get token from cookie since that's how we're storing it
            $token = $request->cookie('jwt_token');
            
            if (!$token) {
                return response()->json(['error' => 'Token not provided'], 400);
            }

            // Set the token before invalidating
            JWTAuth::setToken($token)->invalidate();

            // Clear the cookie
            return response()->json(['message' => 'Logged out successfully'])
                ->cookie('jwt_token', '', -1, '/', null, true, true, false, 'Strict');

        } catch (\Tymon\JWTAuth\Exceptions\JWTException $e) {
            return response()->json(['error' => 'Failed to logout, token may be invalid'], 500);
        }
    }

    // Optional: Add a refresh token method
    public function refresh(Request $request) {
    try {
        $token = $request->cookie('jwt_token');
        
        if (!$token) {
            return response()->json(['error' => 'Token not provided'], 401);
        }

        // Set the token and refresh it
        $newToken = JWTAuth::setToken($token)->refresh();

        return response()->json([
            'message' => 'Token refreshed successfully'
        ])->cookie(
            'jwt_token',
            $newToken,
            config('jwt.refresh_ttl'), // Use config value
            '/',
            null,
            request()->secure(), // Use HTTPS in production
            true, // HTTP only
            false,
            'Strict'
        );

    } catch (\Tymon\JWTAuth\Exceptions\TokenExpiredException $e) {
        return response()->json(['error' => 'Token has expired and cannot be refreshed'], 401);
    } catch (\Tymon\JWTAuth\Exceptions\TokenInvalidException $e) {
        return response()->json(['error' => 'Token is invalid'], 401);
    } catch (\Tymon\JWTAuth\Exceptions\JWTException $e) {
        return response()->json(['error' => 'Could not refresh token'], 401);
    }
}
}