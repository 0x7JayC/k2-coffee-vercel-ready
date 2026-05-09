import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { sendEmail } from "../_core/email";
import { ENV } from "../_core/env";

export const contactRouter = router({
  send: publicProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        email: z.string().email(),
        orderNumber: z.string().max(50).optional(),
        message: z.string().min(10).max(2000),
      })
    )
    .mutation(async ({ input }) => {
      if (!ENV.adminEmail) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Contact not configured",
        });
      }

      const subject = input.orderNumber
        ? `K2 Contact: ${input.name} · Order #${input.orderNumber}`
        : `K2 Contact: ${input.name}`;

      const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2b1d14;">New Contact Message</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #7a5a45; font-size: 13px; width: 120px;">From</td>
                <td style="padding: 8px 0; color: #2b1d14;">${input.name}</td></tr>
            <tr><td style="padding: 8px 0; color: #7a5a45; font-size: 13px;">Email</td>
                <td style="padding: 8px 0; color: #2b1d14;"><a href="mailto:${input.email}">${input.email}</a></td></tr>
            ${input.orderNumber ? `<tr><td style="padding: 8px 0; color: #7a5a45; font-size: 13px;">Order #</td>
                <td style="padding: 8px 0; color: #2b1d14;">${input.orderNumber}</td></tr>` : ""}
          </table>
          <div style="margin-top: 24px; padding: 16px; background: #f5efe4; border-radius: 8px;">
            <p style="margin: 0; color: #2b1d14; line-height: 1.7; white-space: pre-wrap;">${input.message}</p>
          </div>
          <p style="margin-top: 24px; color: #a88f73; font-size: 12px;">
            Reply directly to this email to respond to ${input.name}.
          </p>
        </div>
      `;

      const sent = await sendEmail({
        to: ENV.adminEmail,
        subject,
        html,
      });

      if (!sent) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send message. Please try again later.",
        });
      }

      return { success: true };
    }),
});
