import { useState, useCallback } from 'react';
import api from '../services/api';

export function useCurriculumBuilder(courseId) {
  const [curriculum, setCurriculum] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCurriculum = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/courses/${courseId}/curriculum`);
      setCurriculum(response.data?.data?.sections || response.data?.sections || response.data || []);
    } catch (err) {
      console.error('Failed to fetch curriculum:', err);
      setError('Impossible de charger le curriculum.');
      setCurriculum([]);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  const createSection = async (title) => {
    try {
      const res = await api.post(`/courses/${courseId}/sections`, { title });
      await fetchCurriculum();
      return res.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const updateSection = async (sectionId, data) => {
    try {
      const res = await api.patch(`/sections/${sectionId}`, data);
      await fetchCurriculum();
      return res.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const deleteSection = async (sectionId) => {
    try {
      await api.delete(`/sections/${sectionId}`);
      await fetchCurriculum();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const createLesson = async (sectionId, data) => {
    try {
      const res = await api.post(`/sections/${sectionId}/lessons`, data);
      await fetchCurriculum();
      return res.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const updateLesson = async (lessonId, data) => {
    try {
      const res = await api.patch(`/lessons/${lessonId}`, data);
      await fetchCurriculum();
      return res.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const deleteLesson = async (lessonId) => {
    try {
      await api.delete(`/lessons/${lessonId}`);
      await fetchCurriculum();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const addResource = async (lessonId, fileData) => {
    // fileData === null means the upload was already completed (Cloudinary flow);
    // we only need to refresh the curriculum to show the new resource.
    if (fileData === null) {
      await fetchCurriculum();
      return;
    }
    try {
      const res = await api.post(`/lessons/${lessonId}/resources`, fileData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await fetchCurriculum();
      return res.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const deleteResource = async (resourceId) => {
    try {
      await api.delete(`/resources/${resourceId}`);
      await fetchCurriculum();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return {
    curriculum,
    loading,
    error,
    fetchCurriculum,
    createSection,
    updateSection,
    deleteSection,
    createLesson,
    updateLesson,
    deleteLesson,
    addResource,
    deleteResource,
  };
}
