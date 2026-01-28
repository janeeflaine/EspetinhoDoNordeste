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

  // set canvas size to match the bounding box
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // draw the image
  ctx.translate(-pixelCrop.x, -pixelCrop.y);
  
  // flip logic if needed (optional)
  // ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);

  ctx.drawImage(
    image,
    0,
    0,
    image.width,
    image.height
  );

  // As Base64 string
  return canvas.toDataURL('image/jpeg', 0.9);
}