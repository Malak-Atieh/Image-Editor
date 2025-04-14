<?php

namespace App\Http\Controllers;

use App\Models\Message;

use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function index()
    {
        $messages = Message::with('user:id,name')->latest()->take(100)->get()->reverse()->values();
        return response()->json($messages);
    }

}
