// src/components/GroupMembers.js
// Handles viewing, editing, and deleting members, and locking member list after first month

import React, { useEffect, useState } from 'react';
import { doc, updateDoc, arrayRemove, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * GroupMembers Component
 * Shows, edits, and deletes members. Locks adding/removing after first payment.
 * Receives groupId and members as props, and notifies parent on changes.
 */
export default function GroupMembers({ groupId, members, onMembersChange, locked }) {
  const [editIndex, setEditIndex] = useState(null);
  const [editName, setEditName] = useState('');
  const [error, setError] = useState('');
  const [newMember, setNewMember] = useState('');

  // Edit member name
  async function handleEditMember(idx) {
    setEditIndex(idx);
    setEditName(members[idx].name);
  }

  // Save edited member name, prevent duplicates
  async function handleSaveEdit(idx) {
    setError('');
    if (!editName.trim()) {
      setError('Name cannot be empty.');
      return;
    }
    if (members.some((m, i) => m.name === editName.trim() && i !== idx)) {
      setError('A member with this name already exists.');
      return;
    }
    try {
      const oldMember = members[idx];
      const newMemberObj = { ...oldMember, name: editName.trim() };
      const docRef = doc(db, 'chitGroups', groupId);
      // Remove old, add new (Firestore doesn't support array update by index)
      await updateDoc(docRef, {
        members: arrayRemove(oldMember)
      });
      await updateDoc(docRef, {
        members: arrayUnion(newMemberObj)
      });
      const updated = members.map((m, i) => (i === idx ? newMemberObj : m));
      onMembersChange(updated);
      setEditIndex(null);
      setEditName('');
    } catch (err) {
      setError('Failed to edit member.');
    }
  }

  // Delete a member, with confirmation
  async function handleDeleteMember(idx) {
    setError('');
    if (!window.confirm('Are you sure you want to delete this member?')) return;
    try {
      const docRef = doc(db, 'chitGroups', groupId);
      await updateDoc(docRef, {
        members: arrayRemove(members[idx])
      });
      const updated = members.filter((_, i) => i !== idx);
      onMembersChange(updated);
    } catch (err) {
      setError('Failed to delete member.');
    }
  }

  // Add a new member, prevent duplicates
  async function handleAddMember(e) {
    e.preventDefault();
    setError('');
    if (!newMember.trim()) {
      setError('Member name is required.');
      return;
    }
    if (members.some(m => m.name === newMember.trim())) {
      setError('A member with this name already exists.');
      return;
    }
    try {
      const docRef = doc(db, 'chitGroups', groupId);
      await updateDoc(docRef, {
        members: arrayUnion({ name: newMember.trim() })
      });
      const updated = [...members, { name: newMember.trim() }];
      onMembersChange(updated);
      setNewMember('');
    } catch (err) {
      setError('Failed to add member.');
    }
  }

  return (
    <div style={{ marginBottom: 24 }}>
      <h3>Members {locked && <span style={{color:'red', fontSize:14}}>(Locked)</span>}</h3>
      {locked && (
        <div style={{ color: 'orange', marginBottom: 12 }}>
          <strong>Note:</strong> Members cannot be changed after the first payment.<br />
          If you need to adjust members, do so before starting payments.
        </div>
      )}
      <ul>
        {members.map((m, i) => (
          <li key={i} style={{ marginBottom: 6 }}>
            {editIndex === i ? (
              <>
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  style={{ padding: 4, marginRight: 4 }}
                  disabled={locked}
                />
                <button onClick={() => handleSaveEdit(i)} disabled={locked}>Save</button>
                <button onClick={() => setEditIndex(null)} disabled={locked}>Cancel</button>
              </>
            ) : (
              <>
                {m.name}
                {!locked && (
                  <>
                    <button onClick={() => handleEditMember(i)} style={{ marginLeft: 8 }}>Edit</button>
                    <button onClick={() => handleDeleteMember(i)} style={{ marginLeft: 4 }}>Delete</button>
                  </>
                )}
              </>
            )}
          </li>
        ))}
      </ul>
      {/* Add member form is only shown if not locked */}
      {!locked && (
        <form onSubmit={handleAddMember} style={{ marginTop: 12 }}>
          <input
            type="text"
            value={newMember}
            onChange={e => setNewMember(e.target.value)}
            placeholder="New member name"
            style={{ padding: 8, marginRight: 8 }}
          />
          <button type="submit" style={{ padding: '8px 16px' }}>Add Member</button>
        </form>
      )}
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
    </div>
  );
}
