import React from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  useCreateProduct,
  getListProductsQueryKey,
  getGetDashboardStatsQueryKey,
  getGetRecentProductsQueryKey,
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
} from "lucide-react";

import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({

  name: z.string().min(1, "Name is required"),

  productId: z.string().optional(),

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

export default function ProductNew() {

  const [, setLocation] = useLocation();

  const { toast } = useToast();

  const queryClient = useQueryClient();

  const createProduct = useCreateProduct();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),

    defaultValues: {
      name: "",
      productId: "",
      category: "",
      image: "",
      quantity: 0,
      price: 0,
    },
  });

  function onSubmit(values: FormValues) {

    const data = {
      ...values,
      productId: values.productId || null,
    };

    createProduct.mutate(
      { data },

      {
        onSuccess: async (newProduct) => {

          toast({
            title: "Product created",
            description: `${newProduct.name} has been added to inventory.`,
          });

          await queryClient.invalidateQueries({
            queryKey: getListProductsQueryKey(),
          });

          await queryClient.invalidateQueries({
            queryKey: getGetDashboardStatsQueryKey(),
          });

          await queryClient.invalidateQueries({
            queryKey: getGetRecentProductsQueryKey(),
          });

          setTimeout(async () => {

            await queryClient.refetchQueries({
              queryKey: getListProductsQueryKey(),
            });

            setLocation(`/products/${newProduct.id}/edit`);

          }, 1200);
        },

        onError: (error) => {

          toast({
            title: "Error creating product",
            description:
              error.message || "Failed to create product",
            variant: "destructive",
          });
        },
      }
    );
  }

  return (

    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto pb-10">

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
            Add Product
          </h1>

          <p className="text-muted-foreground">
            Create a new item in your inventory catalog.
          </p>

        </div>

      </div>

      <Card className="shadow-sm">

        <Form {...form}>

          <form onSubmit={form.handleSubmit(onSubmit)}>

            <CardHeader>

              <CardTitle>
                Product Details
              </CardTitle>

              <CardDescription>
                Enter the core information for this product.
                A QR code will be generated automatically.
              </CardDescription>

            </CardHeader>

            <CardContent className="space-y-6">

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

                        <Input
                          placeholder="e.g. Ergonomic Office Chair"
                          {...field}
                        />

                      </FormControl>

                      <FormMessage />

                    </FormItem>

                  )}
                />

                {/* PRODUCT ID */}
                <FormField
                  control={form.control}
                  name="productId"
                  render={({ field }) => (

                    <FormItem>

                      <FormLabel>
                        SKU / Product ID
                      </FormLabel>

                      <FormControl>

                        <Input
                          placeholder="Leave blank to auto-generate"
                          {...field}
                        />

                      </FormControl>

                      <FormDescription>
                        Unique identifier used in the QR code.
                      </FormDescription>

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

                        <Input
                          placeholder="e.g. Furniture"
                          {...field}
                        />

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

                    <FormItem>

                      <FormLabel>
                        Initial Stock Quantity
                      </FormLabel>

                      <FormControl>

                        <Input
                          type="number"
                          min="0"
                          step="1"
                          {...field}
                        />

                      </FormControl>

                      <FormMessage />

                    </FormItem>

                  )}
                />

              </div>

            </CardContent>

            <CardFooter className="flex justify-end gap-3 bg-muted/20 border-t border-border px-6 py-4">

              <Link href="/products">

                <Button
                  type="button"
                  variant="outline"
                >
                  Cancel
                </Button>

              </Link>

              <Button
                type="submit"
                disabled={createProduct.isPending}
              >

                {createProduct.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Create Product
                  </>
                )}

              </Button>

            </CardFooter>

          </form>

        </Form>

      </Card>

    </div>
  );
}