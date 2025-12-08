"use client";

import { useState, useCallback } from "react";
import { detectBottle as detectBottleWithModel } from "@/utils/bottleDetector";

/**
 * Hook for detecting bottles in images
 * Uses TensorFlow.js + Coco-SSD (transparent bottles supported)
 */
export function useBottleDetection() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Detect bottle in uploaded/captured image Blob
   * Converts Blob/File to Image element, then runs Coco-SSD
   */
  const detectBottle = useCallback(async (imageFile: File | Blob): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      // Ensure browser environment
      if (typeof window === "undefined") {
        setIsLoading(false);
        return false;
      }

      // Create Image from Blob
      const img = new Image();
      const imageUrl = URL.createObjectURL(imageFile);

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
      });

      const result = await detectBottleWithModel(img);

      URL.revokeObjectURL(imageUrl);
      setIsLoading(false);
      return result;
    } catch (err) {
      const errorMsg = "Failed to detect bottle in image";
      console.error(errorMsg, err);
      setError(errorMsg);
      setIsLoading(false);
      return false;
    }
  }, []);

  return {
    detectBottle,
    isLoading,
    error,
  };
}

