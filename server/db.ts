import { drizzle } from "drizzle-orm/postgres-js";
import { eq, desc } from "drizzle-orm";
import {
  InsertUser,
  users,
  InsertProduct,
  InsertMinistry,
  InsertOrder,
  products,
  ministries,
  orders,
} from "../drizzle/schema"
import postgres from "postgres";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (!_db && ENV.databaseUrl) {
    try {
      const client = postgres(ENV.databaseUrl, { prepare: false, ssl: { rejectUnauthorized: false } });
      _db = drizzle(client)
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// User operations
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.authId) {
    throw new Error("User authId is required for upsert");
  }

  const db = getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    await db
      .insert(users)
      .values({
        authId: user.authId,
        name: user.name ?? null,
        email: user.email ?? null,
        role: user.role ?? "user",
        lastSignedIn: user.lastSignedIn ?? new Date(),
      })
      .onConflictDoUpdate({
        target: users.authId,
        set: {
          name: user.name ?? undefined,
          email: user.email ?? undefined,
          lastSignedIn: new Date(),
          updatedAt: new Date(),
          ...(user.role ? { role: user.role } : {}),
        },
      });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByAuthId(authId: string) {
  const db = getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(users)
    .where(eq(users.authId, authId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Product queries
export async function getProducts(activeOnly: boolean = true) {
  const db = getDb();
  if (!db) return [];

  if (activeOnly) {
    return db.select().from(products).where(eq(products.active, true));
  }
  return db.select().from(products);
}

export async function getProductById(id: number) {
  const db = getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createProduct(data: Omit<InsertProduct, "id">) {
  const db = getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(products).values(data).returning();
  return result[0];
}

export async function updateProduct(
  id: number,
  data: Partial<InsertProduct>
) {
  const db = getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .update(products)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(products.id, id))
    .returning();
  return result[0];
}

export async function deleteProduct(id: number) {
  const db = getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(products).where(eq(products.id, id));
}

// Ministry queries
export async function getMinistries(activeOnly: boolean = true) {
  const db = getDb();
  if (!db) return [];

  if (activeOnly) {
    return db.select().from(ministries).where(eq(ministries.active, true));
  }
  return db.select().from(ministries);
}

export async function getMinistryById(id: number) {
  const db = getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(ministries)
    .where(eq(ministries.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createMinistry(data: Omit<InsertMinistry, "id">) {
  const db = getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(ministries).values(data).returning();
  return result[0];
}

export async function updateMinistry(
  id: number,
  data: Partial<InsertMinistry>
) {
  const db = getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .update(ministries)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(ministries.id, id))
    .returning();
  return result[0];
}

export async function deleteMinistry(id: number) {
  const db = getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(ministries).where(eq(ministries.id, id));
}

// Order queries
export async function getOrders(userId?: number) {
  const db = getDb();
  if (!db) return [];

  if (userId) {
    return db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
  }
  return db.select().from(orders).orderBy(desc(orders.createdAt));
}

export async function getOrderById(id: number) {
  const db = getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createOrder(data: Omit<InsertOrder, "id">) {
  const db = getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(orders).values(data).returning();
  return result[0];
}

export async function updateOrder(id: number, data: Partial<InsertOrder>) {
  const db = getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .update(orders)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(orders.id, id))
    .returning();
  return result[0];
}

export async function getOrderByStripeSessionId(sessionId: string) {
  const db = getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(orders)
    .where(eq(orders.stripeSessionId, sessionId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserOrders(userId: number) {
  return getOrders(userId);
}

export async function updateOrderStatus(
  id: number,
  status: "pending" | "paid" | "shipped" | "completed" | "cancelled"
) {
  const db = getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .update(orders)
    .set({ status, updatedAt: new Date() })
    .where(eq(orders.id, id))
    .returning();
  return result[0];
}

export async function deleteOrder(id: number) {
  const db = getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(orders).where(eq(orders.id, id));
}
