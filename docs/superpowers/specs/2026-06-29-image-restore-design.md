# Image Restore — Design Spec
**Date:** 2026-06-29  
**Author:** Varun Nagalla  
**Copyright:** © Varun Nagalla. All rights reserved.

---

## What We Are Building

A professional, fully responsive web application that restores and enhances photos using a hybrid approach: traditional image processing algorithms for speed and reliability, and free AI APIs for features that genuinely require machine learning (colorization and face enhancement). Images are **never stored** — they are processed entirely in memory and returned to the user as JPEG downloads.

The app has two distinct areas:
1. **Public workspace** — anyone can use it (name required on first visit); upload, enhance, download
2. **Admin panel** — single admin login only; view usage history, manage site appearance, control feature flags

---

## Working Instructions (How to Continue This Project in Any Session)

Paste this into any new Claude Code session to instantly resume:

> "I am building Image Restore — a professional photo restoration web app by Varun Nagalla. The design spec is at `docs/superpowers/specs/2026-06-29-image-restore-design.md`. Read it fully before doing anything. The stack is Next.js 14 (App Router, TypeScript), Tailwind CSS, shadcn/ui, Sharp for image processing, Hugging Face Inference API (free tier) for AI features, and Supabase for admin data only. Deploy target is Vercel. Images are NEVER stored — process in memory only. Follow the implementation plan at `docs/superpowers/plans/` if it exists."

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Framework | Next.js 14 (App Router, TypeScript) | Frontend + API routes |
| Styling | Tailwind CSS + shadcn/ui | Responsive, professional UI |
| Image Processing | Sharp (Node.js) | Traditional features server-side |
| AI Processing | Hugging Face Inference API (free tier) | Colorization, face enhancement, 4x upscale |
| HEIC Conversion | `heic2any` (browser) | Convert HEIC/HEIF before upload |
| RAW Conversion | `libraw.js` WASM (browser) | Convert RAW camera formats before upload |
| Database | Supabase (PostgreSQL) | Usage logs, site settings, feature flags |
| Admin Auth | JWT via `jose` | Signed cookie, 24hr expiry |
| Deployment | Vercel (free tier) | Frontend + serverless API routes |

---

## Architecture

### Processing Flow

```
User selects images (any format, max 10)
        ↓
Browser pre-converts HEIC/RAW → PNG (client-side, heic2any / libraw.js)
        ↓
POST /api/process (image buffer + selected features)
        ↓
Sharp handles: Denoise → Scratch Cleanup → Color Correction → Sharpen → 2x Upscale
HF API handles: Face Enhancement (CodeFormer) → Colorization → 4x Upscale
        ↓
Result converted to JPEG (92% quality) in memory
        ↓
JPEG streamed back to browser
        ↓
Buffer discarded — nothing written to disk or database
        ↓
User downloads as JPEG (individual or zip batch)
```

### What Goes to Supabase

- `sessions` — name, timestamp, features used, image count, device type
- `site_settings` — admin-configurable appearance and content
- `feature_flags` — per-feature on/off toggles
- `login_attempts` — brute-force protection for admin login
- **No image data. Ever.**

---

## Pages & UI

### `/` — Landing Page
- On first visit: full-screen modal requiring user name (stored in `localStorage`, not re-asked)
- Hero section: tagline, feature highlights, "Start Restoring" CTA button
- Responsive header with logo and nav
- Footer: © Varun Nagalla

### `/restore` — Main Workspace
- **Upload zone**: drag-and-drop or click; accepts all formats; max 10 images; shows file count badge
- **Enhancement panel** (applied to full batch):
  - Toggles: Denoise, Sharpen/Deblur, Scratch Cleanup, Color Correction
  - Toggles: Face Enhancement (AI), Colorization (AI)
  - Selector: None / 2x Upscale / 4x Upscale (AI)
- **Preview area**: before/after slider for the selected image; horizontal thumbnail strip to switch between images
- **Progress**: per-image progress indicator during batch processing (sequential)
- **Download**: "Download All as JPEG" (zip) and individual download buttons
- Touch-enabled slider and scrollable thumbnail strip for mobile

### `/admin` — Admin Login
- Centered login form (username + password)
- No sign-up, no forgot password
- Brute-force lockout: 5 failed attempts → 15-minute lockout

### `/admin/dashboard` — Admin Panel (protected)
Sidebar navigation with four sections:

**1. Dashboard**
- Cards: Sessions Today / This Week / All Time, Images Processed, Most Used Feature
- Line chart: sessions over last 30 days
- Recent activity feed

**2. History**
- Searchable, sortable table: Name | Date & Time | Features Used | Images Processed | Device
- Filter by date range, feature, device type
- Export to CSV

**3. Appearance**
- Live-preview editor: background color/gradient, hero text, CTA text/color, footer text, logo upload (stored in Supabase Storage bucket `admin-assets`, public URL saved to `site_settings` under key `logo_url`)
- "Save & Publish" updates `site_settings` table; frontend reads on each request via Supabase anon key

**4. Feature Flags**
- Toggle individual features on/off sitewide
- Adjust max batch size (1–10, default 10)
- Adjust max file size per image (default 20MB)

---

## Features & Processing Pipeline

### Supported Input Formats

| Group | Formats | Handler |
|---|---|---|
| Standard | JPEG, PNG, WEBP, TIFF, BMP, GIF | Sharp (server-side, native) |
| HEIC/HEIF | `.heic`, `.heif` | `heic2any` (browser, pre-upload) |
| RAW | `.cr2`, `.cr3`, `.nef`, `.arw`, `.dng`, `.orf`, `.rw2`, `.raf`, `.pef` | `libraw.js` WASM (browser, pre-upload) |

### Feature Implementation

| Feature | Type | Implementation |
|---|---|---|
| Denoise | Traditional | `sharp().median(3)` + mild blur |
| Sharpen / Deblur | Traditional | `sharp().sharpen({ sigma: 1.5, flat: 0.5, jagged: 0.8 })` |
| Scratch Cleanup | Traditional | Detect bright anomalies via threshold → dilate mask → composite median-blurred fill over original |
| Color Correction | Traditional | `sharp().normalise().modulate({ saturation: 1.2, brightness: 1.05 })` |
| 2x Upscale | Traditional | `sharp().resize()` with `lanczos3` kernel |
| Face Enhancement | AI (HF) | `sczhou/CodeFormer` |
| Colorization | AI (HF) | `Carve/colorization` |
| 4x Upscale | AI (HF) | `caidas/swin2SR-realworld-sr-x4-64-bsrgan-psnr` |

### Processing Order (always applied in this sequence)

```
Denoise → Scratch Cleanup → Color Correction → Sharpen
→ Face Enhancement (AI) → Colorization (AI) → Upscale (2x or 4x)
```

### Constraints
- Max 10 images per batch
- Max 20MB per image
- Output: JPEG only, 92% quality
- AI calls: 30s timeout; graceful error toast on failure
- Batch processing: sequential (one at a time) to respect Vercel's 60s function timeout

---

## Data Model

### `sessions`
```sql
id            uuid        PRIMARY KEY DEFAULT gen_random_uuid()
user_name     text        NOT NULL
device_type   text        NOT NULL  -- 'mobile' | 'tablet' | 'desktop'
features_used text[]      NOT NULL  -- e.g. ['denoise', 'colorization', '4x_upscale']
image_count   integer     NOT NULL
created_at    timestamptz NOT NULL DEFAULT now()
```

### `site_settings`
```sql
key           text        PRIMARY KEY
value         text        NOT NULL
updated_at    timestamptz NOT NULL DEFAULT now()
```
Default keys: `bg_color`, `hero_title`, `hero_subtitle`, `cta_text`, `cta_color`, `footer_text`

### `login_attempts`
```sql
ip_address    text        NOT NULL
attempt_count integer     NOT NULL DEFAULT 1
locked_until  timestamptz
last_attempt  timestamptz NOT NULL DEFAULT now()
```

### `feature_flags`
```sql
feature_name  text        PRIMARY KEY
enabled       boolean     NOT NULL DEFAULT true
updated_at    timestamptz NOT NULL DEFAULT now()
```

---

## Security

- Admin credentials stored as environment variables (`ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH` bcrypt)
- JWT signed with `JWT_SECRET`, set as HttpOnly cookie, 24hr expiry
- All `/admin/*` routes protected by Next.js middleware
- No admin route accessible without valid JWT
- Brute-force protection: 5 failed logins → 15-minute lockout (tracked in `login_attempts`)
- HF API key stored server-side only (never exposed to browser)
- Supabase service role key server-side only; anon key used for public reads of `site_settings`

---

## Environment Variables

```
ADMIN_USERNAME=varunchowdary3345@gmail.com
ADMIN_PASSWORD_HASH=          # bcrypt hash — never store plaintext password here
JWT_SECRET=                   # random 32+ character string
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
HUGGINGFACE_API_KEY=          # free tier HF token
GMAIL_USER=varunchowdary3345@gmail.com
GMAIL_APP_PASSWORD=           # Gmail App Password (NOT the Gmail account password — generate at myaccount.google.com/apppasswords)
```

> **Security note:** Never commit real passwords to code or git. Store all secrets in Vercel environment variables dashboard only. The admin password must be bcrypt-hashed before storing. The Gmail App Password is separate from the Gmail login password and can be revoked independently.

---

## Gmail Notifications

The admin (`varunchowdary3345@gmail.com`) receives email notifications for key events.

**Implementation:** Nodemailer with Gmail SMTP using a **Gmail App Password** (generated at `myaccount.google.com/apppasswords` — this is separate from the Gmail login password and scoped only to this app).

**Notification triggers:**
| Event | Email Content |
|---|---|
| New session started | User name, timestamp, device type |
| Daily summary (midnight) | Sessions count, images processed, most-used features |
| Feature flag changed | Which flag, old value → new value, timestamp |
| Admin login | Timestamp, IP address (security alert) |
| HF API failure | Which feature failed, error message, timestamp |

**Daily summary** is triggered by a Vercel Cron Job (`vercel.json` cron config) running at midnight IST.

**Setup required:** Admin must generate a Gmail App Password at `myaccount.google.com/apppasswords` (requires 2FA enabled on Gmail), then add it to Vercel env vars as `GMAIL_APP_PASSWORD`. This is NOT the Gmail account password.

## Responsive Design

- Mobile-first layout throughout
- Upload zone and enhancement panel stack vertically on mobile
- Before/after slider is touch-enabled
- Thumbnail strip scrolls horizontally on mobile
- Admin panel sidebar collapses to bottom nav on mobile
- Tested breakpoints: 320px (small phone), 768px (tablet), 1024px (desktop), 1440px (large desktop)

---

## Future Features (Not V1)

- Object/person removal with background fill
- User accounts with cross-device history sync
- Batch download as ZIP with custom filename prefix
- Watermark toggle (admin-controlled)
- Restoration presets (e.g., "Old Photo", "Portrait", "Landscape")
- API access for developers

---

## Copyright

© Varun Nagalla. All rights reserved.  
All pages must display this copyright in the footer.
