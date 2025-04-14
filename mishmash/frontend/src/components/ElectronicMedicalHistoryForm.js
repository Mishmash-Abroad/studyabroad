import React, { useState, useRef } from 'react';
import { styled } from '@mui/material/styles';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  FormControlLabel,
  Radio,
  RadioGroup,
  Checkbox,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormLabel,
  Grid,
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

const FormField = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
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
 * Electronic form for Medical/Health History and Immunization Records
 * 
 * @param {Object} props
 * @param {Object} props.user - Current user data
 * @param {Object} props.application - Application data
 * @param {Function} props.onSubmit - Function called when form is submitted
 * @param {Object} props.program - Program data
 * @param {Function} props.onCancel - Function called when form is canceled
 */
const ElectronicMedicalHistoryForm = ({ 
  user, 
  application, 
  program, 
  onSubmit,
  onCancel 
}) => {
  // Form state
  const [formData, setFormData] = useState({
    // Student information
    studentName: user?.display_name || '',
    studentId: user?.username || '',
    dateOfBirth: application?.date_of_birth || '',
    
    // Emergency contact
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactPhone: '',
    emergencyContactEmail: '',
    
    // Health information
    hasMedicalConditions: 'No',
    medicalConditions: '',
    hasPrescriptions: 'No',
    prescriptions: '',
    hasOTCMedications: 'No',
    otcMedications: '',
    hasMentalHealth: 'No',
    mentalHealth: '',
    hasMobility: 'No',
    mobility: '',
    dietaryRestrictions: [],
    otherDietary: '',
    hasRecentSurgeries: 'No',
    recentSurgeries: '',
    
    // Immunization records
    mmr: 'No',
    mmrDate: '',
    tdap: 'No',
    tdapDate: '',
    hepatitisA: 'No',
    hepatitisADate: '',
    hepatitisB: 'No',
    hepatitisBDate: '',
    varicella: 'No',
    varicellaDate: '',
    polio: 'No',
    polioDate: '',
    meningococcal: 'No',
    meningococcalDate: '',
    influenza: 'No',
    influenzaDate: '',
    typhoid: 'No',
    typhoidDate: '',
    yellowFever: 'No',
    yellowFeverDate: '',
    rabies: 'No',
    rabiesDate: '',
    covid19: 'No',
    covid19Date: '',
    otherVaccinations: '',
    
    // Consent
    consentToMedical: false,
    
    // Signature date
    signatureDate: new Date().toISOString().split('T')[0]
  });
  
  // Signature pad ref
  const sigPadStudent = useRef(null);
  
  // UI state
  const [error, setError] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleFormChange = (e) => {
    const { name, value, checked, type } = e.target;
    
    if (type === 'checkbox') {
      if (name.startsWith('dietary-')) {
        const dietaryType = name.split('-')[1];
        setFormData(prev => ({
          ...prev,
          dietaryRestrictions: checked 
            ? [...prev.dietaryRestrictions, dietaryType]
            : prev.dietaryRestrictions.filter(type => type !== dietaryType)
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: checked
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
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
    
    if (!formData.emergencyContactName || !formData.emergencyContactPhone) {
      setError('Please provide emergency contact information.');
      return false;
    }
    
    if (!formData.consentToMedical) {
      setError('You must provide consent for medical treatment in case of emergency.');
      return false;
    }
    
    if (sigPadStudent.current.isEmpty()) {
      setError('Please provide your signature.');
      return false;
    }
    
    return true;
  };
  
  const generatePDF = () => {
    const pdf = new jsPDF();
    let yPos = 20;
    const lineHeight = 7;
    const pageHeight = pdf.internal.pageSize.height;
    const margin = 20;
    
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
    pdf.text('Medical/Health History and Immunization Record', 105, yPos, { align: 'center' });
    yPos += 15;
    
    // Add student information
    pdf.setFontSize(12);
    pdf.text('Student Information:', 20, yPos);
    yPos += 10;
    pdf.text(`Full Name: ${formData.studentName}`, 30, yPos); yPos += lineHeight;
    pdf.text(`Student ID (NetID): ${formData.studentId}`, 30, yPos); yPos += lineHeight;
    pdf.text(`Date of Birth: ${new Date(formData.dateOfBirth).toLocaleDateString()}`, 30, yPos);
    yPos += 15;
    
    // Emergency Contact
    checkPageBreak();
    pdf.setFontSize(12);
    pdf.text('Emergency Contact Information:', 20, yPos); yPos += 10;
    pdf.text(`Name: ${formData.emergencyContactName}`, 30, yPos); yPos += lineHeight;
    pdf.text(`Relationship: ${formData.emergencyContactRelationship}`, 30, yPos); yPos += lineHeight;
    pdf.text(`Phone: ${formData.emergencyContactPhone}`, 30, yPos); yPos += lineHeight;
    pdf.text(`Email: ${formData.emergencyContactEmail}`, 30, yPos);
    yPos += 15;
    
    // Health Information
    checkPageBreak();
    pdf.setFontSize(12);
    pdf.text('General Health Information:', 20, yPos); yPos += 10;
    
    pdf.text(`1. Chronic medical conditions or allergies: ${formData.hasMedicalConditions}`, 30, yPos);
    if (formData.hasMedicalConditions === 'Yes') {
      yPos += lineHeight;
      pdf.text(`   Description: ${formData.medicalConditions}`, 30, yPos);
    }
    yPos += lineHeight;
    checkPageBreak();
    
    pdf.text(`2. Prescription medications: ${formData.hasPrescriptions}`, 30, yPos);
    if (formData.hasPrescriptions === 'Yes') {
      yPos += lineHeight;
      pdf.text(`   Medications: ${formData.prescriptions}`, 30, yPos);
    }
    yPos += lineHeight;
    checkPageBreak();
    
    pdf.text(`3. Over-the-counter medications: ${formData.hasOTCMedications}`, 30, yPos);
    if (formData.hasOTCMedications === 'Yes') {
      yPos += lineHeight;
      pdf.text(`   Medications: ${formData.otcMedications}`, 30, yPos);
    }
    yPos += lineHeight;
    checkPageBreak();
    
    pdf.text(`4. Mental health conditions: ${formData.hasMentalHealth}`, 30, yPos);
    if (formData.hasMentalHealth === 'Yes') {
      yPos += lineHeight;
      pdf.text(`   Description: ${formData.mentalHealth}`, 30, yPos);
    }
    yPos += lineHeight;
    checkPageBreak();
    
    pdf.text(`5. Mobility limitations: ${formData.hasMobility}`, 30, yPos);
    if (formData.hasMobility === 'Yes') {
      yPos += lineHeight;
      pdf.text(`   Description: ${formData.mobility}`, 30, yPos);
    }
    yPos += lineHeight;
    checkPageBreak();
    
    pdf.text(`6. Dietary restrictions: ${formData.dietaryRestrictions.join(', ')}${formData.otherDietary ? `, ${formData.otherDietary}` : ''}`, 30, yPos);
    yPos += lineHeight;
    checkPageBreak();
    
    pdf.text(`7. Recent surgeries or medical treatments: ${formData.hasRecentSurgeries}`, 30, yPos);
    if (formData.hasRecentSurgeries === 'Yes') {
      yPos += lineHeight;
      pdf.text(`   Description: ${formData.recentSurgeries}`, 30, yPos);
    }
    yPos += 15;
    checkPageBreak();
    
    // Immunization Record
    pdf.setFontSize(12);
    pdf.text('Immunization Record:', 20, yPos); yPos += 10;
    
    pdf.text(`1. Measles, Mumps, and Rubella (MMR): ${formData.mmr}`, 30, yPos);
    if (formData.mmr === 'Yes') {
      yPos += lineHeight;
      pdf.text(`   Date: ${formData.mmrDate}`, 30, yPos);
    }
    yPos += lineHeight;
    checkPageBreak();
    
    pdf.text(`2. Tetanus, Diphtheria, and Pertussis (Tdap): ${formData.tdap}`, 30, yPos);
    if (formData.tdap === 'Yes') {
      yPos += lineHeight;
      pdf.text(`   Date: ${formData.tdapDate}`, 30, yPos);
    }
    yPos += lineHeight;
    checkPageBreak();
    
    // Add the remaining immunizations (simplified for space)
    pdf.text(`3. Hepatitis A: ${formData.hepatitisA}${formData.hepatitisA === 'Yes' ? `, Date: ${formData.hepatitisADate}` : ''}`, 30, yPos); yPos += lineHeight;
    checkPageBreak();
    
    pdf.text(`4. Hepatitis B: ${formData.hepatitisB}${formData.hepatitisB === 'Yes' ? `, Date: ${formData.hepatitisBDate}` : ''}`, 30, yPos); yPos += lineHeight;
    checkPageBreak();
    
    pdf.text(`5. Varicella (Chickenpox): ${formData.varicella}${formData.varicella === 'Yes' ? `, Date: ${formData.varicellaDate}` : ''}`, 30, yPos); yPos += lineHeight;
    checkPageBreak();
    
    pdf.text(`6. Polio: ${formData.polio}${formData.polio === 'Yes' ? `, Date: ${formData.polioDate}` : ''}`, 30, yPos); yPos += lineHeight;
    checkPageBreak();
    
    pdf.text(`7. Meningococcal: ${formData.meningococcal}${formData.meningococcal === 'Yes' ? `, Date: ${formData.meningococcalDate}` : ''}`, 30, yPos); yPos += lineHeight;
    checkPageBreak();
    
    pdf.text(`8. Influenza (Flu): ${formData.influenza}${formData.influenza === 'Yes' ? `, Date: ${formData.influenzaDate}` : ''}`, 30, yPos); yPos += lineHeight;
    checkPageBreak();
    
    pdf.text(`9. Typhoid: ${formData.typhoid}${formData.typhoid === 'Yes' ? `, Date: ${formData.typhoidDate}` : ''}`, 30, yPos); yPos += lineHeight;
    checkPageBreak();
    
    pdf.text(`10. Yellow Fever: ${formData.yellowFever}${formData.yellowFever === 'Yes' ? `, Date: ${formData.yellowFeverDate}` : ''}`, 30, yPos); yPos += lineHeight;
    checkPageBreak();
    
    pdf.text(`11. Rabies: ${formData.rabies}${formData.rabies === 'Yes' ? `, Date: ${formData.rabiesDate}` : ''}`, 30, yPos); yPos += lineHeight;
    checkPageBreak();
    
    pdf.text(`12. COVID-19: ${formData.covid19}${formData.covid19 === 'Yes' ? `, Date: ${formData.covid19Date}` : ''}`, 30, yPos); yPos += lineHeight;
    checkPageBreak();
    
    if (formData.otherVaccinations) {
      pdf.text(`13. Other Vaccinations: ${formData.otherVaccinations}`, 30, yPos); 
      yPos += lineHeight;
    }
    
    yPos += 10;
    checkPageBreak();
    
    // Medical Consent
    pdf.setFontSize(11);
    pdf.text('Medical Consent and Acknowledgment', 20, yPos); yPos += 10;
    pdf.setFontSize(10);
    pdf.text('In the event of an emergency, I authorize Hypothetical City College and its designated', 20, yPos); yPos += lineHeight;
    checkPageBreak();
    
    pdf.text('representatives to seek medical attention on my behalf and to share this medical information', 20, yPos); yPos += lineHeight;
    checkPageBreak();
    
    pdf.text('with healthcare providers as necessary.', 20, yPos); yPos += lineHeight * 2;
    checkPageBreak();
    
    // Ensure enough space for signature on the page
    if (yPos > pageHeight - 40) {
      pdf.addPage();
      yPos = 20;
    }
    
    // Add student signature
    pdf.text(`Student Signature:`, 20, yPos);
    const studentSigData = sigPadStudent.current.toDataURL();
    pdf.addImage(studentSigData, 'PNG', 70, yPos - 10, 60, 20);
    pdf.text(`Date: ${new Date(formData.signatureDate).toLocaleDateString()}`, 150, yPos);
    
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
  
  const clearSignature = () => {
    sigPadStudent.current.clear();
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const pdf = generatePDF();
      const pdfBlob = pdf.output('blob');
      
      // Create form data for upload
      const formDataToSubmit = new FormData();
      formDataToSubmit.append('title', 'Medical History and Immunization Record');
      formDataToSubmit.append('pdf', pdfBlob, 'medical_history.pdf');
      formDataToSubmit.append('application', application.id);
      formDataToSubmit.append('type', 'Medical/health history and immunization records');
      
      // Add the electronic form data as JSON
      const electronicData = {
        ...formData,
        studentSignature: sigPadStudent.current.toDataURL('image/svg+xml')
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
        Medical/Health History and Immunization Record
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
          Emergency Contact Information
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Emergency Contact Name"
              name="emergencyContactName"
              value={formData.emergencyContactName}
              onChange={handleFormChange}
              fullWidth
              margin="normal"
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Relationship to Student"
              name="emergencyContactRelationship"
              value={formData.emergencyContactRelationship}
              onChange={handleFormChange}
              fullWidth
              margin="normal"
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Phone Number(s)"
              name="emergencyContactPhone"
              value={formData.emergencyContactPhone}
              onChange={handleFormChange}
              fullWidth
              margin="normal"
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Email Address"
              name="emergencyContactEmail"
              value={formData.emergencyContactEmail}
              onChange={handleFormChange}
              fullWidth
              margin="normal"
            />
          </Grid>
        </Grid>
      </FormSection>
      
      <FormSection>
        <Typography variant="h6" gutterBottom>
          General Health Information
        </Typography>
        
        <FormField>
          <FormControl component="fieldset">
            <FormLabel component="legend">1. Do you have any chronic medical conditions or allergies?</FormLabel>
            <RadioGroup
              name="hasMedicalConditions"
              value={formData.hasMedicalConditions}
              onChange={handleFormChange}
            >
              <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="No" control={<Radio />} label="No" />
            </RadioGroup>
          </FormControl>
          
          {formData.hasMedicalConditions === 'Yes' && (
            <TextField
              label="Please describe"
              name="medicalConditions"
              value={formData.medicalConditions}
              onChange={handleFormChange}
              fullWidth
              multiline
              rows={2}
              margin="normal"
            />
          )}
        </FormField>
        
        <FormField>
          <FormControl component="fieldset">
            <FormLabel component="legend">2. Do you take any prescription medications?</FormLabel>
            <RadioGroup
              name="hasPrescriptions"
              value={formData.hasPrescriptions}
              onChange={handleFormChange}
            >
              <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="No" control={<Radio />} label="No" />
            </RadioGroup>
          </FormControl>
          
          {formData.hasPrescriptions === 'Yes' && (
            <TextField
              label="Please list medications and dosages"
              name="prescriptions"
              value={formData.prescriptions}
              onChange={handleFormChange}
              fullWidth
              multiline
              rows={2}
              margin="normal"
            />
          )}
        </FormField>
        
        <FormField>
          <FormControl component="fieldset">
            <FormLabel component="legend">3. Do you have any over-the-counter medications or supplements you regularly take?</FormLabel>
            <RadioGroup
              name="hasOTCMedications"
              value={formData.hasOTCMedications}
              onChange={handleFormChange}
            >
              <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="No" control={<Radio />} label="No" />
            </RadioGroup>
          </FormControl>
          
          {formData.hasOTCMedications === 'Yes' && (
            <TextField
              label="Please list them"
              name="otcMedications"
              value={formData.otcMedications}
              onChange={handleFormChange}
              fullWidth
              multiline
              rows={2}
              margin="normal"
            />
          )}
        </FormField>
        
        <FormField>
          <FormControl component="fieldset">
            <FormLabel component="legend">4. Do you have any history of mental health conditions?</FormLabel>
            <RadioGroup
              name="hasMentalHealth"
              value={formData.hasMentalHealth}
              onChange={handleFormChange}
            >
              <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="No" control={<Radio />} label="No" />
            </RadioGroup>
          </FormControl>
          
          {formData.hasMentalHealth === 'Yes' && (
            <TextField
              label="Please specify"
              name="mentalHealth"
              value={formData.mentalHealth}
              onChange={handleFormChange}
              fullWidth
              multiline
              rows={2}
              margin="normal"
            />
          )}
        </FormField>
        
        <FormField>
          <FormControl component="fieldset">
            <FormLabel component="legend">5. Do you have any physical or mobility limitations?</FormLabel>
            <RadioGroup
              name="hasMobility"
              value={formData.hasMobility}
              onChange={handleFormChange}
            >
              <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="No" control={<Radio />} label="No" />
            </RadioGroup>
          </FormControl>
          
          {formData.hasMobility === 'Yes' && (
            <TextField
              label="Please describe"
              name="mobility"
              value={formData.mobility}
              onChange={handleFormChange}
              fullWidth
              multiline
              rows={2}
              margin="normal"
            />
          )}
        </FormField>
        
        <FormField>
          <FormLabel component="legend">6. Dietary Restrictions or Preferences</FormLabel>
          <FormControlLabel 
            control={<Checkbox checked={formData.dietaryRestrictions.includes('Vegetarian')} onChange={handleFormChange} name="dietary-Vegetarian" />} 
            label="Vegetarian" 
          />
          <FormControlLabel 
            control={<Checkbox checked={formData.dietaryRestrictions.includes('Vegan')} onChange={handleFormChange} name="dietary-Vegan" />} 
            label="Vegan" 
          />
          <FormControlLabel 
            control={<Checkbox checked={formData.dietaryRestrictions.includes('Gluten-Free')} onChange={handleFormChange} name="dietary-Gluten-Free" />} 
            label="Gluten-Free" 
          />
          <FormControlLabel 
            control={<Checkbox checked={formData.dietaryRestrictions.includes('Halal')} onChange={handleFormChange} name="dietary-Halal" />} 
            label="Halal" 
          />
          <FormControlLabel 
            control={<Checkbox checked={formData.dietaryRestrictions.includes('Kosher')} onChange={handleFormChange} name="dietary-Kosher" />} 
            label="Kosher" 
          />
          
          <TextField
            label="Other dietary restrictions"
            name="otherDietary"
            value={formData.otherDietary}
            onChange={handleFormChange}
            fullWidth
            margin="normal"
          />
        </FormField>
        
        <FormField>
          <FormControl component="fieldset">
            <FormLabel component="legend">7. Do you have any recent surgeries or medical treatments?</FormLabel>
            <RadioGroup
              name="hasRecentSurgeries"
              value={formData.hasRecentSurgeries}
              onChange={handleFormChange}
            >
              <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="No" control={<Radio />} label="No" />
            </RadioGroup>
          </FormControl>
          
          {formData.hasRecentSurgeries === 'Yes' && (
            <TextField
              label="Please describe"
              name="recentSurgeries"
              value={formData.recentSurgeries}
              onChange={handleFormChange}
              fullWidth
              multiline
              rows={2}
              margin="normal"
            />
          )}
        </FormField>
      </FormSection>
      
      <FormSection>
        <Typography variant="h6" gutterBottom>
          Immunization Record
        </Typography>
        <Typography variant="body2" paragraph>
          Please indicate whether you have received the following immunizations and provide the dates if available.
        </Typography>
        
        {/* Simplified immunization form with most common vaccinations */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormField>
              <FormControl component="fieldset" fullWidth>
                <FormLabel component="legend">Measles, Mumps, and Rubella (MMR)</FormLabel>
                <RadioGroup
                  name="mmr"
                  value={formData.mmr}
                  onChange={handleFormChange}
                >
                  <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
                  <FormControlLabel value="No" control={<Radio />} label="No" />
                </RadioGroup>
              </FormControl>
              
              {formData.mmr === 'Yes' && (
                <TextField
                  label="Date of Immunization"
                  name="mmrDate"
                  type="date"
                  value={formData.mmrDate}
                  onChange={handleFormChange}
                  fullWidth
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
              )}
            </FormField>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormField>
              <FormControl component="fieldset" fullWidth>
                <FormLabel component="legend">Tetanus, Diphtheria, and Pertussis (Tdap)</FormLabel>
                <RadioGroup
                  name="tdap"
                  value={formData.tdap}
                  onChange={handleFormChange}
                >
                  <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
                  <FormControlLabel value="No" control={<Radio />} label="No" />
                </RadioGroup>
              </FormControl>
              
              {formData.tdap === 'Yes' && (
                <TextField
                  label="Date of Immunization"
                  name="tdapDate"
                  type="date"
                  value={formData.tdapDate}
                  onChange={handleFormChange}
                  fullWidth
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
              )}
            </FormField>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormField>
              <FormControl component="fieldset" fullWidth>
                <FormLabel component="legend">COVID-19</FormLabel>
                <RadioGroup
                  name="covid19"
                  value={formData.covid19}
                  onChange={handleFormChange}
                >
                  <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
                  <FormControlLabel value="No" control={<Radio />} label="No" />
                </RadioGroup>
              </FormControl>
              
              {formData.covid19 === 'Yes' && (
                <TextField
                  label="Date of Immunization"
                  name="covid19Date"
                  type="date"
                  value={formData.covid19Date}
                  onChange={handleFormChange}
                  fullWidth
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
              )}
            </FormField>
          </Grid>
        </Grid>
        
        <TextField
          label="Other Vaccinations"
          name="otherVaccinations"
          value={formData.otherVaccinations}
          onChange={handleFormChange}
          fullWidth
          multiline
          rows={2}
          margin="normal"
          helperText="Please list any additional vaccines you have received"
        />
      </FormSection>
      
      <FormSection>
        <Typography variant="h6" gutterBottom>
          Medical Consent and Acknowledgment
        </Typography>
        
        <Typography variant="body2" paragraph>
          In the event of an emergency, I authorize Hypothetical City College and its designated representatives 
          to seek medical attention on my behalf and to share this medical information with healthcare providers 
          as necessary. I understand that it is my responsibility to ensure that my immunizations are up-to-date 
          before departing for the Study Abroad Program.
        </Typography>
        
        <FormControlLabel
          control={
            <Checkbox
              name="consentToMedical"
              checked={formData.consentToMedical}
              onChange={handleFormChange}
              required
            />
          }
          label="I hereby consent to the use of this medical information by program administrators for the purposes of ensuring my health and safety during the program."
        />
      </FormSection>
      
      <FormSection>
        <Typography variant="h6" gutterBottom>
          Signature
        </Typography>
        
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
        
        <Box sx={{ mt: 2, mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
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
        </Box>
      </FormSection>
      
      <ButtonContainer>
        <Button 
          variant="outlined" 
          onClick={clearSignature}
        >
          Clear Signature
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

export default ElectronicMedicalHistoryForm; 