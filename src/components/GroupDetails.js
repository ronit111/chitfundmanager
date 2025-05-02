// src/components/GroupDetails.js
// Displays and manages details for a single chit group

import React, { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc, deleteDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import GroupMembers from './GroupMembers';
import PaymentSchedule from './PaymentSchedule';
import EditGroupForm from './EditGroupForm';

export default function GroupDetails({ groupId, onBack, onArchive }) {
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [error, setError] = useState('');
  const [locked, setLocked] = useState(false);
  const [editing, setEditing] = useState(false);
  const [archiveMode, setArchiveMode] = useState(false);
  const [canDeleteForever, setCanDeleteForever] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [newGroupId, setNewGroupId] = useState(null); // Track duplicated group

  // Use the current local time provided by the system
  const currentTime = new Date('2025-04-29T00:42:02+05:30');

  useEffect(() => {
    async function fetchGroup() {
      setLoading(true);
      try {
        const docRef = doc(db, 'chitGroups', groupId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setGroup({ id: docSnap.id, ...data });
          setMembers(data.members || []);
          setLocked(!!data.firstMonthPaidIn);
          setArchiveMode(!!data.archived);

          // Check if group can be permanently deleted
          if (data.archived && data.archivedAt) {
            let archivedAtDate;
            if (data.archivedAt.toDate) {
              archivedAtDate = data.archivedAt.toDate();
            } else {
              archivedAtDate = new Date(data.archivedAt);
            }
            const oneMonthMs = 30 * 24 * 60 * 60 * 1000;
            setCanDeleteForever(currentTime - archivedAtDate > oneMonthMs);
          } else {
            setCanDeleteForever(false);
          }
        } else {
          setError('Group not found.');
        }
      } catch (err) {
        setError('Failed to fetch group.');
      }
      setLoading(false);
    }
    // If we just duplicated, fetch the new group for editing
    if (newGroupId) {
      async function fetchNewGroup() {
        setLoading(true);
        try {
          const docRef = doc(db, 'chitGroups', newGroupId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setGroup({ id: docSnap.id, ...data });
            setEditing(true);
            setArchiveMode(false);
            setMembers([]); // No members for new group
            setLocked(false);
          } else {
            setError('Duplicated group not found.');
          }
        } catch (err) {
          setError('Failed to fetch duplicated group.');
        }
        setLoading(false);
      }
      fetchNewGroup();
      setNewGroupId(null); // Reset for next time
    } else if (groupId && !editing && !duplicating) {
      fetchGroup();
    }
    // eslint-disable-next-line
  }, [groupId, editing, duplicating, newGroupId]);

  function handleMembersChange(updatedMembers) {
    setMembers(updatedMembers);
  }

  function handleLockMembers() {
    setLocked(true);
  }

  async function handleEditSave(updated) {
    setError('');
    try {
      const docRef = doc(db, 'chitGroups', group.id);
      await updateDoc(docRef, updated);
      setGroup(g => ({ ...g, ...updated }));
      setEditing(false);
    } catch (err) {
      setError('Failed to update group.');
    }
  }

  async function handleArchive() {
    setError('');
    try {
      const docRef = doc(db, 'chitGroups', groupId);
      await updateDoc(docRef, { archived: true, archivedAt: new Date() });
      if (onArchive) onArchive(groupId);
      onBack();
    } catch (err) {
      setError('Failed to archive group.');
    }
  }

  async function handleRestore() {
    setError('');
    try {
      const docRef = doc(db, 'chitGroups', groupId);
      await updateDoc(docRef, { archived: false, archivedAt: null });
      setArchiveMode(false);
    } catch (err) {
      setError('Failed to restore group.');
    }
  }

  // Permanently delete the group (only enabled if archived for >1 month)
  async function handleDeleteForever() {
    setDeleting(true);
    setError('');
    try {
      const docRef = doc(db, 'chitGroups', groupId);
      await deleteDoc(docRef);
      setDeleting(false);
      onBack();
    } catch (err) {
      setError('Failed to permanently delete group.');
      setDeleting(false);
    }
  }

  // Duplicate group: create a new group with same properties, then open edit form
  async function handleDuplicate() {
    setDuplicating(true);
    setError('');
    try {
      // CRITICAL BUGFIX: Completely new approach to avoid any reference issues
      // Instead of modifying any objects, we'll create a brand new object from scratch
      // First, get a fresh copy of the original group from Firestore
      const docRef = doc(db, 'chitGroups', groupId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Group not found');
      }
      
      // Extract only the data we need as primitive values
      const sourceData = docSnap.data();
      
      // Create a completely new object with only the properties we need
      // This ensures no reference to the original object exists
      const duplicateData = {
        // Basic properties
        name: `${sourceData.name.trim()} (Copy)`,
        months: Number(sourceData.months) || 12,
        lumpsum: Number(sourceData.lumpsum) || 0,
        description: sourceData.description ? String(sourceData.description) : '',
        startMonth: sourceData.startMonth ? String(sourceData.startMonth) : '',
        dueDay: Number(sourceData.dueDay) || 1,
        chitType: sourceData.chitType ? String(sourceData.chitType) : 'constant',
        commissionPercent: Number(sourceData.commissionPercent) || 5,
        
        // Create new arrays/objects instead of copying references
        members: [],  // Start with empty members for the duplicate
        createdAt: new Date(),
        archived: false,
        archivedAt: null,
        owner: sourceData.owner
      };
      
      // Handle payment buckets (deep copy to avoid references)
      if (sourceData.paymentBuckets) {
        duplicateData.paymentBuckets = {
          beforeWinning: Number(sourceData.paymentBuckets.beforeWinning) || duplicateData.lumpsum,
          winningMonth: Number(sourceData.paymentBuckets.winningMonth) || duplicateData.lumpsum,
          afterWinning: Number(sourceData.paymentBuckets.afterWinning) || duplicateData.lumpsum
        };
      }
      
      // Handle manual schedules (deep copy to avoid references)
      if (Array.isArray(sourceData.manualPayinSchedule)) {
        duplicateData.manualPayinSchedule = sourceData.manualPayinSchedule.map(val => Number(val) || 0);
      }
      
      if (Array.isArray(sourceData.manualPayoutSchedule)) {
        duplicateData.manualPayoutSchedule = sourceData.manualPayoutSchedule.map(val => Number(val) || duplicateData.lumpsum);
      }
      
      // Save the completely new duplicate object to Firestore
      const newDoc = await addDoc(collection(db, 'chitGroups'), duplicateData);
      
      // Successfully duplicated group
      setDuplicating(false);
      setNewGroupId(newDoc.id); // Triggers edit form for new group if needed
    } catch (err) {
      console.error('Duplication error:', err);
      setError('Failed to duplicate group: ' + (err.message || err));
      setDuplicating(false);
    }
  }

  if (loading) return <div>Loading group details...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!group) return null;

  if (editing) {
    return (
      <EditGroupForm
        // Defensive: Always pass a deep copy to prevent mutation bugs
        initial={JSON.parse(JSON.stringify(group))}
        onSave={handleEditSave}
        onCancel={() => setEditing(false)}
      />
    );
  }

  return (
    <>
      <div style={{ padding: 20 }}>
      <button onClick={onBack} style={{ marginBottom: 16 }}>&larr; Back to Dashboard</button>
      <h2>{group.name}</h2>
      <div style={{ marginBottom: 16 }}>
        <strong>Duration:</strong> {group.months} months<br />
        <strong>Lumpsum Value:</strong> ₹{group.lumpsum}<br />
        {group.description && <><strong>Description:</strong> {group.description}</>}
      </div>
      <div style={{ marginBottom: 18 }}>
        <button onClick={handleDuplicate} style={{ marginRight: 12, padding: '6px 16px' }} disabled={duplicating}>
          {duplicating ? 'Duplicating...' : 'Duplicate Group'}
        </button>
        {!archiveMode && (
          <>
            <button onClick={() => setEditing(true)} style={{ marginRight: 12, padding: '6px 16px' }}>Edit Group</button>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to archive this group? You can restore it within 1 month.')) handleArchive();
              }}
              style={{ background: '#e53935', color: 'white', padding: '6px 16px' }}
            >
              Archive Group
            </button>
          </>
        )}
        {archiveMode && (
          <>
            <button onClick={handleRestore} style={{ marginRight: 12, padding: '6px 16px' }}>Restore Group</button>
            <button
              onClick={() => {
                if (window.confirm('Permanently delete this group? This cannot be undone.')) handleDeleteForever();
              }}
              style={{ background: canDeleteForever ? '#e53935' : '#aaa', color: 'white', padding: '6px 16px' }}
              disabled={!canDeleteForever || deleting}
              title={canDeleteForever ? 'Delete forever' : 'Can only delete after 1 month in archive'}
            >
              {deleting ? 'Deleting...' : 'Delete Forever'}
            </button>
          </>
        )}
      </div>
      <GroupMembers
        groupId={group.id}
        members={members}
        onMembersChange={handleMembersChange}
        locked={locked}
      />
      {/* Defensive: Only render PaymentSchedule if startMonth and dueDay are valid */}
      {group.startMonth && typeof group.startMonth === 'string' && group.startMonth.includes('-') && group.dueDay ? (
        <>
          {/* 
            Adding a `key` prop ensures PaymentSchedule fully resets its state whenever months or members change.
            This prevents bugs where the payment/winner tables show stale or mismatched data after editing or duplicating groups.
            React remounts the component when the key changes, guaranteeing a fresh state.
          */}
          <PaymentSchedule
            key={`${group.months}-${members.length}-${group.lumpsum}`}
            groupId={group.id}
            members={members}
            months={group.months || 12}
            lumpsum={group.lumpsum}
            onLockMembers={handleLockMembers}
            startMonth={group.startMonth}
            dueDay={group.dueDay}
            paymentBuckets={group.paymentBuckets}
            chitType={group.chitType}
            commissionPercent={group.commissionPercent}
            manualPayinSchedule={group.manualPayinSchedule}
            manualPayoutSchedule={group.manualPayoutSchedule}
          />
        </>
      ) : (
        <div style={{ color: 'red', marginTop: 16 }}>
          <strong>Cannot display payment schedule.</strong><br />
          Please set a valid <code>Start Month</code> and <code>Due Day</code> for this group.
        </div>
      )}
    </div>
    </>
  );
}
