/**
 * Reports and Analytics Server Actions
 *
 * Handles report generation and analytics for the medical CRM system.
 * Primarily used by administrators and management.
 */

"use server";

import { db } from "@/db";
import {
  reports,
  user as users,
  appointments,
  patients,
  doctors,
  departments,
  feedback,
} from "@/db/schema";
import { eq, and, sql, desc, gte, lte } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

// Types
export interface GenerateReportData {
  title: string;
  type: string;
  description?: string;
  dateRange: {
    start: Date;
    end: Date;
  };
  parameters?: Record<string, unknown>;
}

/**
 * Generate appointment statistics report
 *
 * Creates a comprehensive report on appointment statistics.
 */
export async function generateAppointmentReport(dateRange: {
  start: Date;
  end: Date;
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

    if (!user[0] || (user[0].role !== "admin" && user[0].role !== "staff")) {
      throw new Error("Admin or staff access required");
    }

    // Generate appointment statistics
    const appointmentStats = await db
      .select({
        totalAppointments: sql<number>`count(*)`,
        scheduled: sql<number>`count(case when status = 'scheduled' then 1 end)`,
        confirmed: sql<number>`count(case when status = 'confirmed' then 1 end)`,
        completed: sql<number>`count(case when status = 'completed' then 1 end)`,
        cancelled: sql<number>`count(case when status = 'cancelled' then 1 end)`,
        noShow: sql<number>`count(case when status = 'no_show' then 1 end)`,
        avgDuration: sql<number>`avg(duration)`,
        byDepartment: sql<string>`json_agg(json_build_object(
          'department', departments.name,
          'count', count(*)
        ))`,
      })
      .from(appointments)
      .leftJoin(doctors, eq(appointments.doctorId, doctors.id))
      .leftJoin(departments, eq(doctors.departmentId, departments.id))
      .where(
        and(
          gte(appointments.createdAt, dateRange.start),
          lte(appointments.createdAt, dateRange.end)
        )
      );

    const reportData = {
      period: {
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString(),
      },
      statistics: appointmentStats[0],
      generatedAt: new Date().toISOString(),
      generatedBy: session.user.id,
    };

    // Save report
    const savedReport = await db
      .insert(reports)
      .values({
        title: `Appointment Statistics Report - ${dateRange.start.toDateString()} to ${dateRange.end.toDateString()}`,
        type: "appointment_stats",
        description: "Comprehensive appointment statistics and trends",
        data: JSON.stringify(reportData),
        generatedBy: session.user.id,
        dateRange: `${dateRange.start.toISOString().split("T")[0]} to ${
          dateRange.end.toISOString().split("T")[0]
        }`,
      })
      .returning();

    revalidatePath("/reports");

    return { success: true, report: savedReport[0], data: reportData };
  } catch (error) {
    console.error("Error generating appointment report:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Generate patient statistics report
 *
 * Creates a report on patient demographics and statistics.
 */
export async function generatePatientReport(dateRange: {
  start: Date;
  end: Date;
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

    if (!user[0] || (user[0].role !== "admin" && user[0].role !== "staff")) {
      throw new Error("Admin or staff access required");
    }

    // Generate patient statistics
    const patientStats = await db
      .select({
        totalPatients: sql<number>`count(*)`,
        newPatients: sql<number>`count(case when ${users.createdAt} between ${dateRange.start} and ${dateRange.end} then 1 end)`,
        avgAge: sql<number>`avg(extract(year from age(${patients.dateOfBirth})))`,
        byGender: sql<string>`json_agg(json_build_object(
          'gender', gender,
          'count', count(*)
        ))`,
        byDepartment: sql<string>`json_agg(json_build_object(
          'department', departments.name,
          'patient_count', count(distinct p.id)
        ))`,
      })
      .from(patients)
      .leftJoin(users, eq(patients.userId, users.id))
      .leftJoin(appointments, eq(patients.id, appointments.patientId))
      .leftJoin(doctors, eq(appointments.doctorId, doctors.id))
      .leftJoin(departments, eq(doctors.departmentId, departments.id))
      .groupBy(
        patients.id,
        users.createdAt,
        patients.dateOfBirth,
        patients.gender
      );

    const reportData = {
      period: {
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString(),
      },
      statistics: patientStats[0],
      generatedAt: new Date().toISOString(),
      generatedBy: session.user.id,
    };

    // Save report
    const savedReport = await db
      .insert(reports)
      .values({
        title: `Patient Statistics Report - ${dateRange.start.toDateString()} to ${dateRange.end.toDateString()}`,
        type: "patient_stats",
        description: "Patient demographics and registration statistics",
        data: JSON.stringify(reportData),
        generatedBy: session.user.id,
        dateRange: `${dateRange.start.toISOString().split("T")[0]} to ${
          dateRange.end.toISOString().split("T")[0]
        }`,
      })
      .returning();

    revalidatePath("/reports");

    return { success: true, report: savedReport[0], data: reportData };
  } catch (error) {
    console.error("Error generating patient report:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Generate revenue report
 *
 * Creates a financial report based on appointments and services.
 */
export async function generateRevenueReport(dateRange: {
  start: Date;
  end: Date;
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

    if (!user[0] || user[0].role !== "admin") {
      throw new Error("Admin access required");
    }

    // Generate revenue statistics
    const revenueStats = await db
      .select({
        totalRevenue: sql<number>`sum(coalesce(${doctors.consultationFee}, 0))`,
        totalAppointments: sql<number>`count(*)`,
        avgRevenuePerAppointment: sql<number>`avg(coalesce(${doctors.consultationFee}, 0))`,
        byDepartment: sql<string>`json_agg(json_build_object(
          'department', departments.name,
          'revenue', sum(coalesce(${doctors.consultationFee}, 0)),
          'appointments', count(*)
        ))`,
        byDoctor: sql<string>`json_agg(json_build_object(
          'doctor', users.name,
          'revenue', sum(coalesce(${doctors.consultationFee}, 0)),
          'appointments', count(*)
        ))`,
      })
      .from(appointments)
      .leftJoin(doctors, eq(appointments.doctorId, doctors.id))
      .leftJoin(users, eq(doctors.userId, users.id))
      .leftJoin(departments, eq(doctors.departmentId, departments.id))
      .where(
        and(
          eq(appointments.status, "completed"),
          gte(appointments.createdAt, dateRange.start),
          lte(appointments.createdAt, dateRange.end)
        )
      );

    const reportData = {
      period: {
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString(),
      },
      statistics: revenueStats[0],
      generatedAt: new Date().toISOString(),
      generatedBy: session.user.id,
    };

    // Save report
    const savedReport = await db
      .insert(reports)
      .values({
        title: `Revenue Report - ${dateRange.start.toDateString()} to ${dateRange.end.toDateString()}`,
        type: "revenue",
        description: "Financial performance and revenue analysis",
        data: JSON.stringify(reportData),
        generatedBy: session.user.id,
        dateRange: `${dateRange.start.toISOString().split("T")[0]} to ${
          dateRange.end.toISOString().split("T")[0]
        }`,
      })
      .returning();

    revalidatePath("/reports");

    return { success: true, report: savedReport[0], data: reportData };
  } catch (error) {
    console.error("Error generating revenue report:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get all reports
 *
 * Retrieves paginated list of generated reports.
 */
export async function getReports(page = 1, limit = 20, type?: string) {
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

    if (!user[0] || (user[0].role !== "admin" && user[0].role !== "staff")) {
      throw new Error("Admin or staff access required");
    }

    const offset = (page - 1) * limit;

    // Build where clause
    let whereClause = sql`true`;

    if (type && type !== "all") {
      whereClause = sql`${reports.type} = ${type}`;
    }

    // Get reports with related data
    const reportsWithCount = await db
      .select({
        report: reports,
        generatedBy: {
          name: users.name,
        },
        total: sql<number>`count(*) over()`,
      })
      .from(reports)
      .leftJoin(users, eq(reports.generatedBy, users.id))
      .where(whereClause)
      .orderBy(desc(reports.generatedAt))
      .limit(limit)
      .offset(offset);

    const total = reportsWithCount[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      reports: reportsWithCount,
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
    console.error("Error fetching reports:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get dashboard statistics
 *
 * Returns key metrics for the admin dashboard.
 */
export async function getDashboardStatistics() {
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

    // Get current date for filtering
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Get various statistics
    const [userStats, appointmentStats, departmentStats, feedbackStats] =
      await Promise.all([
        // User statistics
        db
          .select({
            totalUsers: sql<number>`count(*)`,
            totalPatients: sql<number>`count(case when role = 'patient' then 1 end)`,
            totalDoctors: sql<number>`count(case when role = 'doctor' then 1 end)`,
            totalStaff: sql<number>`count(case when role = 'staff' then 1 end)`,
            newUsersThisMonth: sql<number>`count(case when ${users.createdAt} between ${startOfMonth} and ${endOfMonth} then 1 end)`,
          })
          .from(users),

        // Appointment statistics
        db
          .select({
            totalAppointments: sql<number>`count(*)`,
            todayAppointments: sql<number>`count(case when date(${appointments.appointmentDate}) = current_date then 1 end)`,
            completedAppointments: sql<number>`count(case when status = 'completed' then 1 end)`,
            pendingAppointments: sql<number>`count(case when status in ('scheduled', 'confirmed') then 1 end)`,
          })
          .from(appointments),

        // Department statistics
        db
          .select({
            totalDepartments: sql<number>`count(*)`,
          })
          .from(departments),

        // Feedback statistics
        db
          .select({
            totalFeedback: sql<number>`count(*)`,
            pendingFeedback: sql<number>`count(case when status in ('open', 'in_progress') then 1 end)`,
            resolvedFeedback: sql<number>`count(case when status in ('resolved', 'closed') then 1 end)`,
          })
          .from(feedback),
      ]);

    return {
      success: true,
      statistics: {
        users: userStats[0],
        appointments: appointmentStats[0],
        departments: departmentStats[0],
        feedback: feedbackStats[0],
      },
    };
  } catch (error) {
    console.error("Error fetching dashboard statistics:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Delete report (Admin Only)
 *
 * Deletes a generated report.
 */
export async function deleteReport(reportId: number) {
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

    await db.delete(reports).where(eq(reports.id, reportId));

    revalidatePath("/reports");

    return { success: true };
  } catch (error) {
    console.error("Error deleting report:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
