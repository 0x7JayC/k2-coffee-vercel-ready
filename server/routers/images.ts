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

async function uploadToSupabase(
  bucket: string,
  fileData: number[],
  filename: string,
  mimeType: string
): Promise<{ url: string; key: string }> {
  const buffer = Buffer.from(fileData);
  const ext = filename.split(".").pop() || "jpg";
  const key = `${bucket}/${nanoid()}.${ext}`;

  const { error } = await supabaseAdmin.storage
    .from("images")
    .upload(key, buffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  // Get the public URL
  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from("images").getPublicUrl(key);

  return { url: publicUrl, key };
}

export const imagesRouter = router({
  // Upload product image
  uploadProductImage: adminProcedure
    .input(
      z.object({
        file: z.array(z.number()),
        filename: z.string(),
        mimeType: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { url, key } = await uploadToSupabase(
          "products",
          input.file,
          input.filename,
          input.mimeType
        );

        return { success: true, url, key };
      } catch (error) {
        console.error("[Images] Failed to upload product image:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upload image",
        });
      }
    }),

  // Upload ministry image
  uploadMinistryImage: adminProcedure
    .input(
      z.object({
        file: z.array(z.number()),
        filename: z.string(),
        mimeType: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { url, key } = await uploadToSupabase(
          "ministries",
          input.file,
          input.filename,
          input.mimeType
        );

        return { success: true, url, key };
      } catch (error) {
        console.error("[Images] Failed to upload ministry image:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upload image",
        });
      }
    }),

  // Get image URL
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
