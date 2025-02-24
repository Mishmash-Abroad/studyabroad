export const ALL_STATUSES = [
    "Applied",
    "Enrolled",
    "Eligible",
    "Approved",
    "Completed",
    "Withdrawn",
    "Canceled",
]

export const ALL_ADMIN_EDITABLE_STATUSES = [
    "Applied",
    "Enrolled",
    "Eligible",
    "Approved",
    "Completed",
    "Canceled",
]

export const ALL_ESSENTIAL_DOC_STATUSES = [
    "Approved",
    "Enrolled",
]

export const READ_ONLY_APPLICATION_STATUSES = [
    "Canceled",
    "Withdrawn",
    "Completed",
]

export const SEMESTERS = [
    "Summer",
    "Fall",
    "Spring",
]

// Session timeout settings (in milliseconds)
export const SESSION_TIMEOUTS = {
  INACTIVITY: 15 * 60 * 1000,  // 15 minutes
  ABSOLUTE: 24 * 60 * 60 * 1000,   // 24 hours
  INACTIVITY_TEXT: '15 minutes',
  ABSOLUTE_TEXT: '24 hours'
};