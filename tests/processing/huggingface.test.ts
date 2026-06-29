import { describe, it, expect, vi } from 'vitest'
import { faceEnhancement, colorize, upscale4x } from '@/lib/processing/huggingface'

vi.mock('@huggingface/inference', () => ({
  HfInference: vi.fn().mockImplementation(() => ({
    imageToImage: vi.fn().mockResolvedValue(new Blob([Buffer.from('fakeimagedata')])),
  })),
}))

const fakeBuf = Buffer.from('fakeimagedata')

describe('HF API wrappers', () => {
  it('faceEnhancement returns a Buffer', async () => {
    const result = await faceEnhancement(fakeBuf)
    expect(Buffer.isBuffer(result)).toBe(true)
  })

  it('colorize returns a Buffer', async () => {
    const result = await colorize(fakeBuf)
    expect(Buffer.isBuffer(result)).toBe(true)
  })

  it('upscale4x returns a Buffer', async () => {
    const result = await upscale4x(fakeBuf)
    expect(Buffer.isBuffer(result)).toBe(true)
  })
})
