import { describe, it, expect, beforeAll } from 'vitest'
import sharpLib from 'sharp'
import { denoise, sharpenImage, scratchCleanup, colorCorrection, upscale2x, toJpeg } from '@/lib/processing/sharp'

let testBuf: Buffer

beforeAll(async () => {
  // Create a minimal 20x20 JPEG test buffer in memory
  testBuf = await sharpLib({
    create: { width: 20, height: 20, channels: 3, background: { r: 128, g: 100, b: 80 } }
  }).jpeg({ quality: 80 }).toBuffer()
})

async function isJpeg(buf: Buffer) {
  const meta = await sharpLib(buf).metadata()
  return meta.format === 'jpeg'
}

describe('Sharp processing pipeline', () => {
  it('denoise returns a valid JPEG buffer', async () => {
    const out = await denoise(testBuf)
    expect(Buffer.isBuffer(out)).toBe(true)
    expect(await isJpeg(out)).toBe(true)
  })

  it('sharpenImage returns a valid JPEG buffer', async () => {
    const out = await sharpenImage(testBuf)
    expect(Buffer.isBuffer(out)).toBe(true)
    expect(await isJpeg(out)).toBe(true)
  })

  it('scratchCleanup returns a valid JPEG buffer', async () => {
    const out = await scratchCleanup(testBuf)
    expect(Buffer.isBuffer(out)).toBe(true)
    expect(await isJpeg(out)).toBe(true)
  })

  it('colorCorrection returns a valid JPEG buffer', async () => {
    const out = await colorCorrection(testBuf)
    expect(Buffer.isBuffer(out)).toBe(true)
    expect(await isJpeg(out)).toBe(true)
  })

  it('upscale2x doubles dimensions', async () => {
    const { width: w0, height: h0 } = await sharpLib(testBuf).metadata()
    const out = await upscale2x(testBuf)
    const { width, height } = await sharpLib(out).metadata()
    expect(width).toBe((w0 ?? 1) * 2)
    expect(height).toBe((h0 ?? 1) * 2)
  })

  it('toJpeg outputs JPEG', async () => {
    const out = await toJpeg(testBuf)
    expect(await isJpeg(out)).toBe(true)
  })
})
