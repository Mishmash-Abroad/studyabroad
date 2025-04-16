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
  MenuItem,
  Select,
  Grid,
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
 * Electronic form for Housing Questionnaire
 * 
 * @param {Object} props
 * @param {Object} props.user - Current user data
 * @param {Object} props.application - Application data
 * @param {Function} props.onSubmit - Function called when form is submitted
 * @param {Object} props.program - Program data
 * @param {Function} props.onCancel - Function called when form is canceled
 */
const ElectronicHousingQuestionnaireForm = ({ 
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
    housingType: [],
    roommateName: '',
    roommateGender: '',
    specialNeeds: '',
    dietaryRestrictions: [],
    otherDietary: '',
    smoker: '',
    sleepingArrangement: '',
    noisePreference: '',
    bathroomPreference: '',
    laundryPreference: '',
    cookingPreference: '',
    culturalImmersion: '',
    locationPreference: '',
    budget: '',
    internationalStudents: '',
    independenceLevel: '',
    additionalComments: '',
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
    
    if (type === 'checkbox') {
      if (name.startsWith('housingType-')) {
        const housingType = name.split('-')[1];
        setFormData(prev => ({
          ...prev,
          housingType: checked 
            ? [...prev.housingType, housingType]
            : prev.housingType.filter(type => type !== housingType)
        }));
      } else if (name.startsWith('dietary-')) {
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
    
    // Add header
    pdf.setFontSize(16);
    pdf.text('Hypothetical City College Study Abroad Program', 105, yPos, { align: 'center' });
    yPos += 10;
    pdf.setFontSize(14);
    pdf.text('Housing Questionnaire', 105, yPos, { align: 'center' });
    yPos += 15;
    
    // Add student information
    pdf.setFontSize(12);
    pdf.text('Student Information:', 20, yPos);
    yPos += 10;
    pdf.text(`Full Name: ${formData.studentName}`, 30, yPos); yPos += lineHeight;
    pdf.text(`Student ID (NetID): ${formData.studentId}`, 30, yPos); yPos += lineHeight;
    pdf.text(`Date of Birth: ${new Date(formData.dateOfBirth).toLocaleDateString()}`, 30, yPos);
    yPos += 15;
    
    // Housing preferences
    pdf.setFontSize(12);
    pdf.text('Housing Preferences:', 20, yPos); yPos += 10;
    
    pdf.setFontSize(10);
    pdf.text(`1. Preferred Housing Type: ${formData.housingType.join(', ')}`, 30, yPos); yPos += lineHeight;
    pdf.text(`2. Roommate Preferences: ${formData.roommateName}`, 30, yPos); yPos += lineHeight;
    pdf.text(`3. Gender of Roommate(s): ${formData.roommateGender}`, 30, yPos); yPos += lineHeight;
    pdf.text(`4. Special Housing Needs: ${formData.specialNeeds}`, 30, yPos); yPos += lineHeight;
    pdf.text(`5. Dietary Restrictions: ${formData.dietaryRestrictions.join(', ')}${formData.otherDietary ? ` (${formData.otherDietary})` : ''}`, 30, yPos); yPos += lineHeight;
    pdf.text(`6. Smoker: ${formData.smoker}`, 30, yPos); yPos += lineHeight;
    pdf.text(`7. Sleeping Arrangement: ${formData.sleepingArrangement}`, 30, yPos); yPos += lineHeight;
    pdf.text(`8. Noise Preferences: ${formData.noisePreference}`, 30, yPos); yPos += lineHeight;
    pdf.text(`9. Bathroom Arrangement: ${formData.bathroomPreference}`, 30, yPos); yPos += lineHeight;
    pdf.text(`10. Laundry Preferences: ${formData.laundryPreference}`, 30, yPos); yPos += lineHeight;
    pdf.text(`11. Cooking Preferences: ${formData.cookingPreference}`, 30, yPos); yPos += lineHeight;
    pdf.text(`12. Cultural Immersion: ${formData.culturalImmersion}`, 30, yPos);
    yPos += 15;
    
    // Additional questions
    pdf.setFontSize(12);
    pdf.text('Additional Information:', 20, yPos); yPos += 10;
    
    pdf.setFontSize(10);
    pdf.text(`15. Location Preferences: ${formData.locationPreference}`, 30, yPos); yPos += lineHeight;
    pdf.text(`16. Budget for Housing: ${formData.budget}`, 30, yPos); yPos += lineHeight;
    pdf.text(`17. Open to Living with International Students: ${formData.internationalStudents}`, 30, yPos); yPos += lineHeight;
    pdf.text(`18. Independence Level: ${formData.independenceLevel}`, 30, yPos); yPos += lineHeight;
    
    // Word wrap for longer text
    const splitText = pdf.splitTextToSize(`19. Additional Comments: ${formData.additionalComments}`, 160);
    pdf.text(splitText, 30, yPos);
    yPos += splitText.length * lineHeight + 10;
    
    // Add signatures
    pdf.text(`Student Signature:`, 20, yPos + 10);
    // Add the student signature image
    const studentSigData = sigPadStudent.current.toDataURL();
    pdf.addImage(studentSigData, 'PNG', 70, yPos, 60, 20);
    pdf.text(`Date: ${new Date(formData.signatureDate).toLocaleDateString()}`, 150, yPos + 10);
    
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
  
  const handleView = async () => {
    try {
      // Check if a document of this type already exists for this application
      const documentsResponse = await axiosInstance.get(`/api/documents/?application=${application.id}`);
      const existingDoc = documentsResponse.data.find(
        doc => doc.type === 'Housing questionnaire'
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
      formDataToSubmit.append('title', 'Housing Questionnaire');
      formDataToSubmit.append('pdf', pdfBlob, 'housing_questionnaire.pdf');
      formDataToSubmit.append('application', application.id);
      formDataToSubmit.append('type', 'Housing questionnaire');
      
      // Add the electronic form data as JSON
      const electronicData = {
        ...formData,
        studentSignature: sigPadStudent.current.toDataURL('image/svg+xml')
      };
      
      formDataToSubmit.append('form_data', JSON.stringify(electronicData));
      formDataToSubmit.append('is_electronic', 'true');
      
      // Check if a document of this type already exists for this application
      const documentsResponse = await axiosInstance.get(`/api/documents/?application=${application.id}`);
      const existingDoc = documentsResponse.data.find(
        doc => doc.type === 'Housing questionnaire'
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
        Housing Questionnaire
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
          Housing Preferences
        </Typography>
        
        <FormField>
          <FormLabel component="legend">1. Preferred Housing Type (Check all that apply)</FormLabel>
          <FormControlLabel 
            control={<Checkbox checked={formData.housingType.includes('University dormitory')} onChange={handleFormChange} name="housingType-University dormitory" />} 
            label="University dormitory" 
          />
          <FormControlLabel 
            control={<Checkbox checked={formData.housingType.includes('Shared apartment')} onChange={handleFormChange} name="housingType-Shared apartment" />} 
            label="Shared apartment or house with other students" 
          />
          <FormControlLabel 
            control={<Checkbox checked={formData.housingType.includes('Private apartment')} onChange={handleFormChange} name="housingType-Private apartment" />}
            label="Private apartment or house" 
          />
          <FormControlLabel 
            control={<Checkbox checked={formData.housingType.includes('Homestay')} onChange={handleFormChange} name="housingType-Homestay" />} 
            label="Homestay (living with a local family)" 
          />
        </FormField>
        
        <FormField>
          <TextField
            label="2. Roommate Preferences"
            name="roommateName"
            value={formData.roommateName}
            onChange={handleFormChange}
            fullWidth
            multiline
            rows={2}
            helperText="List any particular person(s) you'd prefer to have as roommates"
          />
        </FormField>
        
        <FormField>
          <FormControl component="fieldset">
            <FormLabel component="legend">3. Gender of Roommate(s)</FormLabel>
            <RadioGroup
              name="roommateGender"
              value={formData.roommateGender}
              onChange={handleFormChange}
            >
              <FormControlLabel value="Same gender only" control={<Radio />} label="Same gender only" />
              <FormControlLabel value="No preference" control={<Radio />} label="No preference" />
              <FormControlLabel value="Open to mixed-gender roommates" control={<Radio />} label="Open to mixed-gender roommates" />
            </RadioGroup>
          </FormControl>
        </FormField>
        
        <FormField>
          <TextField
            label="4. Special Housing Needs or Accommodations"
            name="specialNeeds"
            value={formData.specialNeeds}
            onChange={handleFormChange}
            fullWidth
            multiline
            rows={2}
            helperText="Specify any mobility issues, medical conditions, or other special requests"
          />
        </FormField>
        
        <FormField>
          <FormLabel component="legend">5. Dietary Restrictions or Preferences</FormLabel>
          <FormControlLabel 
            control={<Checkbox checked={formData.dietaryRestrictions.includes('Vegetarian')} onChange={handleFormChange} name="dietary-Vegetarian" />} 
            label="Vegetarian" 
          />
          <FormControlLabel 
            control={<Checkbox checked={formData.dietaryRestrictions.includes('Vegan')} onChange={handleFormChange} name="dietary-Vegan" />} 
            label="Vegan" 
          />
          <FormControlLabel 
            control={<Checkbox checked={formData.dietaryRestrictions.includes('Gluten-free')} onChange={handleFormChange} name="dietary-Gluten-free" />} 
            label="Gluten-free" 
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
            <FormLabel component="legend">6. Do you smoke?</FormLabel>
            <RadioGroup
              name="smoker"
              value={formData.smoker}
              onChange={handleFormChange}
            >
              <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="No" control={<Radio />} label="No" />
              <FormControlLabel value="Occasionally" control={<Radio />} label="Occasionally" />
              <FormControlLabel value="Prefer a non-smoking environment" control={<Radio />} label="Prefer a non-smoking environment" />
            </RadioGroup>
          </FormControl>
        </FormField>
        
        <FormField>
          <FormControl fullWidth margin="normal">
            <FormLabel component="legend">7. Preferred Sleeping Arrangements</FormLabel>
            <Select
              name="sleepingArrangement"
              value={formData.sleepingArrangement}
              onChange={handleFormChange}
            >
              <MenuItem value="Single bed in a shared room">Single bed in a shared room</MenuItem>
              <MenuItem value="Single bed in a private room">Single bed in a private room</MenuItem>
              <MenuItem value="Double bed (shared room)">Double bed (shared room)</MenuItem>
              <MenuItem value="No preference">No preference</MenuItem>
            </Select>
          </FormControl>
        </FormField>
        
        <FormField>
          <FormControl component="fieldset">
            <FormLabel component="legend">8. Noise Preferences or Sensitivities</FormLabel>
            <RadioGroup
              name="noisePreference"
              value={formData.noisePreference}
              onChange={handleFormChange}
            >
              <FormControlLabel value="I prefer a quiet living environment" control={<Radio />} label="I prefer a quiet living environment" />
              <FormControlLabel value="I can tolerate some noise" control={<Radio />} label="I can tolerate some noise (e.g., busy city or social environments)" />
              <FormControlLabel value="I have a sensitivity to noise" control={<Radio />} label="I have a sensitivity to noise" />
            </RadioGroup>
          </FormControl>
        </FormField>
        
        <FormField>
          <FormControl fullWidth margin="normal">
            <FormLabel component="legend">9. Preferred Bathroom Arrangement</FormLabel>
            <Select
              name="bathroomPreference"
              value={formData.bathroomPreference}
              onChange={handleFormChange}
            >
              <MenuItem value="Private bathroom">Private bathroom</MenuItem>
              <MenuItem value="Shared bathroom with other students">Shared bathroom with other students</MenuItem>
              <MenuItem value="Shared bathroom with host family">Shared bathroom with host family (if applicable)</MenuItem>
              <MenuItem value="No preference">No preference</MenuItem>
            </Select>
          </FormControl>
        </FormField>
        
        <FormField>
          <FormControl fullWidth margin="normal">
            <FormLabel component="legend">10. Laundry Preferences</FormLabel>
            <Select
              name="laundryPreference"
              value={formData.laundryPreference}
              onChange={handleFormChange}
            >
              <MenuItem value="I prefer an in-unit washer/dryer">I prefer an in-unit washer/dryer</MenuItem>
              <MenuItem value="I can use a communal laundry facility">I can use a communal laundry facility</MenuItem>
              <MenuItem value="I need assistance locating laundry facilities">I need assistance locating laundry facilities</MenuItem>
              <MenuItem value="No preference">No preference</MenuItem>
            </Select>
          </FormControl>
        </FormField>
        
        <FormField>
          <FormControl component="fieldset">
            <FormLabel component="legend">11. Would you prefer a housing option with cooking facilities?</FormLabel>
            <RadioGroup
              name="cookingPreference"
              value={formData.cookingPreference}
              onChange={handleFormChange}
            >
              <FormControlLabel value="Yes, I prefer to cook my own meals" control={<Radio />} label="Yes, I prefer to cook my own meals" />
              <FormControlLabel value="No, I prefer meal options provided" control={<Radio />} label="No, I prefer meal options provided (e.g., meal plan, host family meals)" />
              <FormControlLabel value="No preference" control={<Radio />} label="No preference" />
            </RadioGroup>
          </FormControl>
        </FormField>
        
        <FormField>
          <FormControl component="fieldset">
            <FormLabel component="legend">12. How do you feel about living in a culturally immersive environment?</FormLabel>
            <RadioGroup
              name="culturalImmersion"
              value={formData.culturalImmersion}
              onChange={handleFormChange}
            >
              <FormControlLabel value="Very excited" control={<Radio />} label="Very excited" />
              <FormControlLabel value="Open to it, but would like more information" control={<Radio />} label="Open to it, but would like more information" />
              <FormControlLabel value="Not interested, prefer more independent living" control={<Radio />} label="Not interested, prefer more independent living" />
              <FormControlLabel value="No preference" control={<Radio />} label="No preference" />
            </RadioGroup>
          </FormControl>
        </FormField>
      </FormSection>
      
      <FormSection>
        <Typography variant="h6" gutterBottom>
          Additional Information
        </Typography>
        
        <FormField>
          <TextField
            label="15. Specific Housing Requests or Preferences"
            name="locationPreference"
            value={formData.locationPreference}
            onChange={handleFormChange}
            fullWidth
            multiline
            rows={2}
            helperText="Please describe any other factors that may influence your housing choice, such as proximity to campus, transportation options, etc."
          />
        </FormField>
        
        <FormField>
          <FormControl fullWidth margin="normal">
            <FormLabel component="legend">16. Expected Monthly Budget for Housing</FormLabel>
            <Select
              name="budget"
              value={formData.budget}
              onChange={handleFormChange}
            >
              <MenuItem value="$0–$500">$0–$500</MenuItem>
              <MenuItem value="$501–$750">$501–$750</MenuItem>
              <MenuItem value="$751–$1000">$751–$1000</MenuItem>
              <MenuItem value="$1001–$1500">$1001–$1500</MenuItem>
              <MenuItem value="$1501 and above">$1501 and above</MenuItem>
              <MenuItem value="No preference">No preference</MenuItem>
            </Select>
          </FormControl>
        </FormField>
        
        <FormField>
          <FormControl component="fieldset">
            <FormLabel component="legend">17. Are you open to sharing a living space with other international students?</FormLabel>
            <RadioGroup
              name="internationalStudents"
              value={formData.internationalStudents}
              onChange={handleFormChange}
            >
              <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="No" control={<Radio />} label="No" />
              <FormControlLabel value="Maybe, depending on the situation" control={<Radio />} label="Maybe, depending on the situation" />
            </RadioGroup>
          </FormControl>
        </FormField>
        
        <FormField>
          <FormControl component="fieldset">
            <FormLabel component="legend">18. What is your preferred level of independence in housing?</FormLabel>
            <RadioGroup
              name="independenceLevel"
              value={formData.independenceLevel}
              onChange={handleFormChange}
            >
              <FormControlLabel value="I prefer complete independence" control={<Radio />} label="I prefer complete independence (e.g., private apartment)" />
              <FormControlLabel value="I prefer some social interaction" control={<Radio />} label="I prefer some social interaction (e.g., shared apartment, dormitory)" />
              <FormControlLabel value="I prefer a more communal living situation" control={<Radio />} label="I prefer a more communal living situation (e.g., homestay)" />
            </RadioGroup>
          </FormControl>
        </FormField>
        
        <FormField>
          <TextField
            label="19. Additional Comments or Questions"
            name="additionalComments"
            value={formData.additionalComments}
            onChange={handleFormChange}
            fullWidth
            multiline
            rows={3}
          />
        </FormField>
      </FormSection>
      
      <FormSection>
        <Typography variant="h6" gutterBottom>
          Acknowledgment
        </Typography>
        
        <Typography variant="body2" paragraph>
          By signing this form, I acknowledge that the information I have provided is accurate 
          and complete to the best of my knowledge. I understand that the housing assignments 
          will be made based on availability and my preferences, but that some housing options 
          may not be guaranteed. I agree to work with program staff to resolve any housing-related 
          issues should they arise.
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
      
      {/* PDF Viewer Dialog */}
      <Dialog 
        open={pdfViewerOpen} 
        onClose={handleCloseViewer}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>View Housing Questionnaire</DialogTitle>
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

export default ElectronicHousingQuestionnaireForm; 