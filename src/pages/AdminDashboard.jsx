import { useState } from 'react';
import Navbar from '../components/Navbar';
import { Users, BookOpen, Folder, Settings, User, LogOut } from 'lucide-react';
import { useAdminUsers, useAdminCourses, usePublishCourse } from '../hooks/useAdminData';
import { useCategories } from '../hooks/useCategories';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import ProfileEditForm from '../components/ProfileEditForm';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('users');
  const { users, loading: usersLoading, error: usersError } = useAdminUsers();
  const { courses, loading: coursesLoading, error: coursesError } = useAdminCourses();
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();
  const { publishCourse, loading: publishLoading } = usePublishCourse();
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
              <span className="sidebar-userrole">Admin</span>
            </div>
          </div>

          <nav className="sidebar-menu">
            <button
              onClick={() => setActiveTab('users')}
              className={`sidebar-menu-btn ${activeTab === 'users' ? 'active' : ''}`}
            >
              <Users size={18} />
              <span>Users</span>
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              className={`sidebar-menu-btn ${activeTab === 'courses' ? 'active' : ''}`}
            >
              <BookOpen size={18} />
              <span>Courses</span>
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`sidebar-menu-btn ${activeTab === 'categories' ? 'active' : ''}`}
            >
              <Folder size={18} />
              <span>Categories</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`sidebar-menu-btn ${activeTab === 'settings' ? 'active' : ''}`}
            >
              <Settings size={18} />
              <span>Settings</span>
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
              {activeTab === 'users' && (
                <div>
                  <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>User Management</h2>
                  {usersLoading && <LoadingSpinner />}
                  {usersError && <p style={{ color: 'var(--error-color)' }}>{usersError}</p>}
                  {!usersLoading && !usersError && users.length === 0 && (
                    <p style={{ color: 'var(--secondary)' }}>No users found.</p>
                  )}
                  {!usersLoading && !usersError && users.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                      {users.map((user) => (
                        <div key={user.id} style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                          <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-color)' }}>
                            {user.firstName} {user.lastName}
                          </h3>
                          <p style={{ marginBottom: '0.25rem', color: 'var(--secondary)' }}>{user.email}</p>
                          <p style={{ color: 'var(--secondary)' }}>
                            Role: <span style={{ fontWeight: 600 }}>{user.role}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'courses' && (
                <div>
                  <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Course Management</h2>
                  {coursesLoading && <LoadingSpinner />}
                  {coursesError && <p style={{ color: 'var(--error-color)' }}>{coursesError}</p>}
                  {!coursesLoading && !coursesError && courses.length === 0 && (
                    <p style={{ color: 'var(--secondary)' }}>No courses found.</p>
                  )}
                  {!coursesLoading && !coursesError && courses.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                      {courses.map((course) => (
                        <div key={course.id} style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                          <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-color)' }}>{course.title}</h3>
                          <p style={{ marginBottom: '0.5rem', color: 'var(--secondary)' }}>
                            Status: <span style={{ fontWeight: 600, color: course.status === 'published' ? 'var(--primary)' : 'var(--secondary)' }}>
                              {course.status}
                            </span>
                          </p>
                          {course.status === 'draft' && (
                            <button
                              onClick={() => publishCourse(course.id)}
                              disabled={publishLoading}
                              style={{
                                padding: '0.5rem 1rem',
                                background: 'var(--primary)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 500
                              }}
                            >
                              {publishLoading ? 'Publishing...' : 'Publish Course'}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'categories' && (
                <div>
                  <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Category Management</h2>
                  {categoriesLoading && <LoadingSpinner />}
                  {categoriesError && <p style={{ color: 'var(--error-color)' }}>{categoriesError}</p>}
                  {!categoriesLoading && !categoriesError && categories.length === 0 && (
                    <p style={{ color: 'var(--secondary)' }}>No categories found.</p>
                  )}
                  {!categoriesLoading && !categoriesError && categories.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                      {categories.map((category) => (
                        <div key={category.id} style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                          <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-color)' }}>{category.name}</h3>
                          <p style={{ color: 'var(--secondary)' }}>{category.description || 'No description available'}</p>
                          {category.children && category.children.length > 0 && (
                            <div style={{ marginTop: '1rem', paddingLeft: '1rem', borderLeft: '2px solid var(--border-color)' }}>
                              <p style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--secondary)' }}>
                                Subcategories:
                              </p>
                              {category.children.map((sub) => (
                                <p key={sub.id} style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>
                                  - {sub.name}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'settings' && (
                <div>
                  <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Platform Settings</h2>
                  <p style={{ color: 'var(--secondary)' }}>Coming soon: Settings will appear here</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
