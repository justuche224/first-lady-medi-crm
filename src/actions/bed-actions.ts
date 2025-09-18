"use server";

import { db } from "@/db";
import {
  user as users,
  departments,
  patients,
  doctors,
  bedSpaces,
  bedOccupancy,
  bedStatuses,
  bedTypes,
  priorityLevels,
} from "@/db/schema";
import { eq, sql, and, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export interface CreateBedSpaceData {
  roomNumber: string;
  bedNumber: string;
  departmentId?: number;
  ward?: string;
  floor?: number;
  type: (typeof bedTypes)[number];
  description?: string;
  equipment?: string[];
}

export interface UpdateBedSpaceData {
  roomNumber?: string;
  bedNumber?: string;
  departmentId?: number;
  ward?: string;
  floor?: number;
  type?: (typeof bedTypes)[number];
  status?: (typeof bedStatuses)[number];
  description?: string;
  equipment?: string[];
  isActive?: boolean;
}

export interface CreateBedOccupancyData {
  bedId: number;
  patientId: number;
  doctorId?: number;
  admissionReason: string;
  diagnosis?: string;
  expectedDischargeDate?: string;
  priority?: (typeof priorityLevels)[number];
  notes?: string;
}

export interface UpdateBedOccupancyData {
  doctorId?: number;
  admissionReason?: string;
  diagnosis?: string;
  expectedDischargeDate?: string;
  priority?: (typeof priorityLevels)[number];
  notes?: string;
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

  if (
    !user[0] ||
    (user[0].role !== "admin" &&
      user[0].role !== "doctor" &&
      user[0].role !== "staff")
  ) {
    throw new Error("Access denied. Admin, doctor, or staff role required");
  }

  return user[0];
}

// Bed Space CRUD Operations

export async function createBedSpace(bedData: CreateBedSpaceData) {
  try {
    await verifyAdminAccess();

    // Check if bed with same room and bed number already exists
    const existingBed = await db
      .select()
      .from(bedSpaces)
      .where(
        and(
          eq(bedSpaces.roomNumber, bedData.roomNumber),
          eq(bedSpaces.bedNumber, bedData.bedNumber)
        )
      )
      .limit(1);

    if (existingBed[0]) {
      throw new Error("Bed with this room and bed number already exists");
    }

    const result = await db
      .insert(bedSpaces)
      .values({
        roomNumber: bedData.roomNumber,
        bedNumber: bedData.bedNumber,
        departmentId: bedData.departmentId || null,
        ward: bedData.ward || null,
        floor: bedData.floor || null,
        type: bedData.type,
        description: bedData.description || null,
        equipment: bedData.equipment ? JSON.stringify(bedData.equipment) : null,
      })
      .returning();

    revalidatePath("/admin/beds");
    return { success: true, bedId: result[0].id };
  } catch (error) {
    console.error("Error creating bed space:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getBedSpaces(
  page = 1,
  limit = 10,
  search?: string,
  departmentId?: number,
  type?: string,
  status?: string,
  ward?: string
) {
  try {
    await verifyAdminAccess();

    const offset = (page - 1) * limit;

    const conditions = [eq(bedSpaces.isActive, true)];

    if (search) {
      conditions.push(
        sql`(${bedSpaces.roomNumber} ILIKE ${`%${search}%`} OR ${
          bedSpaces.bedNumber
        } ILIKE ${`%${search}%`} OR ${bedSpaces.ward} ILIKE ${`%${search}%`})`
      );
    }

    if (departmentId) {
      conditions.push(eq(bedSpaces.departmentId, departmentId));
    }

    if (type) {
      conditions.push(eq(bedSpaces.type, type as (typeof bedTypes)[number]));
    }

    if (status) {
      conditions.push(
        eq(bedSpaces.status, status as (typeof bedStatuses)[number])
      );
    }

    if (ward) {
      conditions.push(eq(bedSpaces.ward, ward));
    }

    const whereClause = and(...conditions);

    const bedsWithCount = await db
      .select({
        id: bedSpaces.id,
        roomNumber: bedSpaces.roomNumber,
        bedNumber: bedSpaces.bedNumber,
        departmentId: bedSpaces.departmentId,
        departmentName: departments.name,
        ward: bedSpaces.ward,
        floor: bedSpaces.floor,
        type: bedSpaces.type,
        status: bedSpaces.status,
        description: bedSpaces.description,
        equipment: bedSpaces.equipment,
        isActive: bedSpaces.isActive,
        createdAt: bedSpaces.createdAt,
        updatedAt: bedSpaces.updatedAt,
        total: sql<number>`count(*) over()`,
      })
      .from(bedSpaces)
      .leftJoin(departments, eq(bedSpaces.departmentId, departments.id))
      .where(and(whereClause, eq(bedSpaces.isActive, true)))
      .orderBy(bedSpaces.createdAt)
      .limit(limit)
      .offset(offset);

    const total = bedsWithCount[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      beds: bedsWithCount,
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
    console.error("Error fetching bed spaces:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getBedSpaceDetails(bedId: number) {
  try {
    await verifyAdminAccess();

    const bedDetails = await db
      .select({
        id: bedSpaces.id,
        roomNumber: bedSpaces.roomNumber,
        bedNumber: bedSpaces.bedNumber,
        departmentId: bedSpaces.departmentId,
        departmentName: departments.name,
        ward: bedSpaces.ward,
        floor: bedSpaces.floor,
        type: bedSpaces.type,
        status: bedSpaces.status,
        description: bedSpaces.description,
        equipment: bedSpaces.equipment,
        isActive: bedSpaces.isActive,
        createdAt: bedSpaces.createdAt,
        updatedAt: bedSpaces.updatedAt,
      })
      .from(bedSpaces)
      .leftJoin(departments, eq(bedSpaces.departmentId, departments.id))
      .where(eq(bedSpaces.id, bedId))
      .limit(1);

    if (!bedDetails[0]) {
      throw new Error("Bed space not found");
    }

    // Get current occupancy if any
    const currentOccupancy = await db
      .select({
        id: bedOccupancy.id,
        patientId: bedOccupancy.patientId,
        patientName: users.name,
        doctorId: bedOccupancy.doctorId,
        doctorName: sql<string>`${users.name}`,
        admissionDate: bedOccupancy.admissionDate,
        expectedDischargeDate: bedOccupancy.expectedDischargeDate,
        admissionReason: bedOccupancy.admissionReason,
        diagnosis: bedOccupancy.diagnosis,
        status: bedOccupancy.status,
      })
      .from(bedOccupancy)
      .leftJoin(patients, eq(bedOccupancy.patientId, patients.id))
      .leftJoin(users, eq(patients.userId, users.id))
      .where(
        and(eq(bedOccupancy.bedId, bedId), eq(bedOccupancy.status, "active"))
      )
      .limit(1);

    return {
      success: true,
      bed: {
        ...bedDetails[0],
        currentOccupancy: currentOccupancy[0] || null,
      },
    };
  } catch (error) {
    console.error("Error fetching bed space details:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updateBedSpace(
  bedId: number,
  updates: UpdateBedSpaceData
) {
  try {
    await verifyAdminAccess();

    const bed = await db
      .select()
      .from(bedSpaces)
      .where(eq(bedSpaces.id, bedId))
      .limit(1);

    if (!bed[0]) {
      throw new Error("Bed space not found");
    }

    if (
      (updates.roomNumber || updates.bedNumber) &&
      (updates.roomNumber !== bed[0].roomNumber ||
        updates.bedNumber !== bed[0].bedNumber)
    ) {
      const existingBed = await db
        .select()
        .from(bedSpaces)
        .where(
          and(
            eq(bedSpaces.roomNumber, updates.roomNumber || bed[0].roomNumber),
            eq(bedSpaces.bedNumber, updates.bedNumber || bed[0].bedNumber),
            sql`${bedSpaces.id} != ${bedId}`
          )
        )
        .limit(1);

      if (existingBed[0]) {
        throw new Error("Bed with this room and bed number already exists");
      }
    }

    await db
      .update(bedSpaces)
      .set({
        roomNumber: updates.roomNumber,
        bedNumber: updates.bedNumber,
        departmentId: updates.departmentId,
        ward: updates.ward,
        floor: updates.floor,
        type: updates.type,
        status: updates.status,
        description: updates.description,
        equipment: updates.equipment
          ? JSON.stringify(updates.equipment)
          : undefined,
        isActive: updates.isActive,
        updatedAt: new Date(),
      })
      .where(eq(bedSpaces.id, bedId));

    revalidatePath("/admin/beds");
    return { success: true };
  } catch (error) {
    console.error("Error updating bed space:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function deleteBedSpace(bedId: number) {
  try {
    await verifyAdminAccess();

    const bed = await db
      .select()
      .from(bedSpaces)
      .where(eq(bedSpaces.id, bedId))
      .limit(1);

    if (!bed[0]) {
      throw new Error("Bed space not found");
    }

    // Check if bed is currently occupied
    const currentOccupancy = await db
      .select()
      .from(bedOccupancy)
      .where(
        and(eq(bedOccupancy.bedId, bedId), eq(bedOccupancy.status, "active"))
      )
      .limit(1);

    if (currentOccupancy[0]) {
      throw new Error(
        "Cannot delete occupied bed space. Please discharge the patient first."
      );
    }

    await db
      .update(bedSpaces)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(bedSpaces.id, bedId));

    revalidatePath("/admin/beds");
    return { success: true };
  } catch (error) {
    console.error("Error deleting bed space:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Bed Occupancy Management

export async function allocateBed(occupancyData: CreateBedOccupancyData) {
  try {
    await verifyAdminAccess();

    // Check if bed exists and is available
    const bed = await db
      .select()
      .from(bedSpaces)
      .where(eq(bedSpaces.id, occupancyData.bedId))
      .limit(1);

    if (!bed[0]) {
      throw new Error("Bed space not found");
    }

    if (bed[0].status !== "available") {
      throw new Error("Bed space is not available for allocation");
    }

    // Check if patient exists
    const patient = await db
      .select()
      .from(patients)
      .where(eq(patients.id, occupancyData.patientId))
      .limit(1);

    if (!patient[0]) {
      throw new Error("Patient not found");
    }

    // Check if patient is already in another bed
    const existingOccupancy = await db
      .select()
      .from(bedOccupancy)
      .where(
        and(
          eq(bedOccupancy.patientId, occupancyData.patientId),
          eq(bedOccupancy.status, "active")
        )
      )
      .limit(1);

    if (existingOccupancy[0]) {
      throw new Error("Patient is already allocated to another bed");
    }

    const result = await db.transaction(async (tx) => {
      // Create occupancy record
      const occupancyResult = await tx
        .insert(bedOccupancy)
        .values({
          bedId: occupancyData.bedId,
          patientId: occupancyData.patientId,
          doctorId: occupancyData.doctorId || null,
          admissionDate: new Date(),
          expectedDischargeDate: occupancyData.expectedDischargeDate || null,
          admissionReason: occupancyData.admissionReason,
          diagnosis: occupancyData.diagnosis || null,
          notes: occupancyData.notes || null,
          priority: occupancyData.priority || "normal",
        })
        .returning();

      // Update bed status to occupied
      await tx
        .update(bedSpaces)
        .set({ status: "occupied", updatedAt: new Date() })
        .where(eq(bedSpaces.id, occupancyData.bedId));

      return occupancyResult[0];
    });

    revalidatePath("/admin/beds");
    revalidatePath("/admin/occupancy");
    return { success: true, occupancyId: result.id };
  } catch (error) {
    console.error("Error allocating bed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function dischargePatient(
  occupancyId: number,
  dischargeNotes?: string
) {
  try {
    await verifyAdminAccess();

    const occupancy = await db
      .select()
      .from(bedOccupancy)
      .where(eq(bedOccupancy.id, occupancyId))
      .limit(1);

    if (!occupancy[0]) {
      throw new Error("Bed occupancy record not found");
    }

    if (occupancy[0].status !== "active") {
      throw new Error("Patient is not currently admitted to this bed");
    }

    await db.transaction(async (tx) => {
      // Update occupancy record
      await tx
        .update(bedOccupancy)
        .set({
          status: "discharged",
          actualDischargeDate: new Date(),
          notes: dischargeNotes
            ? `${
                occupancy[0].notes || ""
              }\n\nDischarge Notes: ${dischargeNotes}`
            : occupancy[0].notes,
          updatedAt: new Date(),
        })
        .where(eq(bedOccupancy.id, occupancyId));

      // Update bed status to available
      await tx
        .update(bedSpaces)
        .set({ status: "available", updatedAt: new Date() })
        .where(eq(bedSpaces.id, occupancy[0].bedId));
    });

    revalidatePath("/admin/beds");
    revalidatePath("/admin/occupancy");
    return { success: true };
  } catch (error) {
    console.error("Error discharging patient:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function transferPatient(
  occupancyId: number,
  newBedId: number,
  transferReason?: string
) {
  try {
    await verifyAdminAccess();

    const currentOccupancy = await db
      .select()
      .from(bedOccupancy)
      .where(eq(bedOccupancy.id, occupancyId))
      .limit(1);

    if (!currentOccupancy[0]) {
      throw new Error("Bed occupancy record not found");
    }

    if (currentOccupancy[0].status !== "active") {
      throw new Error("Patient is not currently admitted to this bed");
    }

    // Check if new bed is available
    const newBed = await db
      .select()
      .from(bedSpaces)
      .where(eq(bedSpaces.id, newBedId))
      .limit(1);

    if (!newBed[0]) {
      throw new Error("New bed space not found");
    }

    if (newBed[0].status !== "available") {
      throw new Error("New bed space is not available");
    }

    await db.transaction(async (tx) => {
      // Update current occupancy as transferred
      await tx
        .update(bedOccupancy)
        .set({
          status: "transferred",
          actualDischargeDate: new Date(),
          notes: transferReason
            ? `${
                currentOccupancy[0].notes || ""
              }\n\nTransfer Reason: ${transferReason}`
            : currentOccupancy[0].notes,
          updatedAt: new Date(),
        })
        .where(eq(bedOccupancy.id, occupancyId));

      // Update old bed status to available
      await tx
        .update(bedSpaces)
        .set({ status: "available", updatedAt: new Date() })
        .where(eq(bedSpaces.id, currentOccupancy[0].bedId));

      // Create new occupancy record
      const newOccupancyResult = await tx
        .insert(bedOccupancy)
        .values({
          bedId: newBedId,
          patientId: currentOccupancy[0].patientId,
          doctorId: currentOccupancy[0].doctorId,
          admissionDate: new Date(),
          expectedDischargeDate: currentOccupancy[0].expectedDischargeDate,
          admissionReason: `Transferred from Bed ${currentOccupancy[0].bedId}`,
          diagnosis: currentOccupancy[0].diagnosis,
          notes: transferReason || null,
          priority: currentOccupancy[0].priority,
          transferredFrom: occupancyId,
        })
        .returning();

      // Update new bed status to occupied
      await tx
        .update(bedSpaces)
        .set({ status: "occupied", updatedAt: new Date() })
        .where(eq(bedSpaces.id, newBedId));

      // Update the original occupancy to reference the new one
      await tx
        .update(bedOccupancy)
        .set({ transferredTo: newOccupancyResult[0].id })
        .where(eq(bedOccupancy.id, occupancyId));
    });

    revalidatePath("/admin/beds");
    revalidatePath("/admin/occupancy");
    return { success: true };
  } catch (error) {
    console.error("Error transferring patient:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updateBedOccupancy(
  occupancyId: number,
  updates: UpdateBedOccupancyData
) {
  try {
    await verifyAdminAccess();

    const occupancy = await db
      .select()
      .from(bedOccupancy)
      .where(eq(bedOccupancy.id, occupancyId))
      .limit(1);

    if (!occupancy[0]) {
      throw new Error("Bed occupancy record not found");
    }

    if (occupancy[0].status !== "active") {
      throw new Error(
        "Cannot update discharged or transferred occupancy records"
      );
    }

    await db
      .update(bedOccupancy)
      .set({
        doctorId: updates.doctorId,
        admissionReason: updates.admissionReason,
        diagnosis: updates.diagnosis,
        expectedDischargeDate: updates.expectedDischargeDate || null,
        priority: updates.priority,
        notes: updates.notes,
        updatedAt: new Date(),
      })
      .where(eq(bedOccupancy.id, occupancyId));

    revalidatePath("/admin/occupancy");
    return { success: true };
  } catch (error) {
    console.error("Error updating bed occupancy:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Search and Filtering Functions

export async function getAvailableBeds(
  departmentId?: number,
  type?: string,
  ward?: string
) {
  try {
    await verifyAdminAccess();

    let whereClause = and(
      eq(bedSpaces.status, "available"),
      eq(bedSpaces.isActive, true)
    );

    if (departmentId) {
      whereClause = and(whereClause, eq(bedSpaces.departmentId, departmentId));
    }

    if (type) {
      whereClause = and(
        whereClause,
        eq(bedSpaces.type, type as (typeof bedTypes)[number])
      );
    }

    if (ward) {
      whereClause = and(whereClause, eq(bedSpaces.ward, ward));
    }

    const availableBeds = await db
      .select({
        id: bedSpaces.id,
        roomNumber: bedSpaces.roomNumber,
        bedNumber: bedSpaces.bedNumber,
        departmentId: bedSpaces.departmentId,
        departmentName: departments.name,
        ward: bedSpaces.ward,
        floor: bedSpaces.floor,
        type: bedSpaces.type,
        description: bedSpaces.description,
        equipment: bedSpaces.equipment,
      })
      .from(bedSpaces)
      .leftJoin(departments, eq(bedSpaces.departmentId, departments.id))
      .where(whereClause)
      .orderBy(bedSpaces.roomNumber, bedSpaces.bedNumber);

    return {
      success: true,
      beds: availableBeds,
    };
  } catch (error) {
    console.error("Error fetching available beds:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getBedOccupancyHistory(
  patientId?: number,
  bedId?: number,
  page = 1,
  limit = 10
) {
  try {
    await verifyAdminAccess();

    const offset = (page - 1) * limit;

    const conditions = [];

    if (patientId) {
      conditions.push(eq(bedOccupancy.patientId, patientId));
    }

    if (bedId) {
      conditions.push(eq(bedOccupancy.bedId, bedId));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : sql`true`;

    const occupancyHistory = await db
      .select({
        id: bedOccupancy.id,
        bedId: bedOccupancy.bedId,
        roomNumber: bedSpaces.roomNumber,
        bedNumber: bedSpaces.bedNumber,
        patientId: bedOccupancy.patientId,
        patientName: users.name,
        doctorId: bedOccupancy.doctorId,
        doctorName: sql<string>`(SELECT name FROM "user" WHERE id = ${doctors.userId})`,
        admissionDate: bedOccupancy.admissionDate,
        actualDischargeDate: bedOccupancy.actualDischargeDate,
        admissionReason: bedOccupancy.admissionReason,
        diagnosis: bedOccupancy.diagnosis,
        status: bedOccupancy.status,
        total: sql<number>`count(*) over()`,
      })
      .from(bedOccupancy)
      .leftJoin(bedSpaces, eq(bedOccupancy.bedId, bedSpaces.id))
      .leftJoin(patients, eq(bedOccupancy.patientId, patients.id))
      .leftJoin(users, eq(patients.userId, users.id))
      .leftJoin(doctors, eq(bedOccupancy.doctorId, doctors.id))
      .where(whereClause)
      .orderBy(desc(bedOccupancy.admissionDate))
      .limit(limit)
      .offset(offset);

    const total = occupancyHistory[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      occupancy: occupancyHistory,
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
    console.error("Error fetching bed occupancy history:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getBedOccupancyStats() {
  try {
    await verifyAdminAccess();

    const stats = await db
      .select({
        totalBeds: sql<number>`count(${bedSpaces.id})`,
        occupiedBeds: sql<number>`count(case when ${bedSpaces.status} = 'occupied' then 1 end)`,
        availableBeds: sql<number>`count(case when ${bedSpaces.status} = 'available' then 1 end)`,
        maintenanceBeds: sql<number>`count(case when ${bedSpaces.status} = 'maintenance' then 1 end)`,
        reservedBeds: sql<number>`count(case when ${bedSpaces.status} = 'reserved' then 1 end)`,
        totalPatients: sql<number>`count(distinct ${bedOccupancy.patientId})`,
        currentAdmissions: sql<number>`count(case when ${bedOccupancy.status} = 'active' then 1 end)`,
      })
      .from(bedSpaces)
      .leftJoin(
        bedOccupancy,
        and(
          eq(bedSpaces.id, bedOccupancy.bedId),
          eq(bedOccupancy.status, "active")
        )
      )
      .where(eq(bedSpaces.isActive, true))
      .limit(1);

    return {
      success: true,
      stats: stats[0],
    };
  } catch (error) {
    console.error("Error fetching bed occupancy stats:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getDepartments() {
  try {
    await verifyAdminAccess();

    const departmentsList = await db
      .select({
        id: departments.id,
        name: departments.name,
      })
      .from(departments)
      .orderBy(departments.name);

    return {
      success: true,
      departments: departmentsList,
    };
  } catch (error) {
    console.error("Error fetching departments:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getWards() {
  try {
    await verifyAdminAccess();

    const wards = await db
      .select({
        ward: bedSpaces.ward,
      })
      .from(bedSpaces)
      .where(sql`${bedSpaces.ward} IS NOT NULL`)
      .groupBy(bedSpaces.ward)
      .orderBy(bedSpaces.ward);

    return {
      success: true,
      wards: wards.filter((w) => w.ward).map((w) => w.ward),
    };
  } catch (error) {
    console.error("Error fetching wards:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
