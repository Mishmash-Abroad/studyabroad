import React, { useState, useEffect } from "react";
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
  Snackbar,
} from "@mui/material";
import axiosInstance from "../utils/axios";
import PDFUploadForm from "../components/PDFUploadForm";

const templateUrls = {
  "Acknowledgement of the code of conduct": "/doc_templates/Code_of_Conduct.pdf",
  "Housing questionnaire": "/doc_templates/Housing_Questionnaire.pdf",
  "Medical/health history and immunization records": "/doc_templates/Medical_History_and_Immunizations.pdf",
  "Assumption of risk form": "/doc_templates/Assumption_of_Risk.pdf",
};

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

  const DocumentSection = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(4),
  }));

  const DocumentDescription = styled(Typography)(({ theme }) => ({
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(3),
    color: theme.palette.text.secondary,
  }));

  // Custom download button that checks if file exists before downloading
  const DownloadButton = ({ url, label }) => {
    const [error, setError] = useState(false);

    const handleClick = async (e) => {
      e.preventDefault();
      
      try {
        // Try to fetch the file first to check if it exists
        const response = await fetch(url, { method: 'HEAD' });
        if (response.ok) {
          // File exists, proceed with download
          window.open(url, '_blank');
        } else {
          setError(true);
        }
      } catch (err) {
        setError(true);
      }
    };

    return (
      <>
        <Button
          variant="outlined"
          color="primary"
          onClick={handleClick}
          sx={{ mb: 2 }}
        >
          {label}
        </Button>
        <Snackbar
          open={error}
          autoHideDuration={6000}
          onClose={() => setError(false)}
          message="Template file not found. Please contact an administrator."
        />
      </>
    );
  };

  return (
    <>
      <DocumentSection>
        <PDFUploadForm
          pdf_name={"Acknowledgement of the code of conduct"}
          application_id={application_id}
          doc_type={"Acknowledgement of the code of conduct"}
          // isReadOnly={isReadOnly} # Disabling while read only timelines are being worked out
        />
        <DownloadButton 
          url={templateUrls["Acknowledgement of the code of conduct"]}
          label="Download Blank Template"
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
          // isReadOnly={isReadOnly} # Disabling while read only timelines are being worked out
        />
        <DownloadButton 
          url={templateUrls["Housing questionnaire"]}
          label="Download Blank Template"
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
          // isReadOnly={isReadOnly} # Disabling while read only timelines are being worked out
        />
        <DownloadButton 
          url={templateUrls["Medical/health history and immunization records"]}
          label="Download Blank Template"
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
          // isReadOnly={isReadOnly} # Disabling while read only timelines are being worked out
        />
        <DownloadButton 
          url={templateUrls["Assumption of risk form"]}
          label="Download Blank Template"
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
