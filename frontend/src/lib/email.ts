import nodemailer from "nodemailer";
import { env } from "@/lib/env";

const transporter =
  env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS
    ? nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT ?? 587,
        secure: false,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      })
    : null;

export const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) => {
  if (!transporter) return;

  await transporter.sendMail({
    from: env.SMTP_FROM ?? "no-reply@ceylara.com",
    to,
    subject,
    html,
  });
};

export const sendOrderConfirmation = async (order: any, email: string) => {
  const orderId = typeof order._id === 'object' ? order._id.toString() : String(order._id);
  const shortOrderId = orderId.slice(-8).toUpperCase();
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #000;">Thank you for your order!</h1>
          <p>Your order #${shortOrderId} has been confirmed.</p>
          
          <h2 style="margin-top: 30px;">Order Details</h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr style="background-color: #f5f5f5;">
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Item</th>
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Quantity</th>
                <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${order.items?.map((item: any) => `
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd;">${item.title} ${item.size ? `(${item.size})` : ''}</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${item.quantity}</td>
                  <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">Rs ${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #ddd;">
            <p><strong>Subtotal:</strong> Rs ${(order.subtotal || 0).toFixed(2)}</p>
            ${order.deliveryFee > 0 ? `<p><strong>Delivery:</strong> Rs ${order.deliveryFee.toFixed(2)}</p>` : ''}
            ${order.discount > 0 ? `<p><strong>Discount:</strong> -Rs ${order.discount.toFixed(2)}</p>` : ''}
            <p style="font-size: 18px; font-weight: bold;"><strong>Total:</strong> Rs ${(order.total || 0).toFixed(2)}</p>
          </div>
          
          <p style="margin-top: 30px;">We'll notify you when your order ships.</p>
          <p>Thank you for shopping with us!</p>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: `Order Confirmation #${shortOrderId}`,
    html,
  });
};

export const sendAdminOrderNotification = async (order: any, adminEmail: string) => {
  const orderId = typeof order._id === 'object' ? order._id.toString() : String(order._id);
  const shortOrderId = orderId.slice(-8).toUpperCase();
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>New Order Notification</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #000;">New Order Received</h1>
          <p>Order #${shortOrderId} has been placed.</p>
          
          <h2 style="margin-top: 30px;">Customer Information</h2>
          <p><strong>Email:</strong> ${order.email}</p>
          ${order.address ? `
            <p><strong>Address:</strong> ${order.address.line1}, ${order.address.city}, ${order.address.state} ${order.address.postalCode}</p>
            ${order.address.phone ? `<p><strong>Phone:</strong> ${order.address.phone}</p>` : ''}
          ` : ''}
          
          <h2 style="margin-top: 30px;">Order Details</h2>
          <p><strong>Total:</strong> Rs ${(order.total || 0).toFixed(2)}</p>
          <p><strong>Payment Method:</strong> ${order.payment?.method || 'N/A'}</p>
          <p><strong>Items:</strong> ${order.items?.length || 0}</p>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: adminEmail,
    subject: `New Order #${shortOrderId}`,
    html,
  });
};

