import { transporter } from "./transport";
import {
  orderConfirmationTemplate,
  adminOrderNotificationTemplate,
  passwordResetTemplate,
} from "./templates";

export const sendOrderConfirmation = async (order: any, customerEmail: string) => {
  const html = orderConfirmationTemplate(order);
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: customerEmail,
    subject: `Order Confirmation - #${order._id.toString().slice(-8)}`,
    html,
  });
};

export const sendAdminOrderNotification = async (order: any, adminEmail: string) => {
  const html = adminOrderNotificationTemplate(order);
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: adminEmail,
    subject: `New Order - #${order._id.toString().slice(-8)}`,
    html,
  });
};

export const sendPasswordReset = async (email: string, resetToken: string, userId: string) => {
  const html = passwordResetTemplate(resetToken, userId);
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Reset Your Password",
    html,
  });
};

export * from "./transport";
export * from "./templates";










