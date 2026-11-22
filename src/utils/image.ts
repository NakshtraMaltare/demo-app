export interface PreparedImage {
  dataUrl: string;
  base64: string;
  mimeType: string;
  width: number;
  height: number;
  fileName: string;
}

/**
 * Reads an image file and scales it down to max 1600px on the longest edge
 * so uploads stay crisp for Gemini vision analysis while remaining fast over HTTP.
 */
export function preparePlantImage(file: File): Promise<PreparedImage> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Please select a valid image file (JPG, PNG, or WebP).'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read the selected image file.'));
    reader.onload = () => {
      const rawDataUrl = reader.result as string;
      const img = new Image();
      img.onerror = () => reject(new Error('The selected image could not be decoded.'));
      img.onload = () => {
        const maxEdge = 1600;
        let { width, height } = img;

        if (width > maxEdge || height > maxEdge) {
          if (width >= height) {
            height = Math.round((height * maxEdge) / width);
            width = maxEdge;
          } else {
            width = Math.round((width * maxEdge) / height);
            height = maxEdge;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          const base64 = rawDataUrl.split(',')[1] ?? '';
          resolve({
            dataUrl: rawDataUrl,
            base64,
            mimeType: file.type || 'image/jpeg',
            width: img.naturalWidth,
            height: img.naturalHeight,
            fileName: file.name,
          });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const outputMime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(outputMime, 0.88);
        const base64 = dataUrl.split(',')[1] ?? '';

        resolve({
          dataUrl,
          base64,
          mimeType: outputMime,
          width,
          height,
          fileName: file.name,
        });
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  });
}
