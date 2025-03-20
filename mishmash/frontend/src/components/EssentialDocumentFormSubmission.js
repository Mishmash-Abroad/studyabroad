import React, { useEffect, useState } from "react";
import { styled } from "@mui/material/styles";
import { useParams } from "react-router-dom";
import {
  TextField,
  Button,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  Alert,
  Link,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import axiosInstance from "../utils/axios";
import PDFUploadForm from "../components/PDFUploadForm";
import DocumentStatusDisplay from "../components/DocumentStatusDisplay";
import { DOCUMENTS } from "../utils/constants";

// -------------------- STYLED COMPONENTS --------------------
const DocumentSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

const DocumentDescription = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(3),
  color: theme.palette.text.secondary,
}));

const DocumentHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: theme.spacing(2),
}));

const DocumentTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 500,
}));

const TemplateLink = styled(Link)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(0.5),
  fontSize: "0.875rem",
  color: theme.palette.primary.main,
  cursor: "pointer",
  textDecoration: "none",
  "&:hover": {
    textDecoration: "underline",
  },
}));

// -------------------- HELPER FUNCTIONS --------------------
const handleDownloadTemplate = (path, filename) => {
  const link = document.createElement("a");
  link.href = path;
  link.setAttribute("download", filename);
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// -------------------- COMPONENT LOGIC --------------------
const EssentialDocumentFormSubmission = ({ application_id, isReadOnly = false, documents = [] }) => {
  // Show message if application hasn't been created yet
  if (!application_id) {
    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        Please submit your application first before uploading documents. 
        Once your application is submitted, you'll be able to upload the required documents here.
      </Alert>
    );
  }

  // Show message if document submission is read-only
  if (isReadOnly) {
    return (
      <>
        <Alert severity="info" sx={{ mb: 3 }}>
          Document submission is currently unavailable. 
          This is because your current application status doesn't allow for document modification or submission.
          You need to be approved or enrolled in the program to submit documents.
        </Alert>
        <DocumentStatusDisplay 
          application_id={application_id} 
          documents={documents}
          isReadOnly={true}
        />
      </>
    );
  }

  return (
    <>
      {/* Section for Code of Conduct document */}
      <DocumentSection>
        <DocumentHeader>
          <DocumentTitle variant="h6">
            {DOCUMENTS.CODE_OF_CONDUCT.name}
          </DocumentTitle>
          <TemplateLink 
            onClick={() => handleDownloadTemplate(DOCUMENTS.CODE_OF_CONDUCT.path, "Code_of_Conduct.pdf")}
          >
            <DownloadIcon fontSize="small" />
            Download Template
          </TemplateLink>
        </DocumentHeader>
        
        <PDFUploadForm
          pdf_name={DOCUMENTS.CODE_OF_CONDUCT.name}
          application_id={application_id}
          doc_type={DOCUMENTS.CODE_OF_CONDUCT.name}
          isReadOnly={isReadOnly}
        />
        <DocumentDescription>
          {DOCUMENTS.CODE_OF_CONDUCT.description}
        </DocumentDescription>
      </DocumentSection>

      {/* Section for Housing Questionnaire document */}
      <DocumentSection>
        <DocumentHeader>
          <DocumentTitle variant="h6">
            {DOCUMENTS.HOUSING_QUESTIONNAIRE.name}
          </DocumentTitle>
          <TemplateLink 
            onClick={() => handleDownloadTemplate(DOCUMENTS.HOUSING_QUESTIONNAIRE.path, "Housing_Questionnaire.pdf")}
          >
            <DownloadIcon fontSize="small" />
            Download Template
          </TemplateLink>
        </DocumentHeader>
        
        <PDFUploadForm
          pdf_name={DOCUMENTS.HOUSING_QUESTIONNAIRE.name}
          application_id={application_id}
          doc_type={DOCUMENTS.HOUSING_QUESTIONNAIRE.name}
          isReadOnly={isReadOnly}
        />
        <DocumentDescription>
          {DOCUMENTS.HOUSING_QUESTIONNAIRE.description}
        </DocumentDescription>
      </DocumentSection>

      {/* Section for Medical History document */}
      <DocumentSection>
        <DocumentHeader>
          <DocumentTitle variant="h6">
            {DOCUMENTS.MEDICAL_HISTORY.name}
          </DocumentTitle>
          <TemplateLink 
            onClick={() => handleDownloadTemplate(DOCUMENTS.MEDICAL_HISTORY.path, "Medical_History_and_Immunizations.pdf")}
          >
            <DownloadIcon fontSize="small" />
            Download Template
          </TemplateLink>
        </DocumentHeader>
        
        <PDFUploadForm
          pdf_name={DOCUMENTS.MEDICAL_HISTORY.name}
          application_id={application_id}
          doc_type={DOCUMENTS.MEDICAL_HISTORY.name}
          isReadOnly={isReadOnly}
        />
        <DocumentDescription>
          {DOCUMENTS.MEDICAL_HISTORY.description}
        </DocumentDescription>
      </DocumentSection>

      {/* Section for Assumption of Risk document */}
      <DocumentSection>
        <DocumentHeader>
          <DocumentTitle variant="h6">
            {DOCUMENTS.ASSUMPTION_OF_RISK.name}
          </DocumentTitle>
          <TemplateLink 
            onClick={() => handleDownloadTemplate(DOCUMENTS.ASSUMPTION_OF_RISK.path, "Assumption_of_Risk.pdf")}
          >
            <DownloadIcon fontSize="small" />
            Download Template
          </TemplateLink>
        </DocumentHeader>
        
        <PDFUploadForm
          pdf_name={DOCUMENTS.ASSUMPTION_OF_RISK.name}
          application_id={application_id}
          doc_type={DOCUMENTS.ASSUMPTION_OF_RISK.name}
          isReadOnly={isReadOnly}
        />
        <DocumentDescription>
          {DOCUMENTS.ASSUMPTION_OF_RISK.description}
        </DocumentDescription>
      </DocumentSection>
    </>
  );
};
export default EssentialDocumentFormSubmission;
