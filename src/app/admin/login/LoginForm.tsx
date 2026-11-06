"use client";

import { useActionState } from "react";
import { login } from "@/server/actions/auth";
import { keepValuesOnSubmit } from "@/lib/keep-values";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  const err = state?.errors ?? {};
  return (
    <form action={action} onSubmit={keepValuesOnSubmit(action)} className="a-form" style={{ marginTop: 18 }}>
      <div className="a-field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="username" required aria-invalid={!!err.email} />
        {err.email && <p className="err">{err.email}</p>}
      </div>
      <div className="a-field">
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required aria-invalid={!!err.password} />
        {err.password && <p className="err">{err.password}</p>}
      </div>
      {state?.message && <p className="a-alert err" role="alert">{state.message}</p>}
      <button className="a-btn" type="submit" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}
