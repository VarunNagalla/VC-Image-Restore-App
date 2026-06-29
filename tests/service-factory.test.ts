import { afterEach, describe, expect, it, vi } from "vitest";
import { getRestorationService, __resetRestorationServiceCache } from "@/lib/image-processing/service";

describe("getRestorationService", () => {
  afterEach(() => {
    __resetRestorationServiceCache();
    vi.unstubAllEnvs();
  });

  it("falls back to the algorithmic engine when no provider keys are set", () => {
    vi.stubEnv("REPLICATE_API_TOKEN", "");
    vi.stubEnv("STABILITY_API_KEY", "");
    const service = getRestorationService();
    expect(service.name).toBe("algorithmic-v1");
  });

  it("selects Replicate when REPLICATE_API_TOKEN is set", () => {
    vi.stubEnv("REPLICATE_API_TOKEN", "test-token");
    const service = getRestorationService();
    expect(service.name).toBe("replicate");
  });
});
