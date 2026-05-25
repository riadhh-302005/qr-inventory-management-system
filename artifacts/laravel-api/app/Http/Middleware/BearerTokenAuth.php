<?php

namespace App\Http\Middleware;

use App\Models\ApiToken;
use App\Models\User;
use Closure;
use Illuminate\Http\Request;

class BearerTokenAuth
{
    public function handle(Request $request, Closure $next)
    {
        $bearer = $request->bearerToken();

        if (!$bearer) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $hash = hash('sha256', $bearer);
        $apiToken = ApiToken::where('token_hash', $hash)->first();

        if (!$apiToken) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $user = User::find($apiToken->user_id);

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Touch last_used_at without blocking the request
        $apiToken->timestamps = false;
        $apiToken->last_used_at = now();
        $apiToken->save();

        // Bind the user into the request so controllers can access it
        $request->merge(['_auth_user' => $user]);
        auth()->setUser($user);

        return $next($request);
    }
}
