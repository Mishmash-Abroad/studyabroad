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
import {
  ALL_STATUSES,
  ALL_ADMIN_EDITABLE_STATUSES,
  STATUS,
  getStatusLabel
} from '../utils/constants';

const ApplicantTable = ({ programId }) => {
  const navigate = useNavigate();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderBy, setOrderBy] = useState('applied_on');
  const [order, setOrder] = useState('desc');
  const [statusFilter, setStatusFilter] = useState('');
  const [userDetails, setUserDetails] = useState({});
  const [documents, setDocuments] = useState({});
  const [confidentialNotes, setConfidentialNotes] = useState({});

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

      // Fetch user details, documents, and notes for each applicant
      const userRequests = response.data.map(app =>
        axiosInstance.get(`/api/users/${app.student}`).then(res => ({ id: app.student, ...res.data }))
      );
      const documentRequests = response.data.map(app =>
        axiosInstance.get(`/api/documents/?application=${app.id}`).then(res => ({ id: app.id, docs: res.data }))
      );
      const noteRequests = response.data.map(app =>
        axiosInstance.get(`/api/notes/?application=${app.id}`).then(res => ({ id: app.id, notes: res.data }))
      );

      const userResponses = await Promise.all(userRequests);
      const documentResponses = await Promise.all(documentRequests);
      const noteResponses = await Promise.all(noteRequests);

      // Map users
      const userMap = {};
      userResponses.forEach(user => {
        userMap[user.id] = user;
      });
      setUserDetails(userMap);

      // Map documents
      const documentMap = {};
      documentResponses.forEach(({ id, docs }) => {
        documentMap[id] = {
          risk: docs.some(doc => doc.document_type === 'Risk'),
          conduct: docs.some(doc => doc.document_type === 'Conduct'),
          housing: docs.some(doc => doc.document_type === 'Housing'),
          health: docs.some(doc => doc.document_type === 'Health'),
        };
      });
      setDocuments(documentMap);

      // Map confidential notes
      const noteMap = {};
      noteResponses.forEach(({ id, notes }) => {
        if (notes.length > 0) {
          const latestNote = notes.reduce((prev, current) =>
            new Date(prev.timestamp) > new Date(current.timestamp) ? prev : current
          );
          noteMap[id] = {
            count: notes.length,
            lastUpdated: new Date(latestNote.timestamp).toLocaleString(),
            lastAuthor: latestNote.author_display || "Deleted User"
          };
        } else {
          noteMap[id] = { count: 0, lastUpdated: 'N/A', lastAuthor: 'N/A' };
        }
      });
      setConfidentialNotes(noteMap);

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
          sx={{ minWidth: '200px' }}
        >
          <MenuItem value="">All</MenuItem>
          {Object.values(STATUS).map((status) => (
            <MenuItem key={status} value={status}>{getStatusLabel(status)}</MenuItem>
          ))}
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
                { id: 'risk', label: 'Risk Form' },
                { id: 'conduct', label: 'Conduct Form' },
                { id: 'housing', label: 'Housing Form' },
                { id: 'health', label: 'Health Form' },
                { id: 'num_notes', label: 'Confidential Notes' },
                { id: 'last_author', label: 'Last Note Author' },
                { id: 'last_updated', label: 'Last Note Updated' },
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
              const docs = documents[applicant.id] || {};
              const notes = confidentialNotes[applicant.id] || { count: 0, lastUpdated: 'N/A' };

              return (
                <TableRow key={applicant.id} hover>
                  <TableCell>{user.display_name || 'N/A'}</TableCell>
                  <TableCell>{user.username || 'N/A'}</TableCell>
                  <TableCell>{user.email || 'N/A'}</TableCell>
                  <TableCell>{applicant.date_of_birth}</TableCell>
                  <TableCell>{applicant.gpa}</TableCell>
                  <TableCell>{applicant.major}</TableCell>
                  <TableCell>{getStatusLabel(applicant.status)}</TableCell>
                  <TableCell>{new Date(applicant.applied_on).toLocaleDateString()}</TableCell>
                  <TableCell>{docs.risk ? "✔" : "✖"}</TableCell>
                  <TableCell>{docs.conduct ? "✔" : "✖"}</TableCell>
                  <TableCell>{docs.housing ? "✔" : "✖"}</TableCell>
                  <TableCell>{docs.health ? "✔" : "✖"}</TableCell>
                  <TableCell>{notes.count}</TableCell>
                  <TableCell>{notes.lastAuthor}</TableCell>
                  <TableCell>{notes.lastUpdated}</TableCell>
                  <TableCell>
                    <Button variant="contained" color="primary" onClick={() => navigate(`/applications/${applicant.id}`)}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default ApplicantTable;
