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
import VisibilityIcon from '@mui/icons-material/Visibility';

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
  const [selectedDocUrl, setSelectedDocUrl] = useState(null);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  
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
    const pageHeight = pdf.internal.pageSize.height;
    const margin = 20;
    let yPos = 20;
    const lineHeight = 7;
    
    // Function to check if we need a new page
    const checkPageBreak = () => {
      if (yPos > pageHeight - margin) {
        pdf.addPage();
        yPos = 20;
      }
    };
    
    // Add header
    pdf.setFontSize(16);
    pdf.text('Hypothetical City College Study Abroad Program', 105, yPos, { align: 'center' });
    yPos += 10;
    pdf.setFontSize(14);
    pdf.text('Acknowledgment of the Code of Conduct', 105, yPos, { align: 'center' });
    yPos += 15;
    
    // Add student information
    pdf.setFontSize(12);
    pdf.text('Student Information:', 20, yPos);
    yPos += 10;
    pdf.text(`Full Name: ${formData.studentName}`, 30, yPos); yPos += lineHeight;
    pdf.text(`Student ID (NetID): ${formData.studentId}`, 30, yPos); yPos += lineHeight;
    pdf.text(`Date of Birth: ${new Date(formData.dateOfBirth).toLocaleDateString()}`, 30, yPos);
    yPos += 15;
    
    // Add introduction text
    checkPageBreak();
    pdf.setFontSize(11);
    pdf.text('Introduction', 20, yPos);
    yPos += 10;
    pdf.setFontSize(10);
    pdf.text('As a participant in the Hypothetical City College Study Abroad Program, you are', 20, yPos); yPos += lineHeight;
    pdf.text('representing not only yourself but also your college, your community, and your country.', 20, yPos); yPos += lineHeight;
    pdf.text('Therefore, it is essential to uphold the values and principles outlined in the Code of', 20, yPos); yPos += lineHeight;
    pdf.text('Conduct to ensure a safe, respectful, and enriching experience for all participants.', 20, yPos); yPos += lineHeight;
    pdf.text('By signing this document, you acknowledge that you have read, understood, and agree to', 20, yPos); yPos += lineHeight;
    pdf.text('abide by the following Code of Conduct during your participation in the Study Abroad Program.', 20, yPos); yPos += lineHeight;
    pdf.text('Violations of the Code of Conduct may result in disciplinary action, including but not limited', 20, yPos); yPos += lineHeight;
    pdf.text('to removal from the program.', 20, yPos);
    yPos += 14;
    
    // Code of conduct items
    checkPageBreak();
    pdf.setFontSize(11);
    pdf.text('Code of Conduct for Study Abroad Participants', 20, yPos);
    yPos += 10;
    
    // 1. Respect for Local Laws and Customs
    pdf.setFontSize(10);
    pdf.text('1. Respect for Local Laws and Customs', 20, yPos); yPos += lineHeight;
    checkPageBreak();
    pdf.text('Participants are expected to respect and abide by the laws, regulations, and cultural norms', 25, yPos); yPos += lineHeight;
    pdf.text('of the host country. This includes, but is not limited to, respecting local dress codes,', 25, yPos); yPos += lineHeight;
    pdf.text('religious practices, and social customs.', 25, yPos); yPos += lineHeight + 3;
    
    // 2. Respect for Others
    checkPageBreak();
    pdf.text('2. Respect for Others', 20, yPos); yPos += lineHeight;
    checkPageBreak();
    pdf.text('Participants should treat fellow students, faculty, staff, local residents, and others with', 25, yPos); yPos += lineHeight;
    pdf.text('respect and dignity. Discrimination, harassment, bullying, or any other forms of inappropriate', 25, yPos); yPos += lineHeight;
    pdf.text('behavior will not be tolerated.', 25, yPos); yPos += lineHeight + 3;
    
    // 3. Academic Integrity
    checkPageBreak();
    pdf.text('3. Academic Integrity', 20, yPos); yPos += lineHeight;
    checkPageBreak();
    pdf.text('Participants must uphold high standards of academic honesty and integrity. Cheating,', 25, yPos); yPos += lineHeight;
    pdf.text('plagiarism, or any form of academic dishonesty will result in disciplinary action.', 25, yPos); yPos += lineHeight + 3;
    
    // 4. Responsible Use of Alcohol and Drugs
    checkPageBreak();
    pdf.text('4. Responsible Use of Alcohol and Drugs', 20, yPos); yPos += lineHeight;
    checkPageBreak();
    pdf.text('Participants are expected to be responsible in their use of alcohol and to avoid illegal drugs.', 25, yPos); yPos += lineHeight;
    pdf.text('The legal drinking age and other regulations regarding alcohol must be observed in the host', 25, yPos); yPos += lineHeight;
    pdf.text('country. Engaging in illegal drug use or excessive drinking that disrupts the program or', 25, yPos); yPos += lineHeight;
    pdf.text('endangers others will not be tolerated.', 25, yPos); yPos += lineHeight + 3;
    
    // 5. Health and Safety
    checkPageBreak();
    pdf.text('5. Health and Safety', 20, yPos); yPos += lineHeight;
    checkPageBreak();
    pdf.text('Participants must prioritize their health and safety and take precautions to avoid situations', 25, yPos); yPos += lineHeight;
    pdf.text('that could harm their well-being. This includes following the advice of program staff, being', 25, yPos); yPos += lineHeight;
    pdf.text('cautious in unfamiliar environments, and adhering to safety guidelines provided by the program.', 25, yPos); yPos += lineHeight + 3;
    
    // 6. Behavioral Expectations
    checkPageBreak();
    pdf.text('6. Behavioral Expectations', 20, yPos); yPos += lineHeight;
    checkPageBreak();
    pdf.text('Participants are expected to maintain professional and respectful behavior at all times.', 25, yPos); yPos += lineHeight;
    pdf.text('Inappropriate or disruptive behavior, including but not limited to violence, theft, vandalism,', 25, yPos); yPos += lineHeight;
    pdf.text('or any behavior that negatively affects the reputation of the program or college, will result', 25, yPos); yPos += lineHeight;
    pdf.text('in disciplinary action.', 25, yPos); yPos += lineHeight + 3;
    
    // 7. Communication and Participation
    checkPageBreak();
    pdf.text('7. Communication and Participation', 20, yPos); yPos += lineHeight;
    checkPageBreak();
    pdf.text('Participants should engage actively in all program activities, attend scheduled meetings, and', 25, yPos); yPos += lineHeight;
    pdf.text('communicate promptly with program staff regarding any issues or concerns. Failure to do so', 25, yPos); yPos += lineHeight;
    pdf.text('may hinder both individual and group experiences.', 25, yPos); yPos += lineHeight + 3;
    
    // 8. Environmental Responsibility
    checkPageBreak();
    pdf.text('8. Environmental Responsibility', 20, yPos); yPos += lineHeight;
    checkPageBreak();
    pdf.text('Participants should make every effort to minimize their environmental impact, including but', 25, yPos); yPos += lineHeight;
    pdf.text('not limited to reducing waste, conserving energy and water, and adhering to environmental', 25, yPos); yPos += lineHeight;
    pdf.text('regulations in the host country.', 25, yPos); yPos += lineHeight + 3;
    
    // 9. Use of Technology
    checkPageBreak();
    pdf.text('9. Use of Technology', 20, yPos); yPos += lineHeight;
    checkPageBreak();
    pdf.text('Participants should use technology responsibly, including respecting privacy and avoiding the', 25, yPos); yPos += lineHeight;
    pdf.text('use of electronic devices during activities where it may be disruptive or inappropriate.', 25, yPos); yPos += lineHeight;
    pdf.text('Cyberbullying, online harassment, or the use of technology for illegal activities will not be', 25, yPos); yPos += lineHeight;
    pdf.text('tolerated.', 25, yPos); yPos += lineHeight + 3;
    
    // 10. Emergency Protocols
    checkPageBreak();
    pdf.text('10. Emergency Protocols', 20, yPos); yPos += lineHeight;
    checkPageBreak();
    pdf.text('In the event of an emergency, participants are required to follow the instructions of the', 25, yPos); yPos += lineHeight;
    pdf.text('program staff and local authorities. Failure to cooperate in an emergency situation may', 25, yPos); yPos += lineHeight;
    pdf.text('result in removal from the program.', 25, yPos); yPos += lineHeight + 3;
    
    // Add acknowledgment
    checkPageBreak();
    pdf.setFontSize(11);
    pdf.text('Acknowledgment', 20, yPos);
    yPos += 10;
    pdf.setFontSize(10);
    pdf.text('By signing below, I acknowledge that I have read and understood the Code of Conduct', 20, yPos); yPos += lineHeight;
    pdf.text('for the Hypothetical City College Study Abroad Program. I agree to follow the guidelines', 20, yPos); yPos += lineHeight;
    pdf.text('outlined above, and I understand that failure to do so may result in disciplinary action,', 20, yPos); yPos += lineHeight;
    pdf.text('including possible removal from the program.', 20, yPos); yPos += lineHeight;
    pdf.text('I understand that the purpose of the program is to provide an enriching cultural and academic', 20, yPos); yPos += lineHeight;
    pdf.text('experience, and I commit to representing myself and my college in a responsible, respectful,', 20, yPos); yPos += lineHeight;
    pdf.text('and safe manner.', 20, yPos);
    yPos += 16;
    
    // Ensure enough space for signatures
    if (yPos > pageHeight - 40) {
      pdf.addPage();
      yPos = 20;
    }
    
    // Add signatures
    pdf.text(`Student Signature:`, 20, yPos);
    // Add the student signature image
    const studentSigData = sigPadStudent.current.toDataURL();
    pdf.addImage(studentSigData, 'PNG', 70, yPos - 10, 60, 20);
    pdf.text(`Date: ${new Date(formData.signatureDate).toLocaleDateString()}`, 150, yPos);
    
    // Add parent/guardian signature if applicable
    if (formData.underAge && sigPadGuardian.current) {
      yPos += 20;
      checkPageBreak();
      pdf.text(`Parent/Guardian Signature:`, 20, yPos);
      const guardianSigData = sigPadGuardian.current.toDataURL();
      pdf.addImage(guardianSigData, 'PNG', 70, yPos - 10, 60, 20);
      pdf.text(`Date: ${new Date(formData.signatureDate).toLocaleDateString()}`, 150, yPos);
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
  
  const handleView = async () => {
    try {
      // Check if a document of this type already exists for this application
      const documentsResponse = await axiosInstance.get(`/api/documents/?application=${application.id}`);
      const existingDoc = documentsResponse.data.find(
        doc => doc.type === 'Acknowledgement of the code of conduct'
      );
      
      if (!existingDoc) {
        // If no document exists yet, generate a preview
        const pdf = generatePDF();
        const pdfBlob = pdf.output('blob');
        const blobUrl = window.URL.createObjectURL(pdfBlob);
        setSelectedDocUrl(blobUrl);
        setPdfViewerOpen(true);
        return;
      }
      
      // If document exists, fetch it from the server
      const response = await axiosInstance.get(`/api/documents/${existingDoc.id}/pdf/`, {
        responseType: 'blob'
      });
      
      // Create a blob URL from the PDF data
      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      const blobUrl = window.URL.createObjectURL(pdfBlob);
      setSelectedDocUrl(blobUrl);
      setPdfViewerOpen(true);
    } catch (err) {
      console.error("Error viewing document:", err);
      setError("Failed to view document");
    }
  };

  const handleCloseViewer = () => {
    if (selectedDocUrl) {
      URL.revokeObjectURL(selectedDocUrl);
    }
    setSelectedDocUrl(null);
    setPdfViewerOpen(false);
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
      
      // Check if a document of this type already exists for this application
      const documentsResponse = await axiosInstance.get(`/api/documents/?application=${application.id}`);
      const existingDoc = documentsResponse.data.find(
        doc => doc.type === 'Acknowledgement of the code of conduct'
      );
      
      let response;
      // If document exists, update it with PATCH
      if (existingDoc) {
        response = await axiosInstance.patch(`/api/documents/${existingDoc.id}/`, formDataToSubmit, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        // Otherwise create a new document
        response = await axiosInstance.post('/api/documents/', formDataToSubmit, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      
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
          Code of Conduct
        </Typography>
        
        <Typography variant="body1" paragraph>
          As a participant in the Hypothetical City College Study Abroad Program, you are
          representing not only yourself but also your college, your community, and your country.
          Therefore, it is essential to uphold the values and principles outlined in the Code of
          Conduct to ensure a safe, respectful, and enriching experience for all participants.
        </Typography>
        
        <Typography variant="body1" paragraph>
          By signing this document, you acknowledge that you have read, understood, and agree to abide by the following Code of Conduct during your participation in the Study Abroad Program. Violations of the Code of Conduct may result in disciplinary action, including but not limited to removal from the program.
        </Typography>

        <Typography variant="subtitle1" fontWeight="bold" paragraph>
          Code of Conduct for Study Abroad Participants
        </Typography>

        <Typography variant="subtitle2" fontWeight="bold">
          1. Respect for Local Laws and Customs
        </Typography>
        <Typography variant="body2" paragraph>
          Participants are expected to respect and abide by the laws, regulations, and cultural norms of the host country. This includes, but is not limited to, respecting local dress codes, religious practices, and social customs.
        </Typography>

        <Typography variant="subtitle2" fontWeight="bold">
          2. Respect for Others
        </Typography>
        <Typography variant="body2" paragraph>
          Participants should treat fellow students, faculty, staff, local residents, and others with respect and dignity. Discrimination, harassment, bullying, or any other forms of inappropriate behavior will not be tolerated.
        </Typography>

        <Typography variant="subtitle2" fontWeight="bold">
          3. Academic Integrity
        </Typography>
        <Typography variant="body2" paragraph>
          Participants must uphold high standards of academic honesty and integrity. Cheating, plagiarism, or any form of academic dishonesty will result in disciplinary action.
        </Typography>

        <Typography variant="subtitle2" fontWeight="bold">
          4. Responsible Use of Alcohol and Drugs
        </Typography>
        <Typography variant="body2" paragraph>
          Participants are expected to be responsible in their use of alcohol and to avoid illegal drugs. The legal drinking age and other regulations regarding alcohol must be observed in the host country. Engaging in illegal drug use or excessive drinking that disrupts the program or endangers others will not be tolerated.
        </Typography>

        <Typography variant="subtitle2" fontWeight="bold">
          5. Health and Safety
        </Typography>
        <Typography variant="body2" paragraph>
          Participants must prioritize their health and safety and take precautions to avoid situations that could harm their well-being. This includes following the advice of program staff, being cautious in unfamiliar environments, and adhering to safety guidelines provided by the program.
        </Typography>

        <Typography variant="subtitle2" fontWeight="bold">
          6. Behavioral Expectations
        </Typography>
        <Typography variant="body2" paragraph>
          Participants are expected to maintain professional and respectful behavior at all times. Inappropriate or disruptive behavior, including but not limited to violence, theft, vandalism, or any behavior that negatively affects the reputation of the program or college, will result in disciplinary action.
        </Typography>

        <Typography variant="subtitle2" fontWeight="bold">
          7. Communication and Participation
        </Typography>
        <Typography variant="body2" paragraph>
          Participants should engage actively in all program activities, attend scheduled meetings, and communicate promptly with program staff regarding any issues or concerns. Failure to do so may hinder both individual and group experiences.
        </Typography>

        <Typography variant="subtitle2" fontWeight="bold">
          8. Environmental Responsibility
        </Typography>
        <Typography variant="body2" paragraph>
          Participants should make every effort to minimize their environmental impact, including but not limited to reducing waste, conserving energy and water, and adhering to environmental regulations in the host country.
        </Typography>

        <Typography variant="subtitle2" fontWeight="bold">
          9. Use of Technology
        </Typography>
        <Typography variant="body2" paragraph>
          Participants should use technology responsibly, including respecting privacy and avoiding the use of electronic devices during activities where it may be disruptive or inappropriate. Cyberbullying, online harassment, or the use of technology for illegal activities will not be tolerated.
        </Typography>

        <Typography variant="subtitle2" fontWeight="bold">
          10. Emergency Protocols
        </Typography>
        <Typography variant="body2" paragraph>
          In the event of an emergency, participants are required to follow the instructions of the program staff and local authorities. Failure to cooperate in an emergency situation may result in removal from the program.
        </Typography>

        <Typography variant="subtitle1" fontWeight="bold" mt={2} paragraph>
          Acknowledgment
        </Typography>
        <Typography variant="body2" paragraph>
          By signing below, I acknowledge that I have read and understood the Code of Conduct for the Hypothetical City College Study Abroad Program. I agree to follow the guidelines outlined above, and I understand that failure to do so may result in disciplinary action, including possible removal from the program.
        </Typography>
        <Typography variant="body2" paragraph>
          I understand that the purpose of the program is to provide an enriching cultural and academic experience, and I commit to representing myself and my college in a responsible, respectful, and safe manner.
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
          onClick={handleView}
          startIcon={<VisibilityIcon />}
        >
          View
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
        open={pdfViewerOpen} 
        onClose={handleCloseViewer}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>View Code of Conduct Form</DialogTitle>
        <DialogContent>
          <PreviewContainer>
            {selectedDocUrl && (
              <iframe
                src={selectedDocUrl}
                title="PDF Preview"
                width="100%"
                height="100%"
                style={{ border: 'none' }}
              />
            )}
          </PreviewContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewer} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Original Preview Dialog */}
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