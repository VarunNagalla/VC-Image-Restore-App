import {
  Wand2,
  Sparkles,
  Scissors,
  Palette,
  ScanFace,
  Paintbrush,
  ZoomIn,
  Eraser,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  { icon: Eraser, title: "Denoise", description: "Cleans up grain and sensor noise without smearing detail." },
  { icon: Wand2, title: "Deblur & Sharpen", description: "Recovers crisp edges from soft, out-of-focus shots." },
  { icon: Scissors, title: "Scratch & Dust Cleanup", description: "Smooths over small scratches, specks, and print damage." },
  { icon: Palette, title: "Color Correction", description: "Fixes faded color, contrast, and white balance." },
  { icon: ScanFace, title: "Face Detail Enhancement", description: "An extra clarity pass tuned for portraits." },
  { icon: Paintbrush, title: "Colorize (AI)", description: "Bring black & white photos to life — connect an AI provider to enable." },
  { icon: ZoomIn, title: "2x / 4x Upscale", description: "Enlarge low-resolution photos with high-quality resampling." },
  { icon: Sparkles, title: "Auto Restore", description: "One click applies a sensible bundle of fixes for most old photos." },
];

export function FeatureGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {features.map((f) => (
        <Card key={f.title} className="transition-transform hover:-translate-y-0.5">
          <CardContent className="flex flex-col gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <f.icon className="h-5 w-5" />
            </span>
            <h3 className="font-semibold">{f.title}</h3>
            <p className="text-sm text-muted-foreground">{f.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
