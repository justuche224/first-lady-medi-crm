/**
 * Lab Results Server Actions
 *
 * Handles lab test ordering, result management, and review.
 * Doctors can order tests and review results, patients can view their results.
 */

"use server";

import { db } from "@/db";
import {
  labResults,
  user as users,
  patients,
  doctors,
  appointments,
} from "@/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

// Types
export interface CreateLabResultData {
  patientId: number;
  appointmentId?: number;
  testName: string;
  testCategory: string;
  testDate: Date;
}

export interface UpdateLabResultData {
  testName?: string;
  testCategory?: string;
  testDate?: Date;
  resultDate?: Date;
  results?: string;
  normalRange?: string;
  interpretation?: string;
  notes?: string;
  attachments?: string[];
  status?: "pending" | "completed" | "reviewed";
}

/**
 * Order lab test (Doctor Only)
 *
 * Creates a new lab test order for a patient.
 * Only doctors can order lab tests.
 */
export async function orderLabTest(testData: CreateLabResultData) {
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
      throw new Error("Only doctors can order lab tests");
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
      .where(eq(patients.id, testData.patientId))
      .limit(1);

    if (!patient[0]) {
      throw new Error("Patient not found");
    }

    const newLabResult = await db
      .insert(labResults)
      .values({
        patientId: testData.patientId,
        doctorId: doctor[0].id,
        appointmentId: testData.appointmentId,
        testName: testData.testName,
        testCategory: testData.testCategory,
        testDate: sql<Date>`${
          testData.testDate.toISOString().split("T")[0]
        }::date`,
        status: "pending",
      })
      .returning();

    revalidatePath("/lab-results");
    revalidatePath("/patient/[id]");

    return { success: true, labResult: newLabResult[0] };
  } catch (error) {
    console.error("Error ordering lab test:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get lab results
 *
 * - Patients can view their own results
 * - Doctors can view results for their patients
 * - Admins can view all results
 */
export async function getLabResults(
  patientId?: number,
  page = 1,
  limit = 20,
  status?: "pending" | "completed" | "reviewed"
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
      const patient = await db
        .select()
        .from(patients)
        .where(eq(patients.userId, session.user.id))
        .limit(1);

      if (!patient[0]) {
        throw new Error("Patient profile not found");
      }

      whereClause = sql`${labResults.patientId} = ${patient[0].id}`;
    } else if (user[0].role === "doctor") {
      const doctor = await db
        .select()
        .from(doctors)
        .where(eq(doctors.userId, session.user.id))
        .limit(1);

      if (!doctor[0]) {
        throw new Error("Doctor profile not found");
      }

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
          throw new Error("Access denied to patient lab results");
        }

        whereClause = sql`${labResults.patientId} = ${patientId}`;
      } else {
        whereClause = sql`${labResults.doctorId} = ${doctor[0].id}`;
      }
    } else if (patientId) {
      whereClause = sql`${labResults.patientId} = ${patientId}`;
    }

    // Add status filter
    if (status) {
      whereClause = sql`${whereClause} AND ${labResults.status} = ${status}`;
    }

    // Get lab results with related data
    const labResultsWithCount = await db
      .select({
        labResult: labResults,
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
        total: sql<number>`count(*) over()`,
      })
      .from(labResults)
      .leftJoin(patients, eq(labResults.patientId, patients.id))
      .leftJoin(users, eq(patients.userId, users.id))
      .leftJoin(doctors, eq(labResults.doctorId, doctors.id))
      .where(whereClause)
      .orderBy(desc(labResults.testDate))
      .limit(limit)
      .offset(offset);

    const total = labResultsWithCount[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      labResults: labResultsWithCount,
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
    console.error("Error fetching lab results:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Update lab result
 *
 * Updates lab test results and status.
 * Doctors can update results for tests they ordered.
 */
export async function updateLabResult(
  resultId: number,
  updates: UpdateLabResultData
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

    // Get the lab result
    const labResult = await db
      .select({
        labResult: labResults,
        doctor: doctors,
      })
      .from(labResults)
      .leftJoin(doctors, eq(labResults.doctorId, doctors.id))
      .where(eq(labResults.id, resultId))
      .limit(1);

    if (!labResult[0]) {
      throw new Error("Lab result not found");
    }

    // Access control - doctors can update their own tests, admins can update any
    if (user[0].role === "doctor") {
      if (labResult[0].doctor?.userId !== session.user.id) {
        throw new Error(
          "You can only update lab results for tests you ordered"
        );
      }
    }

    const { testDate, resultDate, ...otherUpdates } = updates;

    await db
      .update(labResults)
      .set({
        ...otherUpdates,
        attachments: updates.attachments
          ? JSON.stringify(updates.attachments)
          : undefined,
        reviewedBy:
          user[0].role === "doctor" ? labResult[0].doctor?.id : undefined,
        reviewedAt: updates.status === "reviewed" ? new Date() : undefined,
        updatedAt: new Date(),
        ...(testDate && {
          testDate: sql<Date>`${testDate.toISOString().split("T")[0]}::date`,
        }),
        ...(resultDate && {
          resultDate: sql<Date>`${
            resultDate.toISOString().split("T")[0]
          }::date`,
        }),
      })
      .where(eq(labResults.id, resultId));

    revalidatePath("/lab-results");
    revalidatePath("/patient/[id]");

    return { success: true };
  } catch (error) {
    console.error("Error updating lab result:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get pending lab results count
 *
 * Returns count of pending lab results for doctors.
 */
export async function getPendingLabResultsCount() {
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
      throw new Error("Doctor access required");
    }

    const doctor = await db
      .select()
      .from(doctors)
      .where(eq(doctors.userId, session.user.id))
      .limit(1);

    if (!doctor[0]) {
      throw new Error("Doctor profile not found");
    }

    const pendingCount = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(labResults)
      .where(
        and(
          eq(labResults.doctorId, doctor[0].id),
          sql`${labResults.status} IN ('pending', 'completed')`
        )
      );

    return { success: true, count: pendingCount[0]?.count || 0 };
  } catch (error) {
    console.error("Error fetching pending lab results count:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
