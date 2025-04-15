import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  Chip,
  Stack,
} from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import { differenceInDays } from 'date-fns';
import axiosInstance from '../utils/axios';
import { DOCUMENTS } from '../utils/constants';
import ElectronicFormNotice from './ElectronicFormNotice';
import ElectronicCodeOfConductForm from './ElectronicCodeOfConductForm';
import ElectronicAssumptionOfRiskForm from './ElectronicAssumptionOfRiskForm';
import ElectronicHousingQuestionnaireForm from './ElectronicHousingQuestionnaireForm';
import ElectronicMedicalHistoryForm from './ElectronicMedicalHistoryForm';
import PDFUploadForm from './PDFUploadForm';

const PageContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
}));

const DocumentCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.shape.borderRadii.medium,
  position: 'relative',
  overflow: 'hidden',
}));

const DocumentHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(2),
}));

const DocumentTitle = styled(Typography)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  fontWeight: 500,
}));

const DocumentStatus = styled(Box)(({ theme, completed }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  color: completed ? theme.palette.success.main : theme.palette.warning.main,
}));

const CompletedBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  right: 0,
  backgroundColor: theme.palette.success.main,
  color: 'white',
  padding: `${theme.spacing(0.5)} ${theme.spacing(1.5)}`,
  transform: 'rotate(45deg) translateX(20px) translateY(-10px)',
  transformOrigin: 'top right',
  width: '150px',
  textAlign: 'center',
  boxShadow: theme.customShadows.card,
  zIndex: 1,
}));

/**
 * Component that manages electronic document submission, including showing notices,
 * tracking deadlines, and allowing users to choose which form to complete.
 * 
 * @param {Object} props
 * @param {Object} props.user - Current user data
 * @param {Object} props.application - Application data
 * @param {Object} props.program - Program data
 * @param {Boolean} props.isReadOnly - Whether the document submission is read-only
 */
const ElectronicDocumentHub = ({
  user,
  application,
  program,
  isReadOnly = false,
}) => {
  // State to track documents, active document and form view
  const [documents, setDocuments] = useState([]);
  const [activeForm, setActiveForm] = useState(null);
  const [formType, setFormType] = useState(null); // 'electronic' or 'upload'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Load existing documents
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!application?.id) return;
      
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/api/documents/?application=${application.id}`);
        setDocuments(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching documents:', err);
        setError('Failed to load existing documents.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDocuments();
  }, [application]);
  
  // Define document types and their forms
  const documentTypes = [
    { 
      id: 'code_of_conduct',
      title: DOCUMENTS.CODE_OF_CONDUCT.name,
      description: DOCUMENTS.CODE_OF_CONDUCT.description,
      templatePath: DOCUMENTS.CODE_OF_CONDUCT.path,
    },
    { 
      id: 'assumption_of_risk',
      title: DOCUMENTS.ASSUMPTION_OF_RISK.name,
      description: DOCUMENTS.ASSUMPTION_OF_RISK.description,
      templatePath: DOCUMENTS.ASSUMPTION_OF_RISK.path,
    },
    { 
      id: 'housing_questionnaire',
      title: DOCUMENTS.HOUSING_QUESTIONNAIRE.name,
      description: DOCUMENTS.HOUSING_QUESTIONNAIRE.description,
      templatePath: DOCUMENTS.HOUSING_QUESTIONNAIRE.path,
    },
    { 
      id: 'medical_history',
      title: DOCUMENTS.MEDICAL_HISTORY.name,
      description: DOCUMENTS.MEDICAL_HISTORY.description,
      templatePath: DOCUMENTS.MEDICAL_HISTORY.path,
    },
  ];
  
  // Get missing documents count for the notice
  const missingDocCount = documentTypes.length - documents.length;
  
  // Check if document is completed
  const isDocumentCompleted = (docType) => {
    return documents.some(doc => doc.type === docType);
  };
  
  // Handle selecting a document to complete
  const handleSelectDocument = (docId) => {
    const selectedDocType = documentTypes.find(doc => doc.id === docId);
    if (!selectedDocType) return;
    
    setActiveForm(selectedDocType);
    setFormType('electronic'); // Automatically set to electronic form
  };
  
  // Handle form type selection
  const handleFormTypeSelect = (type) => {
    setFormType(type);
  };
  
  // Handle form submission
  const handleFormSubmit = async (data) => {
    try {
      // Refresh documents list
      const response = await axiosInstance.get(`/api/documents/?application=${application.id}`);
      setDocuments(response.data);
      
      // Reset form view
      setActiveForm(null);
      setFormType(null);
    } catch (err) {
      console.error('Error refreshing documents:', err);
      setError('Your form was submitted, but we could not refresh the document list.');
    }
  };
  
  // Handle form cancellation
  const handleFormCancel = () => {
    setActiveForm(null);
    setFormType(null);
  };
  
  // Get the form component based on document type and form type
  const getFormComponent = () => {
    if (!activeForm) return null;
    
    if (formType === 'electronic') {
      // Return the appropriate electronic form component based on document type
      if (activeForm.id === 'code_of_conduct') {
        return (
          <>
            <ElectronicCodeOfConductForm 
              user={user}
              application={application}
              program={program}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
            />
          </>
        );
      }
      
      if (activeForm.id === 'assumption_of_risk') {
        return (
          <>
            <ElectronicAssumptionOfRiskForm 
              user={user}
              application={application}
              program={program}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
            />
          </>
        );
      }
      
      if (activeForm.id === 'housing_questionnaire') {
        return (
          <>
            <ElectronicHousingQuestionnaireForm 
              user={user}
              application={application}
              program={program}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
            />
          </>
        );
      }
      
      if (activeForm.id === 'medical_history') {
        return (
          <>
            <ElectronicMedicalHistoryForm 
              user={user}
              application={application}
              program={program}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
            />
          </>
        );
      }
      
      return (
        <Alert severity="info">
          Electronic form for {activeForm.title} is coming soon. Please use the PDF upload option for now.
        </Alert>
      );
    }
    
    if (formType === 'upload') {
      return (
        <Box>
          <Typography variant="h6" gutterBottom>
            Upload {activeForm.title}
          </Typography>
          <PDFUploadForm
            doc_type={activeForm.title}
            application_id={application.id}
            isReadOnly={isReadOnly}
          />
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Button 
              onClick={() => setFormType('electronic')}
              variant="text"
            >
              Return to Electronic Form
            </Button>
            <Button onClick={handleFormCancel} variant="outlined">
              Back to Documents
            </Button>
          </Box>
        </Box>
      );
    }
    
    return null;
  };
  
  // If application is not created yet
  if (!application?.id) {
    return (
      <Alert severity="info">
        Please submit your application first before accessing the essential documents.
      </Alert>
    );
  }
  
  // If document submission is read-only
  if (isReadOnly) {
    return (
      <Alert severity="info">
        Document submission is currently not available. 
        This may be because your application status doesn't allow document submission at this time.
      </Alert>
    );
  }
  
  // Helper function to find document by type
  const findDocumentByType = (docType) => {
    return documents.find(doc => doc.type === docType);
  };
  
  // Format date helper
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  return (
    <PageContainer>
      {/* Notice about missing documents and deadline */}
      <ElectronicFormNotice 
        documentDeadline={program.essential_document_deadline}
        missingDocCount={missingDocCount}
        applicationStatus={application.status}
      />
      
      {/* Error alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Document list */}
      {!activeForm && (
        <Box>
          <Typography variant="h5" gutterBottom>
            Essential Documents
          </Typography>
          <Typography variant="body1" paragraph>
            Please complete the following required documents for your study abroad program. 
            You can either fill out the electronic forms online or download, complete, and upload PDF versions.
          </Typography>
          
          {/* List of documents */}
          {documentTypes.map((doc) => {
            const isCompleted = isDocumentCompleted(doc.title);
            const submittedDoc = findDocumentByType(doc.title);
            
            return (
              <DocumentCard key={doc.id} sx={{ position: 'relative' }}>
                {isCompleted && (
                  <CompletedBadge>
                    <Typography variant="caption" sx={{ fontWeight: 500 }}>
                      COMPLETED
                    </Typography>
                  </CompletedBadge>
                )}
                
                <DocumentHeader>
                  <DocumentTitle variant="h6">
                    <ArticleIcon fontSize="small" />
                    {doc.title}
                  </DocumentTitle>
                  
                  <DocumentStatus completed={isCompleted}>
                    {isCompleted ? (
                      <>
                        <CheckCircleIcon fontSize="small" />
                        <Typography variant="body2">Submitted</Typography>
                      </>
                    ) : (
                      <>
                        <WarningIcon fontSize="small" />
                        <Typography variant="body2">Required</Typography>
                      </>
                    )}
                  </DocumentStatus>
                </DocumentHeader>
                
                <Typography variant="body2" paragraph>
                  {doc.description}
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Button
                    variant={isCompleted ? "outlined" : "contained"}
                    color={isCompleted ? "secondary" : "primary"}
                    onClick={() => handleSelectDocument(doc.id)}
                  >
                    {isCompleted ? "View or Replace" : "Complete Document"}
                  </Button>
                  
                  {isCompleted && submittedDoc && (
                    <Typography variant="body2" color="text.secondary">
                      Last submitted: {formatDate(submittedDoc.uploaded_at)}
                    </Typography>
                  )}
                </Box>
              </DocumentCard>
            );
          })}
        </Box>
      )}
      
      {/* Form component */}
      {activeForm && formType && getFormComponent()}
    </PageContainer>
  );
};

export default ElectronicDocumentHub; 