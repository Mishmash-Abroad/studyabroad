// Status severity levels
export const SEVERITY_LEVELS = {
    NORMAL: 'info',    // Default/neutral status
    GOOD: 'success',   // Positive/success status
    WARNING: 'warning',// Warning/attention needed
    CRITICAL: 'error'  // Critical/error status
  };
  
  // Status Enums - Single source of truth for status names
  export const STATUS = {
    APPLIED: 'Applied',
    ENROLLED: 'Enrolled',
    ELIGIBLE: 'Eligible',
    APPROVED: 'Approved',
    COMPLETED: 'Completed',
    WITHDRAWN: 'Withdrawn',
    CANCELED: 'Canceled'
  };
  
  // Program status enums
  export const PROGRAM_STATUS = {
    OPEN: 'Open',
    OPENING_SOON: 'Opening Soon',
    CLOSED: 'Closed'
  };
  
  // All possible statuses with their properties
  export const ALL_STATUSES = {
    [STATUS.APPLIED]: {
      severity: SEVERITY_LEVELS.NORMAL,
      description: 'Application has been submitted'
    },
    [STATUS.ENROLLED]: {
      severity: SEVERITY_LEVELS.GOOD,
      description: 'Successfully enrolled in program'
    },
    [STATUS.ELIGIBLE]: {
      severity: SEVERITY_LEVELS.NORMAL,
      description: 'Eligible for application'
    },
    [STATUS.APPROVED]: {
      severity: SEVERITY_LEVELS.GOOD,
      description: 'Application has been approved'
    },
    [STATUS.COMPLETED]: {
      severity: SEVERITY_LEVELS.GOOD,
      description: 'Application process has been completed'
    },
    [STATUS.WITHDRAWN]: {
      severity: SEVERITY_LEVELS.WARNING,
      description: 'Application withdrawn by applicant'
    },
    [STATUS.CANCELED]: {
      severity: SEVERITY_LEVELS.CRITICAL,
      description: 'Application has been canceled'
    }
  };
  
  // Program statuses with their properties
  export const PROGRAM_STATUSES = {
    [PROGRAM_STATUS.OPEN]: {
      severity: SEVERITY_LEVELS.GOOD,
      description: 'Program is accepting applications'
    },
    [PROGRAM_STATUS.OPENING_SOON]: {
      severity: SEVERITY_LEVELS.NORMAL,
      description: 'Program will open for applications soon'
    },
    [PROGRAM_STATUS.CLOSED]: {
      severity: SEVERITY_LEVELS.CRITICAL,
      description: 'Program is no longer accepting applications'
    }
  };
  
  // Derived status lists for different contexts
  export const ALL_ADMIN_EDITABLE_STATUSES = [ // Statuses an admin is allowed to set a student to.
    STATUS.APPLIED,
    STATUS.ENROLLED,
    STATUS.ELIGIBLE,
    STATUS.APPROVED,
    STATUS.COMPLETED,
    STATUS.CANCELED
  ];
  
  export const ALL_STUDENT_EDITABLE_STATUSES = [ // Statuses a student is allowed to set themselves to.
    STATUS.APPLIED,
    STATUS.WITHDRAWN
  ];
  
  export const ALL_ESSENTIAL_DOC_STATUSES = [ // Statuses where essential documents can be submitted.
    STATUS.APPROVED,
    STATUS.ENROLLED
  ];
  
  export const READ_ONLY_APPLICATION_STATUSES = [ // Application responses should be read-only.
    STATUS.CANCELED,
    STATUS.WITHDRAWN,
    STATUS.ELIGIBLE,
    STATUS.APPROVED,
    STATUS.COMPLETED,
    STATUS.ENROLLED
  ];

  export const DOCUMENT_SUBMISSION_STATUSES = [ // Statuses where documents can be submitted.
    STATUS.ELIGIBLE,
    STATUS.APPLIED,
  ];
  
  export const EDITABLE_APPLICATION_STATUSES = [ // Application responses are editable only when in these statuses.
    STATUS.APPLIED
  ];
  
  // Mapping for application action button text.
  // When an application exists, the text is pulled from here.
  export const APPLICATION_ACTION_BUTTON_TEXT = {
    [STATUS.APPLIED]: 'Edit Application',
    [STATUS.ENROLLED]: 'View Application',
    [STATUS.ELIGIBLE]: 'Edit Application',
    [STATUS.APPROVED]: 'Edit Application',
    [STATUS.COMPLETED]: 'View Application',
    [STATUS.WITHDRAWN]: 'Apply Again',
    [STATUS.CANCELED]: 'View Application'
  };
  
  // Mapping for program action button text when no application exists.
  export const PROGRAM_ACTION_BUTTON_TEXT = {
    [PROGRAM_STATUS.OPEN]: 'Apply Now',
    [PROGRAM_STATUS.OPENING_SOON]: 'Opening Soon',
    [PROGRAM_STATUS.CLOSED]: 'Applications Closed'
  };
  
  // Helper functions for status handling
  export const getStatusSeverity = (status) => ALL_STATUSES[status]?.severity ?? SEVERITY_LEVELS.NORMAL;
  export const getStatusLabel = (status) => ALL_STATUSES[status]?.label ?? status;
  export const getStatusDescription = (status) => ALL_STATUSES[status]?.description ?? '';
  
  // Theme-based status styling: Expects theme.palette.status to have keys matching the severity strings.
  export const getStatusStyle = (theme, severity) => {
    const statusType = typeof severity === 'string' ? severity : SEVERITY_LEVELS.NORMAL;
    return {
      bg: theme.palette.status[statusType]?.background,
      color: theme.palette.status[statusType]?.main
    };
  };
  
  // Session timeout settings (in milliseconds)
  export const SESSION_TIMEOUTS = {
    INACTIVITY: 15 * 60 * 1000,  // 15 minutes
    ABSOLUTE: 24 * 60 * 60 * 1000, // 24 hours
    INACTIVITY_TEXT: '15 minutes',
    ABSOLUTE_TEXT: '24 hours'
  };
  
  // Academic terms
  export const SEMESTERS = [
    "Summer",
    "Fall",
    "Spring"
  ];  