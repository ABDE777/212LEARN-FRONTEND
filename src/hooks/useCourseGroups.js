import { useState } from 'react';
import api from '../services/api';

/**
 * Instructor drill-down: the groups an instructor teaches for a course, and the
 * students of a chosen group. Backed by the instructor-scoped endpoints
 * GET /courses/:courseId/groups and GET /groups/:id/students.
 */
export const useCourseGroups = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getCourseGroups = async (courseId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/courses/${courseId}/groups`, { skipCache: true });
      return response.data?.data?.groups || [];
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.response?.data?.message || 'Failed to load groups';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async (courseId, name, description = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/groups', { courseId, name, description });
      return response.data?.data?.group || response.data?.group || null;
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.response?.data?.message || 'Failed to create group';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getGroupStudents = async (groupId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/groups/${groupId}/students`, { skipCache: true });
      return response.data?.data || { group: null, students: [] };
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.response?.data?.message || 'Failed to load students';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addStudentToGroup = async (groupId, userId) => {
    setLoading(true);
    setError(null);
    try {
      await api.post(`/groups/${groupId}/students`, { userId });
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.response?.data?.message || 'Failed to add student';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeStudentFromGroup = async (groupId, userId) => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/groups/${groupId}/students/${userId}`);
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.response?.data?.message || 'Failed to remove student';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { getCourseGroups, createGroup, getGroupStudents, addStudentToGroup, removeStudentFromGroup, loading, error };
};
