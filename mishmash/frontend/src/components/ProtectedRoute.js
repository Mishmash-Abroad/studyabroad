/**
 * Study Abroad Program - Protected Route Component
 * ============================================
 *
 * This component provides route protection by checking authentication state.
 * It wraps routes that should only be accessible to authenticated users and
 * redirects unauthorized users to the login page.
 *
 * Usage:
 * ```jsx
 * <Route
 *   path="/dashboard"
 *   element={
 *     <ProtectedRoute>
 *       <DashboardComponent />
 *     </ProtectedRoute>
 *   }
 * />
 * ```
 *
 * Features:
 * - Automatic authentication checking
 * - Redirect to login for unauthenticated users
 * - Preserves attempted route for post-login redirect
 */

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Protected Route Component
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - The component to render if authenticated
 * @returns {React.ReactElement} The protected component or redirect
 */
const ProtectedRoute = ({ children }) => {
  // Get authentication state from context
  const { user, isMFAVerified } = useAuth();

  // Redirect to login if user is not authenticated
  if (!user) {
    // Use replace to prevent back button from returning to protected route
    return <Navigate to="/" replace />;
  } else if (user.is_mfa_enabled && !isMFAVerified) {
    return <Navigate to="/" replace />;
  }

  // Render protected content if authenticated
  return children;
};

export default ProtectedRoute;
