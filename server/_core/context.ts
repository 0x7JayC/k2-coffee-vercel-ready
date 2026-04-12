import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { supabaseAdmin } from "./supabase";
import * as db from "../db";
import { ENV } from "./env";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    // Extract the Supabase access token from the Authorization header
    const authHeader = opts.req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);

      // Verify the JWT with Supabase
      const {
        data: { user: supabaseUser },
        error,
      } = await supabaseAdmin.auth.getUser(token);

      if (!error && supabaseUser) {
        // Upsert user into our DB
        const isAdmin =
          supabaseUser.email === ENV.adminEmail && ENV.adminEmail !== "";

        await db.upsertUser({
          authId: supabaseUser.id,
          email: supabaseUser.email ?? null,
          name:
            supabaseUser.user_metadata?.full_name ??
            supabaseUser.user_metadata?.name ??
            supabaseUser.email?.split("@")[0] ??
            null,
          role: isAdmin ? "admin" : undefined,
          lastSignedIn: new Date(),
        });

        user = (await db.getUserByAuthId(supabaseUser.id)) ?? null;
      }
    }
  } catch (error) {
    // Authentication is optional for public procedures
    console.warn("[Auth] Context creation failed:", error);
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
