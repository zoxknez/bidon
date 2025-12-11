"use server";

import { db } from "@/lib/db";
import { fuelTransactions, fuelContainers, vehicles, sectors } from "@/lib/db/schema";
import { eq, desc, sql, and, gte, lte } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getLastFuelPrice } from "./fuel-containers";

// Toči gorivo
export async function dispenseFuel(data: {
  containerId: number;
  vehicleId: number;
  sectorId?: number;
  quantityLiters: number;
  odometerReading?: number;
  operatorName?: string;
  notes?: string;
}) {
  try {
    // Proveri da li ima dovoljno goriva
    const [container] = await db
      .select()
      .from(fuelContainers)
      .where(eq(fuelContainers.id, data.containerId))
      .limit(1);
    
    if (!container) {
      return { success: false, error: "Bidon nije pronađen" };
    }
    
    const currentLevel = parseFloat(container.currentLevel || "0");
    if (currentLevel < data.quantityLiters) {
      return { success: false, error: "Nema dovoljno goriva u bidonu" };
    }

    // Dobavi poslednju cenu goriva
    const pricePerLiter = await getLastFuelPrice(data.containerId);
    const totalPrice = pricePerLiter ? data.quantityLiters * pricePerLiter : null;

    // Kreiraj transakciju
    const [transaction] = await db
      .insert(fuelTransactions)
      .values({
        containerId: data.containerId,
        vehicleId: data.vehicleId,
        sectorId: data.sectorId || null,
        quantityLiters: String(data.quantityLiters),
        pricePerLiter: pricePerLiter ? String(pricePerLiter) : null,
        totalPrice: totalPrice ? String(totalPrice) : null,
        odometerReading: data.odometerReading || null,
        operatorName: data.operatorName || null,
        notes: data.notes || null,
      })
      .returning();
    
    // Smanji nivo u bidonu
    await db
      .update(fuelContainers)
      .set({
        currentLevel: sql`${fuelContainers.currentLevel} - ${data.quantityLiters}`,
        updatedAt: new Date(),
      })
      .where(eq(fuelContainers.id, data.containerId));
    
    revalidatePath("/");
    revalidatePath("/bidoni");
    revalidatePath("/tocenje");
    return { success: true, transaction };
  } catch (error) {
    console.error("Error dispensing fuel:", error);
    return { success: false, error: "Greška pri točenju goriva" };
  }
}

// Dobavi sve transakcije
export async function getTransactions(limit?: number) {
  try {
    const query = db
      .select({
        id: fuelTransactions.id,
        containerId: fuelTransactions.containerId,
        vehicleId: fuelTransactions.vehicleId,
        sectorId: fuelTransactions.sectorId,
        quantityLiters: fuelTransactions.quantityLiters,
        pricePerLiter: fuelTransactions.pricePerLiter,
        totalPrice: fuelTransactions.totalPrice,
        odometerReading: fuelTransactions.odometerReading,
        operatorName: fuelTransactions.operatorName,
        notes: fuelTransactions.notes,
        transactionAt: fuelTransactions.transactionAt,
        containerName: fuelContainers.name,
        vehicleName: vehicles.name,
        sectorName: sectors.name,
      })
      .from(fuelTransactions)
      .leftJoin(fuelContainers, eq(fuelTransactions.containerId, fuelContainers.id))
      .leftJoin(vehicles, eq(fuelTransactions.vehicleId, vehicles.id))
      .leftJoin(sectors, eq(fuelTransactions.sectorId, sectors.id))
      .orderBy(desc(fuelTransactions.transactionAt));
    
    if (limit) {
      return await query.limit(limit);
    }
    return await query;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
}

// Dobavi transakcije za vozilo
export async function getVehicleTransactions(vehicleId: number) {
  try {
    return await db
      .select({
        id: fuelTransactions.id,
        quantityLiters: fuelTransactions.quantityLiters,
        totalPrice: fuelTransactions.totalPrice,
        transactionAt: fuelTransactions.transactionAt,
        containerName: fuelContainers.name,
      })
      .from(fuelTransactions)
      .leftJoin(fuelContainers, eq(fuelTransactions.containerId, fuelContainers.id))
      .where(eq(fuelTransactions.vehicleId, vehicleId))
      .orderBy(desc(fuelTransactions.transactionAt));
  } catch (error) {
    console.error("Error fetching vehicle transactions:", error);
    return [];
  }
}

// Dobavi transakcije za period
export async function getTransactionsByPeriod(startDate: Date, endDate: Date) {
  try {
    return await db
      .select({
        id: fuelTransactions.id,
        containerId: fuelTransactions.containerId,
        vehicleId: fuelTransactions.vehicleId,
        sectorId: fuelTransactions.sectorId,
        quantityLiters: fuelTransactions.quantityLiters,
        pricePerLiter: fuelTransactions.pricePerLiter,
        totalPrice: fuelTransactions.totalPrice,
        transactionAt: fuelTransactions.transactionAt,
        containerName: fuelContainers.name,
        vehicleName: vehicles.name,
        sectorName: sectors.name,
      })
      .from(fuelTransactions)
      .leftJoin(fuelContainers, eq(fuelTransactions.containerId, fuelContainers.id))
      .leftJoin(vehicles, eq(fuelTransactions.vehicleId, vehicles.id))
      .leftJoin(sectors, eq(fuelTransactions.sectorId, sectors.id))
      .where(
        and(
          gte(fuelTransactions.transactionAt, startDate),
          lte(fuelTransactions.transactionAt, endDate)
        )
      )
      .orderBy(desc(fuelTransactions.transactionAt));
  } catch (error) {
    console.error("Error fetching transactions by period:", error);
    return [];
  }
}

// Obriši transakciju i vrati gorivo
export async function deleteTransaction(id: number) {
  try {
    // Dobavi transakciju
    const [transaction] = await db
      .select()
      .from(fuelTransactions)
      .where(eq(fuelTransactions.id, id))
      .limit(1);
    
    if (!transaction) {
      return { success: false, error: "Transakcija nije pronađena" };
    }

    // Vrati gorivo u bidon
    await db
      .update(fuelContainers)
      .set({
        currentLevel: sql`${fuelContainers.currentLevel} + ${transaction.quantityLiters}`,
        updatedAt: new Date(),
      })
      .where(eq(fuelContainers.id, transaction.containerId));

    // Obriši transakciju
    await db.delete(fuelTransactions).where(eq(fuelTransactions.id, id));
    
    revalidatePath("/");
    revalidatePath("/tocenje");
    return { success: true };
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return { success: false, error: "Greška pri brisanju transakcije" };
  }
}
