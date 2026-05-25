<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    private static int $LOW_STOCK_THRESHOLD = 5;

    public function stats(): JsonResponse
    {
        $products   = Product::all();
        $total      = $products->count();
        $totalValue = $products->sum(fn($p) => (float) $p->price * (int) $p->quantity);
        $lowStock   = $products->filter(fn($p) => (int) $p->quantity <= self::$LOW_STOCK_THRESHOLD)->count();

        $byCategory = $products->groupBy('category')
            ->map(fn($group, $cat) => ['category' => $cat, 'count' => $group->count()])
            ->values();

        return response()->json([
            'totalProducts' => $total,
            'totalValue'    => round($totalValue, 2),
            'lowStockCount' => $lowStock,
            'byCategory'    => $byCategory,
        ]);
    }

    public function lowStock(): JsonResponse
    {
        $products = Product::where('quantity', '<=', self::$LOW_STOCK_THRESHOLD)
            ->orderBy('quantity', 'asc')
            ->get();

        return response()->json($products->map(fn($p) => $p->toApiArray())->values());
    }

    public function recent(): JsonResponse
    {
        $products = Product::orderBy('created_at', 'desc')->limit(10)->get();
        return response()->json($products->map(fn($p) => $p->toApiArray())->values());
    }
}
