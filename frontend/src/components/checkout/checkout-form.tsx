"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useCartStore, useCartTotals } from "@/store/cart-store";
import { useAuth } from "@/contexts/auth-context";
import { CouponSection } from "@/components/cart/coupon-section";
import toast from "react-hot-toast";
import { useShippingConfig } from "@/hooks/use-shipping-config";

export const CheckoutForm = () => {
  const router = useRouter();
  const { user } = useAuth();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clear);
  const couponCode = useCartStore((state) => state.couponCode);
  const { data: shippingConfig, loading: shippingLoading, error: shippingError } = useShippingConfig();
  const totals = useCartTotals(
    shippingConfig
      ? {
          rates: shippingConfig.rates,
          freeShippingThreshold: shippingConfig.freeShippingThreshold,
        }
      : undefined
  );
  const [submitting, setSubmitting] = useState(false);
  const [loadingUserData, setLoadingUserData] = useState(true);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Sri Lanka",
    deliveryMethod: "standard",
    paymentMethod: "cod",
  });

  // Fetch and pre-fill user data when logged in
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) {
        setLoadingUserData(false);
        return;
      }

      try {
        // Fetch profile data
        const profileResponse = await fetch("/api/account/profile");
        if (profileResponse.ok) {
          const { data: profileData } = await profileResponse.json();
          
          // Fetch addresses
          const addressesResponse = await fetch("/api/account/addresses");
          let addressData = null;
          
          if (addressesResponse.ok) {
            const { data: addresses } = await addressesResponse.json();
            setSavedAddresses(addresses || []);
            // Find default address or use the first one
            addressData = addresses.find((addr: any) => addr.isDefault) || addresses[0];
            if (addressData) {
              setSelectedAddressId(addressData._id?.toString() || null);
            }
          }

          // Pre-fill form with user data
          setFormData((prev) => ({
            ...prev,
            fullName: profileData.name || prev.fullName,
            email: profileData.email || prev.email,
            phone: profileData.phone || prev.phone,
            // Pre-fill address if available
            ...(addressData && {
              addressLine1: addressData.line1 || prev.addressLine1,
              city: addressData.city || prev.city,
              state: "", // Not required for Sri Lanka
              postalCode: addressData.postalCode || prev.postalCode,
              country: "Sri Lanka", // Always Sri Lanka
              // Use address phone if available, otherwise keep profile phone
              phone: addressData.phone || profileData.phone || prev.phone,
              // Use recipient name from address if available
              fullName: addressData.recipientName || profileData.name || prev.fullName,
            }),
          }));
        }
      } catch (error) {
        console.error("Failed to load user data:", error);
        // Silently fail - allow manual entry
      } finally {
        setLoadingUserData(false);
      }
    };

    loadUserData();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setSubmitting(true);

    try {
      // Prepare order payload
      const orderPayload = {
        items: items.map((item) => ({
          productId: item.productId,
          variantSku: item.variantSku,
          price: item.price,
          quantity: item.quantity,
          customFields: item.customFields,
        })),
        email: formData.email,
        address: {
          recipientName: formData.fullName,
          line1: formData.addressLine1,
          city: formData.city,
          state: "", // Not required for Sri Lanka
          postalCode: formData.postalCode,
          country: formData.country,
          phone: formData.phone || undefined,
        },
        payment: {
          method: formData.paymentMethod === "payhere" ? "card" : (formData.paymentMethod as "cod" | "card" | "bank_transfer"),
          status: formData.paymentMethod === "cod" ? "pending" : "pending",
        },
        deliveryMethod: formData.deliveryMethod,
        couponCode: couponCode || undefined,
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create order");
      }

      const { data } = await response.json();
      const orderId = data._id?.toString() || data.id;

      // Handle PayHere payment
      if (formData.paymentMethod === "payhere") {
        // Prepare items for PayHere
        const payhereItems = items.map((item) => ({
          name: item.title || "Product",
          amount: item.price,
          quantity: item.quantity,
        }));

        // Create PayHere checkout session
        const payhereResponse = await fetch("/api/payments/payhere-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            items: payhereItems,
            customerEmail: formData.email,
            customerName: formData.fullName,
            customerPhone: formData.phone,
            customerAddress: formData.addressLine1,
            customerCity: formData.city,
            customerCountry: "Sri Lanka",
          }),
        });

        if (!payhereResponse.ok) {
          const error = await payhereResponse.json();
          throw new Error(error.error || "Failed to create PayHere payment session");
        }

        const { data: payhereData } = await payhereResponse.json();
        
        // Clear cart before redirecting
        clearCart();

        // Create and submit PayHere payment form
        const form = document.createElement("form");
        form.method = "POST";
        form.action = payhereData.paymentUrl;

        Object.entries(payhereData.paymentData).forEach(([key, value]) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = value as string;
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
        return;
      }

      // For COD and bank transfer, proceed normally
      // Clear cart
      clearCart();

      // Redirect to order confirmation
      router.push(`/order-confirmation/${orderId}`);
    } catch (error: any) {
      console.error("Order creation error:", error);
      toast.error(error.message || "Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const expressSurcharge = shippingConfig?.expressShippingSurcharge ?? 700;
  const standardShippingFee = totals.deliveryFee;
  
  const deliveryOptions = [
    { value: "standard", label: "Standard (3-5 days)", fee: standardShippingFee, loading: shippingLoading },
    { value: "express", label: "Express (1-2 days)", fee: standardShippingFee + expressSurcharge, loading: shippingLoading },
    { value: "click-collect", label: "Click & collect", fee: 0, loading: false },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {loadingUserData && user && (
        <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--accent)] p-3 text-sm text-[var(--muted)]">
          Loading your information...
        </div>
      )}
      
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Coupon Code</h2>
        <CouponSection />
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">
          {user ? "Your Information" : "Guest checkout"}
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            placeholder="Full name"
            required
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          />
          <Input
            placeholder="Email address"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <Input
            placeholder="Phone number"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Address</h2>
          {user && savedAddresses.length > 0 && (
            <Select
              value={selectedAddressId || ""}
              onChange={(e) => {
                const addressId = e.target.value;
                if (!addressId) {
                  // If "Select saved address" is chosen, don't clear the form
                  return;
                }
                setSelectedAddressId(addressId);
                const selectedAddress = savedAddresses.find(
                  (addr) => (addr._id?.toString() || addr.id) === addressId
                );
                if (selectedAddress) {
                  setFormData((prev) => ({
                    ...prev,
                    addressLine1: selectedAddress.line1 || "",
                    city: selectedAddress.city || "",
                    state: "", // Not required for Sri Lanka
                    postalCode: selectedAddress.postalCode || "",
                    country: "Sri Lanka", // Always Sri Lanka
                    phone: selectedAddress.phone || prev.phone,
                    fullName: selectedAddress.recipientName || prev.fullName,
                  }));
                }
              }}
              className="w-auto text-sm"
            >
              <option value="">Use different address</option>
              {savedAddresses.map((addr) => (
                <option
                  key={addr._id?.toString() || addr.id}
                  value={addr._id?.toString() || addr.id}
                >
                  {addr.label || "Address"} {addr.isDefault ? "(Default)" : ""}
                </option>
              ))}
            </Select>
          )}
        </div>
        <div className="grid gap-4">
          <Input
            placeholder="Address"
            required
            value={formData.addressLine1}
            onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              placeholder="City"
              required
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
            <Input
              placeholder="Postal code"
              required
              value={formData.postalCode}
              onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Delivery method</h2>
        <div className="grid gap-3">
          {deliveryOptions.map((option) => (
            <label
              key={option.value}
              className={`flex cursor-pointer items-center justify-between rounded-[var(--radius-md)] border px-4 py-3 text-sm transition ${
                formData.deliveryMethod === option.value
                  ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "border-[var(--border)] text-[var(--foreground)]"
              }`}
            >
              <span>{option.label}</span>
              <span>
                {option.loading
                  ? "Calculating..."
                  : option.fee === 0
                    ? "Free"
                    : `Rs ${option.fee}`}
              </span>
              <input
                type="radio"
                name="delivery"
                value={option.value}
                checked={formData.deliveryMethod === option.value}
                onChange={(e) => setFormData({ ...formData, deliveryMethod: e.target.value })}
                className="hidden"
              />
            </label>
          ))}
        </div>
        {shippingLoading && (
          <p className="text-xs text-[var(--muted)]">
            Fetching live shipping rates...
          </p>
        )}
        {shippingError && (
          <p className="text-xs text-red-500">
            Using fallback shipping rates due to a configuration error.
          </p>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Payment method</h2>
        <div className="grid gap-3">
          <label
            className={`flex cursor-pointer items-center justify-between rounded-[var(--radius-md)] border px-4 py-3 text-sm transition ${
              formData.paymentMethod === "cod"
                ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                : "border-[var(--border)] text-[var(--foreground)]"
            }`}
          >
            <span>Cash on Delivery (COD)</span>
            <input
              type="radio"
              name="payment"
              value="cod"
              checked={formData.paymentMethod === "cod"}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              className="hidden"
            />
          </label>
          <label
            className={`flex cursor-pointer items-center justify-between rounded-[var(--radius-md)] border px-4 py-3 text-sm transition ${
              formData.paymentMethod === "payhere"
                ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                : "border-[var(--border)] text-[var(--foreground)]"
            }`}
          >
            <span>PayHere (Card/Digital Wallet)</span>
            <input
              type="radio"
              name="payment"
              value="payhere"
              checked={formData.paymentMethod === "payhere"}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              className="hidden"
            />
          </label>
          <label
            className={`flex cursor-pointer items-center justify-between rounded-[var(--radius-md)] border px-4 py-3 text-sm transition ${
              formData.paymentMethod === "bank_transfer"
                ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                : "border-[var(--border)] text-[var(--foreground)]"
            }`}
          >
            <span>Bank Transfer</span>
            <input
              type="radio"
              name="payment"
              value="bank_transfer"
              checked={formData.paymentMethod === "bank_transfer"}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <Button 
        type="submit" 
        size="pill" 
        disabled={submitting} 
        className="w-full hover:shadow-lg hover:shadow-[var(--primary)]/40 transition-all duration-300 active:scale-95 disabled:hover:scale-100 disabled:hover:shadow-none"
      >
        {submitting ? "Placing Order..." : "Place Order"}
      </Button>
    </form>
  );
};

