import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import { checkoutRouter } from "./routers/checkout";
import { imagesRouter } from "./routers/images";
import { orderNotificationsRouter } from "./routers/orderNotifications";
import {
  sendOrderConfirmationEmail,
  sendAdminOrderAlert,
} from "./_core/email";
import { ENV } from "./_core/env";

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

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
  }),

  // Products router
  products: router({
    list: publicProcedure.query(async () => {
      return db.getProducts(true);
    }),
    listAll: adminProcedure.query(async () => {
      return db.getProducts(false);
    }),
    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getProductById(input.id);
      }),
    create: adminProcedure
      .input(
        z.object({
          name: z.string().min(1),
          description: z.string().optional(),
          price: z.number().int().positive(),
          weight: z.string().optional(),
          tastingNotes: z.string().optional(),
          imageUrl: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return db.createProduct(input);
      }),
    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1).optional(),
          description: z.string().optional(),
          price: z.number().int().positive().optional(),
          weight: z.string().optional(),
          tastingNotes: z.string().optional(),
          imageUrl: z.string().optional(),
          active: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateProduct(id, data);
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteProduct(input.id);
        return { success: true };
      }),
  }),

  // Ministries router
  ministries: router({
    list: publicProcedure.query(async () => {
      return db.getMinistries(true);
    }),
    listAll: adminProcedure.query(async () => {
      return db.getMinistries(false);
    }),
    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getMinistryById(input.id);
      }),
    create: adminProcedure
      .input(
        z.object({
          name: z.string().min(1),
          description: z.string().optional(),
          websiteUrl: z.string().url().optional(),
          imageUrl: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return db.createMinistry(input);
      }),
    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1).optional(),
          description: z.string().optional(),
          websiteUrl: z.string().url().optional(),
          imageUrl: z.string().optional(),
          active: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateMinistry(id, data);
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteMinistry(input.id);
        return { success: true };
      }),
  }),

  // Checkout router
  checkout: checkoutRouter,

  // Images router
  images: imagesRouter,

  // Order notifications router
  orderNotifications: orderNotificationsRouter,

  // Orders router
  orders: router({
    list: adminProcedure.query(async () => {
      return db.getOrders();
    }),
    listMine: protectedProcedure.query(async ({ ctx }) => {
      return db.getOrders(ctx.user.id);
    }),
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const order = await db.getOrderById(input.id);
        if (!order) throw new TRPCError({ code: "NOT_FOUND" });
        if (order.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        return order;
      }),
    create: protectedProcedure
      .input(
        z.object({
          ministryId: z.number(),
          items: z.array(
            z.object({
              id: z.number(),
              name: z.string(),
              quantity: z.number().int().positive(),
              price: z.number().int().positive(),
            })
          ),
          totalAmount: z.number().int().positive(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const order = await db.createOrder({
          userId: ctx.user.id,
          ministryId: input.ministryId,
          customerEmail: ctx.user.email || "",
          totalAmount: input.totalAmount,
          items: input.items as any,
          status: "pending",
        });

        if (order) {
          const ministry = await db.getMinistryById(input.ministryId);
          const ministryName = ministry?.name || "K2 Coffee Ministry";
          await sendOrderConfirmationEmail(
            ctx.user.email || "",
            ctx.user.name || "Valued Customer",
            order.id,
            input.items,
            input.totalAmount,
            ministryName
          );

          if (ENV.adminEmail) {
            await sendAdminOrderAlert(
              ENV.adminEmail,
              order.id,
              ctx.user.name || "Customer",
              ctx.user.email || "",
              input.items,
              input.totalAmount,
              ministryName
            );
          }
        }

        return order;
      }),
    updateStatus: adminProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum([
            "pending",
            "paid",
            "shipped",
            "completed",
            "cancelled",
          ]),
        })
      )
      .mutation(async ({ input }) => {
        return db.updateOrder(input.id, { status: input.status });
      }),
  }),
});

export type AppRouter = typeof appRouter;
