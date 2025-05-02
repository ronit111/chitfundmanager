// src/components/Dashboard.js
// Displays the user's chit groups and allows creating a new group

import React, { useEffect, useState, useCallback } from 'react';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth } from 'firebase/auth';
import GroupDetails from './GroupDetails';
import CreateGroupForm from './CreateGroupForm';
import ArchiveSection from './ArchiveSection';

export default function Dashboard() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const user = getAuth().currentUser;

  // Fetch groups from Firestore
  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'chitGroups'), where('owner', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const fetchedGroups = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Debug logging: print all ids and names
      // Groups fetched successfully
      setGroups(fetchedGroups);
    } catch (err) {
      setError('Failed to fetch groups.');
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) fetchGroups();
  }, [user, fetchGroups]);

  // Add a new group
  async function handleCreateGroup(details) {
    setError('');
    try {
      // First check if a group with the same name already exists (in both active and archived groups)
      const trimmedName = details.name.trim();
      if (!trimmedName) {
        setError('Group name is required.');
        return;
      }
      
      // Check for duplicate names in all groups (both active and archived)
      const duplicateGroup = groups.find(g => 
        g.name.toLowerCase() === trimmedName.toLowerCase()
      );
      
      if (duplicateGroup) {
        setError(`A group with the name "${trimmedName}" already exists. Please use a different name.`);
        return;
      }
      
      // Save paymentBuckets if present
      // Sanitize: remove undefined fields
      const groupData = {
        name: trimmedName, // Use the trimmed name
        months: details.months,
        lumpsum: details.lumpsum,
        description: details.description,
        startMonth: details.startMonth,
        dueDay: details.dueDay,
        chitType: details.chitType,
        commissionPercent: details.commissionPercent,
        manualPayinSchedule: Array.isArray(details.manualPayinSchedule) ? details.manualPayinSchedule : undefined,
        manualPayoutSchedule: Array.isArray(details.manualPayoutSchedule) ? details.manualPayoutSchedule : undefined,
        paymentBuckets: details.paymentBuckets || {
          beforeWinning: details.lumpsum,
          winningMonth: details.lumpsum,
          afterWinning: details.lumpsum
        },
        owner: user.uid,
        createdAt: new Date()
      };
      // Remove any undefined fields
      Object.keys(groupData).forEach(key => groupData[key] === undefined && delete groupData[key]);
      // Saving group to Firestore
      const docRef = await addDoc(collection(db, 'chitGroups'), groupData);
      // Refresh groups after creation
      await fetchGroups();
      setShowCreateForm(false);
    } catch (err) {
      setError('Failed to create group.');
    }
  }

  // Split groups into active and archived
  const activeGroups = groups.filter(g => !g.archived);
  const archivedGroups = groups.filter(g => g.archived);

  // Handler to refresh group list, passed to children
  const refreshGroups = fetchGroups;

  // --- ArchiveSection Firestore-backed actions ---
  async function handleRestoreGroup(id) {
    setError("");
    try {
      const groupRef = doc(db, 'chitGroups', id);
      await updateDoc(groupRef, { archived: false, archivedAt: null });
      await fetchGroups();
    } catch (err) {
      setError("Failed to restore group.");
    }
  }

  async function handleDeleteGroup(id) {
    setError("");
    try {
      const groupRef = doc(db, 'chitGroups', id);
      await deleteDoc(groupRef);
      await fetchGroups();
    } catch (err) {
      setError("Failed to delete group.");
    }
  }

  if (selectedGroupId) {
    return (
      <GroupDetails
        groupId={selectedGroupId}
        onBack={() => {
          setSelectedGroupId(null);
          refreshGroups(); // Always refresh on return
        }}
        refreshGroups={refreshGroups}
      />
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Your Chit Groups</h2>
      {showCreateForm ? (
        <CreateGroupForm
          onCreate={handleCreateGroup}
          onCancel={() => setShowCreateForm(false)}
        />
      ) : (
        <button
          onClick={() => setShowCreateForm(true)}
          style={{ marginBottom: 20, padding: '8px 16px' }}
        >
          + Create New Group
        </button>
      )}
      {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
      {loading ? (
        <div>Loading groups...</div>
      ) : (
        <>
          {/* Active Groups Section */}
          <h3>Active Groups</h3>
          {activeGroups.length === 0 ? (
            <div>No active chit groups. Create one to get started!</div>
          ) : (
            <ul>
              {activeGroups.map(group => (
                <li key={group.id} style={{ marginBottom: 8 }}>
                  <button
                    onClick={() => setSelectedGroupId(group.id)}
                    style={{ fontWeight: 'bold', background: 'none', border: 'none', color: '#1976d2', cursor: 'pointer', fontSize: 16 }}
                  >
                    {group.name} ({group.months} months, ₹{group.lumpsum})
                  </button>
                </li>
              ))}
            </ul>
          )}
          {/* Archived Groups Section */}
          <ArchiveSection
            archivedGroups={archivedGroups}
            onRestore={handleRestoreGroup}
            onDelete={handleDeleteGroup}
          />
        </>
      )}
    </div>
  );
}
