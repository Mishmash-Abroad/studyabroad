import React from 'react';
import { styled } from '@mui/material/styles';
import { Box, Typography, Paper, Alert, AlertTitle } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import { differenceInDays } from 'date-fns';

const NoticeContainer = styled(Paper)(({ theme, isPastDeadline }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(4),
  backgroundColor: isPastDeadline 
    ? theme.palette.status.error.background 
    : theme.palette.status.warning.background,
  borderLeft: `6px solid ${isPastDeadline 
    ? theme.palette.status.error.main 
    : theme.palette.status.warning.main}`,
  borderRadius: theme.shape.borderRadii.medium,
}));

const StyledAlert = styled(Alert)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const DocumentCount = styled(Typography)(({ theme, isPastDeadline }) => ({
  fontWeight: 700,
  color: isPastDeadline 
    ? theme.palette.status.error.main 
    : theme.palette.status.warning.main,
}));

/**
 * Component to display a prominent notice about missing essential documents
 * and countdown to document deadline
 * 
 * @param {Object} props
 * @param {Date} props.documentDeadline - Deadline date for document submission
 * @param {Number} props.missingDocCount - Number of missing documents
 * @param {String} props.applicationStatus - Current status of the application
 */
const ElectronicFormNotice = ({ 
  documentDeadline, 
  missingDocCount,
  applicationStatus
}) => {
  // Don't show if there are no missing documents
  if (!missingDocCount || missingDocCount === 0) {
    return null;
  }
  
  // Only show for approved or enrolled status
  if (!['Approved', 'Enrolled'].includes(applicationStatus)) {
    return null;
  }

  const today = new Date();
  const deadline = new Date(documentDeadline);
  const daysUntilDeadline = differenceInDays(deadline, today);
  const isPastDeadline = daysUntilDeadline < 0;
  
  return (
    <NoticeContainer isPastDeadline={isPastDeadline}>
      <StyledAlert
        severity={isPastDeadline ? "error" : "warning"}
        icon={<WarningIcon fontSize="large" />}
      >
        <AlertTitle>
          {isPastDeadline 
            ? "Document Deadline Has Passed!" 
            : "Essential Documents Required!"}
        </AlertTitle>
        <Box sx={{ mt: 1, mb: 1 }}>
          <Typography variant="body1">
            {isPastDeadline 
              ? `You still have ${missingDocCount} essential document${missingDocCount > 1 ? 's' : ''} 
                 that ${missingDocCount > 1 ? 'are' : 'is'} required for your study abroad program.` 
              : `You have ${missingDocCount} essential document${missingDocCount > 1 ? 's' : ''} 
                 that need${missingDocCount === 1 ? 's' : ''} to be completed.`}
          </Typography>
          
          <DocumentCount variant="h6" isPastDeadline={isPastDeadline}>
            {isPastDeadline 
              ? `${Math.abs(daysUntilDeadline)} day${Math.abs(daysUntilDeadline) !== 1 ? 's' : ''} past deadline` 
              : `${daysUntilDeadline} day${daysUntilDeadline !== 1 ? 's' : ''} until deadline`}
          </DocumentCount>
          
          <Typography variant="body2" sx={{ mt: 1 }}>
            {isPastDeadline 
              ? "Please complete and submit your documents as soon as possible." 
              : "Please complete your documents before the deadline."}
          </Typography>
        </Box>
      </StyledAlert>
    </NoticeContainer>
  );
};

export default ElectronicFormNotice; 