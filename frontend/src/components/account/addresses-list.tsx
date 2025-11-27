"use client";

import { useEffect, useState } from "react";
import { AddressForm } from "@/components/account/address-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";

type Address = {
  _id: string;
  label: string;
  recipientName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault?: boolean;
};

export const AddressesList = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/account/addresses");
      if (response.ok) {
        const { data } = await response.json();
        setAddresses(data || []);
      }
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
      toast.error("Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) {
      return;
    }

    try {
      const response = await fetch(`/api/account/addresses/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Address deleted");
        await fetchAddresses();
      } else {
        toast.error("Failed to delete address");
      }
    } catch (error) {
      toast.error("Failed to delete address");
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingId) {
        // Update existing address
        const response = await fetch(`/api/account/addresses/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });

        if (response.ok) {
          toast.success("Address updated");
          setEditingId(null);
          await fetchAddresses();
        } else {
          toast.error("Failed to update address");
        }
      } else {
        // Create new address
        const response = await fetch("/api/account/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });

        if (response.ok) {
          toast.success("Address added");
          await fetchAddresses();
        } else {
          toast.error("Failed to add address");
        }
      }
    } catch (error) {
      toast.error("Failed to save address");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-[var(--radius-xl)] border border-[var(--border)] bg-gray-100"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {addresses.map((address) => (
        <div
          key={address._id}
          className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-6"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold">{address.label}</h3>
                {address.isDefault && (
                  <Badge tone="brand" className="text-xs">Default</Badge>
                )}
              </div>
              <p className="text-sm">{address.recipientName}</p>
              <p className="text-sm text-[var(--muted)]">
                {address.line1}
                {address.line2 && `, ${address.line2}`}
              </p>
              <p className="text-sm text-[var(--muted)]">
                {address.city}, {address.state} {address.postalCode}
              </p>
              <p className="text-sm text-[var(--muted)]">
                {address.country} • {address.phone}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all duration-300 active:scale-95"
                onClick={() => setEditingId(address._id)}
              >
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-red-50 hover:text-red-600 transition-all duration-300 active:scale-95"
                onClick={() => handleDelete(address._id)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      ))}

      {editingId && (
        <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-6">
          <h3 className="mb-4 font-semibold">Edit Address</h3>
          <AddressForm
            onSubmit={handleSubmit}
            initialData={addresses.find((a) => a._id === editingId)}
            onCancel={() => setEditingId(null)}
          />
        </div>
      )}

      {!editingId && (
        <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-6">
          <h3 className="mb-4 font-semibold">Add New Address</h3>
          <AddressForm onSubmit={handleSubmit} />
        </div>
      )}
    </div>
  );
};

