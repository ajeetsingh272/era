import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/server/services/auth";
import { usersRepo } from "@/server/repositories/users";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (await getCurrentAdmin()) redirect("/admin");
  const noUsers = usersRepo.count() === 0;

  return (
    <div className="a-login">
      <div className="a-card">
        <h1>ERA Admin</h1>
        <p className="muted">Sign in to manage products, SEO and enquiries.</p>
        {noUsers ? (
          <p className="a-alert info">
            No admin account exists yet. Set <code>ADMIN_EMAIL</code> and <code>ADMIN_PASSWORD</code> in <code>.env.local</code> and
            restart, or run <code>npm run admin:create -- email password</code>.
          </p>
        ) : (
          <LoginForm />
        )}
      </div>
    </div>
  );
}
