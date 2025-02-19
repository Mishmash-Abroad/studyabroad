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
} from "@mui/material";
import axiosInstance from "../utils/axios";
import PDFUploadForm from "../components/PDFUploadForm";

// -------------------- COMPONENT LOGIC --------------------
const EssentialDocumentFormSubmission = ({ user_id, program_id }) => {
  return (
    <>
      <PDFUploadForm
        pdf_name={"Code of Conduct Form"}
        user_id={user_id}
        program_id={program_id}
        doc_type={"code_of_conduct"}
      />
      <Typography>
        Acknowledgement of the code of conduct: A document reviewing the code of
        conduct, and attesting to student's understanding and commitment to
        abide by same. The student must sign this to participate.
      </Typography>

      <PDFUploadForm
        pdf_name={"Housing Form"}
        user_id={user_id}
        program_id={program_id}
        doc_type={"housing"}
      />

      <Typography>
        Housing questionnaire: A set of questions about housing preferences to
        be reviewed by the faculty lead(s) to help with assigning housing. The
        student must fill this out.
      </Typography>

      <PDFUploadForm
        pdf_name={"Medical Form"}
        user_id={user_id}
        program_id={program_id}
        doc_type={"medical_history"}
      />

      <Typography>
        Medical/health history and immunization records: A high-level summary of
        health status and attestation regarding immunizations. This document in
        particular is covered by HIPAA (definition 11). The student must fill
        out and sign this.
      </Typography>

      <PDFUploadForm
        pdf_name={"Assumption of Risk Form"}
        user_id={user_id}
        program_id={program_id}
        doc_type={"assumption_of_risk"}
      />

      <Typography>
        Assumption of risk form: A document waiving HCC's liability for student
        participation in the program. The student must sign this to participate.
      </Typography>
    </>
  );
};
export default EssentialDocumentFormSubmission;
