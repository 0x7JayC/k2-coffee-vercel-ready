import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { supabaseAdmin } from "../_core/supabase";
import { nanoid } from "nanoid";

// Helper to ensure user is admin
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }
  return next({ ctx });
});

export const imagesRouter = router({
  // Returns a signed upload URL so the client can upload directly to Supabase.
  // This avoids sending file bytes through Vercel (4.5 MB body limit).
  getUploadUrl: adminProcedure
    .input(
      z.object({
        filename: z.string(),
        type: z.enum(["product", "ministry"]),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const ext =
          input.filename.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
        const folder = input.type === "product" ? "products" : "ministries";
        const path = `${folder}/${nanoid()}.${ext}`;

        const { data, error } = await supabaseAdmin.storage
          .from("images")
          .createSignedUploadUrl(path);

        if (error) {
          throw new Error(`Could not create upload URL: ${error.message}`);
        }

        const {
          data: { publicUrl },
        } = supabaseAdmin.storage.from("images").getPublicUrl(path);

        return {
          signedUrl: data.signedUrl,
          token: data.token,
          path,
          publicUrl,
        };
      } catch (error) {
        console.error("[Images] getUploadUrl error:", error);
        const message =
          error instanceof Error ? error.message : "Failed to get upload URL";
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message });
      }
    }),

  // Get image URL by storage key (kept for existing usage)
  getImageUrl: protectedProcedure
    .input(z.object({ key: z.string() }))
    .query(async ({ input }) => {
      try {
        const {
          data: { publicUrl },
        } = supabaseAdmin.storage.from("images").getPublicUrl(input.key);

        return { url: publicUrl };
      } catch (error) {
        console.error("[Images] Failed to get image URL:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get image URL",
        });
      }
    }),
});
