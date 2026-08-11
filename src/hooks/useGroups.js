import { useState } from 'react';
import api from '../services/api';

export const useGroups = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createGroup = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/groups', data);
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.response?.data?.message || 'Failed to create group';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateGroup = async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.patch(`/groups/${id}`, data);
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.response?.data?.message || 'Failed to update group';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteGroup = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.delete(`/groups/${id}`);
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.response?.data?.message || 'Failed to delete group';
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
      const response = await api.post(`/groups/${groupId}/students`, { userId });
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.response?.data?.message || 'Failed to add student to group';
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
      const response = await api.delete(`/groups/${groupId}/students/${userId}`);
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.response?.data?.message || 'Failed to remove student from group';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createGroup,
    updateGroup,
    deleteGroup,
    addStudentToGroup,
    removeStudentFromGroup,
    loading,
    error,
  };
};
