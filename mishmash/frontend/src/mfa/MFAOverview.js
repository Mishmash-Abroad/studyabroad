import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../utils/axios";

function MFAOverview() {
  const [mfaStatus, setMfaStatus] = useState({ totp: false, recovery_codes: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch MFA status
    axiosInstance
      .get("/api/mfa/status/")
      .then((response) => {
        setMfaStatus(response.data);
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
      {mfaStatus.totp ? (
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

      <h2>Recovery Codes</h2>
      {mfaStatus.recovery_codes > 0 ? (
        <>
          <p>You have {mfaStatus.recovery_codes} recovery codes available.</p>
          <Link to="/mfa/recovery-codes">View</Link>
          <Link to="/mfa/recovery-codes/generate">Regenerate</Link>
        </>
      ) : (
        <>
          <p>No recovery codes set up.</p>
          <Link to="/mfa/recovery-codes/generate">Generate</Link>
        </>
      )}
    </section>
  );
}

export default MFAOverview;