"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useWishlistStore } from "@/store/wishlist-store";

type User = {
  id: string;
  email: string;
  name?: string;
  role: string;
} | null;

type AuthContextType = {
  user: User;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  refreshUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const syncWishlist = useWishlistStore((state) => state.syncFromServer);

  const fetchUser = async () => {
    try {
      const response = await fetch("/api/account/profile");
      if (response.ok) {
        const { data } = await response.json();
        setUser({
          id: data._id?.toString() || data.id,
          email: data.email,
          name: data.name,
          role: data.role || "customer",
        });
        // Sync wishlist from server when user logs in
        await syncWishlist();
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [pathname]);

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshUser: fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

