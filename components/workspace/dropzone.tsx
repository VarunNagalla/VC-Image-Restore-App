"use client";

import * as React from "react";
import { UploadCloud, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { validateImageFile } from "@/lib/validation/file-validation";

export interface DropzoneProps {
  onFileSelected: (file: File) => void;
  onError: (message: string) => void;
  disabled?: boolean;
}

export function Dropzone({ onFileSelected, onError, disabled }: DropzoneProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    const result = validateImageFile(file);
    if (!result.valid) {
      onError(result.error ?? "Invalid file.");
      return;
    }
    onFileSelected(file);
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-surface-muted/50 px-6 py-16 text-center transition-colors",
        isDragging && "border-primary bg-primary/5",
        disabled && "pointer-events-none opacity-50"
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <UploadCloud className="h-7 w-7" />
      </span>
      <div>
        <p className="font-medium">Drag & drop your photo here</p>
        <p className="text-sm text-muted-foreground">or click below to browse — JPG, PNG, WEBP up to 15MB</p>
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className="mt-2 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
      >
        <ImageIcon className="h-4 w-4" /> Choose a photo
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
