"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/store/cart-store";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";

type Variant = {
  sku: string;
  size?: string;
  color?: string;
  price: number;
  stock: number;
};

type CustomField = {
  label: string;
  type: "text" | "number" | "textarea" | "dropdown";
  required: boolean;
  options?: string[];
};

type CustomOrderModalProps = {
  open: boolean;
  onClose: () => void;
  product: {
    id: string;
    title: string;
    price: number;
    salePrice?: number;
    thumbnail?: string;
    weight?: number;
    sizes?: string[];
    isCustomOrderEnabled?: boolean;
    customOrderSurcharge?: number;
    customFields?: CustomField[];
  };
  variants?: Variant[];
};

export const CustomOrderModal = ({
  open,
  onClose,
  product,
  variants = [],
}: CustomOrderModalProps) => {
  const addItem = useCartStore((state) => state.addItem);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const customFields = product.customFields || [];
  const customOrderSurcharge = product.customOrderSurcharge || 0;

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      // Set default color
      const firstVariantWithColor = variants.find((v) => Boolean(v.color));
      if (firstVariantWithColor?.color) {
        setSelectedColor(firstVariantWithColor.color);
      }
      // Reset custom field values
      setCustomFieldValues({});
    } else {
      // Reset on close
      setSelectedColor("");
      setCustomFieldValues({});
    }
  }, [open, variants]);

  // Get color options from variants
  const colorOptions =
    variants
      ?.map((variant) => variant.color)
      .filter((color): color is string => Boolean(color))
      .filter((color, index, array) => array.indexOf(color) === index) ?? [];

  // Find selected variant
  const selectedVariant =
    variants.find((variant) => {
      const matchesColor = colorOptions.length ? variant.color === selectedColor : true;
      return matchesColor;
    }) ||
    variants.find((variant) => (colorOptions.length ? variant.color === selectedColor : false)) ||
    variants[0];

  const displayPrice = selectedVariant?.price || product.salePrice || product.price;
  const totalPrice = displayPrice + customOrderSurcharge;
  const inStock = selectedVariant ? selectedVariant.stock > 0 : true;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate variant selection
    if (!selectedVariant) {
      toast.error("Please select a color");
      return;
    }

    if (!inStock) {
      toast.error("Selected variant is out of stock");
      return;
    }

    // Validate required custom fields
    for (const field of customFields) {
      if (field.required && !customFieldValues[field.label]?.trim()) {
        toast.error(`Please fill in "${field.label}"`);
        return;
      }
    }

    setSubmitting(true);

    try {
      // Build custom fields array
      const customFieldsData = customFields.map((field) => ({
        label: field.label,
        value: customFieldValues[field.label] || "",
      }));

        // Add to cart
      addItem({
        productId: product.id,
        variantSku: selectedVariant.sku,
        title: product.title,
        price: totalPrice, // Include surcharge in price
        quantity: 1,
        color: selectedVariant.color,
        thumbnail: product.thumbnail,
        weight: product.weight || 0,
        customFields: customFieldsData,
      });

      toast.success("Custom order added to cart!");
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to add custom order to cart");
    } finally {
      setSubmitting(false);
    }
  };

  const updateCustomField = (label: string, value: string) => {
    setCustomFieldValues((prev) => ({
      ...prev,
      [label]: value,
    }));
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Place Custom Order"
      description={`Customize your ${product.title} with your specific requirements`}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Variant Selection */}
        <div className="space-y-4">
          {colorOptions.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">Color *</label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => {
                  const isSelected = color === selectedColor;

                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                        isSelected
                          ? "border-[var(--foreground)] bg-[var(--foreground)] text-white"
                          : "border-[var(--border)] text-[var(--foreground)] hover:border-[var(--foreground)]"
                      }`}
                    >
                      <span
                        className="h-4 w-4 rounded-full border border-white shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)]"
                        style={{ backgroundColor: color }}
                      />
                      <span>{color}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Custom Fields */}
        {customFields.length > 0 && (
          <div className="space-y-4 border-t border-[var(--border)] pt-4">
            <h3 className="text-sm font-semibold">Custom Requirements</h3>
            {customFields.map((field, index) => (
              <div key={index}>
                <label className="text-sm font-medium mb-2 block">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {field.type === "text" && (
                  <Input
                    value={customFieldValues[field.label] || ""}
                    onChange={(e) => updateCustomField(field.label, e.target.value)}
                    required={field.required}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                  />
                )}
                {field.type === "number" && (
                  <Input
                    type="number"
                    value={customFieldValues[field.label] || ""}
                    onChange={(e) => updateCustomField(field.label, e.target.value)}
                    required={field.required}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                  />
                )}
                {field.type === "textarea" && (
                  <Textarea
                    value={customFieldValues[field.label] || ""}
                    onChange={(e) => updateCustomField(field.label, e.target.value)}
                    required={field.required}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    rows={4}
                  />
                )}
                {field.type === "dropdown" && (
                  <Select
                    value={customFieldValues[field.label] || ""}
                    onChange={(e) => updateCustomField(field.label, e.target.value)}
                    required={field.required}
                  >
                    <option value="">Select {field.label.toLowerCase()}</option>
                    {field.options?.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Price Breakdown */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--accent)]/10 p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--muted)]">Base Price:</span>
            <span>{formatCurrency(displayPrice)}</span>
          </div>
          {customOrderSurcharge > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-[var(--muted)]">Custom Order Surcharge:</span>
              <span>{formatCurrency(customOrderSurcharge)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-semibold pt-2 border-t border-[var(--border)]">
            <span>Total:</span>
            <span>{formatCurrency(totalPrice)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-[var(--border)]">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" loading={submitting} disabled={!inStock || !selectedVariant} className="flex-1">
            Add to Cart
          </Button>
        </div>
      </form>
    </Modal>
  );
};

