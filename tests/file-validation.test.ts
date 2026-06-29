import { describe, expect, it } from "vitest";
import { validateImageFile, sniffImageMimeType } from "@/lib/validation/file-validation";
import { MAX_FILE_SIZE_BYTES } from "@/types";

describe("validateImageFile", () => {
  it("accepts a valid jpeg under the size limit", () => {
    const result = validateImageFile({ type: "image/jpeg", size: 1024 });
    expect(result.valid).toBe(true);
  });

  it("rejects unsupported mime types", () => {
    const result = validateImageFile({ type: "application/pdf", size: 1024 });
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/Unsupported file type/);
  });

  it("rejects empty files", () => {
    const result = validateImageFile({ type: "image/png", size: 0 });
    expect(result.valid).toBe(false);
  });

  it("rejects files over the max size", () => {
    const result = validateImageFile({ type: "image/png", size: MAX_FILE_SIZE_BYTES + 1 });
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/too large/);
  });
});

describe("sniffImageMimeType", () => {
  it("detects PNG by magic bytes", () => {
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
    expect(sniffImageMimeType(png)).toBe("image/png");
  });

  it("detects JPEG by magic bytes", () => {
    const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0]);
    expect(sniffImageMimeType(jpeg)).toBe("image/jpeg");
  });

  it("returns null for unrecognized data", () => {
    const random = Buffer.from("not an image, just text data");
    expect(sniffImageMimeType(random)).toBeNull();
  });
});
