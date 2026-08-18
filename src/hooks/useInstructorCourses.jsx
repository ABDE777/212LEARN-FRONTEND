import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export function useInstructorCourses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.id) return;

    const fetchCourses = async () => {
      try {
        const response = await api.get('/courses', {
          params: { instructorId: user.id, limit: 100, status: 'all' },
        });
        setCourses(response.data?.data?.courses || []);
      } catch (err) {
        console.error('Failed to fetch instructor courses:', err);
        setError('Impossible de charger vos cours.');
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [user?.id]);

  return { courses, loading, error };
}

export function useCreateCourse() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createCourse = async (courseData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/courses', courseData);
      return response.data.data.course;
    } catch (err) {
      console.error('Failed to create course:', err);
      setError('Impossible de créer le cours. Veuillez réessayer.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createCourse, loading, error };
}

export function useCourseCurriculum(courseId) {
  const [curriculum, setCurriculum] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCurriculum = useCallback(async () => {
    if (!courseId) { setCurriculum([]); setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/courses/${courseId}/curriculum`);
      const body = response.data;
      setCurriculum(body?.data?.sections || body?.sections || body?.data?.curriculum || body?.data?.curriculum || []);
    } catch (err) {
      console.error('Failed to fetch curriculum:', err);
      setError('Impossible de charger le programme.');
      setCurriculum([]);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => { fetchCurriculum(); }, [fetchCurriculum]);

  return { curriculum, loading, error, refreshCurriculum: fetchCurriculum };
}

export function useCourseQuizzes(courseId) {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchQuizzes = useCallback(async () => {
    if (!courseId) { setQuizzes([]); setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/courses/${courseId}/quizzes`);
      const body = response.data;
      const quizList = body?.data?.quizzes || body?.data || body?.quizzes || [];
      setQuizzes(Array.isArray(quizList) ? quizList : []);
    } catch (err) {
      console.error('Failed to fetch quizzes:', err);
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => { fetchQuizzes(); }, [fetchQuizzes]);

  return { quizzes, loading, error, refreshQuizzes: fetchQuizzes };
}

export function useCreateQuiz() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createQuiz = async (lessonId, title) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(`/lessons/${lessonId}/quizzes`, { title });
      return response.data?.data?.quiz || response.data?.data || response.data?.quiz;
    } catch (err) {
      console.error('Failed to create quiz:', err);
      const message = err.response?.data?.error?.message || err.response?.data?.message || 'Impossible de créer le quiz.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createQuiz, loading, error };
}

export function useGenerateAiQuiz() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateQuiz = async (lessonId, { title, prompt, questionCount = 5 }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(`/lessons/${lessonId}/quizzes/generate-ai`, { title, prompt, questionCount });
      return response.data?.data?.quiz || response.data?.data || response.data?.quiz;
    } catch (err) {
      console.error('Failed to generate quiz:', err);
      const message = err.response?.data?.error?.message || err.response?.data?.message || "Impossible de générer le quiz.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { generateQuiz, loading, error };
}

export function useAddQuizQuestion() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addQuestion = async (quizId, { statement, options, correctAnswer }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(`/quizzes/${quizId}/questions`, { statement, options, correctAnswer });
      return response.data?.data?.question || response.data?.data || response.data?.question;
    } catch (err) {
      console.error('Failed to add question:', err);
      const message = err.response?.data?.error?.message || err.response?.data?.message || "Impossible d'ajouter la question.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { addQuestion, loading, error };
}

export function useQuiz(quizId) {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchQuiz = useCallback(async () => {
    if (!quizId) { setQuiz(null); setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/quizzes/${quizId}`);
      const body = response.data;
      const quizData = body?.data?.quiz || body?.data || body?.quiz || null;
      setQuiz(quizData);
    } catch (err) {
      console.error('Failed to fetch quiz:', err);
      setError(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Impossible de charger le quiz.'
      );
      setQuiz(null);
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => { fetchQuiz(); }, [fetchQuiz]);

  return { quiz, loading, error, refreshQuiz: fetchQuiz };
}

export function useUpdateQuiz() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateQuiz = async (quizId, data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.patch(`/quizzes/${quizId}`, data);
      return response.data?.data?.quiz || response.data?.data || response.data;
    } catch (err) {
      console.error('Failed to update quiz:', err);
      const message = err.response?.data?.error?.message || err.response?.data?.message || 'Impossible de mettre à jour le quiz.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateQuiz, loading, error };
}

export function useDeleteQuiz() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteQuiz = async (quizId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.delete(`/quizzes/${quizId}`);
      return response.data;
    } catch (err) {
      console.error('Failed to delete quiz:', err);
      const message = err.response?.data?.error?.message || err.response?.data?.message || 'Impossible de supprimer le quiz.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deleteQuiz, loading, error };
}

export function useUpdateQuestion() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateQuestion = async (questionId, data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.patch(`/questions/${questionId}`, data);
      return response.data?.data?.question || response.data?.data || response.data;
    } catch (err) {
      console.error('Failed to update question:', err);
      const message = err.response?.data?.error?.message || err.response?.data?.message || 'Impossible de mettre à jour la question.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateQuestion, loading, error };
}

export function useDeleteQuestion() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteQuestion = async (questionId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.delete(`/questions/${questionId}`);
      return response.data;
    } catch (err) {
      console.error('Failed to delete question:', err);
      const message = err.response?.data?.error?.message || err.response?.data?.message || 'Impossible de supprimer la question.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deleteQuestion, loading, error };
}
