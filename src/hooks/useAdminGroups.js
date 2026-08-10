import { useState, useEffect } from 'react';
import api from '../services/api';

export function useAdminGroups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGroups = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/admin/groups');
      setGroups(response.data?.data || response.data || []);
    } catch (err) {
      setError('Failed to load groups');
      console.error('Groups error:', err);
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async (groupData) => {
    const response = await api.post('/admin/groups', groupData);
    await fetchGroups();
    return response.data;
  };

  const updateGroup = async (groupId, groupData) => {
    const response = await api.patch(`/admin/groups/${groupId}`, groupData);
    await fetchGroups();
    return response.data;
  };

  const assignFormateur = async (groupId, formateurId) => {
    const response = await api.patch(`/admin/groups/${groupId}/formateur`, { formateurId });
    await fetchGroups();
    return response.data;
  };

  const addStudentToGroup = async (groupId, studentId) => {
    const response = await api.post(`/admin/groups/${groupId}/students`, { studentId });
    await fetchGroups();
    return response.data;
  };

  const removeStudentFromGroup = async (groupId, studentId) => {
    const response = await api.delete(`/admin/groups/${groupId}/students/${studentId}`);
    await fetchGroups();
    return response.data;
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return {
    groups,
    loading,
    error,
    refetch: fetchGroups,
    createGroup,
    updateGroup,
    assignFormateur,
    addStudentToGroup,
    removeStudentFromGroup,
  };
}
