// server/webhookEntry.ts
import express from "express";
import Stripe from "stripe";

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
async function getMinistryById(id) {
  const db = getDb();
  if (!db) return void 0;
  const result = await db.select().from(ministries).where(eq(ministries.id, id)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function createOrder(data) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(orders).values(data).returning();
  return result[0];
}
async function getOrderByStripeSessionId(sessionId) {
  const db = getDb();
  if (!db) return void 0;
  const result = await db.select().from(orders).where(eq(orders.stripeSessionId, sessionId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}

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

// server/webhookEntry.ts
var app = express();
app.post(
  "/api/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    if (!ENV.stripeSecretKey || !ENV.stripeWebhookSecret) {
      console.error("[Webhook] Stripe not configured");
      res.status(500).json({ error: "Stripe not configured" });
      return;
    }
    const stripe = new Stripe(ENV.stripeSecretKey);
    const sig = req.headers["stripe-signature"];
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        ENV.stripeWebhookSecret
      );
    } catch (err) {
      console.error("[Webhook] Signature verification failed:", err.message);
      res.status(400).json({ error: `Webhook signature invalid: ${err.message}` });
      return;
    }
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      try {
        const existing = await getOrderByStripeSessionId(session.id);
        if (existing) {
          res.json({ received: true, skipped: true });
          return;
        }
        const ministryId = parseInt(session.metadata?.ministryId || "0") || null;
        let items = [];
        try {
          items = JSON.parse(session.metadata?.items || "[]");
        } catch {
        }
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
        const userId = session.metadata?.userId ? parseInt(session.metadata.userId) : void 0;
        const order = await createOrder({
          userId,
          ministryId: ministryId ?? void 0,
          stripeSessionId: session.id,
          stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : null,
          customerEmail: session.customer_email || "",
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
              order.customerEmail || "",
              session.customer_details?.name || "Valued Customer",
              order.id,
              items,
              order.totalAmount,
              ministryName
            );
            if (ENV.adminEmail) {
              await sendAdminOrderAlert(
                ENV.adminEmail,
                order.id,
                session.customer_details?.name || "Customer",
                order.customerEmail || "",
                items,
                order.totalAmount,
                ministryName
              );
            }
          } catch (emailErr) {
            console.error("[Webhook] Email failed:", emailErr);
          }
          console.log(`[Webhook] Order #${order.id} created for session ${session.id}`);
        }
      } catch (err) {
        console.error("[Webhook] Failed to create order:", err);
        res.status(500).json({ error: "Failed to process order" });
        return;
      }
    }
    res.json({ received: true });
  }
);
var webhookEntry_default = app;
export {
  webhookEntry_default as default
};
