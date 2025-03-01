import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Paper, Typography, Alert, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import { SEMESTERS } from '../utils/constants';
import ApplicantTable from './ApplicantTable';
import FacultyPicklist from './FacultyPicklist';

const ProgramForm = ({ onClose, refreshPrograms, editingProgram }) => {
  const navigate = useNavigate();

  const [programData, setProgramData] = useState({
    title: '',
    year: '',
    semester: '',
    faculty_lead_ids: [],
    application_open_date: '',
    application_deadline: '',
    essential_document_deadline: '',
    start_date: '',
    end_date: '',
    description: '',
  });

  const [errorMessage, setErrorMessage] = useState(null);
  const [systemAdminWarning, setSystemAdminWarning] = useState(false);

  useEffect(() => {
    if (editingProgram) {
      setProgramData({
        title: editingProgram.title,
        year: editingProgram.year,
        semester: editingProgram.semester,
        faculty_lead_ids: editingProgram.faculty_leads.map(faculty => faculty.id),
        application_open_date: editingProgram.application_open_date,
        application_deadline: editingProgram.application_deadline,
        essential_document_deadline: editingProgram.essential_document_deadline,
        start_date: editingProgram.start_date,
        end_date: editingProgram.end_date,
        description: editingProgram.description,
      });
    }
  }, [editingProgram]);

  const handleInputChange = (e) => {
    setProgramData({ ...programData, [e.target.name]: e.target.value });
  };

  const handleFacultyChange = (selectedFaculty) => {
    if (selectedFaculty.length === 0) {
      // Show warning that System Admin will be added as faculty lead
      setSystemAdminWarning(true);
      
      // Get the System Admin user - in a real implementation,
      // you would either fetch this from the backend or use a known ID
      axiosInstance.get('/api/users/', {
        params: { is_system_admin: true }
      }).then(response => {
        if (response.data && response.data.length > 0) {
          const systemAdmin = response.data[0];
          setProgramData({
            ...programData,
            faculty_lead_ids: [systemAdmin.id]
          });
        }
      }).catch(error => {
        console.error('Error fetching system admin:', error);
      });
    } else {
      // Regular case - user has selected faculty leads
      setSystemAdminWarning(false);
      setProgramData({
        ...programData,
        faculty_lead_ids: selectedFaculty.map(faculty => faculty.id)
      });
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingProgram) {
        await axiosInstance.put(`/api/programs/${editingProgram.id}/`, programData);
      } else {
        await axiosInstance.post('/api/programs/', programData);
      }
  
      refreshPrograms();
      navigate('/dashboard/admin-programs');
    } catch (error) {
      console.error('Error saving program:', error);
      setErrorMessage(error.response?.data?.detail || 'Failed to save program. Please check your input.');
    }
  };

  const handleDeleteProgram = async () => {
    if (!editingProgram) return;
    const countResponse = await axiosInstance.get(`/api/programs/${editingProgram.id}/applicant_counts/`);

    if (!window.confirm(`Are you sure you want to delete this program? This action cannot be undone, and will affect ${countResponse.data.applied} applicants and ${countResponse.data.enrolled} enrolled students.`))
      return;

    try {
      await axiosInstance.delete(`/api/programs/${editingProgram.id}/`);
      refreshPrograms();
      navigate('/dashboard/admin-programs');
    } catch (error) {
      console.error('Error deleting program:', error);
      setErrorMessage(error.response?.data?.detail || 'Failed to delete program.');
    }
  };

  return (
    <Paper sx={{ padding: '20px' }}>
      <Typography variant="h5" gutterBottom>
        {editingProgram ? 'Program Detail' : 'Create New Program'}
      </Typography>

      {errorMessage && (
        <Typography color="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Typography>
      )}

      {systemAdminWarning && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          System Admin will be added as the faculty lead since you removed all faculty leads.
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <TextField 
          label="Title" 
          name="title" 
          fullWidth 
          value={programData.title} 
          onChange={handleInputChange}
        />
        <TextField 
          label="Year" 
          name="year" 
          fullWidth 
          value={programData.year} 
          onChange={handleInputChange}
        />
        <FormControl fullWidth>
          <InputLabel id="semester-label">Semester</InputLabel>
          <Select
            labelId="semester-label"
            label="Semester"
            name="semester"
            value={programData.semester}
            onChange={handleInputChange}
          >
            {SEMESTERS.map(semester => (
              <MenuItem key={semester} value={semester}>{semester}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FacultyPicklist
          onFacultyChange={handleFacultyChange}
          initialSelected={programData.faculty_lead_ids}
        />
        <TextField 
          label="Description" 
          name="description" 
          multiline 
          rows={3} 
          fullWidth 
          value={programData.description} 
          onChange={handleInputChange}
        />
        <TextField
          label="Application Open Date"
          type="date"
          name="application_open_date"
          fullWidth
          InputLabelProps={{ shrink: true }}
          value={programData.application_open_date}
          onChange={handleInputChange}
        />
        <TextField
          label="Application Deadline"
          type="date"
          name="application_deadline"
          fullWidth
          InputLabelProps={{ shrink: true }}
          value={programData.application_deadline}
          onChange={handleInputChange}
        />
        <TextField
          label="Essential Document Deadline"
          type="date"
          name="essential_document_deadline"
          fullWidth
          InputLabelProps={{ shrink: true }}
          value={programData.essential_document_deadline}
          onChange={handleInputChange}
        />
        <TextField
          label="Start Date"
          type="date"
          name="start_date"
          fullWidth
          InputLabelProps={{ shrink: true }}
          value={programData.start_date}
          onChange={handleInputChange}
        />
        <TextField
          label="End Date"
          type="date"
          name="end_date"
          fullWidth
          InputLabelProps={{ shrink: true }}
          value={programData.end_date}
          onChange={handleInputChange}
        />

        <Box sx={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', mt: 2 }}>
          {editingProgram && (
            <Button
              variant="outlined"
              color="error"
              onClick={handleDeleteProgram}
            >
              Delete Program
            </Button>
          )}
          <Button variant="contained" onClick={handleSubmit}>
            {editingProgram ? 'Update Program' : 'Create Program'}
          </Button>
        </Box>
      </Box>

      {editingProgram && <ApplicantTable programId={editingProgram.id} />}
    </Paper>
  );
};

export default ProgramForm;
