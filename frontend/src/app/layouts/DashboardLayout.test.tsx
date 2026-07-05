import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthUser } from "../../features/auth/AuthProvider";
import { AuthContext } from "../../features/auth/AuthProvider";
import { ProtectedRoute } from "../../features/auth/ProtectedRoute";
import { ThemeProvider } from "../../features/settings/ThemeProvider";
import { DashboardLayout } from "./DashboardLayout";

function renderWithAuth(children: ReactNode, user: AuthUser | null = adminUser) {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: false },
    },
  });

  return render(
    <MemoryRouter initialEntries={["/"]}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthContext.Provider
            value={{
              accessToken: user ? "token-test" : null,
              isBootstrapping: false,
              login: vi.fn(),
              logout: vi.fn(),
              user,
            }}
          >
            {children}
          </AuthContext.Provider>
        </ThemeProvider>
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe("DashboardLayout", () => {
  beforeEach(() => {
    window.localStorage.clear();
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        addEventListener: vi.fn(),
        matches: query.includes("dark"),
        media: query,
        removeEventListener: vi.fn(),
      })),
    });
  });

  it("menampilkan navigasi berkelompok dan link admin untuk admin", () => {
    renderWithAuth(
      <Routes>
        <Route element={<DashboardLayout />} path="/" />
      </Routes>,
    );

    expect(screen.getByText("Money Management")).toBeInTheDocument();
    expect(screen.getByText("Reports")).toBeInTheDocument();
    expect(screen.getByText("Assets & Net Worth")).toBeInTheDocument();
    expect(screen.getAllByText("Admin").length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: "Anggaran" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Tujuan Tabungan" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Pengguna" })).toBeInTheDocument();
  });

  it("menyembunyikan navigasi admin untuk user biasa", () => {
    renderWithAuth(
      <Routes>
        <Route element={<DashboardLayout />} path="/" />
      </Routes>,
      regularUser,
    );

    expect(screen.queryByRole("link", { name: "Admin Dashboard" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Pengguna" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Transaksi" })).toBeInTheDocument();
  });

  it("membuka navigasi mobile tanpa dropdown bertingkat", async () => {
    const user = userEvent.setup();
    renderWithAuth(
      <Routes>
        <Route element={<DashboardLayout />} path="/" />
      </Routes>,
    );

    await user.click(screen.getByRole("button", { name: "Buka navigasi" }));

    expect(screen.getByLabelText("Navigasi utama")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Transaksi" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: "Tutup navigasi" }).length).toBeGreaterThan(0);
  });
});

describe("ProtectedRoute", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("mengalihkan user tanpa token ke halaman login", () => {
    renderWithAuth(
      <Routes>
        <Route
          element={
            <ProtectedRoute>
              <p>Area terlindungi</p>
            </ProtectedRoute>
          }
          path="/"
        />
        <Route element={<p>Halaman login</p>} path="/login" />
      </Routes>,
      null,
    );

    expect(screen.getByText("Halaman login")).toBeInTheDocument();
    expect(screen.queryByText("Area terlindungi")).not.toBeInTheDocument();
  });
});

const adminUser: AuthUser = {
  email: "admin@moneymate.local",
  full_name: "MoneyMate Admin",
  id: "admin-1",
  is_active: true,
  role: "admin",
};

const regularUser: AuthUser = {
  email: "user@moneymate.local",
  full_name: "MoneyMate User",
  id: "user-1",
  is_active: true,
  role: "user",
};
