import { HfInference } from '@huggingface/inference'
import sharp from 'sharp'

function getClient() {
  return new HfInference(process.env.HUGGINGFACE_API_KEY)
}

const TIMEOUT_MS = 30_000

async function blobToBuffer(blob: Blob): Promise<Buffer> {
  return Buffer.from(await blob.arrayBuffer())
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('HF API timeout')), ms)
    ),
  ])
}

export async function faceEnhancement(input: Buffer): Promise<Buffer> {
  const hf = getClient()
  const blob = new Blob([input], { type: 'image/jpeg' })
  const result = await withTimeout(
    hf.imageToImage({ model: 'tencentarc/gfpgan', inputs: blob }),
    TIMEOUT_MS
  )
  return sharp(await blobToBuffer(result)).jpeg({ quality: 92 }).toBuffer()
}

export async function colorize(input: Buffer): Promise<Buffer> {
  const hf = getClient()
  const blob = new Blob([input], { type: 'image/jpeg' })
  const result = await withTimeout(
    hf.imageToImage({ model: 'Carve/colorization', inputs: blob }),
    TIMEOUT_MS
  )
  return sharp(await blobToBuffer(result)).jpeg({ quality: 92 }).toBuffer()
}

export async function upscale4x(input: Buffer): Promise<Buffer> {
  const hf = getClient()
  const blob = new Blob([input], { type: 'image/jpeg' })
  const result = await withTimeout(
    hf.imageToImage({
      model: 'caidas/swin2SR-realworld-sr-x4-64-bsrgan-psnr',
      inputs: blob,
    }),
    TIMEOUT_MS
  )
  return sharp(await blobToBuffer(result)).jpeg({ quality: 92 }).toBuffer()
}
