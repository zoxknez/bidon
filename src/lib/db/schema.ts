import { pgTable, serial, varchar, text, boolean, timestamp, decimal, integer } from "drizzle-orm/pg-core";

// ============ USERS ============
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).unique().notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  name: varchar("name", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============ SECTORS ============
export const sectors = pgTable("sectors", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============ VEHICLE TYPES ============
export const vehicleTypes = pgTable("vehicle_types", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  icon: varchar("icon", { length: 50 }),
  isSystem: boolean("is_system").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============ VEHICLES ============
export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  registration: varchar("registration", { length: 50 }),
  vehicleTypeId: integer("vehicle_type_id").references(() => vehicleTypes.id),
  sectorId: integer("sector_id").references(() => sectors.id),
  fuelType: varchar("fuel_type", { length: 20 }).default("dizel"),
  notes: text("notes"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============ FUEL CONTAINERS (BIDONI) ============
export const fuelContainers = pgTable("fuel_containers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  capacityLiters: decimal("capacity_liters", { precision: 10, scale: 2 }).notNull(),
  currentLevel: decimal("current_level", { precision: 10, scale: 2 }).notNull().default("0"),
  fuelType: varchar("fuel_type", { length: 20 }).default("dizel"),
  location: varchar("location", { length: 100 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============ FUEL ADDITIONS (DOPUNE BIDONA) ============
export const fuelAdditions = pgTable("fuel_additions", {
  id: serial("id").primaryKey(),
  containerId: integer("container_id").references(() => fuelContainers.id).notNull(),
  quantityLiters: decimal("quantity_liters", { precision: 10, scale: 2 }).notNull(),
  pricePerLiter: decimal("price_per_liter", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 12, scale: 2 }).notNull(),
  supplier: varchar("supplier", { length: 100 }),
  receiptNumber: varchar("receipt_number", { length: 50 }),
  notes: text("notes"),
  addedAt: timestamp("added_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
});

// ============ FUEL TRANSACTIONS (TOČENJA) ============
export const fuelTransactions = pgTable("fuel_transactions", {
  id: serial("id").primaryKey(),
  containerId: integer("container_id").references(() => fuelContainers.id).notNull(),
  vehicleId: integer("vehicle_id").references(() => vehicles.id).notNull(),
  sectorId: integer("sector_id").references(() => sectors.id),
  quantityLiters: decimal("quantity_liters", { precision: 10, scale: 2 }).notNull(),
  pricePerLiter: decimal("price_per_liter", { precision: 10, scale: 2 }),
  totalPrice: decimal("total_price", { precision: 12, scale: 2 }),
  odometerReading: integer("odometer_reading"),
  operatorName: varchar("operator_name", { length: 100 }),
  notes: text("notes"),
  transactionAt: timestamp("transaction_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
});

// Types for TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Sector = typeof sectors.$inferSelect;
export type NewSector = typeof sectors.$inferInsert;

export type VehicleType = typeof vehicleTypes.$inferSelect;
export type NewVehicleType = typeof vehicleTypes.$inferInsert;

export type Vehicle = typeof vehicles.$inferSelect;
export type NewVehicle = typeof vehicles.$inferInsert;

export type FuelContainer = typeof fuelContainers.$inferSelect;
export type NewFuelContainer = typeof fuelContainers.$inferInsert;

export type FuelAddition = typeof fuelAdditions.$inferSelect;
export type NewFuelAddition = typeof fuelAdditions.$inferInsert;

export type FuelTransaction = typeof fuelTransactions.$inferSelect;
export type NewFuelTransaction = typeof fuelTransactions.$inferInsert;
