import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// Context
import { AuthProvider } from './context/AuthContext';

// Layouts
import ProtectedLayout from './layouts/ProtectedLayout';
import InstructorLayout from './layouts/InstructorLayout';
import AdminLayout from './layouts/AdminLayout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Catalog from './pages/Catalog';
import About from './pages/About';
import CourseDetails from './pages/CourseDetails';
import Checkout from './pages/Checkout';
import ClassroomPlayer from './pages/ClassroomPlayer';
import QuizPlayer from './pages/QuizPlayer';
import AssignmentSubmit from './pages/AssignmentSubmit';
import StudentDashboard from './pages/StudentDashboard';
import InstructorDashboard from './pages/InstructorDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Components
import Footer from './components/Footer';

const HIDDEN_FOOTER_PATHS = [
  '/student/dashboard',
  '/instructor/dashboard',
  '/admin/dashboard',
  '/dashboard',
];

function FooterWrapper() {
  const { pathname } = useLocation();
  const hide =
    HIDDEN_FOOTER_PATHS.includes(pathname) ||
    pathname.startsWith('/learn/');
  return hide ? null : <Footer />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/courses" element={<Catalog />} />
          <Route path="/about" element={<About />} />
          <Route path="/courses/:id" element={<CourseDetails />} />
          <Route path="/courses/:id/checkout" element={<Checkout />} />

          {/* Protected Routes */}
          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard" element={<Profile />} />
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/learn/:courseId/lesson/:lessonId" element={<ClassroomPlayer />} />
            <Route path="/learn/:courseId/quiz/:quizId" element={<QuizPlayer />} />
            <Route path="/learn/:courseId/assignment/:assignmentId" element={<AssignmentSubmit />} />
          </Route>

          {/* Instructor Routes */}
          <Route element={<InstructorLayout />}>
            <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>
        </Routes>
        <FooterWrapper />
      </Router>
    </AuthProvider>
  );
}

export default App;

