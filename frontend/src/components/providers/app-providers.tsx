 "use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/auth-context";

type ProvidersProps = {
  children: ReactNode;
};

export const AppProviders = ({ children }: ProvidersProps) => {
  const [client] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={client}>
      <AuthProvider>
        {children}
        <Toaster
          toastOptions={{
            style: {
              borderRadius: "999px",
              fontSize: "0.875rem",
            },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
};

