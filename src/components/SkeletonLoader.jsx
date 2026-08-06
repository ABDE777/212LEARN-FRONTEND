import React from 'react';

export function SkeletonElement({ width = '100%', height = '20px', borderRadius = '12px', style = {} }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        background: 'linear-gradient(90deg, var(--bg-color) 25%, rgba(255, 255, 255, 0.7) 50%, var(--bg-color) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite linear',
        boxShadow: 'var(--neu-shadow-inset-sm)',
        ...style,
      }}
    >
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}

export function CourseCardSkeleton() {
  return (
    <div
      style={{
        background: 'var(--bg-color)',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.6)',
        boxShadow: 'var(--neu-shadow-raised)',
        overflow: 'hidden',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      <SkeletonElement height="160px" borderRadius="14px" />
      <SkeletonElement width="40%" height="16px" />
      <SkeletonElement width="80%" height="22px" />
      <SkeletonElement width="60%" height="16px" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '1rem' }}>
        <SkeletonElement width="30%" height="24px" />
        <SkeletonElement width="35%" height="36px" borderRadius="10px" />
      </div>
    </div>
  );
}

export function DashboardStatsSkeleton() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.5rem',
        width: '100%',
      }}
    >
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            background: 'var(--bg-color)',
            padding: '1.5rem',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.6)',
            boxShadow: 'var(--neu-shadow-raised)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <SkeletonElement width="56px" height="56px" borderRadius="14px" />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <SkeletonElement width="60px" height="28px" />
            <SkeletonElement width="100px" height="14px" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableRowSkeleton({ cols = 6 }) {
  return (
    <tr style={{ borderBottom: '1px solid rgba(43, 38, 34, 0.08)' }}>
      {Array.from({ length: cols }).map((_, idx) => (
        <td key={idx} style={{ padding: '1rem' }}>
          <SkeletonElement height="18px" width={idx === 0 ? '70%' : '50%'} />
        </td>
      ))}
    </tr>
  );
}

export function TableSkeleton({ rows = 5, cols = 6 }) {
  return (
    <div style={{ background: 'var(--bg-color)', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.6)', boxShadow: 'var(--neu-shadow-raised)', overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'var(--bg-color)', boxShadow: 'var(--neu-shadow-inset-sm)' }}>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} style={{ padding: '1rem', textAlign: 'left' }}>
                <SkeletonElement height="16px" width="60%" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rIdx) => (
            <TableRowSkeleton key={rIdx} cols={cols} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
