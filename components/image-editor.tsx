"use client";

import { useState, useCallback } from "react";
import { removeBackground } from "@imgly/background-removal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Upload, Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageAdjustments {
  grayscale: number;
  brightness: number;
  contrast: number;
  blur: number;
}

export function ImageEditor() {
  const [image, setImage] = useState<string | null>(null);
  const [compositeImage, setCompositeImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [adjustments, setAdjustments] = useState<ImageAdjustments>({
    grayscale: 1,
    brightness: 0.6,
    contrast: 1.2,
    blur: 0,
  });
  const [removedBgBase64, setRemovedBgBase64] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);

  const blobToBase64 = useCallback((blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }, []);

  const createGrayscale = useCallback(
    (file: File, imageAdjustments: ImageAdjustments): Promise<string> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;

          if (ctx) {
            ctx.filter = `grayscale(${imageAdjustments.grayscale * 100}%) 
                       brightness(${imageAdjustments.brightness * 100}%) 
                       contrast(${imageAdjustments.contrast * 100}%)
                       blur(${imageAdjustments.blur}px)`;
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL("image/png", 1.0));
          } else {
            reject(new Error("Could not get canvas context"));
          }
        };

        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = URL.createObjectURL(file);
      });
    },
    []
  );

  const createComposite = useCallback(
    (grayscaleBase64: string, removedBgBase64: string): Promise<string> => {
      return new Promise((resolve, reject) => {
        const grayscaleImg = new Image();
        const removedBgImg = new Image();
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        let imagesLoaded = 0;
        const onImageLoad = () => {
          imagesLoaded++;
          if (imagesLoaded === 2) {
            canvas.width = grayscaleImg.width;
            canvas.height = grayscaleImg.height;

            if (ctx) {
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = "high";
              ctx.drawImage(grayscaleImg, 0, 0);
              ctx.drawImage(removedBgImg, 0, 0);
              resolve(canvas.toDataURL("image/png", 1.0));
            } else {
              reject(new Error("Could not get canvas context"));
            }
          }
        };

        grayscaleImg.onload = onImageLoad;
        removedBgImg.onload = onImageLoad;
        grayscaleImg.onerror = () =>
          reject(new Error("Failed to load grayscale image"));
        removedBgImg.onerror = () =>
          reject(new Error("Failed to load removed background image"));

        grayscaleImg.src = grayscaleBase64;
        removedBgImg.src = removedBgBase64;
      });
    },
    []
  );

  const updateComposite = useCallback(
    async (
      file: File,
      removedBgBase64: string,
      imageAdjustments: ImageAdjustments
    ) => {
      const grayscale = await createGrayscale(file, imageAdjustments);
      const composite = await createComposite(grayscale, removedBgBase64);
      setCompositeImage(composite);
    },
    [createGrayscale, createComposite]
  );

  const handleFile = useCallback(
    async (file: File) => {
      setOriginalFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImage(e.target?.result as string);
      reader.readAsDataURL(file);

      try {
        setIsProcessing(true);
        const removedBgBlob = await removeBackground(file);
        const bgRemovedBase64 = await blobToBase64(removedBgBlob);
        setRemovedBgBase64(bgRemovedBase64);
        await updateComposite(file, bgRemovedBase64, adjustments);
      } catch (error) {
        console.error("Error:", error);
        alert("Failed to process image");
      } finally {
        setIsProcessing(false);
      }
    },
    [adjustments, blobToBase64, updateComposite]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith("image/")) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleImageChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleAdjustmentChange = useCallback(
    async (key: keyof ImageAdjustments, value: number) => {
      const newAdjustments = { ...adjustments, [key]: value };
      setAdjustments(newAdjustments);

      if (originalFile && removedBgBase64) {
        await updateComposite(originalFile, removedBgBase64, newAdjustments);
      }
    },
    [adjustments, originalFile, removedBgBase64, updateComposite]
  );

  const handleDownload = useCallback(async () => {
    if (!compositeImage) return;

    try {
      const response = await fetch(compositeImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "edited-image.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading image:", error);
      alert("Failed to download image");
    }
  }, [compositeImage]);

  return (
    <>
      {!image ? (
        <Card className="p-8">
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 transition-colors duration-200 ease-in-out hover:border-gray-400"
          >
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mb-4">
              <Upload className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Upload Your Image</h2>
            <p className="text-gray-600 mb-4">Drag & drop or click to upload</p>
            <p className="text-sm text-gray-500 mb-4">
              Supported formats: PNG, JPG, JPEG
            </p>
            <div className="relative">
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isProcessing}
              />
              <Button
                variant="outline"
                size="lg"
                className={cn(
                  "pointer-events-none",
                  isProcessing && "opacity-50"
                )}
                disabled={isProcessing}
              >
                Choose File
              </Button>
            </div>
            {isProcessing && (
              <div className="mt-4 flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                <p className="text-primary">
                  Processing... This may take a few seconds.
                </p>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Original</h3>
              <div className="relative h-[600px] bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={image}
                  alt="Original"
                  className="absolute inset-0 w-full h-full object-contain"
                />
              </div>
            </Card>
            {isProcessing ? (
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4">Result</h3>
                <div className="relative h-[600px] bg-gray-100 rounded-lg overflow-hidden">
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4"></div>
                    <p className="text-primary font-medium">Processing image...</p>
                    <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
                  </div>
                </div>
              </Card>
            ) : compositeImage ? (
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4">Result</h3>
                <div className="relative h-[600px] bg-[url('/checkerboard.png')] rounded-lg overflow-hidden">
                  <img
                    src={compositeImage}
                    alt="Result"
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                </div>
              </Card>
            ) : null}
          </div>

          <Card className="p-6 mt-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Adjustments</h2>
              {compositeImage && (
                <Button
                  onClick={handleDownload}
                  className="bg-black hover:bg-gray-800 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              )}
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Grayscale
                  </label>
                  <span className="text-sm text-gray-500">
                    {adjustments.grayscale.toFixed(1)}
                  </span>
                </div>
                <Slider
                  value={[adjustments.grayscale]}
                  min={0}
                  max={1}
                  step={0.1}
                  onValueChange={([value]) =>
                    handleAdjustmentChange("grayscale", value)
                  }
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Brightness
                  </label>
                  <span className="text-sm text-gray-500">
                    {adjustments.brightness.toFixed(1)}
                  </span>
                </div>
                <Slider
                  value={[adjustments.brightness]}
                  min={0}
                  max={2}
                  step={0.1}
                  onValueChange={([value]) =>
                    handleAdjustmentChange("brightness", value)
                  }
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Contrast
                  </label>
                  <span className="text-sm text-gray-500">
                    {adjustments.contrast.toFixed(1)}
                  </span>
                </div>
                <Slider
                  value={[adjustments.contrast]}
                  min={0}
                  max={2}
                  step={0.1}
                  onValueChange={([value]) =>
                    handleAdjustmentChange("contrast", value)
                  }
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Blur
                  </label>
                  <span className="text-sm text-gray-500">
                    {adjustments.blur.toFixed(1)}px
                  </span>
                </div>
                <Slider
                  value={[adjustments.blur]}
                  min={0}
                  max={10}
                  step={0.5}
                  onValueChange={([value]) =>
                    handleAdjustmentChange("blur", value)
                  }
                />
              </div>
            </div>
          </Card>
        </>
      )}
    </>
  );
}
