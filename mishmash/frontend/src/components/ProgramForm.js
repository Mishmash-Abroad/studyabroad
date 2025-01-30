import React, { useState } from 'react';
import { Box, TextField, Button, Paper, Typography, IconButton, Divider } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import axiosInstance from '../utils/axios';

// Default Questions
const defaultQuestions = [
  "Why do you want to participate in this study abroad program?",
  "How does this program align with your academic or career goals?",
  "What challenges do you anticipate during this experience, and how will you address them?",
  "Describe a time you adapted to a new or unfamiliar environment.",
  "What unique perspective or contribution will you bring to the group?",
];

const ProgramForm = ({ onClose, refreshPrograms }) => {
  const [programData, setProgramData] = useState({
    title: '', 
    year_semester: '', 
    faculty_leads: '', 
    application_open_date: '', 
    application_deadline: '', 
    start_date: '', 
    end_date: '', 
    description: ''
  });

  const [questions, setQuestions] = useState(defaultQuestions.map(text => ({ text })));

  // Handle program input changes
  const handleInputChange = (e) => {
    setProgramData({ ...programData, [e.target.name]: e.target.value });
  };

  // Handle question input changes
  const handleQuestionChange = (index, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].text = value;
    setQuestions(updatedQuestions);
  };

  // Add a new empty question field
  const addQuestion = () => {
    setQuestions([...questions, { text: '' }]);
  };

  // Remove a question by index
  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  // Submit form
  const handleCreateProgram = async () => {
    try {
      // Create program first
      const programResponse = await axiosInstance.post('/api/programs/', programData);

      // Add questions associated with the program
      await Promise.all(questions.map(q => axiosInstance.post('/api/questions/', {
        program: programResponse.data.id, 
        text: q.text
      })));

      refreshPrograms();
      onClose();
    } catch (error) {
      console.error('Error creating program:', error);
    }
  };

  return (
    <Paper sx={{ padding: '20px', marginTop: '20px' }}>
      <Typography variant="h5" gutterBottom>
        Create New Program
      </Typography>

      {/* Program Details */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <TextField label="Program Title" name="title" fullWidth onChange={handleInputChange} />
        <TextField label="Year & Semester" name="year_semester" fullWidth onChange={handleInputChange} />
        <TextField label="Faculty Leads" name="faculty_leads" fullWidth onChange={handleInputChange} />
        
        <TextField
          label="Application Open Date (mm/dd/yyyy)"
          type="date"
          name="application_open_date"
          fullWidth
          InputLabelProps={{ shrink: true }}
          onChange={handleInputChange}
        />
        <TextField
          label="Application Deadline (mm/dd/yyyy)"
          type="date"
          name="application_deadline"
          fullWidth
          InputLabelProps={{ shrink: true }}
          onChange={handleInputChange}
        />
        <TextField
          label="Program Start Date (mm/dd/yyyy)"
          type="date"
          name="start_date"
          fullWidth
          InputLabelProps={{ shrink: true }}
          onChange={handleInputChange}
        />
        <TextField
          label="Program End Date (mm/dd/yyyy)"
          type="date"
          name="end_date"
          fullWidth
          InputLabelProps={{ shrink: true }}
          onChange={handleInputChange}
        />
        
        <TextField label="Description" name="description" fullWidth multiline rows={3} onChange={handleInputChange} />
      </Box>

      <Divider sx={{ marginY: '20px' }} />

      {/* Application Questions */}
      <Typography variant="h6" gutterBottom>
        Application Questions
      </Typography>

      {questions.map((q, index) => (
        <Box key={index} display="flex" alignItems="center" gap="8px" sx={{ marginBottom: '16px' }}>
          <TextField
            fullWidth
            label={`Question ${index + 1}`}
            value={q.text}
            onChange={(e) => handleQuestionChange(index, e.target.value)}
          />
          <IconButton onClick={() => removeQuestion(index)} disabled={questions.length <= 1}>
            <DeleteIcon />
          </IconButton>
        </Box>
      ))}

      <Button onClick={addQuestion} sx={{ marginTop: '10px' }}>Add Question</Button>

      {/* Actions */}
      <Box sx={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        <Button variant="contained" color="primary" onClick={handleCreateProgram}>
          Create Program
        </Button>
        <Button onClick={onClose}>Cancel</Button>
      </Box>
    </Paper>
  );
};

export default ProgramForm;
