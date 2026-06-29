import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";

export const metadata: Metadata = {
  title: "Image Restore — Bring old photos back to life",
  description:
    "Restore old, blurry, scratched, faded, or low-resolution photos with denoise, sharpen, color correction, upscaling, and more. Your photos are processed in memory and never stored without your permission.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
