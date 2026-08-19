import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export function useAssignments(lessonId) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAssignments = useCallback(async () => {
    if (!lessonId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/lessons/${lessonId}/assignments`);
      setAssignments(response.data?.data || response.data || []);
    } catch (err) {
      setError('Failed to load assignments');
      console.error('Assignments error:', err);
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  return {
    assignments,
    loading,
    error,
    refetch: fetchAssignments,
  };
}

export function useAssignmentSubmissions(assignmentId) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSubmissions = useCallback(async () => {
    if (!assignmentId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/assignments/${assignmentId}/submissions`);
      setSubmissions(response.data?.data || response.data || []);
    } catch (err) {
      setError('Failed to load submissions');
      console.error('Submissions error:', err);
    } finally {
      setLoading(false);
    }
  }, [assignmentId]);

  const gradeSubmission = async (submissionId, grade, feedback) => {
    try {
      const response = await api.patch(`/submissions/${submissionId}/grade`, { grade, feedback });
      setSubmissions(prev => prev.map(s => s.id === submissionId ? { ...s, grade, feedback, gradedAt: new Date() } : s));
      return response.data;
    } catch (err) {
      console.error('Failed to grade submission:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  return {
    submissions,
    loading,
    error,
    refetch: fetchSubmissions,
    gradeSubmission,
  };
}
