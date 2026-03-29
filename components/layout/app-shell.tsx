"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Badge } from "@/components/shared/badge";
import { Button } from "@/components/shared/button";
import { Card } from "@/components/shared/card";
import { AppUser } from "@/lib/auth/session";
import { cn } from "@/lib/utils/cn";

const navigation = [
  { href: "/app/dashboard", label: "Dashboard" },
  { href: "/app/documents", label: "Documents" },
  { href: "/app/review", label: "Review Queue" },
  { href: "/app/investments", label: "Investments" },
  { href: "/app/investments/activity", label: "Activity" },
  { href: "/app/settings", label: "Settings" }
];

type AppShellProps = {
  children: ReactNode;
  user: AppUser;
};

export function AppShell({ children, user }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST"
    });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto grid min-h-screen max-w-[1600px] gap-6 px-4 py-4 md:px-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-8">
        <Card className="sticky top-4 flex h-[calc(100vh-2rem)] flex-col justify-between overflow-hidden border-white/80 bg-[#143429] text-white">
          <div className="space-y-8 p-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white/10 px-3 py-2 text-sm font-semibold tracking-[0.2em] text-white/80">
                  MM
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/50">MoneyMate</p>
                  <p className="text-lg font-semibold">Phase 2 Workspace</p>
                </div>
              </div>
              <p className="text-sm leading-6 text-white/68">
                Upload statements, inspect parser output, and approve only what you trust.
              </p>
            </div>
            <nav className="grid gap-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-2xl px-4 py-3 text-sm font-medium transition",
                      isActive ? "bg-white/12 text-white" : "text-white/70 hover:bg-white/6 hover:text-white"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="space-y-4 border-t border-white/10 p-6">
            <div>
              <p className="text-sm font-medium">{user.displayName ?? user.email}</p>
              <p className="text-xs text-white/60">{user.email}</p>
            </div>
            <div className="flex items-center justify-between gap-3">
              <Badge tone="accent" className="bg-white/12 text-white">
                Credentials Auth
              </Badge>
              <Button variant="ghost" className="text-white hover:bg-white/8" onClick={() => void handleLogout()}>
                Logout
              </Button>
            </div>
          </div>
        </Card>
        <div className="min-w-0 py-6">{children}</div>
      </div>
    </div>
  );
}
