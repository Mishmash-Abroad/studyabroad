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
 * Electronic form for Code of Conduct with signature capability
 * 
 * @param {Object} props
 * @param {Object} props.user - Current user data
 * @param {Object} props.application - Application data
 * @param {Function} props.onSubmit - Function called when form is submitted
 * @param {Object} props.program - Program data
 * @param {Function} props.onCancel - Function called when form is canceled
 */
const ElectronicCodeOfConductForm = ({ 
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
    agreed: false,
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
    
    if (!formData.agreed) {
      setError('You must agree to the Code of Conduct.');
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
    pdf.text('Acknowledgment of the Code of Conduct', 105, 30, { align: 'center' });
    
    // Add student information
    pdf.setFontSize(12);
    pdf.text('Student Information:', 20, 45);
    pdf.text(`Full Name: ${formData.studentName}`, 30, 55);
    pdf.text(`Student ID (NetID): ${formData.studentId}`, 30, 65);
    pdf.text(`Date of Birth: ${new Date(formData.dateOfBirth).toLocaleDateString()}`, 30, 75);
    
    // Add code of conduct text - abbreviated for the example
    pdf.setFontSize(11);
    pdf.text('Introduction', 20, 90);
    pdf.setFontSize(10);
    pdf.text('As a participant in the Hypothetical City College Study Abroad Program, you are', 20, 100);
    pdf.text('representing not only yourself but also your college, your community, and your country.', 20, 107);
    pdf.text('Therefore, it is essential to uphold the values and principles outlined in the Code of', 20, 114);
    pdf.text('Conduct to ensure a safe, respectful, and enriching experience for all participants.', 20, 121);
    
    // Code of conduct items (abbreviated)
    pdf.setFontSize(11);
    pdf.text('Code of Conduct for Study Abroad Participants', 20, 135);
    pdf.setFontSize(10);
    pdf.text('1. Respect for Local Laws and Customs', 25, 145);
    pdf.text('2. Respect for Others', 25, 155);
    pdf.text('3. Academic Integrity', 25, 165);
    pdf.text('4. Responsible Use of Alcohol and Drugs', 25, 175);
    pdf.text('5. Health and Safety', 25, 185);
    
    // Add acknowledgment
    pdf.setFontSize(11);
    pdf.text('Acknowledgment', 20, 200);
    pdf.setFontSize(10);
    pdf.text('By signing below, I acknowledge that I have read and understood the Code of Conduct', 20, 210);
    pdf.text('for the Hypothetical City College Study Abroad Program. I agree to follow the guidelines', 20, 217);
    pdf.text('outlined above, and I understand that failure to do so may result in disciplinary action.', 20, 224);
    
    // Add signatures
    pdf.text(`Student Signature:`, 20, 240);
    // Add the student signature image
    const studentSigData = sigPadStudent.current.toDataURL();
    pdf.addImage(studentSigData, 'PNG', 70, 230, 60, 20);
    pdf.text(`Date: ${new Date(formData.signatureDate).toLocaleDateString()}`, 150, 240);
    
    // Add parent/guardian signature if applicable
    if (formData.underAge && sigPadGuardian.current) {
      pdf.text(`Parent/Guardian Signature:`, 20, 260);
      const guardianSigData = sigPadGuardian.current.toDataURL();
      pdf.addImage(guardianSigData, 'PNG', 70, 250, 60, 20);
      pdf.text(`Date: ${new Date(formData.signatureDate).toLocaleDateString()}`, 150, 260);
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
      formDataToSubmit.append('title', 'Code of Conduct Form');
      formDataToSubmit.append('pdf', pdfBlob, 'code_of_conduct.pdf');
      formDataToSubmit.append('application', application.id);
      formDataToSubmit.append('type', 'Acknowledgement of the code of conduct');
      
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
        Code of Conduct Acknowledgment Form
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
          Code of Conduct Summary
        </Typography>
        
        <Typography variant="body1" paragraph>
          As a participant in the Hypothetical City College Study Abroad Program, you are
          representing not only yourself but also your college, your community, and your country.
          Therefore, it is essential to uphold the values and principles outlined in the Code of
          Conduct to ensure a safe, respectful, and enriching experience for all participants.
        </Typography>
        
        <Typography variant="body2" paragraph>
          The Code of Conduct includes important guidelines regarding:
          <ul>
            <li>Respect for local laws and customs</li>
            <li>Respect for others and prevention of discrimination or harassment</li>
            <li>Academic integrity</li>
            <li>Responsible use of alcohol and drugs</li>
            <li>Health and safety practices</li>
            <li>Behavioral expectations</li>
            <li>Communication and participation</li>
            <li>Environmental responsibility</li>
            <li>Responsible use of technology</li>
            <li>Emergency protocols</li>
          </ul>
        </Typography>
        
        <FormControlLabel
          control={
            <Checkbox
              name="agreed"
              checked={formData.agreed}
              onChange={handleFormChange}
              required
            />
          }
          label="I acknowledge that I have read and understood the Code of Conduct for the Study Abroad Program. I agree to follow the guidelines outlined above."
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

export default ElectronicCodeOfConductForm; 