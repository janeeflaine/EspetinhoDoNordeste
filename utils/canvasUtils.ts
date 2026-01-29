export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  flip = { horizontal: false, vertical: false }
): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return '';
  }

  // Resize to max 600px for storage efficiency
  const maxDimension = 600;
  let { width, height } = pixelCrop;

  if (width > maxDimension || height > maxDimension) {
    const ratio = width / height;
    if (width > height) {
      width = maxDimension;
      height = maxDimension / ratio;
    } else {
      height = maxDimension;
      width = maxDimension * ratio;
    }
  }

  canvas.width = width;
  canvas.height = height;

  // Use distinct variable for context to avoid null checks repeatedly
  const context = ctx;

  // High quality smoothing
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';

  // Draw and scale
  // We need to draw the portion of the source image defined by pixelCrop
  // onto the destination canvas size (width, height)
  context.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    width,
    height
  );

  // As Base64 string with reduced quality
  return canvas.toDataURL('image/jpeg', 0.7);
}