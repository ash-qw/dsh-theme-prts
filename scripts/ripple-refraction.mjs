import sharp from 'sharp'

export async function createRippleRefractionMap() {
  const size = 96
  const pixels = Buffer.alloc(size * size * 3, 128)
  for (let vertical = 0; vertical < size; vertical++) {
    for (let horizontal = 0; horizontal < size; horizontal++) {
      const deltaX = horizontal + .5 - size / 2
      const deltaY = vertical + .5 - size / 2
      const radius = Math.hypot(deltaX, deltaY)
      const distance = radius - 40
      const edge = Math.max(0, Math.min(1, (47 - radius) / 3))
      const amplitude = Math.sin(distance * Math.PI / 5.5) * Math.exp(-((distance / 6.5) ** 2)) * .48 * edge * edge * (3 - 2 * edge)
      const offset = (vertical * size + horizontal) * 3
      pixels[offset] = Math.round(127.5 + 255 * amplitude * deltaX / radius)
      pixels[offset + 1] = Math.round(127.5 + 255 * amplitude * deltaY / radius)
    }
  }
  return sharp(pixels, { raw: { width: size, height: size, channels: 3 } }).png({ compressionLevel: 9, palette: true, dither: 0 }).toBuffer()
}
