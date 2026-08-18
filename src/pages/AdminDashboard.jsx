import { useMemo, useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Users, BookOpen, Folder, Settings, User, LogOut, FileText, Pencil, Trash2, BarChart3, ShieldCheck, ShieldAlert, ChevronLeft, ChevronRight, RotateCcw, Plus, Mail, X, Loader, Wallet, Activity, Search, Award, Video, Check } from 'lucide-react';
import {
  useAdminUsers,
  useAdminCourses,
  useAdminInstructors,
  useAdminCreateCourse,
  useAdminUpdateCourse,
  useAdminDeleteCourse,
  usePublishCourse,
  usePendingKyc,
} from '../hooks/useAdminData';
import { useCategories } from '../hooks/useCategories';
import { useAdminMeetings } from '../hooks/useAdminMeetings';
import { useAdminGroups } from '../hooks/useAdminGroups';
import { useCoupons } from '../hooks/useCoupons';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import ProfileEditForm from '../components/ProfileEditForm';
import ChangePasswordForm from '../components/ChangePasswordForm';
import SessionCalendar from '../components/SessionCalendar';
import AdminContactMessages from '../components/AdminContactMessages';
import AdminStatsTab from '../components/admin/AdminStatsTab';
import PaymentsTab from '../components/admin/PaymentsTab';
import { flattenCategories, getCourseInstructorLabel } from '../components/admin/adminCourseHelpers';
import SystemHealthTab from '../components/admin/SystemHealthTab';
import AuditLogsTab from '../components/admin/AuditLogsTab';
import AdminSettingsTab from '../components/admin/AdminSettingsTab';
import AdminCategoryCard from '../components/admin/AdminCategoryCard';
import AdminCourseCard from '../components/admin/AdminCourseCard';
import AdminEditCourseDrawer from '../components/admin/AdminEditCourseDrawer';
import AdminCategoryDrawer from '../components/admin/AdminCategoryDrawer';
import AdminCreateCourseDrawer from '../components/admin/AdminCreateCourseDrawer';
import AdminUserFormDrawer from '../components/admin/AdminUserFormDrawer';
import api from '../services/api';

export default function AdminDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();

  const USERS_PER_PAGE = 10;
  const [activeTab, setActiveTabState] = useState(() => {
    // The former 'wafacash' / 'transfer' tabs are merged into one 'payments' tab.
    const normalize = (t) => (t === 'wafacash' || t === 'transfer' ? 'payments' : t);
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl) return normalize(tabFromUrl);
    const tabFromStorage = localStorage.getItem('admin_active_tab');
    if (tabFromStorage) return normalize(tabFromStorage);
    return 'users';
  });

  const setActiveTab = (newTab) => {
    setActiveTabState(newTab);
    localStorage.setItem('admin_active_tab', newTab);
    setSearchParams({ tab: newTab }, { replace: true });
  };
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [userSubTab, setUserSubTab] = useState('active');
  const [userPage, setUserPage] = useState(1);
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');
  const [userActionLoading, setUserActionLoading] = useState(null);
  const [userActionMsg, setUserActionMsg] = useState(null);
  const [adminConfirmModal, setAdminConfirmModal] = useState(null);

  // Auto-dismiss notification after 4 seconds
  useEffect(() => {
    if (userActionMsg) {
      const timer = setTimeout(() => setUserActionMsg(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [userActionMsg]);

  const {
    users,
    loading: usersLoading,
    error: usersError,
    refreshUsers,
    verifyInstructor,
    restoreUser,
    createUser,
    updateUser,
    deleteUser,
    resetPassword,
  } = useAdminUsers();
  const {
    users: pendingKycUsers,
    loading: pendingKycLoading,
    error: pendingKycError,
    refreshPendingKyc,
  } = usePendingKyc();
  const { courses, loading: coursesLoading, error: coursesError, refreshCourses } = useAdminCourses();
  const { instructors, loading: instructorsLoading } = useAdminInstructors();
  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
    refreshCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategories();
  const { createCourse, loading: createCourseLoading } = useAdminCreateCourse();
  const { updateCourse, loading: updateCourseLoading, error: updateCourseError } = useAdminUpdateCourse();
  const { deleteCourse, loading: deleteCourseLoading, error: deleteCourseError } = useAdminDeleteCourse();
  const { publishCourse, loading: publishLoading, error: publishError } = usePublishCourse();
  const { logout } = useAuth();
  const { meetings, loading: meetingsLoading, fetchMeetings, deleteMeeting: adminDeleteMeeting, updateMeeting: adminUpdateMeeting } = useAdminMeetings();
  const { 
    groups, 
    loading: groupsLoading, 
    error: groupsError, 
    refetch: refetchGroups,
    createGroup,
    updateGroup,
    addStudentToGroup,
    removeStudentFromGroup,
  } = useAdminGroups();
  const { 
    coupons, 
    loading: couponsLoading, 
    error: couponsError, 
    refetch: refetchCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
  } = useCoupons();

  const flatCategories = useMemo(() => flattenCategories(categories), [categories]);

  const deletedUsers = useMemo(() => users.filter(u => u.deletedAt), [users]);
  const activeUsers = useMemo(() => users.filter(u => !u.deletedAt), [users]);
  const unverifiedUsers = useMemo(() => activeUsers.filter(u => !u.isVerified), [activeUsers]);

  const baseSubTabUsers = userSubTab === 'deleted' ? deletedUsers
    : userSubTab === 'unverified' ? unverifiedUsers
    : userSubTab === 'kyc' ? pendingKycUsers
    : activeUsers;

  const listLoading = userSubTab === 'kyc' ? pendingKycLoading : usersLoading;
  const listError = userSubTab === 'kyc' ? pendingKycError : usersError;

  const filteredUsers = useMemo(() => {
    const normalizedSearch = userSearch.trim().toLowerCase();

    return baseSubTabUsers.filter((listedUser) => {
      const matchesRole = userRoleFilter === 'all' || (listedUser.role || '').toLowerCase() === userRoleFilter;
      const fullName = `${listedUser.firstName || ''} ${listedUser.lastName || ''}`.trim().toLowerCase();
      const email = (listedUser.email || '').toLowerCase();
      const id = (listedUser.id || '').toLowerCase();
      const matchesSearch =
        !normalizedSearch ||
        fullName.includes(normalizedSearch) ||
        email.includes(normalizedSearch) ||
        id.includes(normalizedSearch);

      return matchesRole && matchesSearch;
    });
  }, [baseSubTabUsers, userRoleFilter, userSearch]);

  const totalUserPages = Math.max(1, Math.ceil(filteredUsers.length / USERS_PER_PAGE));
  const paginatedUsers = useMemo(() => {
    const start = (userPage - 1) * USERS_PER_PAGE;
    return filteredUsers.slice(start, start + USERS_PER_PAGE);
  }, [filteredUsers, userPage]);

  const [adminCourseSearch, setAdminCourseSearch] = useState('');
  const [adminCourseCategoryFilter, setAdminCourseCategoryFilter] = useState('');
  const [adminCourseStatusFilter, setAdminCourseStatusFilter] = useState('all');

  const filteredAllCourses = useMemo(() => {
    return courses.filter((c) => {
      const titleMatch = (c.title || '').toLowerCase().includes(adminCourseSearch.toLowerCase());
      const instructorLabel = getCourseInstructorLabel(c).toLowerCase();
      const instructorMatch = instructorLabel.includes(adminCourseSearch.toLowerCase());
      const categoryMatch = !adminCourseCategoryFilter || c.categoryId === adminCourseCategoryFilter || c.category?.id === adminCourseCategoryFilter;
      
      const currentStatus = (c.status || 'draft').toLowerCase();
      const statusMatch = adminCourseStatusFilter === 'all' || currentStatus === adminCourseStatusFilter.toLowerCase();

      return (titleMatch || instructorMatch) && categoryMatch && statusMatch;
    });
  }, [courses, adminCourseSearch, adminCourseCategoryFilter, adminCourseStatusFilter]);

  const [, setShowAddForm] = useState(false);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catParentId, setCatParentId] = useState('');
  const [, setCreateLoading] = useState(false);
  const [, setCreateError] = useState(null);
  const [, setCreateSuccess] = useState(false);
  const [categoryActionError, setCategoryActionError] = useState(null);
  const [categorySuccess, setCategorySuccess] = useState('');

  // Category Drawer state
  const [showCategoryDrawer, setShowCategoryDrawer] = useState(false);
  const [editingCategoryData, setEditingCategoryData] = useState(null);
  const [drawerCategoryParentId, setDrawerCategoryParentId] = useState('');
  const [categoryDrawerLoading, setCategoryDrawerLoading] = useState(false);
  const [categoryDrawerError, setCategoryDrawerError] = useState(null);

  const [showCreateCourseDrawer, setShowCreateCourseDrawer] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [courseThumbnail, setCourseThumbnail] = useState('');
  const [courseCategoryId, setCourseCategoryId] = useState('');
  const [coursePrice, setCoursePrice] = useState('');
  const [courseLevel, setCourseLevel] = useState('');
  const [courseInstructorId, setCourseInstructorId] = useState('');
  const [createCourseError, setCreateCourseError] = useState(null);
  const [, setCreateCourseSuccess] = useState(false);
  const [courseActionSuccess, setCourseActionSuccess] = useState('');

  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userFormData, setUserFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'student',
    bio: '',
  });
  const [userFormLoading, setUserFormLoading] = useState(false);
  const [userFormError, setUserFormError] = useState(null);

  const [, setSelectedCouponForUsage] = useState(null);
  const [, setCouponUsageLoading] = useState(false);
  const [, setCouponUsageData] = useState([]);

  const [showGroupForm, setShowGroupForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [groupFormData, setGroupFormData] = useState({
    name: '',
    description: '',
    courseId: '',
    formateurId: '',
  });
  const [groupFormLoading, setGroupFormLoading] = useState(false);
  const [groupFormError, setGroupFormError] = useState(null);

  const [showGroupStudentsModal, setShowGroupStudentsModal] = useState(false);
  const [selectedGroupForStudents, setSelectedGroupForStudents] = useState(null);
  const [groupStudentsLoading, setGroupStudentsLoading] = useState(false);
  // The course's PAID students — the pool eligible to be assigned to the group.
  const [groupCoursePaidStudents, setGroupCoursePaidStudents] = useState([]);
  // Bulk selection: ids of students checked in the picker, + in-flight flag.
  const [selectedGroupStudentIds, setSelectedGroupStudentIds] = useState([]);
  const [bulkAdding, setBulkAdding] = useState(false);

  const [showCouponForm, setShowCouponForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [couponFormData, setCouponFormData] = useState({
    code: '',
    discount: '',
    expirationDate: '',
    maxUsage: 100,
    isActive: true,
    courseId: '',
  });
  const [couponFormLoading, setCouponFormLoading] = useState(false);
  const [couponFormError, setCouponFormError] = useState(null);
  // Synchronous re-entrancy guard: the button's disabled state depends on an
  // async React update, so a rapid double-fire (double-click / Enter+click)
  // would send two POSTs before it disables. This blocks the 2nd immediately.
  const couponSubmitLock = useRef(false);

  const [updateRequests, setUpdateRequests] = useState([]);
  const [updateRequestsLoading, setUpdateRequestsLoading] = useState(false);
  const [updateRequestsError, setUpdateRequestsError] = useState(null);
  const [updateRequestStatusFilter, setUpdateRequestStatusFilter] = useState('all');
  const [selectedUpdateRequest, setSelectedUpdateRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingUpdateRequest, setProcessingUpdateRequest] = useState(null);

  const handleLoadCouponUsage = async (coupon) => {
    setSelectedCouponForUsage(coupon);
    setCouponUsageLoading(true);
    setCouponUsageData([]);
    try {
      const response = await api.get(`/coupons/${coupon.id}/usage`);
      const payments = response.data?.data?.payments || response.data?.payments || response.data || [];
      setCouponUsageData(Array.isArray(payments) ? payments : []);
    } catch (err) {
      console.error('Failed to load coupon usage:', err);
      setCouponUsageData([]);
    } finally {
      setCouponUsageLoading(false);
    }
  };

  const handleCreateGroupClick = () => {
    setEditingGroup(null);
    setGroupFormData({ name: '', description: '', courseId: '', formateurId: '' });
    setGroupFormError(null);
    setShowGroupForm(true);
  };

  const handleEditGroupClick = (group) => {
    setEditingGroup(group);
    setGroupFormData({
      name: group.name || '',
      description: group.description || '',
      courseId: group.courseId || '',
      formateurId: group.formateurId || '',
    });
    setGroupFormError(null);
    setShowGroupForm(true);
  };

  const handleGroupFormSubmit = async (e) => {
    e.preventDefault();
    setGroupFormLoading(true);
    setGroupFormError(null);
    try {
      const payload = {
        name: groupFormData.name.trim(),
        description: groupFormData.description.trim(),
        ...(groupFormData.courseId && { courseId: groupFormData.courseId }),
        formateurId: groupFormData.formateurId,
      };

      if (editingGroup) {
        await updateGroup(editingGroup.id, payload);
        setUserActionMsg({ type: 'success', text: 'Groupe mis à jour avec succès.' });
      } else {
        await createGroup(payload);
        setUserActionMsg({ type: 'success', text: 'Groupe créé avec succès.' });
      }
      await refetchGroups();
      setShowGroupForm(false);
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.response?.data?.message || 'Erreur lors de l\'enregistrement du groupe.';
      setGroupFormError(msg);
    } finally {
      setGroupFormLoading(false);
    }
  };

  const toggleGroupStudent = (userId) => {
    setSelectedGroupStudentIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  // Add every checked student to the group. Uses the single-add endpoint per
  // student so per-student rejections (e.g. already in another group for this
  // course) are surfaced individually rather than failing the whole batch.
  const handleAddSelectedToGroup = async (groupId) => {
    const ids = [...selectedGroupStudentIds];
    if (ids.length === 0) return;
    setBulkAdding(true);
    setUserActionMsg(null);
    let added = 0;
    const failures = [];
    for (const userId of ids) {
      try {
        await addStudentToGroup(groupId, userId);
        added += 1;
      } catch (err) {
        const name = getAvailableStudentsForGroup().find((s) => s.id === userId);
        failures.push(`${name ? `${name.firstName} ${name.lastName}` : userId}: ${err.response?.data?.error?.message || err.response?.data?.message || 'échec'}`);
      }
    }
    setSelectedGroupStudentIds([]);
    await refetchGroups();
    // Refresh the open picker's membership so added students leave the pool.
    if (selectedGroupForStudents?.id === groupId) {
      try {
        const response = await api.get(`/groups/${groupId}`);
        setSelectedGroupForStudents(response.data?.data?.group || response.data?.group || selectedGroupForStudents);
      } catch { /* keep current view */ }
    }
    setUserActionMsg(
      failures.length === 0
        ? { type: 'success', text: `${added} étudiant(s) ajouté(s) au groupe.` }
        : { type: added ? 'success' : 'error', text: `${added} ajouté(s). Échecs — ${failures.join(' ; ')}` }
    );
    setBulkAdding(false);
  };

  const handleRemoveStudentFromGroup = async (groupId, userId) => {
    try {
      await removeStudentFromGroup(groupId, userId);
      setUserActionMsg({ type: 'success', text: 'Étudiant retiré du groupe avec succès.' });
      await refetchGroups();
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.response?.data?.message || 'Impossible de retirer l\'étudiant du groupe.';
      setUserActionMsg({ type: 'error', text: msg });
    }
  };

  const handleManageGroupStudents = async (group) => {
    setSelectedGroupForStudents(group);
    setGroupCoursePaidStudents([]);
    setSelectedGroupStudentIds([]);
    setGroupStudentsLoading(true);
    try {
      const response = await api.get(`/groups/${group.id}`);
      const loadedGroup = response.data?.data?.group || response.data?.group || group;
      setSelectedGroupForStudents(loadedGroup);

      // Eligible pool: the course's PAID students, from the authoritative
      // endpoint (already filtered to PAID) rather than the client-side
      // enrollments list, which is truncated and ignores payment status.
      if (loadedGroup.courseId) {
        try {
          const studentsRes = await api.get(`/courses/${loadedGroup.courseId}/students`, {
            params: { limit: 500 },
          });
          setGroupCoursePaidStudents(studentsRes.data?.data?.students || studentsRes.data?.data || []);
        } catch (studentsErr) {
          console.error('Failed to load paid students for course:', studentsErr);
          setGroupCoursePaidStudents([]);
        }
      }
    } catch (err) {
      console.error('Failed to load group students:', err);
    } finally {
      setGroupStudentsLoading(false);
    }
    setShowGroupStudentsModal(true);
  };

  const getAvailableStudentsForGroup = () => {
    if (!selectedGroupForStudents) return [];

    // Members already in the group (so we can exclude them from the picker).
    const memberIds = new Set(
      (selectedGroupForStudents.students || []).map(m => m.user?.id).filter(Boolean)
    );

    // A course-bound group draws from the course's PAID students only.
    if (selectedGroupForStudents.courseId) {
      return groupCoursePaidStudents.filter(s => !memberIds.has(s.id));
    }

    // A group with no course: any active student/employee not already a member.
    return activeUsers
      .filter(u => u.role === 'student' || u.role === 'employee')
      .filter(u => !memberIds.has(u.id));
  };

  const handleDeleteGroup = (groupId, groupName) => {
    setAdminConfirmModal({
      type: 'delete',
      title: 'Supprimer le groupe',
      description: `Êtes-vous sûr de vouloir supprimer le groupe "${groupName}" ? Cette action est irréversible.`,
      icon: <Trash2 size={24} color="#dc2626" />,
      btnColor: '#dc2626',
      btnText: 'Oui, supprimer',
      onConfirm: async () => {
        setUserActionLoading(groupId);
        setUserActionMsg(null);
        try {
          await deleteGroup(groupId);
          setUserActionMsg({ type: 'success', text: `Le groupe "${groupName}" a été supprimé avec succès.` });
          await refetchGroups();
        } catch (err) {
          const msg = err.response?.data?.error?.message || err.response?.data?.message || 'Impossible de supprimer ce groupe.';
          setUserActionMsg({ type: 'error', text: msg });
        } finally {
          setUserActionLoading(null);
          setAdminConfirmModal(null);
        }
      },
    });
  };

  const handleCreateCouponClick = () => {
    setEditingCoupon(null);
    setCouponFormData({ code: '', discount: '', expirationDate: '', maxUsage: 100, isActive: true, courseId: '' });
    setCouponFormError(null);
    setShowCouponForm(true);
  };

  const handleEditCouponClick = (coupon) => {
    setEditingCoupon(coupon);
    setCouponFormData({
      code: coupon.code || '',
      discount: coupon.discount || '',
      expirationDate: coupon.expirationDate ? coupon.expirationDate.split('T')[0] : '',
      maxUsage: coupon.maxUsage || 100,
      isActive: coupon.isActive !== undefined ? coupon.isActive : true,
      courseId: coupon.courseId || '',
    });
    setCouponFormError(null);
    setShowCouponForm(true);
  };

  const handleCouponFormSubmit = async (e) => {
    e.preventDefault();
    if (couponSubmitLock.current) return; // drop the racing 2nd submit
    couponSubmitLock.current = true;
    setCouponFormLoading(true);
    setCouponFormError(null);
    try {
      const payload = {
        code: couponFormData.code.trim().toUpperCase(),
        discount: parseFloat(couponFormData.discount),
        expirationDate: new Date(couponFormData.expirationDate).toISOString(),
        maxUsage: parseInt(couponFormData.maxUsage),
        isActive: couponFormData.isActive,
        // Empty = global coupon (valid for all courses); a value scopes it.
        courseId: couponFormData.courseId || null,
      };

      if (editingCoupon) {
        await updateCoupon(editingCoupon.id, payload);
        setUserActionMsg({ type: 'success', text: 'Coupon mis à jour avec succès.' });
      } else {
        await createCoupon(payload);
        setUserActionMsg({ type: 'success', text: 'Coupon créé avec succès.' });
      }
      await refetchCoupons();
      setShowCouponForm(false);
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.response?.data?.message || 'Erreur lors de l\'enregistrement du coupon.';
      setCouponFormError(msg);
    } finally {
      setCouponFormLoading(false);
      couponSubmitLock.current = false;
    }
  };

  const handleDeleteCoupon = (couponId, couponCode) => {
    setAdminConfirmModal({
      type: 'delete',
      title: 'Supprimer le coupon',
      description: `Êtes-vous sûr de vouloir supprimer le coupon "${couponCode}" ? Cette action est irréversible.`,
      icon: <Trash2 size={24} color="#dc2626" />,
      btnColor: '#dc2626',
      btnText: 'Oui, supprimer',
      onConfirm: async () => {
        setUserActionLoading(couponId);
        setUserActionMsg(null);
        try {
          await deleteCoupon(couponId);
          setUserActionMsg({ type: 'success', text: `Le coupon "${couponCode}" a été supprimé avec succès.` });
          await refetchCoupons();
        } catch (err) {
          const msg = err.response?.data?.error?.message || err.response?.data?.message || 'Impossible de supprimer ce coupon.';
          setUserActionMsg({ type: 'error', text: msg });
        } finally {
          setUserActionLoading(null);
          setAdminConfirmModal(null);
        }
      },
    });
  };

  const handleVerifyUser = async (userId, role, isVerified = true) => {
    setUserActionLoading(userId);
    setUserActionMsg(null);
    try {
      const effectiveRole = (role || '').toLowerCase() || 'instructor';
      // Students self-verify by email; admins only verify instructors (KYC).
      if (effectiveRole !== 'instructor') {
        setUserActionMsg({ type: 'error', text: 'Les étudiants confirment leur email eux-mêmes — aucune action admin requise.' });
        return;
      }
      await verifyInstructor(userId, isVerified);
      await refreshUsers();
      await refreshPendingKyc();
      setUserActionMsg({ type: 'success', text: isVerified ? 'Instructeur vérifié avec succès.' : 'Vérification retirée.' });
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.error?.message || err.response?.data?.message;
      if (status === 404) {
        setUserActionMsg({ type: 'error', text: 'Endpoint de vérification non disponible. Vérifiez que le backend implémente PATCH /admin/users/:id/verify.' });
      } else {
        setUserActionMsg({ type: 'error', text: msg || 'Impossible de vérifier cet instructeur.' });
      }
    } finally {
      setUserActionLoading(null);
    }
  };

  const handleCreateUserClick = () => {
    setEditingUser(null);
    setUserFormData({ firstName: '', lastName: '', email: '', password: '', role: 'student', bio: '' });
    setUserFormError(null);
    setShowUserForm(true);
  };

  const handleEditUserClick = (listedUser) => {
    setEditingUser(listedUser);
    setUserFormData({
      firstName: listedUser.firstName || '',
      lastName: listedUser.lastName || '',
      email: listedUser.email || '',
      password: '',
      role: listedUser.role || 'student',
      bio: listedUser.bio || '',
    });
    setUserFormError(null);
    setShowUserForm(true);
  };

  const handleUserFormSubmit = async (e) => {
    e.preventDefault();
    setUserFormLoading(true);
    setUserFormError(null);
    try {
      const payload = {
        firstName: userFormData.firstName.trim(),
        lastName: userFormData.lastName.trim(),
        email: userFormData.email.trim(),
        role: userFormData.role,
        bio: userFormData.bio.trim(),
      };

      if (editingUser) {
        if (userFormData.password.trim()) payload.password = userFormData.password.trim();
        await updateUser(editingUser.id, payload);
        setUserActionMsg({ type: 'success', text: 'Utilisateur mis à jour avec succès.' });
      } else {
        payload.password = userFormData.password.trim();
        await createUser(payload);
        setUserActionMsg({ type: 'success', text: 'Utilisateur créé avec succès.' });
      }
      await refreshUsers();
      await refreshPendingKyc();
      setShowUserForm(false);
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.error?.message || err.response?.data?.message;
      if (status === 404) {
        setUserFormError(editingUser
          ? 'Endpoint de mise à jour non disponible. Implémentez PATCH /admin/users/:userId côté backend.'
          : 'Endpoint de création non disponible. Implémentez POST /admin/users côté backend.');
      } else {
        setUserFormError(msg || 'Erreur lors de l\'enregistrement de l\'utilisateur.');
      }
    } finally {
      setUserFormLoading(false);
    }
  };

  const handleDeleteUser = (userId, userName) => {
    setAdminConfirmModal({
      type: 'delete',
      title: 'Supprimer l\'utilisateur',
      description: `Êtes-vous sûr de vouloir supprimer l'utilisateur "${userName}" ? Son compte sera immédiatement désactivé.`,
      icon: <Trash2 size={24} color="#dc2626" />,
      btnColor: '#dc2626',
      btnText: 'Oui, supprimer',
      onConfirm: async () => {
        setUserActionLoading(userId);
        setUserActionMsg(null);
        try {
          await deleteUser(userId);
          await refreshUsers();
          await refreshPendingKyc();
          setUserActionMsg({ type: 'success', text: `Le compte de "${userName}" a été supprimé avec succès.` });
        } catch (err) {
          const msg = err.response?.data?.error?.message || err.response?.data?.message;
          setUserActionMsg({ type: 'error', text: msg || 'Impossible de supprimer cet utilisateur.' });
        } finally {
          setUserActionLoading(null);
          setAdminConfirmModal(null);
        }
      },
    });
  };

  const handleResetPassword = (userId, userName) => {
    setAdminConfirmModal({
      type: 'resetPassword',
      title: 'Réinitialiser le mot de passe',
      description: `Voulez-vous envoyer un e-mail de réinitialisation de mot de passe à "${userName}" ? Un lien sécurisé valable 5 minutes lui sera immédiatement envoyé.`,
      icon: <Mail size={24} color="var(--primary)" />,
      btnColor: 'var(--primary)',
      btnText: 'Envoyer l\'e-mail',
      onConfirm: async () => {
        setUserActionLoading(userId);
        setUserActionMsg(null);
        try {
          await resetPassword(userId);
          setUserActionMsg({ type: 'success', text: `E-mail de réinitialisation envoyé avec succès à "${userName}".` });
        } catch (err) {
          const msg = err.response?.data?.error?.message || err.response?.data?.message;
          setUserActionMsg({ type: 'error', text: msg || 'Impossible d\'envoyer l\'e-mail de réinitialisation.' });
        } finally {
          setUserActionLoading(null);
          setAdminConfirmModal(null);
        }
      },
    });
  };

  const handleRestoreUser = (userId, userName) => {
    setAdminConfirmModal({
      type: 'restore',
      title: 'Restaurer le compte utilisateur',
      description: `Voulez-vous restaurer le compte de "${userName}" ? L'utilisateur retrouvera immédiatement l'accès à son compte.`,
      icon: <RotateCcw size={24} color="#1565c0" />,
      btnColor: '#1565c0',
      btnText: 'Restaurer le compte',
      onConfirm: async () => {
        setUserActionLoading(userId);
        setUserActionMsg(null);
        try {
          await restoreUser(userId);
          await refreshUsers();
          setUserActionMsg({ type: 'success', text: `Le compte de "${userName}" a été restauré avec succès.` });
        } catch (err) {
          const msg = err.response?.data?.error?.message || err.response?.data?.message;
          setUserActionMsg({ type: 'error', text: msg || 'Impossible de restaurer cet utilisateur.' });
        } finally {
          setUserActionLoading(null);
          setAdminConfirmModal(null);
        }
      },
    });
  };

  const handleUserSubTabChange = (tab) => {
    setUserSubTab(tab);
    setUserPage(1);
    setUserSearch('');
    setUserRoleFilter('all');
    setUserActionMsg(null);
  };

  const _handleCreateCategory = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError(null);
    setCreateSuccess(false);
    setCategorySuccess('');
    try {
      const payload = { name: catName.trim() };
      if (catDesc.trim()) payload.description = catDesc.trim();
      if (catParentId) payload.parentId = catParentId;
      await createCategory(payload);
      setCreateSuccess(true);
      setCategorySuccess('Catégorie créée avec succès.');
      setCatName('');
      setCatDesc('');
      setCatParentId('');
      setTimeout(() => {
        setShowAddForm(false);
        setCreateSuccess(false);
      }, 1500);
    } catch (err) {
      console.error(err);
      setCreateError(err.response?.data?.error?.message || err.response?.data?.message || 'Erreur lors de la création de la catégorie.');
    } finally {
      setCreateLoading(false);
    }
  };

  const _handleUpdateCategory = async (categoryId, form) => {
    setCategoryActionError(null);
    setCategorySuccess('');
    try {
      const payload = { name: form.name.trim() };
      if (form.description.trim()) payload.description = form.description.trim();
      if (form.icon) payload.icon = form.icon;
      if (form.parentId) payload.parentId = form.parentId;
      await updateCategory(categoryId, payload);
      setCategorySuccess('Catégorie mise à jour avec succès.');
    } catch (err) {
      setCategoryActionError(
        err.response?.data?.error?.message ||
          err.response?.data?.message ||
          'Erreur lors de la mise à jour de la catégorie.'
      );
      throw err;
    }
  };

  const handleDeleteCategory = async (categoryId, categoryName) => {
    setAdminConfirmModal({
      type: 'delete',
      title: 'Supprimer la catégorie',
      description: `Êtes-vous sûr de vouloir supprimer la catégorie "${categoryName}" ? Cette action est irréversible et pourrait affecter les cours associés.`,
      icon: <Trash2 size={24} color="#dc2626" />,
      btnColor: '#dc2626',
      btnText: 'Oui, supprimer',
      onConfirm: async () => {
        setUserActionLoading(categoryId);
        setCategoryActionError(null);
        setCategorySuccess('');
        try {
          await deleteCategory(categoryId);
          setCategorySuccess('Catégorie supprimée avec succès.');
          await refreshCategories();
        } catch (err) {
          setCategoryActionError(
            err.response?.data?.error?.message ||
              err.response?.data?.message ||
              'Erreur lors de la suppression de la catégorie.'
          );
        } finally {
          setUserActionLoading(null);
          setAdminConfirmModal(null);
        }
      },
    });
  };

  const handleOpenCreateCategoryDrawer = () => {
    setEditingCategoryData(null);
    setDrawerCategoryParentId('');
    setCategoryDrawerError(null);
    setShowCategoryDrawer(true);
  };

  const handleOpenEditCategoryDrawer = (category) => {
    setEditingCategoryData(category);
    setDrawerCategoryParentId(category.parentId || '');
    setCategoryDrawerError(null);
    setShowCategoryDrawer(true);
  };

  const handleOpenAddSubcategoryDrawer = (parentId) => {
    setEditingCategoryData(null);
    setDrawerCategoryParentId(parentId);
    setCategoryDrawerError(null);
    setShowCategoryDrawer(true);
  };

  const handleCategoryDrawerSave = async (categoryId, payload) => {
    setCategoryDrawerLoading(true);
    setCategoryDrawerError(null);
    try {
      if (categoryId) {
        await updateCategory(categoryId, payload);
        setCategorySuccess('Catégorie mise à jour avec succès.');
      } else {
        await createCategory(payload);
        setCategorySuccess('Catégorie créée avec succès.');
      }
      await refreshCategories();
      setShowCategoryDrawer(false);
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.response?.data?.message || 'Erreur lors de l\'enregistrement.';
      setCategoryDrawerError(msg);
      throw err;
    } finally {
      setCategoryDrawerLoading(false);
    }
  };

  const _handleCreateCourse = async (e) => {
    e.preventDefault();
    setCreateCourseError(null);
    setCreateCourseSuccess(false);
    setCourseActionSuccess('');
    try {
      const payload = {
        title: courseTitle.trim(),
        description: courseDescription.trim(),
        categoryId: courseCategoryId,
        price: parseFloat(coursePrice),
        instructorId: courseInstructorId,
      };
      if (courseThumbnail.trim()) payload.thumbnail = courseThumbnail.trim();
      if (courseLevel) payload.level = courseLevel;

      await createCourse(payload);
      setCreateCourseSuccess(true);
      setCourseActionSuccess('Cours créé avec succès.');
      setCourseTitle('');
      setCourseDescription('');
      setCourseThumbnail('');
      setCourseCategoryId('');
      setCoursePrice('');
      setCourseLevel('');
      setCourseInstructorId('');
      await refreshCourses();
      setTimeout(() => {
        setShowCreateCourseModal(false);
        setCreateCourseSuccess(false);
      }, 1500);
    } catch (err) {
      console.error(err);
      setCreateCourseError(
        err.response?.data?.error?.message ||
          err.response?.data?.message ||
          'Erreur lors de la création du cours.'
      );
    }
  };

  const handleOpenCreateCourseModal = () => {
    setShowCreateCourseDrawer(true);
  };

  const handleOpenEditCourseModal = (course) => {
    setEditingCourse(course);
  };

  const handleCreateCourseSubmit = async (payload) => {
    await createCourse(payload);
    await refreshCourses();
    setCourseActionSuccess('Cours créé avec succès.');
  };

  const handleUpdateCourse = async (courseId, form) => {
    setCourseActionSuccess('');
    const payload = {
      title: form.title.trim(),
      categoryId: form.categoryId,
      price: parseFloat(form.price),
    };

    if (form.description.trim()) payload.description = form.description.trim();
    if (form.thumbnail.trim()) payload.thumbnail = form.thumbnail.trim();
    if (form.level) payload.level = form.level;
    if (form.status) payload.status = form.status;
    if (form.instructorId) payload.instructorId = form.instructorId;

    await updateCourse(courseId, payload);
    await refreshCourses();
    setCourseActionSuccess('Cours mis à jour avec succès.');
  };

  const handleDeleteCourse = async (courseId, courseTitle) => {
    const confirmed = window.confirm(`Supprimer le cours "${courseTitle}" ?`);
    if (!confirmed) return;

    setCourseActionSuccess('');
    try {
      await deleteCourse(courseId);
      await refreshCourses();
      setCourseActionSuccess('Cours supprimé avec succès.');
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdminMeetingEdit = async (meetingId, { title, meetingDate }) => {
    try {
      await adminUpdateMeeting(meetingId, { title, meetingDate });
    } catch (err) {
      console.error('Failed to update meeting:', err);
    }
  };

  const handleAdminMeetingDelete = async (meetingId) => {
    try {
      await adminDeleteMeeting(meetingId);
    } catch (err) {
      console.error('Failed to delete meeting:', err);
    }
  };

  // Fetch meetings when meetings tab is active
  useEffect(() => {
    if (activeTab === 'meetings') {
      fetchMeetings();
    }
  }, [activeTab, fetchMeetings]);

  // Fetch update requests when update-requests tab is active
  useEffect(() => {
    const fetchUpdateRequests = async () => {
      if (activeTab === 'update-requests') {
        setUpdateRequestsLoading(true);
        setUpdateRequestsError(null);
        try {
          const response = await api.get('/admin/update-requests', {
            params: updateRequestStatusFilter !== 'all' ? { status: updateRequestStatusFilter } : {}
          });
          const requests = response.data?.data?.updateRequests || response.data?.data || [];
          setUpdateRequests(Array.isArray(requests) ? requests : []);
        } catch (err) {
          setUpdateRequestsError(err.response?.data?.error?.message || err.response?.data?.message || 'Failed to fetch update requests');
          setUpdateRequests([]);
        } finally {
          setUpdateRequestsLoading(false);
        }
      }
    };
    fetchUpdateRequests();
  }, [activeTab, updateRequestStatusFilter]);

  const handleApproveUpdateRequest = async (requestId) => {
    setProcessingUpdateRequest(requestId);
    try {
      await api.patch(`/admin/update-requests/${requestId}/approve`);
      setUserActionMsg({ type: 'success', text: 'Demande de mise à jour approuvée avec succès.' });
      // Refresh update requests
      const response = await api.get('/admin/update-requests', {
        params: updateRequestStatusFilter !== 'all' ? { status: updateRequestStatusFilter } : {}
      });
      const requests = response.data?.data?.updateRequests || response.data?.data || [];
      setUpdateRequests(Array.isArray(requests) ? requests : []);
    } catch (err) {
      setUserActionMsg({ type: 'error', text: err.response?.data?.error?.message || err.response?.data?.message || 'Failed to approve update request' });
    } finally {
      setProcessingUpdateRequest(null);
    }
  };

  const handleRejectUpdateRequest = async (requestId) => {
    if (!rejectionReason.trim()) {
      setUserActionMsg({ type: 'error', text: 'Veuillez fournir une raison pour le rejet.' });
      return;
    }
    setProcessingUpdateRequest(requestId);
    try {
      await api.patch(`/admin/update-requests/${requestId}/reject`, { rejectionReason: rejectionReason.trim() });
      setUserActionMsg({ type: 'success', text: 'Demande de mise à jour rejetée avec succès.' });
      setRejectionReason('');
      setSelectedUpdateRequest(null);
      // Refresh update requests
      const response = await api.get('/admin/update-requests', {
        params: updateRequestStatusFilter !== 'all' ? { status: updateRequestStatusFilter } : {}
      });
      const requests = response.data?.data?.updateRequests || response.data?.data || [];
      setUpdateRequests(Array.isArray(requests) ? requests : []);
    } catch (err) {
      setUserActionMsg({ type: 'error', text: err.response?.data?.error?.message || err.response?.data?.message || 'Failed to reject update request' });
    } finally {
      setProcessingUpdateRequest(null);
    }
  };

  const handlePublishCourse = async (courseId) => {
    setCourseActionSuccess('');
    try {
      await publishCourse(courseId);
      await refreshCourses();
      setCourseActionSuccess('Le cours a été publié avec succès.');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)' }}>
      <Navbar
        extraDockOptions={[
          { label: 'Users', Icon: <Users size={16} />, onClick: () => setActiveTab('users') },
          { label: 'Courses', Icon: <BookOpen size={16} />, onClick: () => setActiveTab('courses') },
          { label: 'Categories', Icon: <Folder size={16} />, onClick: () => setActiveTab('categories') },
          { label: 'Groupes', Icon: <Users size={16} />, onClick: () => setActiveTab('groups') },
          { label: 'Coupons', Icon: <Award size={16} />, onClick: () => setActiveTab('coupons') },
          { label: 'Sessions', Icon: <Video size={16} />, onClick: () => setActiveTab('meetings') },
          { label: 'Statistiques', Icon: <BarChart3 size={16} />, onClick: () => setActiveTab('stats') },
          { label: 'Paiements', Icon: <Wallet size={16} />, onClick: () => setActiveTab('payments') },
          { label: 'Demandes', Icon: <FileText size={16} />, onClick: () => setActiveTab('update-requests') },
          { label: "Journal d'audit", Icon: <FileText size={16} />, onClick: () => setActiveTab('audit') },
          { label: 'Santé système', Icon: <Activity size={16} />, onClick: () => setActiveTab('health') },
          { label: 'Settings', Icon: <Settings size={16} />, onClick: () => setActiveTab('settings') },
          { label: 'Messages Contact', Icon: <Mail size={16} />, onClick: () => setActiveTab('contact') },
          { label: 'Mon Profil', Icon: <User size={16} />, onClick: () => setActiveTab('profile') },
        ]}
      />

      <div className="dashboard-layout">
        <aside className={`dashboard-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="sidebar-toggle-btn"
            title={sidebarCollapsed ? "Déplier le menu" : "Réduire le menu"}
          >
            {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>

          <nav className="sidebar-menu">
            <button
              onClick={() => setActiveTab('users')}
              className={`sidebar-menu-btn ${activeTab === 'users' ? 'active' : ''}`}
              title="Users"
            >
              <Users size={18} />
              <span>Users</span>
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              className={`sidebar-menu-btn ${activeTab === 'courses' ? 'active' : ''}`}
              title="Courses"
            >
              <BookOpen size={18} />
              <span>Courses</span>
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`sidebar-menu-btn ${activeTab === 'categories' ? 'active' : ''}`}
              title="Categories"
            >
              <Folder size={18} />
              <span>Categories</span>
            </button>
            <button
              onClick={() => setActiveTab('groups')}
              className={`sidebar-menu-btn ${activeTab === 'groups' ? 'active' : ''}`}
              title="Groupes"
            >
              <Users size={18} />
              <span>Groupes</span>
            </button>
            <button
              onClick={() => setActiveTab('coupons')}
              className={`sidebar-menu-btn ${activeTab === 'coupons' ? 'active' : ''}`}
              title="Coupons"
            >
              <Award size={18} />
              <span>Coupons</span>
            </button>
            <button
              onClick={() => setActiveTab('meetings')}
              className={`sidebar-menu-btn ${activeTab === 'meetings' ? 'active' : ''}`}
              title="Sessions"
            >
              <Video size={18} />
              <span>Sessions</span>
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`sidebar-menu-btn ${activeTab === 'stats' ? 'active' : ''}`}
              title="Statistiques"
            >
              <BarChart3 size={18} />
              <span>Statistiques</span>
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`sidebar-menu-btn ${activeTab === 'payments' ? 'active' : ''}`}
              title="Paiements (Wafacash & Virements)"
            >
              <Wallet size={18} />
              <span>Paiements</span>
            </button>
            <button
              onClick={() => setActiveTab('update-requests')}
              className={`sidebar-menu-btn ${activeTab === 'update-requests' ? 'active' : ''}`}
              title="Demandes de mise à jour"
            >
              <FileText size={18} />
              <span>Demandes de mise à jour</span>
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`sidebar-menu-btn ${activeTab === 'audit' ? 'active' : ''}`}
              title="Journal d'audit"
            >
              <FileText size={18} />
              <span>Journal d'audit</span>
            </button>
            <button
              onClick={() => setActiveTab('health')}
              className={`sidebar-menu-btn ${activeTab === 'health' ? 'active' : ''}`}
              title="Santé système"
            >
              <Activity size={18} />
              <span>Santé système</span>
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={`sidebar-menu-btn ${activeTab === 'contact' ? 'active' : ''}`}
              title="Messages Contact"
            >
              <Mail size={18} />
              <span>Messages Contact</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`sidebar-menu-btn ${activeTab === 'settings' ? 'active' : ''}`}
              title="Settings"
            >
              <Settings size={18} />
              <span>Settings</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`sidebar-menu-btn ${['profile', 'security'].includes(activeTab) ? 'active' : ''}`}
              title="Mon Profil & Sécurité"
            >
              <User size={18} />
              <span>Mon Profil & Sécurité</span>
            </button>
            <button
              onClick={() => {
                logout();
                window.location.href = '/login';
              }}
              className="sidebar-menu-btn"
              style={{ marginTop: 'auto', color: 'var(--error-color)' }}
              title="Déconnexion"
            >
              <LogOut size={18} />
              <span>Déconnexion</span>
            </button>
          </nav>
        </aside>

        <main className="dashboard-main-content">
          <div key={activeTab} className="tab-panel" style={{ background: '#fff', padding: '2rem', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
              {activeTab === 'contact' && <AdminContactMessages />}
              {activeTab === 'users' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                      <h2 style={{ marginBottom: '0.4rem', fontSize: '1.5rem' }}>User Management</h2>
                      <p style={{ color: 'var(--secondary)' }}>
                        Gérez les utilisateurs actifs, non vérifiés, en attente de KYC et supprimés.
                      </p>
                    </div>
                    <button
                      onClick={handleCreateUserClick}
                      className="btn-primary"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', fontSize: '0.9rem', cursor: 'pointer' }}
                    >
                      <Plus size={16} />
                      Créer un utilisateur
                    </button>
                  </div>

                  {/* Sub-tabs */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    {[
                      { key: 'active', label: 'Actifs', icon: <Users size={15} />, count: activeUsers.length },
                      { key: 'unverified', label: 'Non vérifiés', icon: <ShieldAlert size={15} />, count: unverifiedUsers.length },
                      { key: 'kyc', label: 'KYC en attente', icon: <ShieldCheck size={15} />, count: pendingKycUsers.length },
                      { key: 'deleted', label: 'Supprimés', icon: <Trash2 size={15} />, count: deletedUsers.length },
                    ].map(tab => (
                      <button
                        key={tab.key}
                        onClick={() => handleUserSubTabChange(tab.key)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
                          padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.88rem', fontWeight: 600,
                          cursor: 'pointer', border: '1.5px solid',
                          borderColor: userSubTab === tab.key ? 'var(--primary)' : 'var(--border-color)',
                          background: userSubTab === tab.key ? 'rgba(193,101,47,0.08)' : '#fff',
                          color: userSubTab === tab.key ? 'var(--primary)' : 'var(--secondary)',
                          transition: 'all 0.15s',
                        }}
                      >
                        {tab.icon}
                        {tab.label}
                        <span style={{
                          marginLeft: '0.15rem', padding: '0.1rem 0.5rem', borderRadius: '9999px',
                          fontSize: '0.75rem', fontWeight: 700,
                          background: userSubTab === tab.key ? 'var(--primary)' : 'var(--border-color)',
                          color: userSubTab === tab.key ? '#fff' : 'var(--secondary)',
                        }}>
                          {tab.count}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Action message */}
                  {userActionMsg && (
                    <div style={{
                      padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem',
                      background: userActionMsg.type === 'success' ? '#d4edda' : '#f8d7da',
                      border: `1px solid ${userActionMsg.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
                      color: userActionMsg.type === 'success' ? '#155724' : '#721c24',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                      <span>{userActionMsg.text}</span>
                      <button onClick={() => setUserActionMsg(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 700 }}>×</button>
                    </div>
                  )}

                  {/* Filters row - Horizontal side-by-side */}
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 260px', position: 'relative' }}>
                      <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)', pointerEvents: 'none' }} />
                      <input
                        type="text"
                        placeholder="Rechercher par nom, email ou ID..."
                        value={userSearch}
                        onChange={(e) => { setUserSearch(e.target.value); setUserPage(1); }}
                        style={{
                          width: '100%',
                          padding: '10px 14px 10px 38px',
                          border: '1px solid var(--border-color)',
                          borderRadius: '10px',
                          fontSize: '0.9rem',
                          fontFamily: 'var(--font-body)',
                          background: 'var(--surface-color)',
                          color: 'var(--text-color)',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                    <div style={{ flex: '0 1 200px', minWidth: '160px' }}>
                      <select
                        value={userRoleFilter}
                        onChange={(e) => { setUserRoleFilter(e.target.value); setUserPage(1); }}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: '1px solid var(--border-color)',
                          borderRadius: '10px',
                          fontSize: '0.9rem',
                          fontFamily: 'var(--font-body)',
                          background: 'var(--surface-color)',
                          color: 'var(--text-color)',
                          outline: 'none',
                          cursor: 'pointer',
                          boxSizing: 'border-box',
                        }}
                      >
                        <option value="all">Tous les rôles</option>
                        <option value="student">Étudiants</option>
                        <option value="instructor">Instructeurs</option>
                        <option value="admin">Administrateurs</option>
                      </select>
                    </div>
                    {(userSearch || userRoleFilter !== 'all') && (
                      <button
                        onClick={() => { setUserSearch(''); setUserRoleFilter('all'); setUserPage(1); }}
                        style={{
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: '1px solid var(--border-color)',
                          background: 'transparent',
                          color: 'var(--secondary)',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--error-color)'; e.currentTarget.style.borderColor = 'var(--error-color)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--secondary)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                      >
                        ✕ Réinitialiser
                      </button>
                    )}
                  </div>

                  {listLoading && <LoadingSpinner />}
                  {listError && <p style={{ color: 'var(--error-color)' }}>{listError}</p>}

                  {!listLoading && !listError && filteredUsers.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem', border: '2px dashed var(--border-color)', borderRadius: '12px' }}>
                      <Users size={36} style={{ marginBottom: '1rem', opacity: 0.3, color: 'var(--secondary)' }} />
                      <p style={{ color: 'var(--secondary)', fontSize: '0.95rem' }}>
                        {userSubTab === 'deleted'
                          ? 'Aucun utilisateur supprimé.'
                          : userSubTab === 'unverified'
                          ? 'Tous les utilisateurs sont vérifiés.'
                          : userSubTab === 'kyc'
                          ? 'Aucune demande KYC en attente.'
                          : 'Aucun utilisateur ne correspond au filtre.'}
                      </p>
                    </div>
                  )}

                  {!listLoading && !listError && filteredUsers.length > 0 && (
                    <>
                      <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
                          <thead>
                            <tr style={{ background: 'var(--bg-color)' }}>
                              <th style={{ textAlign: 'left', padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' }}>Nom</th>
                              <th style={{ textAlign: 'left', padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' }}>Email</th>
                              <th style={{ textAlign: 'left', padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' }}>Rôle</th>
                              <th style={{ textAlign: 'left', padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' }}>Profil</th>
                              {userSubTab === 'deleted' && (
                                <th style={{ textAlign: 'left', padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' }}>Supprimé le</th>
                              )}
                              {userSubTab === 'unverified' || userSubTab === 'kyc' ? (
                                <th style={{ textAlign: 'left', padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' }}>Statut</th>
                              ) : null}
                              <th style={{ textAlign: 'right', padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' }}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paginatedUsers.map((listedUser) => (
                              <tr key={listedUser.id} style={userSubTab === 'deleted' ? { opacity: 0.65 } : undefined}>
                                <td style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-color)' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                    {listedUser.avatar ? (
                                      <img src={listedUser.avatar} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                                    ) : (
                                      <div style={{
                                        width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                                        background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#fff', fontWeight: 700, fontSize: '0.8rem',
                                      }}>
                                        {listedUser.firstName?.charAt(0)?.toUpperCase() || '?'}
                                      </div>
                                    )}
                                    <span style={{ fontWeight: 600, color: 'var(--text-color)' }}>
                                      {[listedUser.firstName, listedUser.lastName].filter(Boolean).join(' ') || '—'}
                                    </span>
                                  </div>
                                </td>
                                <td style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-color)', color: 'var(--secondary)' }}>
                                  {listedUser.email || '—'}
                                </td>
                                <td style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-color)' }}>
                                  {(() => {
                                    const roleVal = (listedUser.role || (userSubTab === 'kyc' ? 'instructor' : '')).toLowerCase();
                                    return (
                                      <span style={{
                                        display: 'inline-block', padding: '0.2rem 0.65rem', borderRadius: '9999px',
                                        fontSize: '0.78rem', fontWeight: 600, textTransform: 'capitalize',
                                        background: roleVal === 'admin' ? '#ede7f6' : roleVal === 'instructor' ? '#e8f5e9' : '#e8f4fd',
                                        color: roleVal === 'admin' ? '#5e35b1' : roleVal === 'instructor' ? '#2e7d32' : '#1565c0',
                                      }}>
                                        {roleVal || '—'}
                                      </span>
                                    );
                                  })()}
                                </td>
                                <td style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-color)', color: 'var(--secondary)', fontSize: '0.85rem' }}>
                                  {listedUser.profile ? (
                                    <div style={{ fontSize: '0.8rem' }}>
                                      {listedUser.role === 'student' ? (
                                        <div>
                                          <div>{listedUser.profile.school || '—'}</div>
                                          <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>{listedUser.profile.fieldOfStudy || '—'}</div>
                                        </div>
                                      ) : listedUser.role === 'instructor' ? (
                                        <div>
                                          <div>{listedUser.profile.specialization || '—'}</div>
                                          <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>{listedUser.profile.organization || '—'}</div>
                                        </div>
                                      ) : '—'}
                                    </div>
                                  ) : '—'}
                                </td>
                                {userSubTab === 'deleted' && (
                                  <td style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-color)', color: 'var(--secondary)', fontSize: '0.85rem' }}>
                                    {listedUser.deletedAt
                                      ? new Date(listedUser.deletedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
                                      : '—'}
                                  </td>
                                )}
                                {userSubTab === 'unverified' || userSubTab === 'kyc' ? (
                                  <td style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-color)' }}>
                                    <span style={{
                                      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                                      padding: '0.2rem 0.6rem', borderRadius: '9999px',
                                      fontSize: '0.78rem', fontWeight: 600,
                                      background: '#fff3cd', color: '#856404',
                                    }}>
                                      <ShieldAlert size={12} /> Non vérifié
                                    </span>
                                  </td>
                                ) : null}
                                <td style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-color)', textAlign: 'right' }}>
                                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                    {(userSubTab === 'unverified' || userSubTab === 'kyc') && listedUser.role === 'instructor' && (
                                      <button
                                        onClick={() => handleVerifyUser(listedUser.id, listedUser.role, true)}
                                        disabled={userActionLoading === listedUser.id}
                                        style={{
                                          display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                                          padding: '0.4rem 0.9rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600,
                                          background: userActionLoading === listedUser.id ? '#e8f5e9' : '#155724',
                                          color: '#fff', cursor: userActionLoading === listedUser.id ? 'wait' : 'pointer',
                                          border: 'none', transition: 'background 0.2s',
                                        }}
                                      >
                                        <ShieldCheck size={14} />
                                        {userActionLoading === listedUser.id ? '...' : 'Vérifier'}
                                      </button>
                                    )}
                                    {userSubTab === 'deleted' && (
                                      <button
                                        onClick={() => handleRestoreUser(listedUser.id)}
                                        disabled={userActionLoading === listedUser.id}
                                        style={{
                                          display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                                          padding: '0.4rem 0.9rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600,
                                          background: userActionLoading === listedUser.id ? '#e3f2fd' : '#1565c0',
                                          color: '#fff', cursor: userActionLoading === listedUser.id ? 'wait' : 'pointer',
                                          border: 'none', transition: 'background 0.2s',
                                        }}
                                      >
                                        <RotateCcw size={14} />
                                        {userActionLoading === listedUser.id ? '...' : 'Restaurer'}
                                      </button>
                                    )}
                                    {userSubTab === 'active' && (
                                      <>
                                        {listedUser.role === 'instructor' && (
                                          <button
                                            onClick={() => handleVerifyUser(listedUser.id, listedUser.role, !listedUser.isVerified)}
                                            disabled={userActionLoading === listedUser.id}
                                            style={{
                                              display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                                              padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600,
                                              border: '1px solid',
                                              borderColor: listedUser.isVerified ? '#f5c6cb' : '#c3e6cb',
                                              background: listedUser.isVerified ? '#f8d7da' : '#d4edda',
                                              color: listedUser.isVerified ? '#721c24' : '#155724',
                                              cursor: userActionLoading === listedUser.id ? 'wait' : 'pointer',
                                            }}
                                          >
                                            {listedUser.isVerified ? <ShieldAlert size={14} /> : <ShieldCheck size={14} />}
                                            {listedUser.isVerified ? 'Déverifier' : 'Vérifier'}
                                          </button>
                                        )}
                                        <button
                                          onClick={() => handleEditUserClick(listedUser)}
                                          style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                                            padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600,
                                            border: '1px solid var(--border-color)', background: '#fff', color: 'var(--text-color)',
                                            cursor: 'pointer',
                                          }}
                                        >
                                          <Pencil size={13} /> Modifier
                                        </button>
                                        <button
                                          onClick={() => handleResetPassword(listedUser.id, [listedUser.firstName, listedUser.lastName].filter(Boolean).join(' ') || listedUser.email)}
                                          disabled={userActionLoading === listedUser.id}
                                          style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                                            padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600,
                                            border: '1px solid var(--border-color)', background: '#fff', color: 'var(--primary)',
                                            cursor: userActionLoading === listedUser.id ? 'wait' : 'pointer',
                                          }}
                                        >
                                          <Mail size={13} /> Réinit. mdp
                                        </button>
                                        <button
                                          onClick={() => handleDeleteUser(listedUser.id, [listedUser.firstName, listedUser.lastName].filter(Boolean).join(' ') || listedUser.email)}
                                          disabled={userActionLoading === listedUser.id}
                                          style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                                            padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600,
                                            border: '1px solid var(--border-color)', background: '#fff', color: 'var(--error-color)',
                                            cursor: userActionLoading === listedUser.id ? 'wait' : 'pointer',
                                          }}
                                        >
                                          <Trash2 size={13} /> Supprimer
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      {totalUserPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>
                            {(userPage - 1) * USERS_PER_PAGE + 1}–{Math.min(userPage * USERS_PER_PAGE, filteredUsers.length)} sur {filteredUsers.length}
                          </span>
                          <div style={{ display: 'flex', gap: '0.35rem' }}>
                            <button
                              onClick={() => setUserPage(p => Math.max(1, p - 1))}
                              disabled={userPage === 1}
                              style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: '36px', height: '36px', borderRadius: '8px',
                                border: '1px solid var(--border-color)', background: '#fff',
                                cursor: userPage === 1 ? 'not-allowed' : 'pointer',
                                opacity: userPage === 1 ? 0.4 : 1,
                              }}
                            >
                              <ChevronLeft size={16} />
                            </button>
                            {Array.from({ length: totalUserPages }, (_, i) => i + 1)
                              .filter(p => p === 1 || p === totalUserPages || Math.abs(p - userPage) <= 1)
                              .reduce((acc, p, idx, arr) => {
                                if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                                acc.push(p);
                                return acc;
                              }, [])
                              .map((p, idx) => p === '...'
                                ? <span key={`dots-${idx}`} style={{ display: 'flex', alignItems: 'center', padding: '0 0.3rem', color: 'var(--secondary)' }}>…</span>
                                : (
                                  <button
                                    key={p}
                                    onClick={() => setUserPage(p)}
                                    style={{
                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      minWidth: '36px', height: '36px', borderRadius: '8px', padding: '0 0.4rem',
                                      border: '1px solid',
                                      borderColor: userPage === p ? 'var(--primary)' : 'var(--border-color)',
                                      background: userPage === p ? 'var(--primary)' : '#fff',
                                      color: userPage === p ? '#fff' : 'var(--text-color)',
                                      fontWeight: userPage === p ? 700 : 500,
                                      fontSize: '0.85rem', cursor: 'pointer',
                                    }}
                                  >
                                    {p}
                                  </button>
                                )
                              )}
                            <button
                              onClick={() => setUserPage(p => Math.min(totalUserPages, p + 1))}
                              disabled={userPage === totalUserPages}
                              style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: '36px', height: '36px', borderRadius: '8px',
                                border: '1px solid var(--border-color)', background: '#fff',
                                cursor: userPage === totalUserPages ? 'not-allowed' : 'pointer',
                                opacity: userPage === totalUserPages ? 0.4 : 1,
                              }}
                            >
                              <ChevronRight size={16} />
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                </div>
              )}

              {activeTab === 'courses' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                      <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Gestion des Cours</h2>
                      <p style={{ color: 'var(--secondary)', marginTop: '0.35rem', fontSize: '0.9rem' }}>
                        Supervisez, éditez, attribuez et gérez l'ensemble du catalogue de cours 212Learn.
                      </p>
                    </div>
                    <button
                      onClick={handleOpenCreateCourseModal}
                      className="btn-primary"
                      style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <Plus size={16} />
                      Créer un cours
                    </button>
                  </div>

                  {/* Course KPI Summary Pills */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
                    <div style={{ padding: '1rem 1.2rem', borderRadius: '14px', background: 'var(--bg-color)', border: '1px solid rgba(255,255,255,0.7)', boxShadow: 'var(--neu-shadow-raised-sm)' }}>
                      <div style={{ fontSize: '0.78rem', color: 'var(--secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Catalogue</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-color)', marginTop: '0.2rem' }}>{courses.length}</div>
                    </div>
                    <div style={{ padding: '1rem 1.2rem', borderRadius: '14px', background: 'rgba(40,167,69,0.06)', border: '1px solid rgba(40,167,69,0.2)' }}>
                      <div style={{ fontSize: '0.78rem', color: '#28a745', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cours Publiés</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#28a745', marginTop: '0.2rem' }}>{courses.filter(c => (c.status || '').toLowerCase() === 'published').length}</div>
                    </div>
                    <div style={{ padding: '1rem 1.2rem', borderRadius: '14px', background: 'rgba(232,163,61,0.06)', border: '1px solid rgba(232,163,61,0.2)' }}>
                      <div style={{ fontSize: '0.78rem', color: '#b26a00', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Brouillons</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#b26a00', marginTop: '0.2rem' }}>{courses.filter(c => (c.status || '').toLowerCase() === 'draft').length}</div>
                    </div>
                    <div style={{ padding: '1rem 1.2rem', borderRadius: '14px', background: 'rgba(108,117,125,0.06)', border: '1px solid rgba(108,117,125,0.2)' }}>
                      <div style={{ fontSize: '0.78rem', color: '#6c757d', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Archivés</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#6c757d', marginTop: '0.2rem' }}>{courses.filter(c => (c.status || '').toLowerCase() === 'archived').length}</div>
                    </div>
                  </div>

                  {/* Search and Category Filter Bar */}
                  <div style={{ display: 'flex', gap: '0.85rem', marginBottom: '1.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Rechercher un cours par titre ou instructeur…"
                        value={adminCourseSearch}
                        onChange={(e) => setAdminCourseSearch(e.target.value)}
                        style={{ paddingLeft: '2.4rem', height: '42px', fontSize: '0.88rem' }}
                      />
                      <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)', pointerEvents: 'none' }} />
                    </div>

                    <select
                      className="form-control"
                      value={adminCourseCategoryFilter}
                      onChange={(e) => setAdminCourseCategoryFilter(e.target.value)}
                      style={{ width: 'auto', minWidth: '200px', height: '42px', fontSize: '0.88rem' }}
                    >
                      <option value="">Toutes les catégories</option>
                      {flatCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.selectLabel || cat.label}
                        </option>
                      ))}
                    </select>

                    <select
                      className="form-control"
                      value={adminCourseStatusFilter}
                      onChange={(e) => setAdminCourseStatusFilter(e.target.value)}
                      style={{ width: 'auto', minWidth: '160px', height: '42px', fontSize: '0.88rem' }}
                    >
                      <option value="all">Tous les statuts</option>
                      <option value="published">Publiés</option>
                      <option value="draft">Brouillons</option>
                      <option value="archived">Archivés</option>
                    </select>

                    {(adminCourseSearch || adminCourseCategoryFilter || adminCourseStatusFilter !== 'all') && (
                      <button
                        onClick={() => { setAdminCourseSearch(''); setAdminCourseCategoryFilter(''); setAdminCourseStatusFilter('all'); }}
                        style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}
                      >
                        Réinitialiser filtres
                      </button>
                    )}
                  </div>

                  {courseActionSuccess && (
                    <div style={{ color: '#155724', background: '#d4edda', border: '1px solid #c3e6cb', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                      {courseActionSuccess}
                    </div>
                  )}
                  {publishError && (
                    <div style={{ color: '#721c24', background: '#f8d7da', border: '1px solid #f5c6cb', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                      {publishError}
                    </div>
                  )}
                  {deleteCourseError && (
                    <div style={{ color: '#721c24', background: '#f8d7da', border: '1px solid #f5c6cb', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                      {deleteCourseError}
                    </div>
                  )}

                  {coursesLoading && <LoadingSpinner />}
                  {coursesError && <p style={{ color: 'var(--error-color)' }}>{coursesError}</p>}
                  {!coursesLoading && !coursesError && filteredAllCourses.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem', border: '2px dashed var(--border-color)', borderRadius: '12px' }}>
                      <BookOpen size={36} style={{ marginBottom: '1rem', opacity: 0.3, color: 'var(--secondary)' }} />
                      <p style={{ color: 'var(--secondary)', fontSize: '0.95rem' }}>
                        Aucun cours ne correspond aux filtres.
                      </p>
                    </div>
                  )}
                  {!coursesLoading && !coursesError && filteredAllCourses.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                      {filteredAllCourses.map((course) => (
                        <AdminCourseCard
                          key={course.id}
                          course={course}
                          flatCategories={flatCategories}
                          instructors={instructors}
                          instructorsLoading={instructorsLoading}
                          onPublish={handlePublishCourse}
                          publishLoading={publishLoading}
                          onEdit={handleOpenEditCourseModal}
                          onDelete={handleDeleteCourse}
                          deleteLoading={deleteCourseLoading}
                          isDraft={(course.status || '').toLowerCase() === 'draft'}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'categories' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                      <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Category Management</h2>
                      <p style={{ color: 'var(--secondary)', marginTop: '0.35rem' }}>
                        L'admin peut créer, modifier et supprimer les catégories quand il veut.
                      </p>
                    </div>
                    <button
                      onClick={handleOpenCreateCategoryDrawer}
                      className="btn-primary"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <Plus size={16} /> Ajouter une catégorie
                    </button>
                  </div>

                  {categorySuccess && (
                    <div style={{ color: '#155724', background: '#d4edda', border: '1px solid #c3e6cb', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                      {categorySuccess}
                    </div>
                  )}
                  {categoryActionError && (
                    <div style={{ color: '#721c24', background: '#f8d7da', border: '1px solid #f5c6cb', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                      {categoryActionError}
                    </div>
                  )}

                  {categoriesLoading && <LoadingSpinner />}
                  {categoriesError && <p style={{ color: 'var(--error-color)' }}>{categoriesError}</p>}
                  {!categoriesLoading && !categoriesError && categories.length === 0 && (
                    <p style={{ color: 'var(--secondary)' }}>No categories found.</p>
                  )}
                  {!categoriesLoading && !categoriesError && categories.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                      {categories.map((category) => (
                        <AdminCategoryCard
                          key={category.id}
                          category={category}
                          onEdit={handleOpenEditCategoryDrawer}
                          onDelete={handleDeleteCategory}
                          deleteLoading={categoriesLoading}
                          onAddSubcategory={handleOpenAddSubcategoryDrawer}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'meetings' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                      <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Gestion des Sessions</h2>
                      <p style={{ color: 'var(--secondary)', marginTop: '0.35rem', fontSize: '0.9rem' }}>
                        Vue calendrier de toutes les sessions virtuelles sur la plateforme.
                      </p>
                    </div>
                  </div>

                  {meetingsLoading && <LoadingSpinner />}
                  {!meetingsLoading && (
                    <SessionCalendar
                      meetings={meetings}
                      onMeetingClick={(meeting) => {
                        // Handle meeting clicks - could show details or join
                        console.log('Meeting clicked:', meeting);
                      }}
                      onEditMeeting={handleAdminMeetingEdit}
                      onDeleteMeeting={handleAdminMeetingDelete}
                      readOnly={false}
                    />
                  )}
                </div>
              )}

              {activeTab === 'groups' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div>
                      <h2 style={{ marginBottom: '0.4rem', fontSize: '1.5rem' }}>Gestion des Groupes</h2>
                      <p style={{ color: 'var(--secondary)' }}>
                        Créez et gérez les groupes de formation
                      </p>
                    </div>
                    <button
                      onClick={handleCreateGroupClick}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.6rem 1.2rem',
                        background: 'var(--primary)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                      }}
                    >
                      <Plus size={18} />
                      Nouveau groupe
                    </button>
                  </div>

                  {groupsLoading && <LoadingSpinner />}
                  {groupsError && <p style={{ color: 'var(--error-color)' }}>{groupsError}</p>}

                  {!groupsLoading && !groupsError && groups.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem', border: '2px dashed var(--border-color)', borderRadius: '12px' }}>
                      <Users size={36} style={{ marginBottom: '1rem', opacity: 0.3, color: 'var(--secondary)' }} />
                      <p style={{ color: 'var(--secondary)', fontSize: '0.95rem' }}>
                        Aucun groupe de formation créé.
                      </p>
                    </div>
                  )}

                  {!groupsLoading && !groupsError && groups.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                      {groups.map((group) => (
                        <div
                          key={group.id}
                          style={{
                            padding: '1.5rem',
                            background: 'var(--bg-color)',
                            borderRadius: '16px',
                            border: '1px solid var(--border-color)',
                            boxShadow: 'var(--shadow-sm)',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-color)', marginBottom: '0.25rem' }}>
                              {group.name}
                            </h3>
                            <div style={{ display: 'flex', gap: '0.35rem' }}>
                              <button
                                onClick={() => handleEditGroupClick(group)}
                                style={{ padding: '0.4rem', border: '1px solid var(--border-color)', borderRadius: '6px', background: '#fff', cursor: 'pointer' }}
                                title="Modifier"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteGroup(group.id, group.name)}
                                style={{ padding: '0.4rem', border: '1px solid #f5c6cb', borderRadius: '6px', background: '#fff', color: 'var(--error-color)', cursor: 'pointer' }}
                                title="Supprimer"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                          {group.description && (
                            <p style={{ color: 'var(--secondary)', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: 1.5 }}>
                              {group.description}
                            </p>
                          )}
                          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--secondary)', marginBottom: '0.75rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <Users size={14} />
                              {group.studentCount || 0} étudiants
                            </span>
                            {group.formateur && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <User size={14} />
                                {group.formateur.firstName} {group.formateur.lastName}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => handleManageGroupStudents(group)}
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              border: '1px solid var(--border-color)',
                              borderRadius: '6px',
                              background: '#fff',
                              cursor: 'pointer',
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              color: 'var(--primary)',
                            }}
                          >
                            Gérer les étudiants
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'coupons' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div>
                      <h2 style={{ marginBottom: '0.4rem', fontSize: '1.5rem' }}>Gestion des Coupons</h2>
                      <p style={{ color: 'var(--secondary)' }}>
                        Créez et gérez les codes promo
                      </p>
                    </div>
                    <button
                      onClick={handleCreateCouponClick}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.6rem 1.2rem',
                        background: 'var(--primary)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                      }}
                    >
                      <Plus size={18} />
                      Nouveau coupon
                    </button>
                  </div>

                  {couponsLoading && <LoadingSpinner />}
                  {couponsError && <p style={{ color: 'var(--error-color)' }}>{couponsError}</p>}

                  {!couponsLoading && !couponsError && coupons.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem', border: '2px dashed var(--border-color)', borderRadius: '12px' }}>
                      <Award size={36} style={{ marginBottom: '1rem', opacity: 0.3, color: 'var(--secondary)' }} />
                      <p style={{ color: 'var(--secondary)', fontSize: '0.95rem' }}>
                        Aucun coupon créé.
                      </p>
                    </div>
                  )}

                  {!couponsLoading && !couponsError && coupons.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                      {coupons.map((coupon) => (
                        <div
                          key={coupon.id}
                          style={{
                            padding: '1.5rem',
                            background: 'var(--bg-color)',
                            borderRadius: '16px',
                            border: '1px solid var(--border-color)',
                            boxShadow: 'var(--shadow-sm)',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                            <div>
                              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-color)', marginBottom: '0.25rem' }}>
                                {coupon.code}
                              </h3>
                              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>
                                {coupon.discount}% de réduction
                              </span>
                            </div>
                            <div style={{ display: 'flex', gap: '0.35rem' }}>
                              <button
                                onClick={() => handleEditCouponClick(coupon)}
                                style={{ padding: '0.4rem', border: '1px solid var(--border-color)', borderRadius: '6px', background: '#fff', cursor: 'pointer' }}
                                title="Modifier"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteCoupon(coupon.id, coupon.code)}
                                style={{ padding: '0.4rem', border: '1px solid #f5c6cb', borderRadius: '6px', background: '#fff', color: 'var(--error-color)', cursor: 'pointer' }}
                                title="Supprimer"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--secondary)', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                            <span>Utilisations: {coupon.currentUsage || 0}/{coupon.maxUsage || '∞'}</span>
                            <span>Expire: {new Date(coupon.expirationDate).toLocaleDateString('fr-FR')}</span>
                            <span>Cours: {coupon.course?.title || (coupon.courseId ? '—' : 'Tous les cours')}</span>
                          </div>
                          {(coupon.currentUsage || 0) > 0 && (
                            <button
                              onClick={() => handleLoadCouponUsage(coupon)}
                              style={{
                                width: '100%',
                                padding: '0.5rem',
                                background: '#e8f5e9',
                                color: '#2e7d32',
                                border: '1px solid #c8e6c9',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '0.85rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.35rem',
                              }}
                            >
                              <Users size={14} />
                              Voir les utilisateurs ({coupon.currentUsage || 0})
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'settings' && <AdminSettingsTab />}

              {['profile', 'security'].includes(activeTab) && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '2rem', alignItems: 'start' }}>
                  <ProfileEditForm />
                  <ChangePasswordForm />
                </div>
              )}

              {activeTab === 'stats' && <AdminStatsTab />}

              {activeTab === 'payments' && <PaymentsTab />}

              {activeTab === 'update-requests' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div>
                      <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Demandes de mise à jour de cours</h2>
                      <p style={{ color: 'var(--secondary)', margin: '0.35rem 0 0' }}>
                        Gérez les demandes de modification des cours publiés par les instructeurs.
                      </p>
                    </div>
                  </div>

                  {/* Status Filter */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <select
                      value={updateRequestStatusFilter}
                      onChange={(e) => setUpdateRequestStatusFilter(e.target.value)}
                      style={{
                        padding: '0.6rem 1rem',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        fontSize: '0.9rem',
                        minWidth: '200px',
                      }}
                    >
                      <option value="all">Tous les statuts</option>
                      <option value="PENDING">En attente</option>
                      <option value="APPROVED">Approuvées</option>
                      <option value="REJECTED">Rejetées</option>
                    </select>
                  </div>

                  {updateRequestsLoading && <LoadingSpinner />}
                  {updateRequestsError && <p style={{ color: 'var(--error-color)' }}>{updateRequestsError}</p>}

                  {!updateRequestsLoading && !updateRequestsError && updateRequests.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem', border: '2px dashed var(--border-color)', borderRadius: '12px' }}>
                      <FileText size={36} style={{ marginBottom: '1rem', opacity: 0.3, color: 'var(--secondary)' }} />
                      <p style={{ color: 'var(--secondary)' }}>Aucune demande de mise à jour trouvée.</p>
                    </div>
                  )}

                  {!updateRequestsLoading && !updateRequestsError && updateRequests.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {updateRequests.map((request) => (
                        <div
                          key={request.id}
                          style={{
                            padding: '1.5rem',
                            background: '#fff',
                            borderRadius: '12px',
                            border: '1px solid var(--border-color)',
                            boxShadow: 'var(--shadow-sm)',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div style={{ flex: 1 }}>
                              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-color)' }}>
                                {request.course?.title || 'Cours inconnu'}
                              </h3>
                              <p style={{ color: 'var(--secondary)', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
                                Instructeur: {request.instructor?.firstName} {request.instructor?.lastName} ({request.instructor?.email})
                              </p>
                              <p style={{ color: 'var(--secondary)', fontSize: '0.8rem', margin: '0.25rem 0 0' }}>
                                Demandé le: {new Date(request.createdAt).toLocaleString('fr-FR')}
                              </p>
                            </div>
                            <div style={{
                              padding: '0.35rem 0.85rem',
                              borderRadius: '999px',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              background: request.status === 'PENDING' ? '#fff3cd' :
                                       request.status === 'APPROVED' ? '#d4edda' : '#f8d7da',
                              color: request.status === 'PENDING' ? '#856404' :
                                     request.status === 'APPROVED' ? '#155724' : '#721c24',
                              border: `1px solid ${request.status === 'PENDING' ? '#ffc107' :
                                                request.status === 'APPROVED' ? '#28a745' : '#dc3545'}`,
                            }}>
                              {request.status === 'PENDING' ? '⏳ En attente' :
                               request.status === 'APPROVED' ? '✅ Approuvée' : '❌ Rejetée'}
                            </div>
                          </div>

                          {/* Requested Changes */}
                          <div style={{ background: 'var(--bg-color)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                            <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', color: 'var(--secondary)' }}>Modifications demandées :</h4>
                            {request.title && <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}><strong>Titre :</strong> {request.title}</p>}
                            {request.description && <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}><strong>Description :</strong> {request.description}</p>}
                            {request.price !== null && <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}><strong>Prix :</strong> {request.price} MAD</p>}
                            {request.level && <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}><strong>Niveau :</strong> {request.level}</p>}
                            {request.thumbnail && <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}><strong>Image :</strong> URL mise à jour</p>}
                          </div>

                          {/* Rejection Reason */}
                          {request.status === 'REJECTED' && request.rejectionReason && (
                            <div style={{
                              padding: '0.75rem',
                              background: '#f8d7da',
                              border: '1px solid #f5c6cb',
                              borderRadius: '8px',
                              marginBottom: '1rem',
                              fontSize: '0.85rem',
                              color: '#721c24',
                            }}>
                              <strong>Raison du rejet :</strong> {request.rejectionReason}
                            </div>
                          )}

                          {/* Actions */}
                          {request.status === 'PENDING' && (
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                              <button
                                onClick={() => handleApproveUpdateRequest(request.id)}
                                disabled={processingUpdateRequest === request.id}
                                style={{
                                  padding: '0.5rem 1rem',
                                  borderRadius: '8px',
                                  border: 'none',
                                  background: '#28a745',
                                  color: '#fff',
                                  cursor: 'pointer',
                                  fontWeight: 600,
                                  fontSize: '0.85rem',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.4rem',
                                  opacity: processingUpdateRequest === request.id ? 0.6 : 1,
                                }}
                              >
                                {processingUpdateRequest === request.id ? <Loader size={14} className="spin" /> : <Check size={14} />}
                                Approuver
                              </button>
                              <button
                                onClick={() => setSelectedUpdateRequest(request)}
                                disabled={processingUpdateRequest === request.id}
                                style={{
                                  padding: '0.5rem 1rem',
                                  borderRadius: '8px',
                                  border: '1px solid #dc3545',
                                  background: '#fff',
                                  color: '#dc3545',
                                  cursor: 'pointer',
                                  fontWeight: 600,
                                  fontSize: '0.85rem',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.4rem',
                                }}
                              >
                                <X size={14} />
                                Rejeter
                              </button>
                            </div>
                          )}

                          {/* Reviewer Info */}
                          {request.status !== 'PENDING' && request.reviewer && (
                            <p style={{ fontSize: '0.8rem', color: 'var(--secondary)', margin: '0.5rem 0 0' }}>
                              Traité par: {request.reviewer.firstName} {request.reviewer.lastName} le {request.reviewedAt ? new Date(request.reviewedAt).toLocaleString('fr-FR') : ''}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'audit' && <AuditLogsTab />}

              {activeTab === 'health' && <SystemHealthTab />}
            </div>
        </main>
      </div>

      {/* ── Admin Action Confirmation Modal ───────────────────────── */}
      {adminConfirmModal && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, padding: '1rem',
          }}
          onClick={(e) => e.target === e.currentTarget && setAdminConfirmModal(null)}
        >
          <div style={{
            background: '#fff', borderRadius: '20px', padding: '2rem',
            maxWidth: '460px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            position: 'relative', animation: 'fadeInUp 0.2s ease',
          }}>
            <button
              onClick={() => setAdminConfirmModal(null)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ background: '#f8fafc', borderRadius: '50%', padding: '12px', display: 'flex', border: '1px solid #e2e8f0' }}>
                {adminConfirmModal.icon}
              </div>
              <h2 style={{ margin: 0, color: '#1a1a2e', fontSize: '1.25rem', fontWeight: 700 }}>
                {adminConfirmModal.title}
              </h2>
            </div>

            <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
              {adminConfirmModal.description}
            </p>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setAdminConfirmModal(null)}
                style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', fontWeight: 500, color: '#64748b' }}
              >
                Annuler
              </button>
              <button
                onClick={adminConfirmModal.onConfirm}
                disabled={userActionLoading !== null}
                style={{
                  flex: 1, padding: '0.65rem', borderRadius: '8px', border: 'none',
                  background: adminConfirmModal.btnColor, color: '#fff', cursor: 'pointer',
                  fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                }}
              >
                {userActionLoading && <Loader size={16} className="spin" />}
                {userActionLoading ? 'Traitement...' : adminConfirmModal.btnText}
              </button>
            </div>
          </div>
        </div>
      )}





      {/* Edit Course Slide-Over Right Drawer Modal */}
      {editingCourse && (
        <AdminEditCourseDrawer
          course={editingCourse}
          onClose={() => setEditingCourse(null)}
          flatCategories={flatCategories}
          instructors={instructors}
          instructorsLoading={instructorsLoading}
          onSave={handleUpdateCourse}
          saveLoading={updateCourseLoading}
          saveError={updateCourseError}
        />
      )}

      {/* Create Course Slide-Over Right Drawer Modal */}
      <AdminCreateCourseDrawer
        isOpen={showCreateCourseDrawer}
        onClose={() => setShowCreateCourseDrawer(false)}
        flatCategories={flatCategories}
        instructors={instructors}
        instructorsLoading={instructorsLoading}
        onSave={handleCreateCourseSubmit}
        saveLoading={createCourseLoading}
        saveError={createCourseError}
      />

      {/* Create / Edit User Slide-Over Right Drawer Modal */}
      <AdminUserFormDrawer
        isOpen={showUserForm}
        onClose={() => { setShowUserForm(false); setEditingUser(null); setUserFormError(null); }}
        editingUser={editingUser}
        formData={userFormData}
        setFormData={setUserFormData}
        onSubmit={handleUserFormSubmit}
        loading={userFormLoading}
        error={userFormError}
      />

      {/* Rejection Reason Modal for Update Requests */}
      {selectedUpdateRequest && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(6px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
          onClick={() => setSelectedUpdateRequest(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: '16px',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
            }}
          >
            <div
              style={{
                padding: '1.5rem',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700 }}>
                Rejeter la demande de mise à jour
              </h3>
              <button
                onClick={() => setSelectedUpdateRequest(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary)' }}
              >
                <X size={22} />
              </button>
            </div>

            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
              <p style={{ color: 'var(--secondary)', marginBottom: '1rem' }}>
                Veuillez fournir une raison pour le rejet de cette demande de mise à jour pour le cours "{selectedUpdateRequest.course?.title}".
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Expliquez pourquoi cette demande est rejetée..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.9rem',
                  resize: 'vertical',
                }}
              />
            </div>

            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                gap: '0.75rem',
                justifyContent: 'flex-end',
              }}
            >
              <button
                onClick={() => setSelectedUpdateRequest(null)}
                style={{
                  padding: '0.6rem 1.25rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: '#fff',
                  cursor: 'pointer',
                  fontWeight: 600,
                  color: 'var(--secondary)',
                }}
              >
                Annuler
              </button>
              <button
                onClick={() => handleRejectUpdateRequest(selectedUpdateRequest.id)}
                disabled={processingUpdateRequest === selectedUpdateRequest.id}
                style={{
                  padding: '0.6rem 1.25rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#dc3545',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  opacity: processingUpdateRequest === selectedUpdateRequest.id ? 0.6 : 1,
                }}
              >
                {processingUpdateRequest === selectedUpdateRequest.id ? <Loader size={16} className="spin" /> : <X size={16} />}
                Rejeter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Category Slide-Over Right Drawer */}
      <AdminCategoryDrawer
        isOpen={showCategoryDrawer}
        onClose={() => { setShowCategoryDrawer(false); setEditingCategoryData(null); setCategoryDrawerError(null); }}
        editingCategory={editingCategoryData}
        parentCategoryId={drawerCategoryParentId}
        flatCategories={flatCategories}
        onSave={handleCategoryDrawerSave}
        saveLoading={categoryDrawerLoading}
        saveError={categoryDrawerError}
      />

      {/* Create / Edit Group Modal */}
      {showGroupForm && createPortal(
        <div
          onClick={() => setShowGroupForm(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(6px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: '16px',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
            }}
          >
            <div
              style={{
                padding: '1.5rem',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700 }}>
                {editingGroup ? 'Modifier le groupe' : 'Nouveau groupe'}
              </h3>
              <button
                onClick={() => setShowGroupForm(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary)' }}
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleGroupFormSubmit} style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
              {groupFormError && (
                <div style={{ color: '#721c24', background: '#f8d7da', border: '1px solid #f5c6cb', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                  {groupFormError}
                </div>
              )}

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-color)', marginBottom: '0.4rem' }}>
                  Nom du groupe *
                </label>
                <input
                  type="text"
                  value={groupFormData.name}
                  onChange={(e) => setGroupFormData({ ...groupFormData, name: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-color)', marginBottom: '0.4rem' }}>
                  Description
                </label>
                <textarea
                  value={groupFormData.description}
                  onChange={(e) => setGroupFormData({ ...groupFormData, description: e.target.value })}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-color)', marginBottom: '0.4rem' }}>
                  Formateur *
                </label>
                <select
                  value={groupFormData.formateurId}
                  onChange={(e) => setGroupFormData({ ...groupFormData, formateurId: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                  }}
                >
                  <option value="">Sélectionner un formateur</option>
                  {instructors.map((instructor) => (
                    <option key={instructor.id} value={instructor.id}>
                      {instructor.firstName} {instructor.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-color)', marginBottom: '0.4rem' }}>
                  Cours (optionnel)
                </label>
                <select
                  value={groupFormData.courseId}
                  onChange={(e) => setGroupFormData({ ...groupFormData, courseId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                  }}
                >
                  <option value="">Sélectionner un cours</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowGroupForm(false)}
                  style={{
                    padding: '0.6rem 1.2rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    background: '#fff',
                    cursor: 'pointer',
                    fontWeight: 600,
                    color: 'var(--secondary)',
                  }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={groupFormLoading}
                  style={{
                    padding: '0.6rem 1.2rem',
                    border: 'none',
                    borderRadius: '8px',
                    background: 'var(--primary)',
                    color: '#fff',
                    cursor: groupFormLoading ? 'not-allowed' : 'pointer',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  {groupFormLoading && <Loader size={16} className="spin" />}
                  {groupFormLoading ? 'Enregistrement...' : editingGroup ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Create / Edit Coupon Modal */}
      {showCouponForm && createPortal(
        <div
          onClick={() => setShowCouponForm(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(6px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: '16px',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
            }}
          >
            <div
              style={{
                padding: '1.5rem',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700 }}>
                {editingCoupon ? 'Modifier le coupon' : 'Nouveau coupon'}
              </h3>
              <button
                onClick={() => setShowCouponForm(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary)' }}
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleCouponFormSubmit} style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
              {couponFormError && (
                <div style={{ color: '#721c24', background: '#f8d7da', border: '1px solid #f5c6cb', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                  {couponFormError}
                </div>
              )}

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-color)', marginBottom: '0.4rem' }}>
                  Code du coupon *
                </label>
                <input
                  type="text"
                  value={couponFormData.code}
                  onChange={(e) => setCouponFormData({ ...couponFormData, code: e.target.value.toUpperCase() })}
                  required
                  placeholder="EX: PROMO20"
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-color)', marginBottom: '0.4rem' }}>
                  Réduction (%) *
                </label>
                <input
                  type="number"
                  value={couponFormData.discount}
                  onChange={(e) => setCouponFormData({ ...couponFormData, discount: e.target.value })}
                  required
                  min="1"
                  max="100"
                  placeholder="EX: 20"
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-color)', marginBottom: '0.4rem' }}>
                  Date d'expiration *
                </label>
                <input
                  type="date"
                  value={couponFormData.expirationDate}
                  onChange={(e) => setCouponFormData({ ...couponFormData, expirationDate: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-color)', marginBottom: '0.4rem' }}>
                  Utilisations maximales
                </label>
                <input
                  type="number"
                  value={couponFormData.maxUsage}
                  onChange={(e) => setCouponFormData({ ...couponFormData, maxUsage: e.target.value })}
                  min="1"
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-color)', marginBottom: '0.4rem' }}>
                  Cours (optionnel)
                </label>
                <select
                  value={couponFormData.courseId}
                  onChange={(e) => setCouponFormData({ ...couponFormData, courseId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                  }}
                >
                  <option value="">Tous les cours (global)</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-color)', marginBottom: '0.4rem' }}>
                  <input
                    type="checkbox"
                    checked={couponFormData.isActive}
                    onChange={(e) => setCouponFormData({ ...couponFormData, isActive: e.target.checked })}
                    style={{ width: '16px', height: '16px' }}
                  />
                  Coupon actif
                </label>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCouponForm(false)}
                  style={{
                    padding: '0.6rem 1.2rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    background: '#fff',
                    cursor: 'pointer',
                    fontWeight: 600,
                    color: 'var(--secondary)',
                  }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={couponFormLoading}
                  style={{
                    padding: '0.6rem 1.2rem',
                    border: 'none',
                    borderRadius: '8px',
                    background: 'var(--primary)',
                    color: '#fff',
                    cursor: couponFormLoading ? 'not-allowed' : 'pointer',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  {couponFormLoading && <Loader size={16} className="spin" />}
                  {couponFormLoading ? 'Enregistrement...' : editingCoupon ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Manage Group Students Modal */}
      {showGroupStudentsModal && selectedGroupForStudents && createPortal(
        <div
          onClick={() => setShowGroupStudentsModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(6px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: '16px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
            }}
          >
            <div
              style={{
                padding: '1.5rem',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700 }}>
                Étudiants du groupe "{selectedGroupForStudents.name}"
              </h3>
              <button
                onClick={() => setShowGroupStudentsModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary)' }}
              >
                <X size={22} />
              </button>
            </div>

            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
              {groupStudentsLoading ? (
                <LoadingSpinner />
              ) : (
                <>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-color)', marginBottom: '0.4rem' }}>
                      Ajouter un étudiant
                      {selectedGroupForStudents.course && (
                        <span style={{ fontWeight: 400, color: 'var(--secondary)', marginLeft: '0.5rem' }}>
                          (inscrits au cours "{selectedGroupForStudents.course.title}")
                        </span>
                      )}
                    </label>
                    {(() => {
                      const available = getAvailableStudentsForGroup();
                      const allChecked = available.length > 0 && selectedGroupStudentIds.length === available.length;
                      return (
                        <>
                          {available.length === 0 ? (
                            <p style={{ fontSize: '0.8rem', color: 'var(--secondary)', marginTop: '0.25rem' }}>
                              {selectedGroupForStudents.course ? 'Aucun étudiant inscrit à ce cours disponible' : 'Aucun étudiant disponible'}
                            </p>
                          ) : (
                            <>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.82rem', fontWeight: 600, color: 'var(--secondary)', cursor: 'pointer' }}>
                                  <input
                                    type="checkbox"
                                    checked={allChecked}
                                    onChange={(e) => setSelectedGroupStudentIds(e.target.checked ? available.map((s) => s.id) : [])}
                                  />
                                  Tout sélectionner
                                </label>
                                <span style={{ fontSize: '0.78rem', color: 'var(--secondary)' }}>
                                  {selectedGroupStudentIds.length}/{available.length} sélectionné(s)
                                </span>
                              </div>
                              <div style={{ maxHeight: 220, overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 8, padding: '0.35rem', marginBottom: '0.6rem' }}>
                                {available.map((user) => (
                                  <label key={user.id} style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', padding: '0.4rem 0.5rem', borderRadius: 6, cursor: 'pointer', fontSize: '0.88rem' }}>
                                    <input
                                      type="checkbox"
                                      checked={selectedGroupStudentIds.includes(user.id)}
                                      onChange={() => toggleGroupStudent(user.id)}
                                    />
                                    <span style={{ color: 'var(--text-color)' }}>
                                      {user.firstName} {user.lastName}
                                      <span style={{ color: 'var(--secondary)', marginLeft: '0.4rem', fontSize: '0.8rem' }}>({user.email})</span>
                                    </span>
                                  </label>
                                ))}
                              </div>
                              <button
                                onClick={() => handleAddSelectedToGroup(selectedGroupForStudents.id)}
                                disabled={bulkAdding || selectedGroupStudentIds.length === 0}
                                style={{
                                  padding: '0.5rem 1rem', border: 'none', borderRadius: '6px',
                                  background: selectedGroupStudentIds.length === 0 || bulkAdding ? 'var(--border-color)' : 'var(--primary)',
                                  color: '#fff', cursor: selectedGroupStudentIds.length === 0 || bulkAdding ? 'not-allowed' : 'pointer',
                                  fontWeight: 600, fontSize: '0.85rem',
                                }}
                              >
                                {bulkAdding ? 'Ajout…' : `Ajouter la sélection${selectedGroupStudentIds.length ? ` (${selectedGroupStudentIds.length})` : ''}`}
                              </button>
                            </>
                          )}
                        </>
                      );
                    })()}
                  </div>

                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>
                      Étudiants dans le groupe ({selectedGroupForStudents.students?.length || 0})
                    </h4>
                    {selectedGroupForStudents.students && selectedGroupForStudents.students.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {selectedGroupForStudents.students.map((membership) => (
                          <div
                            key={membership.id}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '0.75rem 1rem',
                              border: '1px solid var(--border-color)',
                              borderRadius: '8px',
                              background: '#fff',
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                                {membership.user.firstName} {membership.user.lastName}
                              </div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>
                                {membership.user.email}
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveStudentFromGroup(selectedGroupForStudents.id, membership.user.id)}
                              style={{
                                padding: '0.4rem 0.8rem',
                                border: '1px solid #f5c6cb',
                                borderRadius: '6px',
                                background: '#fff',
                                color: 'var(--error-color)',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                              }}
                            >
                              Retirer
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--secondary)' }}>
                        Aucun étudiant dans ce groupe
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
