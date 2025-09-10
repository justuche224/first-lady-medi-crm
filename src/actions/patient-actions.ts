"use server";

import { db } from "@/db";
import { user as users, patients} from "@/db/schema";
import { eq, sql, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export interface CreatePatientData {
  name: string;
  email: string;
  password: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  bloodType?: string;
  allergies?: string;
  medicalHistory?: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
}

export interface UpdatePatientData {
  name?: string;
  email?: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  bloodType?: string;
  allergies?: string;
  medicalHistory?: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
}

async function verifyAdminAccess() {
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

  return user[0];
}

export async function createPatient(patientData: CreatePatientData) {
  try {
    await verifyAdminAccess();

    const newUser = await auth.api.signUpEmail({
      body: {
        email: patientData.email,
        password: patientData.password,
        name: patientData.name,
        role: "patient",
      },
    });

    if (!newUser || !newUser.user?.id) {
      throw new Error("Failed to create user account");
    }

    await db.insert(patients).values({
      userId: newUser.user.id,
      dateOfBirth: patientData.dateOfBirth || null,
      gender: patientData.gender || null,
      phone: patientData.phone || null,
      address: patientData.address || null,
      emergencyContact: patientData.emergencyContact || null,
      emergencyPhone: patientData.emergencyPhone || null,
      bloodType: patientData.bloodType || null,
      allergies: patientData.allergies || null,
      medicalHistory: patientData.medicalHistory || null,
      insuranceProvider: patientData.insuranceProvider || null,
      insuranceNumber: patientData.insuranceNumber || null,
    });

    revalidatePath("/admin/patients");
    return { success: true, userId: newUser.user.id };
  } catch (error) {
    console.error("Error creating patient:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getPatients(page = 1, limit = 10, search?: string) {
  try {
    await verifyAdminAccess();

    const offset = (page - 1) * limit;

    let whereClause = sql`true`;
    if (search) {
      whereClause = sql`(${users.name} ILIKE ${`%${search}%`} OR ${
        users.email
      } ILIKE ${`%${search}%`} OR ${patients.phone} ILIKE ${`%${search}%`})`;
    }

    const patientsWithCount = await db
      .select({
        id: patients.id,
        userId: users.id,
        name: users.name,
        email: users.email,
        banned: users.banned,
        createdAt: users.createdAt,
        dateOfBirth: patients.dateOfBirth,
        gender: patients.gender,
        phone: patients.phone,
        address: patients.address,
        emergencyContact: patients.emergencyContact,
        emergencyPhone: patients.emergencyPhone,
        bloodType: patients.bloodType,
        allergies: patients.allergies,
        medicalHistory: patients.medicalHistory,
        insuranceProvider: patients.insuranceProvider,
        insuranceNumber: patients.insuranceNumber,
        healthScore: patients.healthScore,
        total: sql<number>`count(*) over()`,
      })
      .from(patients)
      .innerJoin(users, eq(patients.userId, users.id))
      .where(and(eq(users.role, "patient"), whereClause))
      .orderBy(users.createdAt)
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
    console.error("Error fetching patients:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getPatientDetails(patientId: number) {
  try {
    await verifyAdminAccess();

    const patientDetails = await db
      .select({
        id: patients.id,
        userId: users.id,
        name: users.name,
        email: users.email,
        banned: users.banned,
        banReason: users.banReason,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        dateOfBirth: patients.dateOfBirth,
        gender: patients.gender,
        phone: patients.phone,
        address: patients.address,
        emergencyContact: patients.emergencyContact,
        emergencyPhone: patients.emergencyPhone,
        bloodType: patients.bloodType,
        allergies: patients.allergies,
        medicalHistory: patients.medicalHistory,
        insuranceProvider: patients.insuranceProvider,
        insuranceNumber: patients.insuranceNumber,
        healthScore: patients.healthScore,
      })
      .from(patients)
      .innerJoin(users, eq(patients.userId, users.id))
      .where(eq(patients.id, patientId))
      .limit(1);

    if (!patientDetails[0]) {
      throw new Error("Patient not found");
    }

    return {
      success: true,
      patient: patientDetails[0],
    };
  } catch (error) {
    console.error("Error fetching patient details:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updatePatient(
  patientId: number,
  updates: UpdatePatientData
) {
  try {
    await verifyAdminAccess();

    const patient = await db
      .select({ userId: patients.userId })
      .from(patients)
      .where(eq(patients.id, patientId))
      .limit(1);

    if (!patient[0]) {
      throw new Error("Patient not found");
    }

    if (updates.name || updates.email) {
      await db
        .update(users)
        .set({
          name: updates.name,
          email: updates.email,
          updatedAt: new Date(),
        })
        .where(eq(users.id, patient[0].userId));
    }

    await db
      .update(patients)
      .set({
        dateOfBirth: updates.dateOfBirth || undefined,
        gender: updates.gender,
        phone: updates.phone,
        address: updates.address,
        emergencyContact: updates.emergencyContact,
        emergencyPhone: updates.emergencyPhone,
        bloodType: updates.bloodType,
        allergies: updates.allergies,
        medicalHistory: updates.medicalHistory,
        insuranceProvider: updates.insuranceProvider,
        insuranceNumber: updates.insuranceNumber,
        updatedAt: new Date(),
      })
      .where(eq(patients.id, patientId));

    revalidatePath("/admin/patients");
    return { success: true };
  } catch (error) {
    console.error("Error updating patient:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function deletePatient(patientId: number) {
  try {
    await verifyAdminAccess();

    const patient = await db
      .select({ userId: patients.userId })
      .from(patients)
      .where(eq(patients.id, patientId))
      .limit(1);

    if (!patient[0]) {
      throw new Error("Patient not found");
    }

    await db.delete(patients).where(eq(patients.id, patientId));
    await db.delete(users).where(eq(users.id, patient[0].userId));

    revalidatePath("/admin/patients");
    return { success: true };
  } catch (error) {
    console.error("Error deleting patient:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function togglePatientBan(
  patientId: number,
  banned: boolean,
  banReason?: string
) {
  try {
    await verifyAdminAccess();

    const patient = await db
      .select({ userId: patients.userId })
      .from(patients)
      .where(eq(patients.id, patientId))
      .limit(1);

    if (!patient[0]) {
      throw new Error("Patient not found");
    }

    await db
      .update(users)
      .set({
        banned,
        banReason: banned ? banReason : null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, patient[0].userId));

    revalidatePath("/admin/patients");
    return { success: true };
  } catch (error) {
    console.error("Error toggling patient ban:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
