# Medical CRM System - Class Diagram

## Overview

This document presents the class diagram for the Medical CRM system, showing the main entities, their attributes, methods, and relationships.

## Main Classes

### User (Abstract Base Class)

```typescript
class User {
  +id: string
  +name: string
  +email: string
  +emailVerified: boolean
  +image: string
  +role: Role
  +banned: boolean
  +banReason: string
  +banExpires: Date
  +createdAt: Date
  +updatedAt: Date

  +login(): boolean
  +logout(): void
  +updateProfile(): void
  +changePassword(): void
}
```

### Patient

```typescript
class Patient {
  +id: number
  +userId: string
  +dateOfBirth: Date
  +gender: string
  +phone: string
  +address: string
  +emergencyContact: string
  +emergencyPhone: string
  +bloodType: string
  +allergies: string
  +medicalHistory: string
  +insuranceProvider: string
  +insuranceNumber: string
  +healthScore: number
  +createdAt: Date
  +updatedAt: Date

  +viewMedicalRecords(): MedicalRecord[]
  +viewAppointments(): Appointment[]
  +viewMedications(): Medication[]
  +viewLabResults(): LabResult[]
  +bookAppointment(): boolean
  +submitFeedback(): boolean
  +sendMessage(): boolean
}
```

### Doctor

```typescript
class Doctor {
  +id: number
  +userId: string
  +licenseNumber: string
  +specialty: string
  +departmentId: number
  +yearsOfExperience: number
  +education: string
  +certifications: string
  +availability: string
  +consultationFee: decimal
  +rating: decimal
  +totalPatients: number
  +createdAt: Date
  +updatedAt: Date

  +viewPatients(): Patient[]
  +viewSchedule(): Appointment[]
  +createMedicalRecord(): MedicalRecord
  +prescribeMedication(): Medication
  +reviewLabResults(): LabResult[]
  +respondToMessage(): boolean
}
```

### Staff

```typescript
class Staff {
  +id: number
  +userId: string
  +employeeId: string
  +departmentId: number
  +position: string
  +hireDate: Date
  +salary: decimal
  +supervisorId: string
  +createdAt: Date
  +updatedAt: Date

  +viewSchedule(): any[]
  +updatePatientRecord(): boolean
  +manageAppointment(): boolean
  +assistPatient(): boolean
}
```

### Department

```typescript
class Department {
  +id: number
  +name: string
  +description: string
  +headDoctorId: string
  +createdAt: Date
  +updatedAt: Date

  +getDoctors(): Doctor[]
  +getStaff(): Staff[]
  +getPatients(): Patient[]
  +getAppointments(): Appointment[]
}
```

### Appointment

```typescript
class Appointment {
  +id: number
  +patientId: number
  +doctorId: number
  +appointmentDate: Date
  +appointmentTime: string
  +duration: number
  +type: string
  +status: AppointmentStatus
  +reason: string
  +symptoms: string
  +notes: string
  +diagnosis: string
  +prescription: string
  +followUpRequired: boolean
  +followUpDate: Date
  +cancelledBy: string
  +cancelReason: string
  +rescheduledFrom: number
  +createdAt: Date
  +updatedAt: Date

  +schedule(): boolean
  +confirm(): boolean
  +cancel(): boolean
  +reschedule(): boolean
  +complete(): boolean
}
```

### MedicalRecord

```typescript
class MedicalRecord {
  +id: number
  +patientId: number
  +doctorId: number
  +appointmentId: number
  +recordType: string
  +title: string
  +description: string
  +diagnosis: string
  +treatment: string
  +medications: string
  +labTests: string
  +vitalSigns: string
  +attachments: string
  +isConfidential: boolean
  +createdAt: Date
  +updatedAt: Date

  +create(): boolean
  +update(): boolean
  +delete(): boolean
  +addAttachment(): boolean
}
```

### Medication

```typescript
class Medication {
  +id: number
  +patientId: number
  +prescribedBy: number
  +appointmentId: number
  +name: string
  +genericName: string
  +dosage: string
  +frequency: string
  +duration: string
  +instructions: string
  +startDate: Date
  +endDate: Date
  +refills: number
  +sideEffects: string
  +status: string
  +createdAt: Date
  +updatedAt: Date

  +prescribe(): boolean
  +refill(): boolean
  +discontinue(): boolean
  +updateStatus(): boolean
}
```

### LabResult

```typescript
class LabResult {
  +id: number
  +patientId: number
  +doctorId: number
  +appointmentId: number
  +testName: string
  +testCategory: string
  +testDate: Date
  +resultDate: Date
  +status: string
  +results: string
  +normalRange: string
  +interpretation: string
  +notes: string
  +attachments: string
  +reviewedBy: number
  +reviewedAt: Date
  +createdAt: Date
  +updatedAt: Date

  +order(): boolean
  +updateResults(): boolean
  +review(): boolean
  +addAttachment(): boolean
}
```

### Feedback

```typescript
class Feedback {
  +id: number
  +patientId: number
  +type: FeedbackType
  +subject: string
  +message: string
  +priority: PriorityLevel
  +status: string
  +assignedTo: string
  +departmentId: number
  +response: string
  +respondedBy: string
  +respondedAt: Date
  +rating: number
  +createdAt: Date
  +updatedAt: Date

  +submit(): boolean
  +assign(): boolean
  +respond(): boolean
  +close(): boolean
}
```

### Message

```typescript
class Message {
  +id: number
  +senderId: string
  +recipientId: string
  +type: MessageType
  +subject: string
  +message: string
  +priority: PriorityLevel
  +isRead: boolean
  +readAt: Date
  +attachments: string
  +relatedAppointmentId: number
  +relatedFeedbackId: number
  +createdAt: Date
  +updatedAt: Date

  +send(): boolean
  +markAsRead(): boolean
  +reply(): Message
  +delete(): boolean
}
```

### Notification

```typescript
class Notification {
  +id: number
  +userId: string
  +type: string
  +title: string
  +message: string
  +priority: PriorityLevel
  +isRead: boolean
  +readAt: Date
  +actionUrl: string
  +expiresAt: Date
  +createdAt: Date

  +send(): boolean
  +markAsRead(): boolean
  +dismiss(): boolean
}
```

## Relationships

### Inheritance Relationships

- `Patient` --|> `User`
- `Doctor` --|> `User`
- `Staff` --|> `User`

### Association Relationships

#### One-to-One

- `User` -- `Patient` (1:1)
- `User` -- `Doctor` (1:1)
- `User` -- `Staff` (1:1)

#### One-to-Many

- `Department` -- `Doctor` (1:N)
- `Department` -- `Staff` (1:N)
- `Doctor` -- `Appointment` (1:N)
- `Patient` -- `Appointment` (1:N)
- `Patient` -- `MedicalRecord` (1:N)
- `Patient` -- `Medication` (1:N)
- `Patient` -- `LabResult` (1:N)
- `Patient` -- `Feedback` (1:N)
- `User` -- `Message` (sender) (1:N)
- `User` -- `Message` (recipient) (1:N)
- `User` -- `Notification` (1:N)

#### Many-to-One

- `Appointment` -- `MedicalRecord` (N:1)
- `Appointment` -- `Medication` (N:1)
- `Appointment` -- `LabResult` (N:1)

### Aggregation Relationships

- `Department` ◇-- `Patient` (through appointments)
- `Department` ◇-- `Appointment`

### Composition Relationships

- `Appointment` ◆-- `MedicalRecord`
- `Appointment` ◆-- `LabResult`

## Key Design Patterns

### Repository Pattern

- Each entity has corresponding repository classes for data access
- Abstracts database operations
- Enables easy testing and mocking

### Factory Pattern

- Used for creating complex objects (e.g., Appointment factory)
- Handles object creation logic

### Observer Pattern

- Notification system for real-time updates
- Message broadcasting to multiple recipients

### Strategy Pattern

- Different report generation strategies
- Various appointment scheduling algorithms

## Data Integrity Constraints

### Primary Keys

- All entities have auto-incrementing integer primary keys
- User table uses string UUID for distributed systems compatibility

### Foreign Key Constraints

- Cascade delete for user-related entities
- Restrict delete for critical medical data
- Null allowed for optional relationships

### Business Rules

- Patients can only view their own records
- Doctors can only access assigned patients
- Appointments cannot be double-booked
- Medications require valid prescriptions

## Security Considerations

- Role-based access control (RBAC)
- Data encryption for sensitive fields
- Audit logging for all critical operations
- Input validation and sanitization
