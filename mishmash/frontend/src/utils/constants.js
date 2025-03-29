// Status severity levels
export const SEVERITY_LEVELS = {
  NORMAL: "info", // Default/neutral status
  GOOD: "success", // Positive/success status
  WARNING: "warning", // Warning/attention needed
  CRITICAL: "error", // Critical/error status
};

// Status Enums - Single source of truth for status names
export const STATUS = {
  APPLIED: "Applied",
  APPROVED: "Approved",
  ENROLLED: "Enrolled",
  ELIGIBLE: "Eligible",
  COMPLETED: "Completed",
  WITHDRAWN: "Withdrawn",
  CANCELED: "Canceled",
};

// Program status enums
export const PROGRAM_STATUS = {
  OPEN: "Open",
  OPENING_SOON: "Opening Soon",
  CLOSED: "Closed",
};

// All possible statuses with their properties
export const ALL_STATUSES = {
  [STATUS.APPLIED]: {
    severity: SEVERITY_LEVELS.NORMAL,
    description: "Application has been submitted",
    abbr: "APLD",
  },
  [STATUS.APPROVED]: {
    severity: SEVERITY_LEVELS.GOOD,
    description: "Application has been approved",
    abbr: "APRV",
  },
  [STATUS.ENROLLED]: {
    severity: SEVERITY_LEVELS.GOOD,
    description: "Successfully enrolled in program",
    abbr: "ENRL",
  },
  [STATUS.ELIGIBLE]: {
    severity: SEVERITY_LEVELS.NORMAL,
    description: "Eligible for application",
    abbr: "ELIG",
  },
  [STATUS.COMPLETED]: {
    severity: SEVERITY_LEVELS.GOOD,
    description: "Application process has been completed",
    abbr: "CMPL",
  },
  [STATUS.WITHDRAWN]: {
    severity: SEVERITY_LEVELS.WARNING,
    description: "Application withdrawn by applicant",
    abbr: "WDRN",
  },
  [STATUS.CANCELED]: {
    severity: SEVERITY_LEVELS.CRITICAL,
    description: "Application has been canceled",
    abbr: "CNCL",
  },
};

// Program statuses with their properties
export const PROGRAM_STATUSES = {
  [PROGRAM_STATUS.OPEN]: {
    severity: SEVERITY_LEVELS.GOOD,
    description: "Program is accepting applications",
  },
  [PROGRAM_STATUS.OPENING_SOON]: {
    severity: SEVERITY_LEVELS.NORMAL,
    description: "Program will open for applications soon",
  },
  [PROGRAM_STATUS.CLOSED]: {
    severity: SEVERITY_LEVELS.CRITICAL,
    description: "Program is no longer accepting applications",
  },
};

// Derived status lists for different contexts
export const ALL_ADMIN_EDITABLE_STATUSES = [
  // Statuses an admin is allowed to set a student to.
  STATUS.APPLIED,
  STATUS.ENROLLED,
  STATUS.ELIGIBLE,
  STATUS.APPROVED,
  STATUS.COMPLETED,
  STATUS.CANCELED,
];

export const ALL_STUDENT_EDITABLE_STATUSES = [
  // Statuses a student is allowed to set themselves to.
  STATUS.APPLIED,
  STATUS.WITHDRAWN,
];

export const ALL_ESSENTIAL_DOC_STATUSES = [
  // Statuses where essential documents can be submitted.
  STATUS.APPROVED,
  STATUS.ENROLLED,
];

export const READ_ONLY_APPLICATION_STATUSES = [
  // Application responses should be read-only.
  STATUS.CANCELED,
  STATUS.WITHDRAWN,
  STATUS.ELIGIBLE,
  STATUS.APPROVED,
  STATUS.COMPLETED,
  STATUS.ENROLLED,
];

export const EDITABLE_APPLICATION_STATUSES = [STATUS.APPLIED];

export const WITHDRAWABLE_APPLICATION_STATUSES = [
  STATUS.APPLIED,
  STATUS.ENROLLED,
  STATUS.ELIGIBLE,
  STATUS.APPROVED,
];

export const DOCUMENT_SUBMISSION_STATUSES = [STATUS.APPROVED, STATUS.ENROLLED];

// Button text mapping for different status-based actions
export const APPLICATION_ACTION_BUTTON_TEXT = {
  [STATUS.APPLIED]: "Edit Application",
  [STATUS.ENROLLED]: "View Application",
  [STATUS.ELIGIBLE]: "Edit Application",
  [STATUS.APPROVED]: "Edit Application",
  [STATUS.COMPLETED]: "View Application",
  [STATUS.WITHDRAWN]: "Apply Again",
  [STATUS.CANCELED]: "View Application",
};

// Mapping for program action button text when no application exists.
export const PROGRAM_ACTION_BUTTON_TEXT = {
  [PROGRAM_STATUS.OPEN]: "Apply Now",
  [PROGRAM_STATUS.OPENING_SOON]: "Opening Soon",
  [PROGRAM_STATUS.CLOSED]: "Applications Closed",
};

// Helper functions for status handling
export const getStatusSeverity = (status) =>
  ALL_STATUSES[status]?.severity ?? SEVERITY_LEVELS.NORMAL;
export const getStatusLabel = (status) => ALL_STATUSES[status]?.label ?? status;
export const getStatusDescription = (status) =>
  ALL_STATUSES[status]?.description ?? "";

// Theme-based status styling: Expects theme.palette.status to have keys matching the severity strings.
export const getStatusStyle = (theme, severity) => {
  const statusType =
    typeof severity === "string" ? severity : SEVERITY_LEVELS.NORMAL;
  return {
    bg: theme.palette.status[statusType]?.background,
    color: theme.palette.status[statusType]?.main,
  };
};

// Session timeout settings (in milliseconds)
export const SESSION_TIMEOUTS = {
  INACTIVITY: 15 * 60 * 1000, // 15 minutes
  ABSOLUTE: 24 * 60 * 60 * 1000, // 24 hours
  INACTIVITY_TEXT: "15 minutes",
  ABSOLUTE_TEXT: "24 hours",
};

// Academic terms
export const SEMESTERS = ["Summer", "Fall", "Spring"];

export const STATUSES_ADMINS_CAN_EDIT = {
  APPLIED: "Applied",
  ELIGIBLE: "Eligible",
  APPROVED: "Approved",
  ENROLLED: "Enrolled",
  CANCELED: "Canceled",
};

export const STATUSES_FACULTY_CAN_EDIT = {
  APPLIED: "Applied",
  ELIGIBLE: "Eligible",
  APPROVED: "Approved",
};

export const STATUSES_REVIEWERS_CAN_EDIT = {
  APPLIED: "Applied",
  ELIGIBLE: "Eligible",
};

/**
 * Determines the set of application statuses a user can edit based on their role.
 * 
 * - Admins, faculty, and reviewers have specific permissions to edit statuses.
 * - Students (or users without the specified roles) receive an empty object, 
 *   meaning they cannot modify application statuses of other students.
 * 
 * @param {Object} roles - An object containing user roles as boolean values.
 * @returns {Object} - The set of statuses the user can edit, or an empty object if unauthorized.
 */
export const get_all_available_statuses_to_edit = (roles) => {
  if (roles.IS_ADMIN) {
    return STATUSES_ADMINS_CAN_EDIT;
  } else if (roles.IS_FACULTY) {
    return STATUSES_FACULTY_CAN_EDIT;
  } else if (roles.IS_REVIEWER) {
    return STATUSES_REVIEWERS_CAN_EDIT;
  }

  return {};
};

export const DOCUMENT_TEMPLATES = {
  "Acknowledgement of the code of conduct": "/templates/Code_of_Conduct.pdf",
  "Housing questionnaire": "/templates/Housing_Questionnaire.pdf",
  "Medical/health history and immunization records": "/templates/Medical_History_and_Immunizations.pdf",
  "Assumption of risk form": "/templates/Assumption_of_Risk.pdf"
}

export const DOCUMENTS = {
  CODE_OF_CONDUCT: {
    name: "Acknowledgement of the code of conduct",
    path: "/templates/Code_of_Conduct.pdf",
    description: "Acknowledgement of the code of conduct: A document reviewing the code of conduct, and attesting to student's understanding and commitment to abide by same. The student must sign this to participate.",
  },
  HOUSING_QUESTIONNAIRE: {
    name: "Housing questionnaire",
    path: "/templates/Housing_Questionnaire.pdf",
    description: "Housing questionnaire: A set of questions about housing preferences to be reviewed by the faculty lead(s) to help with assigning housing. The student must fill this out.",
  },
  MEDICAL_HISTORY: {
    name: "Medical/health history and immunization records",
    path: "/templates/Medical_History_and_Immunizations.pdf",
    description: "Medical/health history and immunization records: A high-level summary of health status and attestation regarding immunizations. This document in particular is covered by HIPAA (definition 11). The student must fill out and sign this.",
  },
  ASSUMPTION_OF_RISK: {
    name: "Assumption of risk form",
    path: "/templates/Assumption_of_Risk.pdf",
    description: "Assumption of risk form: A document waiving HCC's liability for student participation in the program. The student must sign this to participate.",
  },
}

export const DEFAULT_QUESTIONS = [
  "Why do you want to participate in this study abroad program?",
  "How does this program align with your academic or career goals?",
  "What challenges do you anticipate during this experience, and how will you address them?",
  "Describe a time you adapted to a new or unfamiliar environment.",
  "What unique perspective or contribution will you bring to the group?",
]

// Helper function to copy text to clipboard
export const copyToClipboard = async (text) => {
  if (!text || text.trim() === '') {
    console.error('No text provided to copy');
    return { success: false, error: 'No emails found to copy' };
  }
  
  try {
    await navigator.clipboard.writeText(text);
    return { success: true };
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return { 
      success: false, 
      error: 'Failed to copy to clipboard. Make sure you have clipboard permissions.' 
    };
  }
};

// Helper function to copy emails by status
export const copyEmailsByStatus = async (status, users, programId) => {
  // Handle missing data
  if (!users || !users.length) {
    return { success: false, error: 'No user data available' };
  }
  
  if (!programId) {
    return { success: false, error: 'No program ID provided' };
  }
  
  // Filter users by program and status
  const filteredUsers = users.filter(user => 
    user.programId === programId && 
    (status === 'total' 
      ? ['applied', 'approved', 'enrolled', 'eligible'].includes(user.status.toLowerCase())
      : user.status.toLowerCase() === status.toLowerCase())
  );

  if (filteredUsers.length === 0) {
    return { 
      success: false, 
      error: `No emails found for ${status === 'total' ? 'active users' : status} status` 
    };
  }

  // Join emails with semicolon for Outlook
  const emails = filteredUsers.map(user => user.email).join(';');
  return copyToClipboard(emails);
};