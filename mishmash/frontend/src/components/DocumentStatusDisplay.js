import React from 'react';
import { styled } from "@mui/material/styles";
import { Box, Typography, Tooltip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

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
    type: "Assumption of risk form",
    description: "A document waiving liability for student participation"
  },
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
  }
];

const DocumentStatusDisplay = ({ documents, programId }) => {
  const getDocumentStatus = (type) => {
    return documents?.some(doc => 
      doc.type === type && 
      doc.program === programId
    ) ? 'submitted' : 'missing';
  };

  return (
    <DocumentContainer>
      <Typography variant="subtitle2" gutterBottom>
        Required Documents Status
      </Typography>
      {REQUIRED_DOCUMENTS.map(({ type, description }) => {
        const status = getDocumentStatus(type);
        return (
          <Tooltip key={type} title={description} placement="left">
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

export default DocumentStatusDisplay;
