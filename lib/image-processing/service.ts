import { RestorationService } from "./types";
import { AlgorithmicRestorationService } from "./algorithmic-restoration-service";
import { ReplicateRestorationService } from "./providers/replicate";
import { StabilityRestorationService } from "./providers/stability";

let cachedService: RestorationService | null = null;

/**
 * Factory: picks the active restoration engine based on environment
 * variables. No real provider is implemented yet, so this currently always
 * resolves to the algorithmic engine — but the wiring is here so adding a
 * provider later is a one-file change plus an env var.
 */
export function getRestorationService(): RestorationService {
  if (cachedService) return cachedService;

  if (process.env.REPLICATE_API_TOKEN) {
    cachedService = new ReplicateRestorationService();
    return cachedService;
  }

  if (process.env.STABILITY_API_KEY) {
    cachedService = new StabilityRestorationService();
    return cachedService;
  }

  cachedService = new AlgorithmicRestorationService();
  return cachedService;
}

/** For tests: reset the cached singleton. */
export function __resetRestorationServiceCache() {
  cachedService = null;
}
