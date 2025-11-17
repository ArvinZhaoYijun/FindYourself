import { EmailVerifiedGuard } from "@/features/auth/components/email-verified-guard";
import { NavBar } from "@/features/navigation/components/navbar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <EmailVerifiedGuard requireEmailVerification={true}>
      <main className="min-h-screen">
        <NavBar />
        {children}
      </main>
    </EmailVerifiedGuard>
  );
}
