import api from './api';

function isImage(file: File) {
  return file && file.type && file.type.startsWith('image/');
}

async function blobFromImage(file: File, maxWidth = 1600, quality = 0.8): Promise<Blob> {
  // create an ImageBitmap for accurate sizing
  try {
    const imgBitmap = await createImageBitmap(await file.arrayBuffer().then(buf => new Blob([buf])));
    const ratio = imgBitmap.width / imgBitmap.height;
    let targetWidth = imgBitmap.width;
    let targetHeight = imgBitmap.height;
    if (imgBitmap.width > maxWidth) {
      targetWidth = maxWidth;
      targetHeight = Math.round(maxWidth / ratio);
    }
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported');
    ctx.drawImage(imgBitmap, 0, 0, targetWidth, targetHeight);

    // prefer webp when available
    const useWebP = HTMLCanvasElement.prototype.toBlob && (() => {
      try {
        // feature-detect by converting a tiny canvas to webp
        const c = document.createElement('canvas');
        c.width = c.height = 1;
        return c.toDataURL('image/webp').indexOf('data:image/webp') === 0;
      } catch { return false; }
    })();

    const mime = useWebP ? 'image/webp' : 'image/jpeg';
    return await new Promise<Blob>((res, rej) => {
      canvas.toBlob((b) => { if (b) res(b); else rej(new Error('toBlob returned null')); }, mime, quality);
    });
  } catch (err) {
    // fallback: return original file as blob
    return file;
  }
}

export async function uploadFile(file: File) {
  let fileToUpload: File | Blob = file;
  if (isImage(file)) {
    try {
      const blob = await blobFromImage(file);
      const ext = blob.type === 'image/webp' ? '.webp' : (file.name && file.name.split('.').pop() ? '.' + file.name.split('.').pop() : '');
      const name = (file.name && file.name.replace(/\.[^.]+$/, '')) || 'upload';
      fileToUpload = new File([blob], name + ext, { type: blob.type });
    } catch (e) {
      // ignore compression errors and use original
      fileToUpload = file;
    }
  }

  const fd = new FormData();
  fd.append('file', fileToUpload);
  const res = await api.post('/api/uploads', fd, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
}

export async function compressImageFile(file: File, maxWidth = 1600, quality = 0.8) {
  if (!isImage(file)) return file;
  const blob = await blobFromImage(file, maxWidth, quality);
  const ext = blob.type === 'image/webp' ? '.webp' : (file.name && file.name.split('.').pop() ? '.' + file.name.split('.').pop() : '');
  const name = (file.name && file.name.replace(/\.[^.]+$/, '')) || 'image';
  return new File([blob], name + ext, { type: blob.type });
}
