import { Resend } from "resend";
import { ENV } from "./env";

let resend: Resend | null = null;

if (ENV.resendApiKey) {
  resend = new Resend(ENV.resendApiKey);
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    if (!resend) {
      console.warn("[Email] Resend not configured, email not sent");
      return false;
    }

    const { error } = await resend.emails.send({
      from: ENV.emailFrom,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    if (error) {
      console.error("[Email] Failed to send:", error);
      return false;
    }

    console.log(`[Email] Sent to ${options.to}: ${options.subject}`);
    return true;
  } catch (error) {
    console.error("[Email] Error sending email:", error);
    return false;
  }
}

export async function sendOrderConfirmationEmail(
  customerEmail: string,
  customerName: string,
  orderId: number,
  items: Array<{ name: string; quantity: number; price: number }>,
  totalAmount: number,
  ministryName: string
): Promise<boolean> {
  const itemsHtml = items
    .map(
      (item) =>
        `<tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${((item.price * item.quantity) / 100).toFixed(2)}</td>
        </tr>`
    )
    .join("");

  const html = `
    <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #78350f, #92400e); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">K2 Coffee</h1>
        <p style="color: #fef3c7; margin: 8px 0 0;">Order Confirmation</p>
      </div>
      <div style="background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="color: #78350f; font-size: 16px;">Dear ${customerName},</p>
        <p style="color: #555;">Thank you for your order! Your purchase supports <strong>${ministryName}</strong>.</p>
        
        <h3 style="color: #78350f; margin-top: 24px;">Order #${orderId}</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <thead>
            <tr style="background: #fef3c7;">
              <th style="padding: 8px; text-align: left; color: #78350f;">Item</th>
              <th style="padding: 8px; text-align: center; color: #78350f;">Qty</th>
              <th style="padding: 8px; text-align: right; color: #78350f;">Price</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding: 12px 8px; font-weight: bold; color: #78350f;">Total</td>
              <td style="padding: 12px 8px; text-align: right; font-weight: bold; color: #78350f;">$${(totalAmount / 100).toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
        
        <div style="background: #fef3c7; padding: 16px; border-radius: 8px; margin-top: 20px;">
          <p style="margin: 0; color: #78350f; font-size: 14px;">
            <strong>Ministry Partner:</strong> ${ministryName}<br>
            A portion of your purchase directly supports this ministry's work.
          </p>
        </div>
        
        <p style="color: #888; font-size: 12px; margin-top: 30px; text-align: center;">
          K2 Coffee Ministry &bull; Premium Yunnan Arabica &bull; k2coffee.xyz
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to: customerEmail,
    subject: `K2 Coffee - Order #${orderId} Confirmed`,
    html,
  });
}

export async function sendAdminOrderAlert(
  adminEmail: string,
  orderId: number,
  customerName: string,
  customerEmail: string,
  items: Array<{ name: string; quantity: number; price: number }>,
  totalAmount: number,
  ministryName: string
): Promise<boolean> {
  if (!adminEmail) return false;

  const itemsList = items
    .map((i) => `${i.name} x${i.quantity} — $${((i.price * i.quantity) / 100).toFixed(2)}`)
    .join("\n");

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #78350f;">New Order Alert — #${orderId}</h2>
      <p><strong>Customer:</strong> ${customerName} (${customerEmail})</p>
      <p><strong>Ministry:</strong> ${ministryName}</p>
      <p><strong>Total:</strong> $${(totalAmount / 100).toFixed(2)}</p>
      <h3>Items:</h3>
      <pre style="background: #f5f5f5; padding: 12px; border-radius: 6px;">${itemsList}</pre>
    </div>
  `;

  return sendEmail({
    to: adminEmail,
    subject: `[K2 Admin] New Order #${orderId} — $${(totalAmount / 100).toFixed(2)}`,
    html,
  });
}

export async function sendOrderStatusUpdateEmail(
  customerEmail: string,
  orderId: number,
  status: string,
  customMessage?: string
): Promise<boolean> {
  if (!customerEmail) return false;

  const statusMessages: Record<string, string> = {
    paid: "Your payment has been confirmed.",
    shipped: "Your order has been shipped! You should receive it soon.",
    completed: "Your order has been delivered. Enjoy your K2 Coffee!",
    cancelled: "Your order has been cancelled.",
  };

  const message = customMessage || statusMessages[status] || `Your order status has been updated to: ${status}`;

  const html = `
    <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #78350f, #92400e); padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0;">K2 Coffee</h1>
      </div>
      <div style="background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <h2 style="color: #78350f;">Order #${orderId} Update</h2>
        <p style="color: #555; font-size: 16px;">${message}</p>
        <p style="color: #888; font-size: 12px; margin-top: 30px; text-align: center;">
          K2 Coffee Ministry &bull; k2coffee.xyz
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to: customerEmail,
    subject: `K2 Coffee — Order #${orderId} ${status.charAt(0).toUpperCase() + status.slice(1)}`,
    html,
  });
}
