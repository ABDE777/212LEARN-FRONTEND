import api from '../services/api';

function detectType(file) {
  const t = file.type || '';
  if (t === 'application/pdf') return 'pdf';
  if (t.includes('zip')) return 'zip';
  if (t.startsWith('video/')) return 'video';
  if (t.startsWith('image/')) return 'image';
  if (
    t === 'application/msword' ||
    t === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return 'document';
  }
  const name = (file.name || '').toLowerCase();
  if (name.endsWith('.pdf')) return 'pdf';
  if (name.endsWith('.zip')) return 'zip';
  if (/\.(mp4|webm|mov)$/.test(name)) return 'video';
  if (/\.(jpe?g|png|gif|webp)$/.test(name)) return 'image';
  if (/\.(docx?)$/.test(name)) return 'document';
  throw new Error(`Type de fichier non supporté : ${file.type || file.name}`);
}

export async function uploadLessonResource({ lessonId, file, onProgress }) {
  const type = detectType(file);

  const signRes = await api.post('/uploads/cloudinary-sign', {
    type,
    filename: file.name,
    mimetype: file.type || undefined,
  });
  const sign = signRes.data?.data || signRes.data;
  if (!sign?.uploadUrl) {
    throw new Error(sign?.error?.message || 'Signature Cloudinary non reçue.');
  }

  const form = new FormData();
  form.append('file', file);
  form.append('api_key', sign.apiKey);
  form.append('timestamp', String(sign.timestamp));
  form.append('signature', sign.signature);
  form.append('folder', sign.folder);
  form.append('public_id', sign.public_id);

  const cloud = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = (ev) => {
      if (ev.lengthComputable && onProgress) {
        onProgress(Math.round((ev.loaded / ev.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.response));
      } else {
        let msg = `Upload Cloudinary échoué (${xhr.status})`;
        try {
          const body = JSON.parse(xhr.response);
          if (body?.error?.message) msg = body.error.message;
        } catch {
          /* ignore non-JSON body */
        }
        reject(new Error(msg));
      }
    };
    xhr.onerror = () => reject(new Error("Erreur réseau pendant l'upload Cloudinary."));
    xhr.open('POST', sign.uploadUrl);
    xhr.send(form);
  });

  if (!cloud?.secure_url) {
    throw new Error(cloud?.error?.message || "L'upload Cloudinary a échoué.");
  }

  const saveRes = await api.post(`/lessons/${lessonId}/resources`, {
    type,
    url: cloud.secure_url,
  });
  return saveRes.data?.data?.resource || saveRes.data?.resource;
}

export default uploadLessonResource;
