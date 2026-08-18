// Shared helpers for the admin course & category UI (used by AdminDashboard and
// its extracted sub-components). Pure functions, no React.

export function flattenCategories(categories, level = 0, parentName = '') {
  return categories.flatMap((cat) => {
    const indent = '    '.repeat(level);
    const prefix = level > 0 ? `${indent}└─ ` : '📁 ';
    return [
      {
        id: cat.id,
        name: cat.name,
        description: cat.description,
        parentId: cat.parentId,
        parentName,
        level,
        children: cat.children || [],
        label: level > 0 ? `${cat.name} (${parentName})` : cat.name,
        selectLabel: `${prefix}${cat.name}`,
      },
      ...(cat.children ? flattenCategories(cat.children, level + 1, cat.name) : []),
    ];
  });
}

export function getAssignedInstructor(course) {
  if (course.formateur) return course.formateur;

  const instructors = Array.isArray(course.instructors) ? course.instructors : [];

  const preferredInstructor =
    instructors.find((item) => {
      const role = (item.role || '').toLowerCase();
      return role === 'lead_instructor' || role === 'assistant_instructor' || role === 'instructor';
    }) ||
    instructors.find((item) => (item.role || '').toLowerCase() !== 'owner') ||
    instructors[0];

  if (preferredInstructor?.user) return preferredInstructor.user;
  if (course.instructor) return course.instructor;
  if (course.formateurId) return { id: course.formateurId };
  return null;
}

export function getCourseInstructorLabel(course) {
  const assigned = getAssignedInstructor(course);
  if (!assigned) return 'Non assigné';
  return `${assigned.firstName || ''} ${assigned.lastName || ''}`.trim() || assigned.email || 'Instructeur';
}

export function normalizeCourseForm(course) {
  return {
    title: course.title || '',
    description: course.description || '',
    thumbnail: course.thumbnail || course.imageUrl || '',
    categoryId: course.categoryId || course.category?.id || '',
    price: course.price ?? '',
    level: course.level || '',
    status: course.status || 'draft',
    instructorId: getAssignedInstructor(course)?.id || '',
  };
}
