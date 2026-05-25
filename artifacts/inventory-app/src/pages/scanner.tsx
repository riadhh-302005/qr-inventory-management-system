import React, { useEffect, useState, useRef } from "react";
import { Link } from "wouter";
import { BrowserMultiFormatReader } from "@zxing/browser";

import {
  useGetProductByProductId,
  getGetProductByProductIdQueryKey,
} from "@workspace/api-client-react";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import {
  QrCode,
  AlertCircle,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

export default function Scanner() {
  const [scannedId, setScannedId] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  const {
    data: product,
    isFetching,
    error: productError,
    refetch,
  } = useGetProductByProductId(scannedId || "", {
    query: {
      queryKey: getGetProductByProductIdQueryKey(scannedId || ""),
      enabled: false,
      retry: false,
    },
  });

  useEffect(() => {
    if (scannedId) {
      refetch();
    }
  }, [scannedId, refetch]);

  // START CAMERA
  useEffect(() => {
    const startScanner = async () => {
      try {
        const codeReader = new BrowserMultiFormatReader();

        codeReaderRef.current = codeReader;

        const devices =
          await BrowserMultiFormatReader.listVideoInputDevices();

        if (!devices.length) {
          setScanError("No camera found");
          return;
        }

        const selectedDeviceId = devices[0].deviceId;

        await codeReader.decodeFromVideoDevice(
          selectedDeviceId,
          videoRef.current!,
          (result, err) => {
            if (result) {
              setScannedId(result.getText());
              setScanError(null);

              codeReader.reset();
            }
          }
        );
      } catch (err) {
        console.error(err);
        setScanError("Failed to access camera");
      }
    };

    startScanner();

  return () => {
  (codeReaderRef.current as any)?.reset?.();
};
  }, []);

  const resumeScanning = async () => {
    setScannedId(null);
    setScanError(null);

    try {
      const codeReader = new BrowserMultiFormatReader();

      codeReaderRef.current = codeReader;

      const devices =
        await BrowserMultiFormatReader.listVideoInputDevices();

      const selectedDeviceId = devices[0].deviceId;

      await codeReader.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current!,
        (result) => {
          if (result) {
            setScannedId(result.getText());

            codeReader.reset();
          }
        }
      );
    } catch (err) {
      setScanError("Unable to restart scanner");
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
}).format(value);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          QR Scanner
        </h1>

        <p className="text-muted-foreground">
          Scan product labels to quickly view and update inventory.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">

        {/* LEFT SIDE */}
        <div className="flex flex-col gap-4">

          <Card className="shadow-sm overflow-hidden border-primary/20">

            <CardHeader className="bg-primary/5 pb-4">

              <CardTitle className="flex items-center gap-2 text-lg">
                <QrCode className="h-5 w-5 text-primary" />
                Camera Scanner
              </CardTitle>

              <CardDescription>
                Position the QR code within the frame to scan automatically.
              </CardDescription>

            </CardHeader>

            <CardContent className="p-0">

              <div className="relative bg-black">

                {scannedId && (
                  <div className="absolute inset-0 bg-black/70 z-10 flex flex-col items-center justify-center text-white">

                    <QrCode className="h-12 w-12 mb-4" />

                    <p className="mb-4 font-semibold">
                      QR Code Scanned
                    </p>

                    <Button
                      variant="secondary"
                      onClick={resumeScanning}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Scan Another
                    </Button>

                  </div>
                )}

                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-[350px] object-cover"
                />

              </div>

            </CardContent>

          </Card>

          {scanError && (
            <Alert variant="destructive">

              <AlertCircle className="h-4 w-4" />

              <AlertTitle>Scanner Error</AlertTitle>

              <AlertDescription>
                {scanError}
              </AlertDescription>

            </Alert>
          )}

        </div>

        {/* RIGHT SIDE */}
        <div className="flex flex-col">

          {!scannedId ? (

            <Card className="shadow-sm border-dashed bg-muted/30 h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8">

              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <QrCode className="h-8 w-8 text-muted-foreground" />
              </div>

              <h3 className="font-medium text-lg mb-2">
                Waiting for scan...
              </h3>

              <p className="text-muted-foreground text-sm max-w-[250px]">
                Point your camera at a product QR code to view its details here.
              </p>

            </Card>

          ) : isFetching ? (

            <Card className="p-8">
              Loading product...
            </Card>

          ) : productError ? (

            <Alert variant="destructive">

              <AlertCircle className="h-4 w-4" />

              <AlertTitle>
                Product Not Found
              </AlertTitle>

              <AlertDescription className="mt-2">

                <p className="mb-4">
                  No product matches:
                  {" "}
                  {scannedId}
                </p>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={resumeScanning}
                >
                  Try Again
                </Button>

              </AlertDescription>

            </Alert>

          ) : product ? (

            <Card className="shadow-sm h-full border-primary/20">

              <div className="absolute top-4 right-4">

                <Badge
                  variant={
                    product.quantity <= 5
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {product.quantity} in stock
                </Badge>

              </div>

              <CardHeader>

                <CardDescription className="font-mono">
                  {product.productId}
                </CardDescription>

                <CardTitle className="text-2xl leading-tight pr-20">
                  {product.name}
                </CardTitle>

              </CardHeader>

              <CardContent className="space-y-6">

                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">

                  <div className="flex-1">

                    <p className="text-sm text-muted-foreground mb-1">
                      Category
                    </p>

                    <p className="font-medium">
                      {product.category}
                    </p>

                  </div>

                  <div className="w-px h-10 bg-border"></div>

                  <div className="flex-1 pl-4">

                    <p className="text-sm text-muted-foreground mb-1">
                      Unit Price
                    </p>

                    <p className="font-bold text-lg">
                      {formatCurrency(product.price)}
                    </p>

                  </div>

                </div>

              </CardContent>

              <CardFooter className="flex gap-3 bg-muted/20 py-4 mt-auto border-t border-border">

                <Link href={`/products/${product.id}/edit`}>

                  <Button className="w-full">

                    Edit Product

                    <ArrowRight className="ml-2 h-4 w-4" />

                  </Button>

                </Link>

              </CardFooter>

            </Card>

          ) : null}

        </div>

      </div>
    </div>
  );
}