"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addressSchema } from "@/lib/validators";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

type AddressFormValues = {
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

export const AddressForm = ({
  onSubmit,
  initialData,
  onCancel,
}: {
  onSubmit?: (values: AddressFormValues) => Promise<void> | void;
  initialData?: AddressFormValues;
  onCancel?: () => void;
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: initialData || {
      label: "Home",
      country: "India",
    },
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit ?? (() => Promise.resolve()))}
      className="space-y-4 rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-6"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Label</label>
          <Input {...register("label")} />
          {errors.label && (
            <p className="text-xs text-red-500">{errors.label.message}</p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium">Recipient name</label>
          <Input {...register("recipientName")} />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Address line 1</label>
        <Input {...register("line1")} />
      </div>
      <div>
        <label className="text-sm font-medium">Address line 2</label>
        <Input {...register("line2")} />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="text-sm font-medium">City</label>
          <Input {...register("city")} />
        </div>
        <div>
          <label className="text-sm font-medium">State</label>
          <Input {...register("state")} />
        </div>
        <div>
          <label className="text-sm font-medium">Postal code</label>
          <Input {...register("postalCode")} />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Country</label>
          <Input {...register("country")} />
        </div>
        <div>
          <label className="text-sm font-medium">Phone</label>
          <Input {...register("phone")} />
        </div>
      </div>
      <div>
        <Checkbox
          type="checkbox"
          {...register("isDefault")}
          id="isDefault"
          label="Set as default address"
        />
      </div>
      <div className="flex gap-2">
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="hover:shadow-lg hover:shadow-[var(--primary)]/40 transition-all duration-300 active:scale-95 disabled:hover:scale-100 disabled:hover:shadow-none"
        >
          {isSubmitting ? "Saving..." : "Save address"}
        </Button>
        {onCancel && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="hover:border-[var(--foreground)] transition-all duration-300 active:scale-95"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};

