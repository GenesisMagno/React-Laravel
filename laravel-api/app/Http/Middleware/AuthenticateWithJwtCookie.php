<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;
use Tymon\JWTAuth\Exceptions\TokenInvalidException;

class AuthenticateWithJwtCookie
{
    public function handle(Request $request, Closure $next)
    {
        $token = $request->cookie('jwt_token'); // get JWT from cookie

        if (!$token) {
            return response()->json(['error' => 'Token not provided'], 401);
        }

        try {
            // Set the token and authenticate the user
            $user = JWTAuth::setToken($token)->authenticate();
            
            if (!$user) {
                return response()->json(['error' => 'User not found'], 401);
            }

            // 🔥 THIS IS THE KEY FIX - Set the user for the API guard
            Auth::guard('api')->setUser($user);

        } catch (TokenExpiredException $e) {
            return response()->json(['error' => 'Token has expired'], 401);
        } catch (TokenInvalidException $e) {
            return response()->json(['error' => 'Token is invalid'], 401);
        } catch (JWTException $e) {
            return response()->json(['error' => 'Token error: ' . $e->getMessage()], 401);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Authentication failed'], 401);
        }

        return $next($request);
    }
}