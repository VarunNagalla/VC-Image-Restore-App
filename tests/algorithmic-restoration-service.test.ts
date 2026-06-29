import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { AlgorithmicRestorationService } from "@/lib/image-processing/algorithmic-restoration-service";
import { DEFAULT_OPTIONS, RestorationOptions } from "@/types";

async function makeTestPng(width = 64, height = 48): Promise<Buffer> {
  return sharp({
    create: { width, height, channels: 3, background: { r: 120, g: 80, b: 60 } },
  })
    .png()
    .toBuffer();
}

describe("AlgorithmicRestorationService", () => {
  const service = new AlgorithmicRestorationService();

  it("returns a result with the same dimensions when no upscale is requested", async () => {
    const buffer = await makeTestPng(64, 48);
    const result = await service.restore({ buffer, mimeType: "image/png" }, DEFAULT_OPTIONS);

    expect(result.meta.width).toBe(64);
    expect(result.meta.height).toBe(48);
    expect(result.dataUrl.startsWith("data:image/")).toBe(true);
    expect(result.meta.engine).toBe("algorithmic-v1");
  });

  it("doubles dimensions for 2x upscale", async () => {
    const buffer = await makeTestPng(64, 48);
    const options: RestorationOptions = { ...DEFAULT_OPTIONS, upscale: "2x" };
    const result = await service.restore({ buffer, mimeType: "image/png" }, options);

    expect(result.meta.width).toBe(128);
    expect(result.meta.height).toBe(96);
    expect(result.meta.appliedOptions).toContain("upscale");
  });

  it("quadruples dimensions for 4x upscale", async () => {
    const buffer = await makeTestPng(50, 50);
    const options: RestorationOptions = { ...DEFAULT_OPTIONS, autoRestore: false, denoise: false, deblur: false, colorCorrection: false, upscale: "4x" };
    const result = await service.restore({ buffer, mimeType: "image/png" }, options);

    expect(result.meta.width).toBe(200);
    expect(result.meta.height).toBe(200);
  });

  it("marks colorize as skipped with a warning, never claiming it was applied", async () => {
    const buffer = await makeTestPng();
    const options: RestorationOptions = { ...DEFAULT_OPTIONS, colorize: true };
    const result = await service.restore({ buffer, mimeType: "image/png" }, options);

    expect(result.meta.skippedOptions).toContain("colorize");
    expect(result.meta.appliedOptions).not.toContain("colorize");
    expect(result.meta.warnings.some((w) => w.option === "colorize")).toBe(true);
  });

  it("respects individual toggles when autoRestore is off", async () => {
    const buffer = await makeTestPng();
    const options: RestorationOptions = {
      ...DEFAULT_OPTIONS,
      autoRestore: false,
      denoise: false,
      deblur: false,
      colorCorrection: false,
      scratchCleanup: true,
    };
    const result = await service.restore({ buffer, mimeType: "image/png" }, options);

    expect(result.meta.appliedOptions).toEqual(["scratchCleanup"]);
  });
});
