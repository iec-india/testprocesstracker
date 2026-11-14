export const compressImage = async (file) => {
  if (!file || !file.type || !file.type.startsWith('image/') || file.size < 256000) return file;

  try {
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Failed to read image file.'));
      reader.readAsDataURL(file);
    });

    const img = await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Failed to decode image file.'));
      image.src = dataUrl;
    });

    const canvas = document.createElement('canvas');
    let { width, height } = img;
    const MAX_SIZE = 1200;
    if (width > height && width > MAX_SIZE) {
      height *= MAX_SIZE / width;
      width = MAX_SIZE;
    } else if (height > MAX_SIZE) {
      width *= MAX_SIZE / height;
      height = MAX_SIZE;
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, width, height);

    // Prefer JPEG to maximize compatibility with storage backends.
    const tryConvert = async (mime, quality) => new Promise((resolve) => {
      canvas.toBlob((result) => resolve(result), mime, quality);
    });

    let blob = await tryConvert('image/jpeg', 0.85);
    let ext = '.jpg';
    if (!blob) {
      // fallback to WebP only if JPEG conversion isn't available
      blob = await tryConvert('image/webp', 0.8);
      ext = '.webp';
    }

    if (!blob) return file;

    return new File([blob], file.name.replace(/\.[^/.]+$/, '') + ext, {
      type: blob.type || (ext === '.webp' ? 'image/webp' : 'image/jpeg'),
      lastModified: Date.now()
    });
  } catch (error) {
    console.warn('Image compression skipped:', error);
    return file;
  }
};
