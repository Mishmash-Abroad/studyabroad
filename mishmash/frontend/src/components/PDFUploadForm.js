import React, { useState } from "react";
import axiosInstance from "../utils/axios";

const PDFUploadForm = ({ pdf_name, application_id, doc_type }) => {
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

    if (file.type != "application/pdf") {
      setFile(null);
      setError("Please select a PDF file.");
      return;
    }

    const formData = new FormData();
    formData.append("title", file.name);
    formData.append("pdf", file);
    formData.append("application", application_id);
    formData.append("type", doc_type);

    try {
      const submitted_doc_response = await axiosInstance.get(
        `/api/documents/?application=${application_id}`
      );

      const submitted_docs_with_type = submitted_doc_response.data.filter(
        (doc) => doc.type == doc_type
      );
      console.log(submitted_docs_with_type);

      let response = {};
      if (submitted_docs_with_type.length != 0) {
        const doc_id = submitted_docs_with_type[0].id;
        response = await axiosInstance.patch(
          `/api/documents/${doc_id}/`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      } else {
        response = await axiosInstance.post("/api/documents/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      if (response.status === 201 || response.status === 200) {
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
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
        />
        <button type="submit">Upload</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
    </div>
  );
};

export default PDFUploadForm;
