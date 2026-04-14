+++ server/routers/images.ts (修改后)
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

async function generateSignedUploadUrl(
  bucket: string,
  filename: string,
  mimeType: string
): Promise<{ uploadUrl: string; publicUrl: string; key: string }> {
  const ext = filename.split(".").pop() || "jpg";
  const key = `${bucket}/${nanoid()}.${ext}`;

  // Check if Supabase is configured
  if (!ENV.supabaseUrl || !ENV.supabaseServiceKey) {
    throw new Error("Supabase is not configured. Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.");
  }

  // Generate a signed upload URL valid for 60 seconds
  const { data: signedUrlData, error: urlError } = await supabaseAdmin.storage
    .from("images")
    .createSignedUploadUrl(key, {
      upsert: false,
    });

  if (urlError) {
    console.error("[Images] Signed URL generation error:", urlError);
    throw new Error(`Failed to generate upload URL: ${urlError.message}`);
  }

  if (!signedUrlData?.signedUrl) {
    throw new Error("Failed to generate upload URL: No URL returned");
  }

  // Get the public URL for later retrieval
  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from("images").getPublicUrl(key);

  return {
    uploadUrl: signedUrlData.signedUrl,
    publicUrl,
    key
  };
}

export const imagesRouter = router({
  // Get signed upload URL for product image
  getProductImageUploadUrl: adminProcedure
    .input(
      z.object({
        filename: z.string(),
        mimeType: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const { uploadUrl, publicUrl, key } = await generateSignedUploadUrl(
          "products",
          input.filename,
          input.mimeType
        );

        return { uploadUrl, publicUrl, key };
      } catch (error) {
        console.error("[Images] Failed to get product image upload URL:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to get upload URL";
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: errorMessage,
        });
      }
    }),

  // Get signed upload URL for ministry image
  getMinistryImageUploadUrl: adminProcedure
    .input(
      z.object({
        filename: z.string(),
        mimeType: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const { uploadUrl, publicUrl, key } = await generateSignedUploadUrl(
          "ministries",
          input.filename,
          input.mimeType
        );

        return { uploadUrl, publicUrl, key };
      } catch (error) {
        console.error("[Images] Failed to get ministry image upload URL:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to get upload URL";
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: errorMessage,
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
