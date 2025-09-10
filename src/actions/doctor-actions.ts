"use server";

import { db } from "@/db";
import { user as users, doctors, departments } from "@/db/schema";
import { eq, sql, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export interface CreateDoctorData {
  name: string;
  email: string;
  password: string;
  licenseNumber: string;
  specialty: string;
  departmentId?: number;
  yearsOfExperience?: number;
  education?: string;
  certifications?: string;
  consultationFee?: number;
}

export interface UpdateDoctorData {
  name?: string;
  email?: string;
  licenseNumber?: string;
  specialty?: string;
  departmentId?: number;
  yearsOfExperience?: number;
  education?: string;
  certifications?: string;
  consultationFee?: number;
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

export async function createDoctor(doctorData: CreateDoctorData) {
  try {
    await verifyAdminAccess();

    const existingLicense = await db
      .select()
      .from(doctors)
      .where(eq(doctors.licenseNumber, doctorData.licenseNumber))
      .limit(1);

    if (existingLicense[0]) {
      throw new Error("License number already exists");
    }

    const newUser = await auth.api.signUpEmail({
      body: {
        email: doctorData.email,
        password: doctorData.password,
        name: doctorData.name,
        role: "doctor",
      },
    });

    if (!newUser || !newUser.user?.id) {
      throw new Error("Failed to create user account");
    }

    await db.insert(doctors).values({
      userId: newUser.user.id,
      licenseNumber: doctorData.licenseNumber,
      specialty: doctorData.specialty,
      departmentId: doctorData.departmentId || null,
      yearsOfExperience: doctorData.yearsOfExperience || 0,
      education: doctorData.education || null,
      certifications: doctorData.certifications || null,
      consultationFee: doctorData.consultationFee?.toString() || null,
    });

    revalidatePath("/admin/doctors");
    return { success: true, userId: newUser.user.id };
  } catch (error) {
    console.error("Error creating doctor:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getDoctors(page = 1, limit = 10, search?: string) {
  try {
    await verifyAdminAccess();

    const offset = (page - 1) * limit;

    let whereClause = sql`true`;
    if (search) {
      whereClause = sql`(${users.name} ILIKE ${`%${search}%`} OR ${
        users.email
      } ILIKE ${`%${search}%`} OR ${
        doctors.specialty
      } ILIKE ${`%${search}%`} OR ${
        doctors.licenseNumber
      } ILIKE ${`%${search}%`})`;
    }

    const doctorsWithCount = await db
      .select({
        id: doctors.id,
        userId: users.id,
        name: users.name,
        email: users.email,
        banned: users.banned,
        createdAt: users.createdAt,
        licenseNumber: doctors.licenseNumber,
        specialty: doctors.specialty,
        departmentId: doctors.departmentId,
        departmentName: departments.name,
        yearsOfExperience: doctors.yearsOfExperience,
        education: doctors.education,
        certifications: doctors.certifications,
        consultationFee: doctors.consultationFee,
        rating: doctors.rating,
        totalPatients: doctors.totalPatients,
        total: sql<number>`count(*) over()`,
      })
      .from(doctors)
      .innerJoin(users, eq(doctors.userId, users.id))
      .leftJoin(departments, eq(doctors.departmentId, departments.id))
      .where(and(eq(users.role, "doctor"), whereClause))
      .orderBy(users.createdAt)
      .limit(limit)
      .offset(offset);

    const total = doctorsWithCount[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      doctors: doctorsWithCount,
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
    console.error("Error fetching doctors:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get available doctors for appointment booking
 *
 * This function is accessible to patients and returns only essential doctor information
 * needed for appointment booking (no sensitive admin data).
 */
export async function getAvailableDoctorsForBooking(
  page = 1,
  limit = 50,
  search?: string
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const offset = (page - 1) * limit;

    let whereClause = sql`true`;
    if (search) {
      whereClause = sql`(${users.name} ILIKE ${`%${search}%`} OR ${
        doctors.specialty
      } ILIKE ${`%${search}%`})`;
    }

    // Only get active, non-banned doctors for appointment booking
    const doctorsWithCount = await db
      .select({
        id: doctors.id,
        userId: users.id,
        name: users.name,
        email: users.email,
        licenseNumber: doctors.licenseNumber,
        specialty: doctors.specialty,
        departmentId: doctors.departmentId,
        departmentName: departments.name,
        yearsOfExperience: doctors.yearsOfExperience,
        consultationFee: doctors.consultationFee,
        rating: doctors.rating,
        total: sql<number>`count(*) over()`,
      })
      .from(doctors)
      .innerJoin(users, eq(doctors.userId, users.id))
      .leftJoin(departments, eq(doctors.departmentId, departments.id))
      .where(
        and(eq(users.role, "doctor"), eq(users.banned, false), whereClause)
      )
      .orderBy(users.name)
      .limit(limit)
      .offset(offset);

    const total = doctorsWithCount[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      doctors: doctorsWithCount,
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
    console.error("Error fetching available doctors:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getDoctorDetails(doctorId: number) {
  try {
    await verifyAdminAccess();

    const doctorDetails = await db
      .select({
        id: doctors.id,
        userId: users.id,
        name: users.name,
        email: users.email,
        banned: users.banned,
        banReason: users.banReason,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        licenseNumber: doctors.licenseNumber,
        specialty: doctors.specialty,
        departmentId: doctors.departmentId,
        departmentName: departments.name,
        yearsOfExperience: doctors.yearsOfExperience,
        education: doctors.education,
        certifications: doctors.certifications,
        consultationFee: doctors.consultationFee,
        rating: doctors.rating,
        totalPatients: doctors.totalPatients,
      })
      .from(doctors)
      .innerJoin(users, eq(doctors.userId, users.id))
      .leftJoin(departments, eq(doctors.departmentId, departments.id))
      .where(eq(doctors.id, doctorId))
      .limit(1);

    if (!doctorDetails[0]) {
      throw new Error("Doctor not found");
    }

    return {
      success: true,
      doctor: doctorDetails[0],
    };
  } catch (error) {
    console.error("Error fetching doctor details:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updateDoctor(
  doctorId: number,
  updates: UpdateDoctorData
) {
  try {
    await verifyAdminAccess();

    const doctor = await db
      .select({ userId: doctors.userId, licenseNumber: doctors.licenseNumber })
      .from(doctors)
      .where(eq(doctors.id, doctorId))
      .limit(1);

    if (!doctor[0]) {
      throw new Error("Doctor not found");
    }

    if (
      updates.licenseNumber &&
      updates.licenseNumber !== doctor[0].licenseNumber
    ) {
      const existingLicense = await db
        .select()
        .from(doctors)
        .where(
          and(
            eq(doctors.licenseNumber, updates.licenseNumber),
            sql`${doctors.id} != ${doctorId}`
          )
        )
        .limit(1);

      if (existingLicense[0]) {
        throw new Error("License number already exists");
      }
    }

    if (updates.name || updates.email) {
      await db
        .update(users)
        .set({
          name: updates.name,
          email: updates.email,
          updatedAt: new Date(),
        })
        .where(eq(users.id, doctor[0].userId));
    }

    await db
      .update(doctors)
      .set({
        licenseNumber: updates.licenseNumber,
        specialty: updates.specialty,
        departmentId: updates.departmentId,
        yearsOfExperience: updates.yearsOfExperience,
        education: updates.education,
        certifications: updates.certifications,
        consultationFee: updates.consultationFee?.toString(),
        updatedAt: new Date(),
      })
      .where(eq(doctors.id, doctorId));

    revalidatePath("/admin/doctors");
    return { success: true };
  } catch (error) {
    console.error("Error updating doctor:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function deleteDoctor(doctorId: number) {
  try {
    await verifyAdminAccess();

    const doctor = await db
      .select({ userId: doctors.userId })
      .from(doctors)
      .where(eq(doctors.id, doctorId))
      .limit(1);

    if (!doctor[0]) {
      throw new Error("Doctor not found");
    }

    await db.delete(doctors).where(eq(doctors.id, doctorId));
    await db.delete(users).where(eq(users.id, doctor[0].userId));

    revalidatePath("/admin/doctors");
    return { success: true };
  } catch (error) {
    console.error("Error deleting doctor:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function toggleDoctorBan(
  doctorId: number,
  banned: boolean,
  banReason?: string
) {
  try {
    await verifyAdminAccess();

    const doctor = await db
      .select({ userId: doctors.userId })
      .from(doctors)
      .where(eq(doctors.id, doctorId))
      .limit(1);

    if (!doctor[0]) {
      throw new Error("Doctor not found");
    }

    await db
      .update(users)
      .set({
        banned,
        banReason: banned ? banReason : null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, doctor[0].userId));

    revalidatePath("/admin/doctors");
    return { success: true };
  } catch (error) {
    console.error("Error toggling doctor ban:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
