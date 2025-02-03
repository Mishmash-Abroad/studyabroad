import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Paper, Typography, IconButton } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';

const defaultQuestions = [
  "Why do you want to participate in this study abroad program?",
  "How does this program align with your academic or career goals?",
  "What challenges do you anticipate during this experience, and how will you address them?",
  "Describe a time you adapted to a new or unfamiliar environment.",
  "What unique perspective or contribution will you bring to the group?",
];

const ProgramForm = ({ onClose, refreshPrograms, editingProgram }) => {
  const navigate = useNavigate();

  const [programData, setProgramData] = useState({
    title: '',
    year_semester: '',
    faculty_leads: '',
    application_open_date: '',
    application_deadline: '',
    start_date: '',
    end_date: '',
    description: '',
  });
  const [questions, setQuestions] = useState([]);
  const [deletedQuestions, setDeletedQuestions] = useState([]);

  useEffect(() => {
    if (editingProgram) {
      setProgramData({
        title: editingProgram.title,
        year_semester: editingProgram.year_semester,
        faculty_leads: editingProgram.faculty_leads,
        application_open_date: editingProgram.application_open_date,
        application_deadline: editingProgram.application_deadline,
        start_date: editingProgram.start_date,
        end_date: editingProgram.end_date,
        description: editingProgram.description,
      });
      axiosInstance.get(`/api/programs/${editingProgram.id}/questions/`).then((response) => {
        setQuestions(response.data);
      });
    } else {
      setQuestions(defaultQuestions.map((text) => ({ text })));
    }
  }, [editingProgram]);

  const handleInputChange = (e) => setProgramData({ ...programData, [e.target.name]: e.target.value });

  const handleQuestionChange = (index, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].text = value;
    setQuestions(updatedQuestions);
  };

  const addQuestion = () => setQuestions([...questions, { text: '' }]);

  const removeQuestion = (index) => {
    const questionToRemove = questions[index];
    if (questionToRemove.id) {
      setDeletedQuestions([...deletedQuestions, questionToRemove.id]);
    }
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      if (editingProgram) {
        await axiosInstance.put(`/api/programs/${editingProgram.id}/`, programData);
  
        await Promise.all(
          deletedQuestions.map((questionId) => axiosInstance.delete(`/api/questions/${questionId}/`))
        );
  
        await Promise.all(
          questions.map((q) =>
            q.id
              ? axiosInstance.put(`/api/questions/${q.id}/`, { 
                  text: q.text, 
                  program: editingProgram.id 
                }) 
              : axiosInstance.post(`/api/questions/`, { 
                  program: editingProgram.id, 
                  text: q.text 
                }) 
          )
        );
  
      } else {
        const programResponse = await axiosInstance.post('/api/programs/', programData);
        await Promise.all(
          questions.map((q) => axiosInstance.post('/api/questions/', { program: programResponse.data.id, text: q.text }))
        );
      }
  
      refreshPrograms();
      navigate('/dashboard/admin-programs');
    } catch (error) {
      console.error('Error saving program:', error);
      if (error.response) {
        console.error('Backend Response:', error.response.data);
      }
    }
  };
  

  const handleDeleteProgram = async () => {
    if (!editingProgram) return;
    if (!window.confirm("Are you sure you want to delete this program? This action cannot be undone.")) return;

    try {
      await axiosInstance.delete(`/api/programs/${editingProgram.id}/`);
      refreshPrograms();
      navigate('/dashboard/admin-programs');
    } catch (error) {
      console.error('Error deleting program:', error);
    }
  };

  return (
    <Paper sx={{ padding: '20px' }}>
      <Typography variant="h5" gutterBottom>{editingProgram ? 'Edit Program' : 'Create New Program'}</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <TextField label="Title" name="title" fullWidth value={programData.title} onChange={handleInputChange} />
        <TextField label="Year & Semester" name="year_semester" fullWidth value={programData.year_semester} onChange={handleInputChange} />
        <TextField label="Faculty Leads" name="faculty_leads" fullWidth value={programData.faculty_leads} onChange={handleInputChange} />
        <TextField label="Application Open Date" type="date" InputLabelProps={{ shrink: true }} name="application_open_date" fullWidth value={programData.application_open_date} onChange={handleInputChange} />
        <TextField label="Application Deadline" type="date" InputLabelProps={{ shrink: true }} name="application_deadline" fullWidth value={programData.application_deadline} onChange={handleInputChange} />
        <TextField label="Program Start Date" type="date" InputLabelProps={{ shrink: true }} name="start_date" fullWidth value={programData.start_date} onChange={handleInputChange} />
        <TextField label="Program End Date" type="date" InputLabelProps={{ shrink: true }} name="end_date" fullWidth value={programData.end_date} onChange={handleInputChange} />
        <TextField label="Description" name="description" multiline rows={3} fullWidth value={programData.description} onChange={handleInputChange} />

        <Typography variant="h6">Application Questions</Typography>
        {questions.map((q, index) => (
          <Box key={index} display="flex" sx={{ mb: 2 }}>
            <TextField fullWidth label={`Question ${index + 1}`} value={q.text} onChange={(e) => handleQuestionChange(index, e.target.value)} />
            <IconButton onClick={() => removeQuestion(index)}><DeleteIcon /></IconButton>
          </Box>
        ))}
        <Button onClick={addQuestion}>Add Question</Button>
      </Box>

      <Box sx={{ marginTop: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Box>
          {editingProgram && (
            <Button variant="outlined" color="error" onClick={handleDeleteProgram}>
              Delete Program
            </Button>
          )}
        </Box>
        <Box>
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            {editingProgram ? 'Update Program' : 'Create Program'}
          </Button>
          <Button onClick={() => navigate('/dashboard/admin-programs')} sx={{ ml: 2 }}>Cancel</Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default ProgramForm;
