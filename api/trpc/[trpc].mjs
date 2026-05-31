// server/trpcEntry.ts
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// server/_core/systemRouter.ts
import { z } from "zod";

// shared/const.ts
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/_core/trpc.ts
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  }))
});

// server/routers.ts
import { z as z6 } from "zod";

// server/db.ts
import { drizzle } from "drizzle-orm/postgres-js";
import { eq, desc } from "drizzle-orm";

// drizzle/schema.ts
import { integer, pgEnum, pgTable, text, timestamp, varchar, json, boolean, serial } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
var roleEnum = pgEnum("role", ["user", "admin"]);
var orderStatusEnum = pgEnum("order_status", ["pending", "paid", "shipped", "completed", "cancelled"]);
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  /** Supabase Auth user UUID */
  authId: varchar("auth_id", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastSignedIn: timestamp("last_signed_in").defaultNow().notNull()
});
var products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: integer("price").notNull(),
  // Price in cents
  weight: varchar("weight", { length: 100 }),
  tastingNotes: text("tasting_notes"),
  imageUrl: text("image_url"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var ministries = pgTable("ministries", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  websiteUrl: varchar("website_url", { length: 500 }),
  imageUrl: text("image_url"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  ministryId: integer("ministry_id").references(() => ministries.id),
  stripeSessionId: varchar("stripe_session_id", { length: 255 }).unique(),
  stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }),
  customerEmail: varchar("customer_email", { length: 320 }),
  totalAmount: integer("total_amount").notNull(),
  currency: varchar("currency", { length: 10 }).default("usd"),
  status: orderStatusEnum("status").default("pending"),
  items: json("items"),
  shippingAddress: json("shipping_address"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var usersRelations = relations(users, ({ many }) => ({
  orders: many(orders)
}));
var ordersRelations = relations(orders, ({ one }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id]
  }),
  ministry: one(ministries, {
    fields: [orders.ministryId],
    references: [ministries.id]
  })
}));
var ministriesRelations = relations(ministries, ({ many }) => ({
  orders: many(orders)
}));

// server/db.ts
import postgres from "postgres";

// server/_core/env.ts
var ENV = {
  // Supabase
  supabaseUrl: process.env.VITE_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY ?? "",
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  // Auth
  jwtSecret: process.env.JWT_SECRET ?? "change-me-in-production",
  adminEmail: process.env.ADMIN_EMAIL ?? "",
  // Database
  databaseUrl: process.env.DATABASE_URL ?? "",
  // Stripe
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  // Email (Resend)
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  emailFrom: process.env.EMAIL_FROM ?? "K2 Coffee <noreply@k2coffee.xyz>",
  // App
  frontendUrl: process.env.VITE_FRONTEND_URL ?? (process.env.NODE_ENV === "production" ? "https://www.k2coffee.xyz" : "http://localhost:3000"),
  isProduction: process.env.NODE_ENV === "production"
};

// server/db.ts
var _db = null;
function getDb() {
  if (!_db && ENV.databaseUrl) {
    try {
      const client = postgres(ENV.databaseUrl, { prepare: false, ssl: { rejectUnauthorized: false } });
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
async function upsertUser(user) {
  if (!user.authId) {
    throw new Error("User authId is required for upsert");
  }
  const db = getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    await db.insert(users).values({
      authId: user.authId,
      name: user.name ?? null,
      email: user.email ?? null,
      role: user.role ?? "user",
      lastSignedIn: user.lastSignedIn ?? /* @__PURE__ */ new Date()
    }).onConflictDoUpdate({
      target: users.authId,
      set: {
        name: user.name ?? void 0,
        email: user.email ?? void 0,
        lastSignedIn: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date(),
        ...user.role ? { role: user.role } : {}
      }
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByAuthId(authId) {
  const db = getDb();
  if (!db) return void 0;
  const result = await db.select().from(users).where(eq(users.authId, authId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getProducts(activeOnly = true) {
  const db = getDb();
  if (!db) return [];
  if (activeOnly) {
    return db.select().from(products).where(eq(products.active, true));
  }
  return db.select().from(products);
}
async function getProductById(id) {
  const db = getDb();
  if (!db) return void 0;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function createProduct(data) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(products).values(data).returning();
  return result[0];
}
async function updateProduct(id, data) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.update(products).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(products.id, id)).returning();
  return result[0];
}
async function deleteProduct(id) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(products).where(eq(products.id, id));
}
async function getMinistries(activeOnly = true) {
  const db = getDb();
  if (!db) return [];
  if (activeOnly) {
    return db.select().from(ministries).where(eq(ministries.active, true));
  }
  return db.select().from(ministries);
}
async function getMinistryById(id) {
  const db = getDb();
  if (!db) return void 0;
  const result = await db.select().from(ministries).where(eq(ministries.id, id)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function createMinistry(data) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(ministries).values(data).returning();
  return result[0];
}
async function updateMinistry(id, data) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.update(ministries).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(ministries.id, id)).returning();
  return result[0];
}
async function deleteMinistry(id) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(ministries).where(eq(ministries.id, id));
}
async function getOrders(userId) {
  const db = getDb();
  if (!db) return [];
  if (userId) {
    return db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
  }
  return db.select().from(orders).orderBy(desc(orders.createdAt));
}
async function getOrderById(id) {
  const db = getDb();
  if (!db) return void 0;
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function createOrder(data) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(orders).values(data).returning();
  return result[0];
}
async function updateOrder(id, data) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.update(orders).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(orders.id, id)).returning();
  return result[0];
}
async function getOrderByStripeSessionId(sessionId) {
  const db = getDb();
  if (!db) return void 0;
  const result = await db.select().from(orders).where(eq(orders.stripeSessionId, sessionId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function updateOrderStatus(id, status) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.update(orders).set({ status, updatedAt: /* @__PURE__ */ new Date() }).where(eq(orders.id, id)).returning();
  return result[0];
}

// server/routers.ts
import { TRPCError as TRPCError6 } from "@trpc/server";

// server/routers/checkout.ts
import { z as z2 } from "zod";

// server/_core/checkout.ts
import Stripe from "stripe";
var stripe = null;
if (ENV.stripeSecretKey) {
  stripe = new Stripe(ENV.stripeSecretKey);
}
var FREE_SHIPPING_THRESHOLD = 5900;
var STANDARD_SHIPPING = 399;
async function createCheckoutSession(req) {
  if (!stripe) {
    throw new Error(
      "Stripe is not configured. Please add STRIPE_SECRET_KEY to environment variables."
    );
  }
  const { items, ministryId, totalAmount, userEmail, userId } = req;
  const shippingMethod = req.shippingMethod ?? "standard";
  if (!items || items.length === 0) {
    throw new Error("No items in cart");
  }
  if (!ministryId) {
    throw new Error("Please select a ministry to support");
  }
  const origin = ENV.frontendUrl;
  const lineItems = items.map((item) => ({
    price_data: {
      currency: "gbp",
      product_data: {
        name: item.name
      },
      unit_amount: item.price
    },
    quantity: item.quantity
  }));
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const isCollection = shippingMethod === "collection";
  const qualifiesFree = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingAmount = isCollection || qualifiesFree ? 0 : STANDARD_SHIPPING;
  const shippingRateLabel = isCollection ? "Local collection" : qualifiesFree ? "Free delivery (orders over \xA359)" : "Standard delivery";
  const shippingOptions = [
    {
      shipping_rate_data: {
        type: "fixed_amount",
        fixed_amount: { amount: shippingAmount, currency: "gbp" },
        display_name: shippingRateLabel
      }
    }
  ];
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: `${origin}/order/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/order/cancel`,
    customer_email: userEmail,
    ...isCollection ? {} : {
      shipping_address_collection: {
        allowed_countries: ["GB", "US", "AU", "CA", "NZ", "IE", "SG", "HK"]
      }
    },
    shipping_options: shippingOptions,
    phone_number_collection: {
      enabled: true
    },
    metadata: {
      userId: userId?.toString() || "",
      ministryId: ministryId.toString(),
      shippingMethod,
      shippingAmount: shippingAmount.toString(),
      items: JSON.stringify(
        items.map((i) => ({
          id: i.id,
          name: i.name,
          quantity: i.quantity,
          price: i.price
        }))
      )
    }
  });
  return session;
}
async function getCheckoutSession(sessionId) {
  if (!stripe) {
    throw new Error("Stripe is not configured.");
  }
  return stripe.checkout.sessions.retrieve(sessionId);
}

// server/routers/checkout.ts
import { TRPCError as TRPCError2 } from "@trpc/server";
var checkoutRouter = router({
  createSession: protectedProcedure.input(
    z2.object({
      items: z2.array(
        z2.object({
          id: z2.number(),
          quantity: z2.number().int().positive().max(99)
        })
      ),
      ministryId: z2.number(),
      shippingMethod: z2.enum(["standard", "collection"]).default("standard")
    })
  ).mutation(async ({ input, ctx }) => {
    try {
      const verifiedItems = await Promise.all(
        input.items.map(async ({ id, quantity }) => {
          const product = await getProductById(id);
          if (!product || !product.active) {
            throw new TRPCError2({
              code: "BAD_REQUEST",
              message: `Product ${id} is not available`
            });
          }
          return { id: product.id, name: product.name, quantity, price: product.price };
        })
      );
      const totalAmount = verifiedItems.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0
      );
      const session = await createCheckoutSession({
        items: verifiedItems,
        ministryId: input.ministryId,
        totalAmount,
        shippingMethod: input.shippingMethod,
        userEmail: ctx.user.email || "",
        userId: ctx.user.id
      });
      return {
        url: session.url,
        sessionId: session.id
      };
    } catch (error) {
      if (error instanceof TRPCError2) throw error;
      console.error("Checkout error:", error);
      throw new TRPCError2({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create checkout session. Please try again."
      });
    }
  })
});

// server/routers/contact.ts
import { z as z3 } from "zod";
import { TRPCError as TRPCError3 } from "@trpc/server";

// server/_core/email.ts
import { Resend } from "resend";
var resend = null;
if (ENV.resendApiKey) {
  resend = new Resend(ENV.resendApiKey);
}
async function sendEmail(options) {
  try {
    if (!resend) {
      console.warn("[Email] Resend not configured, email not sent");
      return false;
    }
    const { error } = await resend.emails.send({
      from: ENV.emailFrom,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text
    });
    if (error) {
      console.error("[Email] Failed to send:", error);
      return false;
    }
    console.log(`[Email] Sent to ${options.to}: ${options.subject}`);
    return true;
  } catch (error) {
    console.error("[Email] Error sending email:", error);
    return false;
  }
}
async function sendOrderConfirmationEmail(customerEmail, customerName, orderId, items, totalAmount, ministryName) {
  const itemsHtml = items.map(
    (item) => `<tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">\xA3${(item.price * item.quantity / 100).toFixed(2)}</td>
        </tr>`
  ).join("");
  const html = `
    <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #78350f, #92400e); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">K2 Coffee</h1>
        <p style="color: #fef3c7; margin: 8px 0 0;">Order Confirmation</p>
      </div>
      <div style="background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="color: #78350f; font-size: 16px;">Dear ${customerName},</p>
        <p style="color: #555;">Thank you for your order! Your purchase supports <strong>${ministryName}</strong>.</p>
        
        <h3 style="color: #78350f; margin-top: 24px;">Order #${orderId}</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <thead>
            <tr style="background: #fef3c7;">
              <th style="padding: 8px; text-align: left; color: #78350f;">Item</th>
              <th style="padding: 8px; text-align: center; color: #78350f;">Qty</th>
              <th style="padding: 8px; text-align: right; color: #78350f;">Price</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding: 12px 8px; font-weight: bold; color: #78350f;">Total</td>
              <td style="padding: 12px 8px; text-align: right; font-weight: bold; color: #78350f;">\xA3${(totalAmount / 100).toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
        
        <div style="background: #fef3c7; padding: 16px; border-radius: 8px; margin-top: 20px;">
          <p style="margin: 0; color: #78350f; font-size: 14px;">
            <strong>Ministry Partner:</strong> ${ministryName}<br>
            A portion of your purchase directly supports this ministry's work.
          </p>
        </div>
        
        <p style="color: #888; font-size: 12px; margin-top: 30px; text-align: center;">
          K2 Coffee Ministry &bull; Premium Yunnan Arabica &bull; k2coffee.xyz
        </p>
      </div>
    </div>
  `;
  return sendEmail({
    to: customerEmail,
    subject: `K2 Coffee - Order #${orderId} Confirmed`,
    html
  });
}
async function sendAdminOrderAlert(adminEmail, orderId, customerName, customerEmail, items, totalAmount, ministryName) {
  if (!adminEmail) return false;
  const itemsList = items.map((i) => `${i.name} x${i.quantity} \u2014 \xA3${(i.price * i.quantity / 100).toFixed(2)}`).join("\n");
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #78350f;">New Order Alert \u2014 #${orderId}</h2>
      <p><strong>Customer:</strong> ${customerName} (${customerEmail})</p>
      <p><strong>Ministry:</strong> ${ministryName}</p>
      <p><strong>Total:</strong> \xA3${(totalAmount / 100).toFixed(2)}</p>
      <h3>Items:</h3>
      <pre style="background: #f5f5f5; padding: 12px; border-radius: 6px;">${itemsList}</pre>
    </div>
  `;
  return sendEmail({
    to: adminEmail,
    subject: `[K2 Admin] New Order #${orderId} \u2014 \xA3${(totalAmount / 100).toFixed(2)}`,
    html
  });
}
async function sendOrderStatusUpdateEmail(customerEmail, orderId, status, customMessage) {
  if (!customerEmail) return false;
  const statusMessages = {
    paid: "Your payment has been confirmed.",
    shipped: "Your order has been shipped! You should receive it soon.",
    completed: "Your order has been delivered. Enjoy your K2 Coffee!",
    cancelled: "Your order has been cancelled."
  };
  const message = customMessage || statusMessages[status] || `Your order status has been updated to: ${status}`;
  const html = `
    <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #78350f, #92400e); padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0;">K2 Coffee</h1>
      </div>
      <div style="background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <h2 style="color: #78350f;">Order #${orderId} Update</h2>
        <p style="color: #555; font-size: 16px;">${message}</p>
        <p style="color: #888; font-size: 12px; margin-top: 30px; text-align: center;">
          K2 Coffee Ministry &bull; k2coffee.xyz
        </p>
      </div>
    </div>
  `;
  return sendEmail({
    to: customerEmail,
    subject: `K2 Coffee \u2014 Order #${orderId} ${status.charAt(0).toUpperCase() + status.slice(1)}`,
    html
  });
}

// server/routers/contact.ts
var contactRouter = router({
  send: publicProcedure.input(
    z3.object({
      name: z3.string().min(1).max(100),
      email: z3.string().email(),
      orderNumber: z3.string().max(50).optional(),
      message: z3.string().min(10).max(2e3)
    })
  ).mutation(async ({ input }) => {
    if (!ENV.adminEmail) {
      throw new TRPCError3({
        code: "INTERNAL_SERVER_ERROR",
        message: "Contact not configured"
      });
    }
    const subject = input.orderNumber ? `K2 Contact: ${input.name} \xB7 Order #${input.orderNumber}` : `K2 Contact: ${input.name}`;
    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2b1d14;">New Contact Message</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #7a5a45; font-size: 13px; width: 120px;">From</td>
                <td style="padding: 8px 0; color: #2b1d14;">${input.name}</td></tr>
            <tr><td style="padding: 8px 0; color: #7a5a45; font-size: 13px;">Email</td>
                <td style="padding: 8px 0; color: #2b1d14;"><a href="mailto:${input.email}">${input.email}</a></td></tr>
            ${input.orderNumber ? `<tr><td style="padding: 8px 0; color: #7a5a45; font-size: 13px;">Order #</td>
                <td style="padding: 8px 0; color: #2b1d14;">${input.orderNumber}</td></tr>` : ""}
          </table>
          <div style="margin-top: 24px; padding: 16px; background: #f5efe4; border-radius: 8px;">
            <p style="margin: 0; color: #2b1d14; line-height: 1.7; white-space: pre-wrap;">${input.message}</p>
          </div>
          <p style="margin-top: 24px; color: #a88f73; font-size: 12px;">
            Reply directly to this email to respond to ${input.name}.
          </p>
        </div>
      `;
    const sent = await sendEmail({
      to: ENV.adminEmail,
      subject,
      html
    });
    if (!sent) {
      throw new TRPCError3({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to send message. Please try again later."
      });
    }
    return { success: true };
  })
});

// server/routers/images.ts
import { z as z4 } from "zod";
import { TRPCError as TRPCError4 } from "@trpc/server";

// server/_core/supabase.ts
import { createClient } from "@supabase/supabase-js";
var supabaseAdmin = createClient(
  ENV.supabaseUrl,
  ENV.supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// server/routers/images.ts
import { nanoid } from "nanoid";
var adminProcedure2 = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError4({
      code: "FORBIDDEN",
      message: "Admin access required"
    });
  }
  return next({ ctx });
});
var imagesRouter = router({
  // Returns a signed upload URL so the client can upload directly to Supabase.
  // This avoids sending file bytes through Vercel (4.5 MB body limit).
  getUploadUrl: adminProcedure2.input(
    z4.object({
      filename: z4.string(),
      type: z4.enum(["product", "ministry"])
    })
  ).mutation(async ({ input }) => {
    try {
      const ext = input.filename.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
      const folder = input.type === "product" ? "products" : "ministries";
      const path = `${folder}/${nanoid()}.${ext}`;
      const { data, error } = await supabaseAdmin.storage.from("images").createSignedUploadUrl(path);
      if (error) {
        console.error("[Images] Supabase error:", error.message);
        throw new Error("Could not create upload URL");
      }
      const {
        data: { publicUrl }
      } = supabaseAdmin.storage.from("images").getPublicUrl(path);
      return {
        signedUrl: data.signedUrl,
        token: data.token,
        path,
        publicUrl
      };
    } catch (error) {
      console.error("[Images] getUploadUrl error:", error);
      const message = error instanceof Error ? error.message : "Failed to get upload URL";
      throw new TRPCError4({ code: "INTERNAL_SERVER_ERROR", message });
    }
  }),
  // Get image URL by storage key (kept for existing usage)
  getImageUrl: protectedProcedure.input(z4.object({ key: z4.string() })).query(async ({ input }) => {
    try {
      const {
        data: { publicUrl }
      } = supabaseAdmin.storage.from("images").getPublicUrl(input.key);
      return { url: publicUrl };
    } catch (error) {
      console.error("[Images] Failed to get image URL:", error);
      throw new TRPCError4({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get image URL"
      });
    }
  })
});

// server/routers/orderNotifications.ts
import { z as z5 } from "zod";
import { TRPCError as TRPCError5 } from "@trpc/server";
var adminProcedure3 = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError5({
      code: "FORBIDDEN",
      message: "Admin access required"
    });
  }
  return next({ ctx });
});
var orderNotificationsRouter = router({
  updateOrderStatus: adminProcedure3.input(
    z5.object({
      orderId: z5.number(),
      status: z5.enum(["pending", "paid", "shipped", "completed"])
    })
  ).mutation(async ({ input }) => {
    const order = await getOrderById(input.orderId);
    if (!order) {
      throw new TRPCError5({ code: "NOT_FOUND", message: "Order not found" });
    }
    await updateOrderStatus(input.orderId, input.status);
    try {
      await sendOrderStatusUpdateEmail(
        order.customerEmail || "",
        input.orderId,
        input.status
      );
    } catch (emailError) {
      console.error(
        "[OrderNotifications] Failed to send email:",
        emailError
      );
    }
    return {
      success: true,
      message: `Order status updated to ${input.status}`
    };
  }),
  sendManualNotification: adminProcedure3.input(
    z5.object({
      orderId: z5.number(),
      message: z5.string()
    })
  ).mutation(async ({ input }) => {
    const order = await getOrderById(input.orderId);
    if (!order) {
      throw new TRPCError5({ code: "NOT_FOUND", message: "Order not found" });
    }
    try {
      await sendOrderStatusUpdateEmail(
        order.customerEmail || "",
        input.orderId,
        order.status || "pending",
        input.message
      );
    } catch (emailError) {
      console.error(
        "[OrderNotifications] Failed to send email:",
        emailError
      );
      throw new TRPCError5({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to send notification"
      });
    }
    return { success: true, message: "Notification sent successfully" };
  })
});

// server/routers.ts
var orderItemSchema = z6.array(z6.object({
  id: z6.number(),
  name: z6.string(),
  quantity: z6.number().int().positive(),
  price: z6.number().int().positive()
}));
function safeParseItems(raw) {
  try {
    const parsed = JSON.parse(raw || "[]");
    return orderItemSchema.parse(parsed);
  } catch {
    return [];
  }
}
var adminProcedure4 = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError6({
      code: "FORBIDDEN",
      message: "Admin access required"
    });
  }
  return next({ ctx });
});
var appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user)
  }),
  // Products router
  products: router({
    list: publicProcedure.query(async () => {
      return getProducts(true);
    }),
    listAll: adminProcedure4.query(async () => {
      return getProducts(false);
    }),
    get: publicProcedure.input(z6.object({ id: z6.number() })).query(async ({ input }) => {
      return getProductById(input.id);
    }),
    create: adminProcedure4.input(
      z6.object({
        name: z6.string().min(1),
        description: z6.string().optional(),
        price: z6.number().int().positive(),
        weight: z6.string().optional(),
        tastingNotes: z6.string().optional(),
        imageUrl: z6.string().optional()
      })
    ).mutation(async ({ input }) => {
      return createProduct(input);
    }),
    update: adminProcedure4.input(
      z6.object({
        id: z6.number(),
        name: z6.string().min(1).optional(),
        description: z6.string().optional(),
        price: z6.number().int().positive().optional(),
        weight: z6.string().optional(),
        tastingNotes: z6.string().optional(),
        imageUrl: z6.string().optional(),
        active: z6.boolean().optional()
      })
    ).mutation(async ({ input }) => {
      const { id, ...data } = input;
      return updateProduct(id, data);
    }),
    delete: adminProcedure4.input(z6.object({ id: z6.number() })).mutation(async ({ input }) => {
      await deleteProduct(input.id);
      return { success: true };
    })
  }),
  // Ministries router
  ministries: router({
    list: publicProcedure.query(async () => {
      return getMinistries(true);
    }),
    listAll: adminProcedure4.query(async () => {
      return getMinistries(false);
    }),
    get: publicProcedure.input(z6.object({ id: z6.number() })).query(async ({ input }) => {
      return getMinistryById(input.id);
    }),
    create: adminProcedure4.input(
      z6.object({
        name: z6.string().min(1),
        description: z6.string().optional(),
        websiteUrl: z6.string().url().optional(),
        imageUrl: z6.string().optional()
      })
    ).mutation(async ({ input }) => {
      return createMinistry(input);
    }),
    update: adminProcedure4.input(
      z6.object({
        id: z6.number(),
        name: z6.string().min(1).optional(),
        description: z6.string().optional(),
        websiteUrl: z6.string().url().optional(),
        imageUrl: z6.string().optional(),
        active: z6.boolean().optional()
      })
    ).mutation(async ({ input }) => {
      const { id, ...data } = input;
      return updateMinistry(id, data);
    }),
    delete: adminProcedure4.input(z6.object({ id: z6.number() })).mutation(async ({ input }) => {
      await deleteMinistry(input.id);
      return { success: true };
    })
  }),
  // Checkout router
  checkout: checkoutRouter,
  // Contact router
  contact: contactRouter,
  // Images router
  images: imagesRouter,
  // Order notifications router
  orderNotifications: orderNotificationsRouter,
  // Orders router
  orders: router({
    list: adminProcedure4.query(async () => {
      const orders2 = await getOrders();
      const allMinistries = await getMinistries(false);
      const ministryMap = Object.fromEntries(allMinistries.map((m) => [m.id, m.name]));
      return orders2.map((order) => ({
        ...order,
        ministryName: order.ministryId ? ministryMap[order.ministryId] ?? null : null
      }));
    }),
    confirmFromStripe: protectedProcedure.input(z6.object({ sessionId: z6.string() })).mutation(async ({ input, ctx }) => {
      const existing = await getOrderByStripeSessionId(input.sessionId);
      if (existing) return existing;
      const session = await getCheckoutSession(input.sessionId);
      if (session.payment_status !== "paid") {
        throw new TRPCError6({
          code: "BAD_REQUEST",
          message: "Payment not completed yet"
        });
      }
      const ministryId = parseInt(session.metadata?.ministryId || "0") || null;
      const items = safeParseItems(session.metadata?.items);
      const shippingDetails = session.shipping_details;
      const shippingAddress = shippingDetails ? {
        name: shippingDetails.name ?? null,
        line1: shippingDetails.address?.line1 ?? null,
        line2: shippingDetails.address?.line2 ?? null,
        city: shippingDetails.address?.city ?? null,
        state: shippingDetails.address?.state ?? null,
        postalCode: shippingDetails.address?.postal_code ?? null,
        country: shippingDetails.address?.country ?? null
      } : null;
      const order = await createOrder({
        userId: ctx.user.id,
        ministryId: ministryId ?? void 0,
        stripeSessionId: session.id,
        stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : null,
        customerEmail: session.customer_email || ctx.user.email || "",
        totalAmount: session.amount_total || 0,
        currency: session.currency || "gbp",
        status: "paid",
        items,
        shippingAddress
      });
      if (order) {
        const ministry = ministryId ? await getMinistryById(ministryId) : null;
        const ministryName = ministry?.name || "K2 Coffee Ministry";
        try {
          await sendOrderConfirmationEmail(
            ctx.user.email || "",
            ctx.user.name || "Valued Customer",
            order.id,
            items,
            order.totalAmount,
            ministryName
          );
          if (ENV.adminEmail) {
            await sendAdminOrderAlert(
              ENV.adminEmail,
              order.id,
              ctx.user.name || "Customer",
              ctx.user.email || "",
              items,
              order.totalAmount,
              ministryName
            );
          }
        } catch (e) {
          console.error("[Order] Email failed:", e);
        }
      }
      return order;
    }),
    listMine: protectedProcedure.query(async ({ ctx }) => {
      return getOrders(ctx.user.id);
    }),
    get: protectedProcedure.input(z6.object({ id: z6.number() })).query(async ({ input, ctx }) => {
      const order = await getOrderById(input.id);
      if (!order) throw new TRPCError6({ code: "NOT_FOUND" });
      if (order.userId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new TRPCError6({ code: "FORBIDDEN" });
      }
      return order;
    }),
    create: protectedProcedure.input(
      z6.object({
        ministryId: z6.number(),
        items: z6.array(
          z6.object({
            id: z6.number(),
            name: z6.string(),
            quantity: z6.number().int().positive(),
            price: z6.number().int().positive()
          })
        ),
        totalAmount: z6.number().int().positive()
      })
    ).mutation(async ({ input, ctx }) => {
      const order = await createOrder({
        userId: ctx.user.id,
        ministryId: input.ministryId,
        customerEmail: ctx.user.email || "",
        totalAmount: input.totalAmount,
        items: input.items,
        status: "pending"
      });
      if (order) {
        const ministry = await getMinistryById(input.ministryId);
        const ministryName = ministry?.name || "K2 Coffee Ministry";
        await sendOrderConfirmationEmail(
          ctx.user.email || "",
          ctx.user.name || "Valued Customer",
          order.id,
          input.items,
          input.totalAmount,
          ministryName
        );
        if (ENV.adminEmail) {
          await sendAdminOrderAlert(
            ENV.adminEmail,
            order.id,
            ctx.user.name || "Customer",
            ctx.user.email || "",
            input.items,
            input.totalAmount,
            ministryName
          );
        }
      }
      return order;
    }),
    updateStatus: adminProcedure4.input(
      z6.object({
        id: z6.number(),
        status: z6.enum([
          "pending",
          "paid",
          "shipped",
          "completed",
          "cancelled"
        ])
      })
    ).mutation(async ({ input }) => {
      return updateOrder(input.id, { status: input.status });
    })
  })
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    const authHeader = opts.req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      const {
        data: { user: supabaseUser },
        error
      } = await supabaseAdmin.auth.getUser(token);
      if (!error && supabaseUser) {
        const isAdmin = supabaseUser.email === ENV.adminEmail && ENV.adminEmail !== "";
        await upsertUser({
          authId: supabaseUser.id,
          email: supabaseUser.email ?? null,
          name: supabaseUser.user_metadata?.full_name ?? supabaseUser.user_metadata?.name ?? supabaseUser.email?.split("@")[0] ?? null,
          role: isAdmin ? "admin" : void 0,
          lastSignedIn: /* @__PURE__ */ new Date()
        });
        user = await getUserByAuthId(supabaseUser.id) ?? null;
      }
    }
  } catch (error) {
    console.warn("[Auth] Context creation failed:", error);
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/trpcEntry.ts
var app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
    onError: ({ error, path }) => {
      console.error(`[tRPC] error on ${path}:`, error.message, error.code);
      const c1 = error.cause;
      if (c1) {
        console.error("[tRPC] cause:", c1?.message, c1?.code);
        const c2 = c1?.cause;
        if (c2) console.error("[tRPC] root:", c2?.message, JSON.stringify(c2));
      }
    }
  })
);
app.use((err, _req, res, _next) => {
  console.error("[Express] unhandled error:", err?.message ?? err);
  res.status(500).json({ error: "Internal server error" });
});
var trpcEntry_default = app;
export {
  trpcEntry_default as default
};
