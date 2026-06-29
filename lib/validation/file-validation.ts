import { ACCEPTED_MIME_TYPES, AcceptedMimeType, MAX_FILE_SIZE_BYTES } from "@/types";

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates a file's MIME type and size. Used on both the client (for instant
 * feedback) and the server (never trust the client alone).
 */
export function validateImageFile(file: { type: string; size: number; name?: string }): FileValidationResult {
  if (!file.type || !ACCEPTED_MIME_TYPES.includes(file.type as AcceptedMimeType)) {
    return {
      valid: false,
      error: `Unsupported file type "${file.type || "unknown"}". Please upload a JPG, PNG, or WEBP image.`,
    };
  }

  if (file.size <= 0) {
    return { valid: false, error: "The selected file appears to be empty." };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const maxMb = MAX_FILE_SIZE_BYTES / (1024 * 1024);
    return {
      valid: false,
      error: `File is too large. Maximum allowed size is ${maxMb}MB.`,
    };
  }

  return { valid: true };
}

/** Sniffs the first bytes of a buffer to confirm it really is one of our accepted image formats. */
export function sniffImageMimeType(buffer: Buffer): AcceptedMimeType | null {
  if (buffer.length < 12) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "image/png";
  }

  // WEBP: "RIFF"....."WEBP"
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return "image/webp";
  }

  return null;
}
