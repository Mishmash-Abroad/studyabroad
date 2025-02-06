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
import axiosInstance from '../utils/axios';
import AnnouncementEditor from './AnnouncementEditor';

const ManagerContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius.large,
  boxShadow: theme.customShadows.card,
}));

const TableWrapper = styled(TableContainer)(({ theme }) => ({
  marginTop: theme.spacing(3),
  borderRadius: theme.shape.borderRadius.medium,
  maxHeight: '500px',
}));

const ImportanceCell = styled(TableCell)(({ theme, importance }) => {
  const getColor = () => {
    switch (importance) {
      case 'urgent':
        return theme.palette.error;
      case 'high':
        return theme.palette.warning;
      case 'medium':
        return theme.palette.info;
      default:
        return theme.palette.success;
    }
  };

  const color = getColor();

  return {
    color: color.main,
    fontWeight: 500,
  };
});

const AnnouncementsManager = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await axiosInstance.get('/api/announcements/');
      setAnnouncements(response.data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

  const handleEdit = (announcement) => {
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

  const handleEditorClose = () => {
    setIsEditorOpen(false);
    setEditingAnnouncement(null);
  };

  const handleEditorSave = async () => {
    await fetchAnnouncements();
    handleEditorClose();
  };

  return (
    <ManagerContainer>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" component="h2">
          Manage Announcements
        </Typography>
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
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {announcements.map((announcement) => (
              <TableRow key={announcement.id}>
                <TableCell>{announcement.title}</TableCell>
                <TableCell>
                  {new Date(announcement.created_at).toLocaleDateString()}
                </TableCell>
                <ImportanceCell importance={announcement.importance}>
                  {announcement.importance.toUpperCase()}
                </ImportanceCell>
                <TableCell>
                  {announcement.is_active ? 'Active' : 'Inactive'}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => handleEdit(announcement)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => setDeleteConfirmation(announcement)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableWrapper>

      {/* Editor Dialog */}
      <Dialog
        open={isEditorOpen}
        onClose={handleEditorClose}
        maxWidth="md"
        fullWidth
      >
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
      <Dialog
        open={Boolean(deleteConfirmation)}
        onClose={() => setDeleteConfirmation(null)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          Are you sure you want to delete the announcement "{deleteConfirmation?.title}"?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmation(null)}>Cancel</Button>
          <Button onClick={handleDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </ManagerContainer>
  );
};

export default AnnouncementsManager;
