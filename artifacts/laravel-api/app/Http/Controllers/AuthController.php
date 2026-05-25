<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:mongodb.users,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        $token = $user->createApiToken('auth_token');

        return response()->json([
            'user'  => $this->userArray($user),
            'token' => $token,
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email'    => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $user->revokeAllApiTokens();
        $token = $user->createApiToken('auth_token');

        return response()->json([
            'user'  => $this->userArray($user),
            'token' => $token,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $user = $request->get('_auth_user') ?? auth()->user();
        if ($user) {
            $user->revokeAllApiTokens();
        }
        return response()->json(['message' => 'Logged out successfully']);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->get('_auth_user') ?? auth()->user();
        return response()->json($this->userArray($user));
    }

    private function userArray(User $user): array
    {
        return [
            'id'    => (string) $user->_id,
            'name'  => $user->name,
            'email' => $user->email,
        ];
    }
}
