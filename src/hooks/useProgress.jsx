import { useState } from 'react';
import api from '../services/api';
import { uploadToCloudinary } from '../utils/uploadResource';

export function useLessonProgress() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateProgress = async (lessonId, data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(`/lessons/${lessonId}/progress`, data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update progress');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateProgress, loading, error };
}

export function useQuizAttempts() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submitQuizAttempt = async (quizId, payload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(`/quizzes/${quizId}/attempts`, payload);
      return response.data?.data || response.data;
    } catch (err) {
      const status = err.response?.status;
      const message =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Impossible de soumettre le quiz.';
      if (status === 403) {
        setError('Ce quiz n\'est pas disponible pour les étudiants.');
      } else {
        setError(message);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { submitQuizAttempt, loading, error };
}

export function useAssignmentSubmissions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submitAssignment = async (assignmentId, file) => {
    setLoading(true);
    setError(null);
    try {
      // Upload the file straight to Cloudinary (signed), bypassing the
      // serverless 4.5 MB body limit that made multipart submissions 500,
      // then send only the resulting URL — the backend accepts fileUrl.
      const { secure_url } = await uploadToCloudinary(file);
      const response = await api.post(`/assignments/${assignmentId}/submissions`, {
        fileUrl: secure_url,
      });
      return response.data;
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.message ||
        'Échec de la soumission du devoir.'
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { submitAssignment, loading, error };
}
