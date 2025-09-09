/**
 * Feedback Management Server Actions
 *
 * Handles patient feedback, complaints, and suggestions.
 * Patients can submit feedback, staff can manage responses.
 */

"use server";

import { db } from "@/db";
import {
  feedback,
  user as users,
  patients,
  departments,
  staff,
} from "@/db/schema";
import { eq, sql, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

// Types
export interface CreateFeedbackData {
  subject: string;
  message: string;
  type: "complaint" | "suggestion" | "praise" | "inquiry";
  priority?: "low" | "normal" | "high" | "urgent";
  departmentId?: number;
}

export interface UpdateFeedbackData {
  status?: "open" | "in_progress" | "resolved" | "closed";
  assignedTo?: string;
  response?: string;
  rating?: number;
}

/**
 * Submit feedback (Patient Only)
 *
 * Allows patients to submit feedback, complaints, or suggestions.
 */
export async function submitFeedback(feedbackData: CreateFeedbackData) {
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

    if (!user[0] || user[0].role !== "patient") {
      throw new Error("Only patients can submit feedback");
    }

    // Get patient profile
    const patient = await db
      .select()
      .from(patients)
      .where(eq(patients.userId, session.user.id))
      .limit(1);

    if (!patient[0]) {
      throw new Error("Patient profile not found");
    }

    const newFeedback = await db
      .insert(feedback)
      .values({
        patientId: patient[0].id,
        subject: feedbackData.subject,
        message: feedbackData.message,
        type: feedbackData.type,
        priority: feedbackData.priority || "normal",
        departmentId: feedbackData.departmentId,
        status: "open",
      })
      .returning();

    revalidatePath("/feedback");
    revalidatePath("/dashboard");

    return { success: true, feedback: newFeedback[0] };
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get feedback
 *
 * - Patients can view their own feedback
 * - Staff can view feedback assigned to them or their department
 * - Admins can view all feedback
 */
export async function getFeedback(
  page = 1,
  limit = 20,
  status?: string,
  type?: string,
  priority?: string
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
      // Patients can only see their own feedback
      const patient = await db
        .select()
        .from(patients)
        .where(eq(patients.userId, session.user.id))
        .limit(1);

      if (!patient[0]) {
        throw new Error("Patient profile not found");
      }

      whereClause = sql`${feedback.patientId} = ${patient[0].id}`;
    } else if (user[0].role === "staff") {
      // Staff can see feedback assigned to them or their department
      const staffData = await db
        .select()
        .from(staff)
        .where(eq(staff.userId, session.user.id))
        .limit(1);

      if (!staffData[0]) {
        throw new Error("Staff profile not found");
      }

      whereClause = sql`${feedback.assignedTo} = ${session.user.id} OR ${feedback.departmentId} = ${staffData[0].departmentId}`;
    }
    // Admins can see all feedback

    // Add filters
    if (status && status !== "all") {
      whereClause = sql`${whereClause} AND ${feedback.status} = ${status}`;
    }

    if (type && type !== "all") {
      whereClause = sql`${whereClause} AND ${feedback.type} = ${type}`;
    }

    if (priority && priority !== "all") {
      whereClause = sql`${whereClause} AND ${feedback.priority} = ${priority}`;
    }

    // Get feedback with related data
    const feedbackWithCount = await db
      .select({
        feedback: feedback,
        patient: {
          id: patients.id,
          userId: patients.userId,
          name: users.name,
          email: users.email,
        },
        assignedUser: {
          name: sql<string>`(SELECT name FROM "user" WHERE id = ${feedback.assignedTo})`,
        },
        department: departments,
        total: sql<number>`count(*) over()`,
      })
      .from(feedback)
      .leftJoin(patients, eq(feedback.patientId, patients.id))
      .leftJoin(users, eq(patients.userId, users.id))
      .leftJoin(departments, eq(feedback.departmentId, departments.id))
      .where(whereClause)
      .orderBy(desc(feedback.createdAt))
      .limit(limit)
      .offset(offset);

    const total = feedbackWithCount[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      feedback: feedbackWithCount,
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
    console.error("Error fetching feedback:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Update feedback (Staff/Admin Only)
 *
 * Updates feedback status, assignment, and response.
 */
export async function updateFeedback(
  feedbackId: number,
  updates: UpdateFeedbackData
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

    if (!user[0] || (user[0].role !== "staff" && user[0].role !== "admin")) {
      throw new Error("Staff or admin access required");
    }

    await db
      .update(feedback)
      .set({
        ...updates,
        respondedBy: updates.response ? session.user.id : undefined,
        respondedAt: updates.response ? new Date() : undefined,
        updatedAt: new Date(),
      })
      .where(eq(feedback.id, feedbackId));

    revalidatePath("/feedback");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Error updating feedback:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Assign feedback (Admin Only)
 *
 * Assigns feedback to a specific staff member.
 */
export async function assignFeedback(
  feedbackId: number,
  assignedToUserId: string
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

    if (!user[0] || user[0].role !== "admin") {
      throw new Error("Admin access required");
    }

    // Verify assigned user exists and is staff
    const assignedUser = await db
      .select()
      .from(users)
      .where(eq(users.id, assignedToUserId))
      .limit(1);

    if (!assignedUser[0] || assignedUser[0].role !== "staff") {
      throw new Error("Assigned user must be a staff member");
    }

    await db
      .update(feedback)
      .set({
        assignedTo: assignedToUserId,
        status: "in_progress",
        updatedAt: new Date(),
      })
      .where(eq(feedback.id, feedbackId));

    revalidatePath("/feedback");

    return { success: true };
  } catch (error) {
    console.error("Error assigning feedback:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get feedback statistics
 *
 * Returns feedback statistics for dashboard.
 */
export async function getFeedbackStatistics() {
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

    // Build where clause based on user role
    let whereClause = sql`true`;

    if (user[0].role === "staff") {
      const staffData = await db
        .select()
        .from(staff)
        .where(eq(staff.userId, session.user.id))
        .limit(1);

      if (!staffData[0]) {
        throw new Error("Staff profile not found");
      }

      whereClause = sql`${feedback.assignedTo} = ${session.user.id} OR ${feedback.departmentId} = ${staffData[0].departmentId}`;
    }

    // Get statistics
    const stats = await db
      .select({
        total: sql<number>`count(*)`,
        open: sql<number>`count(case when status = 'open' then 1 end)`,
        inProgress: sql<number>`count(case when status = 'in_progress' then 1 end)`,
        resolved: sql<number>`count(case when status = 'resolved' then 1 end)`,
        closed: sql<number>`count(case when status = 'closed' then 1 end)`,
        urgent: sql<number>`count(case when priority = 'urgent' then 1 end)`,
        avgRating: sql<number>`avg(case when rating is not null then rating end)`,
      })
      .from(feedback)
      .where(whereClause);

    return {
      success: true,
      statistics: stats[0],
    };
  } catch (error) {
    console.error("Error fetching feedback statistics:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
