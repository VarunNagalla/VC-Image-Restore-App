export type UpscaleFactor = "none" | "2x" | "4x";

export interface RestorationOptions {
  autoRestore: boolean;
  denoise: boolean;
  deblur: boolean;
  scratchCleanup: boolean;
  colorCorrection: boolean;
  faceEnhancement: boolean;
  colorize: boolean;
  upscale: UpscaleFactor;
}

export const DEFAULT_OPTIONS: RestorationOptions = {
  autoRestore: true,
  denoise: true,
  deblur: true,
  scratchCleanup: false,
  colorCorrection: true,
  faceEnhancement: false,
  colorize: false,
  upscale: "none",
};

export type RestorationEngine = "algorithmic-v1" | "replicate" | "stability" | "openai";

export interface RestorationWarning {
  option: keyof RestorationOptions;
  message: string;
}

export interface RestorationMeta {
  engine: RestorationEngine;
  appliedOptions: Array<keyof RestorationOptions>;
  skippedOptions: Array<keyof RestorationOptions>;
  warnings: RestorationWarning[];
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
  durationMs: number;
}

export interface RestorationResult {
  dataUrl: string;
  mimeType: string;
  meta: RestorationMeta;
}

export interface HistoryEntry {
  id: string;
  createdAt: number;
  originalThumbnail: string;
  restoredThumbnail: string;
  optionsUsed: RestorationOptions;
  engine: RestorationEngine;
}

export const ACCEPTED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export type AcceptedMimeType = (typeof ACCEPTED_MIME_TYPES)[number];

export const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB
