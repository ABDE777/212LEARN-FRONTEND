import { useState } from 'react';
import Navbar from '../components/Navbar';
import { BookOpen, Plus, Video, Users, Award, User, LogOut } from 'lucide-react';
import { useInstructorCourses } from '../hooks/useInstructorCourses';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import ProfileEditForm from '../components/ProfileEditForm';

export default function InstructorDashboard() {
  const [activeTab, setActiveTab] = useState('courses');
  const { courses, loading, error } = useInstructorCourses();
  const { user, logout } = useAuth();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)' }}>
      <Navbar />

      <div className="dashboard-layout">
        {/* Sidebar Panel */}
        <aside className="dashboard-sidebar">
          <div className="sidebar-user-info">
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" className="sidebar-avatar" />
            ) : (
              <div className="sidebar-avatar">
                {user?.firstName ? user.firstName.charAt(0).toUpperCase() : '?'}
              </div>
            )}
            <div className="sidebar-username-wrapper">
              <div className="sidebar-username">{user?.firstName} {user?.lastName}</div>
              <span className="sidebar-userrole">Instructeur</span>
            </div>
          </div>

          <nav className="sidebar-menu">
            <button
              onClick={() => setActiveTab('courses')}
              className={`sidebar-menu-btn ${activeTab === 'courses' ? 'active' : ''}`}
            >
              <BookOpen size={18} />
              <span>My Courses</span>
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`sidebar-menu-btn ${activeTab === 'create' ? 'active' : ''}`}
            >
              <Plus size={18} />
              <span>Create Course</span>
            </button>
            <button
              onClick={() => setActiveTab('meetings')}
              className={`sidebar-menu-btn ${activeTab === 'meetings' ? 'active' : ''}`}
            >
              <Video size={18} />
              <span>Meetings</span>
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`sidebar-menu-btn ${activeTab === 'students' ? 'active' : ''}`}
            >
              <Users size={18} />
              <span>Students</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`sidebar-menu-btn ${activeTab === 'profile' ? 'active' : ''}`}
            >
              <User size={18} />
              <span>Mon Profil</span>
            </button>
            <button
              onClick={() => {
                logout();
                window.location.href = '/login';
              }}
              className="sidebar-menu-btn"
              style={{ marginTop: 'auto', color: 'var(--error-color)' }}
            >
              <LogOut size={18} />
              <span>Déconnexion</span>
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="dashboard-main-content">
          {activeTab === 'profile' ? (
            <ProfileEditForm />
          ) : (
            <div style={{ background: '#fff', padding: '2rem', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
              {activeTab === 'courses' && (
                <div>
                  <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>My Courses</h2>
                  {loading && <LoadingSpinner />}
                  {error && <p style={{ color: 'var(--error-color)' }}>{error}</p>}
                  {!loading && !error && courses.length === 0 && (
                    <p style={{ color: 'var(--secondary)' }}>You haven't created any courses yet.</p>
                  )}
                  {!loading && !error && courses.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                      {courses.map((course) => (
                        <div key={course.id} style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                          <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-color)' }}>{course.title}</h3>
                          <p style={{ marginBottom: '0.5rem', color: 'var(--secondary)' }}>
                            Status: <span style={{ fontWeight: 600, color: course.status === 'published' ? 'var(--primary)' : 'var(--secondary)' }}>
                              {course.status}
                            </span>
                          </p>
                          <p style={{ color: 'var(--secondary)' }}>{course.enrolledCount} students enrolled</p>
                          {course.price && <p style={{ color: 'var(--text-color)', fontWeight: 600 }}>{course.price} €</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'create' && (
                <div>
                  <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Create New Course</h2>
                  <p style={{ color: 'var(--secondary)' }}>Coming soon: Course creation form</p>
                </div>
              )}

              {activeTab === 'meetings' && (
                <div>
                  <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Scheduled Meetings</h2>
                  <p style={{ color: 'var(--secondary)' }}>Coming soon: Meetings will appear here</p>
                </div>
              )}

              {activeTab === 'students' && (
                <div>
                  <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>My Students</h2>
                  <p style={{ color: 'var(--secondary)' }}>Coming soon: Enrolled students will appear here</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
