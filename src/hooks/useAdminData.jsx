import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export function useAdminUsers() {
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

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const verifyInstructor = async (userId, notes = 'Compte vérifié après vérification manuelle') => {
    const response = await api.patch(`/admin/users/${userId}/verify`, { isVerified: true, notes });
    return response.data;
  };

  const verifyStudent = async (userId, notes = 'Compte vérifié après vérification manuelle') => {
    const response = await api.patch(`/admin/users/${userId}/verify-student`, { isVerified: true, notes });
    return response.data;
  };

  const restoreUser = async (userId) => {
    const response = await api.patch(`/users/${userId}/restore`);
    return response.data;
  };

  return { users, loading, error, refreshUsers: fetchUsers, verifyInstructor, verifyStudent, restoreUser };
}

export function useAdminInstructors() {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInstructors = async () => {
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
    };

    fetchInstructors();
  }, []);

  return { instructors, loading, error };
}

export function useAdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [allCoursesResponse, draftCoursesResponse] = await Promise.allSettled([
        api.get('/courses', { params: { limit: 100 } }),
        api.get('/courses', { params: { limit: 100, status: 'draft' } }),
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

      if (allCoursesResponse.status === 'rejected' && draftCoursesResponse.status === 'rejected') {
        throw allCoursesResponse.reason || draftCoursesResponse.reason;
      }
    } catch (err) {
      console.error('Failed to fetch courses:', err);
      setError('Impossible de charger les cours.');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return { courses, loading, error, refreshCourses: fetchCourses };
}

export function useAssignFormateur() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const assignFormateur = async (groupId, formateurId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.patch(`/admin/groups/${groupId}/formateur`, { formateurId });
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
