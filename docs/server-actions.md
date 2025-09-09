# Medical CRM Server Actions Documentation

## Overview

This document provides comprehensive documentation for all server actions in the Medical CRM system. Server actions are Next.js 13+ server functions that handle data operations with proper authentication and authorization.

## Authentication & Authorization

All server actions require authentication via Better Auth. Access control is role-based:

- **Admin**: Full system access, user management
- **Doctor**: Patient care, medical records, prescriptions
- **Patient**: Personal health data access
- **Staff**: Administrative functions, feedback management

## Server Actions by Category

### 🔐 User Management Actions (`user-actions.ts`)

#### `createUser(userData: CreateUserData)`

**Access**: Admin Only
**Purpose**: Creates new users (staff, doctors, patients)

```typescript
const result = await createUser({
  email: "john.doe@example.com",
  password: "securePassword123",
  name: "John Doe",
  role: "patient",
  dateOfBirth: new Date("1990-01-01"),
  phone: "+1234567890",
  // ... other fields
});
```

#### `getUsers(page?, limit?, search?)`

**Access**: Admin Only
**Purpose**: Retrieves paginated user list

```typescript
const { success, users, pagination } = await getUsers(1, 20, "john");
```

#### `updateUser(userId, updates)`

**Access**: Admin Only
**Purpose**: Updates user profile information

#### `toggleUserBan(userId, banned, banReason?)`

**Access**: Admin Only
**Purpose**: Bans/unbans users from the system

#### `deleteUser(userId)`

**Access**: Admin Only
**Purpose**: Permanently deletes a user account

#### `getUserDetails(userId)`

**Access**: Admin Only
**Purpose**: Retrieves complete user information with role-specific data

### 📅 Appointment Management Actions (`appointment-actions.ts`)

#### `createAppointment(appointmentData)`

**Access**: Patients (own), Doctors (their patients), Admins (all)
**Purpose**: Creates new appointment

```typescript
const result = await createAppointment({
  patientId: 123,
  doctorId: 456,
  appointmentDate: new Date("2024-01-15"),
  appointmentTime: "14:30",
  type: "consultation",
  reason: "Annual checkup",
});
```

#### `getAppointments(page?, limit?, status?, dateRange?)`

**Access**: Role-based (own appointments for patients, assigned for doctors)
**Purpose**: Retrieves appointments with filtering

```typescript
const { success, appointments, pagination } = await getAppointments(
  1,
  20,
  "scheduled",
  { start: new Date("2024-01-01"), end: new Date("2024-01-31") }
);
```

#### `updateAppointment(appointmentId, updates)`

**Access**: Patients (limited), Doctors (their appointments), Admins (all)
**Purpose**: Updates appointment details

#### `cancelAppointment(appointmentId, cancelReason?)`

**Access**: Appointment owners or admins
**Purpose**: Cancels an appointment

#### `getAppointmentDetails(appointmentId)`

**Access**: Appointment participants
**Purpose**: Retrieves complete appointment information

#### `getAvailableSlots(doctorId, date)`

**Access**: All authenticated users
**Purpose**: Returns available time slots for booking

### 📋 Medical Records Actions (`medical-actions.ts`)

#### `createMedicalRecord(recordData)`

**Access**: Doctors Only
**Purpose**: Creates medical record entries

```typescript
const result = await createMedicalRecord({
  patientId: 123,
  recordType: "consultation",
  title: "Annual Physical Exam",
  description: "Complete physical examination",
  diagnosis: "Hypertension Stage 1",
  treatment: "Lifestyle modifications, medication",
  vitalSigns: JSON.stringify({ bp: "140/90", hr: 72 }),
});
```

#### `getMedicalRecords(patientId?, page?, limit?, recordType?)`

**Access**: Patients (own), Doctors (their patients), Admins (all)
**Purpose**: Retrieves medical records with filtering

#### `updateMedicalRecord(recordId, updates)`

**Access**: Record creator (doctor) only
**Purpose**: Updates medical record content

#### `deleteMedicalRecord(recordId)`

**Access**: Record creator (doctor) only
**Purpose**: Deletes medical record

#### `getMedicalRecordDetails(recordId)`

**Access**: Authorized users
**Purpose**: Retrieves complete medical record with all data

#### `getPatientMedicalSummary(patientId)`

**Access**: Patient (own), Doctor (their patients), Admin
**Purpose**: Provides patient medical history summary

### 💊 Medication Management Actions (`medication-actions.ts`)

#### `prescribeMedication(medicationData)`

**Access**: Doctors Only
**Purpose**: Creates medication prescriptions

```typescript
const result = await prescribeMedication({
  patientId: 123,
  name: "Lisinopril",
  dosage: "10mg",
  frequency: "Once daily",
  duration: "30 days",
  instructions: "Take with food",
  startDate: new Date(),
  refills: 3,
});
```

#### `getMedications(patientId?, page?, limit?, status?)`

**Access**: Patients (own), Doctors (their patients), Admins (all)
**Purpose**: Retrieves medications with filtering

#### `updateMedication(medicationId, updates)`

**Access**: Prescribing doctor only
**Purpose**: Updates medication details

#### `refillMedication(medicationId, refills)`

**Access**: Patients (own), Prescribing doctor
**Purpose**: Processes medication refills

#### `discontinueMedication(medicationId, reason?)`

**Access**: Prescribing doctor only
**Purpose**: Discontinues medication with reason

#### `getMedicationDetails(medicationId)`

**Access**: Authorized users
**Purpose**: Retrieves complete medication information

#### `getMedicationsRequiringAttention()`

**Access**: All authenticated users
**Purpose**: Returns medications needing attention (low refills, expiring)

### 🧪 Lab Results Actions (`lab-actions.ts`)

#### `orderLabTest(testData)`

**Access**: Doctors Only
**Purpose**: Orders lab tests for patients

```typescript
const result = await orderLabTest({
  patientId: 123,
  testName: "Complete Blood Count",
  testCategory: "blood",
  testDate: new Date(),
});
```

#### `getLabResults(patientId?, page?, limit?, status?)`

**Access**: Patients (own), Doctors (their patients), Admins (all)
**Purpose**: Retrieves lab results with filtering

#### `updateLabResult(resultId, updates)`

**Access**: Ordering doctor or admins
**Purpose**: Updates lab test results and status

#### `getPendingLabResultsCount()`

**Access**: Doctors Only
**Purpose**: Returns count of pending lab results for review

### 💬 Feedback Management Actions (`feedback-actions.ts`)

#### `submitFeedback(feedbackData)`

**Access**: Patients Only
**Purpose**: Submits feedback/complaints/suggestions

```typescript
const result = await submitFeedback({
  subject: "Long wait times",
  message: "Waited over 2 hours for appointment",
  type: "complaint",
  priority: "high",
  departmentId: 1,
});
```

#### `getFeedback(page?, limit?, status?, type?, priority?)`

**Access**: Patients (own), Staff (assigned), Admins (all)
**Purpose**: Retrieves feedback with filtering

#### `updateFeedback(feedbackId, updates)`

**Access**: Staff/Admins Only
**Purpose**: Updates feedback status and response

#### `assignFeedback(feedbackId, assignedToUserId)`

**Access**: Admins Only
**Purpose**: Assigns feedback to staff members

#### `getFeedbackStatistics()`

**Access**: Staff/Admins
**Purpose**: Returns feedback statistics for dashboard

### 📨 Messaging Actions (`message-actions.ts`)

#### `sendMessage(messageData)`

**Access**: All authenticated users
**Purpose**: Sends messages to other users

```typescript
const result = await sendMessage({
  recipientId: "user-123",
  subject: "Appointment Reminder",
  message: "Your appointment is tomorrow at 2 PM",
  type: "appointment",
  priority: "normal",
});
```

#### `getMessages(page?, limit?, type?, unreadOnly?)`

**Access**: Message participants
**Purpose**: Retrieves user messages with filtering

#### `markMessageAsRead(messageId)`

**Access**: Message recipient only
**Purpose**: Marks message as read

#### `markAllMessagesAsRead()`

**Access**: Current user
**Purpose**: Marks all messages as read

#### `getUnreadMessagesCount()`

**Access**: Current user
**Purpose**: Returns count of unread messages

#### `deleteMessage(messageId)`

**Access**: Message sender only
**Purpose**: Deletes sent message

### 📊 Reports & Analytics Actions (`report-actions.ts`)

#### `generateAppointmentReport(dateRange)`

**Access**: Admins/Staff Only
**Purpose**: Generates appointment statistics report

```typescript
const result = await generateAppointmentReport({
  start: new Date("2024-01-01"),
  end: new Date("2024-01-31"),
});
```

#### `generatePatientReport(dateRange)`

**Access**: Admins/Staff Only
**Purpose**: Generates patient statistics report

#### `generateRevenueReport(dateRange)`

**Access**: Admins Only
**Purpose**: Generates financial/revenue report

#### `getReports(page?, limit?, type?)`

**Access**: Admins/Staff Only
**Purpose**: Retrieves generated reports

#### `getDashboardStatistics()`

**Access**: Admins Only
**Purpose**: Returns key metrics for admin dashboard

#### `deleteReport(reportId)`

**Access**: Admins Only
**Purpose**: Deletes generated reports

## Error Handling

All server actions return a consistent response format:

```typescript
{
  success: boolean;
  error?: string;
  // ... other data
}
```

## Security Features

### Authentication

- All actions require valid Better Auth session
- Automatic session validation

### Authorization

- Role-based access control (RBAC)
- Granular permissions per action
- Access denied errors for unauthorized operations

### Data Validation

- Input sanitization
- Type validation using TypeScript
- Business rule enforcement

### Audit Logging

- Critical operations are logged
- User actions tracked for compliance

## Usage Examples

### Patient Booking Appointment

```typescript
// Client-side usage
const result = await createAppointment({
  patientId: patientId,
  doctorId: selectedDoctorId,
  appointmentDate: selectedDate,
  appointmentTime: selectedTime,
  type: "consultation",
  reason: "Regular checkup",
});

if (result.success) {
  // Redirect to appointments page
  router.push("/appointments");
} else {
  // Show error message
  setError(result.error);
}
```

### Doctor Creating Medical Record

```typescript
const result = await createMedicalRecord({
  patientId: patientId,
  appointmentId: appointmentId,
  recordType: "consultation",
  title: "Follow-up Visit",
  description: "Patient reports improvement in symptoms",
  diagnosis: "Viral infection - resolving",
  treatment: "Continue current medication",
  vitalSigns: JSON.stringify({
    temperature: 98.6,
    bloodPressure: "120/80",
    heartRate: 72,
  }),
});
```

### Admin Generating Report

```typescript
const result = await generateAppointmentReport({
  start: new Date("2024-01-01"),
  end: new Date("2024-01-31"),
});

if (result.success) {
  // Report data available in result.data
  console.log("Report generated:", result.data);
}
```

## Best Practices

### Client-Side Usage

1. Always handle loading states
2. Implement proper error handling
3. Use optimistic updates for better UX
4. Validate inputs before submission

### Error Handling

```typescript
try {
  const result = await serverAction(data);
  if (result.success) {
    // Handle success
  } else {
    // Handle server error
    console.error(result.error);
  }
} catch (error) {
  // Handle network/client errors
  console.error("Network error:", error);
}
```

### Performance Considerations

- Use pagination for large datasets
- Implement caching where appropriate
- Batch operations when possible
- Monitor query performance

## Testing

Server actions can be tested using Next.js testing utilities:

```typescript
import { createAppointment } from "@/actions/appointment-actions";

// Unit test example
test("creates appointment successfully", async () => {
  const result = await createAppointment(mockAppointmentData);
  expect(result.success).toBe(true);
  expect(result.appointment).toBeDefined();
});
```

## Maintenance

### Adding New Actions

1. Create action in appropriate file
2. Add TypeScript types
3. Implement authentication/authorization
4. Add input validation
5. Update this documentation
6. Add client-side usage examples

### Modifying Existing Actions

1. Update action signature carefully
2. Ensure backward compatibility
3. Update client-side code
4. Test thoroughly
5. Update documentation

## Support

For questions or issues with server actions:

1. Check this documentation first
2. Review error messages for specific guidance
3. Ensure proper authentication
4. Verify user permissions
5. Check network connectivity for client-side issues
