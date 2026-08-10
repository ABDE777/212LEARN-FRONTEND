import { useState } from 'react';
import { Upload, X, Check, AlertCircle, Image as ImageIcon, File, Video } from 'lucide-react';
import { useCloudinaryUpload } from '../hooks/useCloudinaryUpload';

export default function CloudinaryDirectUpload({ onUploadSuccess, accept = 'image/*', maxSize = 10 }) {
  const { uploadFile, loading, error, progress } = useCloudinaryUpload();
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploadError, setUploadError] = useState('');

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setUploadError(`Le fichier est trop grand (max ${maxSize}MB)`);
      return;
    }

    // Validate file type
    if (accept && !file.type.match(accept.replace('*', '.*'))) {
      setUploadError('Type de fichier non supporté');
      return;
    }

    setSelectedFile(file);
    setUploadError('');

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploadError('');
    try {
      const result = await uploadFile(selectedFile);
      if (onUploadSuccess) {
        onUploadSuccess(result);
      }
      setSelectedFile(null);
      setPreview(null);
    } catch (err) {
      setUploadError(err.message || 'Erreur lors du téléchargement');
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreview(null);
    setUploadError('');
  };

  const getFileIcon = () => {
    if (!selectedFile) return <Upload size={24} />;
    if (selectedFile.type.startsWith('image/')) return <ImageIcon size={24} />;
    if (selectedFile.type.startsWith('video/')) return <Video size={24} />;
    return <File size={24} />;
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div style={{ width: '100%' }}>
      <div
        style={{
          border: '2px dashed var(--border-color)',
          borderRadius: '12px',
          padding: '2rem',
          textAlign: 'center',
          background: 'var(--bg-color)',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1,
        }}
        onClick={() => !loading && document.getElementById('cloudinary-file-input').click()}
      >
        <input
          id="cloudinary-file-input"
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          disabled={loading}
          style={{ display: 'none' }}
        />
        
        {preview ? (
          <div style={{ marginBottom: '1rem' }}>
            <img
              src={preview}
              alt="Preview"
              style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }}
            />
          </div>
        ) : (
          <div style={{ marginBottom: '1rem', color: 'var(--secondary)' }}>
            {getFileIcon()}
          </div>
        )}

        {selectedFile ? (
          <div>
            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-color)' }}>
              {selectedFile.name}
            </p>
            <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: 'var(--secondary)' }}>
              {formatFileSize(selectedFile.size)}
            </p>
          </div>
        ) : (
          <div>
            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-color)' }}>
              Cliquez pour sélectionner un fichier
            </p>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--secondary)' }}>
              ou glissez-déposez ici (max {maxSize}MB)
            </p>
          </div>
        )}
      </div>

      {uploadError && (
        <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#fee', border: '1px solid #fcc', borderRadius: '8px', color: '#c33', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={16} />
          {uploadError}
        </div>
      )}

      {error && (
        <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#fee', border: '1px solid #fcc', borderRadius: '8px', color: '#c33', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {selectedFile && (
        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleUpload}
            disabled={loading}
            style={{
              flex: 1,
              padding: '0.6rem 1rem',
              background: 'var(--primary)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? (
              <>
                <span style={{ animation: 'pulse 1s infinite' }}>...</span>
                Téléchargement...
              </>
            ) : (
              <>
                <Upload size={16} />
                Télécharger
              </>
            )}
          </button>
          <button
            onClick={handleCancel}
            disabled={loading}
            style={{
              padding: '0.6rem 1rem',
              background: 'transparent',
              color: 'var(--secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <X size={16} />
            Annuler
          </button>
        </div>
      )}

      {loading && progress > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.85rem', color: 'var(--secondary)' }}>
            <span>Progression</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                background: 'var(--primary)',
                width: `${progress}%`,
                borderRadius: '3px',
                transition: 'width 0.2s ease',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
