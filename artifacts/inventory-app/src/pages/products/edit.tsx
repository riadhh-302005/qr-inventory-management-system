import React, { useEffect, useRef } from "react";
import { Link, useRoute } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  useGetProduct,
  useUpdateProduct,
  getGetProductQueryKey,
  getListProductsQueryKey,
  getGetDashboardStatsQueryKey,
  getGetLowStockProductsQueryKey,
} from "@workspace/api-client-react";

import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  ArrowLeft,
  Save,
  Loader2,
  QrCode,
  AlertCircle,
  Printer,
} from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const formSchema = z.object({

  name: z.string().min(1, "Name is required"),

  category: z.string().min(1, "Category is required"),

  image: z.string().optional(),

  quantity: z.coerce
    .number()
    .min(0, "Quantity cannot be negative"),

  price: z.coerce
    .number()
    .min(0, "Price cannot be negative"),
});

type FormValues = z.infer<typeof formSchema>;

export default function ProductEdit() {

  const [, params] = useRoute("/products/:id/edit");

  const id = params?.id || "";

  const { toast } = useToast();

  const queryClient = useQueryClient();

  const {
    data: product,
    isLoading,
    error,
    refetch,
  } = useGetProduct(id, {
    query: {
      enabled: id.length > 0,
      queryKey: getGetProductQueryKey(id),
      retry: 5,
      retryDelay: 1000,
      staleTime: 0,
      refetchOnWindowFocus: true,
    },
  });

  const updateProduct = useUpdateProduct();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),

    defaultValues: {
      name: "",
      category: "",
      image: "",
      quantity: 0,
      price: 0,
    },
  });

  // auto-refetch until product becomes available
  useEffect(() => {

    if (!product && id) {

      const timer = setTimeout(() => {
        refetch();
      }, 1000);

      return () => clearTimeout(timer);
    }

  }, [product, id, refetch]);

  // initialize form once
  const initializedForId = useRef<string | null>(null);

  useEffect(() => {

    if (product && initializedForId.current !== id) {

      initializedForId.current = id;

      form.reset({
        name: product.name,
        category: product.category,
        image: product.image || "",
        quantity: product.quantity,
        price: product.price,
      });
    }

  }, [product, id, form]);

  function onSubmit(values: FormValues) {

    updateProduct.mutate(
      {
        id,
        data: values,
      },

      {
        onSuccess: (updatedProduct) => {

          toast({
            title: "Product updated",
            description: "Changes have been saved successfully.",
          });

          queryClient.setQueryData(
            getGetProductQueryKey(id),
            updatedProduct
          );

          queryClient.invalidateQueries({
            queryKey: getListProductsQueryKey(),
          });

          queryClient.invalidateQueries({
            queryKey: getGetDashboardStatsQueryKey(),
          });

          queryClient.invalidateQueries({
            queryKey: getGetLowStockProductsQueryKey(),
          });

          refetch();
        },

        onError: (err: any) => {

          toast({
            title: "Error updating product",
            description:
              err.message || "An unknown error occurred",
            variant: "destructive",
          });
        },
      }
    );
  }

  // loading state
  if (isLoading && !product) {

    return (
      <div className="p-6 max-w-3xl mx-auto w-full">
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  // retry state
  if (error && !product) {

    return (
      <div className="flex items-center justify-center h-[70vh]">
        <p className="text-muted-foreground">
          Loading latest product data...
        </p>
      </div>
    );
  }

  return (

    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-10">

      <div className="flex items-center gap-4">

        <Link href="/products">

          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

        </Link>

        <div>

          <h1 className="text-3xl font-bold tracking-tight">
            Edit Product
          </h1>

          <p className="text-muted-foreground flex items-center gap-2">

            <span className="font-medium text-foreground">
              {product?.name}
            </span>

            <span className="text-muted-foreground/50">
              •
            </span>

            <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
              {product?.productId}
            </code>

          </p>

        </div>

      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* FORM */}
        <div className="lg:col-span-2">

          <Card className="shadow-sm h-full">

            <Form {...form}>

              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col h-full"
              >

                <CardHeader>

                  <CardTitle>
                    Product Details
                  </CardTitle>

                  <CardDescription>
                    Update product information and stock.
                  </CardDescription>

                </CardHeader>

                <CardContent className="space-y-6 flex-1">

                  <div className="grid md:grid-cols-2 gap-6">

                    {/* PRODUCT NAME */}
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (

                        <FormItem className="col-span-2">

                          <FormLabel>
                            Product Name
                          </FormLabel>

                          <FormControl>
                            <Input {...field} />
                          </FormControl>

                          <FormMessage />

                        </FormItem>

                      )}
                    />

                    {/* CATEGORY */}
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (

                        <FormItem>

                          <FormLabel>
                            Category
                          </FormLabel>

                          <FormControl>
                            <Input {...field} />
                          </FormControl>

                          <FormMessage />

                        </FormItem>

                      )}
                    />

                    {/* IMAGE URL */}
                    <FormField
                      control={form.control}
                      name="image"
                      render={({ field }) => (

                        <FormItem className="col-span-2">

                          <FormLabel>
                            Product Image URL
                          </FormLabel>

                          <FormControl>

                            <Input
                              placeholder="Paste image URL"
                              {...field}
                            />

                          </FormControl>

                          <FormDescription>
                            Add an image URL for this product.
                          </FormDescription>

                          <FormMessage />

                        </FormItem>

                      )}
                    />

                    {/* IMAGE PREVIEW */}
                    {form.watch("image") && (

                      <div className="col-span-2">

                        <img
                          src={form.watch("image")}
                          alt="Preview"
                          className="w-full h-56 object-cover rounded-lg border"
                        />

                      </div>

                    )}

                    {/* PRICE */}
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (

                        <FormItem>

                          <FormLabel>
                            Unit Price ($)
                          </FormLabel>

                          <FormControl>

                            <div className="relative">

                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                $
                              </span>

                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                className="pl-7"
                                {...field}
                              />

                            </div>

                          </FormControl>

                          <FormMessage />

                        </FormItem>

                      )}
                    />

                    {/* QUANTITY */}
                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (

                        <FormItem className="col-span-2 md:col-span-1">

                          <FormLabel>
                            Current Stock
                          </FormLabel>

                          <FormControl>

                            <Input
                              type="number"
                              min="0"
                              step="1"
                              {...field}
                            />

                          </FormControl>

                          <FormDescription>

                            {field.value <= 5 &&
                              field.value >= 0 && (

                              <span className="text-destructive flex items-center gap-1 mt-1 font-medium text-xs">

                                <AlertCircle className="h-3 w-3" />

                                Low stock alert active

                              </span>

                            )}

                          </FormDescription>

                          <FormMessage />

                        </FormItem>

                      )}
                    />

                  </div>

                </CardContent>

                <CardFooter className="flex justify-end gap-3 bg-muted/20 border-t border-border px-6 py-4 mt-auto">

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => form.reset()}
                  >
                    Discard Changes
                  </Button>

                  <Button
                    type="submit"
                    disabled={
                      updateProduct.isPending ||
                      !form.formState.isDirty
                    }
                  >

                    {updateProduct.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}

                  </Button>

                </CardFooter>

              </form>

            </Form>

          </Card>

        </div>

        {/* SIDEBAR */}
        <div className="lg:col-span-1">

          <Card className="shadow-sm">

            <CardHeader className="bg-muted/20 pb-4 border-b border-border">

              <CardTitle className="text-lg flex items-center gap-2">

                <QrCode className="h-5 w-5 text-primary" />

                Inventory Label

              </CardTitle>

            </CardHeader>

            <CardContent className="flex flex-col items-center justify-center p-6">

              {/* PRODUCT IMAGE */}
              {product?.image && (

                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-lg mb-4 border"
                />

              )}

              {/* QR */}
              {product?.qrCode ? (

                <div className="bg-white p-3 rounded-lg shadow-sm border border-border mb-6">

                  <img
                    src={product.qrCode}
                    alt={`QR Code for ${product.productId}`}
                    className="w-48 h-48 object-contain"
                  />

                </div>

              ) : (

                <div className="w-48 h-48 bg-muted flex items-center justify-center rounded-lg border border-border mb-6">

                  <span className="text-sm text-muted-foreground text-center px-4">
                    No QR Code Generated
                  </span>

                </div>

              )}

              <div className="w-full text-center space-y-1 mb-6">

                <h4 className="font-semibold leading-tight line-clamp-2 px-2">
                  {product?.name}
                </h4>

                <p className="font-mono text-sm text-muted-foreground bg-muted inline-block px-2 py-0.5 rounded">
                  {product?.productId}
                </p>

              </div>

              <Button
                className="w-full shadow-sm"
                variant="secondary"
                onClick={() => window.print()}
              >

                <Printer className="h-4 w-4 mr-2" />

                Print Label

              </Button>

            </CardContent>

          </Card>

        </div>

      </div>

    </div>
  );
}