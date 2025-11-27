import { AccountShell } from "@/components/account/account-shell";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <AccountShell>{children}</AccountShell>
    </ProtectedRoute>
  );
}

