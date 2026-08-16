import { useState, useCallback, useEffect } from 'react';
import api from '../services/api';
import axios from 'axios';

export function usePublicInstructors() {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInstructors = useCallback(async () => {
    setLoading(true);
    setError(null);

    // 1. Try local dev server first if in development (http://localhost:5000/api/v1/stats/instructors)
    if (import.meta.env.DEV) {
      try {
        const localRes = await axios.get('http://localhost:5000/api/v1/stats/instructors', {
          validateStatus: (status) => status < 400,
          timeout: 3000,
        });
        if (localRes.status === 200) {
          const payload = localRes.data?.data ?? localRes.data ?? [];
          if (Array.isArray(payload) && payload.length > 0) {
            setInstructors(payload);
            setLoading(false);
            return;
          }
        }
      } catch {
        // Fall through to configured api baseURL
      }
    }

    // 2. Try configured baseURL /stats/instructors
    try {
      const response = await api.get('/stats/instructors', {
        validateStatus: (status) => status < 400,
      });

      if (response.status === 200) {
        const payload = response.data?.data ?? response.data ?? [];
        if (Array.isArray(payload) && payload.length > 0) {
          setInstructors(payload);
          setLoading(false);
          return;
        }
      }
    } catch {
      // Swallowed: Endpoint not deployed on remote backend yet
    }

    // 3. Fallback: Extract instructors from public published courses (/courses)
    try {
      const coursesRes = await api.get('/courses', {
        validateStatus: (status) => status < 400,
      });

      if (coursesRes.status === 200) {
        const coursesList = coursesRes.data?.data?.courses || coursesRes.data?.courses || (Array.isArray(coursesRes.data) ? coursesRes.data : []);
        const instMap = new Map();

        coursesList.forEach((c) => {
          if (Array.isArray(c.instructors)) {
            c.instructors.forEach((item) => {
              const u = item.user || item;
              if (u && u.id && !instMap.has(u.id)) {
                instMap.set(u.id, {
                  id: u.id,
                  firstName: u.firstName,
                  lastName: u.lastName,
                  avatar: u.avatar,
                  bio: u.bio,
                  skills: u.skills,
                  instructorProfile: u.instructorProfile,
                  coursesInstructed: [c],
                });
              }
            });
          }
        });

        const fallbackList = Array.from(instMap.values());
        setInstructors(fallbackList);
      } else {
        setInstructors([]);
      }
    } catch {
      setError('Impossible de charger les formateurs.');
      setInstructors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInstructors();
  }, [fetchInstructors]);

  return { instructors, loading, error, refreshInstructors: fetchInstructors };
}
