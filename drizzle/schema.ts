import { integer, pgEnum, pgTable, text, timestamp, varchar, json, boolean, serial } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const orderStatusEnum = pgEnum("order_status", ["pending", "paid", "shipped", "completed", "cancelled"]);

/**
 * Core user table backing auth flow.
 * Uses Supabase Auth UUID as the primary link (authId).
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  /** Supabase Auth user UUID */
  authId: varchar("auth_id", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastSignedIn: timestamp("last_signed_in").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Products table for K2 Coffee offerings
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: integer("price").notNull(), // Price in cents
  weight: varchar("weight", { length: 100 }),
  tastingNotes: text("tasting_notes"),
  imageUrl: text("image_url"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// Ministries table for donation partners
export const ministries = pgTable("ministries", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  websiteUrl: varchar("website_url", { length: 500 }),
  imageUrl: text("image_url"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Ministry = typeof ministries.$inferSelect;
export type InsertMinistry = typeof ministries.$inferInsert;

// Orders table
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  ministryId: integer("ministry_id").references(() => ministries.id),
  stripeSessionId: varchar("stripe_session_id", { length: 255 }),
  stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }),
  customerEmail: varchar("customer_email", { length: 320 }),
  totalAmount: integer("total_amount").notNull(),
  currency: varchar("currency", { length: 10 }).default("usd"),
  status: orderStatusEnum("status").default("pending"),
  items: json("items"),
  shippingAddress: json("shipping_address"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  ministry: one(ministries, {
    fields: [orders.ministryId],
    references: [ministries.id],
  }),
}));

export const ministriesRelations = relations(ministries, ({ many }) => ({
  orders: many(orders),
}));
