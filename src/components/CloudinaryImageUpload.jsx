import { useState, useRef } from 'react';
import api from '../services/api';

/**
 * CloudinaryImageUpload
 * Reusable drag-and-drop image uploader using Cloudinary signed direct upload.
 * Uploads the image directly from the browser to Cloudinary (bypasses Vercel's 4.5 MB limit).
 *
 * Props:
 *  - value: string  — current image URL (controlled)
 *  - onChange: (url: string) => void  — called with the Cloudinary secure_url when upload completes
 *  - placeholder: string  — placeholder text inside the dropzone
 *  - maxSizeMB: number  — max file size in MB (default 10)
 */
export default function CloudinaryImageUpload({
  value,
  onChange,
  placeholder = 'Cliquez ou glissez une image ici',
  maxSizeMB = 10,
}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;

    // Validate type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setError('Format non supporté. Utilisez JPG, PNG, WEBP ou GIF.');
      return;
    }

    // Validate size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Fichier trop grand. Taille maximale : ${maxSizeMB} MB.`);
      return;
    }

    setError(null);
    setUploading(true);
    setProgress(0);

    try {
      // Step 1: Get Cloudinary signature from the backend (POST, bypass client-side GET cache)
      const signRes = await api({
        method: 'post',
        url: '/uploads/cloudinary-sign',
        data: { type: 'image', filename: file.name, mimetype: file.type },
      });

      const signData = signRes.data?.data || signRes.data;

      // Step 2: Upload directly to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', signData.apiKey);
      formData.append('timestamp', signData.timestamp);
      formData.append('signature', signData.signature);
      formData.append('folder', signData.folder);
      formData.append('public_id', signData.public_id);

      const uploadRes = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', signData.uploadUrl);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100));
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(`Cloudinary upload failed (${xhr.status})`));
          }
        };
        xhr.onerror = () => reject(new Error('Erreur réseau lors de l\'upload.'));
        xhr.send(formData);
      });

      onChange(uploadRes.secure_url);
      setProgress(100);
    } catch (err) {
      console.error('Cloudinary upload error:', err);
      setError(err.message || 'Échec de l\'upload. Veuillez réessayer.');
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const handleRemove = (e) => {
    e.stopPropagation();
    onChange('');
    setProgress(0);
    setError(null);
  };

  return (
    <div style={{ width: '100%' }}>
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{
          position: 'relative',
          borderRadius: '14px',
          overflow: 'hidden',
          border: dragging
            ? '2px dashed var(--primary)'
            : value
            ? '2px solid transparent'
            : '2px dashed rgba(193,101,47,0.35)',
          background: value
            ? `url(${value}) center/cover no-repeat`
            : dragging
            ? 'rgba(193,101,47,0.06)'
            : 'var(--bg-color)',
          minHeight: '160px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: uploading ? 'wait' : 'pointer',
          transition: 'all 0.25s ease',
          boxShadow: dragging ? '0 0 0 4px rgba(193,101,47,0.15)' : 'none',
        }}
      >
        {/* Overlay when image is set */}
        {value && !uploading && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0,
              transition: 'opacity 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
          >
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                style={{
                  padding: '0.5rem 1rem', borderRadius: '9999px',
                  background: 'rgba(255,255,255,0.9)', color: '#1B4B5A',
                  border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem',
                }}
              >
                ✏️ Changer
              </button>
              <button
                type="button"
                onClick={handleRemove}
                style={{
                  padding: '0.5rem 1rem', borderRadius: '9999px',
                  background: 'rgba(220,38,38,0.85)', color: '#fff',
                  border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem',
                }}
              >
                🗑️ Supprimer
              </button>
            </div>
          </div>
        )}

        {/* Upload progress */}
        {uploading && (
          <div style={{ textAlign: 'center', padding: '1.5rem' }}>
            <div style={{
              width: '180px', height: '6px', borderRadius: '9999px',
              background: 'rgba(193,101,47,0.15)', overflow: 'hidden', margin: '0 auto 0.75rem',
            }}>
              <div style={{
                height: '100%', width: `${progress}%`,
                background: 'var(--primary)', borderRadius: '9999px',
                transition: 'width 0.3s ease',
              }} />
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--secondary)', margin: 0 }}>
              Upload en cours… {progress}%
            </p>
          </div>
        )}

        {/* Empty state */}
        {!value && !uploading && (
          <div style={{ textAlign: 'center', padding: '1.5rem', pointerEvents: 'none' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🖼️</div>
            <p style={{ fontSize: '0.88rem', color: 'var(--secondary)', margin: 0, fontWeight: 500 }}>
              {placeholder}
            </p>
            <p style={{ fontSize: '0.78rem', color: 'var(--secondary)', opacity: 0.6, marginTop: '0.3rem' }}>
              JPG, PNG, WEBP · Max {maxSizeMB} MB
            </p>
          </div>
        )}
      </div>

      {/* Progress bar below (when no preview) */}
      {uploading && !value && (
        <div style={{ marginTop: '0.5rem' }}>
          <div style={{
            height: '4px', borderRadius: '9999px',
            background: 'rgba(193,101,47,0.15)', overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', width: `${progress}%`,
              background: 'var(--primary)', borderRadius: '9999px',
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p style={{
          marginTop: '0.4rem', fontSize: '0.8rem',
          color: '#dc2626', fontWeight: 500,
        }}>
          ⚠️ {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        style={{ display: 'none' }}
        onChange={handleInputChange}
      />
    </div>
  );
}
