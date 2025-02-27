import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import axiosInstance from '../utils/axios';
import AnnouncementEditor from './AnnouncementEditor';
import AnnouncementDetailModal from './AnnouncementDetailModal';

const ManagerContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadii,
}));

const TableWrapper = styled(TableContainer)(({ theme }) => ({
  marginTop: theme.spacing(3),
  borderRadius: theme.shape.borderRadii,
  maxHeight: '500px',
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const AnnouncementsManager = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await axiosInstance.get('/api/announcements/');
      // Sort announcements by created_at in descending order (newest first)
      const sortedAnnouncements = response.data.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
      setAnnouncements(sortedAnnouncements);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

  const handleEdit = (announcement, event) => {
    event.stopPropagation();
    setEditingAnnouncement(announcement);
    setIsEditorOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirmation) return;
    try {
      await axiosInstance.delete(`/api/announcements/${deleteConfirmation.id}/`);
      await fetchAnnouncements();
      setDeleteConfirmation(null);
    } catch (error) {
      console.error('Error deleting announcement:', error);
    }
  };

  const handleRowClick = (announcement) => {
    setSelectedAnnouncement(announcement);
  };

  const handleToggleActive = async (announcement, isActive, event) => {
    if (event) event.stopPropagation();
    try {
      const formData = new FormData();
      formData.append("is_active", isActive);
      
      await axiosInstance.patch(`/api/announcements/${announcement.id}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      await fetchAnnouncements();
    } catch (error) {
      console.error('Error updating announcement active status:', error);
    }
  };

  const handleTogglePinned = async (announcement, isPinned, event) => {
    if (event) event.stopPropagation();
    try {
      const formData = new FormData();
      formData.append("pinned", isPinned);
      
      await axiosInstance.patch(`/api/announcements/${announcement.id}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      await fetchAnnouncements();
    } catch (error) {
      console.error('Error updating announcement pinned status:', error);
    }
  };

  const handleEditorClose = () => {
    setIsEditorOpen(false);
    setEditingAnnouncement(null);
  };

  const handleEditorSave = async () => {
    await fetchAnnouncements();
    handleEditorClose();
  };

  const handleDetailModalClose = () => {
    setSelectedAnnouncement(null);
  };

  return (
    <ManagerContainer>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">Manage Announcements</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsEditorOpen(true)}
        >
          New Announcement
        </Button>
      </Box>

      <TableWrapper>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Importance</TableCell>
              <TableCell>Pinned</TableCell>
              <TableCell>Visible</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {announcements.map((announcement) => (
              <StyledTableRow key={announcement.id} onClick={() => handleRowClick(announcement)}>
                <TableCell>{announcement.title}</TableCell>
                <TableCell>{new Date(announcement.created_at).toLocaleDateString()}</TableCell>
                <TableCell>{announcement.importance.toUpperCase()}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={(e) => handleTogglePinned(announcement, !announcement.pinned, e)}
                    color={announcement.pinned ? "primary" : "default"}
                    size="small"
                  >
                    {announcement.pinned ? <PushPinIcon /> : <PushPinOutlinedIcon />}
                  </IconButton>
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={(e) => handleToggleActive(announcement, !announcement.is_active, e)}
                    color={announcement.is_active ? "primary" : "default"}
                    size="small"
                  >
                    {announcement.is_active ? <VisibilityIcon /> : <VisibilityOffIcon />}
                  </IconButton>
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={(e) => handleEdit(announcement, e)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirmation(announcement);
                    }}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableWrapper>

      {/* Editor Dialog */}
      <Dialog open={isEditorOpen} onClose={handleEditorClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingAnnouncement ? 'Edit Announcement' : 'New Announcement'}
        </DialogTitle>
        <DialogContent>
          <AnnouncementEditor
            initialData={editingAnnouncement}
            onSave={handleEditorSave}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={Boolean(deleteConfirmation)} onClose={() => setDeleteConfirmation(null)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          Are you sure you want to delete the announcement "{deleteConfirmation?.title}"?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmation(null)}>Cancel</Button>
          <Button onClick={handleDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Detail Modal */}
      {selectedAnnouncement && (
        <AnnouncementDetailModal
          announcement={selectedAnnouncement}
          onClose={handleDetailModalClose}
          allAnnouncements={announcements}
          onNavigate={setSelectedAnnouncement}
        />
      )}
    </ManagerContainer>
  );
};

export default AnnouncementsManager;