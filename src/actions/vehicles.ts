"use server";

import { db } from "@/lib/db";
import { vehicles, vehicleTypes, sectors } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// ============ VEHICLE TYPES ============

export async function getVehicleTypes() {
  try {
    return await db
      .select()
      .from(vehicleTypes)
      .where(eq(vehicleTypes.isActive, true))
      .orderBy(vehicleTypes.name);
  } catch (error) {
    console.error("Error fetching vehicle types:", error);
    return [];
  }
}

export async function createVehicleType(data: { name: string; icon?: string }) {
  try {
    const [type] = await db
      .insert(vehicleTypes)
      .values({
        name: data.name,
        icon: data.icon || null,
        isSystem: false,
      })
      .returning();
    
    revalidatePath("/vozila");
    return { success: true, type };
  } catch (error) {
    console.error("Error creating vehicle type:", error);
    return { success: false, error: "Greška pri kreiranju tipa vozila" };
  }
}

export async function deleteVehicleType(id: number) {
  try {
    // Proveri da li je sistemski tip
    const [type] = await db
      .select()
      .from(vehicleTypes)
      .where(eq(vehicleTypes.id, id))
      .limit(1);
    
    if (type?.isSystem) {
      return { success: false, error: "Ne možete obrisati sistemski tip vozila" };
    }

    await db
      .update(vehicleTypes)
      .set({ isActive: false })
      .where(eq(vehicleTypes.id, id));
    
    revalidatePath("/vozila");
    return { success: true };
  } catch (error) {
    console.error("Error deleting vehicle type:", error);
    return { success: false, error: "Greška pri brisanju tipa vozila" };
  }
}

// ============ VEHICLES ============

export async function getVehicles() {
  try {
    return await db
      .select({
        id: vehicles.id,
        name: vehicles.name,
        registration: vehicles.registration,
        vehicleTypeId: vehicles.vehicleTypeId,
        sectorId: vehicles.sectorId,
        fuelType: vehicles.fuelType,
        notes: vehicles.notes,
        isActive: vehicles.isActive,
        createdAt: vehicles.createdAt,
        typeName: vehicleTypes.name,
        sectorName: sectors.name,
      })
      .from(vehicles)
      .leftJoin(vehicleTypes, eq(vehicles.vehicleTypeId, vehicleTypes.id))
      .leftJoin(sectors, eq(vehicles.sectorId, sectors.id))
      .where(eq(vehicles.isActive, true))
      .orderBy(desc(vehicles.createdAt));
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    return [];
  }
}

export async function getVehicle(id: number) {
  try {
    const [vehicle] = await db
      .select({
        id: vehicles.id,
        name: vehicles.name,
        registration: vehicles.registration,
        vehicleTypeId: vehicles.vehicleTypeId,
        sectorId: vehicles.sectorId,
        fuelType: vehicles.fuelType,
        notes: vehicles.notes,
        isActive: vehicles.isActive,
        createdAt: vehicles.createdAt,
        typeName: vehicleTypes.name,
        sectorName: sectors.name,
      })
      .from(vehicles)
      .leftJoin(vehicleTypes, eq(vehicles.vehicleTypeId, vehicleTypes.id))
      .leftJoin(sectors, eq(vehicles.sectorId, sectors.id))
      .where(eq(vehicles.id, id))
      .limit(1);
    return vehicle;
  } catch (error) {
    console.error("Error fetching vehicle:", error);
    return null;
  }
}

export async function createVehicle(data: {
  name: string;
  registration?: string;
  vehicleTypeId?: number;
  sectorId?: number;
  fuelType?: string;
  notes?: string;
}) {
  try {
    const [vehicle] = await db
      .insert(vehicles)
      .values({
        name: data.name,
        registration: data.registration || null,
        vehicleTypeId: data.vehicleTypeId || null,
        sectorId: data.sectorId || null,
        fuelType: data.fuelType || "dizel",
        notes: data.notes || null,
      })
      .returning();
    
    revalidatePath("/vozila");
    return { success: true, vehicle };
  } catch (error) {
    console.error("Error creating vehicle:", error);
    return { success: false, error: "Greška pri kreiranju vozila" };
  }
}

export async function updateVehicle(
  id: number,
  data: Partial<{
    name: string;
    registration: string;
    vehicleTypeId: number;
    sectorId: number;
    fuelType: string;
    notes: string;
  }>
) {
  try {
    const [vehicle] = await db
      .update(vehicles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(vehicles.id, id))
      .returning();
    
    revalidatePath("/vozila");
    return { success: true, vehicle };
  } catch (error) {
    console.error("Error updating vehicle:", error);
    return { success: false, error: "Greška pri ažuriranju vozila" };
  }
}

export async function deleteVehicle(id: number) {
  try {
    await db
      .update(vehicles)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(vehicles.id, id));
    
    revalidatePath("/vozila");
    return { success: true };
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    return { success: false, error: "Greška pri brisanju vozila" };
  }
}
