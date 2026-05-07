import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { createCheckoutSession } from "../_core/checkout";
import { getProductById } from "../db";
import { TRPCError } from "@trpc/server";

export const checkoutRouter = router({
  createSession: protectedProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            id: z.number(),
            quantity: z.number().int().positive().max(99),
          })
        ),
        ministryId: z.number(),
        shippingMethod: z.enum(["standard", "collection"]).default("standard"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Fetch real prices from DB — never trust client-supplied prices
        const verifiedItems = await Promise.all(
          input.items.map(async ({ id, quantity }) => {
            const product = await getProductById(id);
            if (!product || !product.active) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: `Product ${id} is not available`,
              });
            }
            return { id: product.id, name: product.name, quantity, price: product.price };
          })
        );

        const totalAmount = verifiedItems.reduce(
          (sum, i) => sum + i.price * i.quantity, 0
        );

        const session = await createCheckoutSession({
          items: verifiedItems,
          ministryId: input.ministryId,
          totalAmount,
          shippingMethod: input.shippingMethod,
          userEmail: ctx.user.email || "",
          userId: ctx.user.id,
        });

        return {
          url: session.url,
          sessionId: session.id,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Checkout error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create checkout session. Please try again.",
        });
      }
    }),
});
