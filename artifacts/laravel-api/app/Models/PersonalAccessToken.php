<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;
use Laravel\Sanctum\Contracts\HasAbilities;

class PersonalAccessToken extends Model implements HasAbilities
{
    protected $connection = 'mongodb';
    protected $collection = 'personal_access_tokens';

    protected $fillable = [
        'tokenable_type',
        'tokenable_id',
        'name',
        'token',
        'abilities',
        'last_used_at',
        'expires_at',
    ];

    protected $hidden = ['token'];

    protected $casts = [
        'abilities' => 'array',
        'last_used_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function tokenable()
    {
        return $this->morphTo('tokenable');
    }

    public static function findToken($token)
    {
        if (!str_contains($token, '|')) {
            return static::where('token', hash('sha256', $token))->first();
        }

        [$id, $plainToken] = explode('|', $token, 2);

        $instance = static::find($id);
        if ($instance && hash_equals($instance->token, hash('sha256', $plainToken))) {
            return $instance;
        }

        return null;
    }

    public function can($ability)
    {
        $abilities = $this->abilities ?? ['*'];
        return in_array('*', $abilities) || in_array($ability, $abilities);
    }

    public function cant($ability)
    {
        return !$this->can($ability);
    }
}
