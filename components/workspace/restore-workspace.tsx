"use client";

import * as React from "react";
import { Download, RefreshCcw, Loader2, AlertTriangle, Save, CheckCircle2 } from "lucide-react";
import { Dropzone } from "./dropzone";
import { OptionsPanel } from "./options-panel";
import { CompareSlider } from "./compare-slider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DEFAULT_OPTIONS, RestorationOptions, RestorationResult } from "@/types";
import { fileToDataUrl, createThumbnail } from "@/lib/utils/image-client";
import { saveHistoryEntry } from "@/lib/storage/history-store";
import { generateId } from "@/lib/utils/id";

type Status = "idle" | "restoring" | "done" | "error";

export function RestoreWorkspace({ aiProviderConfigured }: { aiProviderConfigured: boolean }) {
  const [file, setFile] = React.useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = React.useState<string | null>(null);
  const [options, setOptions] = React.useState<RestorationOptions>(DEFAULT_OPTIONS);
  const [status, setStatus] = React.useState<Status>("idle");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<RestorationResult | null>(null);
  const [saved, setSaved] = React.useState(false);

  async function handleFileSelected(selected: File) {
    setFile(selected);
    setResult(null);
    setSaved(false);
    setStatus("idle");
    setErrorMessage(null);
    const preview = await fileToDataUrl(selected);
    setOriginalPreview(preview);
  }

  function handleError(message: string) {
    setErrorMessage(message);
    setStatus("error");
  }

  async function handleRestore() {
    if (!file) return;
    setStatus("restoring");
    setErrorMessage(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("options", JSON.stringify(options));

      const res = await fetch("/api/restore", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error ?? "Restoration failed.");
      }

      setResult(data as RestorationResult);
      setStatus("done");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  function handleReset() {
    setFile(null);
    setOriginalPreview(null);
    setResult(null);
    setStatus("idle");
    setErrorMessage(null);
    setSaved(false);
    setOptions(DEFAULT_OPTIONS);
  }

  function handleDownload() {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result.dataUrl;
    a.download = `restored-${Date.now()}.${result.mimeType === "image/png" ? "png" : "jpg"}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  async function handleSaveToHistory() {
    if (!result || !originalPreview) return;
    const [originalThumbnail, restoredThumbnail] = await Promise.all([
      createThumbnail(originalPreview),
      createThumbnail(result.dataUrl),
    ]);
    await saveHistoryEntry({
      id: generateId(),
      createdAt: Date.now(),
      originalThumbnail,
      restoredThumbnail,
      optionsUsed: options,
      engine: result.meta.engine,
    });
    setSaved(true);
  }

  const isRestoring = status === "restoring";

  return (
    <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
      <Card className="h-fit lg:sticky lg:top-24">
        <CardContent className="space-y-6">
          <div>
            <h2 className="font-semibold">Restoration options</h2>
            <p className="text-sm text-muted-foreground">Pick what this photo needs</p>
          </div>
          <OptionsPanel
            options={options}
            onChange={setOptions}
            disabled={!file || isRestoring}
            aiProviderConfigured={aiProviderConfigured}
          />
          <div className="flex flex-col gap-2 border-t border-border pt-4">
            <Button onClick={handleRestore} disabled={!file || isRestoring} size="lg">
              {isRestoring ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Restoring…
                </>
              ) : (
                "Restore Photo"
              )}
            </Button>
            <Button onClick={handleReset} variant="outline" disabled={!file && status === "idle"}>
              <RefreshCcw className="h-4 w-4" /> Reset
            </Button>
          </div>
          {!aiProviderConfigured && (
            <p className="text-xs text-muted-foreground">
              Running on the <strong>Standard Engine</strong> (algorithmic, no AI key configured). See{" "}
              <a href="/settings" className="underline">Settings</a> to connect a real AI provider.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="space-y-6">
        {!originalPreview && (
          <Dropzone onFileSelected={handleFileSelected} onError={handleError} disabled={isRestoring} />
        )}

        {errorMessage && (
          <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{errorMessage}</p>
          </div>
        )}

        {originalPreview && !result && (
          <Card>
            <CardContent>
              <p className="mb-3 text-sm font-medium text-muted-foreground">Original photo</p>
              <div className="overflow-hidden rounded-2xl border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={originalPreview} alt="Original upload preview" className="w-full" />
              </div>
              {isRestoring && (
                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Processing your photo…
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {result && originalPreview && (
          <Card>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-muted-foreground">Drag to compare</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">
                    {result.meta.width}×{result.meta.height}px
                  </Badge>
                  <Badge variant={result.meta.engine === "algorithmic-v1" ? "default" : "success"}>
                    {result.meta.engine === "algorithmic-v1" ? "Standard Engine" : result.meta.engine}
                  </Badge>
                </div>
              </div>

              <CompareSlider
                before={
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={originalPreview} alt="Original" className="h-full w-full object-cover" />
                }
                after={
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={result.dataUrl} alt="Restored" className="h-full w-full object-cover" />
                }
              />

              {result.meta.warnings.length > 0 && (
                <div className="space-y-1.5 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
                  {result.meta.warnings.map((w) => (
                    <p key={w.option} className="flex items-start gap-2 text-xs text-amber-600 dark:text-amber-400">
                      <Info />
                      {w.message}
                    </p>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-3 pt-2">
                <Button onClick={handleDownload}>
                  <Download className="h-4 w-4" /> Download
                </Button>
                <Button onClick={handleSaveToHistory} variant="secondary" disabled={saved}>
                  {saved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                  {saved ? "Saved to History" : "Save to History"}
                </Button>
                <Button onClick={handleReset} variant="outline">
                  <RefreshCcw className="h-4 w-4" /> Restore another
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Saving to history stores this photo only in your browser. Nothing is uploaded permanently.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function Info() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path d="M12 8V8.01M12 11V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
