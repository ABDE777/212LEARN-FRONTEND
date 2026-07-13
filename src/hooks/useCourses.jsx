import { useState, useEffect } from 'react';
import api from '../services/api';

export function useCourses(filters = {}) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const params = new URLSearchParams();
        if (filters.category) params.append('category', filters.category);
        if (filters.level) params.append('level', filters.level);
        if (filters.search) params.append('search', filters.search);

        const response = await api.get(`/courses?${params.toString()}`);
        setCourses(response.data.data.courses);
      } catch (err) {
        console.error('Failed to fetch courses:', err);
        setError('Impossible de charger les cours. Le serveur est temporairement indisponible.');
        // Set fallback courses so UI still works
        setCourses([
          {
            id: '1',
            title: 'Introduction à la Programmation Python',
            description: 'Apprenez les bases de la programmation avec Python',
            price: 49,
            level: 'beginner',
            category: { name: 'Informatique' },
            enrolledCount: 1250,
            rating: 4.5,
            reviewsCount: 320
          },
          {
            id: '2',
            title: 'Développement Web Complet',
            description: 'HTML, CSS, JavaScript et React',
            price: 79,
            level: 'intermediate',
            category: { name: 'Développement Web' },
            enrolledCount: 890,
            rating: 4.7,
            reviewsCount: 245
          },
          {
            id: '3',
            title: 'Base de Données SQL Avancé',
            description: 'Maîtrisez les requêtes complexes et l\'optimisation',
            price: 59,
            level: 'advanced',
            category: { name: 'Base de données' },
            enrolledCount: 567,
            rating: 4.8,
            reviewsCount: 189
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [filters.category, filters.level, filters.search]);

  return { courses, loading, error };
}

export function useCourse(courseId) {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await api.get(`/courses/${courseId}`);
        setCourse(response.data.data.course);
      } catch (err) {
        console.error('Failed to fetch course:', err);
        setError('Impossible de charger le cours. Le serveur est temporairement indisponible.');
        // Set fallback course so UI still works
        setCourse({
          id: courseId,
          title: 'Introduction à la Programmation Python',
          description: 'Ce cours complet vous apprendra les fondamentaux de la programmation en Python, depuis les variables jusqu\'aux fonctions et aux structures de données avancées.',
          price: 49,
          level: 'beginner',
          category: { name: 'Informatique' },
          enrolledCount: 1250,
          rating: 4.5,
          reviewsCount: 320,
          duration: '10h',
          isEnrolled: false,
          learningOutcomes: [
            'Comprendre les concepts de base de la programmation',
            'Maîtriser les variables et les types de données',
            'Créer et utiliser des fonctions',
            'Travailler avec des listes et des dictionnaires',
            'Implémenter des algorithmes de base'
          ],
          instructor: {
            name: 'Jean Dupont',
            bio: 'Développeur senior avec 10 ans d\'expérience en Python',
            coursesCount: 5,
            studentsCount: 5000,
            avatar: null
          }
        });
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  return { course, loading, error };
}

export function useCourseCurriculum(courseId) {
  const [curriculum, setCurriculum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCurriculum = async () => {
      try {
        const response = await api.get(`/courses/${courseId}/curriculum`);
        setCurriculum(response.data.data);
      } catch (err) {
        console.error('Failed to fetch curriculum:', err);
        setError('Impossible de charger le programme. Le serveur est temporairement indisponible.');
        // Set fallback curriculum so UI still works
        setCurriculum({
          sections: [
            {
              id: 's1',
              title: 'Introduction à Python',
              lessons: [
                { id: 'l1', title: 'Installation et configuration', duration: '15 min', type: 'video', videoUrl: null, isLocked: false },
                { id: 'l2', title: 'Votre premier programme', duration: '20 min', type: 'video', videoUrl: null, isLocked: false },
                { id: 'l3', title: 'Variables et types', duration: '25 min', type: 'video', videoUrl: null, isLocked: false }
              ]
            },
            {
              id: 's2',
              title: 'Structures de contrôle',
              lessons: [
                { id: 'l4', title: 'Conditions if/else', duration: '30 min', type: 'video', videoUrl: null, isLocked: true },
                { id: 'l5', title: 'Boucles for et while', duration: '35 min', type: 'video', videoUrl: null, isLocked: true }
              ]
            }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCurriculum();
    }
  }, [courseId]);

  return { curriculum, loading, error };
}
