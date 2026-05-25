<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\DashboardController;
use App\Http\Middleware\BearerTokenAuth;
use Illuminate\Support\Facades\Route;

// Auth routes (public)
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);

    Route::middleware(BearerTokenAuth::class)->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me',      [AuthController::class, 'me']);
    });
});

// Protected routes
Route::middleware(BearerTokenAuth::class)->group(function () {
    // Products — specific routes before parameterised ones
    Route::get('/products/categories',                 [ProductController::class, 'categories']);
    Route::get('/products/by-product-id/{productId}', [ProductController::class, 'byProductId']);

    Route::apiResource('products', ProductController::class);

    // Dashboard
    Route::get('/dashboard/stats',     [DashboardController::class, 'stats']);
    Route::get('/dashboard/low-stock', [DashboardController::class, 'lowStock']);
    Route::get('/dashboard/recent',    [DashboardController::class, 'recent']);
});
