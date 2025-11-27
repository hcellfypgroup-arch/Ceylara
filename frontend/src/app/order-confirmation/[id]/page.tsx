import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { db } from "@/lib/db";
import { orderService } from "@/lib/services";
import { notFound } from "next/navigation";

async function getOrder(id: string) {
  try {
    await db.connect();
    const order = await orderService.getOrderById(id);
    return order;
  } catch (error) {
    console.error("Failed to fetch order:", error);
    return null;
  }
}

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(id);

  if (!order) {
    notFound();
  }

  const orderWithId = order as typeof order & { _id: { toString(): string } | string };
  const orderId = typeof orderWithId._id === 'object' ? orderWithId._id.toString() : String(orderWithId._id);
  const itemCount = order.items?.length || 0;

  return (
    <section className="section">
      <div className=" space-y-8 py-10 rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-8 text-center shadow-[var(--shadow-soft)]">
        <Badge tone="brand" className="mx-auto w-max">
          Order placed
        </Badge>
        <h1 className="text-4xl font-semibold">
          Thank you for your purchase
        </h1>
        <p className="text-lg text-[var(--muted)]">
          Your order #{orderId.slice(-8).toUpperCase()} is confirmed. We will notify you when it ships.
          {order.delivery?.estimatedDate && (
            <span> Estimated delivery: {new Date(order.delivery.estimatedDate).toLocaleDateString()}.</span>
          )}
        </p>
        <div className="mx-auto max-w-lg divide-y divide-[var(--border)] text-left text-sm">
          <div className="flex items-center justify-between py-3">
            <span>Items</span>
            <span>{itemCount} product{itemCount !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span>Subtotal</span>
            <span>{formatCurrency(order.subtotal || 0)}</span>
          </div>
          {(order.deliveryFee || 0) > 0 && (
            <div className="flex items-center justify-between py-3">
              <span>Delivery</span>
              <span>{formatCurrency(order.deliveryFee || 0)}</span>
            </div>
          )}
          {(order.discount || 0) > 0 && (
            <div className="flex items-center justify-between py-3">
              <span>Discount</span>
              <span>-{formatCurrency(order.discount || 0)}</span>
            </div>
          )}
          <div className="flex items-center justify-between py-3 font-semibold">
            <span>Total paid</span>
            <span>{formatCurrency(order.total || 0)}</span>
          </div>
          {order.delivery?.trackingNumber && (
            <div className="flex items-center justify-between py-3">
              <span>Tracking number</span>
              <span>{order.delivery.trackingNumber}</span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild className="bg-[var(--accent)] hover:border-[var(--foreground)] hover:bg-[var(--accent)] hover:text-black transition-all duration-300 active:scale-95
          ">
            <Link href="/shop"></Link>
          </Button>
        </div>
      </div>
    </section>
  );
}


