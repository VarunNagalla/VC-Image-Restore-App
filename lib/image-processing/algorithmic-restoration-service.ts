import sharp from "sharp";
import { RestorationInput, RestorationService } from "./types";
import {
  RestorationOptions,
  RestorationResult,
  RestorationWarning,
  RestorationMeta,
} from "@/types";

/**
 * MOCK / REPLACEABLE IMPLEMENTATION
 * ---------------------------------
 * This is the "no AI key configured" engine. It performs real, classical
 * image-processing operations (via sharp/libvips) so the app is genuinely
 * useful out of the box, but it is NOT an AI restoration model. It must
 * never claim to be one in the UI or here in code.
 *
 * Swap in a real provider by implementing `RestorationService` (see
 * lib/image-processing/providers/) and returning it from getRestorationService().
 */
export class AlgorithmicRestorationService implements RestorationService {
  readonly name = "algorithmic-v1";

  async restore(input: RestorationInput, options: RestorationOptions): Promise<RestorationResult> {
    const start = Date.now();
    const applied: Array<keyof RestorationOptions> = [];
    const skipped: Array<keyof RestorationOptions> = [];
    const warnings: RestorationWarning[] = [];

    const original = sharp(input.buffer, { failOn: "none" }).rotate(); // auto-orient
    const originalMeta = await original.metadata();
    const originalWidth = originalMeta.width ?? 0;
    const originalHeight = originalMeta.height ?? 0;

    let pipeline = sharp(input.buffer, { failOn: "none" }).rotate();

    const autoBundle = options.autoRestore;
    const wantDenoise = options.denoise || autoBundle;
    const wantDeblur = options.deblur || autoBundle;
    const wantScratch = options.scratchCleanup;
    const wantColor = options.colorCorrection || autoBundle;
    const wantFace = options.faceEnhancement;

    // --- Scratch & dust cleanup: gentle median-style blur to smooth small defects ---
    if (wantScratch) {
      pipeline = pipeline.median(3);
      applied.push("scratchCleanup");
    }

    // --- Denoise: light blur to suppress grain, paired with sharpen below to recover edges ---
    if (wantDenoise) {
      pipeline = pipeline.blur(0.4);
      applied.push("denoise");
    }

    // --- Deblur / Sharpen: unsharp-mask style edge enhancement ---
    if (wantDeblur) {
      pipeline = pipeline.sharpen({ sigma: 1.2, m1: 1, m2: 2 });
      applied.push("deblur");
    }

    // --- Color correction: normalize contrast + gentle saturation lift for faded photos ---
    if (wantColor) {
      pipeline = pipeline.normalize().modulate({ saturation: 1.12, brightness: 1.03 });
      applied.push("colorCorrection");
    }

    // --- Face detail enhancement: best-effort general clarity pass (no face detection in v1) ---
    if (wantFace) {
      pipeline = pipeline.sharpen({ sigma: 0.6 });
      applied.push("faceEnhancement");
      warnings.push({
        option: "faceEnhancement",
        message:
          "Face enhancement is a general clarity pass in this build. Targeted, face-aware enhancement requires an AI provider.",
      });
    }

    // --- Colorize: cannot be done honestly without AI. Always skipped here. ---
    if (options.colorize) {
      skipped.push("colorize");
      warnings.push({
        option: "colorize",
        message: "Colorizing a black & white photo requires an AI model. Connect a provider in Settings to enable this.",
      });
    }

    // --- Upscale: high-quality resample (Lanczos3) ---
    if (options.upscale !== "none") {
      const factor = options.upscale === "4x" ? 4 : 2;
      const targetWidth = Math.round((originalWidth || 1) * factor);
      const targetHeight = Math.round((originalHeight || 1) * factor);
      pipeline = pipeline.resize(targetWidth, targetHeight, { kernel: "lanczos3" });
      applied.push("upscale");
      warnings.push({
        option: "upscale",
        message: "Upscale uses standard high-quality resampling, not AI super-resolution.",
      });
    } else {
      skipped.push("upscale");
    }

    if (autoBundle) {
      applied.push("autoRestore");
    }

    const outputFormat = input.mimeType === "image/png" ? "png" : "jpeg";
    const outputBuffer =
      outputFormat === "png"
        ? await pipeline.png({ quality: 92 }).toBuffer()
        : await pipeline.jpeg({ quality: 90 }).toBuffer();

    const outMeta = await sharp(outputBuffer).metadata();
    const mimeType = outputFormat === "png" ? "image/png" : "image/jpeg";
    const dataUrl = `data:${mimeType};base64,${outputBuffer.toString("base64")}`;

    const meta: RestorationMeta = {
      engine: this.name,
      appliedOptions: applied,
      skippedOptions: skipped,
      warnings,
      width: outMeta.width ?? originalWidth,
      height: outMeta.height ?? originalHeight,
      originalWidth,
      originalHeight,
      durationMs: Date.now() - start,
    };

    return { dataUrl, mimeType, meta };
  }
}
