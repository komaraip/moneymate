"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/shared/button";
import { Card, CardContent, CardHeader } from "@/components/shared/card";
import { Input } from "@/components/shared/input";

type AuthFormProps = {
  mode: "login" | "register";
};

type AuthErrorState = {
  message: string;
  code?: string;
} | null;

const copy = {
  login: {
    title: "Welcome back",
    description: "Sign in to continue reviewing uploads and tracking portfolio activity.",
    action: "Sign in",
    endpoint: "/api/auth/login",
    alternateHref: "/register",
    alternateText: "Need an account?",
    alternateAction: "Create one"
  },
  register: {
    title: "Create your workspace",
    description: "Set up MoneyMate with secure credentials and start ingesting statements.",
    action: "Create account",
    endpoint: "/api/auth/register",
    alternateHref: "/login",
    alternateText: "Already have an account?",
    alternateAction: "Sign in"
  }
} as const;

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<AuthErrorState>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsPending(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch(copy[mode].endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: formData.get("email"),
        password: formData.get("password"),
        displayName: formData.get("displayName")
      })
    });

    const payload = (await response.json().catch(() => null)) as { error?: string; code?: string } | null;

    if (!response.ok) {
      setError({
        message: payload?.error ?? "Unable to continue. Please try again.",
        code: payload?.code
      });
      setIsPending(false);
      return;
    }

    const nextPath = searchParams.get("next") ?? "/app/dashboard";
    router.push(nextPath);
    router.refresh();
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex-col items-start gap-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[hsl(var(--accent))]">
            MoneyMate
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">{copy[mode].title}</h1>
        </div>
        <p className="text-sm leading-6 text-muted-foreground">{copy[mode].description}</p>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          {mode === "register" ? (
            <label className="grid gap-2 text-sm font-medium text-foreground">
              Display name
              <Input name="displayName" placeholder="Komara" autoComplete="name" />
            </label>
          ) : null}
          <label className="grid gap-2 text-sm font-medium text-foreground">
            Email
            <Input
              required
              type="email"
              name="email"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-foreground">
            Password
            <Input
              required
              minLength={8}
              type="password"
              name="password"
              placeholder="At least 8 characters"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </label>
          {error ? (
            <div className="rounded-2xl bg-[hsl(var(--danger)/0.08)] px-4 py-3 text-sm text-[hsl(var(--danger))]">
              <p>{error.message}</p>
              {error.code === "database_unavailable" ? (
                <div className="mt-3 space-y-1 text-xs leading-5 text-[hsl(var(--danger))]">
                  <p>Local setup steps:</p>
                  <p>
                    1. Run <code className="font-mono">npm run db:local:start</code>.
                  </p>
                  <p>
                    2. Run <code className="font-mono">npm run prisma:push</code>.
                  </p>
                  <p>
                    3. Restart <code className="font-mono">npm run dev</code>.
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}
          <Button type="submit" className="mt-2" disabled={isPending}>
            {isPending ? "Working..." : copy[mode].action}
          </Button>
          <p className="text-sm text-muted-foreground">
            {copy[mode].alternateText}{" "}
            <Link href={copy[mode].alternateHref} className="font-semibold text-[hsl(var(--accent))]">
              {copy[mode].alternateAction}
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
