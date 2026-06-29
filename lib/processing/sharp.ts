import sharp from 'sharp'

export async function denoise(input: Buffer): Promise<Buffer> {
  return sharp(input)
    .median(3)
    .blur(0.4)
    .jpeg({ quality: 92 })
    .toBuffer()
}

export async function sharpenImage(input: Buffer): Promise<Buffer> {
  return sharp(input)
    .sharpen({ sigma: 1.5, m1: 0.5, m2: 0.8 })
    .jpeg({ quality: 92 })
    .toBuffer()
}

export async function scratchCleanup(input: Buffer): Promise<Buffer> {
  return sharp(input)
    .median(5)
    .jpeg({ quality: 92 })
    .toBuffer()
}

export async function colorCorrection(input: Buffer): Promise<Buffer> {
  return sharp(input)
    .normalise()
    .modulate({ saturation: 1.2, brightness: 1.05 })
    .jpeg({ quality: 92 })
    .toBuffer()
}

export async function upscale2x(input: Buffer): Promise<Buffer> {
  const { width = 100, height = 100 } = await sharp(input).metadata()
  return sharp(input)
    .resize({ width: width * 2, height: height * 2, kernel: 'lanczos3', fit: 'fill' })
    .jpeg({ quality: 92 })
    .toBuffer()
}

export async function toJpeg(input: Buffer): Promise<Buffer> {
  return sharp(input).jpeg({ quality: 92 }).toBuffer()
}
