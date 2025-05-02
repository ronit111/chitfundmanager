// src/components/ui/Dashboard.js
// Mobile-optimized dashboard component with responsive grid layout and card-based UI

import React, { useEffect, useState, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Divider, 
  Chip, 
  IconButton, 
  Tooltip, 
  Alert, 
  CircularProgress,
  Fade,
  Paper,
  useTheme,
  useMediaQuery,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'; // useTheme and useMediaQuery imported here
import {
  Add as AddIcon,
  Edit as EditIcon,
  Archive as ArchiveIcon,
  Visibility as ViewIcon,
  ContentCopy as DuplicateIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Sort as SortIcon
} from '@mui/icons-material';
import ArchiveSection from './ArchiveSection';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { getAuth } from 'firebase/auth';
import CreateGroupForm from '../CreateGroupForm';

// Empty state illustration component - mobile optimized
const EmptyState = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  // useMediaQuery must always be at the top level
  
  return (
    <Box 
      sx={{ 
        textAlign: 'center', 
        py: { xs: 4, sm: 6, md: 8 }, // Less padding on mobile
        px: { xs: 1, sm: 2 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      <Box 
        sx={{ 
          width: { xs: 80, sm: 100, md: 120 }, // Smaller on mobile
          height: { xs: 80, sm: 100, md: 120 },
          borderRadius: '50%', 
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(63, 81, 181, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: { xs: 2, sm: 3 }
        }}
      >
        <AddIcon sx={{ fontSize: { xs: 32, sm: 40, md: 48 }, color: theme.palette.primary.main }} />
      </Box>
      <Typography variant={isMobile ? "h6" : "h5"} gutterBottom>No active chit groups</Typography>
      <Typography 
        variant="body2" 
        color="textSecondary" 
        sx={{ 
          maxWidth: 500, 
          mb: { xs: 3, sm: 4 },
          px: { xs: 1, sm: 0 } // Add padding on mobile for better readability
        }}
      >
        Create your first chit group to start managing your funds efficiently. 
        Track payments, manage members, and organize your finances all in one place.
      </Typography>
    </Box>
  );
};

// Group card component - mobile optimized
const GroupCard = ({ group, onSelect, onArchive, onDuplicate }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  // useMediaQuery must always be at the top level
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Calculate progress
  const progress = Math.min(100, Math.floor(Math.random() * 100)); // Placeholder - should be calculated from actual data
  
  return (
    <Card 
      elevation={2}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:active': { // Better for touch devices
          transform: isMobile ? 'scale(0.98)' : 'translateY(-4px)',
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
        },
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
        },
        position: 'relative',
        overflow: 'hidden',
        borderRadius: { xs: 1, sm: 2 } // Smaller radius on mobile
      }}
    >
      {/* Progress indicator */}
      <Box 
        sx={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          height: 4, 
          width: `${progress}%`, 
          backgroundColor: theme.palette.success.main,
          transition: 'width 1s ease-in-out'
        }} 
      />
      
      <CardContent sx={{ flexGrow: 1, pb: 1, px: { xs: 2, sm: 3 }, py: { xs: 1.5, sm: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
            {group.name}
          </Typography>
          <Chip 
            label={`${group.months} months`} 
            size="small" 
            color="primary" 
            variant="outlined"
          />
        </Box>
        
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          {group.description || 'No description provided'}
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="textSecondary">
            Lumpsum Value
          </Typography>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
            {formatCurrency(group.lumpsum)}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="subtitle2" color="textSecondary">
              Start Date
            </Typography>
            <Typography variant="body2">
              {group.startMonth ? new Date(group.startMonth + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : 'Not set'}
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="subtitle2" color="textSecondary" align="right">
              Due Day
            </Typography>
            <Typography variant="body2" align="right">
              {group.dueDay ? `${group.dueDay}${getDaySuffix(group.dueDay)}` : 'Not set'}
            </Typography>
          </Box>
        </Box>
      </CardContent>
      
      <Divider />
      
      <CardActions sx={{ justifyContent: 'space-between', px: { xs: 1.5, sm: 2 }, py: { xs: 0.5, sm: 1 } }}>
        <Box>
          <Tooltip title="View Details">
            <IconButton 
              color="primary" 
              onClick={() => {
                // View details clicked
                onSelect(group.id);
              }}
              aria-label="View group details"
            >
              <ViewIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Duplicate">
            <IconButton 
              onClick={() => onDuplicate(group.id)}
              aria-label="Duplicate group"
            >
              <DuplicateIcon />
            </IconButton>
          </Tooltip>
        </Box>
        
        <Tooltip title="Archive Group">
          <IconButton 
            color="error" 
            onClick={() => onArchive(group.id)}
            aria-label="Archive group"
          >
            <ArchiveIcon />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
};

// Helper function to get day suffix (1st, 2nd, 3rd, etc.)
const getDaySuffix = (day) => {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
};

// Main Dashboard component
export default function Dashboard({ onSelectGroup }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  // useMediaQuery must always be at the top level
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState(null);
  
  // theme and isMobile already defined above
  const user = getAuth().currentUser;

  // Fetch groups from Firestore
  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'chitGroups'), where('owner', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const fetchedGroups = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGroups(fetchedGroups);
    } catch (err) {
      setError('Failed to fetch groups. Please try again later.');
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
      // First check if a group with the same name already exists
      const trimmedName = details.name.trim();
      if (!trimmedName) {
        setError('Group name is required.');
        return;
      }
      
      // Check for duplicate names
      const duplicateGroup = groups.find(g => 
        g.name.toLowerCase() === trimmedName.toLowerCase()
      );
      
      if (duplicateGroup) {
        setError(`A group with the name "${trimmedName}" already exists. Please use a different name.`);
        return;
      }
      
      // Sanitize and prepare group data
      const groupData = {
        name: trimmedName,
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
      
      await addDoc(collection(db, 'chitGroups'), groupData);
      await fetchGroups();
      setShowCreateForm(false);
    } catch (err) {
      setError('Failed to create group. Please try again.');
    }
  }

  // Handle archive group
  async function handleArchiveGroup(id) {
    setError("");
    try {
      const groupRef = doc(db, 'chitGroups', id);
      await updateDoc(groupRef, { archived: true, archivedAt: new Date() });
      await fetchGroups();
      setConfirmArchive(null);
    } catch (err) {
      setError("Failed to archive group.");
    }
  }
  
  // Handle duplicate group
  async function handleDuplicate(id) {
    setError("");
    try {
      // Get the original group from Firestore
      const docRef = doc(db, 'chitGroups', id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Group not found');
      }
      
      // Extract data from the original group
      const sourceData = docSnap.data();
      
      // Create a new object with only the properties we need
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
      
      // Save the new duplicate object to Firestore
      await addDoc(collection(db, 'chitGroups'), duplicateData);
      
      // Refresh the groups list
      await fetchGroups();
    } catch (err) {
      setError('Failed to duplicate group: ' + (err.message || err));
    }
  }
  
  // Handle restore group from archive
  async function handleRestore(id) {
    setError("");
    try {
      const groupRef = doc(db, 'chitGroups', id);
      await updateDoc(groupRef, { archived: false, archivedAt: null });
      await fetchGroups();
    } catch (err) {
      setError("Failed to restore group.");
    }
  }
  
  // Handle permanent deletion of a group
  async function handleDeleteForever(id) {
    setError("");
    try {
      const groupRef = doc(db, 'chitGroups', id);
      await deleteDoc(groupRef);
      await fetchGroups();
    } catch (err) {
      setError("Failed to delete group permanently.");
    }
  }

  // Split groups into active and archived
  const activeGroups = groups.filter(g => !g.archived);
  const archivedGroups = groups.filter(g => g.archived);

  // If a group is selected, pass it to the parent component
  useEffect(() => {
    if (selectedGroupId && onSelectGroup) {
      onSelectGroup(selectedGroupId);
      setSelectedGroupId(null);
    }
  }, [selectedGroupId, onSelectGroup]);

  return (
    <Box>
      {/* Header section - mobile optimized */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 2, sm: 3 }, // Less padding on mobile
          mb: { xs: 2, sm: 4 }, // Less margin on mobile
          borderRadius: { xs: 1, sm: 2 }, // Smaller radius on mobile
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(45deg, #303f9f 30%, #3949ab 90%)'
            : 'linear-gradient(45deg, #e8eaf6 30%, #c5cae9 90%)',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: { xs: 2, sm: 0 } }}>
          <Box>
            <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: { xs: 0.5, sm: 1 } }}>
              Your Chit Groups
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Manage and track all your chit funds in one place
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setShowCreateForm(true)}
            fullWidth={isMobile} // Full width on mobile
            size={isMobile ? "medium" : "large"} // Smaller on mobile
            sx={{ 
              borderRadius: { xs: 4, sm: 8 }, // Smaller radius on mobile
              px: { xs: 2, sm: 3 },
              py: { xs: 1, sm: 1.5 },
              boxShadow: 3,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 4,
              },
              '&:active': { // Better for touch devices
                transform: 'scale(0.98)',
              }
            }}
          >
            Create New Group
          </Button>
        </Box>
      </Paper>
      
      {/* Error message */}
      <Collapse in={!!error}>
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      </Collapse>
      
      {/* Create form dialog */}
      <Dialog 
        open={showCreateForm} 
        onClose={() => setShowCreateForm(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{
          elevation: 8,
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle>
          <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
            Create New Chit Group
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <CreateGroupForm
            onCreate={handleCreateGroup}
            onCancel={() => setShowCreateForm(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Archive confirmation dialog */}
      <Dialog
        open={!!confirmArchive}
        onClose={() => setConfirmArchive(null)}
      >
        <DialogTitle>Archive Group</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to archive this group? You can restore it within 1 month.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmArchive(null)}>Cancel</Button>
          <Button 
            onClick={() => handleArchiveGroup(confirmArchive)} 
            color="error" 
            variant="contained"
          >
            Archive
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Main content */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 500 }}>
          Active Groups
        </Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : activeGroups.length === 0 ? (
          <EmptyState />
        ) : (
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            {activeGroups.map(group => (
              <Grid item xs={12} sm={6} md={4} key={group.id}>
                <Fade in={true} timeout={500}>
                  <Box>
                    <GroupCard 
                      group={group} 
                      onSelect={(id) => {
                        setSelectedGroupId(id);
                        // Pass the selected group ID to the parent App component
                        onSelectGroup(id);
                      }}
                      onArchive={(id) => setConfirmArchive(id)}
                      onDuplicate={handleDuplicate}
                    />
                  </Box>
                </Fade>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
      
      {/* Archived groups section */}
      <ArchiveSection 
        archivedGroups={archivedGroups}
        onRestore={(id) => handleRestore(id)}
        onDelete={(id) => handleDeleteForever(id)}
        onSelect={setSelectedGroupId}
      />
    </Box>
  );
}
