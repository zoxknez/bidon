"use server";

import { db } from "@/lib/db";
import { sectors } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getSectors() {
  try {
    return await db
      .select()
      .from(sectors)
      .where(eq(sectors.isActive, true))
      .orderBy(desc(sectors.createdAt));
  } catch (error) {
    console.error("Error fetching sectors:", error);
    return [];
  }
}

export async function getSector(id: number) {
  try {
    const [sector] = await db
      .select()
      .from(sectors)
      .where(eq(sectors.id, id))
      .limit(1);
    return sector;
  } catch (error) {
    console.error("Error fetching sector:", error);
    return null;
  }
}

export async function createSector(data: { name: string; description?: string }) {
  try {
    const [sector] = await db
      .insert(sectors)
      .values({
        name: data.name,
        description: data.description || null,
      })
      .returning();
    
    revalidatePath("/sektori");
    return { success: true, sector };
  } catch (error) {
    console.error("Error creating sector:", error);
    return { success: false, error: "Greška pri kreiranju sektora" };
  }
}

export async function updateSector(
  id: number,
  data: Partial<{ name: string; description: string }>
) {
  try {
    const [sector] = await db
      .update(sectors)
      .set(data)
      .where(eq(sectors.id, id))
      .returning();
    
    revalidatePath("/sektori");
    return { success: true, sector };
  } catch (error) {
    console.error("Error updating sector:", error);
    return { success: false, error: "Greška pri ažuriranju sektora" };
  }
}

export async function deleteSector(id: number) {
  try {
    await db
      .update(sectors)
      .set({ isActive: false })
      .where(eq(sectors.id, id));
    
    revalidatePath("/sektori");
    return { success: true };
  } catch (error) {
    console.error("Error deleting sector:", error);
    return { success: false, error: "Greška pri brisanju sektora" };
  }
}
