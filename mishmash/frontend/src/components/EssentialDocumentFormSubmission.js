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
} from "@mui/material";
import axiosInstance from "../utils/axios";
import PDFUploadForm from "../components/PDFUploadForm";
import DocumentStatusDisplay from "../components/DocumentStatusDisplay";

// -------------------- COMPONENT LOGIC --------------------
const EssentialDocumentFormSubmission = ({ application_id, isReadOnly = false}) => {
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
          This could be because the document submission deadline has passed 
          or your current application status doesn't allow for document modification or submission.
        </Alert>
        <DocumentStatusDisplay 
          application_id={application_id} 
          isReadOnly={true}
        />
      </>
    );
  }

  const DocumentSection = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(4),
  }));

  const DocumentDescription = styled(Typography)(({ theme }) => ({
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(3),
    color: theme.palette.text.secondary,
  }));

  return (
    <>
      <DocumentSection>
        <PDFUploadForm
          pdf_name={"Acknowledgement of the code of conduct"}
          application_id={application_id}
          doc_type={"Acknowledgement of the code of conduct"}
          isReadOnly={isReadOnly}
        />
        <DocumentDescription>
          Acknowledgement of the code of conduct: A document reviewing the code of
          conduct, and attesting to student's understanding and commitment to
          abide by same. The student must sign this to participate.
        </DocumentDescription>
      </DocumentSection>

      <DocumentSection>
        <PDFUploadForm
          pdf_name={"Housing questionnaire"}
          application_id={application_id}
          doc_type={"Housing questionnaire"}
          isReadOnly={isReadOnly}
        />
        <DocumentDescription>
          Housing questionnaire: A set of questions about housing preferences to
          be reviewed by the faculty lead(s) to help with assigning housing. The
          student must fill this out.
        </DocumentDescription>
      </DocumentSection>

      <DocumentSection>
        <PDFUploadForm
          pdf_name={"Medical/health history and immunization records"}
          application_id={application_id}
          doc_type={"Medical/health history and immunization records"}
          isReadOnly={isReadOnly}
        />
        <DocumentDescription>
          Medical/health history and immunization records: A high-level summary of
          health status and attestation regarding immunizations. This document in
          particular is covered by HIPAA (definition 11). The student must fill
          out and sign this.
        </DocumentDescription>
      </DocumentSection>

      <DocumentSection>
        <PDFUploadForm
          pdf_name={"Assumption of risk form"}
          application_id={application_id}
          doc_type={"Assumption of risk form"}
          isReadOnly={isReadOnly}
        />
        <DocumentDescription>
          Assumption of risk form: A document waiving HCC's liability for student
          participation in the program. The student must sign this to participate.
        </DocumentDescription>
      </DocumentSection>
    </>
  );
};
export default EssentialDocumentFormSubmission;
