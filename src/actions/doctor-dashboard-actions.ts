/**
 * Doctor Dashboard Server Actions
 *
 * Handles doctor-specific dashboard data and statistics.
 */

"use server";

import { db } from "@/db";
import {
  user as users,
  doctors,
  patients,
  appointments,
  medicalRecords,
  medications,
  labResults,
  messages,
  feedback,
  departments,
  notifications,
  patientDoctorAssignments,
} from "@/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { alias } from "drizzle-orm/pg-core";

// Create proper aliases for the user table
const patientUsers = alias(users, "patientUsers");
const doctorUsers = alias(users, "doctorUsers");

/**
 * Get doctor's own profile information
 */
export async function getCurrentDoctorProfile() {
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

    // Get doctor profile with department info
    const doctorProfile = await db
      .select({
        doctor: doctors,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
        department: departments,
      })
      .from(doctors)
      .leftJoin(users, eq(doctors.userId, users.id))
      .leftJoin(departments, eq(doctors.departmentId, departments.id))
      .where(eq(doctors.userId, session.user.id))
      .limit(1);

    if (!doctorProfile[0]) {
      throw new Error("Doctor profile not found");
    }

    return { success: true, profile: doctorProfile[0] };
  } catch (error) {
    console.error("Error fetching doctor profile:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get doctor dashboard statistics
 */
export async function getDoctorDashboardStats() {
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

    // Get doctor record
    const doctor = await db
      .select()
      .from(doctors)
      .where(eq(doctors.userId, session.user.id))
      .limit(1);

    if (!doctor[0]) {
      throw new Error("Doctor profile not found");
    }

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    // Get various statistics
    const [appointmentStats, patientStats, labStats] = await Promise.all([
      // Appointment statistics
      db
        .select({
          totalAppointments: sql<number>`count(*)`,
          todayAppointments: sql<number>`count(case when DATE(${appointments.appointmentDate}) = ${todayStr} then 1 end)`,
          completedToday: sql<number>`count(case when DATE(${appointments.appointmentDate}) = ${todayStr} and status = 'completed' then 1 end)`,
          pendingReviews: sql<number>`count(case when status in ('scheduled', 'confirmed') then 1 end)`,
          urgentCases: sql<number>`0`,
        })
        .from(appointments)
        .where(eq(appointments.doctorId, doctor[0].id)),

      // Patient statistics
      db
        .select({
          totalPatients: sql<number>`count(distinct ${appointments.patientId})`,
        })
        .from(appointments)
        .where(eq(appointments.doctorId, doctor[0].id)),

      // Lab statistics
      db
        .select({
          pendingLabResults: sql<number>`count(case when status in ('pending', 'completed') then 1 end)`,
        })
        .from(labResults)
        .where(eq(labResults.doctorId, doctor[0].id)),
    ]);

    // Calculate patient satisfaction from feedback
    const satisfactionResult = await db
      .select({
        avgRating: sql<number>`avg(${feedback.rating})`,
      })
      .from(feedback)
      .leftJoin(patients, eq(feedback.patientId, patients.id))
      .leftJoin(appointments, eq(patients.id, appointments.patientId))
      .where(
        and(
          eq(appointments.doctorId, doctor[0].id),
          sql`${feedback.rating} is not null`
        )
      );

    const patientSatisfaction = satisfactionResult[0]?.avgRating
      ? Number(satisfactionResult[0].avgRating) * 20 // Convert 1-5 rating to percentage
      : 0;

    return {
      success: true,
      stats: {
        todayAppointments: Number(appointmentStats[0]?.todayAppointments) || 0,
        pendingReviews: Number(appointmentStats[0]?.pendingReviews) || 0,
        totalPatients: Number(patientStats[0]?.totalPatients) || 0,
        completedToday: Number(appointmentStats[0]?.completedToday) || 0,
        urgentCases: Number(appointmentStats[0]?.urgentCases) || 0,
        patientSatisfaction: Math.round(patientSatisfaction),
        unreadMessages: 0, // TODO: Add message stats query back
        pendingLabResults: Number(labStats[0]?.pendingLabResults) || 0,
      },
    };
  } catch (error) {
    console.error("Error fetching doctor dashboard stats:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get doctor's today schedule
 */
export async function getDoctorTodaySchedule() {
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

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    const todayAppointments = await db
      .select({
        appointment: appointments,
        patient: {
          id: patients.id,
          name: patientUsers.name,
          phone: patients.phone,
        },
      })
      .from(appointments)
      .leftJoin(patients, eq(appointments.patientId, patients.id))
      .leftJoin(patientUsers, eq(patients.userId, patientUsers.id))
      .where(
        and(
          eq(appointments.doctorId, doctor[0].id),
          sql`DATE(${appointments.appointmentDate}) = ${todayStr}`
        )
      )
      .orderBy(appointments.appointmentTime);

    return {
      success: true,
      schedule: todayAppointments,
    };
  } catch (error) {
    console.error("Error fetching doctor today schedule:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get doctor's recent activities
 */
export async function getDoctorRecentActivities(limit = 10) {
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

    const activities = [];

    // Get recent appointments
    const recentAppointments = await db
      .select({
        id: appointments.id,
        type: sql<string>`'appointment'`,
        message: sql<string>`concat('Appointment ', ${appointments.status}, ' with ', ${patientUsers.name})`,
        time: appointments.updatedAt,
        priority: sql<string>`'normal'`,
      })
      .from(appointments)
      .leftJoin(patients, eq(appointments.patientId, patients.id))
      .leftJoin(patientUsers, eq(patients.userId, patientUsers.id))
      .where(eq(appointments.doctorId, doctor[0].id))
      .orderBy(desc(appointments.updatedAt))
      .limit(5);

    activities.push(...recentAppointments);

    // Get recent medical records
    const recentRecords = await db
      .select({
        id: medicalRecords.id,
        type: sql<string>`'medical_record'`,
        message: sql<string>`concat('Medical record created for ', ${patientUsers.name})`,
        time: medicalRecords.createdAt,
        priority: sql<string>`'normal'`,
      })
      .from(medicalRecords)
      .leftJoin(patients, eq(medicalRecords.patientId, patients.id))
      .leftJoin(patientUsers, eq(patients.userId, patientUsers.id))
      .where(eq(medicalRecords.doctorId, doctor[0].id))
      .orderBy(desc(medicalRecords.createdAt))
      .limit(3);

    activities.push(...recentRecords);

    // Get recent messages
    const recentMessages = await db
      .select({
        id: messages.id,
        type: sql<string>`'message'`,
        message: sql<string>`concat('New message: ', ${messages.subject})`,
        time: messages.createdAt,
        priority: sql<string>`case when ${messages.priority} = 'urgent' then 'high' else 'normal' end`,
      })
      .from(messages)
      .where(eq(messages.recipientId, session.user.id))
      .orderBy(desc(messages.createdAt))
      .limit(2);

    activities.push(...recentMessages);

    // Sort by time and limit
    activities.sort(
      (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
    );

    return {
      success: true,
      activities: activities.slice(0, limit).map((activity) => ({
        id: activity.id,
        type: activity.type,
        message: activity.message,
        time: activity.time.toISOString(),
        priority: activity.priority,
      })),
    };
  } catch (error) {
    console.error("Error fetching doctor recent activities:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get doctor's assigned patients list
 */
export async function getDoctorPatients(page = 1, limit = 20, search?: string) {
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

    const offset = (page - 1) * limit;

    // Build where clause for assigned patients
    let whereClause = and(
      eq(patientDoctorAssignments.doctorId, doctor[0].id),
      eq(patientDoctorAssignments.isActive, true)
    );

    if (search) {
      whereClause = and(
        whereClause,
        sql`${users.name} ILIKE ${`%${search}%`} OR ${
          patients.phone
        } ILIKE ${`%${search}%`}`
      );
    }

    // Get assigned patients for this doctor with appointment stats
    const patientsWithCount = await db
      .select({
        patient: {
          id: patients.id,
          userId: patients.userId,
          name: users.name,
          email: users.email,
          phone: patients.phone,
          dateOfBirth: patients.dateOfBirth,
          gender: patients.gender,
          bloodType: patients.bloodType,
          allergies: patients.allergies,
          healthScore: patients.healthScore,
        },
        assignmentNotes: patientDoctorAssignments.notes,
        assignedAt: patientDoctorAssignments.assignedAt,
        lastAppointment: sql<Date>`max(${appointments.appointmentDate})`,
        totalAppointments: sql<number>`count(${appointments.id})`,
        total: sql<number>`count(*) over()`,
      })
      .from(patientDoctorAssignments)
      .innerJoin(patients, eq(patientDoctorAssignments.patientId, patients.id))
      .innerJoin(users, eq(patients.userId, users.id))
      .leftJoin(
        appointments,
        and(
          eq(appointments.patientId, patients.id),
          eq(appointments.doctorId, doctor[0].id)
        )
      )
      .where(whereClause)
      .groupBy(
        patients.id,
        patients.userId,
        users.name,
        users.email,
        patients.phone,
        patients.dateOfBirth,
        patients.gender,
        patients.bloodType,
        patients.allergies,
        patients.healthScore,
        patientDoctorAssignments.notes,
        patientDoctorAssignments.assignedAt
      )
      .orderBy(desc(patientDoctorAssignments.assignedAt))
      .limit(limit)
      .offset(offset);

    const total = patientsWithCount[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      patients: patientsWithCount,
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
    console.error("Error fetching doctor assigned patients:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get doctor's department colleagues
 */
export async function getDoctorColleagues() {
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

    if (!doctor[0] || !doctor[0].departmentId) {
      return { success: true, colleagues: [] };
    }

    // Get colleagues in the same department
    const colleagues = await db
      .select({
        doctor: doctors,
        user: {
          id: doctorUsers.id,
          name: doctorUsers.name,
          email: doctorUsers.email,
        },
      })
      .from(doctors)
      .leftJoin(doctorUsers, eq(doctors.userId, doctorUsers.id))
      .where(
        and(
          eq(doctors.departmentId, doctor[0].departmentId),
          sql`${doctors.userId} != ${session.user.id}` // Exclude current doctor
        )
      )
      .orderBy(doctorUsers.name);

    return {
      success: true,
      colleagues,
    };
  } catch (error) {
    console.error("Error fetching doctor colleagues:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get detailed patient information for doctor's patient
 */
export async function getDoctorPatientDetails(patientId: number) {
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

    // Verify doctor has access to this patient (has appointments with them)
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

    // Get patient details
    const patientDetails = await db
      .select({
        patient: patients,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          image: users.image,
        },
      })
      .from(patients)
      .leftJoin(users, eq(patients.userId, users.id))
      .where(eq(patients.id, patientId))
      .limit(1);

    if (!patientDetails[0]) {
      throw new Error("Patient not found");
    }

    const patient = patientDetails[0];

    // Calculate age
    const age = patient.patient.dateOfBirth
      ? new Date().getFullYear() -
        new Date(patient.patient.dateOfBirth).getFullYear()
      : null;

    return {
      success: true,
      patient: {
        id: patient.patient.id,
        userId: patient.patient.userId,
        name: patient.user?.name || "Unknown Patient",
        email: patient.user?.email || "No email",
        phone: patient.patient.phone || "No phone",
        address: patient.patient.address || "No address",
        dateOfBirth: patient.patient.dateOfBirth,
        age,
        gender: patient.patient.gender || "Not specified",
        bloodType: patient.patient.bloodType || "Unknown",
        emergencyContact: patient.patient.emergencyContact || "Not provided",
        emergencyPhone: patient.patient.emergencyPhone || "Not provided",
        insuranceProvider: patient.patient.insuranceProvider || "Not provided",
        insuranceNumber: patient.patient.insuranceNumber || "Not provided",
        allergies: patient.patient.allergies || "No known allergies",
        medicalHistory: patient.patient.medicalHistory || "No medical history",
        healthScore: patient.patient.healthScore || 0,
        status: "active", // Default status since not in schema
        riskLevel:
          patient.patient.healthScore && patient.patient.healthScore > 70
            ? "low"
            : patient.patient.healthScore && patient.patient.healthScore > 40
            ? "medium"
            : "high",
        image: patient.user?.image || null,
      },
    };
  } catch (error) {
    console.error("Error fetching doctor patient details:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get patient's appointments for doctor
 */
export async function getDoctorPatientAppointments(patientId: number) {
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

    // Get appointments for this patient with this doctor
    const patientAppointments = await db
      .select({
        appointment: appointments,
        patient: {
          name: patientUsers.name,
        },
      })
      .from(appointments)
      .leftJoin(patientUsers, eq(appointments.patientId, patientUsers.id))
      .where(
        and(
          eq(appointments.patientId, patientId),
          eq(appointments.doctorId, doctor[0].id)
        )
      )
      .orderBy(
        desc(appointments.appointmentDate),
        desc(appointments.appointmentTime)
      );

    return {
      success: true,
      appointments: patientAppointments,
    };
  } catch (error) {
    console.error("Error fetching doctor patient appointments:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get patient's medications for doctor
 */
export async function getDoctorPatientMedications(patientId: number) {
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
      throw new Error("Access denied to patient medications");
    }

    // Get medications prescribed by this doctor to this patient
    const patientMedications = await db
      .select({
        medication: medications,
      })
      .from(medications)
      .where(
        and(
          eq(medications.patientId, patientId),
          eq(medications.prescribedBy, doctor[0].id)
        )
      )
      .orderBy(desc(medications.startDate));

    return {
      success: true,
      medications: patientMedications,
    };
  } catch (error) {
    console.error("Error fetching doctor patient medications:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get patient's lab results for doctor
 */
export async function getDoctorPatientLabResults(patientId: number) {
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
      throw new Error("Access denied to patient lab results");
    }

    // Get lab results ordered by this doctor for this patient
    const patientLabResults = await db
      .select({
        labResult: labResults,
      })
      .from(labResults)
      .where(
        and(
          eq(labResults.patientId, patientId),
          eq(labResults.doctorId, doctor[0].id)
        )
      )
      .orderBy(desc(labResults.testDate));

    // Parse JSON fields
    const parsedResults = patientLabResults.map((item) => ({
      ...item.labResult,
      results: item.labResult.results
        ? JSON.parse(item.labResult.results)
        : null,
      attachments: item.labResult.attachments
        ? JSON.parse(item.labResult.attachments)
        : [],
    }));

    return {
      success: true,
      labResults: parsedResults,
    };
  } catch (error) {
    console.error("Error fetching doctor patient lab results:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get patient's vital signs for doctor
 */
export async function getDoctorPatientVitalSigns(patientId: number) {
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

    // Get vital signs from medical records
    const vitalSignsRecords = await db
      .select({
        record: medicalRecords,
      })
      .from(medicalRecords)
      .where(
        and(
          eq(medicalRecords.patientId, patientId),
          sql`${medicalRecords.vitalSigns} IS NOT NULL`
        )
      )
      .orderBy(desc(medicalRecords.createdAt));

    const vitalSigns = vitalSignsRecords
      .map((item) => {
        try {
          const vitals = item.record.vitalSigns
            ? JSON.parse(item.record.vitalSigns)
            : null;
          return {
            ...item.record,
            vitalSigns: vitals,
          };
        } catch (error) {
          console.error("Error parsing vital signs:", error);
          return null;
        }
      })
      .filter(Boolean);

    return {
      success: true,
      vitalSigns,
    };
  } catch (error) {
    console.error("Error fetching doctor patient vital signs:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get doctor's notifications
 */
export async function getDoctorNotifications() {
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

    // Get notifications for this doctor
    const doctorNotifications = await db
      .select({
        notification: notifications,
      })
      .from(notifications)
      .where(eq(notifications.userId, session.user.id))
      .orderBy(desc(notifications.createdAt));

    return {
      success: true,
      notifications: doctorNotifications,
    };
  } catch (error) {
    console.error("Error fetching doctor notifications:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Mark notification as read
 */
export async function markDoctorNotificationAsRead(notificationId: number) {
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

    // Verify notification belongs to this user
    const notification = await db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, session.user.id)
        )
      )
      .limit(1);

    if (!notification[0]) {
      throw new Error("Notification not found or access denied");
    }

    await db
      .update(notifications)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(eq(notifications.id, notificationId));

    return { success: true };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
