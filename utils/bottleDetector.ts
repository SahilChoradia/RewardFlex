"use client";

import * as tf from "@tensorflow/tfjs";
import * as cocoSsd from "@tensorflow-models/coco-ssd";

let model: cocoSsd.ObjectDetection | null = null;

/**
 * Detect bottle (or similar container) in image using Coco-SSD
 * Accepts HTMLImageElement or HTMLCanvasElement
 */
export async function detectBottle(img: HTMLImageElement | HTMLCanvasElement): Promise<boolean> {
  if (!model) {
    model = await cocoSsd.load();
  }

  const predictions = await model.detect(img);

  const classes = ["bottle", "water bottle", "cup", "glass bottle", "plastic bottle"];
  return predictions.some((p) => classes.includes(p.class) && p.score > 0.45);
}

