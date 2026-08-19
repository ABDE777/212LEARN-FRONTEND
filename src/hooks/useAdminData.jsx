import { useState, useCallback } from 'react';
import api from '../services/api';
import { useAutoFetch } from './useAutoFetch';

export function useAdminUsers(enabled = true) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const [activeRes, deletedRes] = await Promise.allSettled([
        api.get('/users', { params: { limit: 200, ...params } }),
        api.get('/users', { params: { limit: 200, deleted: true, ...params } }),
      ]);

      const activeUsers =
        activeRes.status === 'fulfilled'
          ? activeRes.value.data?.data?.users || []
          : [];

      const deletedUsers =
        deletedRes.status === 'fulfilled'
          ? deletedRes.value.data?.data?.users || []
          : [];

      const seen = new Set();
      const merged = [];
      for (const u of [...activeUsers, ...deletedUsers]) {
        if (!seen.has(u.id)) {
          seen.add(u.id);
          merged.push(u);
        }
      }
      setUsers(merged);

      if (activeRes.status === 'rejected' && deletedRes.status === 'rejected') {
        throw activeRes.reason || deletedRes.reason;
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Impossible de charger les utilisateurs.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useAutoFetch(fetchUsers, enabled);

  const verifyInstructor = async (userId, isVerified = true, notes = 'Compte vérifié après vérification manuelle') => {
    const response = await api.patch(`/admin/users/${userId}/verify`, { isVerified, notes });
    return response.data;
  };

  const verifyStudent = async (userId, isVerified = true, notes = 'Compte vérifié après vérification manuelle') => {
    const response = await api.patch(`/admin/users/${userId}/verify-student`, { isVerified, notes });
    return response.data;
  };

  const restoreUser = async (userId) => {
    const response = await api.patch(`/users/${userId}/restore`);
    return response.data;
  };

  const createUser = async (userData) => {
    const response = await api.post('/admin/users', userData);
    return response.data;
  };

  const updateUser = async (userId, userData) => {
    const response = await api.patch(`/admin/users/${userId}`, userData);
    return response.data;
  };

  const deleteUser = async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  };

  const resetPassword = async (userId) => {
    const response = await api.patch(`/admin/users/${userId}/reset-password`);
    return response.data;
  };

  return {
    users,
    loading,
    error,
    refreshUsers: fetchUsers,
    verifyInstructor,
    verifyStudent,
    restoreUser,
    createUser,
    updateUser,
    deleteUser,
    resetPassword,
  };
}

export function usePendingKyc(enabled = true) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPending = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/admin/users/pending-kyc');
      setUsers(response.data?.data?.users || response.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch pending KYC:', err);
      setError('Impossible de charger les demandes KYC.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useAutoFetch(fetchPending, enabled);

  return { users, loading, error, refreshPendingKyc: fetchPending };
}

export function useAdminInstructors(enabled = true) {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInstructors = useCallback(async () => {
    try {
      const response = await api.get('/users', {
        params: { role: 'instructor', limit: 100, order: 'asc', sort: 'firstName' },
      });
      setInstructors(response.data?.data?.users || []);
    } catch (err) {
      console.error('Failed to fetch instructors:', err);
      setError('Impossible de charger les instructeurs.');
      setInstructors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useAutoFetch(fetchInstructors, enabled);

  return { instructors, loading, error, refreshInstructors: fetchInstructors };
}

export function useAdminCourses(enabled = true) {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [allCoursesResponse, draftCoursesResponse, enrollmentsResponse] = await Promise.allSettled([
        api.get('/courses', { params: { limit: 100 } }),
        api.get('/courses', { params: { limit: 100, status: 'draft' } }),
        api.get('/enrollments', { params: { limit: 500 } }),
      ]);

      const allCourses =
        allCoursesResponse.status === 'fulfilled'
          ? allCoursesResponse.value.data?.data?.courses || []
          : [];

      const draftCourses =
        draftCoursesResponse.status === 'fulfilled'
          ? draftCoursesResponse.value.data?.data?.courses || []
          : [];

      const mergedCourses = [...allCourses, ...draftCourses].reduce((acc, course) => {
        if (!acc.some((item) => item.id === course.id)) {
          acc.push(course);
        }
        return acc;
      }, []);

      setCourses(mergedCourses);

      const enrollmentsData =
        enrollmentsResponse.status === 'fulfilled'
          ? enrollmentsResponse.value.data?.data?.enrollments || enrollmentsResponse.value.data?.enrollments || []
          : [];
      setEnrollments(enrollmentsData);

      if (allCoursesResponse.status === 'rejected' && draftCoursesResponse.status === 'rejected') {
        throw allCoursesResponse.reason || draftCoursesResponse.reason;
      }
    } catch (err) {
      console.error('Failed to fetch courses:', err);
      setError('Impossible de charger les cours.');
      setCourses([]);
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useAutoFetch(fetchCourses, enabled);

  return { courses, enrollments, loading, error, refreshCourses: fetchCourses };
}

export function useAssignFormateur() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const assignFormateur = async (groupId, formateurId) => {
    setLoading(true);
    setError(null);
    try {
      // Use the unified /groups subsystem; PATCH /groups/:id accepts formateurId
      // and re-links the formateur to the group's course.
      const response = await api.patch(`/groups/${groupId}`, { formateurId });
      return response.data;
    } catch (err) {
      console.error('Failed to assign formateur:', err);
      const message =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        "Impossible d'assigner le formateur.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { assignFormateur, loading, error };
}

export function useAdminCreateCourse() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createCourse = async (courseData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/courses', courseData);
      return response.data?.data?.course || response.data?.data;
    } catch (err) {
      console.error('Failed to create course:', err);
      const message =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Impossible de créer le cours.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createCourse, loading, error };
}

export function useAdminUpdateCourse() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateCourse = async (courseId, courseData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.patch(`/courses/${courseId}`, courseData);
      return response.data?.data?.course || response.data?.data || response.data;
    } catch (err) {
      console.error('Failed to update course:', err);
      const message =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Impossible de mettre à jour le cours.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateCourse, loading, error };
}

export function useAdminDeleteCourse() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteCourse = async (courseId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.delete(`/courses/${courseId}`);
      return response.data;
    } catch (err) {
      console.error('Failed to delete course:', err);
      const message =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Impossible de supprimer le cours.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deleteCourse, loading, error };
}

export function usePublishCourse() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const publishCourse = async (courseId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(`/courses/${courseId}/publish`);
      return response.data;
    } catch (err) {
      console.error('Failed to publish course:', err);
      setError('Impossible de publier le cours.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { publishCourse, loading, error };
}
