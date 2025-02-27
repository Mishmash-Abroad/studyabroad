import React from 'react';
import { styled } from "@mui/material/styles";
import { Box, Typography, Tooltip, CircularProgress } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import PropTypes from 'prop-types';

const DocumentContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  padding: '16px',
}));

const DocumentRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
}));

const DocumentName = styled(Typography)(({ theme }) => ({
  flex: 1,
  fontSize: theme.typography.body2.fontSize,
}));

const StatusIcon = styled(Box)(({ theme, status }) => ({
  display: 'flex',
  alignItems: 'center',
  '& .MuiSvgIcon-root': {
    color: status === 'submitted' 
      ? theme.palette.success.main 
      : theme.palette.error.main,
  }
}));

const REQUIRED_DOCUMENTS = [

  {
    type: "Acknowledgement of the code of conduct",
    description: "Attestation to understanding and commitment to the code of conduct"
  },
  {
    type: "Housing questionnaire",
    description: "Housing preferences questionnaire"
  },
  {
    type: "Medical/health history and immunization records",
    description: "Health status and immunization records (HIPAA protected)"
  },
  {
    type: "Assumption of risk form",
    description: "A document waiving liability for student participation"
  }
];

const DocumentStatusDisplay = ({ 
  documents = [], 
  application_id, 
  isLoading = false, 
  error = null 
}) => {
  // Handle loading state
  if (isLoading) {
    return (
      <DocumentContainer>
        <Typography variant="subtitle2" gutterBottom>
          Loading Document Status...
        </Typography>
        <Box display="flex" justifyContent="center" p={2}>
          <CircularProgress size={24} />
        </Box>
      </DocumentContainer>
    );
  }

  // Handle error state
  if (error) {
    return (
      <DocumentContainer>
        <Typography variant="subtitle2" color="error" gutterBottom>
          Error Loading Documents
        </Typography>
        <Typography variant="body2" color="error">
          {error}
        </Typography>
      </DocumentContainer>
    );
  }

  const getDocumentStatus = (type) => {
    // Handle case where documents is undefined/null
    if (!documents) {
      return 'missing';
    }

    return documents.some(doc => 
      doc.type === type && 
      doc.application === application_id
    ) ? 'submitted' : 'missing';
  };

  const getStatusTooltip = (status) => {
    return status === 'submitted' 
      ? 'Document has been successfully uploaded'
      : 'Document needs to be uploaded';
  };

  return (
    <DocumentContainer>
      <Typography variant="subtitle2" gutterBottom>
        Required Documents Status
      </Typography>
      {REQUIRED_DOCUMENTS.map(({ type, description }) => {
        const status = getDocumentStatus(type);
        return (
          <Tooltip 
            key={type} 
            title={
              <div>
                <div>{description}</div>
                <div>{getStatusTooltip(status)}</div>
              </div>
            } 
            placement="left"
          >
            <DocumentRow>
              <DocumentName>{type}</DocumentName>
              <StatusIcon status={status}>
                {status === 'submitted' ? (
                  <CheckCircleIcon fontSize="small" />
                ) : (
                  <ErrorIcon fontSize="small" />
                )}
              </StatusIcon>
            </DocumentRow>
          </Tooltip>
        );
      })}
    </DocumentContainer>
  );
};

DocumentStatusDisplay.propTypes = {
  documents: PropTypes.arrayOf(PropTypes.shape({
    type: PropTypes.string.isRequired,
    application: PropTypes.number.isRequired,
  })),
  application_id: PropTypes.number.isRequired,
  isLoading: PropTypes.bool,
  error: PropTypes.string,
};

export default DocumentStatusDisplay;
