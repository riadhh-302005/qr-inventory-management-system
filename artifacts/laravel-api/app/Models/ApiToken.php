<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class ApiToken extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'api_tokens';

    protected $fillable = [
        'user_id',
        'token_hash',
        'name',
        'last_used_at',
    ];

    protected $hidden = ['token_hash'];

    protected $casts = [
        'last_used_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
