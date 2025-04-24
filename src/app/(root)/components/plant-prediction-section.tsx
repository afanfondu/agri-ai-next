"use client";
import type React from "react";

import { useState, useRef, useCallback } from "react";
import { Camera as CameraIcon, Upload, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import api from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import Webcam from "react-webcam";
import { toast } from "sonner";

type PredictionResult = {
  class_name: string;
  confidence: number;
  class_index: number;
  ayurvedic_info: {
    description: string;
    uses: string[];
  };
};

export default function PlantPredictionSection() {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [topPredictions, setTopPredictions] = useState<PredictionResult[]>([]);
  const [showAllPredictions, setShowAllPredictions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const webcamRef = useRef<Webcam>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: async (imageData: string) => {
      // Convert base64 image to blob for sending as multipart/form-data
      const response = await fetch(imageData);
      const blob = await response.blob();

      // Create form data
      const formData = new FormData();
      formData.append("image", blob, "plant-image.jpg");

      // Use the new Next.js API endpoint instead of the Flask backend
      const result = await axios.post("/api/predict-plant", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return result.data;
    },
    onSuccess: (data) => {
      if (data.status === "success") {
        setResult(data.prediction);
        // We may not need top predictions with Gemini, but maintaining for compatibility
        if (data.top_predictions && data.top_predictions.length > 0) {
          setTopPredictions(data.top_predictions);
        }
      } else {
        toast.error("Prediction failed", {
          description: data.message || "Unable to identify the plant",
        });
      }
    },
    onError: (error) => {
      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data?.message || error.message
          : "Failed to process the image";
      toast.error("Error", { description: errorMessage });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        detectPlant(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const openCamera = () => {
    setIsCameraOpen(true);
    setCameraError(null);
    setCameraReady(false);
  };

  const captureImage = useCallback(() => {
    if (webcamRef.current && cameraReady) {
      try {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
          setImage(imageSrc);
          detectPlant(imageSrc);
          setIsCameraOpen(false);
        } else {
          throw new Error("Failed to capture image");
        }
      } catch (error) {
        console.error("Error capturing image:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to capture image";
        setCameraError(errorMessage);
        toast.error("Camera error", {
          description:
            errorMessage || "Failed to capture image. Please try again.",
        });
      }
    } else if (!cameraReady) {
      toast.error("Camera not ready", {
        description:
          "Please wait for the camera to initialize fully before capturing.",
      });
    }
  }, [cameraReady]);

  const handleCameraError = useCallback((error: string | Error) => {
    let errorMessage = "Unknown camera error";
    if (typeof error === "string") {
      errorMessage = error;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error("Camera error:", errorMessage);
    setCameraError(errorMessage);
    toast.error("Camera issue", {
      description: errorMessage,
    });
    setCameraReady(false);
  }, []);

  const handleCameraUserMedia = useCallback(() => {
    setCameraReady(true);
  }, []);

  const detectPlant = async (imageData: string) => {
    setResult(null);
    setTopPredictions([]);
    setShowAllPredictions(false);
    mutate(imageData);
  };

  const resetDetection = () => {
    setImage(null);
    setResult(null);
    setTopPredictions([]);
    setShowAllPredictions(false);
  };

  const toggleShowAllPredictions = () => {
    setShowAllPredictions(!showAllPredictions);
  };

  // Video constraints with back camera preference
  const videoConstraints = {
    width: 720,
    height: 720,
    facingMode: { ideal: "environment" },
  };

  return (
    <section id="plant-prediction" className="py-10">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-3">
          Ayurvedic Medicinal Plant Detection
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Upload or capture an image of a plant to identify its ayurvedic
          medicinal properties and uses.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Plant Image</CardTitle>
            <CardDescription>
              Upload or capture an image of the plant
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            {!image && !isCameraOpen && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center w-full">
                <div className="flex flex-col items-center gap-4">
                  <div className="text-muted-foreground">
                    Upload an image or use your camera to take a photo
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button onClick={() => fileInputRef.current?.click()}>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Image
                    </Button>
                    <Button onClick={openCamera}>
                      <CameraIcon className="mr-2 h-4 w-4" />
                      Use Camera
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
            )}

            {isCameraOpen && (
              <div className="w-full">
                <div className="w-full relative aspect-square max-w-md mx-auto overflow-hidden rounded-lg">
                  {cameraError ? (
                    <div className="flex flex-col items-center justify-center h-full p-4 text-center bg-gray-100">
                      <p className="text-red-500 mb-2">{cameraError}</p>
                      <Button
                        variant="outline"
                        onClick={() => setIsCameraOpen(false)}
                      >
                        Go Back
                      </Button>
                    </div>
                  ) : (
                    <Webcam
                      ref={webcamRef}
                      audio={false}
                      screenshotFormat="image/jpeg"
                      videoConstraints={videoConstraints}
                      onUserMediaError={handleCameraError}
                      onUserMedia={handleCameraUserMedia}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex justify-center mt-4">
                  <Button
                    onClick={captureImage}
                    disabled={!!cameraError || !cameraReady}
                  >
                    {cameraReady ? "Capture" : "Initializing camera..."}
                  </Button>
                  <Button
                    variant="outline"
                    className="ml-2"
                    onClick={() => setIsCameraOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {image && !isCameraOpen && (
              <div className="w-full">
                <div className="relative aspect-square w-full max-w-md mx-auto">
                  <img
                    src={image}
                    alt="Uploaded plant"
                    className="object-contain rounded-lg w-full h-full"
                  />
                </div>
                <div className="flex justify-center mt-4">
                  <Button variant="outline" onClick={resetDetection}>
                    Upload Different Image
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detection Results</CardTitle>
            <CardDescription>
              Identified plant and its ayurvedic properties
            </CardDescription>
          </CardHeader>
          <CardContent className="h-full">
            {isPending && (
              <div className="flex flex-col items-center justify-center h-full min-h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="mt-4 text-muted-foreground">
                  Analyzing plant image...
                </p>
              </div>
            )}

            {!isPending && !result && (
              <div className="flex flex-col items-center justify-center min-h-64 h-full text-center">
                <p className="text-muted-foreground">
                  Upload or capture an image to see the detection results
                </p>
              </div>
            )}

            {result && (
              <div className="space-y-6 flex flex-col justify-center h-full min-h-80">
                <div>
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    {result.class_name}
                    {result.class_name !== "Not a plant image" && (
                      <span className="text-sm font-normal text-muted-foreground">
                        {(result.confidence * 100).toFixed(1)}% confidence
                      </span>
                    )}{" "}
                  </h3>
                  <p className="text-muted-foreground mt-2">
                    {result.ayurvedic_info.description}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Ayurvedic Uses:</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {result.ayurvedic_info.uses.map((use, index) => (
                      <li key={index}>{use}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="text-sm text-muted-foreground">
            Note: For accurate results, ensure the plant is clearly visible in
            the image.
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}
