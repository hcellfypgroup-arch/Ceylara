import { AuthCard } from "@/components/auth/auth-card";

export const dynamic = 'force-dynamic';

export default function RegisterPage() {
  return (
    <section className="section">
      <div className="container flex justify-center">
        <AuthCard mode="register" />
      </div>
    </section>
  );
}

