/**
 * Appointment Management Server Actions
 *
 * Handles appointment scheduling, updates, and management for all user roles.
 */

"use server";

import { db } from "@/db";
import {
  appointments,
  user,
  patients,
  doctors,
} from "@/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { alias } from "drizzle-orm/pg-core";

// Create proper aliases for the user table
const patientUsers = alias(user, 'patientUsers');
const doctorUsers = alias(user, 'doctorUsers');

// Types
export interface CreateAppointmentData {
  patientId: number;
  doctorId: number;
  appointmentDate: Date;
  appointmentTime: string;
  duration?: number;
  type: string;
  reason?: string;
  symptoms?: string;
  notes?: string;
}

export interface UpdateAppointmentData {
  appointmentDate?: Date;
  appointmentTime?: string;
  duration?: number;
  type?: string;
  reason?: string;
  symptoms?: string;
  notes?: string;
  diagnosis?: string;
  prescription?: string;
  followUpRequired?: boolean;
  followUpDate?: Date;
  status?: "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show";
}

/**
 * Create a new appointment
 *
 * Patients can book appointments, doctors can create appointments, admins can create any appointment.
 */
export async function createAppointment(
  appointmentData: CreateAppointmentData
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const currentUser = await db
      .select()
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    if (!currentUser[0]) {
      throw new Error("User not found");
    }

    // Verify patient exists
    const patient = await db
      .select()
      .from(patients)
      .where(eq(patients.id, appointmentData.patientId))
      .limit(1);

    if (!patient[0]) {
      throw new Error("Patient not found");
    }

    // Verify doctor exists
    const doctor = await db
      .select()
      .from(doctors)
      .where(eq(doctors.id, appointmentData.doctorId))
      .limit(1);

    if (!doctor[0]) {
      throw new Error("Doctor not found");
    }

    // Access control
    if (currentUser[0].role === "patient") {
      // Patients can only book appointments for themselves
      if (patient[0].userId !== session.user.id) {
        throw new Error("You can only book appointments for yourself");
      }
    } else if (currentUser[0].role === "doctor") {
      // Doctors can only create appointments for their patients
      if (doctor[0].userId !== session.user.id) {
        throw new Error("You can only create appointments for yourself");
      }
    }
    // Admins and staff can create appointments for any patient/doctor

    // Check for scheduling conflicts
    const conflictCheck = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.doctorId, appointmentData.doctorId),
          eq(
            appointments.appointmentDate,
            appointmentData.appointmentDate.toISOString()
          ),
          sql`${appointments.appointmentTime} = ${appointmentData.appointmentTime}`
        )
      )
      .limit(1);

    if (conflictCheck[0]) {
      throw new Error("Doctor has a scheduling conflict at this time");
    }

    const newAppointment = await db
      .insert(appointments)
      .values({
        patientId: appointmentData.patientId,
        doctorId: appointmentData.doctorId,
        appointmentDate: appointmentData.appointmentDate.toISOString(),
        appointmentTime: appointmentData.appointmentTime,
        duration: appointmentData.duration || 30,
        type: appointmentData.type,
        reason: appointmentData.reason,
        symptoms: appointmentData.symptoms,
        notes: appointmentData.notes,
        status: "scheduled",
      })
      .returning();

    revalidatePath("/appointments");
    revalidatePath("/dashboard");

    return { success: true, appointment: newAppointment[0] };
  } catch (error) {
    console.error("Error creating appointment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get appointments based on user role
 *
 * - Patients see their own appointments
 * - Doctors see their scheduled appointments
 * - Admins see all appointments
 */
export async function getAppointments(
  page = 1,
  limit = 20,
  status?: string,
  dateRange?: { start: Date; end: Date }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const currentUser = await db
      .select()
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    if (!currentUser[0]) {
      throw new Error("User not found");
    }

    const offset = (page - 1) * limit;

    // Build where clause based on user role
    let whereClause = sql`true`;

    if (currentUser[0].role === "patient") {
      const patient = await db
        .select()
        .from(patients)
        .where(eq(patients.userId, session.user.id))
        .limit(1);

      if (patient[0]) {
        whereClause = sql`${appointments.patientId} = ${patient[0].id}`;
      }
    } else if (currentUser[0].role === "doctor") {
      const doctor = await db
        .select()
        .from(doctors)
        .where(eq(doctors.userId, session.user.id))
        .limit(1);

      if (doctor[0]) {
        whereClause = sql`${appointments.doctorId} = ${doctor[0].id}`;
      }
    }
    // Admins and staff see all appointments

    // Add status filter
    if (status && status !== "all") {
      whereClause = sql`${whereClause} AND ${appointments.status} = ${status}`;
    }

    // Add date range filter
    if (dateRange) {
      whereClause = sql`${whereClause} AND ${
        appointments.appointmentDate
      } BETWEEN ${dateRange.start.toISOString()} AND ${dateRange.end.toISOString()}`;
    }

    // Get appointments with related data using proper aliases
    const appointmentsWithCount = await db
      .select({
        appointment: appointments,
        patient: {
          id: patients.id,
          userId: patients.userId,
          name: patientUsers.name,
          email: patientUsers.email,
        },
        doctor: {
          id: doctors.id,
          userId: doctors.userId,
          name: doctorUsers.name,
          specialty: doctors.specialty,
        },
        total: sql<number>`count(*) over()`,
      })
      .from(appointments)
      .leftJoin(patients, eq(appointments.patientId, patients.id))
      .leftJoin(patientUsers, eq(patients.userId, patientUsers.id))
      .leftJoin(doctors, eq(appointments.doctorId, doctors.id))
      .leftJoin(doctorUsers, eq(doctors.userId, doctorUsers.id))
      .where(whereClause)
      .orderBy(
        desc(appointments.appointmentDate),
        desc(appointments.appointmentTime)
      )
      .limit(limit)
      .offset(offset);

    const total = appointmentsWithCount[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      appointments: appointmentsWithCount,
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
    console.error("Error fetching appointments:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Update appointment
 *
 * Updates appointment details based on user permissions.
 */
export async function updateAppointment(
  appointmentId: number,
  updates: UpdateAppointmentData
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const currentUser = await db
      .select()
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    if (!currentUser[0]) {
      throw new Error("User not found");
    }

    // Get the appointment
    const appointment = await db
      .select({
        appointment: appointments,
        patient: patients,
        doctor: doctors,
      })
      .from(appointments)
      .leftJoin(patients, eq(appointments.patientId, patients.id))
      .leftJoin(doctors, eq(appointments.doctorId, doctors.id))
      .where(eq(appointments.id, appointmentId))
      .limit(1);

    if (!appointment[0]) {
      throw new Error("Appointment not found");
    }

    // Access control
    if (currentUser[0].role === "patient") {
      // Patients can only update their own appointments
      if (appointment[0].patient?.userId !== session.user.id) {
        throw new Error("You can only update your own appointments");
      }
      // Patients can only update limited fields
      const allowedFields: (keyof UpdateAppointmentData)[] = [
        "reason",
        "symptoms",
      ];
      const requestedFields = Object.keys(
        updates
      ) as (keyof UpdateAppointmentData)[];
      const hasUnauthorizedFields = requestedFields.some(
        (field) => !allowedFields.includes(field)
      );

      if (hasUnauthorizedFields) {
        throw new Error("You can only update reason and symptoms");
      }
    } else if (currentUser[0].role === "doctor") {
      // Doctors can only update their own appointments
      if (appointment[0].doctor?.userId !== session.user.id) {
        throw new Error("You can only update your own appointments");
      }
    }
    // Admins and staff can update any appointment

    await db
      .update(appointments)
      .set({
        ...updates,
        appointmentDate: updates.appointmentDate?.toISOString(),
        followUpDate: updates.followUpDate?.toISOString(),
        updatedAt: new Date(),
      })
      .where(eq(appointments.id, appointmentId));

    revalidatePath("/appointments");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Error updating appointment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Cancel appointment
 *
 * Cancels an appointment with optional reason.
 */
export async function cancelAppointment(
  appointmentId: number,
  cancelReason?: string
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const currentUser = await db
      .select()
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    if (!currentUser[0]) {
      throw new Error("User not found");
    }

    // Get the appointment
    const appointment = await db
      .select({
        appointment: appointments,
        patient: patients,
        doctor: doctors,
      })
      .from(appointments)
      .leftJoin(patients, eq(appointments.patientId, patients.id))
      .leftJoin(doctors, eq(appointments.doctorId, doctors.id))
      .where(eq(appointments.id, appointmentId))
      .limit(1);

    if (!appointment[0]) {
      throw new Error("Appointment not found");
    }

    // Access control
    if (currentUser[0].role === "patient") {
      if (appointment[0].patient?.userId !== session.user.id) {
        throw new Error("You can only cancel your own appointments");
      }
    } else if (currentUser[0].role === "doctor") {
      if (appointment[0].doctor?.userId !== session.user.id) {
        throw new Error("You can only cancel your own appointments");
      }
    }

    await db
      .update(appointments)
      .set({
        status: "cancelled",
        cancelledBy: session.user.id,
        cancelReason,
        updatedAt: new Date(),
      })
      .where(eq(appointments.id, appointmentId));

    revalidatePath("/appointments");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get appointment details
 *
 * Retrieves complete appointment information with related data.
 */
export async function getAppointmentDetails(appointmentId: number) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const currentUser = await db
      .select()
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    if (!currentUser[0]) {
      throw new Error("User not found");
    }

    // Get appointment with all related data
    const appointmentDetails = await db
      .select({
        appointment: appointments,
        patient: {
          id: patients.id,
          userId: patients.userId,
          name: patientUsers.name,
          email: patientUsers.email,
          phone: patients.phone,
          dateOfBirth: patients.dateOfBirth,
        },
        doctor: {
          id: doctors.id,
          userId: doctors.userId,
          name: doctorUsers.name,
          specialty: doctors.specialty,
          licenseNumber: doctors.licenseNumber,
        },
      })
      .from(appointments)
      .leftJoin(patients, eq(appointments.patientId, patients.id))
      .leftJoin(patientUsers, eq(patients.userId, patientUsers.id))
      .leftJoin(doctors, eq(appointments.doctorId, doctors.id))
      .leftJoin(doctorUsers, eq(doctors.userId, doctorUsers.id))
      .where(eq(appointments.id, appointmentId))
      .limit(1);

    if (!appointmentDetails[0]) {
      throw new Error("Appointment not found");
    }

    const appointment = appointmentDetails[0];

    // Access control
    if (currentUser[0].role === "patient") {
      if (appointment.patient?.userId !== session.user.id) {
        throw new Error("You can only view your own appointments");
      }
    } else if (currentUser[0].role === "doctor") {
      if (appointment.doctor?.userId !== session.user.id) {
        throw new Error("You can only view your own appointments");
      }
    }

    return { success: true, appointment };
  } catch (error) {
    console.error("Error fetching appointment details:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get available time slots for a doctor on a specific date
 *
 * Returns available time slots for appointment booking.
 */
export async function getAvailableSlots(doctorId: number, date: Date) {
  try {
    // Get doctor's working hours (this would be configurable in a real app)
    // For now, assume 9 AM to 5 PM with 30-minute slots
    const workingHours = {
      start: "09:00",
      end: "17:00",
      slotDuration: 30, // minutes
    };

    // Get existing appointments for the date
    const existingAppointments = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.doctorId, doctorId),
          eq(appointments.appointmentDate, date.toISOString()),
          sql`${appointments.status} IN ('scheduled', 'confirmed')`
        )
      );

    // Generate all possible time slots
    const slots = [];
    const startTime = new Date(
      `${date.toISOString().split("T")[0]}T${workingHours.start}`
    );
    const endTime = new Date(
      `${date.toISOString().split("T")[0]}T${workingHours.end}`
    );

    const currentTime = new Date(startTime);

    while (currentTime < endTime) {
      const timeString = currentTime.toTimeString().slice(0, 5); // HH:MM format

      // Check if this slot is already booked
      const isBooked = existingAppointments.some(
        (apt) => apt.appointmentTime === timeString
      );

      if (!isBooked) {
        slots.push({
          time: timeString,
          available: true,
        });
      }

      currentTime.setMinutes(
        currentTime.getMinutes() + workingHours.slotDuration
      );
    }

    return { success: true, slots };
  } catch (error) {
    console.error("Error fetching available slots:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}