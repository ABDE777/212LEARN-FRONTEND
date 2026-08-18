import { Pencil, Plus, Trash2, Code, Database, Globe, Video, BookOpen, Users, Folder } from 'lucide-react';
import AdminSubcategoryItem from './AdminSubcategoryItem';

export default function AdminCategoryCard({
  category,
  onEdit,
  onDelete,
  deleteLoading,
  onAddSubcategory,
}) {
  const subcategories = category.children || [];

  const getCategoryIcon = (iconName) => {
    const iconMap = {
      'Code': Code,
      'Database': Database,
      'Globe': Globe,
      'Video': Video,
      'BookOpen': BookOpen,
      'Users': Users,
    };
    return iconMap[iconName] || Folder;
  };

  const CategoryIcon = getCategoryIcon(category.icon);

  return (
    <div
      style={{
        borderRadius: '16px',
        background: '#fff',
        border: '1px solid rgba(255, 255, 255, 0.8)',
        boxShadow: 'var(--neu-shadow-raised)',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Category Card Header */}
      <div style={{ padding: '1.25rem 1.5rem', background: 'linear-gradient(135deg, rgba(27,75,90,0.03), rgba(193,101,47,0.03))', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', flexShrink: 0,
            }}>
              <CategoryIcon size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)' }}>
                {category.name}
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--secondary)', fontWeight: 600 }}>
                {subcategories.length} {subcategories.length === 1 ? 'sous-catégorie' : 'sous-catégories'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => onAddSubcategory(category.id)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                padding: '0.45rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600,
                background: 'rgba(27,75,90,0.08)', color: 'var(--primary)', border: '1px solid rgba(27,75,90,0.2)',
                cursor: 'pointer', transition: 'all 0.2s ease',
              }}
            >
              <Plus size={14} /> Sous-catégorie
            </button>
            <button
              type="button"
              onClick={() => onEdit(category)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                padding: '0.45rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600,
                background: 'var(--bg-color)', color: 'var(--text-color)',
                border: '1px solid var(--border-color)', cursor: 'pointer',
              }}
            >
              <Pencil size={13} /> Modifier
            </button>
            <button
              type="button"
              onClick={() => onDelete(category.id, category.name)}
              disabled={deleteLoading}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                padding: '0.45rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600,
                background: 'rgba(220,53,69,0.08)', color: '#dc3545', border: '1px solid rgba(220,53,69,0.2)',
                cursor: 'pointer',
              }}
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {category.description && (
          <p style={{ margin: '0.75rem 0 0', fontSize: '0.88rem', color: 'var(--secondary)', lineHeight: 1.4 }}>
            {category.description}
          </p>
        )}
      </div>

      {/* Subcategories Section */}
      <div style={{ padding: '1.25rem 1.5rem', flex: 1, background: '#fafafa' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
          Sous-catégories ({subcategories.length})
        </div>

        {subcategories.length === 0 ? (
          <div style={{ padding: '1rem', border: '1px dashed var(--border-color)', borderRadius: '10px', textAlign: 'center', background: '#fff' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>Aucune sous-catégorie. </span>
            <button
              type="button"
              onClick={() => onAddSubcategory(category.id)}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}
            >
              + En ajouter une
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {subcategories.map((sub) => (
              <AdminSubcategoryItem
                key={sub.id}
                subcategory={sub}
                onEdit={onEdit}
                onDelete={onDelete}
                deleteLoading={deleteLoading}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

