import React, { useState } from "react";
import axios from "axios";

function ActivateTOTP() {
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post("/api/mfa/totp/activate/", { code })
      .then(() => {
        setSuccess(true);
        setError(null);
      })
      .catch((error) => {
        setError(error.response?.data?.error || "Failed to activate TOTP.");
      });
  };

  return (
    <section>
      <h1>Activate Authenticator App</h1>
      {success ? (
        <p>TOTP activated successfully!</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <label>
            Enter the code from your authenticator app:
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </label>
          <button type="submit">Activate</button>
        </form>
      )}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </section>
  );
}

export default ActivateTOTP;