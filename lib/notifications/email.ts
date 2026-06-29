import nodemailer from 'nodemailer'
import type { NotifyPayload } from '@/lib/types'

function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })
}

const TO = process.env.NOTIFY_EMAIL ?? process.env.GMAIL_USER ?? ''

function subjectFor(event: NotifyPayload['event']): string {
  switch (event) {
    case 'session': return 'VC Image Restore — New session'
    case 'login': return 'VC Image Restore — Admin login'
    case 'flag_change': return 'VC Image Restore — Feature flag changed'
    case 'hf_failure': return 'VC Image Restore — AI processing failure'
    case 'daily_summary': return 'VC Image Restore — Daily summary'
    default: return 'VC Image Restore — Notification'
  }
}

function bodyFor({ event, data }: NotifyPayload): string {
  const timestamp = new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })
  const rows = Object.entries(data).map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#6b7280;font-size:13px">${k}</td><td style="padding:4px 0;font-size:13px">${String(v)}</td></tr>`).join('')

  return `
<!DOCTYPE html>
<html>
<body style="font-family:system-ui,sans-serif;background:#0f0f10;color:#fff;padding:32px;margin:0">
  <div style="max-width:480px;margin:0 auto">
    <h2 style="color:#818cf8;margin:0 0 16px">${subjectFor(event)}</h2>
    <table style="border-collapse:collapse;width:100%">${rows}</table>
    <p style="color:#4b5563;font-size:11px;margin-top:24px">Sent: ${timestamp}</p>
    <p style="color:#374151;font-size:11px">© Varun Nagalla. All rights reserved.</p>
  </div>
</body>
</html>`
}

export async function sendNotification(payload: NotifyPayload): Promise<void> {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return
  const transporter = createTransporter()
  await transporter.sendMail({
    from: `"VC Image Restore" <${process.env.GMAIL_USER}>`,
    to: TO,
    subject: subjectFor(payload.event),
    html: bodyFor(payload),
  })
}
