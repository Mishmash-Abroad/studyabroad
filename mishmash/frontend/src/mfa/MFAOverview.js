import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../utils/axios";

function MFAOverview() {
  const [mfaStatus, setMfaStatus] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch MFA status
    axiosInstance
      .get("/api/mfa/status/")
      .then((response) => {
        console.log(response.data.is_mfa_enabled);
        setMfaStatus(response.data.is_mfa_enabled);
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <section>
      <h1>Two-Factor Authentication</h1>

      <h2>Authenticator App</h2>
      {mfaStatus ? (
        <>
          <p>Authentication using an authenticator app is active.</p>
          <Link to="/mfa/totp/deactivate">Deactivate</Link>
        </>
      ) : (
        <>
          <p>An authenticator app is not active.</p>
          <Link to="/mfa/totp/activate">Activate</Link>
        </>
      )}
    </section>
  );
}

export default MFAOverview;