import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Box,
  TextField,
  MenuItem,
  Button,
} from '@mui/material';
import axiosInstance from '../utils/axios';
import ProgramForm from './ProgramForm';

// -------------------- STYLES --------------------
const TableWrapper = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius.large,
  boxShadow: theme.shadows.card,
  margin: '20px 0',
  maxHeight: 'calc(100vh - 300px)',
  overflow: 'auto',
}));

const FilterContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '10px',
  paddingBottom: '10px',
  paddingTop: '10px',
}));

// -------------------- COMPONENT --------------------
const AdminProgramsTable = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderBy, setOrderBy] = useState('application_deadline');
  const [order, setOrder] = useState('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState('current_future');
  const [isCreatingProgram, setIsCreatingProgram] = useState(false);
  const [isEditingProgram, setIsEditingProgram] = useState(false);
  const [editingProgramData, setEditingProgramData] = useState(null);

  useEffect(() => {
    if (!isCreatingProgram && !isEditingProgram) fetchPrograms();
  }, [timeFilter, isCreatingProgram, isEditingProgram]);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/programs/');
      setPrograms(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load programs.');
    } finally {
      setLoading(false);
    }
  };

  // Sorting function
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Open the form for editing a program
  const handleEditProgram = async (program) => {
    try {
      const questionsResponse = await axiosInstance.get(`/api/programs/${program.id}/questions/`);
      const questions = questionsResponse.data.map((q) => ({ id: q.id, text: q.text }));

      setEditingProgramData({ ...program, questions });
      setIsEditingProgram(true);
    } catch (error) {
      console.error('Error fetching program questions:', error);
    }
  };

  // Filtered and sorted programs
  const sortedPrograms = programs
    .filter((program) =>
      program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.faculty_leads.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => (order === 'asc' ? a[orderBy] > b[orderBy] : a[orderBy] < b[orderBy]) ? 1 : -1);

  return (
    <TableWrapper>
      {!isCreatingProgram && !isEditingProgram ? (
        <>
          <FilterContainer>
            <TextField label="Search" variant="outlined" size="small" fullWidth onChange={(e) => setSearchQuery(e.target.value)} />
            <TextField select label="Filter by Time" value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)} variant="outlined" size="small">
              <MenuItem value="current_future">Current & Future</MenuItem>
              <MenuItem value="open_for_applications">Open for Applications</MenuItem>
              <MenuItem value="in_review">In Review</MenuItem>
              <MenuItem value="running_now">Running Now</MenuItem>
              <MenuItem value="all">All Programs</MenuItem>
            </TextField>
            <Button variant="contained" color="primary" onClick={() => setIsCreatingProgram(true)}>New Program</Button>
          </FilterContainer>

          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {['title', 'year_semester', 'faculty_leads', 'application_deadline', 'start_date', 'end_date'].map((column) => (
                  <TableCell key={column}>
                    <TableSortLabel active={orderBy === column} direction={order} onClick={() => handleRequestSort(column)}>
                      {column.replace('_', ' ')}
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedPrograms.map((program) => (
                <TableRow key={program.id}>
                  <TableCell onClick={() => handleEditProgram(program)} style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}>
                    {program.title}
                  </TableCell>
                  <TableCell>{program.year_semester}</TableCell>
                  <TableCell>{program.faculty_leads}</TableCell>
                  <TableCell>{new Date(program.application_deadline).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(program.start_date).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(program.end_date).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      ) : (
        <ProgramForm
          onClose={() => {
            setIsCreatingProgram(false);
            setIsEditingProgram(false);
            setEditingProgramData(null);
          }}
          refreshPrograms={fetchPrograms}
          editingProgram={editingProgramData}
        />
      )}
    </TableWrapper>
  );
};

export default AdminProgramsTable;
