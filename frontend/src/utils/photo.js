// Downscale + compress a captured photo before it goes over the wire —
// raw camera captures can be several MB, and this app pushes photos as a
// base64 string inside a normal JSON POST (no multipart upload path exists
// in api.js), so keeping this small matters for both facility bandwidth
// and Vercel's request body limit.
export function fileToCompressedDataUrl(file, { maxDimension = 1024, quality = 0.75 } = {}) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read photo'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Could not decode photo'));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          const scale = maxDimension / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
