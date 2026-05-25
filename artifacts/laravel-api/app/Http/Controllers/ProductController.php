<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use chillerlan\QRCode\QRCode;
use chillerlan\QRCode\QROptions;
use chillerlan\QRCode\Output\QRGdImagePNG;
use chillerlan\QRCode\Output\QRMarkupSVG;

class ProductController extends Controller
{
    private static int $LOW_STOCK_THRESHOLD = 5;

    public function index(Request $request): JsonResponse
    {
        $query = Product::query();

        if ($search = $request->query('search')) {

            $query->where(function ($q) use ($search) {

                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('product_id', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%");

            });
        }

        if ($category = $request->query('category')) {
            $query->where('category', $category);
        }

        $products = $query
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(
            $products->map(
                fn($p) => $p->toApiArray()
            )->values()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([

            'name'      => 'required|string|max:255',

            'productId' => 'nullable|string|max:50',

            'category'  => 'required|string|max:100',

            'quantity'  => 'required|integer|min:0',

            'price'     => 'required|numeric|min:0',

            'image'     => 'nullable|string',
        ]);

        $productId = $validated['productId']
            ?? $this->generateProductId($validated['name']);

        $qrCode = $this->generateQrCode($productId);

        $product = Product::create([

            'name'       => $validated['name'],

            'product_id' => $productId,

            'category'   => $validated['category'],

            'quantity'   => $validated['quantity'],

            'price'      => $validated['price'],

            'qr_code'    => $qrCode,

            'image'      => $validated['image'] ?? '',
        ]);

        return response()->json(
            $product->toApiArray(),
            201
        );
    }

    public function show(string $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        return response()->json(
            $product->toApiArray()
        );
    }

    public function update(
        Request $request,
        string $id
    ): JsonResponse {

        $product = Product::findOrFail($id);

        $validated = $request->validate([

            'name'      => 'sometimes|required|string|max:255',

            'category'  => 'sometimes|required|string|max:100',

            'quantity'  => 'sometimes|required|integer|min:0',

            'price'     => 'sometimes|required|numeric|min:0',

            'image'     => 'nullable|string',
        ]);

        $updateData = [];

        if (array_key_exists('name', $validated)) {
            $updateData['name'] = $validated['name'];
        }

        if (array_key_exists('category', $validated)) {
            $updateData['category'] = $validated['category'];
        }

        if (array_key_exists('quantity', $validated)) {
            $updateData['quantity'] = $validated['quantity'];
        }

        if (array_key_exists('price', $validated)) {
            $updateData['price'] = $validated['price'];
        }

        if (array_key_exists('image', $validated)) {
            $updateData['image'] = $validated['image'];
        }

        $product->update($updateData);

        $product->refresh();

        return response()->json(
            $product->toApiArray()
        );
    }

    public function destroy(string $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        $product->delete();

        return response()->json(null, 204);
    }

    public function byProductId(
        string $productId
    ): JsonResponse {

        $product = Product::where(
            'product_id',
            $productId
        )->firstOrFail();

        return response()->json(
            $product->toApiArray()
        );
    }

    public function categories(): JsonResponse
    {
        $categories = Product::distinct('category')
            ->pluck('category')
            ->filter()
            ->values();

        return response()->json($categories);
    }

    private function generateProductId(
        string $name
    ): string {

        $prefix = strtoupper(
            preg_replace(
                '/[^A-Za-z]/',
                '',
                substr($name, 0, 3)
            )
        );

        if (strlen($prefix) < 2) {
            $prefix = str_pad($prefix, 2, 'X');
        }

        $number = str_pad(
            random_int(1, 999),
            3,
            '0',
            STR_PAD_LEFT
        );

        return "PRD-{$prefix}{$number}";
    }

    private function generateQrCode(
        string $productId
    ): string {

        try {

            $options = new QROptions;

            $options->outputType  = QRGdImagePNG::class;

            $options->imageBase64 = true;

            $options->scale = 5;

            return (new QRCode($options))
                ->render($productId);

        } catch (\Throwable $e) {

            // fallback to SVG
            try {

                $opts = new QROptions;

                $opts->outputType = QRMarkupSVG::class;

                return (new QRCode($opts))
                    ->render($productId);

            } catch (\Throwable) {

                return '';
            }
        }
    }
}