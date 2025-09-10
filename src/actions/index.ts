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

// Department Management Actions (Admin Only)
export {
  createDepartment,
  getDepartments,
  updateDepartment,
  deleteDepartment,
  getDepartmentDetails,
  getAvailableDoctors,
  type CreateDepartmentData,
  type UpdateDepartmentData,
} from "./department-actions";

// Doctor Management Actions (Admin Only)
export {
  createDoctor,
  getDoctors,
  updateDoctor,
  deleteDoctor,
  toggleDoctorBan,
  getDoctorDetails,
  type CreateDoctorData,
  type UpdateDoctorData,
} from "./doctor-actions";

// Patient Management Actions (Admin Only)
export {
  createPatient,
  getPatients,
  updatePatient,
  deletePatient,
  togglePatientBan,
  getPatientDetails,
  type CreatePatientData,
  type UpdatePatientData,
} from "./patient-actions";

// Staff Management Actions (Admin Only)
export {
  createStaff,
  getStaffs,
  updateStaff,
  deleteStaff,
  toggleStaffBan,
  getStaffDetails,
  getDepartments as getStaffDepartments,
  getSupervisors,
  type CreateStaffData,
  type UpdateStaffData,
} from "./staff-actions";

// Reports & Analytics Actions
export {
  generateAppointmentReport,
  generatePatientReport,
  generateRevenueReport,
  getReports,
  getDashboardStatistics,
  getRecentActivities,
  getDepartmentStats,
  deleteReport,
  type GenerateReportData,
} from "./report-actions";
