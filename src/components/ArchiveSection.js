// src/components/ArchiveSection.js
// Lists archived groups and allows restore or permanent delete

import React from 'react';

export default function ArchiveSection({ archivedGroups, onRestore, onDelete }) {
  if (!archivedGroups.length) return null;
  return (
    <div style={{ marginTop: 32, background: '#f8f8f8', padding: 16, borderRadius: 8 }}>
      <h3>Archived Groups (restorable for 1 month)</h3>
      <ul>
        {archivedGroups.map(group => (
          <li key={group.id} style={{ marginBottom: 10 }}>
            <strong>{group.name}</strong> ({group.months} months, ₹{group.lumpsum})
            <button onClick={() => onRestore(group.id)} style={{ marginLeft: 12, padding: '4px 12px' }}>Restore</button>
            <button
              onClick={() => {
                if (window.confirm('Permanently delete this group? This cannot be undone.')) onDelete(group.id);
              }}
              style={{ marginLeft: 8, background: '#e53935', color: 'white', padding: '4px 12px' }}
            >
              Delete Forever
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
