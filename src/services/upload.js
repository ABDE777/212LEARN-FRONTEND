import api from './api';

// Cloudinary Free-plan cap for image/raw is 10 MB.
const MAX_BYTES = 10 * 1024 * 1024;

/**
 * Upload a file (image or PDF) straight to Cloudinary via the backend's signed
 * endpoint, bypassing Vercel's 4.5 MB API body limit. Returns the secure_url,
 * which the backend accepts because it is one of our Cloudinary URLs.
 * @param {File} file
 * @returns {Promise<string>} secure_url
 */
export async function uploadToCloudinary(file) {
  if (!file) throw new Error('Aucun fichier sélectionné.');

  const isImage = file.type.startsWith('image/');
  const isPdf = file.type === 'application/pdf';
  if (!isImage && !isPdf) {
    throw new Error('Format non supporté. Utilisez une image (JPG, PNG, WebP) ou un PDF.');
  }
  if (file.size > MAX_BYTES) {
    throw new Error('Le fichier ne doit pas dépasser 10 Mo.');
  }

  const signRes = await api.post('/uploads/cloudinary-sign', {
    type: isImage ? 'image' : 'pdf',
    filename: file.name,
    mimetype: file.type,
  });
  const sign = signRes.data?.data || signRes.data;
  if (!sign?.uploadUrl) {
    throw new Error('Service de téléversement indisponible.');
  }

  const form = new FormData();
  form.append('file', file);
  form.append('api_key', sign.apiKey);
  form.append('timestamp', String(sign.timestamp));
  form.append('signature', sign.signature);
  form.append('folder', sign.folder);
  form.append('public_id', sign.public_id);

  const res = await fetch(sign.uploadUrl, { method: 'POST', body: form });
  if (!res.ok) {
    throw new Error(`Téléversement échoué (${res.status}).`);
  }
  const data = await res.json();
  if (!data.secure_url) {
    throw new Error('Téléversement sans URL retournée.');
  }
  return data.secure_url;
}
