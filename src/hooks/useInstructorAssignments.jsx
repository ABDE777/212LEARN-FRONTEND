import { useState, useCallback } from 'react';
import api from '../services/api';

export function useInstructorAssignments(lessonId) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAssignments = useCallback(async () => {
    if (!lessonId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/lessons/${lessonId}/assignments`);
      setAssignments(response.data?.data?.assignments || response.data?.assignments || response.data || []);
    } catch (err) {
      console.error('Failed to fetch assignments:', err);
      setError('Impossible de charger les devoirs.');
      setAssignments([
        { id: 'assign-1', title: 'Exercice 1', description: 'Faire l\'exercice 1', dueDate: '2026-12-31' }
      ]);
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  const createAssignment = async (data) => {
    try {
      const res = await api.post(`/lessons/${lessonId}/assignments`, data);
      await fetchAssignments();
      return res.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return {
    assignments,
    loading,
    error,
    fetchAssignments,
    createAssignment
  };
}

export function useSubmissions(assignmentId) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSubmissions = useCallback(async () => {
    if (!assignmentId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/assignments/${assignmentId}/submissions`);
      setSubmissions(response.data?.data?.submissions || response.data?.submissions || response.data || []);
    } catch (err) {
      console.error('Failed to fetch submissions:', err);
      setError('Impossible de charger les soumissions.');
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  }, [assignmentId]);

  const gradeSubmission = async (submissionId, gradeData) => {
    try {
      const res = await api.patch(`/submissions/${submissionId}/grade`, gradeData);
      await fetchSubmissions();
      return res.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return {
    submissions,
    loading,
    error,
    fetchSubmissions,
    gradeSubmission
  };
}
