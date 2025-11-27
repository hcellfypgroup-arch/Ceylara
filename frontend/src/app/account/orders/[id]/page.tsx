import { notFound } from "next/navigation";
import { OrderDetails } from "@/components/account/order-details";
import { db } from "@/lib/db";
import { orderService } from "@/lib/services";
import { getSessionUser } from "@/app/api/_utils/auth";

async function getOrder(id: string) {
  try {
    // Ensure ID is a string
    const orderId = String(id).trim();
    if (!orderId) return null;
    
    // Verify user is authenticated
    const session = await getSessionUser();
    if (!session) {
      return null;
    }
    
    await db.connect();
    const order = await orderService.getOrderById(orderId);
    
    // Verify the order belongs to the user
    const orderUserId = order.user 
      ? (typeof order.user === 'object' 
          ? order.user.toString() 
          : order.user)
      : null;
    
    if (orderUserId && orderUserId !== session.id && session.role !== 'admin') {
      return null;
    }
    
    return order;
  } catch (error) {
    console.error("Failed to fetch order:", error);
    return null;
  }
}

function serializeOrder(order: any) {
  return {
    _id: typeof order._id === 'object' && order._id?.toString 
      ? order._id.toString() 
      : String(order._id),
    status: String(order.status || ''),
    total: Number(order.total || 0),
    subtotal: Number(order.subtotal || 0),
    deliveryFee: Number(order.deliveryFee || 0),
    discount: Number(order.discount || 0),
    items: (order.items || []).map((item: any) => ({
      title: String(item.title || ''),
      quantity: Number(item.quantity || 0),
      price: Number(item.price || 0),
      size: item.size ? String(item.size) : undefined,
      color: item.color ? String(item.color) : undefined,
      thumbnail: item.thumbnail ? String(item.thumbnail) : undefined,
      customFields: item.customFields ? item.customFields.map((field: any) => ({
        label: String(field.label || ''),
        value: String(field.value || ''),
      })) : undefined,
    })),
    createdAt: order.createdAt 
      ? (order.createdAt instanceof Date 
          ? order.createdAt.toISOString() 
          : new Date(order.createdAt).toISOString())
      : new Date().toISOString(),
    address: {
      recipientName: order.address?.recipientName ? String(order.address.recipientName) : undefined,
      line1: String(order.address?.line1 || ''),
      line2: order.address?.line2 ? String(order.address.line2) : undefined,
      city: String(order.address?.city || ''),
      state: String(order.address?.state || ''),
      postalCode: String(order.address?.postalCode || ''),
      country: String(order.address?.country || ''),
      phone: order.address?.phone ? String(order.address.phone) : undefined,
    },
    payment: {
      method: String(order.payment?.method || ''),
      status: String(order.payment?.status || ''),
    },
    delivery: order.delivery ? {
      method: order.delivery.method ? String(order.delivery.method) : undefined,
      trackingNumber: order.delivery.trackingNumber ? String(order.delivery.trackingNumber) : undefined,
      estimatedDate: order.delivery.estimatedDate 
        ? (order.delivery.estimatedDate instanceof Date 
            ? order.delivery.estimatedDate.toISOString() 
            : new Date(order.delivery.estimatedDate).toISOString())
        : undefined,
    } : undefined,
  };
}

export default async function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(id);

  if (!order) {
    notFound();
  }

  // Serialize the order to plain object before passing to client component
  const serializedOrder = serializeOrder(order);

  return <OrderDetails order={serializedOrder} />;
}

