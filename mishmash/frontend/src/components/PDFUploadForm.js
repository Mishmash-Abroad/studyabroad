import React, { useState } from "react";
import axiosInstance from '../utils/axios'

const PDFUploadForm = ({ pdf_name, program_id, user_id , doc_type}) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setError("No file selected.");
      return;
    }

    if (file.type != 'application/pdf') {
      setFile(null);    
      setError('Please select a PDF file.');
      return;
    }

    const formData = new FormData();
    formData.append("title", file.name);
    formData.append("pdf", file);
    formData.append("student", user_id); 
    formData.append("program", program_id);
    formData.append("type", doc_type);

    try {
      const response = await axiosInstance.post("/api/documents/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 201) {
        setSuccess("PDF uploaded successfully!");
        setFile(null);
      } else {
        setError("Failed to upload PDF.");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Upload failed.");
    }
  };

  return (
    <div className="upload-container">
      <h3>Upload {pdf_name} PDF</h3>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="application/pdf" onChange={handleFileChange} />
        <button type="submit">Upload</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
    </div>
  );
};

export default PDFUploadForm;
