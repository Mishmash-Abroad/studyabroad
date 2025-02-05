import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  MenuItem,
  Button,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';

const ApplicantTable = ({ programId }) => {
  const navigate = useNavigate();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderBy, setOrderBy] = useState('applied_on');
  const [order, setOrder] = useState('desc');
  const [statusFilter, setStatusFilter] = useState('');
  const [userDetails, setUserDetails] = useState({});

  useEffect(() => {
    fetchApplicants();
  }, [programId, statusFilter]);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      let url = `/api/applications/?program=${programId}`;
      if (statusFilter) url += `&status=${statusFilter}`;

      const response = await axiosInstance.get(url);
      setApplicants(response.data);

      const userRequests = response.data.map(app =>
        axiosInstance.get(`/api/users/${app.student}`).then(res => ({ id: app.student, ...res.data }))
      );
      const userResponses = await Promise.all(userRequests);

      const userMap = {};
      userResponses.forEach(user => {
        userMap[user.id] = user;
      });
      setUserDetails(userMap);

      setError(null);
    } catch (err) {
      console.error('Error fetching applicants:', err);
      setError('Failed to load applicants.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleStatusChange = async (applicantId, newStatus) => {
    try {
      await axiosInstance.patch(`/api/applications/${applicantId}/`, { status: newStatus });
      fetchApplicants();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const sortedApplicants = applicants
    .filter(applicant => (statusFilter ? applicant.status === statusFilter : true))
    .sort((a, b) => {
      const valueA = a[orderBy];
      const valueB = b[orderBy];

      if (!valueA || !valueB) return 0;
      if (order === 'asc') return valueA < valueB ? -1 : 1;
      return valueA > valueB ? -1 : 1;
    });

  return (
    <Paper sx={{ padding: '20px', marginTop: '20px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <TextField
          select
          label="Filter by Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          variant="outlined"
          size="small"
          sx={{ minWidth: '200px' }} // 🔹 Wider dropdown for readability
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="Applied">Applied</MenuItem>
          <MenuItem value="Enrolled">Enrolled</MenuItem>
          <MenuItem value="Withdrawn">Withdrawn</MenuItem>
          <MenuItem value="Canceled">Canceled</MenuItem>
        </TextField>
      </Box>

      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {[
                { id: 'display_name', label: 'Display Name' },
                { id: 'username', label: 'Username' },
                { id: 'email', label: 'Email' },
                { id: 'date_of_birth', label: 'Date of Birth' },
                { id: 'gpa', label: 'GPA' },
                { id: 'major', label: 'Major' },
                { id: 'status', label: 'Status' },
                { id: 'applied_on', label: 'Applied On' },
                { id: 'actions', label: 'Actions' },
              ].map((column) => (
                <TableCell key={column.id}>
                  {column.id !== 'actions' ? (
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : 'asc'}
                      onClick={() => handleRequestSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedApplicants.map((applicant) => {
              const user = userDetails[applicant.student] || {};
              return (
                <TableRow key={applicant.id} hover>
                  <TableCell>{user.display_name || 'N/A'}</TableCell>
                  <TableCell>{user.username || 'N/A'}</TableCell>
                  <TableCell>{user.email || 'N/A'}</TableCell>
                  <TableCell>{applicant.date_of_birth}</TableCell>
                  <TableCell>{applicant.gpa}</TableCell>
                  <TableCell>{applicant.major}</TableCell>
                  <TableCell>{applicant.status}</TableCell>
                  <TableCell>{new Date(applicant.applied_on).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => navigate(`/applications/${applicant.id}`)}
                    >
                      View
                    </Button>
                    <TextField
                      select
                      size="small"
                      value={applicant.status}
                      onChange={(e) => handleStatusChange(applicant.id, e.target.value)}
                      sx={{ marginLeft: '10px', minWidth: '150px' }} // 🔹 Ensures all dropdowns are same width
                    >
                      {applicant.status === 'Withdrawn' && (
                        <MenuItem value="Withdrawn">Withdrawn</MenuItem>
                      )}
                      <MenuItem value="Applied">Applied</MenuItem>
                      <MenuItem value="Enrolled">Enrolled</MenuItem>
                      <MenuItem value="Canceled">Canceled</MenuItem>
                    </TextField>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      {loading && <p>Loading applicants...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </Paper>
  );
};

export default ApplicantTable;
