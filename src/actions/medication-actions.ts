/**
 * Medication Management Server Actions
 *
 * Handles medication prescription, tracking, and management.
 * Doctors can prescribe medications, patients can view their medications.
 */

"use server";

import { db } from "@/db";
import {
  medications,
  user as users,
  user as doctorUsers,
  user as patientUsers,
  patients,
  doctors,
  appointments,
} from "@/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

// Types
export interface CreateMedicationData {
  patientId: number;
  appointmentId?: number;
  name: string;
  genericName?: string;
  dosage: string;
  frequency: string;
  duration?: string;
  instructions?: string;
  startDate: Date;
  endDate?: Date;
  refills?: number;
  sideEffects?: string;
}

export interface UpdateMedicationData {
  name?: string;
  genericName?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
  startDate?: Date;
  endDate?: Date;
  refills?: number;
  sideEffects?: string;
  status?: "active" | "completed" | "discontinued";
}

/**
 * Prescribe medication (Doctor Only)
 *
 * Creates a new medication prescription for a patient.
 * Only doctors can prescribe medications.
 */
export async function prescribeMedication(
  medicationData: CreateMedicationData
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
      throw new Error("Only doctors can prescribe medications");
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
      .where(eq(patients.id, medicationData.patientId))
      .limit(1);

    if (!patient[0]) {
      throw new Error("Patient not found");
    }

    // Verify appointment if provided
    if (medicationData.appointmentId) {
      const appointment = await db
        .select()
        .from(appointments)
        .where(
          and(
            eq(appointments.id, medicationData.appointmentId),
            eq(appointments.patientId, medicationData.patientId),
            eq(appointments.doctorId, doctor[0].id)
          )
        )
        .limit(1);

      if (!appointment[0]) {
        throw new Error("Appointment not found or access denied");
      }
    }

    const newMedication = await db
      .insert(medications)
      .values({
        patientId: medicationData.patientId,
        prescribedBy: doctor[0].id,
        appointmentId: medicationData.appointmentId,
        name: medicationData.name,
        genericName: medicationData.genericName,
        dosage: medicationData.dosage,
        frequency: medicationData.frequency,
        duration: medicationData.duration,
        instructions: medicationData.instructions,
        startDate: medicationData.startDate.toISOString(),
        endDate: medicationData.endDate?.toISOString(),
        refills: medicationData.refills || 0,
        sideEffects: medicationData.sideEffects,
        status: "active",
      })
      .returning();

    revalidatePath("/medications");
    revalidatePath("/patient/[id]");
    revalidatePath("/dashboard");

    return { success: true, medication: newMedication[0] };
  } catch (error) {
    console.error("Error prescribing medication:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get medications
 *
 * - Patients can view their own medications
 * - Doctors can view medications for their patients
 * - Admins can view all medications
 */
export async function getMedications(
  patientId?: number,
  page = 1,
  limit = 20,
  status?: "active" | "completed" | "discontinued"
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
      // Patients can only see their own medications
      const patient = await db
        .select()
        .from(patients)
        .where(eq(patients.userId, session.user.id))
        .limit(1);

      if (!patient[0]) {
        throw new Error("Patient profile not found");
      }

      whereClause = sql`${medications.patientId} = ${patient[0].id}`;
    } else if (user[0].role === "doctor") {
      // Doctors can see medications for their patients
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
          throw new Error("Access denied to patient medications");
        }

        whereClause = sql`${medications.patientId} = ${patientId}`;
      } else {
        // Show all medications prescribed by this doctor
        whereClause = sql`${medications.prescribedBy} = ${doctor[0].id}`;
      }
    } else if (patientId) {
      // Admins/staff can specify patient ID
      whereClause = sql`${medications.patientId} = ${patientId}`;
    }
    // Admins/staff without patientId see all medications

    // Add status filter
    if (status) {
      whereClause = sql`${whereClause} AND ${medications.status} = ${status}`;
    }

    // Get medications with related data
    const medicationsWithCount = await db
      .select({
        medication: medications,
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
      .from(medications)
      .leftJoin(patients, eq(medications.patientId, patients.id))
      .leftJoin(users, eq(patients.userId, users.id))
      .leftJoin(doctors, eq(medications.prescribedBy, doctors.id))
      .leftJoin(doctorUsers, eq(doctors.userId, doctorUsers.id))
      .leftJoin(appointments, eq(medications.appointmentId, appointments.id))
      .where(whereClause)
      .orderBy(desc(medications.createdAt))
      .limit(limit)
      .offset(offset);

    const total = medicationsWithCount[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      medications: medicationsWithCount,
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
    console.error("Error fetching medications:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Update medication (Doctor Only)
 *
 * Updates medication details.
 * Only the prescribing doctor can update medications.
 */
export async function updateMedication(
  medicationId: number,
  updates: UpdateMedicationData
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
      throw new Error("Only doctors can update medications");
    }

    // Verify doctor owns this prescription
    const doctor = await db
      .select()
      .from(doctors)
      .where(eq(doctors.userId, session.user.id))
      .limit(1);

    if (!doctor[0]) {
      throw new Error("Doctor profile not found");
    }

    const medication = await db
      .select()
      .from(medications)
      .where(
        and(
          eq(medications.id, medicationId),
          eq(medications.prescribedBy, doctor[0].id)
        )
      )
      .limit(1);

    if (!medication[0]) {
      throw new Error("Medication not found or access denied");
    }

    await db
      .update(medications)
      .set({
        ...updates,
        startDate: updates.startDate?.toISOString(),
        endDate: updates.endDate?.toISOString(),
        updatedAt: new Date(),
      })
      .where(eq(medications.id, medicationId));

    revalidatePath("/medications");
    revalidatePath("/patient/[id]");

    return { success: true };
  } catch (error) {
    console.error("Error updating medication:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Refill medication
 *
 * Processes a medication refill request.
 * Can be done by doctors or patients (for their own medications).
 */
export async function refillMedication(medicationId: number) {
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

    // Get medication details
    const medication = await db
      .select({
        medication: medications,
        patient: patients,
        doctor: doctors,
      })
      .from(medications)
      .leftJoin(patients, eq(medications.patientId, patients.id))
      .leftJoin(doctors, eq(medications.prescribedBy, doctors.id))
      .where(eq(medications.id, medicationId))
      .limit(1);

    if (!medication[0]) {
      throw new Error("Medication not found");
    }

    // Access control
    if (user[0].role === "patient") {
      if (medication[0].patient?.userId !== session.user.id) {
        throw new Error("You can only refill your own medications");
      }
    } else if (user[0].role === "doctor") {
      if (medication[0].doctor?.userId !== session.user.id) {
        throw new Error("You can only refill medications you prescribed");
      }
    }

    // Check if refills are available
    if ((medication[0].medication.refills || 0) <= 0) {
      throw new Error("No refills available for this medication");
    }

    // Update refill count
    await db
      .update(medications)
      .set({
        refills: sql`${medications.refills} - 1`,
        updatedAt: new Date(),
      })
      .where(eq(medications.id, medicationId));

    revalidatePath("/medications");
    revalidatePath("/dashboard");

    return {
      success: true,
      remainingRefills: (medication[0].medication.refills || 0) - 1,
    };
  } catch (error) {
    console.error("Error refilling medication:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Discontinue medication (Doctor Only)
 *
 * Discontinues a medication prescription.
 * Only the prescribing doctor can discontinue medications.
 */
export async function discontinueMedication(
  medicationId: number,
  reason?: string
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
      throw new Error("Only doctors can discontinue medications");
    }

    // Verify doctor owns this prescription
    const doctor = await db
      .select()
      .from(doctors)
      .where(eq(doctors.userId, session.user.id))
      .limit(1);

    if (!doctor[0]) {
      throw new Error("Doctor profile not found");
    }

    const medication = await db
      .select()
      .from(medications)
      .where(
        and(
          eq(medications.id, medicationId),
          eq(medications.prescribedBy, doctor[0].id)
        )
      )
      .limit(1);

    if (!medication[0]) {
      throw new Error("Medication not found or access denied");
    }

    await db
      .update(medications)
      .set({
        status: "discontinued",
        endDate: new Date().toISOString(),
        instructions: reason
          ? `${medication[0].instructions || ""}\n\nDiscontinued: ${reason}`
          : medication[0].instructions,
        updatedAt: new Date(),
      })
      .where(eq(medications.id, medicationId));

    revalidatePath("/medications");
    revalidatePath("/patient/[id]");

    return { success: true };
  } catch (error) {
    console.error("Error discontinuing medication:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get medication details
 *
 * Retrieves complete medication information with related data.
 */
export async function getMedicationDetails(medicationId: number) {
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

    // Get medication with all related data
    const medicationDetails = await db
      .select({
        medication: medications,
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
      .from(medications)
      .leftJoin(patients, eq(medications.patientId, patients.id))
      .leftJoin(users, eq(patients.userId, users.id))
      .leftJoin(doctors, eq(medications.prescribedBy, doctors.id))
      .leftJoin(doctorUsers, eq(doctors.userId, doctorUsers.id))
      .leftJoin(appointments, eq(medications.appointmentId, appointments.id))
      .where(eq(medications.id, medicationId))
      .limit(1);

    if (!medicationDetails[0]) {
      throw new Error("Medication not found");
    }

    const medication = medicationDetails[0];

    // Access control
    if (user[0].role === "patient") {
      if (medication.patient?.userId !== session.user.id) {
        throw new Error("You can only view your own medications");
      }
    } else if (user[0].role === "doctor") {
      if (medication.doctor?.userId !== session.user.id) {
        throw new Error("You can only view medications you prescribed");
      }
    }

    return { success: true, medication };
  } catch (error) {
    console.error("Error fetching medication details:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get medications requiring attention
 *
 * Returns medications that need attention (running low, expired, etc.)
 */
export async function getMedicationsRequiringAttention() {
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

    let patientIdFilter = sql`true`;

    if (user[0].role === "patient") {
      const patient = await db
        .select()
        .from(patients)
        .where(eq(patients.userId, session.user.id))
        .limit(1);

      if (!patient[0]) {
        throw new Error("Patient profile not found");
      }

      patientIdFilter = sql`${medications.patientId} = ${patient[0].id}`;
    }

    const currentDate = new Date();
    const warningDate = new Date();
    warningDate.setDate(currentDate.getDate() + 7); // 7 days warning

    // Get medications needing attention
    const medicationsNeedingAttention = await db
      .select({
        medication: medications,
        patient: {
          id: patients.id,
          name: users.name,
        },
        doctor: {
          name: users.name,
          specialty: doctors.specialty,
        },
      })
      .from(medications)
      .leftJoin(patients, eq(medications.patientId, patients.id))
      .leftJoin(patientUsers, eq(patients.userId, patientUsers.id))
      .leftJoin(doctors, eq(medications.prescribedBy, doctors.id))
      .leftJoin(doctorUsers, eq(doctors.userId, doctorUsers.id))
      .where(
        and(
          patientIdFilter,
          sql`${medications.status} = 'active'`,
          sql`(${medications.endDate} <= ${warningDate} OR ${medications.refills} <= 1)`
        )
      )
      .orderBy(desc(medications.endDate));

    return {
      success: true,
      medications: medicationsNeedingAttention,
      count: medicationsNeedingAttention.length,
    };
  } catch (error) {
    console.error("Error fetching medications requiring attention:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
