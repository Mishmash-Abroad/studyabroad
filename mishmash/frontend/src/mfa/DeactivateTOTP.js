import React, { useState } from "react";
import axiosInstance from "../utils/axios";

function DeactivateTOTP() {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    axiosInstance
      .post("/api/mfa/deactivate_totp_device/")
      .then(() => {
        setSuccess(true);
        setError(null);
      })
      .catch((error) => {
        setError(error.response?.data?.error || "Failed to deactivate TOTP.");
      });
  };

  return (
    <section>
      <h1>Deactivate Authenticator App</h1>
      {success ? (
        <p>TOTP deactivated successfully!</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <p>Are you sure you want to deactivate the authenticator app?</p>
          <button type="submit">Deactivate</button>
        </form>
      )}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </section>
  );
}

export default DeactivateTOTP;