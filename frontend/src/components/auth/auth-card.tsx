"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, registerSchema } from "@/lib/validators";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";

type Mode = "login" | "register";

export const AuthCard = ({ mode = "login" }: { mode?: Mode }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentMode, setCurrentMode] = useState<Mode>(mode);
  const [error, setError] = useState<string | null>(null);
  const schema = currentMode === "login" ? loginSchema : registerSchema;
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<any>({
    resolver: zodResolver(schema) as any,
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      const endpoint = currentMode === "login" ? "/api/auth/login" : "/api/auth/register";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "An error occurred");
        return;
      }

      // Redirect to the specified path or default
      const redirect = searchParams.get("redirect") || "/";
      router.push(redirect);
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    }
  });

  return (
    <div className="w-full max-w-md space-y-8 rounded-[var(--radius-xxl)] border border-[var(--border)] bg-white p-8 shadow-[var(--shadow-card)]">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
          {currentMode === "login" ? "Welcome back" : "Join CEYLARA"}
        </p>
        <h1 className="text-3xl font-semibold">
          {currentMode === "login"
            ? "Login to your account"
            : "Create an account"}
        </h1>
      </div>
      <form className="space-y-4" onSubmit={onSubmit}>
        {currentMode === "register" && (
          <div>
            <label className="text-sm font-medium">Name</label>
            <Input type="text" {...register("name")} />
            {errors.name && (
              <p className="text-xs text-red-500">
                {errors.name.message as string}
              </p>
            )}
          </div>
        )}
        <div>
          <label className="text-sm font-medium">Email</label>
          <Input type="email" {...register("email")} />
          {errors.email && (
            <p className="text-xs text-red-500">
              {errors.email.message as string}
            </p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium">Password</label>
          <PasswordInput {...register("password")} />
          {errors.password && (
            <p className="text-xs text-red-500">
              {errors.password.message as string}
            </p>
          )}
        </div>
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}
        <Button 
          type="submit" 
          className="w-full hover:shadow-lg hover:shadow-[var(--primary)]/40 transition-all duration-300 active:scale-95 disabled:hover:scale-100 disabled:hover:shadow-none" 
          disabled={isSubmitting}
        >
          {isSubmitting
            ? currentMode === "login"
              ? "Logging in..."
              : "Registering..."
            : currentMode === "login"
              ? "Login"
              : "Register"}
        </Button>
        <p className="text-center text-sm text-[var(--muted)]">
          {currentMode === "login" ? (
            <>
              New to Selara?{" "}
              <button
                type="button"
                className="underline"
                onClick={() => setCurrentMode("register")}
              >
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                className="underline"
                onClick={() => setCurrentMode("login")}
              >
                Login
              </button>
            </>
          )}
        </p>
      </form>
    </div>
  );
};

