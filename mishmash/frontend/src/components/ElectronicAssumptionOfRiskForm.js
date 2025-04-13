import React, { useState, useRef } from 'react';
import { styled } from '@mui/material/styles';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import SignatureCanvas from 'react-signature-canvas';
import { jsPDF } from "jspdf";
import axiosInstance from '../utils/axios';

const FormContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  borderRadius: theme.shape.borderRadii.medium,
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(2),
  color: theme.palette.primary.main,
}));

const FormSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

const SignatureContainer = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.grey[300]}`,
  borderRadius: theme.shape.borderRadii.small,
  marginBottom: theme.spacing(2),
  padding: theme.spacing(1),
  backgroundColor: theme.palette.grey[50],
}));

const ButtonContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: theme.spacing(2),
  marginTop: theme.spacing(4),
}));

const PreviewContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '70vh',
  border: `1px solid ${theme.palette.grey[300]}`,
  borderRadius: theme.shape.borderRadii.small,
  overflow: 'hidden',
}));

/**
 * Electronic form for Assumption of Risk with signature capability
 * 
 * @param {Object} props
 * @param {Object} props.user - Current user data
 * @param {Object} props.application - Application data
 * @param {Function} props.onSubmit - Function called when form is submitted
 * @param {Object} props.program - Program data
 * @param {Function} props.onCancel - Function called when form is canceled
 */
const ElectronicAssumptionOfRiskForm = ({ 
  user, 
  application, 
  program, 
  onSubmit,
  onCancel 
}) => {
  // Form state
  const [formData, setFormData] = useState({
    studentName: user?.display_name || '',
    studentId: user?.username || '',
    dateOfBirth: application?.date_of_birth || '',
    assumeRisk: false,
    underAge: false,
    signatureDate: new Date().toISOString().split('T')[0]
  });
  
  // Signature pad refs
  const sigPadStudent = useRef(null);
  const sigPadGuardian = useRef(null);
  
  // UI state
  const [error, setError] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleFormChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const clearSignatures = () => {
    sigPadStudent.current.clear();
    if (formData.underAge && sigPadGuardian.current) {
      sigPadGuardian.current.clear();
    }
  };
  
  const validateForm = () => {
    if (!formData.studentName) {
      setError('Please enter your full name.');
      return false;
    }
    
    if (!formData.studentId) {
      setError('Please enter your student ID.');
      return false;
    }
    
    if (!formData.assumeRisk) {
      setError('You must acknowledge the assumption of risk.');
      return false;
    }
    
    if (sigPadStudent.current.isEmpty()) {
      setError('Please provide your signature.');
      return false;
    }
    
    if (formData.underAge && sigPadGuardian.current && sigPadGuardian.current.isEmpty()) {
      setError('Please provide parent/guardian signature.');
      return false;
    }
    
    return true;
  };
  
  const generatePDF = () => {
    const pdf = new jsPDF();
    
    // Add header
    pdf.setFontSize(16);
    pdf.text('Hypothetical City College Study Abroad Program', 105, 20, { align: 'center' });
    pdf.setFontSize(14);
    pdf.text('Assumption of Risk and Release of Liability Form', 105, 30, { align: 'center' });
    
    // Add student information
    pdf.setFontSize(12);
    pdf.text('Student Information:', 20, 45);
    pdf.text(`Full Name: ${formData.studentName}`, 30, 55);
    pdf.text(`Student ID (NetID): ${formData.studentId}`, 30, 65);
    pdf.text(`Date of Birth: ${new Date(formData.dateOfBirth).toLocaleDateString()}`, 30, 75);
    
    // Add assumption of risk text
    pdf.setFontSize(11);
    pdf.text('Acknowledgment of Risk', 20, 90);
    pdf.setFontSize(10);
    pdf.text('I, the undersigned, acknowledge that my participation in the Study Abroad Program at', 20, 100);
    pdf.text('Hypothetical City College involves certain inherent risks, including but not limited', 20, 107);
    pdf.text('to, travel-related risks, health and safety risks, accidents, injuries, or illnesses.', 20, 114);
    
    pdf.text('Assumption of Risk', 20, 130);
    pdf.text('By signing this form, I acknowledge that I am voluntarily participating in the Study', 20, 140);
    pdf.text('Abroad Program and assume full responsibility for any risks that may occur during my', 20, 147);
    pdf.text('participation.', 20, 154);

    pdf.text('Release of Liability', 20, 170);
    pdf.text('I hereby release Hypothetical City College, its officers, employees, agents, and', 20, 180);
    pdf.text('affiliates from any and all liability, claims, or demands that may arise out of or be', 20, 187);
    pdf.text('connected with my participation in the program.', 20, 194);
    
    // Add signatures
    pdf.text(`Student Signature:`, 20, 220);
    // Add the student signature image
    const studentSigData = sigPadStudent.current.toDataURL();
    pdf.addImage(studentSigData, 'PNG', 70, 210, 60, 20);
    pdf.text(`Date: ${new Date(formData.signatureDate).toLocaleDateString()}`, 150, 220);
    
    // Add parent/guardian signature if applicable
    if (formData.underAge && sigPadGuardian.current) {
      pdf.text(`Parent/Guardian Signature:`, 20, 240);
      const guardianSigData = sigPadGuardian.current.toDataURL();
      pdf.addImage(guardianSigData, 'PNG', 70, 230, 60, 20);
      pdf.text(`Date: ${new Date(formData.signatureDate).toLocaleDateString()}`, 150, 240);
    }
    
    return pdf;
  };
  
  const handlePreview = () => {
    if (!validateForm()) return;
    
    const pdf = generatePDF();
    const pdfUrl = pdf.output('dataurlstring');
    setPreviewUrl(pdfUrl);
    setPreviewOpen(true);
  };
  
  const handleClosePreview = () => {
    setPreviewOpen(false);
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const pdf = generatePDF();
      const pdfBlob = pdf.output('blob');
      
      // Create form data for upload
      const formDataToSubmit = new FormData();
      formDataToSubmit.append('title', 'Assumption of Risk Form');
      formDataToSubmit.append('pdf', pdfBlob, 'assumption_of_risk.pdf');
      formDataToSubmit.append('application', application.id);
      formDataToSubmit.append('type', 'Assumption of risk form');
      
      // Add the electronic form data as JSON
      const electronicData = {
        ...formData,
        studentSignature: sigPadStudent.current.toDataURL('image/svg+xml'),
        guardianSignature: formData.underAge && sigPadGuardian.current 
          ? sigPadGuardian.current.toDataURL('image/svg+xml') 
          : null
      };
      
      formDataToSubmit.append('form_data', JSON.stringify(electronicData));
      formDataToSubmit.append('is_electronic', 'true');
      
      // Submit the form
      const response = await axiosInstance.post('/api/documents/', formDataToSubmit, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Call the onSubmit callback with the result
      onSubmit(response.data);
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('Failed to submit the form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <FormContainer>
      <SectionTitle variant="h5">
        Assumption of Risk and Release of Liability Form
      </SectionTitle>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <FormSection>
        <Typography variant="h6" gutterBottom>
          Student Information
        </Typography>
        
        <TextField
          label="Full Name"
          name="studentName"
          value={formData.studentName}
          onChange={handleFormChange}
          fullWidth
          margin="normal"
          required
        />
        
        <TextField
          label="Student ID (NetID)"
          name="studentId"
          value={formData.studentId}
          onChange={handleFormChange}
          fullWidth
          margin="normal"
          required
        />
        
        <TextField
          label="Date of Birth"
          name="dateOfBirth"
          type="date"
          value={formData.dateOfBirth}
          onChange={handleFormChange}
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
          required
        />
      </FormSection>
      
      <FormSection>
        <Typography variant="h6" gutterBottom>
          Acknowledgment of Risk
        </Typography>
        
        <Typography variant="body1" paragraph>
          I, the undersigned, acknowledge that my participation in the Study Abroad Program at 
          Hypothetical City College involves certain inherent risks, including but not limited to, 
          travel-related risks, health and safety risks, accidents, injuries, or illnesses. I understand 
          that such risks may arise from various factors, including cultural differences, foreign medical 
          care systems, transportation, and natural or man-made disasters.
        </Typography>
        
        <Typography variant="h6" gutterBottom>
          Assumption of Risk
        </Typography>
        
        <Typography variant="body1" paragraph>
          By signing this form, I acknowledge that I am voluntarily participating in the Study Abroad 
          Program and assume full responsibility for any risks that may occur during my participation. 
          I understand and accept the potential for unforeseen risks and challenges and agree to take 
          all necessary precautions for my health, safety, and well-being during the program.
        </Typography>
        
        <Typography variant="h6" gutterBottom>
          Release of Liability
        </Typography>
        
        <Typography variant="body1" paragraph>
          In consideration of my participation in the Study Abroad Program, I, on behalf of myself, 
          my heirs, and legal representatives, hereby release Hypothetical City College, its officers, 
          employees, agents, and affiliates from any and all liability, claims, or demands that may 
          arise out of or be connected with my participation in the program, including but not limited 
          to personal injury, property damage, or loss.
        </Typography>
        
        <FormControlLabel
          control={
            <Checkbox
              name="assumeRisk"
              checked={formData.assumeRisk}
              onChange={handleFormChange}
              required
            />
          }
          label="I acknowledge that I have read and understood the Assumption of Risk and Release of Liability for the Study Abroad Program. I voluntarily assume all risks associated with participation in the program."
        />
      </FormSection>
      
      <FormSection>
        <Typography variant="h6" gutterBottom>
          Student Signature
        </Typography>
        
        <SignatureContainer>
          <SignatureCanvas
            ref={sigPadStudent}
            penColor="black"
            canvasProps={{
              width: 500,
              height: 200,
              className: "signature-canvas",
              style: { width: "100%", height: "100%" }
            }}
          />
        </SignatureContainer>
        
        <TextField
          label="Date"
          name="signatureDate"
          type="date"
          value={formData.signatureDate}
          onChange={handleFormChange}
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
          required
        />
        
        <FormControlLabel
          control={
            <Checkbox
              name="underAge"
              checked={formData.underAge}
              onChange={handleFormChange}
            />
          }
          label="I am under 18 years of age and require parent/guardian signature"
        />
      </FormSection>
      
      {formData.underAge && (
        <FormSection>
          <Typography variant="h6" gutterBottom>
            Parent/Guardian Signature
          </Typography>
          
          <SignatureContainer>
            <SignatureCanvas
              ref={sigPadGuardian}
              penColor="black"
              canvasProps={{
                width: 500,
                height: 200,
                className: "signature-canvas",
                style: { width: "100%", height: "100%" }
              }}
            />
          </SignatureContainer>
        </FormSection>
      )}
      
      <ButtonContainer>
        <Button 
          variant="outlined" 
          onClick={clearSignatures}
        >
          Clear Signatures
        </Button>
        
        <Button 
          variant="outlined" 
          onClick={onCancel}
        >
          Cancel
        </Button>
        
        <Button 
          variant="outlined" 
          onClick={handlePreview}
        >
          Preview PDF
        </Button>
        
        <Button 
          variant="contained" 
          color="primary"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Form"}
        </Button>
      </ButtonContainer>
      
      {/* PDF Preview Dialog */}
      <Dialog 
        open={previewOpen} 
        onClose={handleClosePreview}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Preview Form PDF</DialogTitle>
        <DialogContent>
          <PreviewContainer>
            <iframe
              src={previewUrl}
              title="PDF Preview"
              width="100%"
              height="100%"
              style={{ border: 'none' }}
            />
          </PreviewContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePreview} color="primary">
            Close
          </Button>
          <Button onClick={handleSubmit} color="primary" variant="contained">
            Submit Form
          </Button>
        </DialogActions>
      </Dialog>
    </FormContainer>
  );
};

export default ElectronicAssumptionOfRiskForm; 