/**
 * Medical Records Server Actions
 *
 * Handles medical records management for doctors and patients.
 * Doctors can create/update records, patients can view their own records.
 */

"use server";

import { db } from "@/db";
import {
  medicalRecords,
  user as users,
  patients,
  doctors,
  appointments,
} from "@/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { alias } from "drizzle-orm/pg-core";

const doctorUsers = alias(users, 'doctorUsers');

// Types
export interface CreateMedicalRecordData {
  patientId: number;
  appointmentId?: number;
  recordType: string;
  title: string;
  description?: string;
  diagnosis?: string;
  treatment?: string;
  medications?: string; // JSON array
  labTests?: string; // JSON array
  vitalSigns?: string; // JSON object
  attachments?: string[]; // Array of file paths
  isConfidential?: boolean;
}

export interface UpdateMedicalRecordData {
  recordType?: string;
  title?: string;
  description?: string;
  diagnosis?: string;
  treatment?: string;
  medications?: string;
  labTests?: string;
  vitalSigns?: string;
  attachments?: string[];
  isConfidential?: boolean;
}

/**
 * Create a new medical record (Doctor Only)
 *
 * Creates a new medical record entry for a patient.
 * Only doctors can create medical records.
 */
export async function createMedicalRecord(recordData: CreateMedicalRecordData) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user[0] || user[0].role !== "doctor") {
      throw new Error("Only doctors can create medical records");
    }

    // Verify doctor exists
    const doctor = await db
      .select()
      .from(doctors)
      .where(eq(doctors.userId, session.user.id))
      .limit(1);

    if (!doctor[0]) {
      throw new Error("Doctor profile not found");
    }

    // Verify patient exists
    const patient = await db
      .select()
      .from(patients)
      .where(eq(patients.id, recordData.patientId))
      .limit(1);

    if (!patient[0]) {
      throw new Error("Patient not found");
    }

    // Verify appointment if provided
    if (recordData.appointmentId) {
      const appointment = await db
        .select()
        .from(appointments)
        .where(
          and(
            eq(appointments.id, recordData.appointmentId),
            eq(appointments.patientId, recordData.patientId),
            eq(appointments.doctorId, doctor[0].id)
          )
        )
        .limit(1);

      if (!appointment[0]) {
        throw new Error("Appointment not found or access denied");
      }
    }

    const newRecord = await db
      .insert(medicalRecords)
      .values({
        patientId: recordData.patientId,
        doctorId: doctor[0].id,
        appointmentId: recordData.appointmentId,
        recordType: recordData.recordType,
        title: recordData.title,
        description: recordData.description,
        diagnosis: recordData.diagnosis,
        treatment: recordData.treatment,
        medications: recordData.medications,
        labTests: recordData.labTests,
        vitalSigns: recordData.vitalSigns,
        attachments: recordData.attachments
          ? JSON.stringify(recordData.attachments)
          : null,
        isConfidential: recordData.isConfidential || false,
      })
      .returning();

    revalidatePath("/medical-records");
    revalidatePath("/patient/[id]");
    revalidatePath("/dashboard");

    return { success: true, record: newRecord[0] };
  } catch (error) {
    console.error("Error creating medical record:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get medical records
 *
 * - Patients can view their own records
 * - Doctors can view records for their patients
 * - Admins can view all records
 */
export async function getMedicalRecords(
  patientId?: number,
  page = 1,
  limit = 20,
  recordType?: string
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user[0]) {
      throw new Error("User not found");
    }

    const offset = (page - 1) * limit;

    // Build where clause based on user role
    let whereClause = sql`true`;

    if (user[0].role === "patient") {
      // Patients can only see their own records
      const patient = await db
        .select()
        .from(patients)
        .where(eq(patients.userId, session.user.id))
        .limit(1);

      if (!patient[0]) {
        throw new Error("Patient profile not found");
      }

      whereClause = sql`${medicalRecords.patientId} = ${patient[0].id}`;
    } else if (user[0].role === "doctor") {
      // Doctors can see records for their patients
      const doctor = await db
        .select()
        .from(doctors)
        .where(eq(doctors.userId, session.user.id))
        .limit(1);

      if (!doctor[0]) {
        throw new Error("Doctor profile not found");
      }

      // If specific patient requested, verify doctor has access
      if (patientId) {
        const hasAccess = await db
          .select()
          .from(appointments)
          .where(
            and(
              eq(appointments.patientId, patientId),
              eq(appointments.doctorId, doctor[0].id)
            )
          )
          .limit(1);

        if (!hasAccess[0]) {
          throw new Error("Access denied to patient records");
        }

        whereClause = sql`${medicalRecords.patientId} = ${patientId}`;
      } else {
        // Show all records for patients this doctor has seen
        whereClause = sql`${medicalRecords.doctorId} = ${doctor[0].id}`;
      }
    } else if (patientId) {
      // Admins/staff can specify patient ID
      whereClause = sql`${medicalRecords.patientId} = ${patientId}`;
    }
    // Admins/staff without patientId see all records

    // Add record type filter
    if (recordType) {
      whereClause = sql`${whereClause} AND ${medicalRecords.recordType} = ${recordType}`;
    }

    // Get records with related data
    const recordsWithCount = await db
      .select({
        record: medicalRecords,
        patient: {
          id: patients.id,
          userId: patients.userId,
          name: users.name,
        },
        doctor: {
          id: doctors.id,
          userId: doctors.userId,
          name: users.name,
          specialty: doctors.specialty,
        },
        appointment: appointments,
        total: sql<number>`count(*) over()`,
      })
      .from(medicalRecords)
      .leftJoin(patients, eq(medicalRecords.patientId, patients.id))
      .leftJoin(users, eq(patients.userId, users.id))
      .leftJoin(doctors, eq(medicalRecords.doctorId, doctors.id))
      .leftJoin(doctorUsers, eq(doctors.userId, doctorUsers.id))
      .leftJoin(appointments, eq(medicalRecords.appointmentId, appointments.id))
      .where(whereClause)
      .orderBy(desc(medicalRecords.createdAt))
      .limit(limit)
      .offset(offset);

    const total = recordsWithCount[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      records: recordsWithCount,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  } catch (error) {
    console.error("Error fetching medical records:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Update medical record (Doctor Only)
 *
 * Updates an existing medical record.
 * Only the doctor who created the record can update it.
 */
export async function updateMedicalRecord(
  recordId: number,
  updates: UpdateMedicalRecordData
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user[0] || user[0].role !== "doctor") {
      throw new Error("Only doctors can update medical records");
    }

    // Verify doctor owns this record
    const doctor = await db
      .select()
      .from(doctors)
      .where(eq(doctors.userId, session.user.id))
      .limit(1);

    if (!doctor[0]) {
      throw new Error("Doctor profile not found");
    }

    const record = await db
      .select()
      .from(medicalRecords)
      .where(
        and(
          eq(medicalRecords.id, recordId),
          eq(medicalRecords.doctorId, doctor[0].id)
        )
      )
      .limit(1);

    if (!record[0]) {
      throw new Error("Medical record not found or access denied");
    }

    await db
      .update(medicalRecords)
      .set({
        ...updates,
        attachments: updates.attachments
          ? JSON.stringify(updates.attachments)
          : undefined,
        updatedAt: new Date(),
      })
      .where(eq(medicalRecords.id, recordId));

    revalidatePath("/medical-records");
    revalidatePath("/patient/[id]");

    return { success: true };
  } catch (error) {
    console.error("Error updating medical record:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Delete medical record (Doctor Only)
 *
 * Deletes a medical record.
 * Only the doctor who created the record can delete it.
 */
export async function deleteMedicalRecord(recordId: number) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user[0] || user[0].role !== "doctor") {
      throw new Error("Only doctors can delete medical records");
    }

    // Verify doctor owns this record
    const doctor = await db
      .select()
      .from(doctors)
      .where(eq(doctors.userId, session.user.id))
      .limit(1);

    if (!doctor[0]) {
      throw new Error("Doctor profile not found");
    }

    const record = await db
      .select()
      .from(medicalRecords)
      .where(
        and(
          eq(medicalRecords.id, recordId),
          eq(medicalRecords.doctorId, doctor[0].id)
        )
      )
      .limit(1);

    if (!record[0]) {
      throw new Error("Medical record not found or access denied");
    }

    await db.delete(medicalRecords).where(eq(medicalRecords.id, recordId));

    revalidatePath("/medical-records");
    revalidatePath("/patient/[id]");

    return { success: true };
  } catch (error) {
    console.error("Error deleting medical record:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get medical record details
 *
 * Retrieves complete medical record information with related data.
 */
export async function getMedicalRecordDetails(recordId: number) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user[0]) {
      throw new Error("User not found");
    }

    // Get record with all related data
    const recordDetails = await db
      .select({
        record: medicalRecords,
        patient: {
          id: patients.id,
          userId: patients.userId,
          name: users.name,
          dateOfBirth: patients.dateOfBirth,
          phone: patients.phone,
        },
        doctor: {
          id: doctors.id,
          userId: doctors.userId,
          name: users.name,
          specialty: doctors.specialty,
          licenseNumber: doctors.licenseNumber,
        },
        appointment: appointments,
      })
      .from(medicalRecords)
      .leftJoin(patients, eq(medicalRecords.patientId, patients.id))
      .leftJoin(users, eq(patients.userId, users.id))
      .leftJoin(doctors, eq(medicalRecords.doctorId, doctors.id))
      .leftJoin(doctorUsers, eq(doctors.userId, doctorUsers.id))
      .leftJoin(appointments, eq(medicalRecords.appointmentId, appointments.id))
      .where(eq(medicalRecords.id, recordId))
      .limit(1);

    if (!recordDetails[0]) {
      throw new Error("Medical record not found");
    }

    const record = recordDetails[0];

    // Access control
    if (user[0].role === "patient") {
      if (record.patient?.userId !== session.user.id) {
        throw new Error("You can only view your own medical records");
      }
    } else if (user[0].role === "doctor") {
      if (record.doctor?.userId !== session.user.id) {
        throw new Error("You can only view records you created");
      }
    }

    // Parse JSON fields
    const parsedRecord = {
      ...record.record,
      attachments: record.record.attachments
        ? JSON.parse(record.record.attachments)
        : null,
      medications: record.record.medications
        ? JSON.parse(record.record.medications)
        : null,
      labTests: record.record.labTests
        ? JSON.parse(record.record.labTests)
        : null,
      vitalSigns: record.record.vitalSigns
        ? JSON.parse(record.record.vitalSigns)
        : null,
    };

    return {
      success: true,
      record: {
        ...record,
        record: parsedRecord,
      },
    };
  } catch (error) {
    console.error("Error fetching medical record details:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get patient medical history summary
 *
 * Provides a summary of patient's medical history for quick reference.
 */
export async function getPatientMedicalSummary(patientId: number) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user[0]) {
      throw new Error("User not found");
    }

    // Access control
    if (user[0].role === "patient") {
      const patient = await db
        .select()
        .from(patients)
        .where(eq(patients.userId, session.user.id))
        .limit(1);

      if (!patient[0] || patient[0].id !== patientId) {
        throw new Error("Access denied");
      }
    } else if (user[0].role === "doctor") {
      const doctor = await db
        .select()
        .from(doctors)
        .where(eq(doctors.userId, session.user.id))
        .limit(1);

      if (!doctor[0]) {
        throw new Error("Doctor profile not found");
      }

      // Verify doctor has access to this patient
      const hasAccess = await db
        .select()
        .from(appointments)
        .where(
          and(
            eq(appointments.patientId, patientId),
            eq(appointments.doctorId, doctor[0].id)
          )
        )
        .limit(1);

      if (!hasAccess[0]) {
        throw new Error("Access denied to patient records");
      }
    }

    // Get summary statistics
    const summary = await db
      .select({
        totalRecords: sql<number>`count(*)`,
        latestVisit: sql<Date>`max(${medicalRecords.createdAt})`,
        recordTypes: sql<string>`array_agg(distinct ${medicalRecords.recordType})`,
      })
      .from(medicalRecords)
      .where(eq(medicalRecords.patientId, patientId));

    // Get recent diagnoses
    const recentDiagnoses = await db
      .select({
        diagnosis: medicalRecords.diagnosis,
        createdAt: medicalRecords.createdAt,
      })
      .from(medicalRecords)
      .where(
        and(
          eq(medicalRecords.patientId, patientId),
          sql`${medicalRecords.diagnosis} IS NOT NULL`
        )
      )
      .orderBy(desc(medicalRecords.createdAt))
      .limit(5);

    return {
      success: true,
      summary: {
        ...summary[0],
        recentDiagnoses,
      },
    };
  } catch (error) {
    console.error("Error fetching patient medical summary:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
