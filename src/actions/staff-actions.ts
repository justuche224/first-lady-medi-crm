"use server";

import { db } from "@/db";
import { user as users, staff, departments } from "@/db/schema";
import { eq, sql, and, or } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export interface CreateStaffData {
  name: string;
  email: string;
  password: string;
  employeeId: string;
  position: string;
  hireDate: string;
  departmentId?: number;
  salary?: number;
  supervisorId?: string;
}

export interface UpdateStaffData {
  name?: string;
  email?: string;
  employeeId?: string;
  position?: string;
  hireDate?: string;
  departmentId?: number;
  salary?: number;
  supervisorId?: string;
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

export async function createStaff(staffData: CreateStaffData) {
  try {
    await verifyAdminAccess();

    const existingEmployee = await db
      .select()
      .from(staff)
      .where(eq(staff.employeeId, staffData.employeeId))
      .limit(1);

    if (existingEmployee[0]) {
      throw new Error("Employee ID already exists");
    }

    const newUser = await auth.api.signUpEmail({
      body: {
        email: staffData.email,
        password: staffData.password,
        name: staffData.name,
        role: "staff",
      },
    });

    if (!newUser || !newUser.user?.id) {
      throw new Error("Failed to create user account");
    }

    await db.insert(staff).values({
      userId: newUser.user.id,
      employeeId: staffData.employeeId,
      position: staffData.position,
      hireDate: staffData.hireDate,
      departmentId: staffData.departmentId || null,
      salary: staffData.salary?.toString() || null,
      supervisorId: staffData.supervisorId || null,
    });

    revalidatePath("/admin/staffs");
    return { success: true, userId: newUser.user.id };
  } catch (error) {
    console.error("Error creating staff:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getStaffs(page = 1, limit = 10, search?: string) {
  try {
    await verifyAdminAccess();

    const offset = (page - 1) * limit;

    let whereClause = sql`true`;
    if (search) {
      whereClause = sql`(${users.name} ILIKE ${`%${search}%`} OR ${
        users.email
      } ILIKE ${`%${search}%`} OR ${
        staff.employeeId
      } ILIKE ${`%${search}%`} OR ${staff.position} ILIKE ${`%${search}%`})`;
    }

    const staffsWithCount = await db
      .select({
        id: staff.id,
        userId: users.id,
        name: users.name,
        email: users.email,
        banned: users.banned,
        createdAt: users.createdAt,
        employeeId: staff.employeeId,
        position: staff.position,
        hireDate: staff.hireDate,
        salary: staff.salary,
        supervisorId: staff.supervisorId,
        departmentId: staff.departmentId,
        departmentName: departments.name,
        total: sql<number>`count(*) over()`,
      })
      .from(staff)
      .innerJoin(users, eq(staff.userId, users.id))
      .leftJoin(departments, eq(staff.departmentId, departments.id))
      .where(and(eq(users.role, "staff"), whereClause))
      .orderBy(users.createdAt)
      .limit(limit)
      .offset(offset);

    const total = staffsWithCount[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      staffs: staffsWithCount,
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
    console.error("Error fetching staffs:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getStaffDetails(staffId: number) {
  try {
    await verifyAdminAccess();

    const staffDetails = await db
      .select({
        id: staff.id,
        userId: users.id,
        name: users.name,
        email: users.email,
        banned: users.banned,
        banReason: users.banReason,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        employeeId: staff.employeeId,
        position: staff.position,
        hireDate: staff.hireDate,
        salary: staff.salary,
        supervisorId: staff.supervisorId,
        departmentId: staff.departmentId,
        departmentName: departments.name,
      })
      .from(staff)
      .innerJoin(users, eq(staff.userId, users.id))
      .leftJoin(departments, eq(staff.departmentId, departments.id))
      .where(eq(staff.id, staffId))
      .limit(1);

    if (!staffDetails[0]) {
      throw new Error("Staff member not found");
    }

    return {
      success: true,
      staff: staffDetails[0],
    };
  } catch (error) {
    console.error("Error fetching staff details:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updateStaff(staffId: number, updates: UpdateStaffData) {
  try {
    await verifyAdminAccess();

    const staffMember = await db
      .select({ userId: staff.userId, employeeId: staff.employeeId })
      .from(staff)
      .where(eq(staff.id, staffId))
      .limit(1);

    if (!staffMember[0]) {
      throw new Error("Staff member not found");
    }

    if (
      updates.employeeId &&
      updates.employeeId !== staffMember[0].employeeId
    ) {
      const existingEmployee = await db
        .select()
        .from(staff)
        .where(
          and(
            eq(staff.employeeId, updates.employeeId),
            sql`${staff.id} != ${staffId}`
          )
        )
        .limit(1);

      if (existingEmployee[0]) {
        throw new Error("Employee ID already exists");
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
        .where(eq(users.id, staffMember[0].userId));
    }

    await db
      .update(staff)
      .set({
        employeeId: updates.employeeId,
        position: updates.position,
        hireDate: updates.hireDate,
        departmentId: updates.departmentId,
        salary: updates.salary?.toString(),
        supervisorId: updates.supervisorId,
        updatedAt: new Date(),
      })
      .where(eq(staff.id, staffId));

    revalidatePath("/admin/staffs");
    return { success: true };
  } catch (error) {
    console.error("Error updating staff:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function deleteStaff(staffId: number) {
  try {
    await verifyAdminAccess();

    const staffMember = await db
      .select({ userId: staff.userId })
      .from(staff)
      .where(eq(staff.id, staffId))
      .limit(1);

    if (!staffMember[0]) {
      throw new Error("Staff member not found");
    }

    await db.delete(staff).where(eq(staff.id, staffId));
    await db.delete(users).where(eq(users.id, staffMember[0].userId));

    revalidatePath("/admin/staffs");
    return { success: true };
  } catch (error) {
    console.error("Error deleting staff:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function toggleStaffBan(
  staffId: number,
  banned: boolean,
  banReason?: string
) {
  try {
    await verifyAdminAccess();

    const staffMember = await db
      .select({ userId: staff.userId })
      .from(staff)
      .where(eq(staff.id, staffId))
      .limit(1);

    if (!staffMember[0]) {
      throw new Error("Staff member not found");
    }

    await db
      .update(users)
      .set({
        banned,
        banReason: banned ? banReason : null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, staffMember[0].userId));

    revalidatePath("/admin/staffs");
    return { success: true };
  } catch (error) {
    console.error("Error toggling staff ban:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getDepartments() {
  try {
    await verifyAdminAccess();

    const depts = await db
      .select({
        id: departments.id,
        name: departments.name,
        description: departments.description,
      })
      .from(departments)
      .orderBy(departments.name);

    return {
      success: true,
      departments: depts,
    };
  } catch (error) {
    console.error("Error fetching departments:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getSupervisors() {
  try {
    await verifyAdminAccess();

    const supervisors = await db
      .select({
        id: users.id,
        name: users.name,
        position: staff.position,
      })
      .from(users)
      .leftJoin(staff, eq(users.id, staff.userId))
      .where(or(eq(users.role, "admin"), eq(users.role, "staff")))
      .orderBy(users.name);

    return {
      success: true,
      supervisors,
    };
  } catch (error) {
    console.error("Error fetching supervisors:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
