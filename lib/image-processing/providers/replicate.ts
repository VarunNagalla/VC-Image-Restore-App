import { RestorationInput, RestorationService } from "../types";
import { RestorationOptions, RestorationResult } from "@/types";

/**
 * PLACEHOLDER PROVIDER — not implemented yet.
 *
 * To connect Replicate for real AI restoration:
 *  1. Set REPLICATE_API_TOKEN in your environment (see .env.example).
 *  2. Implement `restore()` below using Replicate's HTTP API
 *     (e.g. a restoration/upscaling model such as GFPGAN or Real-ESRGAN).
 *  3. Update `getRestorationService()` in service.ts — it already detects
 *     REPLICATE_API_TOKEN and will route here once this throws no error.
 */
export class ReplicateRestorationService implements RestorationService {
  readonly name = "replicate";

  async restore(_input: RestorationInput, _options: RestorationOptions): Promise<RestorationResult> {
    throw new Error(
      "Replicate provider is not implemented yet. Remove REPLICATE_API_TOKEN to fall back to the algorithmic engine, or implement lib/image-processing/providers/replicate.ts."
    );
  }
}
