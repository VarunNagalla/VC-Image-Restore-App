import { RestorationInput, RestorationService } from "../types";
import { RestorationOptions, RestorationResult } from "@/types";

/**
 * PLACEHOLDER PROVIDER — not implemented yet.
 * Set STABILITY_API_KEY and implement restore() using Stability AI's API
 * (e.g. their upscale / image-to-image endpoints) to enable this engine.
 */
export class StabilityRestorationService implements RestorationService {
  readonly name = "stability";

  async restore(_input: RestorationInput, _options: RestorationOptions): Promise<RestorationResult> {
    throw new Error(
      "Stability AI provider is not implemented yet. Remove STABILITY_API_KEY to fall back to the algorithmic engine, or implement lib/image-processing/providers/stability.ts."
    );
  }
}
