"use server";

import { db } from "@/lib/db";
import { fuelTransactions, fuelAdditions, fuelContainers, vehicles, sectors } from "@/lib/db/schema";
import { eq, sql, and, gte, lte, desc } from "drizzle-orm";

// Izveštaj po vozilu
export async function getReportByVehicle(startDate?: Date, endDate?: Date) {
  try {
    let whereClause = undefined;
    if (startDate && endDate) {
      whereClause = and(
        gte(fuelTransactions.transactionAt, startDate),
        lte(fuelTransactions.transactionAt, endDate)
      );
    }

    const result = await db
      .select({
        vehicleId: fuelTransactions.vehicleId,
        vehicleName: vehicles.name,
        vehicleRegistration: vehicles.registration,
        totalLiters: sql<string>`COALESCE(SUM(${fuelTransactions.quantityLiters}), 0)`,
        totalPrice: sql<string>`COALESCE(SUM(${fuelTransactions.totalPrice}), 0)`,
        transactionCount: sql<number>`COUNT(*)`,
      })
      .from(fuelTransactions)
      .leftJoin(vehicles, eq(fuelTransactions.vehicleId, vehicles.id))
      .where(whereClause)
      .groupBy(fuelTransactions.vehicleId, vehicles.name, vehicles.registration)
      .orderBy(desc(sql`SUM(${fuelTransactions.quantityLiters})`));

    return result;
  } catch (error) {
    console.error("Error fetching vehicle report:", error);
    return [];
  }
}

// Izveštaj po sektoru
export async function getReportBySector(startDate?: Date, endDate?: Date) {
  try {
    let whereClause = undefined;
    if (startDate && endDate) {
      whereClause = and(
        gte(fuelTransactions.transactionAt, startDate),
        lte(fuelTransactions.transactionAt, endDate)
      );
    }

    const result = await db
      .select({
        sectorId: fuelTransactions.sectorId,
        sectorName: sectors.name,
        totalLiters: sql<string>`COALESCE(SUM(${fuelTransactions.quantityLiters}), 0)`,
        totalPrice: sql<string>`COALESCE(SUM(${fuelTransactions.totalPrice}), 0)`,
        transactionCount: sql<number>`COUNT(*)`,
      })
      .from(fuelTransactions)
      .leftJoin(sectors, eq(fuelTransactions.sectorId, sectors.id))
      .where(whereClause)
      .groupBy(fuelTransactions.sectorId, sectors.name)
      .orderBy(desc(sql`SUM(${fuelTransactions.quantityLiters})`));

    return result;
  } catch (error) {
    console.error("Error fetching sector report:", error);
    return [];
  }
}

// Izveštaj po bidonu
export async function getReportByContainer(startDate?: Date, endDate?: Date) {
  try {
    // Transakcije (izlaz)
    let txWhereClause = undefined;
    if (startDate && endDate) {
      txWhereClause = and(
        gte(fuelTransactions.transactionAt, startDate),
        lte(fuelTransactions.transactionAt, endDate)
      );
    }

    const dispensed = await db
      .select({
        containerId: fuelTransactions.containerId,
        containerName: fuelContainers.name,
        totalLiters: sql<string>`COALESCE(SUM(${fuelTransactions.quantityLiters}), 0)`,
        totalPrice: sql<string>`COALESCE(SUM(${fuelTransactions.totalPrice}), 0)`,
      })
      .from(fuelTransactions)
      .leftJoin(fuelContainers, eq(fuelTransactions.containerId, fuelContainers.id))
      .where(txWhereClause)
      .groupBy(fuelTransactions.containerId, fuelContainers.name);

    // Dopune (ulaz)
    let addWhereClause = undefined;
    if (startDate && endDate) {
      addWhereClause = and(
        gte(fuelAdditions.addedAt, startDate),
        lte(fuelAdditions.addedAt, endDate)
      );
    }

    const added = await db
      .select({
        containerId: fuelAdditions.containerId,
        containerName: fuelContainers.name,
        totalLiters: sql<string>`COALESCE(SUM(${fuelAdditions.quantityLiters}), 0)`,
        totalPrice: sql<string>`COALESCE(SUM(${fuelAdditions.totalPrice}), 0)`,
      })
      .from(fuelAdditions)
      .leftJoin(fuelContainers, eq(fuelAdditions.containerId, fuelContainers.id))
      .where(addWhereClause)
      .groupBy(fuelAdditions.containerId, fuelContainers.name);

    // Kombinuj rezultate
    const containers = await db.select().from(fuelContainers).where(eq(fuelContainers.isActive, true));

    return containers.map((container) => {
      const disp = dispensed.find((d) => d.containerId === container.id);
      const add = added.find((a) => a.containerId === container.id);

      return {
        containerId: container.id,
        containerName: container.name,
        currentLevel: parseFloat(container.currentLevel || "0"),
        capacity: parseFloat(container.capacityLiters || "0"),
        dispensedLiters: parseFloat(disp?.totalLiters || "0"),
        dispensedPrice: parseFloat(disp?.totalPrice || "0"),
        addedLiters: parseFloat(add?.totalLiters || "0"),
        addedPrice: parseFloat(add?.totalPrice || "0"),
      };
    });
  } catch (error) {
    console.error("Error fetching container report:", error);
    return [];
  }
}

// Vremenski izveštaj (dnevni/nedeljni/mesečni/godišnji)
export async function getTimeReport(
  period: "daily" | "weekly" | "monthly" | "yearly",
  startDate: Date,
  endDate: Date
) {
  try {
    let dateFormat: string;
    switch (period) {
      case "daily":
        dateFormat = "YYYY-MM-DD";
        break;
      case "weekly":
        dateFormat = "IYYY-IW"; // ISO week
        break;
      case "monthly":
        dateFormat = "YYYY-MM";
        break;
      case "yearly":
        dateFormat = "YYYY";
        break;
    }

    // Transakcije grupisane po periodu
    const transactions = await db
      .select({
        period: sql<string>`TO_CHAR(${fuelTransactions.transactionAt}, ${dateFormat})`,
        totalLiters: sql<string>`COALESCE(SUM(${fuelTransactions.quantityLiters}), 0)`,
        totalPrice: sql<string>`COALESCE(SUM(${fuelTransactions.totalPrice}), 0)`,
        transactionCount: sql<number>`COUNT(*)`,
      })
      .from(fuelTransactions)
      .where(
        and(
          gte(fuelTransactions.transactionAt, startDate),
          lte(fuelTransactions.transactionAt, endDate)
        )
      )
      .groupBy(sql`TO_CHAR(${fuelTransactions.transactionAt}, ${dateFormat})`)
      .orderBy(sql`TO_CHAR(${fuelTransactions.transactionAt}, ${dateFormat})`);

    // Dopune grupisane po periodu
    const additions = await db
      .select({
        period: sql<string>`TO_CHAR(${fuelAdditions.addedAt}, ${dateFormat})`,
        totalLiters: sql<string>`COALESCE(SUM(${fuelAdditions.quantityLiters}), 0)`,
        totalPrice: sql<string>`COALESCE(SUM(${fuelAdditions.totalPrice}), 0)`,
      })
      .from(fuelAdditions)
      .where(
        and(
          gte(fuelAdditions.addedAt, startDate),
          lte(fuelAdditions.addedAt, endDate)
        )
      )
      .groupBy(sql`TO_CHAR(${fuelAdditions.addedAt}, ${dateFormat})`)
      .orderBy(sql`TO_CHAR(${fuelAdditions.addedAt}, ${dateFormat})`);

    // Izračunaj prosečnu cenu
    const avgPrice = await db
      .select({
        avgPrice: sql<string>`CASE WHEN SUM(${fuelAdditions.quantityLiters}) > 0 
          THEN SUM(${fuelAdditions.totalPrice}) / SUM(${fuelAdditions.quantityLiters})
          ELSE 0 END`,
      })
      .from(fuelAdditions)
      .where(
        and(
          gte(fuelAdditions.addedAt, startDate),
          lte(fuelAdditions.addedAt, endDate)
        )
      );

    return {
      transactions: transactions.map((t) => ({
        period: t.period,
        liters: parseFloat(t.totalLiters),
        price: parseFloat(t.totalPrice),
        count: t.transactionCount,
      })),
      additions: additions.map((a) => ({
        period: a.period,
        liters: parseFloat(a.totalLiters),
        price: parseFloat(a.totalPrice),
      })),
      averagePricePerLiter: parseFloat(avgPrice[0]?.avgPrice || "0"),
    };
  } catch (error) {
    console.error("Error fetching time report:", error);
    return {
      transactions: [],
      additions: [],
      averagePricePerLiter: 0,
    };
  }
}

// Ukupni troškovi
export async function getTotalCosts(startDate?: Date, endDate?: Date) {
  try {
    let whereClause = undefined;
    if (startDate && endDate) {
      whereClause = and(
        gte(fuelAdditions.addedAt, startDate),
        lte(fuelAdditions.addedAt, endDate)
      );
    }

    const result = await db
      .select({
        totalLiters: sql<string>`COALESCE(SUM(${fuelAdditions.quantityLiters}), 0)`,
        totalPrice: sql<string>`COALESCE(SUM(${fuelAdditions.totalPrice}), 0)`,
        avgPricePerLiter: sql<string>`CASE WHEN SUM(${fuelAdditions.quantityLiters}) > 0 
          THEN SUM(${fuelAdditions.totalPrice}) / SUM(${fuelAdditions.quantityLiters})
          ELSE 0 END`,
      })
      .from(fuelAdditions)
      .where(whereClause);

    return {
      totalLiters: parseFloat(result[0]?.totalLiters || "0"),
      totalPrice: parseFloat(result[0]?.totalPrice || "0"),
      avgPricePerLiter: parseFloat(result[0]?.avgPricePerLiter || "0"),
    };
  } catch (error) {
    console.error("Error fetching total costs:", error);
    return {
      totalLiters: 0,
      totalPrice: 0,
      avgPricePerLiter: 0,
    };
  }
}
