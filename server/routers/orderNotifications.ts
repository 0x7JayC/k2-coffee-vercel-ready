import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getOrderById, updateOrderStatus } from "../db";
import { sendOrderStatusUpdateEmail } from "../_core/email";

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

export const orderNotificationsRouter = router({
  updateOrderStatus: adminProcedure
    .input(
      z.object({
        orderId: z.number(),
        status: z.enum(["pending", "paid", "shipped", "completed"]),
      })
    )
    .mutation(async ({ input }) => {
      const order = await getOrderById(input.orderId);
      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
      }

      await updateOrderStatus(input.orderId, input.status);

      try {
        await sendOrderStatusUpdateEmail(
          order.customerEmail || "",
          input.orderId,
          input.status
        );
      } catch (emailError) {
        console.error(
          "[OrderNotifications] Failed to send email:",
          emailError
        );
      }

      return {
        success: true,
        message: `Order status updated to ${input.status}`,
      };
    }),

  sendManualNotification: adminProcedure
    .input(
      z.object({
        orderId: z.number(),
        message: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const order = await getOrderById(input.orderId);
      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
      }

      try {
        await sendOrderStatusUpdateEmail(
          order.customerEmail || "",
          input.orderId,
          order.status || "pending",
          input.message
        );
      } catch (emailError) {
        console.error(
          "[OrderNotifications] Failed to send email:",
          emailError
        );
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send notification",
        });
      }

      return { success: true, message: "Notification sent successfully" };
    }),
});
