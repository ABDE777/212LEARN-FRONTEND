import { Pencil, Trash2, Code, Database, Globe, Video, BookOpen, Users, Folder } from 'lucide-react';

export default function AdminSubcategoryItem({
  subcategory,
  onEdit,
  onDelete,
  deleteLoading,
}) {
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

  const SubcategoryIcon = getCategoryIcon(subcategory.icon);

  return (
    <div style={{ padding: '0.75rem 1rem', background: '#fff', borderRadius: '10px', border: '1px solid var(--border-color)', transition: 'all 0.2s' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}>
          <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem' }}>└─</span>
          <SubcategoryIcon size={16} style={{ color: 'var(--primary)' }} />
          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-color)' }}>{subcategory.name}</span>
            {subcategory.description && (
              <span style={{ fontSize: '0.8rem', color: 'var(--secondary)', marginLeft: '0.5rem' }}>
                — {subcategory.description}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => onEdit(subcategory)}
            style={{ padding: '0.35rem 0.68rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: '#fff', color: 'var(--text-color)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
          >
            <Pencil size={12} /> Éditer
          </button>
          <button
            type="button"
            onClick={() => onDelete(subcategory.id, subcategory.name)}
            disabled={deleteLoading}
            style={{ padding: '0.35rem 0.5rem', borderRadius: '6px', border: '1px solid rgba(220,53,69,0.2)', background: 'rgba(220,53,69,0.08)', color: '#dc3545', cursor: 'pointer', fontSize: '0.75rem' }}
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

