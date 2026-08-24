import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

// Context
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

// Layouts (small; kept eager — they wrap the routes)
import ProtectedLayout from './layouts/ProtectedLayout';
import StudentLayout from './layouts/StudentLayout';
import InstructorLayout from './layouts/InstructorLayout';
import AdminLayout from './layouts/AdminLayout';

// Pages — lazy-loaded so each route is its own chunk (was one 1.95 MB bundle).
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const Profile = lazy(() => import('./pages/Profile'));
const Catalog = lazy(() => import('./pages/Catalog'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const CourseDetails = lazy(() => import('./pages/CourseDetails'));
const Checkout = lazy(() => import('./pages/Checkout'));
const PacksCatalog = lazy(() => import('./pages/PacksCatalog'));
const PackDetails = lazy(() => import('./pages/PackDetails'));
const PackCheckout = lazy(() => import('./pages/PackCheckout'));
const Cart = lazy(() => import('./pages/Cart'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const ClassroomPlayer = lazy(() => import('./pages/ClassroomPlayer'));
const QuizPlayer = lazy(() => import('./pages/QuizPlayer'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const InstructorDashboard = lazy(() => import('./pages/InstructorDashboard'));
const InstructorPending = lazy(() => import('./pages/InstructorPending'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const InstructorCourseManage = lazy(() => import('./pages/InstructorCourseManage'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Components
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import LoadingSpinner from './components/LoadingSpinner';

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
      <ToastProvider>
        <CartProvider>
          <WishlistProvider>
            <Router>
              <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/verify-email/:token" element={<VerifyEmail />} />
                <Route path="/courses" element={<Catalog />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/courses/:id" element={<CourseDetails />} />
                <Route path="/courses/:id/checkout" element={<Checkout />} />
                <Route path="/packs" element={<PacksCatalog />} />
                <Route path="/packs/:id" element={<PackDetails />} />
                <Route path="/packs/:id/checkout" element={<PackCheckout />} />

                {/* Protected Routes */}
                <Route element={<ProtectedLayout />}>
                  <Route path="/dashboard" element={<Profile />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                </Route>

                {/* Student Routes */}
                <Route element={<StudentLayout />}>
                  <Route path="/student/dashboard" element={<StudentDashboard />} />
                  <Route path="/learn/:courseId/lesson/:lessonId" element={<ClassroomPlayer />} />
                  <Route path="/learn/:courseId/quiz/:quizId" element={<QuizPlayer />} />
                </Route>

                {/* Instructor pending-approval screen (self-guarded; outside the
                    InstructorLayout gate so unapproved instructors can see it) */}
                <Route path="/instructor/pending" element={<InstructorPending />} />

                {/* Instructor Routes */}
                <Route element={<InstructorLayout />}>
                  <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
                  <Route path="/instructor/courses/:id/manage" element={<InstructorCourseManage />} />
                </Route>

                {/* Admin Routes */}
                <Route element={<AdminLayout />}>
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                </Route>

                {/* 404 Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              </Suspense>
              <CartDrawer />
              <FooterWrapper />
            </Router>
            <Analytics />
            <SpeedInsights />
          </WishlistProvider>
        </CartProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;


