import React, { useState, useEffect } from "react";
import { Box, Typography, Button, Alert, Paper, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSearchParams, useParams } from "react-router-dom";
import axios from "axios";

// Create a custom axios instance that doesn't auto-attach auth tokens
// because the writer doesn't have an account.
const publicAxios = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "/",
  headers: {
    "Content-Type": "application/json",
  },
});

const Container = styled(Paper)(({ theme }) => ({
  maxWidth: 600,
  margin: "40px auto",
  padding: theme.spacing(3),
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
}));

const FileInputContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

/**
 * Public page that a letter writer uses to upload their PDF
 * - We read :id from the URL and token from query params
 * - Call /api/letters/{id}/public_info/?token=??? to check validity
 * - If valid, show a file input to do POST /api/letters/{id}/fulfill_letter/?token=???
 */
const LetterUploadPage = () => {
  const [searchParams] = useSearchParams();
  const { id } = useParams(); // route param
  const token = searchParams.get("token");
  const [status, setStatus] = useState("loading"); // "loading" | "valid" | "invalid" | "uploaded"
  const [error, setError] = useState("");
  const [studentName, setStudentName] = useState("");
  const [programTitle, setProgramTitle] = useState("");
  const [isFulfilled, setIsFulfilled] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!id || !token) {
      setStatus("invalid");
      setError("Missing ID or token in URL");
      return;
    }
    fetchPublicInfo();
    // eslint-disable-next-line
  }, [id, token]);

  const fetchPublicInfo = async () => {
    try {
      setStatus("loading");
      const res = await publicAxios.get(`/api/letters/${id}/public_info/`, {
        params: { token },
      });
      if (res.data.status === "valid") {
        setStudentName(res.data.student_name);
        setProgramTitle(res.data.program_title);
        setIsFulfilled(res.data.is_fulfilled);
        setStatus("valid");
      } else {
        setStatus("invalid");
        setError("This letter request is no longer valid.");
      }
    } catch (err) {
      console.error("Error checking letter request:", err);
      setError(err.response?.data?.detail || "Request not valid or has been canceled.");
      setStatus("invalid");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      setError("");
    } else {
      setPdfFile(null);
      setError("Only PDF files are accepted.");
    }
  };

  const handleUpload = async () => {
    if (!pdfFile) {
      setError("Please select a PDF file first.");
      return;
    }
    
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("pdf", pdfFile);

      const res = await publicAxios.post(
        `/api/letters/${id}/fulfill_letter/?token=${token}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      
      if (res.status === 200 || res.status === 201) {
        setStatus("uploaded");
      }
    } catch (err) {
      console.error("Error uploading letter:", err);
      setError(err.response?.data?.detail || "Could not upload letter. Please try again later.");
    } finally {
      setUploading(false);
    }
  };

  if (status === "loading") {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" padding={4}>
          <CircularProgress />
        </Box>
        <Typography align="center">Checking your link...</Typography>
      </Container>
    );
  }

  if (status === "invalid") {
    return (
      <Container>
        <Typography variant="h5" gutterBottom>
          This request link is invalid or has been canceled.
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
      </Container>
    );
  }

  if (status === "uploaded") {
    return (
      <Container>
        <Typography variant="h5" gutterBottom>
          Thank you! Your letter has been submitted.
        </Typography>
        <Typography variant="body1">
          We appreciate your prompt response. Your recommendation letter for {studentName} 
          has been successfully uploaded. You may now close this page.
        </Typography>
      </Container>
    );
  }

  // status === "valid"
  return (
    <Container>
      <Typography variant="h5" gutterBottom>
        Recommendation Letter for {studentName}
      </Typography>
      <Typography variant="body1" paragraph>
        Program: <strong>{programTitle}</strong>
      </Typography>

      {isFulfilled && (
        <Alert severity="info" sx={{ mb: 2 }}>
          A letter has already been submitted for this request. 
          Uploading another will replace the existing letter.
        </Alert>
      )}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Typography>
        Please upload your letter of recommendation in PDF format.
      </Typography>

      <FileInputContainer>
        <input 
          type="file" 
          accept="application/pdf" 
          onChange={handleFileChange} 
          disabled={uploading}
        />
        <Button 
          variant="contained" 
          onClick={handleUpload} 
          disabled={!pdfFile || uploading}
          sx={{ alignSelf: "flex-start" }}
        >
          {uploading ? "Uploading..." : "Upload Letter"}
        </Button>
      </FileInputContainer>
      
      {uploading && (
        <Box display="flex" justifyContent="center" padding={2}>
          <CircularProgress size={24} />
        </Box>
      )}
    </Container>
  );
};

export default LetterUploadPage;
