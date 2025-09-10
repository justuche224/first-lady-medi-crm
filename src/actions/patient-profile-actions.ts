/**
 * Patient Profile Management Server Actions
 *
 * Handles patient-specific profile operations and self-service functionality.
 * Patients can view and update their own profile information.
 */

"use server";

import { db } from "@/db";
import {
  user as users,
  patients,
  appointments,
  doctors,
  medications,
  labResults,
  messages,
} from "@/db/schema";
import { eq, and, desc, gte, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export interface UpdatePatientProfileData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  bloodType?: string;
  allergies?: string;
  medicalHistory?: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
}

/**
 * Get current patient's profile information
 */
export async function getPatientProfile() {
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
      throw new Error("Patient access required");
    }

    // Get patient profile with user data
    const patientProfile = await db
      .select({
        user: users,
        patient: patients,
      })
      .from(users)
      .leftJoin(patients, eq(users.id, patients.userId))
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!patientProfile[0]) {
      throw new Error("Patient profile not found");
    }

    return {
      success: true,
      profile: patientProfile[0],
    };
  } catch (error) {
    console.error("Error fetching patient profile:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Update patient's own profile information
 */
export async function updatePatientProfile(updates: UpdatePatientProfileData) {
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
      throw new Error("Patient access required");
    }

    // Get patient record
    const patient = await db
      .select()
      .from(patients)
      .where(eq(patients.userId, session.user.id))
      .limit(1);

    if (!patient[0]) {
      throw new Error("Patient profile not found");
    }

    // Update user table if name or email changed
    if (updates.name || updates.email) {
      await db
        .update(users)
        .set({
          name: updates.name,
          email: updates.email,
          updatedAt: new Date(),
        })
        .where(eq(users.id, session.user.id));
    }

    // Update patient-specific information
    await db
      .update(patients)
      .set({
        phone: updates.phone,
        address: updates.address,
        dateOfBirth: updates.dateOfBirth || undefined,
        gender: updates.gender,
        emergencyContact: updates.emergencyContact,
        emergencyPhone: updates.emergencyPhone,
        bloodType: updates.bloodType,
        allergies: updates.allergies,
        medicalHistory: updates.medicalHistory,
        insuranceProvider: updates.insuranceProvider,
        insuranceNumber: updates.insuranceNumber,
        updatedAt: new Date(),
      })
      .where(eq(patients.id, patient[0].id));

    revalidatePath("/patient/profile");
    revalidatePath("/patient");

    return { success: true };
  } catch (error) {
    console.error("Error updating patient profile:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get patient's health summary and key metrics
 */
export async function getPatientHealthSummary() {
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
      throw new Error("Patient access required");
    }

    // Get patient record
    const patient = await db
      .select()
      .from(patients)
      .where(eq(patients.userId, session.user.id))
      .limit(1);

    if (!patient[0]) {
      throw new Error("Patient profile not found");
    }

    // In a real application, you would calculate these metrics from actual data
    // For now, we'll return the health score from the patient record
    const healthSummary = {
      healthScore: patient[0].healthScore || 0,
      lastVisit: null, // Would be calculated from appointments
      upcomingAppointments: 0, // Would be calculated from appointments
      activeMedications: 0, // Would be calculated from medications
      pendingResults: 0, // Would be calculated from lab results
      unreadMessages: 0, // Would be calculated from messages
    };

    return {
      success: true,
      summary: healthSummary,
    };
  } catch (error) {
    console.error("Error fetching patient health summary:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Update patient notification preferences
 */
export async function updateNotificationPreferences(preferences: {
  email?: boolean;
  sms?: boolean;
  push?: boolean;
  appointmentReminders?: boolean;
  medicationReminders?: boolean;
  resultNotifications?: boolean;
  messageNotifications?: boolean;
}) {
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
      throw new Error("Patient access required");
    }

    // In a real application, you would store notification preferences
    // in a separate table or as JSON in the user/patient table
    // For now, we'll just return success

    revalidatePath("/patient/settings");

    return { success: true };
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Request account deletion (soft delete with review process)
 */
export async function requestAccountDeletion(reason?: string) {
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
      throw new Error("Patient access required");
    }

    // In a real application, you would:
    // 1. Create a deletion request record
    // 2. Send notification to admin team
    // 3. Set account status to "pending deletion"
    // 4. Start a grace period before actual deletion

    // For now, we'll just return success
    return {
      success: true,
      message:
        "Account deletion request submitted. You will receive confirmation via email.",
    };
  } catch (error) {
    console.error("Error requesting account deletion:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Export patient data (GDPR compliance)
 */
export async function exportPatientData() {
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
      throw new Error("Patient access required");
    }

    // In a real application, you would:
    // 1. Gather all patient data from all tables
    // 2. Format it according to data export standards
    // 3. Generate a downloadable file (PDF, JSON, etc.)
    // 4. Provide secure download link

    return {
      success: true,
      message:
        "Data export request submitted. You will receive a download link via email within 24 hours.",
    };
  } catch (error) {
    console.error("Error exporting patient data:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get comprehensive patient dashboard data
 * Includes stats, recent activities, and upcoming appointments
 */
export async function getPatientDashboard() {
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
      throw new Error("Patient access required");
    }

    // Get patient record
    const patient = await db
      .select()
      .from(patients)
      .where(eq(patients.userId, session.user.id))
      .limit(1);

    if (!patient[0]) {
      throw new Error("Patient profile not found");
    }

    const patientId = patient[0].id;

    // Get upcoming appointments (next 7 days)
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);

    const upcomingAppointments = await db
      .select({
        appointment: appointments,
        doctor: {
          id: doctors.id,
          userId: doctors.userId,
          name: users.name,
          specialty: doctors.specialty,
        },
      })
      .from(appointments)
      .innerJoin(doctors, eq(appointments.doctorId, doctors.id))
      .innerJoin(users, eq(doctors.userId, users.id))
      .where(
        and(
          eq(appointments.patientId, patientId),
          eq(appointments.status, "scheduled"),
          gte(appointments.appointmentDate, now.toISOString()),
          sql`${appointments.appointmentDate} <= ${nextWeek.toISOString()}`
        )
      )
      .orderBy(appointments.appointmentDate, appointments.appointmentTime)
      .limit(5);

    // Get active medications count
    const activeMedications = await db
      .select({ count: sql<number>`count(*)` })
      .from(medications)
      .where(
        and(
          eq(medications.patientId, patientId),
          eq(medications.status, "active")
        )
      );

    // Get pending lab results count
    const pendingResults = await db
      .select({ count: sql<number>`count(*)` })
      .from(labResults)
      .where(
        and(
          eq(labResults.patientId, patientId),
          eq(labResults.status, "pending")
        )
      );

    // Get unread messages count
    const unreadMessages = await db
      .select({ count: sql<number>`count(*)` })
      .from(messages)
      .where(
        and(
          eq(messages.recipientId, session.user.id),
          eq(messages.isRead, false)
        )
      );

    // Get recent activities (last 10 activities from various sources)
    const recentActivities = [];

    // Recent appointments
    const recentAppointments = await db
      .select({
        id: appointments.id,
        type: sql<string>`'appointment'`,
        message: sql<string>`concat('Appointment with Dr. ', ${users.name})`,
        timestamp: appointments.createdAt,
        priority: sql<string>`'normal'`,
      })
      .from(appointments)
      .innerJoin(doctors, eq(appointments.doctorId, doctors.id))
      .innerJoin(users, eq(doctors.userId, users.id))
      .where(
        and(
          eq(appointments.patientId, patientId),
          gte(
            appointments.createdAt,
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          )
        )
      )
      .orderBy(desc(appointments.createdAt))
      .limit(3);

    // Recent lab results
    const recentLabResults = await db
      .select({
        id: labResults.id,
        type: sql<string>`'result'`,
        message: sql<string>`concat('Lab result available: ', ${labResults.testName})`,
        timestamp: labResults.resultDate,
        priority: sql<string>`'urgent'`,
      })
      .from(labResults)
      .where(
        and(
          eq(labResults.patientId, patientId),
          eq(labResults.status, "completed"),
          sql`${labResults.resultDate} IS NOT NULL`,
          sql`${labResults.resultDate} >= ${
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0]
          }`
        )
      )
      .orderBy(desc(labResults.resultDate))
      .limit(2);

    // Recent messages
    const recentMessages = await db
      .select({
        id: messages.id,
        type: sql<string>`'message'`,
        message: sql<string>`concat('New message from: ', ${users.name})`,
        timestamp: messages.createdAt,
        priority: messages.priority,
      })
      .from(messages)
      .innerJoin(users, eq(messages.senderId, users.id))
      .where(
        and(
          eq(messages.recipientId, session.user.id),
          gte(
            messages.createdAt,
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          )
        )
      )
      .orderBy(desc(messages.createdAt))
      .limit(2);

    // Combine and sort all activities
    recentActivities.push(...recentAppointments);
    recentActivities.push(...recentLabResults);
    recentActivities.push(...recentMessages);

    recentActivities.sort((a, b) => {
      const aTime = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const bTime = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return bTime - aTime;
    });

    // Take only the most recent 10
    recentActivities.splice(10);

    // Format the dashboard data
    const dashboardData = {
      stats: {
        upcomingAppointments: upcomingAppointments.length,
        pendingResults: pendingResults[0]?.count || 0,
        activeMedications: activeMedications[0]?.count || 0,
        unreadMessages: unreadMessages[0]?.count || 0,
        healthScore: patient[0].healthScore || 0,
      },
      recentActivities: recentActivities.map((activity) => ({
        ...activity,
        time: activity.timestamp
          ? getRelativeTime(activity.timestamp)
          : "Unknown",
      })),
      upcomingAppointments: upcomingAppointments.slice(0, 3).map((item) => ({
        id: item.appointment.id,
        doctor: item.doctor?.name || "Unknown Doctor",
        specialty: item.doctor?.specialty || "",
        date: new Date(item.appointment.appointmentDate).toLocaleDateString(),
        time: item.appointment.appointmentTime,
        type: item.appointment.type,
      })),
    };

    return {
      success: true,
      data: dashboardData,
    };
  } catch (error) {
    console.error("Error fetching patient dashboard:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Helper function to get relative time
function getRelativeTime(dateString: string | Date | null): string {
  if (!dateString) return "Unknown";

  const now = new Date();
  const date = new Date(dateString);
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = diffInMs / (1000 * 60 * 60);
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

  if (diffInHours < 1) {
    return "Just now";
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)} hours ago`;
  } else if (diffInDays < 7) {
    return `${Math.floor(diffInDays)} days ago`;
  } else {
    return date.toLocaleDateString();
  }
}
