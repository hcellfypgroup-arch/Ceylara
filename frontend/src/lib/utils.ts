import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (value: number, currency = "LKR") => {
  // Format number with commas and 2 decimal places
  const formatted = new Intl.NumberFormat("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  
  // Return with Rs prefix
  return `Rs ${formatted}`;
};

export const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US").format(value);

export const formatDate = (date: string | Date): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  // Use a consistent format that works the same on server and client
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${day}/${month}/${year}`;
};

export const slugify = (input: string) =>
  input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

