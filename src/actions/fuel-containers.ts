"use server";

import { db } from "@/lib/db";
import { fuelContainers, fuelAdditions, fuelTransactions } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Dobavi sve bidone
export async function getContainers() {
  try {
    const containers = await db
      .select()
      .from(fuelContainers)
      .where(eq(fuelContainers.isActive, true))
      .orderBy(desc(fuelContainers.createdAt));
    return containers;
  } catch (error) {
    console.error("Error fetching containers:", error);
    return [];
  }
}

// Dobavi jedan bidon
export async function getContainer(id: number) {
  try {
    const [container] = await db
      .select()
      .from(fuelContainers)
      .where(eq(fuelContainers.id, id))
      .limit(1);
    return container;
  } catch (error) {
    console.error("Error fetching container:", error);
    return null;
  }
}

// Kreiraj novi bidon
export async function createContainer(data: {
  name: string;
  capacityLiters: number;
  currentLevel: number;
  fuelType: string;
  location?: string;
}) {
  try {
    const [container] = await db
      .insert(fuelContainers)
      .values({
        name: data.name,
        capacityLiters: String(data.capacityLiters),
        currentLevel: String(data.currentLevel),
        fuelType: data.fuelType,
        location: data.location || null,
      })
      .returning();
    
    revalidatePath("/bidoni");
    revalidatePath("/");
    return { success: true, container };
  } catch (error) {
    console.error("Error creating container:", error);
    return { success: false, error: "Greška pri kreiranju bidona" };
  }
}

// Ažuriraj bidon
export async function updateContainer(
  id: number,
  data: Partial<{
    name: string;
    capacityLiters: number;
    currentLevel: number;
    fuelType: string;
    location: string;
  }>
) {
  try {
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (data.name) updateData.name = data.name;
    if (data.capacityLiters !== undefined) updateData.capacityLiters = String(data.capacityLiters);
    if (data.currentLevel !== undefined) updateData.currentLevel = String(data.currentLevel);
    if (data.fuelType) updateData.fuelType = data.fuelType;
    if (data.location !== undefined) updateData.location = data.location;

    const [container] = await db
      .update(fuelContainers)
      .set(updateData)
      .where(eq(fuelContainers.id, id))
      .returning();
    
    revalidatePath("/bidoni");
    revalidatePath("/");
    return { success: true, container };
  } catch (error) {
    console.error("Error updating container:", error);
    return { success: false, error: "Greška pri ažuriranju bidona" };
  }
}

// Obriši (deaktiviraj) bidon
export async function deleteContainer(id: number) {
  try {
    await db
      .update(fuelContainers)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(fuelContainers.id, id));
    
    revalidatePath("/bidoni");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error deleting container:", error);
    return { success: false, error: "Greška pri brisanju bidona" };
  }
}

// Dopuni bidon
export async function addFuelToContainer(data: {
  containerId: number;
  quantityLiters: number;
  pricePerLiter: number;
  supplier?: string;
  receiptNumber?: string;
  notes?: string;
}) {
  try {
    const totalPrice = data.quantityLiters * data.pricePerLiter;
    
    // Dodaj zapis o dopuni
    const [addition] = await db
      .insert(fuelAdditions)
      .values({
        containerId: data.containerId,
        quantityLiters: String(data.quantityLiters),
        pricePerLiter: String(data.pricePerLiter),
        totalPrice: String(totalPrice),
        supplier: data.supplier || null,
        receiptNumber: data.receiptNumber || null,
        notes: data.notes || null,
      })
      .returning();
    
    // Ažuriraj nivo u bidonu
    await db
      .update(fuelContainers)
      .set({
        currentLevel: sql`${fuelContainers.currentLevel} + ${data.quantityLiters}`,
        updatedAt: new Date(),
      })
      .where(eq(fuelContainers.id, data.containerId));
    
    revalidatePath("/bidoni");
    revalidatePath("/");
    return { success: true, addition };
  } catch (error) {
    console.error("Error adding fuel:", error);
    return { success: false, error: "Greška pri dopuni goriva" };
  }
}

// Dobavi istoriju dopuna za bidon
export async function getContainerAdditions(containerId: number) {
  try {
    const additions = await db
      .select()
      .from(fuelAdditions)
      .where(eq(fuelAdditions.containerId, containerId))
      .orderBy(desc(fuelAdditions.addedAt));
    return additions;
  } catch (error) {
    console.error("Error fetching additions:", error);
    return [];
  }
}

// Dobavi poslednju cenu goriva za bidon
export async function getLastFuelPrice(containerId: number) {
  try {
    const [lastAddition] = await db
      .select({ pricePerLiter: fuelAdditions.pricePerLiter })
      .from(fuelAdditions)
      .where(eq(fuelAdditions.containerId, containerId))
      .orderBy(desc(fuelAdditions.addedAt))
      .limit(1);
    
    return lastAddition?.pricePerLiter ? parseFloat(lastAddition.pricePerLiter) : null;
  } catch (error) {
    console.error("Error fetching last price:", error);
    return null;
  }
}

// Dobavi statistike za dashboard
export async function getDashboardStats() {
  try {
    // Ukupno bidona
    const containers = await db
      .select()
      .from(fuelContainers)
      .where(eq(fuelContainers.isActive, true));
    
    // Ukupna litarža
    const totalFuel = containers.reduce(
      (sum, c) => sum + parseFloat(c.currentLevel || "0"),
      0
    );
    
    const totalCapacity = containers.reduce(
      (sum, c) => sum + parseFloat(c.capacityLiters || "0"),
      0
    );

    // Transakcije ovog meseca
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyTransactions = await db
      .select({
        totalLiters: sql<string>`COALESCE(SUM(${fuelTransactions.quantityLiters}), 0)`,
        totalPrice: sql<string>`COALESCE(SUM(${fuelTransactions.totalPrice}), 0)`,
        count: sql<number>`COUNT(*)`,
      })
      .from(fuelTransactions)
      .where(sql`${fuelTransactions.transactionAt} >= ${startOfMonth}`);

    // Dopune ovog meseca
    const monthlyAdditions = await db
      .select({
        totalLiters: sql<string>`COALESCE(SUM(${fuelAdditions.quantityLiters}), 0)`,
        totalPrice: sql<string>`COALESCE(SUM(${fuelAdditions.totalPrice}), 0)`,
      })
      .from(fuelAdditions)
      .where(sql`${fuelAdditions.addedAt} >= ${startOfMonth}`);

    return {
      containersCount: containers.length,
      totalFuel,
      totalCapacity,
      monthlyDispensed: parseFloat(monthlyTransactions[0]?.totalLiters || "0"),
      monthlyDispensedPrice: parseFloat(monthlyTransactions[0]?.totalPrice || "0"),
      monthlyTransactionsCount: monthlyTransactions[0]?.count || 0,
      monthlyAdded: parseFloat(monthlyAdditions[0]?.totalLiters || "0"),
      monthlyAddedPrice: parseFloat(monthlyAdditions[0]?.totalPrice || "0"),
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      containersCount: 0,
      totalFuel: 0,
      totalCapacity: 0,
      monthlyDispensed: 0,
      monthlyDispensedPrice: 0,
      monthlyTransactionsCount: 0,
      monthlyAdded: 0,
      monthlyAddedPrice: 0,
    };
  }
}
