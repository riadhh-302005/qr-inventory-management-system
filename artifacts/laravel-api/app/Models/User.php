<?php

namespace App\Models;

use MongoDB\Laravel\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;

class User extends Authenticatable
{
    use Notifiable;

    protected $connection = 'mongodb';
    protected $collection = 'users';

    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function createApiToken(string $name = 'auth_token'): string
    {
        $plain = Str::random(40);
        ApiToken::create([
            'user_id' => (string) $this->_id,
            'token_hash' => hash('sha256', $plain),
            'name' => $name,
        ]);
        return $plain;
    }

    public function revokeAllApiTokens(): void
    {
        ApiToken::where('user_id', (string) $this->_id)->delete();
    }
}
