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
  shippingMethod?: "standard" | "collection";
  userEmail: string;
  userId?: number;
}

const FREE_SHIPPING_THRESHOLD = 5900; // £59
const STANDARD_SHIPPING = 399; // £3.99

export async function createCheckoutSession(req: CheckoutRequest) {
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
        name: item.name,
      },
      unit_amount: item.price,
    },
    quantity: item.quantity,
  }));

  // Compute shipping server-side from the trusted subtotal.
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const isCollection = shippingMethod === "collection";
  const qualifiesFree = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingAmount = isCollection || qualifiesFree ? 0 : STANDARD_SHIPPING;

  const shippingRateLabel = isCollection
    ? "Local collection"
    : qualifiesFree
    ? "Free delivery (orders over £59)"
    : "Standard delivery";

  const shippingOptions: Stripe.Checkout.SessionCreateParams.ShippingOption[] = [
    {
      shipping_rate_data: {
        type: "fixed_amount",
        fixed_amount: { amount: shippingAmount, currency: "gbp" },
        display_name: shippingRateLabel,
      },
    },
  ];

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: `${origin}/order/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/order/cancel`,
    customer_email: userEmail,
    ...(isCollection
      ? {}
      : {
          shipping_address_collection: {
            allowed_countries: ["GB", "US", "AU", "CA", "NZ", "IE", "SG", "HK"],
          },
        }),
    shipping_options: shippingOptions,
    phone_number_collection: {
      enabled: true,
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
