import express from "express";
import Stripe from "stripe";
import { ENV } from "./_core/env";
import * as db from "./db";
import {
  sendOrderConfirmationEmail,
  sendAdminOrderAlert,
} from "./_core/email";

const app = express();

// Stripe requires the raw body to verify the signature — do NOT use express.json() here
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

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig as string,
        ENV.stripeWebhookSecret
      );
    } catch (err: any) {
      console.error("[Webhook] Signature verification failed:", err.message);
      res.status(400).json({ error: `Webhook signature invalid: ${err.message}` });
      return;
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      try {
        // Idempotent — skip if order already saved (e.g. client already called confirmFromStripe)
        const existing = await db.getOrderByStripeSessionId(session.id);
        if (existing) {
          res.json({ received: true, skipped: true });
          return;
        }

        const ministryId =
          parseInt(session.metadata?.ministryId || "0") || null;

        let items: Array<{ id: number; name: string; quantity: number; price: number }> = [];
        try {
          items = JSON.parse(session.metadata?.items || "[]");
        } catch {}

        const shippingDetails = (session as any).shipping_details;
        const shippingAddress = shippingDetails
          ? {
              name: shippingDetails.name ?? null,
              line1: shippingDetails.address?.line1 ?? null,
              line2: shippingDetails.address?.line2 ?? null,
              city: shippingDetails.address?.city ?? null,
              state: shippingDetails.address?.state ?? null,
              postalCode: shippingDetails.address?.postal_code ?? null,
              country: shippingDetails.address?.country ?? null,
            }
          : null;

        const userId = session.metadata?.userId
          ? parseInt(session.metadata.userId)
          : undefined;

        const order = await db.createOrder({
          userId,
          ministryId: ministryId ?? undefined,
          stripeSessionId: session.id,
          stripePaymentIntentId:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : null,
          customerEmail: session.customer_email || "",
          totalAmount: session.amount_total || 0,
          currency: session.currency || "gbp",
          status: "paid",
          items,
          shippingAddress,
        });

        if (order) {
          const ministry = ministryId
            ? await db.getMinistryById(ministryId)
            : null;
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

export default app;
