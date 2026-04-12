import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { createCheckoutSession } from "../_core/checkout";
import { TRPCError } from "@trpc/server";

export const checkoutRouter = router({
  createSession: protectedProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            id: z.number(),
            name: z.string(),
            quantity: z.number().int().positive(),
            price: z.number().int().positive(),
          })
        ),
        ministryId: z.number(),
        totalAmount: z.number().int().positive(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const session = await createCheckoutSession({
          items: input.items,
          ministryId: input.ministryId,
          totalAmount: input.totalAmount,
          userEmail: ctx.user.email || "",
          userId: ctx.user.id,
        });

        return {
          url: session.url,
          sessionId: session.id,
        };
      } catch (error) {
        console.error("Checkout error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create checkout session",
        });
      }
    }),
});
