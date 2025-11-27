"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

type Customer = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  addresses?: Array<{
    _id: string;
    label: string;
    recipientName: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
    isDefault: boolean;
  }>;
  createdAt: string;
};

type Order = {
  _id: string;
  orderNumber?: string;
  total: number;
  status: string;
  createdAt: string;
};

export default function AdminCustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (customerId) {
      fetchCustomerData();
    }
  }, [customerId]);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      const [customerResponse, ordersResponse] = await Promise.all([
        fetch(`/api/admin/customers/${customerId}`),
        fetch(`/api/admin/customers/${customerId}/orders`),
      ]);

      if (customerResponse.ok) {
        const { data } = await customerResponse.json();
        setCustomer(data);
      }

      if (ordersResponse.ok) {
        const { data } = await ordersResponse.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Failed to fetch customer data:", error);
      toast.error("Failed to load customer details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Customer Details</h1>
        </div>
        <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-12 text-center">
          <p className="text-[var(--muted)]">Loading customer details...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Customer Details</h1>
        </div>
        <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-12 text-center">
          <p className="text-[var(--muted)]">Customer not found</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push("/admin/customers")}
          >
            Back to Customers
          </Button>
        </div>
      </div>
    );
  }

  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{customer.name}</h1>
          <p className="text-sm text-[var(--muted)] mt-1">{customer.email}</p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push("/admin/customers")}
        >
          Back to Customers
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-6">
            <h2 className="text-lg font-semibold mb-4">Customer Information</h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-[var(--muted)]">Name: </span>
                <span className="font-medium">{customer.name}</span>
              </div>
              <div>
                <span className="text-[var(--muted)]">Email: </span>
                <span className="font-medium">{customer.email}</span>
              </div>
              {customer.phone && (
                <div>
                  <span className="text-[var(--muted)]">Phone: </span>
                  <span className="font-medium">{customer.phone}</span>
                </div>
              )}
              <div>
                <span className="text-[var(--muted)]">Member Since: </span>
                <span className="font-medium">
                  {new Date(customer.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Addresses */}
          {customer.addresses && customer.addresses.length > 0 && (
            <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-6">
              <h2 className="text-lg font-semibold mb-4">Saved Addresses</h2>
              <div className="space-y-4">
                {customer.addresses.map((address) => (
                  <div
                    key={address._id}
                    className="p-4 border border-[var(--border)] rounded-[var(--radius-md)]"
                  >
                    {address.isDefault && (
                      <Badge tone="brand" className="mb-2">Default</Badge>
                    )}
                    <div className="space-y-1 text-sm">
                      {address.recipientName && (
                        <p className="font-medium">{address.recipientName}</p>
                      )}
                      <p>{address.line1}</p>
                      {address.line2 && <p>{address.line2}</p>}
                      <p>
                        {address.city}, {address.state} {address.postalCode}
                      </p>
                      <p>{address.country}</p>
                      {address.phone && (
                        <p className="text-[var(--muted)]">Phone: {address.phone}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Orders */}
          <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
            {orders.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">No orders yet</p>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 10).map((order) => (
                  <div
                    key={order._id}
                    className="flex items-center justify-between p-3 border border-[var(--border)] rounded-[var(--radius-md)] hover:bg-[var(--accent)]/20 transition"
                  >
                    <div>
                      <p className="font-medium">
                        Order #{order.orderNumber || order._id.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-xs text-[var(--muted)]">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(order.total)}</p>
                      <Badge tone="neutral" className="text-xs mt-1">
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Statistics */}
          <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-6">
            <h2 className="text-lg font-semibold mb-4">Statistics</h2>
            <div className="space-y-4 text-sm">
              <div>
                <span className="text-[var(--muted)]">Total Orders</span>
                <p className="text-2xl font-semibold mt-1">{orders.length}</p>
              </div>
              <div>
                <span className="text-[var(--muted)]">Total Spent</span>
                <p className="text-2xl font-semibold mt-1">
                  {formatCurrency(totalSpent)}
                </p>
              </div>
              {orders.length > 0 && (
                <div>
                  <span className="text-[var(--muted)]">Average Order Value</span>
                  <p className="text-2xl font-semibold mt-1">
                    {formatCurrency(totalSpent / orders.length)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

