"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { couponSchema } from "@/lib/validators";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { z } from "zod";

type CouponFormValues = z.infer<typeof couponSchema> & {
  autoApply?: boolean;
  isActive?: boolean;
};

type CouponFormProps = {
  coupon?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export const CouponForm = ({ coupon, onSuccess, onCancel }: CouponFormProps) => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const isEditMode = !!coupon;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema) as any,
    defaultValues: {
      code: "",
      type: "percentage",
      value: 10,
      minSpend: 0,
      maxDiscount: undefined,
      startsAt: "",
      endsAt: "",
      usageLimit: undefined,
      autoApply: false,
      isActive: true,
    },
  });

  const couponType = watch("type");

  useEffect(() => {
    if (coupon) {
      reset({
        code: coupon.code || "",
        type: coupon.type || "percentage",
        value: coupon.value || 10,
        minSpend: coupon.minSpend ? Number(coupon.minSpend) : undefined,
        maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : undefined,
        startsAt: coupon.startsAt
          ? new Date(coupon.startsAt).toISOString().split("T")[0]
          : "",
        endsAt: coupon.endsAt
          ? new Date(coupon.endsAt).toISOString().split("T")[0]
          : "",
        usageLimit: coupon.usageLimit ? Number(coupon.usageLimit) : undefined,
        autoApply: Boolean(coupon.autoApply || false),
        isActive: coupon.isActive !== undefined ? Boolean(coupon.isActive) : true,
      });
    } else {
      // Reset to defaults when creating new coupon
      reset({
        code: "",
        type: "percentage",
        value: 10,
        minSpend: undefined,
        maxDiscount: undefined,
        startsAt: "",
        endsAt: "",
        usageLimit: undefined,
        autoApply: false,
        isActive: true,
      });
    }
  }, [coupon, reset]);

  const submit = handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      // Clean up the form data - remove empty strings and convert to proper types
      const formData: any = {
        code: values.code.toUpperCase().trim(),
        type: values.type,
        value: values.value,
        isActive: values.isActive ?? true,
        autoApply: values.autoApply ?? false,
      };

      // Only include optional fields if they have valid values
      if (values.minSpend !== undefined && values.minSpend !== null && values.minSpend > 0) {
        formData.minSpend = values.minSpend;
      }
      
      // maxDiscount: only include if provided and valid (otherwise unlimited)
      if (values.maxDiscount !== undefined && values.maxDiscount !== null && !isNaN(values.maxDiscount) && values.maxDiscount > 0) {
        formData.maxDiscount = values.maxDiscount;
      }
      
      // usageLimit: only include if provided and valid (otherwise unlimited)
      if (values.usageLimit !== undefined && values.usageLimit !== null && !isNaN(values.usageLimit) && values.usageLimit > 0) {
        formData.usageLimit = values.usageLimit;
      }
      
      if (values.startsAt && values.startsAt.trim()) {
        formData.startsAt = new Date(values.startsAt).toISOString();
      }
      if (values.endsAt && values.endsAt.trim()) {
        formData.endsAt = new Date(values.endsAt).toISOString();
      }

      const id = coupon?._id || coupon?.id;
      const url = id ? `/api/coupons/${id}` : "/api/coupons";
      const method = id ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save coupon");
      }

      toast.success(isEditMode ? "Coupon updated successfully" : "Coupon created successfully");
      
      if (onSuccess) {
        onSuccess();
      } else {
        router.refresh();
      }
    } catch (error: any) {
      console.error("Failed to save coupon:", error);
      toast.error(error.message || "Failed to save coupon");
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Coupon Code *</label>
          <Input
            {...register("code")}
            placeholder="SAVE10"
            disabled={isEditMode}
          />
          {errors.code && (
            <p className="text-xs text-red-600 mt-1">{errors.code.message}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium">Discount Type *</label>
          <Select {...register("type")}>
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed Amount</option>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium">
            {couponType === "percentage" ? "Discount % *" : "Discount Amount (Rs) *"}
          </label>
          <Input
            type="number"
            {...register("value", { valueAsNumber: true })}
            min={0}
            step={couponType === "percentage" ? 1 : 0.01}
          />
          {errors.value && (
            <p className="text-xs text-red-600 mt-1">{errors.value.message}</p>
          )}
        </div>

        {couponType === "percentage" && (
          <div>
            <label className="text-sm font-medium">Max Discount (Rs)</label>
            <Input
              type="number"
              {...register("maxDiscount", { 
                setValueAs: (v) => {
                  // Handle empty, null, undefined, or invalid values
                  if (v === "" || v === null || v === undefined || v === "undefined") {
                    return undefined;
                  }
                  const num = Number(v);
                  if (isNaN(num) || num <= 0) {
                    return undefined;
                  }
                  return num;
                }
              })}
              min={0}
              placeholder="Unlimited (optional)"
            />
            <p className="text-xs text-[var(--muted)] mt-1">
              Optional: Leave empty for unlimited maximum discount
            </p>
          </div>
        )}

        <div>
          <label className="text-sm font-medium">Minimum Spend (Rs)</label>
          <Input
            type="number"
            {...register("minSpend", { 
              valueAsNumber: true,
              setValueAs: (v) => v === "" || v === null || v === undefined ? undefined : Number(v)
            })}
            min={0}
            placeholder="No minimum"
          />
          <p className="text-xs text-[var(--muted)] mt-1">
            Leave empty for no minimum spend requirement
          </p>
        </div>

        <div>
          <label className="text-sm font-medium">Usage Limit</label>
          <Input
            type="number"
            {...register("usageLimit", { 
              setValueAs: (v) => {
                // Handle empty, null, undefined, or invalid values
                if (v === "" || v === null || v === undefined || v === "undefined") {
                  return undefined;
                }
                const num = Number(v);
                if (isNaN(num) || num <= 0) {
                  return undefined;
                }
                return num;
              }
            })}
            min={1}
            placeholder="Unlimited (optional)"
          />
          <p className="text-xs text-[var(--muted)] mt-1">
            Optional: Leave empty for unlimited usage
          </p>
        </div>

        <div>
          <label className="text-sm font-medium">Start Date</label>
          <Input type="date" {...register("startsAt")} />
        </div>

        <div>
          <label className="text-sm font-medium">End Date</label>
          <Input type="date" {...register("endsAt")} />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <Checkbox
          type="checkbox"
          {...register("isActive")}
          checked={watch("isActive") ?? true}
          label="Active"
        />
        <Checkbox
          type="checkbox"
          {...register("autoApply")}
          checked={watch("autoApply") ?? false}
          label="Auto Apply"
        />
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : isEditMode ? "Update Coupon" : "Create Coupon"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};

