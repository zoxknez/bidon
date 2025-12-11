import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { users, vehicleTypes, sectors, fuelContainers } from "@/lib/db/schema";
import bcrypt from "bcryptjs";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function seed() {
  console.log("🌱 Započinjem seeding...");

  // Kreiraj admin korisnika
  const hashedPassword = await bcrypt.hash("pass", 10);
  
  await db.insert(users).values({
    username: "user",
    passwordHash: hashedPassword,
    name: "Administrator",
  }).onConflictDoNothing();
  
  console.log("✅ Kreiran admin korisnik (user:pass)");

  // Kreiraj podrazumevane tipove vozila
  const defaultVehicleTypes = [
    { name: "Automobil" },
    { name: "Traktor" },
    { name: "Kultivator" },
    { name: "Kombajn" },
    { name: "Motorna pila" },
    { name: "Agregat" },
    { name: "Kamion" },
    { name: "Kombi" },
  ];

  for (const type of defaultVehicleTypes) {
    await db.insert(vehicleTypes).values(type).onConflictDoNothing();
  }
  
  console.log("✅ Kreirani podrazumevani tipovi vozila");

  // Kreiraj podrazumevane sektore
  const defaultSectors = [
    { name: "Poljoprivreda" },
    { name: "Transport" },
    { name: "Građevinarstvo" },
    { name: "Održavanje" },
  ];

  for (const sector of defaultSectors) {
    await db.insert(sectors).values(sector).onConflictDoNothing();
  }
  
  console.log("✅ Kreirani podrazumevani sektori");

  // Kreiraj primer bidona
  await db.insert(fuelContainers).values({
    name: "Glavni bidon",
    capacityLiters: "1000",
    currentLevel: "500",
    fuelType: "dizel",
    location: "Magacin",
  }).onConflictDoNothing();
  
  console.log("✅ Kreiran primer bidona");

  console.log("\n🎉 Seeding završen!");
}

seed()
  .catch((error) => {
    console.error("❌ Greška pri seedingu:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
