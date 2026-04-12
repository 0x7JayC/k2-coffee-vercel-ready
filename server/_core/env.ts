export const ENV = {
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
  frontendUrl: process.env.VITE_FRONTEND_URL ?? "http://localhost:3000",
  isProduction: process.env.NODE_ENV === "production",
};
