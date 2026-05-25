import React from "react";
import { Link } from "wouter";
import { useGetDashboardStats, useGetLowStockProducts, useGetRecentProducts } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, Package, DollarSign, ListTree, ArrowRight, TrendingDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading, error: statsError } = useGetDashboardStats();
  const { data: lowStock, isLoading: lowStockLoading } = useGetLowStockProducts();
  const { data: recent, isLoading: recentLoading } = useGetRecentProducts();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
}).format(value);
  };

  if (statsError) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to load dashboard data. Please try again later.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your inventory and alerts.</p>
        </div>
        <Link href="/products/new">
          <Button>Add New Product</Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats?.totalProducts || 0}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Items in catalog</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold">{formatCurrency(stats?.totalValue || 0)}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Based on current stock</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertCircle className={`h-4 w-4 ${stats?.lowStockCount ? 'text-destructive' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className={`text-2xl font-bold ${stats?.lowStockCount ? 'text-destructive' : ''}`}>
                {stats?.lowStockCount || 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Items at or below 5 units</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <ListTree className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats?.categoryCount || 0}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Active product groups</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        
        {/* Low Stock Alerts */}
        <Card className="lg:col-span-4 shadow-sm border-destructive/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-destructive" />
                Needs Attention
              </CardTitle>
              <CardDescription>Products running critically low on stock.</CardDescription>
            </div>
            <Link href="/products">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {lowStockLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : lowStock && lowStock.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStock.slice(0, 5).map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        <Link href={`/products/${product.id}/edit`} className="hover:underline text-primary">
                          {product.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">{product.productId}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="destructive" className="font-bold">
                          {product.quantity}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-3">
                  <Package className="h-6 w-6 text-green-600 dark:text-green-500" />
                </div>
                <h3 className="font-medium text-lg">Stock Levels Good</h3>
                <p className="text-sm text-muted-foreground max-w-sm mt-1">
                  You have no items running critically low. Everything is well stocked.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className="lg:col-span-3 shadow-sm">
          <CardHeader>
            <CardTitle>Category Value</CardTitle>
            <CardDescription>Inventory value distributed by category.</CardDescription>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : stats?.categoryBreakdown && stats.categoryBreakdown.length > 0 ? (
              <div className="space-y-4">
                {stats.categoryBreakdown.map((cat, index) => {
                  const percentage = stats.totalValue > 0 
                    ? (cat.totalValue / stats.totalValue) * 100 
                    : 0;
                  
                  return (
                    <div key={cat.category} className="flex flex-col gap-1">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium">{cat.category} <span className="text-muted-foreground font-normal text-xs ml-1">({cat.count})</span></span>
                        <span className="font-semibold">{formatCurrency(cat.totalValue)}</span>
                      </div>
                      <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-primary h-full rounded-full" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground text-sm">
                No category data available.
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Recent Additions */}
        <Card className="lg:col-span-7 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Additions</CardTitle>
              <CardDescription>Latest products added to inventory.</CardDescription>
            </div>
            <Link href="/products">
              <Button variant="ghost" size="sm" className="gap-1">
                View Catalog <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : recent && recent.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Added</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recent.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">
                          <Link href={`/products/${product.id}/edit`} className="hover:underline text-primary">
                            {product.name}
                          </Link>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">{product.productId}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{product.category}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(product.price)}</TableCell>
                        <TableCell className="text-right text-muted-foreground text-sm">
                          {new Date(product.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-4">
                  You haven't added any products yet.
                </p>
                <Link href="/products/new">
                  <Button>Create Your First Product</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
