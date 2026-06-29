import sharp from 'sharp'

export async function denoise(input: Buffer): Promise<Buffer> {
  // Light median for salt-and-pepper noise — no blur, preserves edges
  return sharp(input)
    .median(1)
    .png({ compressionLevel: 1 })
    .toBuffer()
}

export async function sharpenImage(input: Buffer): Promise<Buffer> {
  return sharp(input)
    .sharpen({ sigma: 0.8, m1: 2.0, m2: 4.0 })
    .png({ compressionLevel: 1 })
    .toBuffer()
}

export async function scratchCleanup(input: Buffer): Promise<Buffer> {
  // Gentle 3x3 median to knock out isolated scratch pixels without blurring
  return sharp(input)
    .median(3)
    .png({ compressionLevel: 1 })
    .toBuffer()
}

export async function colorCorrection(input: Buffer): Promise<Buffer> {
  return sharp(input)
    .normalise()
    .modulate({ saturation: 1.2, brightness: 1.05 })
    .png({ compressionLevel: 1 })
    .toBuffer()
}

export async function upscale2x(input: Buffer): Promise<Buffer> {
  const { width = 100, height = 100 } = await sharp(input).metadata()
  return sharp(input)
    .resize({ width: width * 2, height: height * 2, kernel: 'lanczos3', fit: 'fill' })
    .png({ compressionLevel: 1 })
    .toBuffer()
}

export async function toJpeg(input: Buffer): Promise<Buffer> {
  return sharp(input).jpeg({ quality: 92 }).toBuffer()
}
