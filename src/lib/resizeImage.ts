'use client'

/**
 * Resizes and compresses an image file in the browser before it ever
 * gets uploaded — keeps avatar uploads small (a phone photo straight
 * out of a camera can be 5-10MB; nobody needs that for a 56px avatar
 * circle) and comfortably under both our own API route's size limit
 * and Vercel's request body size limit for serverless functions.
 *
 * Returns a JPEG data URL, square-cropped to `maxDimension`.
 */
export function resizeImageFile(file: File, maxDimension = 512, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onerror = () => reject(new Error('Could not read the selected file'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('That file doesn\'t look like a valid image'))
      img.onload = () => {
        // Center-crop to a square first, so the avatar circle doesn't
        // squash a non-square photo.
        const side = Math.min(img.width, img.height)
        const sx = (img.width - side) / 2
        const sy = (img.height - side) / 2

        const outputSide = Math.min(side, maxDimension)
        const canvas = document.createElement('canvas')
        canvas.width = outputSide
        canvas.height = outputSide

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Canvas not supported in this browser'))
          return
        }

        ctx.drawImage(img, sx, sy, side, side, 0, 0, outputSide, outputSide)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.src = reader.result as string
    }

    reader.readAsDataURL(file)
  })
}
