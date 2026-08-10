import { useState } from 'react';
import api from '../services/api';

export function useCloudinaryUpload() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  const getSignature = async (file) => {
    try {
      const response = await api.post('/uploads/cloudinary-sign', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      });
      return response.data;
    } catch (err) {
      setError('Failed to get upload signature');
      throw err;
    }
  };

  const uploadToCloudinary = async (file, signatureData) => {
    const { signature, timestamp, apiKey, cloudName, uploadPreset } = signatureData;
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('signature', signature);
    formData.append('timestamp', timestamp);
    formData.append('api_key', apiKey);
    formData.append('upload_preset', uploadPreset);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } else {
          reject(new Error('Upload failed'));
        }
      };

      xhr.onerror = () => {
        reject(new Error('Upload failed'));
      };

      xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);
      xhr.send(formData);
    });
  };

  const uploadFile = async (file) => {
    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      const signatureData = await getSignature(file);
      const result = await uploadToCloudinary(file, signatureData);
      return result;
    } catch (err) {
      setError(err.message || 'Upload failed');
      throw err;
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return {
    uploadFile,
    loading,
    error,
    progress,
  };
}
