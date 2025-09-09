import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  decimal,
  serial,
  varchar,
  date,
} from "drizzle-orm/pg-core";

export const roles = ["admin", "doctor", "patient", "staff"] as const;
export const appointmentStatus = [
  "scheduled",
  "confirmed",
  "completed",
  "cancelled",
  "no_show",
] as const;
export const priorityLevels = ["low", "normal", "high", "urgent"] as const;
export const feedbackTypes = [
  "complaint",
  "suggestion",
  "praise",
  "inquiry",
] as const;
export const messageTypes = [
  "appointment",
  "medication",
  "result",
  "general",
  "urgent",
] as const;

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  role: text("role").$type<(typeof roles)[number]>(),
  banned: boolean("banned").default(false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
});

// Departments table
export const departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  headDoctorId: text("head_doctor_id").references(() => user.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

// Patients table (extended user info)
export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  dateOfBirth: date("date_of_birth"),
  gender: varchar("gender", { length: 20 }),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  emergencyContact: varchar("emergency_contact", { length: 100 }),
  emergencyPhone: varchar("emergency_phone", { length: 20 }),
  bloodType: varchar("blood_type", { length: 10 }),
  allergies: text("allergies"),
  medicalHistory: text("medical_history"),
  insuranceProvider: varchar("insurance_provider", { length: 100 }),
  insuranceNumber: varchar("insurance_number", { length: 50 }),
  healthScore: integer("health_score").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

// Doctors table
export const doctors = pgTable("doctors", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  licenseNumber: varchar("license_number", { length: 50 }).notNull(),
  specialty: varchar("specialty", { length: 100 }).notNull(),
  departmentId: integer("department_id").references(() => departments.id),
  yearsOfExperience: integer("years_of_experience").default(0),
  education: text("education"),
  certifications: text("certifications"),
  availability: text("availability"), // JSON string for schedule
  consultationFee: decimal("consultation_fee", { precision: 10, scale: 2 }),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  totalPatients: integer("total_patients").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

// Staff table (nurses, administrators, etc.)
export const staff = pgTable("staff", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  employeeId: varchar("employee_id", { length: 20 }).notNull().unique(),
  departmentId: integer("department_id").references(() => departments.id),
  position: varchar("position", { length: 100 }).notNull(),
  hireDate: date("hire_date").notNull(),
  salary: decimal("salary", { precision: 12, scale: 2 }),
  supervisorId: text("supervisor_id").references(() => user.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  impersonatedBy: text("impersonated_by"),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

// Appointments table
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id")
    .notNull()
    .references(() => patients.id),
  doctorId: integer("doctor_id")
    .notNull()
    .references(() => doctors.id),
  appointmentDate: date("appointment_date").notNull(),
  appointmentTime: varchar("appointment_time", { length: 20 }).notNull(),
  duration: integer("duration").default(30), // minutes
  type: varchar("type", { length: 50 }).notNull(), // consultation, follow-up, checkup, etc.
  status: text("status")
    .$type<(typeof appointmentStatus)[number]>()
    .default("scheduled"),
  reason: text("reason"),
  symptoms: text("symptoms"),
  notes: text("notes"),
  diagnosis: text("diagnosis"),
  prescription: text("prescription"),
  followUpRequired: boolean("follow_up_required").default(false),
  followUpDate: date("follow_up_date"),
  cancelledBy: text("cancelled_by"), // user id who cancelled
  cancelReason: text("cancel_reason"),
  rescheduledFrom: integer("rescheduled_from"), // reference to original appointment
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

// Medical Records table
export const medicalRecords = pgTable("medical_records", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id")
    .notNull()
    .references(() => patients.id),
  doctorId: integer("doctor_id").references(() => doctors.id),
  appointmentId: integer("appointment_id").references(() => appointments.id),
  recordType: varchar("record_type", { length: 50 }).notNull(), // consultation, diagnosis, treatment, etc.
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  diagnosis: text("diagnosis"),
  treatment: text("treatment"),
  medications: text("medications"), // JSON array of medications
  labTests: text("lab_tests"), // JSON array of requested tests
  vitalSigns: text("vital_signs"), // JSON object with BP, heart rate, temperature, etc.
  attachments: text("attachments"), // JSON array of file paths
  isConfidential: boolean("is_confidential").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

// Medications table
export const medications = pgTable("medications", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id")
    .notNull()
    .references(() => patients.id),
  prescribedBy: integer("prescribed_by")
    .notNull()
    .references(() => doctors.id),
  appointmentId: integer("appointment_id").references(() => appointments.id),
  name: varchar("name", { length: 100 }).notNull(),
  genericName: varchar("generic_name", { length: 100 }),
  dosage: varchar("dosage", { length: 50 }).notNull(),
  frequency: varchar("frequency", { length: 50 }).notNull(),
  duration: varchar("duration", { length: 50 }),
  instructions: text("instructions"),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  refills: integer("refills").default(0),
  sideEffects: text("side_effects"),
  status: varchar("status", { length: 20 }).default("active"), // active, completed, discontinued
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

// Lab Results table
export const labResults = pgTable("lab_results", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id")
    .notNull()
    .references(() => patients.id),
  doctorId: integer("doctor_id").references(() => doctors.id),
  appointmentId: integer("appointment_id").references(() => appointments.id),
  testName: varchar("test_name", { length: 100 }).notNull(),
  testCategory: varchar("test_category", { length: 50 }).notNull(), // blood, urine, imaging, etc.
  testDate: date("test_date").notNull(),
  resultDate: date("result_date"),
  status: varchar("status", { length: 20 }).default("pending"), // pending, completed, reviewed
  results: text("results"), // JSON object with test results
  normalRange: text("normal_range"),
  interpretation: text("interpretation"),
  notes: text("notes"),
  attachments: text("attachments"), // JSON array of file paths
  reviewedBy: integer("reviewed_by").references(() => doctors.id),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

// Feedback table
export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id")
    .notNull()
    .references(() => patients.id),
  type: text("type").$type<(typeof feedbackTypes)[number]>().notNull(),
  subject: varchar("subject", { length: 200 }).notNull(),
  message: text("message").notNull(),
  priority: text("priority")
    .$type<(typeof priorityLevels)[number]>()
    .default("normal"),
  status: varchar("status", { length: 20 }).default("open"), // open, in_progress, resolved, closed
  assignedTo: text("assigned_to").references(() => user.id),
  departmentId: integer("department_id").references(() => departments.id),
  response: text("response"),
  respondedBy: text("responded_by").references(() => user.id),
  respondedAt: timestamp("responded_at"),
  rating: integer("rating"), // 1-5 star rating
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

// Messages table (internal communication)
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: text("sender_id")
    .notNull()
    .references(() => user.id),
  recipientId: text("recipient_id")
    .notNull()
    .references(() => user.id),
  type: text("type").$type<(typeof messageTypes)[number]>().default("general"),
  subject: varchar("subject", { length: 200 }),
  message: text("message").notNull(),
  priority: text("priority")
    .$type<(typeof priorityLevels)[number]>()
    .default("normal"),
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  attachments: text("attachments"), // JSON array of file paths
  relatedAppointmentId: integer("related_appointment_id").references(
    () => appointments.id
  ),
  relatedFeedbackId: integer("related_feedback_id").references(
    () => feedback.id
  ),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  type: varchar("type", { length: 50 }).notNull(), // appointment, medication, result, message, system
  title: varchar("title", { length: 200 }).notNull(),
  message: text("message").notNull(),
  priority: text("priority")
    .$type<(typeof priorityLevels)[number]>()
    .default("normal"),
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  actionUrl: varchar("action_url", { length: 500 }), // URL to redirect when clicked
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Reports/Analytics table
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // patient_stats, appointment_stats, revenue, satisfaction, etc.
  description: text("description"),
  parameters: text("parameters"), // JSON object with report parameters
  data: text("data"), // JSON object with report data
  generatedBy: text("generated_by")
    .notNull()
    .references(() => user.id),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
  dateRange: varchar("date_range", { length: 50 }), // last_7_days, last_30_days, custom, etc.
  status: varchar("status", { length: 20 }).default("completed"), // pending, completed, failed
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Department Statistics (for dashboard metrics)
export const departmentStats = pgTable("department_stats", {
  id: serial("id").primaryKey(),
  departmentId: integer("department_id")
    .notNull()
    .references(() => departments.id),
  date: date("date").notNull(),
  totalPatients: integer("total_patients").default(0),
  totalAppointments: integer("total_appointments").default(0),
  completedAppointments: integer("completed_appointments").default(0),
  averageWaitTime: integer("average_wait_time").default(0), // minutes
  patientSatisfaction: decimal("patient_satisfaction", {
    precision: 5,
    scale: 2,
  }).default("0.00"),
  revenue: decimal("revenue", { precision: 12, scale: 2 }).default("0.00"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});
