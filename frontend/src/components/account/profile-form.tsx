"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import toast from "react-hot-toast";

type ProfileData = {
  name: string;
  email: string;
  phone?: string;
  birthday?: string;
};

export const ProfileForm = () => {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileData>();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/account/profile");
        if (response.ok) {
          const { data } = await response.json();
          reset({
            name: data.name || "",
            email: data.email || "",
            phone: data.phone || "",
            birthday: data.birthday || "",
          });
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [reset]);

  const onSubmit = handleSubmit(async (data) => {
    setSubmitting(true);
    try {
      const response = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update profile");
      }

      toast.success("Profile updated successfully");
      await refreshUser();
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSubmitting(false);
    }
  });

  if (loading) {
    return (
      <div className="space-y-6 rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-6">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-10 animate-pulse rounded bg-gray-200" />
          <div className="h-10 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
          Profile
        </p>
        <h1 className="text-3xl font-semibold">Personal details</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Full name</label>
          <Input {...register("name", { required: "Name is required" })} />
          {errors.name && (
            <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium">Email</label>
          <Input
            type="email"
            {...register("email", { required: "Email is required" })}
            disabled
            className="bg-gray-50"
          />
          <p className="mt-1 text-xs text-[var(--muted)]">
            Email cannot be changed
          </p>
        </div>
        <div>
          <label className="text-sm font-medium">Phone number</label>
          <Input type="tel" {...register("phone")} />
        </div>
        <div>
          <label className="text-sm font-medium">Birthday (optional)</label>
          <Input type="date" {...register("birthday")} />
        </div>
      </div>
      <Button 
        type="submit" 
        size="pill" 
        className="w-max hover:shadow-lg hover:shadow-[var(--primary)]/40 transition-all duration-300 active:scale-95 disabled:hover:scale-100 disabled:hover:shadow-none" 
        disabled={submitting}
      >
        {submitting ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
};

