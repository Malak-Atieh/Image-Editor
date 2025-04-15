<?php

namespace App\Http\Controllers;

use Validator;

use App\Models\User;
use App\Models\Log;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{

    function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email|max:255',
            'password' => 'required|string|min:8',
        ]);

        if ($validator->fails()) {
            return response()->json([
                "success" => false,
                "errors" => $validator->errors()
            ], 422);
        }

        $credentials = $request->only('email', 'password');

        if (!$token= JWTAuth::attempt($credentials)) {
            return response()->json([
                "success" => false,
                "error" => "Unauthorized"
            ], 401);
        }

        $user=Auth::user();

        /*$ip= $request->ip();
        
        $geo=Http::get("http://ip-api.com/json/{$ip}")->json();

        $logs = Log::create([
            'user_id' => $user->id,
            'ip' => $ip,
            'country' => $geo['country'] ?? null,
            'city' => $geo['city'] ?? null,
            'lat' => $geo['lat'] ?? null,
            'lon' => $geo['lon'] ?? null,
        ]);
        */
        return response()->json([
            "success" => true,
            "authorization" => [
                'token' => $token,
                'type' => 'bearer',
                'expires_in' => auth()->factory()->getTTL() * 60, // Seconds
            ],
            'user' => [
                'id' => $user->id,
                'name' => $user->name
            ],
            'ws_url' => 'ws://localhost:3001' 
        ]);
    }

    function register(Request $request){

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                "success" => false,
                "errors" => $validator->errors()
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);
        
        $token = Auth::login($user);

        return response()->json([
            "success" => true,
            "user" => $user,
            'authorization' => [
                'token' => $token,
                'type' => 'bearer',
            ]
        ], 201);
    }

    
}