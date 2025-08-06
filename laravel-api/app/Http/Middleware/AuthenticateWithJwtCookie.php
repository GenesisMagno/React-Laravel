<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;
use Tymon\JWTAuth\Exceptions\TokenInvalidException;

class AuthenticateWithJwtCookie
{
    public function handle(Request $request, Closure $next)
    {
        // Debug: Log all cookies
        Log::info('All cookies:', $request->cookies->all());
        
        // Try multiple ways to get the token
        $token = $request->cookie('jwt_token') 
                ?? $request->header('Authorization') 
                ?? $request->bearerToken()
                ?? $request->input('jwt_token');

        // If Authorization header exists, extract the token
        if ($request->header('Authorization')) {
            $authHeader = $request->header('Authorization');
            Log::info('Authorization header:', ['header' => $authHeader]);
            
            if (strpos($authHeader, 'Bearer ') === 0) {
                $token = substr($authHeader, 7);
            }
        }

        Log::info('Token extracted:', ['token' => $token ? substr($token, 0, 20) . '...' : 'null']);

        if (!$token) {
            Log::error('No token found in request');
            return response()->json([
                'error' => 'Token not provided',
                'debug' => [
                    'cookies' => array_keys($request->cookies->all()),
                    'headers' => $request->headers->keys(),
                ]
            ], 401);
        }

        try {
            // Validate and decode the token
            $payload = JWTAuth::setToken($token)->getPayload();
            Log::info('Token payload:', $payload->toArray());
            
            // Set the token and authenticate the user
            $user = JWTAuth::setToken($token)->authenticate();
            
            if (!$user) {
                Log::error('User not found for token');
                return response()->json(['error' => 'User not found'], 401);
            }

            Log::info('User authenticated:', ['user_id' => $user->id, 'email' => $user->email]);

            // Set the user for the API guard
            Auth::guard('api')->setUser($user);

        } catch (TokenExpiredException $e) {
            Log::error('Token expired:', ['message' => $e->getMessage()]);
            return response()->json(['error' => 'Token has expired'], 401);
        } catch (TokenInvalidException $e) {
            Log::error('Token invalid:', ['message' => $e->getMessage()]);
            return response()->json(['error' => 'Token is invalid'], 401);
        } catch (JWTException $e) {
            Log::error('JWT Exception:', ['message' => $e->getMessage()]);
            return response()->json(['error' => 'Token error: ' . $e->getMessage()], 401);
        } catch (\Exception $e) {
            Log::error('General exception in JWT middleware:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            return response()->json(['error' => 'Authentication failed: ' . $e->getMessage()], 401);
        }

        return $next($request);
    }
}