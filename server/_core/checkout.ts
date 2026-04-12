import Stripe from "stripe";
import { ENV } from "./env";

let stripe: Stripe | null = null;

if (ENV.stripeSecretKey) {
  stripe = new Stripe(ENV.stripeSecretKey);
}

export interface CheckoutRequest {
  items: Array<{
    id: number;
    name: string;
    quantity: number;
    price: number;
  }>;
  ministryId: number;
  totalAmount: number;
  userEmail: string;
  userId?: number;
}

export async function createCheckoutSession(req: CheckoutRequest) {
  if (!stripe) {
    throw new Error(
      "Stripe is not configured. Please add STRIPE_SECRET_KEY to environment variables."
    );
  }

  const { items, ministryId, totalAmount, userEmail, userId } = req;

  if (!items || items.length === 0) {
    throw new Error("No items in cart");
  }

  if (!ministryId) {
    throw new Error("Please select a ministry to support");
  }

  const origin = ENV.frontendUrl;

  const lineItems = items.map((item) => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: item.name,
      },
      unit_amount: item.price,
    },
    quantity: item.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: `${origin}/order/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/order/cancel`,
    customer_email: userEmail,
    metadata: {
      userId: userId?.toString() || "",
      ministryId: ministryId.toString(),
      items: JSON.stringify(
        items.map((i) => ({
          id: i.id,
          name: i.name,
          quantity: i.quantity,
          price: i.price,
        }))
      ),
    },
  });

  return session;
}

export async function getCheckoutSession(sessionId: string) {
  if (!stripe) {
    throw new Error("Stripe is not configured.");
  }
  return stripe.checkout.sessions.retrieve(sessionId);
}
