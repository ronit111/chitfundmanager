// src/components/ui/ArchiveSection.js
// Mobile-optimized archive section component with improved UI/UX

import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Collapse, 
  IconButton, 
  Tooltip, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  RestoreFromTrash as RestoreIcon,
  DeleteForever as DeleteIcon,
  Archive as ArchiveIcon
} from '@mui/icons-material';

/**
 * Enhanced ArchiveSection Component
 * Features:
 * - Collapsible section for better space management
 * - Card-based layout for archived groups
 * - Confirmation dialogs for destructive actions
 * - Visual indicators for archive status
 */
export default function ArchiveSection({ archivedGroups, onRestore, onDelete, onSelect }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmRestore, setConfirmRestore] = useState(null);

  // Toggle section expansion
  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    
    let date;
    if (timestamp.toDate) {
      // Firestore timestamp
      date = timestamp.toDate();
    } else {
      // Regular date object or string
      date = new Date(timestamp);
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate time since archiving
  const getArchiveAge = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    let archivedDate;
    if (timestamp.toDate) {
      archivedDate = timestamp.toDate();
    } else {
      archivedDate = new Date(timestamp);
    }
    
    const now = new Date();
    const diffTime = Math.abs(now - archivedDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // If no archived groups, don't render anything
  if (!archivedGroups || archivedGroups.length === 0) {
    return null;
  }

  // Removed duplicate declaration of isMobile. It is already declared at the top of the component.

  return (
    <Box sx={{ mt: { xs: 4, sm: 6 } }}>
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: { xs: 1.5, sm: 2 },
          gap: { xs: 1, sm: 0 }
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          width: { xs: '100%', sm: 'auto' }
        }}>
          <ArchiveIcon sx={{ mr: 1, color: 'text.secondary', fontSize: { xs: 20, sm: 24 } }} />
          <Typography variant={isMobile ? "h6" : "h5"} sx={{ fontWeight: 500 }}>
            Archived Groups
          </Typography>
          <Chip 
            label={archivedGroups.length} 
            size="small" 
            color="default" 
            sx={{ ml: 1 }}
          />
        </Box>
        
        <Button
          onClick={handleExpandClick}
          endIcon={
            <ExpandMoreIcon 
              sx={{ 
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: theme.transitions.create('transform', {
                  duration: theme.transitions.duration.shortest,
                }),
              }} 
            />
          }
          fullWidth={isMobile}
          size={isMobile ? "small" : "medium"}
          sx={{
            mt: { xs: 1, sm: 0 }
          }}
        >
          {expanded ? 'Hide' : 'Show'}
        </Button>
      </Box>
      
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 2, sm: 4 } }}>
          {archivedGroups.map(group => (
            <Grid item xs={12} sm={6} md={4} key={group.id}>
              <Card 
                elevation={1}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  opacity: 0.9,
                  transition: 'all 0.2s',
                  '&:hover': {
                    opacity: 1,
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                  },
                  '&:active': { // Better for touch devices
                    opacity: 1,
                    transform: isMobile ? 'scale(0.98)' : 'translateY(-4px)',
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                  },
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: { xs: 1, sm: 2 } // Smaller radius on mobile
                }}
              >
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    width: '100%', 
                    height: 4, 
                    backgroundColor: theme.palette.warning.main 
                  }} 
                />
                
                <CardContent sx={{ flexGrow: 1, pb: 1, px: { xs: 2, sm: 3 }, py: { xs: 1.5, sm: 2 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                      {group.name}
                    </Typography>
                    <Tooltip title={formatDate(group.archivedAt)}>
                      <Chip 
                        label={getArchiveAge(group.archivedAt)} 
                        size="small" 
                        color="warning" 
                        variant="outlined"
                      />
                    </Tooltip>
                  </Box>
                  
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    {group.description || 'No description provided'}
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Value
                    </Typography>
                    <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(group.lumpsum)}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">
                        Duration
                      </Typography>
                      <Typography variant="body2">
                        {group.months} months
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary" align="right">
                        Members
                      </Typography>
                      <Typography variant="body2" align="right">
                        {group.members ? group.members.length : 0}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
                
                <Divider />
                
                <CardActions sx={{ justifyContent: 'space-between', px: { xs: 1.5, sm: 2 }, py: { xs: 0.5, sm: 1 } }}>
                  {onSelect && (
                    <Tooltip title="View Details">
                      <Button 
                        size="small" 
                        onClick={() => {
                          // Pass the selected group ID to the parent component
                          onSelect(group.id);
                        }}
                      >
                        View
                      </Button>
                    </Tooltip>
                  )}
                  
                  <Box>
                    <Tooltip title="Restore Group">
                      <IconButton 
                        color="primary" 
                        onClick={() => setConfirmRestore(group.id)}
                        aria-label="Restore group"
                        size="small"
                      >
                        <RestoreIcon />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Delete Forever">
                      <IconButton 
                        color="error" 
                        onClick={() => setConfirmDelete(group.id)}
                        aria-label="Delete group permanently"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Collapse>
      
      {/* Confirmation Dialogs */}
      {/* Restore Confirmation */}
      <Dialog open={!!confirmRestore} onClose={() => setConfirmRestore(null)}>
        <DialogTitle>Restore Group</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to restore this group? It will be moved back to your active groups.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmRestore(null)}>Cancel</Button>
          <Button 
            onClick={() => {
              onRestore(confirmRestore);
              setConfirmRestore(null);
            }} 
            color="primary" 
            variant="contained"
          >
            Restore
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation */}
      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
        <DialogTitle>Delete Group Permanently</DialogTitle>
        <DialogContent>
          <Typography color="error" paragraph>
            Warning: This action cannot be undone.
          </Typography>
          <Typography>
            Are you sure you want to permanently delete this group? All data associated with this group will be lost.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>Cancel</Button>
          <Button 
            onClick={() => {
              onDelete(confirmDelete);
              setConfirmDelete(null);
            }} 
            color="error" 
            variant="contained"
          >
            Delete Forever
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
