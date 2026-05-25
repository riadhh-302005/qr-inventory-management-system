import React, { useState } from "react";
import { Link } from "wouter";
import {
  useListProducts,
  useListCategories,
  useDeleteProduct,
  getListProductsQueryKey,
  getGetDashboardStatsQueryKey,
  getGetLowStockProductsQueryKey,
  getGetRecentProductsQueryKey,
  getListCategoriesQueryKey,
} from "@workspace/api-client-react";

import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Plus,
  Search,
  QrCode,
  Edit,
  Trash2,
  AlertCircle,
  FilterX,
  Package,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductsList() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const queryParams = {
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(category && category !== "all" ? { category } : {}),
  };

  const { data: products, isLoading } = useListProducts(queryParams);
  const { data: categories } = useListCategories();

  const deleteProduct = useDeleteProduct();

  const handleShowQr = (product: any) => {
    setSelectedProduct(product);
    setQrModalOpen(true);
  };

  const confirmDelete = (product: any) => {
    setSelectedProduct(product);
    setDeleteModalOpen(true);
  };

  const handleDelete = () => {
    if (!selectedProduct) return;

    deleteProduct.mutate(
      { id: selectedProduct.id },
      {
        onSuccess: () => {
          toast({
            title: "Product deleted",
            description: `${selectedProduct.name} has been removed from inventory.`,
          });

          setDeleteModalOpen(false);
          setSelectedProduct(null);

          queryClient.invalidateQueries({
            queryKey: getListProductsQueryKey(),
          });

          queryClient.invalidateQueries({
            queryKey: getGetDashboardStatsQueryKey(),
          });

          queryClient.invalidateQueries({
            queryKey: getGetLowStockProductsQueryKey(),
          });

          queryClient.invalidateQueries({
            queryKey: getGetRecentProductsQueryKey(),
          });

          queryClient.invalidateQueries({
            queryKey: getListCategoriesQueryKey(),
          });
        },

        onError: () => {
          toast({
            title: "Error",
            description: "Failed to delete product. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
}).format(value);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            Manage your inventory catalog.
          </p>
        </div>

        <Link href="/products/new">
          <Button className="shadow-sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

          <Input
            placeholder="Search by name, SKU, or category..."
            className="pl-9 bg-background w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="w-full sm:w-[200px] flex items-center gap-2">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>

              {categories?.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(search || category !== "all") && (
            <Button
              variant="ghost"
              size="icon"
              title="Clear filters"
              onClick={() => {
                setSearch("");
                setCategory("all");
              }}
            >
              <FilterX className="h-4 w-4 text-muted-foreground" />
            </Button>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[90px]">Image</TableHead>
                <TableHead className="w-[300px]">Name</TableHead>
                <TableHead>SKU / ID</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-center">QR Code</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-14 w-14 rounded-lg" />
                    </TableCell>

                    <TableCell>
                      <Skeleton className="h-5 w-48" />
                    </TableCell>

                    <TableCell>
                      <Skeleton className="h-5 w-24" />
                    </TableCell>

                    <TableCell>
                      <Skeleton className="h-5 w-20" />
                    </TableCell>

                    <TableCell>
                      <Skeleton className="h-5 w-12 ml-auto" />
                    </TableCell>

                    <TableCell>
                      <Skeleton className="h-5 w-16 ml-auto" />
                    </TableCell>

                    <TableCell>
                      <Skeleton className="h-8 w-8 rounded-md mx-auto" />
                    </TableCell>

                    <TableCell>
                      <Skeleton className="h-8 w-16 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : products && products.length > 0 ? (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-14 h-14 rounded-lg object-cover border"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground border">
                          No Image
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="font-medium">
                      <Link
                        href={`/products/${product.id}/edit`}
                        className="hover:underline text-primary"
                      >
                        {product.name}
                      </Link>
                    </TableCell>

                    <TableCell>
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-mono">
                        {product.productId}
                      </code>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="font-normal text-xs"
                      >
                        {product.category}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {product.quantity <= 5 && (
                          <AlertCircle className="h-4 w-4 text-destructive" />
                        )}

                        <span
                          className={`font-medium ${
                            product.quantity <= 5
                              ? "text-destructive"
                              : ""
                          }`}
                        >
                          {product.quantity}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="text-right font-medium">
                      {formatCurrency(product.price)}
                    </TableCell>

                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                        onClick={() => handleShowQr(product)}
                      >
                        <QrCode className="h-4 w-4" />
                      </Button>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Link href={`/products/${product.id}/edit`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => confirmDelete(product)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Package className="h-10 w-10 mb-3 opacity-20" />

                      <p className="font-medium text-foreground">
                        No products found
                      </p>

                      <p className="text-sm mt-1">
                        {search || category !== "all"
                          ? "Try adjusting your search or filters."
                          : "Get started by adding your first product."}
                      </p>

                      {!search && category === "all" && (
                        <Link href="/products/new">
                          <Button className="mt-4" variant="outline">
                            Add Product
                          </Button>
                        </Link>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* QR Modal */}
      <Dialog open={qrModalOpen} onOpenChange={setQrModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Product QR Code</DialogTitle>

            <DialogDescription>
              Scan this code to quickly access {selectedProduct?.name}.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center py-6">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-border">
              {selectedProduct?.qrCode ? (
                <img
                  src={selectedProduct.qrCode}
                  alt={`QR code for ${selectedProduct?.name}`}
                  className="w-48 h-48 object-contain"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center bg-muted text-muted-foreground">
                  No QR Code available
                </div>
              )}
            </div>

            <div className="mt-6 text-center">
              <h3 className="font-semibold text-lg">
                {selectedProduct?.name}
              </h3>

              <p className="text-sm font-mono text-muted-foreground mt-1 bg-muted px-2 py-1 rounded inline-block">
                {selectedProduct?.productId}
              </p>
            </div>
          </div>

          <DialogFooter className="sm:justify-between">
            <Button
              variant="outline"
              onClick={() => setQrModalOpen(false)}
            >
              Close
            </Button>

            <Button onClick={() => window.print()}>
              Print Label
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Confirm Deletion
            </DialogTitle>

            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">
                {selectedProduct?.name}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>

            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteProduct.isPending}
            >
              {deleteProduct.isPending
                ? "Deleting..."
                : "Delete Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}