# Image Restore — Product Spec

## 1. Summary
Image Restore is a web app that lets people upload old, damaged, blurry, noisy, scratched, faded, or low-resolution photos and get a cleaned-up, sharper version back. Users pick which restorations to apply, preview the result against the original with a before/after slider, and download the output. Nothing is uploaded to permanent storage unless the user explicitly opts in to keep local history.

## 2. Target users
Photographers, families restoring old prints, content creators, editors, and everyday users improving low-quality photos.

## 3. Core flow
1. User lands on the marketing homepage, understands what the tool does, clicks "Restore a Photo."
2. User drags/drops or picks a JPG/PNG/WEBP file (max 15MB).
3. App validates file type/size client- and server-side.
4. User selects restoration options (or uses "Auto Restore").
5. User clicks Restore → loading state → result appears.
6. User compares original vs. restored with a slider, downloads the result, or resets and tries again.
7. User may optionally save the result to local history (stored only in the browser, never on a server).

## 4. Restoration options
- **Auto Restore** — sensible default bundle (denoise + sharpen + color correction).
- **Denoise** — reduce grain/sensor noise.
- **Deblur / Sharpen** — recover edge detail.
- **Scratch & Dust Cleanup** — smooth out small print damage.
- **Color Correction** — fix faded color/contrast/white balance.
- **Face Detail Enhancement** — extra clarity pass (general-purpose, not face-detection-based in v1).
- **Colorize (old photo)** — AI-only feature; disabled with a clear tooltip unless a real AI provider key is configured.
- **Upscale 2x / 4x** — resize up using a high-quality resampling algorithm.

## 5. Honesty requirement (important)
This build ships **without** a paid AI image-restoration API key. So v1 uses a real, working **algorithmic image-processing pipeline** (sharpen/denoise/normalize/resize via `sharp`/libvips) — not a fake spinner that returns the same image. This is clearly labeled in the UI and README as "Standard Engine (algorithmic)" so users are never told they're getting AI restoration when they aren't. Colorization specifically requires real AI (there's no honest algorithmic way to colorize a B/W photo), so that option is visibly gated behind "Requires AI provider" rather than faked.

The service layer is provider-agnostic: swapping in Replicate / Stability AI / OpenAI later means writing one new class, not touching UI or API routes.

## 6. Privacy
- Uploaded images are processed in-memory on the server for a single request and are not written to disk or a database.
- "Recent Restores" history lives only in the browser (IndexedDB), is opt-in per result, and can be cleared at any time.
- This is stated plainly on the landing page and the workspace page.

## 7. Pages
- **/** — Landing page (hero, how-it-works, feature cards, before/after demo, privacy note, CTA).
- **/restore** — Workspace (upload, options, preview, compare, download).
- **/history** — Local-only recent restores (opt-in saves, clear-all).
- **/settings** — Explains current engine, how to configure a real AI provider via env vars.

## 8. Stack
Next.js 15 (App Router) + TypeScript + Tailwind CSS + shadcn-style UI components, `sharp` for server-side image processing, Vitest for unit tests, IndexedDB (via a tiny wrapper) for local history, next-themes for dark/light mode.

## 9. Non-goals (v1)
No accounts/auth, no payments, no server-side persistence of user images, no real ML-based colorization or face detection (clearly called out as future work behind the provider interface).
