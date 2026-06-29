# VC Image Restore

> Professional AI-powered photo restoration — denoise, sharpen, colorize, and enhance old photographs in seconds. Built by **Varun Nagalla**.

![Version](https://img.shields.io/badge/version-1.0.0-6366f1?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript)
![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat-square&logo=vercel)
![License](https://img.shields.io/badge/License-Private-red?style=flat-square)

---

## What Is VC Image Restore?

**VC Image Restore** is a fully responsive, professional-grade web application for restoring and enhancing photographs. It combines:

- **Traditional image processing** (Sharp) — fast, always available, no API costs
- **Free AI models** (Hugging Face Inference API) — for colorization, face enhancement, and 4× super-resolution

Upload up to 10 photos, choose your enhancements, drag the before/after slider to compare, and download your results as JPEG. **Nothing is ever stored** — images are processed in memory and discarded immediately.

---

## Features

### Restoration Tools

| Feature | Engine | Description |
|---|---|---|
| Denoise | Traditional | Remove grain and noise from old photos |
| Sharpen / Deblur | Traditional | Bring back crisp detail from blurry images |
| Scratch Cleanup | Traditional | Erase surface scratches and dust marks |
| Color Correction | Traditional | Auto-balance exposure, contrast, and saturation |
| Face Enhancement | AI (GFPGAN) | Restore facial detail in portraits |
| Colorization | AI | Convert black-and-white photos to full color |
| 2× Upscale | Traditional | Double resolution with Lanczos3 interpolation |
| 4× Upscale | AI (SwinIR) | Quadruple resolution with AI super-resolution |

### Application Features

- Upload up to **10 images** per session
- Drag-and-drop upload with file validation
- **Before/after slider** — touch-enabled, works on all devices
- Per-image progress during batch processing
- Download individual images or **all as a ZIP**
- Output always as **JPEG (92% quality)**
- Fully **responsive** — mobile, tablet, and desktop
- **Name entry** on first visit — no account or sign-up required
- **Admin panel** — analytics, site settings, feature control

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Framework | Next.js 14 (App Router, TypeScript) | Frontend + serverless API routes |
| Styling | Tailwind CSS + shadcn/ui | Professional responsive UI |
| Traditional Processing | Sharp | Denoise, sharpen, scratch cleanup, upscale |
| AI Processing | Hugging Face Inference API | Colorization, face enhancement, 4× upscale |
| HEIC Conversion | heic2any | Client-side HEIC → JPEG before upload |
| Database | Supabase (PostgreSQL) | Session logs + admin site settings |
| Admin Auth | jose (JWT) + bcryptjs | Single admin, HttpOnly cookie |
| Notifications | Nodemailer (Gmail SMTP) | Admin email alerts + daily summaries |
| Deployment | Vercel | Free tier, cron jobs, serverless |

---

## Architecture

```
User uploads images (up to 10, any format)
         ↓
Browser converts HEIC files → JPEG (heic2any, no server needed)
         ↓
POST /api/process  (image buffer + selected enhancement options)
         ↓
 Sharp pipeline (server-side, in-memory):
   Denoise → Scratch Cleanup → Color Correction → Sharpen → 2× Upscale
         ↓
 HF Inference API (if AI features selected):
   Face Enhancement → Colorization → 4× Upscale
         ↓
JPEG (92% quality) streamed back to browser
         ↓
Buffer discarded — zero persistence, zero storage
         ↓
User downloads as JPEG  (individual or ZIP)
```

**What gets stored in Supabase:**
- Anonymous session logs: user name (self-entered), timestamp, features used, image count, device type
- Admin-configurable site settings (hero text, colors, etc.)
- Feature flags (on/off per feature)

**What never gets stored:** Images, email addresses, passwords, IP addresses beyond lockout tracking.

---

## Admin Panel

Single admin access at `/admin` — no registration, no password reset.

| Section | What You Can Do |
|---|---|
| **Dashboard** | View sessions today/week/all-time, images processed, 30-day activity chart, recent user activity |
| **History** | Search and filter all sessions by name, date, device — export as CSV |
| **Appearance** | Edit hero title, subtitle, CTA text, button color, background color, footer — with live preview |
| **Feature Flags** | Toggle any enhancement feature on or off sitewide instantly |

---

## Supported Input Formats

| Format | Extensions | Handling |
|---|---|---|
| JPEG | `.jpg`, `.jpeg` | Native (Sharp) |
| PNG | `.png` | Native (Sharp) |
| WebP | `.webp` | Native (Sharp) |
| TIFF | `.tiff`, `.tif` | Native (Sharp) |
| BMP | `.bmp` | Native (Sharp) |
| GIF | `.gif` | First frame (Sharp) |
| HEIC / HEIF | `.heic`, `.heif` | Converted to JPEG in browser |

> RAW camera files (`.cr2`, `.nef`, `.arw`, `.dng`, etc.) are not supported. Export from your camera software as JPEG or PNG first.

---

## Local Development

### Prerequisites

- Node.js ≥ 18.17
- [Supabase](https://supabase.com) project (free)
- [Hugging Face](https://huggingface.co) account and API token (free)
- Gmail with [App Password](https://myaccount.google.com/apppasswords) enabled

### Setup

```bash
# 1. Clone
git clone https://github.com/varunchowdary3345/VC-Image-Restore-App.git
cd VC-Image-Restore-App

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.local.example .env.local
# Fill in all values in .env.local (see table below)
```

### Environment Variables

| Variable | Description |
|---|---|
| `ADMIN_USERNAME` | Admin email (default: varunchowdary3345@gmail.com) |
| `ADMIN_PASSWORD_HASH` | bcrypt hash of admin password |
| `JWT_SECRET` | Random 32+ character string for signing JWT tokens |
| `NEXT_PUBLIC_SUPABASE_URL` | From Supabase project settings |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | From Supabase project settings |
| `SUPABASE_SERVICE_ROLE_KEY` | From Supabase project settings |
| `HUGGINGFACE_API_KEY` | Free token from huggingface.co/settings/tokens |
| `GMAIL_USER` | Gmail address for sending notifications |
| `GMAIL_APP_PASSWORD` | Gmail App Password (not your Gmail login password) |
| `CRON_SECRET` | Random string to authenticate the daily cron job |

**Generate admin password hash:**
```bash
node -e "require('bcryptjs').hash('YourPassword', 12).then(console.log)"
```

**Generate JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Database Setup

1. Go to your Supabase project → SQL Editor
2. Run the SQL from `supabase/migrations/001_initial.sql`
3. Create a Storage bucket named `admin-assets` (set to Public)

### Run

```bash
npm run dev
# → http://localhost:3000
```

### Tests

```bash
npm test          # Run Jest test suite
npx tsc --noEmit  # TypeScript type check
npm run build     # Verify production build
```

---

## Deployment

```bash
# Install Vercel CLI (once)
npm i -g vercel

# Deploy
vercel --prod
```

Add all environment variables in **Vercel → Project → Settings → Environment Variables**, then redeploy.

The daily summary email is sent automatically at midnight IST via Vercel Cron (configured in `vercel.json`).

---

## Email Notifications

The admin receives Gmail notifications for:

| Event | Description |
|---|---|
| New session | User name, device type, image count |
| Admin login | Security alert with timestamp |
| Feature flag change | Which feature, old → new value |
| AI processing failure | Graceful fallback was applied |
| Daily summary (midnight IST) | Sessions, images processed, top feature |

---

## Project Structure

```
├── app/
│   ├── page.tsx                    # Landing page (dynamic from site_settings)
│   ├── restore/page.tsx            # Restore workspace
│   ├── admin/
│   │   ├── page.tsx                # Admin login
│   │   └── dashboard/              # Protected admin panel
│   └── api/
│       ├── process/route.ts        # Image processing endpoint
│       ├── session/route.ts        # Session logging
│       ├── settings/route.ts       # Public site settings
│       └── admin/                  # Protected admin API routes
├── components/
│   ├── name-modal.tsx
│   ├── upload-zone.tsx
│   ├── enhancement-panel.tsx
│   ├── before-after-slider.tsx
│   ├── thumbnail-strip.tsx
│   └── admin/                      # Admin panel components
├── lib/
│   ├── processing/
│   │   ├── sharp.ts                # Traditional image processing
│   │   └── huggingface.ts          # AI model API calls
│   ├── auth/                       # JWT + bcrypt admin auth
│   ├── notifications/              # Nodemailer Gmail SMTP
│   └── supabase/                   # Database clients
├── middleware.ts                   # Protects /admin/dashboard/*
├── vercel.json                     # Cron job configuration
└── supabase/migrations/            # SQL schema and seed data
```

---

## Security

- Admin password stored as **bcrypt hash** in environment variables — never in source code
- JWT tokens are **HttpOnly cookies** — inaccessible to JavaScript
- **Brute-force protection**: 5 failed logins → 15-minute IP lockout
- HF API key is **server-side only** — never sent to the browser
- All `/admin/dashboard/*` routes protected by **Next.js middleware**
- Zero image data stored anywhere at any time

---

## Privacy

- Uploaded images exist only in memory for the duration of one API request
- No image data is written to disk, database, or logs
- Session logs contain only: name (user-entered), timestamp, features used, image count, device type
- No cookies set for public users — only admin receives an auth cookie

---

## Roadmap (Future)

- [ ] Object/background removal
- [ ] Watermark toggle (admin-controlled)
- [ ] Restoration presets (Old Photo, Portrait, Landscape)
- [ ] User accounts with cross-device history sync
- [ ] Developer API access

---

## License

**Private — All Rights Reserved**

© Varun Nagalla. Unauthorized use, reproduction, or distribution of this software is strictly prohibited.

---

*VC Image Restore — Restore your memories.*
