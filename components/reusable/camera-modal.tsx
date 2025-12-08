"use client";

import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, X, Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CameraModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCapture: (imageBlob: Blob) => Promise<void>;
  isProcessing?: boolean;
}

/**
 * Camera Modal Component (Camera-only, no gallery)
 * - Starts live video stream with getUserMedia
 * - Captures frame to canvas → dataURL → Blob
 * - Stops camera on close
 */
export function CameraModal({
  open,
  onOpenChange,
  onCapture,
  isProcessing = false,
}: CameraModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  // Check for camera availability
  useEffect(() => {
    const checkCamera = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((device) => device.kind === "videoinput");
        setHasCamera(videoDevices.length > 0);
      } catch (e) {
        setHasCamera(false);
      }
    };
    checkCamera();
  }, []);

  // Start camera stream when modal opens
  useEffect(() => {
    if (open && hasCamera) {
      startCamera();
    }

    return () => {
      stopCamera();
    };
  }, [open, hasCamera]);

  /**
   * Start camera stream using getUserMedia
   */
  const startCamera = async () => {
    try {
      setIsStarting(true);
      setError(null);

      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = mediaStream;

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
      setCapturedImage(null);
    } catch (err: any) {
      console.error("Camera access error:", err);

      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setError("Camera permission required to complete this task.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setError("A camera is required to complete this task.");
        setHasCamera(false);
      } else {
        setError("Failed to access camera. Please try again.");
      }
    } finally {
      setIsStarting(false);
    }
  };

  /**
   * Stop camera stream and cleanup
   */
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  /**
   * Capture photo from video stream → dataURL → Blob
   */
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL("image/png");
    setCapturedImage(dataUrl);
  };

  /**
   * Confirm capture → convert dataURL to Blob → run detection
   */
  const handleConfirm = async () => {
    if (!capturedImage) return;

    // Convert dataURL to Blob
    const res = await fetch(capturedImage);
    const blob = await res.blob();

    // Stop camera before processing
    stopCamera();

    await onCapture(blob);
  };

  /**
   * Handle modal close
   * Ensure camera stream stops
   */
  const handleClose = () => {
    if (isProcessing) return; // Prevent closing during processing
    stopCamera();
    setError(null);
    setCapturedImage(null);
    onOpenChange(false);
  };

  /**
   * Retry camera access
   */
  const handleRetry = () => {
    setError(null);
    startCamera();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl w-full p-0 gap-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>Capture Photo</DialogTitle>
          <DialogDescription>
            Position a bottle clearly in the camera view, then capture
          </DialogDescription>
        </DialogHeader>

        <div className="relative bg-black aspect-video w-full flex items-center justify-center">
          {/* Loading overlay while starting */}
          {isStarting && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10">
              <div className="text-center text-white space-y-2">
                <Loader2 className="h-10 w-10 animate-spin mx-auto" />
                <p>Starting camera...</p>
              </div>
            </div>
          )}

          {/* Camera Preview */}
          {!capturedImage && !error && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          )}

          {/* Captured Image Preview */}
          {capturedImage && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full h-full"
              >
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="w-full h-full object-cover"
                />
                {isProcessing && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="h-12 w-12 text-white animate-spin mx-auto mb-4" />
                      <p className="text-white font-medium">Detecting bottle...</p>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}

          {/* Error State */}
          {error && (
            <div className="absolute inset-0 bg-black/90 flex items-center justify-center p-6">
              <div className="text-center text-white">
                <X className="h-12 w-12 mx-auto mb-4 text-destructive" />
                <p className="text-lg font-semibold mb-2">{error}</p>
                {error.includes("permission") || error.includes("camera") ? (
                  <Button onClick={handleRetry} variant="outline" className="mt-4">
                    Try Again
                  </Button>
                ) : (
                  <Button onClick={handleClose} variant="outline" className="mt-4">
                    Close
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* No camera available */}
          {hasCamera === false && !error && (
            <div className="absolute inset-0 bg-black/90 flex items-center justify-center p-6">
              <div className="text-center text-white space-y-2">
                <X className="h-10 w-10 mx-auto text-destructive" />
                <p className="text-lg font-semibold">A camera is required to complete this task.</p>
                <Button onClick={handleClose} variant="outline" className="mt-2">
                  Close
                </Button>
              </div>
            </div>
          )}

          {/* Hidden canvas for image capture */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Controls */}
        <div className="p-6 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isProcessing}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>

          {!capturedImage && !error && (
            <Button
              onClick={capturePhoto}
              size="lg"
              className="rounded-full w-20 h-20 p-0"
              disabled={isProcessing || isStarting}
            >
              <Camera className="h-8 w-8" />
            </Button>
          )}

          {capturedImage && !isProcessing && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-2 text-primary"
            >
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">Photo Captured</span>
            </motion.div>
          )}

          {/* Confirm button shown after capture */}
          {capturedImage && !isProcessing && (
            <Button onClick={handleConfirm} disabled={isProcessing}>
              Confirm & Detect
            </Button>
          )}

          {/* Spacer for layout */}
          {(!streamRef.current || error) && <div />}
        </div>
      </DialogContent>
    </Dialog>
  );
}

