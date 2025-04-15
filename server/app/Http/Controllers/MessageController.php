<?php

namespace App\Http\Controllers;

use App\Models\Message;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MessageController extends Controller
{
    public function index()
    {
        return Message::with('user')->latest()->take(50)->get();
    }
    public function store(Request $request)
    {
        $message = Auth::user()->messages()->create([
            'content' => $request->content
        ]);

        broadcast(new NewMessage($message->load('user')))->toOthers();

        return response()->json($message, 201);
    }

}
