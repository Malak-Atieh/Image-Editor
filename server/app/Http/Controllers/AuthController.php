<?php

namespace App\Http\Controllers;

use Validator;

use App\Models\User;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\SignupRequest;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{

    function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'username' => 'nullable|string|max:255|unique:users,username,' . auth()->id(),
            'email' => 'nullable|string|email|max:255|unique:users,email,' . auth()->id(),
        ]);

        $credentials = $request->only('email', 'password');

        $token = Auth::attempt($credentials);
        if (!$token) {
            return response()->json([
                "success" => false,
                "error" => "Unauthorized"
            ], 401);
        }

        $user = Auth::user();

        return response()->json([
            "success" => true,
            "user" => $user,
            'authorization' => [
                    'token' => $token,
                    'type' => 'bearer',
            ]
        ]);
    }

    function register(Request $request){
        
        $validator = Validator::make($request->all(), [
            'full_name' => 'nullable|string|max:255',
            'username' => 'nullable|string|max:255|unique:users,username,' . auth()->id(),
            'email' => 'nullable|string|email|max:255|unique:users,email,' . auth()->id(),
        ]);

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

    
    function editProfile(Request $request){
        $validator = Validator::make($request->all(), [
            'full_name' => 'nullable|string|max:255',
            'username' => 'nullable|string|max:255|unique:users,username,' . auth()->id(),
            'email' => 'nullable|string|email|max:255|unique:users,email,' . auth()->id(),
        ]);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
    
        $user = auth()->user();
        $user->update($request->only(['full_name', 'username', 'email']));

        return response()->json([
            "success" => true,
            "user" => $user
        ]);
    }

    public function refresh()
    {
        return response()->json([
            'status' => 'success',
            'user' => Auth::user(),
            'authorization' => [
                'token' => Auth::refresh(),
                'type' => 'bearer',
            ]
        ]);
    }
}