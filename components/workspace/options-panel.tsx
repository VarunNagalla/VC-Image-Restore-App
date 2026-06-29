"use client";

import * as React from "react";
import { RestorationOptions, UpscaleFactor } from "@/types";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface OptionsPanelProps {
  options: RestorationOptions;
  onChange: (next: RestorationOptions) => void;
  disabled?: boolean;
  aiProviderConfigured: boolean;
}

interface ToggleDef {
  key: Exclude<keyof RestorationOptions, "upscale" | "autoRestore">;
  label: string;
  description: string;
  aiOnly?: boolean;
}

const toggles: ToggleDef[] = [
  { key: "denoise", label: "Denoise", description: "Reduce grain & sensor noise" },
  { key: "deblur", label: "Deblur / Sharpen", description: "Recover crisp edges" },
  { key: "scratchCleanup", label: "Scratch & Dust Cleanup", description: "Smooth small print damage" },
  { key: "colorCorrection", label: "Color Correction", description: "Fix faded color & contrast" },
  { key: "faceEnhancement", label: "Face Detail Enhancement", description: "Extra clarity for portraits" },
  { key: "colorize", label: "Colorize Old Photo", description: "Add color to black & white photos", aiOnly: true },
];

const upscaleOptions: { value: UpscaleFactor; label: string }[] = [
  { value: "none", label: "Off" },
  { value: "2x", label: "2x" },
  { value: "4x", label: "4x" },
];

export function OptionsPanel({ options, onChange, disabled, aiProviderConfigured }: OptionsPanelProps) {
  function setKey<K extends keyof RestorationOptions>(key: K, value: RestorationOptions[K]) {
    onChange({ ...options, [key]: value });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
        <div>
          <p className="font-medium">Auto Restore</p>
          <p className="text-xs text-muted-foreground">Applies denoise, sharpen & color correction</p>
        </div>
        <Switch
          checked={options.autoRestore}
          onCheckedChange={(v) => setKey("autoRestore", v)}
          disabled={disabled}
          aria-label="Toggle auto restore"
        />
      </div>

      <div className="space-y-1">
        {toggles.map((t) => {
          const lockedNote = t.aiOnly && !aiProviderConfigured;
          return (
            <div
              key={t.key}
              className={cn(
                "flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 hover:bg-surface-muted",
                lockedNote && "opacity-80"
              )}
            >
              <div className="flex items-center gap-2">
                <div>
                  <p className="text-sm font-medium">{t.label}</p>
                  <p className="text-xs text-muted-foreground">{t.description}</p>
                </div>
                {lockedNote && (
                  <Tooltip label="Requires an AI provider — see Settings. Toggling this on will show a preview-only notice.">
                    <Badge variant="warning" className="gap-1">
                      <Info className="h-3 w-3" /> AI
                    </Badge>
                  </Tooltip>
                )}
              </div>
              <Switch
                checked={options[t.key] as boolean}
                onCheckedChange={(v) => setKey(t.key, v as never)}
                disabled={disabled}
                aria-label={`Toggle ${t.label}`}
              />
            </div>
          );
        })}
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Upscale</p>
        <div className="grid grid-cols-3 gap-2">
          {upscaleOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              disabled={disabled}
              onClick={() => setKey("upscale", opt.value)}
              className={cn(
                "rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
                options.upscale === opt.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-surface hover:bg-surface-muted"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
