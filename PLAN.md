# Implementation Plan

1. **Scaffold**: `create-next-app` (TS, Tailwind, App Router, ESLint), add `sharp`, `next-themes`, `idb-keyval`, `vitest`.
2. **lib/validation**: file type/size checks, shared between client and API route.
3. **lib/image-processing**: `RestorationService` interface, `RestorationOptions`/`RestorationResult` types, `AlgorithmicRestorationService` (sharp-based, implements every option honestly), provider stub files (`replicate.ts`, `stability.ts`) for future use, `getRestorationService()` factory that reads env vars.
4. **lib/storage**: IndexedDB wrapper for opt-in local history (id, thumbnail, options used, timestamp).
5. **app/api/restore/route.ts**: parses multipart form, validates, calls service, returns base64 result + processing meta + warnings.
6. **UI primitives**: button, card, slider, switch, toggle-group, tooltip, badge (shadcn-style, hand-rolled with Tailwind, no external registry fetch needed).
7. **Landing page** (`app/page.tsx`): hero, "how it works", feature grid, before/after demo (static sample images generated locally), privacy callout, footer CTA.
8. **Workspace page** (`app/restore/page.tsx`): dropzone + file picker, options panel, compare slider, loading/error states, download, reset, "save to history" opt-in.
9. **History page** (`app/history/page.tsx`): reads IndexedDB, grid of past restores, clear all / delete one.
10. **Settings page** (`app/settings/page.tsx`): shows active engine, env var instructions, links to `.env.example`.
11. **Tests**: Vitest for validation + AlgorithmicRestorationService (snapshot-free, checks dimensions/format change, option flags respected).
12. **Quality pass**: `npm run lint`, `npm run build`, `npm test`, fix all issues.
13. **Ship**: copy source to the project folder (excluding `node_modules`/`.next`), write README + `.env.example`, give run/push instructions.
