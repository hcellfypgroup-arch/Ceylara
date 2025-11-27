import { env } from "@/lib/env";

export const orderConfirmationTemplate = (order: any) => {
  const itemsHtml = order.items
    .map(
      (item: any) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <img src="${item.thumbnail}" alt="${item.title}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;" />
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.title}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.size} / ${item.color}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">Rs ${item.price.toFixed(2)}</td>
    </tr>
  `
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0;">Order Confirmation</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
    <p>Thank you for your order! Your order has been received and is being processed.</p>
    
    <div style="background: white; padding: 20px; border-radius: 4px; margin: 20px 0;">
      <h2 style="margin-top: 0;">Order #${order._id.toString().slice(-8)}</h2>
      <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
      <p><strong>Status:</strong> ${order.status}</p>
    </div>

    <h3>Order Items</h3>
    <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 4px; overflow: hidden;">
      <thead>
        <tr style="background: #f5f5f5;">
          <th style="padding: 10px; text-align: left;">Image</th>
          <th style="padding: 10px; text-align: left;">Product</th>
          <th style="padding: 10px; text-align: left;">Variant</th>
          <th style="padding: 10px; text-align: left;">Qty</th>
          <th style="padding: 10px; text-align: left;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div style="background: white; padding: 20px; border-radius: 4px; margin: 20px 0;">
      <table style="width: 100%;">
        <tr>
          <td style="padding: 5px 0;">Subtotal:</td>
          <td style="text-align: right; padding: 5px 0;">Rs ${order.subtotal.toFixed(2)}</td>
        </tr>
        <tr>
          <td style="padding: 5px 0;">Delivery Fee:</td>
          <td style="text-align: right; padding: 5px 0;">Rs ${order.deliveryFee.toFixed(2)}</td>
        </tr>
        ${order.discount > 0 ? `
        <tr>
          <td style="padding: 5px 0;">Discount:</td>
          <td style="text-align: right; padding: 5px 0;">-Rs ${order.discount.toFixed(2)}</td>
        </tr>
        ` : ""}
        <tr style="border-top: 2px solid #333; font-weight: bold;">
          <td style="padding: 10px 0;">Total:</td>
          <td style="text-align: right; padding: 10px 0;">Rs ${order.total.toFixed(2)}</td>
        </tr>
      </table>
    </div>

    <div style="background: white; padding: 20px; border-radius: 4px; margin: 20px 0;">
      <h3 style="margin-top: 0;">Delivery Address</h3>
      <p>
        ${order.address.recipientName || ""}<br>
        ${order.address.line1}<br>
        ${order.address.line2 ? order.address.line2 + "<br>" : ""}
        ${order.address.city}, ${order.address.state} ${order.address.postalCode}<br>
        ${order.address.country}
      </p>
    </div>

    <p style="text-align: center; margin-top: 30px;">
      <a href="${env.NEXT_PUBLIC_SITE_URL}/account/orders" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">View Order Details</a>
    </p>
  </div>
</body>
</html>
  `;
};

export const adminOrderNotificationTemplate = (order: any) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <h2>New Order Received</h2>
  <p>A new order has been placed:</p>
  <ul>
    <li><strong>Order ID:</strong> ${order._id}</li>
    <li><strong>Customer:</strong> ${order.email}</li>
    <li><strong>Total:</strong> Rs ${order.total.toFixed(2)}</li>
    <li><strong>Items:</strong> ${order.items.length}</li>
  </ul>
  <p><a href="${env.NEXT_PUBLIC_SITE_URL}/admin/orders">View Order in Admin Panel</a></p>
</body>
</html>
  `;
};

export const passwordResetTemplate = (resetToken: string, userId: string) => {
  const resetUrl = `${env.NEXT_PUBLIC_SITE_URL}/reset-password?token=${resetToken}&id=${userId}`;
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0;">Password Reset Request</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
    <p>You requested to reset your password. Click the button below to reset it:</p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
    </p>
    <p style="font-size: 12px; color: #666;">Or copy and paste this link into your browser:</p>
    <p style="font-size: 12px; color: #666; word-break: break-all;">${resetUrl}</p>
    <p style="font-size: 12px; color: #666; margin-top: 20px;">This link will expire in 1 hour. If you didn't request this, please ignore this email.</p>
  </div>
</body>
</html>
  `;
};


