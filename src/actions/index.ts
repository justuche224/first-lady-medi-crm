/**
 * Server Actions Index
 *
 * Central export file for all server actions in the Medical CRM system.
 * Import actions from this file for easy access throughout the application.
 */

// User Management Actions (Admin Only)
export {
  createUser,
  getUsers,
  updateUser,
  toggleUserBan,
  deleteUser,
  getUserDetails,
  type CreateUserData,
} from "./user-actions";

// Appointment Management Actions
export {
  createAppointment,
  getAppointments,
  updateAppointment,
  cancelAppointment,
  getAppointmentDetails,
  getAvailableSlots,
  type CreateAppointmentData,
  type UpdateAppointmentData,
} from "./appointment-actions";

// Medical Records Actions
export {
  createMedicalRecord,
  getMedicalRecords,
  updateMedicalRecord,
  deleteMedicalRecord,
  getMedicalRecordDetails,
  getPatientMedicalSummary,
  type CreateMedicalRecordData,
  type UpdateMedicalRecordData,
} from "./medical-actions";

// Medication Management Actions
export {
  prescribeMedication,
  getMedications,
  updateMedication,
  refillMedication,
  discontinueMedication,
  getMedicationDetails,
  getMedicationsRequiringAttention,
  type CreateMedicationData,
  type UpdateMedicationData,
} from "./medication-actions";

// Lab Results Actions
export {
  orderLabTest,
  getLabResults,
  updateLabResult,
  getPendingLabResultsCount,
  type CreateLabResultData,
  type UpdateLabResultData,
} from "./lab-actions";

// Feedback Management Actions
export {
  submitFeedback,
  getFeedback,
  updateFeedback,
  assignFeedback,
  getFeedbackStatistics,
  type CreateFeedbackData,
  type UpdateFeedbackData,
} from "./feedback-actions";

// Messaging Actions
export {
  sendMessage,
  getMessages,
  markMessageAsRead,
  markAllMessagesAsRead,
  getUnreadMessagesCount,
  deleteMessage,
  type SendMessageData,
} from "./message-actions";

// Reports & Analytics Actions
export {
  generateAppointmentReport,
  generatePatientReport,
  generateRevenueReport,
  getReports,
  getDashboardStatistics,
  deleteReport,
  type GenerateReportData,
} from "./report-actions";
