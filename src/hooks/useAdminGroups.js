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
      const response = await api.get('/groups');
      setGroups(response.data?.data?.groups || response.data?.groups || []);
    } catch (err) {
      setError('Failed to load groups');
      console.error('Groups error:', err);
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async (groupData) => {
    const response = await api.post('/groups', groupData);
    await fetchGroups();
    return response.data;
  };

  const updateGroup = async (groupId, groupData) => {
    const response = await api.patch(`/groups/${groupId}`, groupData);
    await fetchGroups();
    return response.data;
  };

  const assignFormateur = async (groupId, formateurId) => {
    const response = await api.patch(`/groups/${groupId}`, { formateurId });
    await fetchGroups();
    return response.data;
  };

  const addStudentToGroup = async (groupId, userId) => {
    const response = await api.post(`/groups/${groupId}/students`, { userId });
    await fetchGroups();
    return response.data;
  };

  const removeStudentFromGroup = async (groupId, userId) => {
    const response = await api.delete(`/groups/${groupId}/students/${userId}`);
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
