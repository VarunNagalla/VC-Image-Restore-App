import { RestorationOptions, RestorationResult } from "@/types";

export interface RestorationInput {
  buffer: Buffer;
  mimeType: string;
}

/**
 * Every restoration backend (mock/algorithmic today, AI providers later)
 * implements this single method. The rest of the app never knows which
 * implementation is active.
 */
export interface RestorationService {
  readonly name: string;
  restore(input: RestorationInput, options: RestorationOptions): Promise<RestorationResult>;
}
