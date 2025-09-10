"use server";

import { db } from "@/db";
import { user as users, departments, doctors } from "@/db/schema";
import { eq, sql, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export interface CreateDepartmentData {
  name: string;
  description?: string;
  headDoctorId?: string;
}

export interface UpdateDepartmentData {
  name?: string;
  description?: string;
  headDoctorId?: string;
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

export async function createDepartment(departmentData: CreateDepartmentData) {
  try {
    await verifyAdminAccess();

    const existingDepartment = await db
      .select()
      .from(departments)
      .where(eq(departments.name, departmentData.name))
      .limit(1);

    if (existingDepartment[0]) {
      throw new Error("Department with this name already exists");
    }

    const result = await db
      .insert(departments)
      .values({
        name: departmentData.name,
        description: departmentData.description || null,
        headDoctorId: departmentData.headDoctorId || null,
      })
      .returning();

    revalidatePath("/admin/departments");
    return { success: true, departmentId: result[0].id };
  } catch (error) {
    console.error("Error creating department:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getDepartments(page = 1, limit = 10, search?: string) {
  try {
    await verifyAdminAccess();

    const offset = (page - 1) * limit;

    let whereClause = sql`true`;
    if (search) {
      whereClause = sql`(${departments.name} ILIKE ${`%${search}%`} OR ${
        departments.description
      } ILIKE ${`%${search}%`})`;
    }

    const departmentsWithCount = await db
      .select({
        id: departments.id,
        name: departments.name,
        description: departments.description,
        headDoctorId: departments.headDoctorId,
        headDoctorName: users.name,
        createdAt: departments.createdAt,
        updatedAt: departments.updatedAt,
        total: sql<number>`count(*) over()`,
      })
      .from(departments)
      .leftJoin(users, eq(departments.headDoctorId, users.id))
      .where(whereClause)
      .orderBy(departments.createdAt)
      .limit(limit)
      .offset(offset);

    const total = departmentsWithCount[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      departments: departmentsWithCount,
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
    console.error("Error fetching departments:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getDepartmentDetails(departmentId: number) {
  try {
    await verifyAdminAccess();

    const departmentDetails = await db
      .select({
        id: departments.id,
        name: departments.name,
        description: departments.description,
        headDoctorId: departments.headDoctorId,
        headDoctorName: users.name,
        createdAt: departments.createdAt,
        updatedAt: departments.updatedAt,
      })
      .from(departments)
      .leftJoin(users, eq(departments.headDoctorId, users.id))
      .where(eq(departments.id, departmentId))
      .limit(1);

    if (!departmentDetails[0]) {
      throw new Error("Department not found");
    }

    // Get department statistics
    const stats = await db
      .select({
        doctorCount: sql<number>`count(${doctors.id})`,
      })
      .from(doctors)
      .where(eq(doctors.departmentId, departmentId));

    return {
      success: true,
      department: {
        ...departmentDetails[0],
        doctorCount: stats[0]?.doctorCount || 0,
      },
    };
  } catch (error) {
    console.error("Error fetching department details:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updateDepartment(
  departmentId: number,
  updates: UpdateDepartmentData
) {
  try {
    await verifyAdminAccess();

    const department = await db
      .select()
      .from(departments)
      .where(eq(departments.id, departmentId))
      .limit(1);

    if (!department[0]) {
      throw new Error("Department not found");
    }

    if (updates.name && updates.name !== department[0].name) {
      const existingDepartment = await db
        .select()
        .from(departments)
        .where(
          and(
            eq(departments.name, updates.name),
            sql`${departments.id} != ${departmentId}`
          )
        )
        .limit(1);

      if (existingDepartment[0]) {
        throw new Error("Department with this name already exists");
      }
    }

    await db
      .update(departments)
      .set({
        name: updates.name,
        description: updates.description,
        headDoctorId: updates.headDoctorId,
        updatedAt: new Date(),
      })
      .where(eq(departments.id, departmentId));

    revalidatePath("/admin/departments");
    return { success: true };
  } catch (error) {
    console.error("Error updating department:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function deleteDepartment(departmentId: number) {
  try {
    await verifyAdminAccess();

    const department = await db
      .select()
      .from(departments)
      .where(eq(departments.id, departmentId))
      .limit(1);

    if (!department[0]) {
      throw new Error("Department not found");
    }

    // Check if department has doctors
    const doctorsInDepartment = await db
      .select()
      .from(doctors)
      .where(eq(doctors.departmentId, departmentId))
      .limit(1);

    if (doctorsInDepartment[0]) {
      throw new Error(
        "Cannot delete department with assigned doctors. Please reassign doctors first."
      );
    }

    await db.delete(departments).where(eq(departments.id, departmentId));

    revalidatePath("/admin/departments");
    return { success: true };
  } catch (error) {
    console.error("Error deleting department:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getAvailableDoctors() {
  try {
    await verifyAdminAccess();

    const availableDoctors = await db
      .select({
        id: users.id,
        name: users.name,
        specialty: doctors.specialty,
      })
      .from(users)
      .innerJoin(doctors, eq(users.id, doctors.userId))
      .where(eq(users.role, "doctor"))
      .orderBy(users.name);

    return {
      success: true,
      doctors: availableDoctors,
    };
  } catch (error) {
    console.error("Error fetching available doctors:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
