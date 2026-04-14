import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { supabaseAdmin } from "../_core/supabase";
import { nanoid } from "nanoid";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const imagesRouter = router({
  getUploadUrl: adminProcedure
    .input(
      z.object({ filename: z.string(), type: z.enum(["product", "ministry"]) })
    )
    .mutation(async ({ input }) => {
      const ext =
        input.filename.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
      const folder = input.type === "product" ? "products" : "ministries";
      const path = `${folder}/${nanoid()}.${ext}`;
      const { data, error } = await supabaseAdmin.storage
        .from("images")
        .createSignedUploadUrl(path);
      if (error) throw new Error(`Could not create upload URL: ${error.message}`);
      const {
        data: { publicUrl },
      } = supabaseAdmin.storage.from("images").getPublicUrl(path);
      return { signedUrl: data.signedUrl, token: data.token, path, publicUrl };
    }),
  getImageUrl: protectedProcedure
    .input(z.object({ key: z.string() }))
    .query(async ({ input }) => {
      const {
        data: { publicUrl },
      } = supabaseAdmin.storage.from("images").getPublicUrl(input.key);
      return { url: publicUrl };
    }),
});
