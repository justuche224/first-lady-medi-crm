/**
 * User Management Server Actions
 *
 * Admin-only actions for managing users (staff, doctors, patients).
 * Only users with admin role can perform these operations.
 */

"use server";

import { db } from "@/db";
import {
  user as users,
  patients,
  doctors,
  staff,
  departments,
} from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

// Types
export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role: "patient" | "doctor" | "staff";
  // Patient specific fields
  dateOfBirth?: Date;
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
  // Doctor specific fields
  licenseNumber?: string;
  specialty?: string;
  departmentId?: number;
  yearsOfExperience?: number;
  education?: string;
  certifications?: string;
  consultationFee?: number;
  // Staff specific fields
  employeeId?: string;
  position?: string;
  hireDate?: Date;
  salary?: number;
  supervisorId?: string;
}

/**
 * Create a new user (Admin Only)
 *
 * Creates a new user account with role-specific data.
 * Only admin users can create new accounts.
 */
export async function createUser(userData: CreateUserData) {
  try {
    // Verify admin access
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    // Check if user has admin role
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user[0] || user[0].role !== "admin") {
      throw new Error("Admin access required");
    }

    // Create the base user account
    const newUser = await auth.api.signUpEmail({
      body: {
        email: userData.email,
        password: userData.password,
        name: userData.name,
        role: userData.role,
      },
    });

    if (!newUser || !newUser.user?.id) {
      throw new Error("Failed to create user account");
    }

    // Create role-specific profile
    if (userData.role === "patient") {
      await db.insert(patients).values({
        userId: newUser.user.id,
        dateOfBirth: userData.dateOfBirth?.toISOString(),
        gender: userData.gender,
        phone: userData.phone,
        address: userData.address,
        emergencyContact: userData.emergencyContact,
        emergencyPhone: userData.emergencyPhone,
        bloodType: userData.bloodType,
        allergies: userData.allergies,
        medicalHistory: userData.medicalHistory,
        insuranceProvider: userData.insuranceProvider,
        insuranceNumber: userData.insuranceNumber,
      });
    } else if (userData.role === "doctor") {
      await db.insert(doctors).values({
        userId: newUser.user.id,
        licenseNumber: userData.licenseNumber!,
        specialty: userData.specialty!,
        departmentId: userData.departmentId,
        yearsOfExperience: userData.yearsOfExperience,
        education: userData.education,
        certifications: userData.certifications,
        consultationFee: userData.consultationFee?.toString(),
      });
    } else if (userData.role === "staff") {
      await db.insert(staff).values({
        userId: newUser.user.id,
        employeeId: userData.employeeId!,
        departmentId: userData.departmentId,
        position: userData.position!,
        hireDate: userData.hireDate!.toISOString(),
        salary: userData.salary?.toString(),
        supervisorId: userData.supervisorId,
      });
    }

    revalidatePath("/admin");
    return { success: true, userId: newUser.user.id };
  } catch (error) {
    console.error("Error creating user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get all users with pagination (Admin Only)
 *
 * Retrieves a paginated list of all users with their role-specific data.
 */
export async function getUsers(page = 1, limit = 20, search?: string) {
  try {
    // Verify admin access
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

    const offset = (page - 1) * limit;

    // Build search query
    let whereClause = sql`true`;
    if (search) {
      whereClause = sql`${users.name} ILIKE ${`%${search}%`} OR ${
        users.email
      } ILIKE ${`%${search}%`}`;
    }

    // Get users with counts
    const usersWithCount = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        banned: users.banned,
        banReason: users.banReason,
        createdAt: users.createdAt,
        total: sql<number>`count(*) over()`,
      })
      .from(users)
      .where(whereClause)
      .orderBy(users.createdAt)
      .limit(limit)
      .offset(offset);

    const total = usersWithCount[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      users: usersWithCount,
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
    console.error("Error fetching users:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Update user profile (Admin Only)
 *
 * Updates user information and role-specific data.
 */
export async function updateUser(
  userId: string,
  updates: Partial<CreateUserData>
) {
  try {
    // Verify admin access
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const adminUser = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!adminUser[0] || adminUser[0].role !== "admin") {
      throw new Error("Admin access required");
    }

    // Update base user data
    if (updates.name || updates.email) {
      await db
        .update(users)
        .set({
          name: updates.name,
          email: updates.email,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
    }

    // Update role-specific data
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user[0]) {
      throw new Error("User not found");
    }

    if (user[0].role === "patient") {
      await db
        .update(patients)
        .set({
          dateOfBirth: updates.dateOfBirth?.toISOString(),
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
        .where(eq(patients.userId, userId));
    } else if (user[0].role === "doctor") {
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
        .where(eq(doctors.userId, userId));
    } else if (user[0].role === "staff") {
      await db
        .update(staff)
        .set({
          employeeId: updates.employeeId,
          departmentId: updates.departmentId,
          position: updates.position,
          hireDate: updates.hireDate?.toISOString(),
          salary: updates.salary?.toString(),
          supervisorId: updates.supervisorId,
          updatedAt: new Date(),
        })
        .where(eq(staff.userId, userId));
    }

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error updating user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Ban/Unban user (Admin Only)
 *
 * Bans or unbans a user account.
 */
export async function toggleUserBan(
  userId: string,
  banned: boolean,
  banReason?: string
) {
  try {
    // Verify admin access
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const adminUser = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!adminUser[0] || adminUser[0].role !== "admin") {
      throw new Error("Admin access required");
    }

    await db
      .update(users)
      .set({
        banned,
        banReason: banned ? banReason : null,
        banExpires: null, // For now, bans don't expire
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error toggling user ban:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Delete user (Admin Only)
 *
 * Permanently deletes a user account and all associated data.
 */
export async function deleteUser(userId: string) {
  try {
    // Verify admin access
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const adminUser = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!adminUser[0] || adminUser[0].role !== "admin") {
      throw new Error("Admin access required");
    }

    // Delete in order of foreign key dependencies
    await db.delete(patients).where(eq(patients.userId, userId));
    await db.delete(doctors).where(eq(doctors.userId, userId));
    await db.delete(staff).where(eq(staff.userId, userId));
    await db.delete(users).where(eq(users.id, userId));

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get user details with role-specific data (Admin Only)
 *
 * Retrieves complete user information including role-specific data.
 */
export async function getUserDetails(userId: string) {
  try {
    // Verify admin access
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const adminUser = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!adminUser[0] || adminUser[0].role !== "admin") {
      throw new Error("Admin access required");
    }

    // Get base user data
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user[0]) {
      throw new Error("User not found");
    }

    let roleData = null;

    // Get role-specific data
    if (user[0].role === "patient") {
      const patientData = await db
        .select()
        .from(patients)
        .where(eq(patients.userId, userId))
        .limit(1);
      roleData = patientData[0] || null;
    } else if (user[0].role === "doctor") {
      const doctorData = await db
        .select({
          doctors: doctors,
          department: departments,
        })
        .from(doctors)
        .leftJoin(departments, eq(doctors.departmentId, departments.id))
        .where(eq(doctors.userId, userId))
        .limit(1);
      roleData = doctorData[0] || null;
    } else if (user[0].role === "staff") {
      const staffData = await db
        .select({
          staff: staff,
          department: departments,
        })
        .from(staff)
        .leftJoin(departments, eq(staff.departmentId, departments.id))
        .where(eq(staff.userId, userId))
        .limit(1);
      roleData = staffData[0] || null;
    }

    return {
      success: true,
      user: user[0],
      roleData,
    };
  } catch (error) {
    console.error("Error fetching user details:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
