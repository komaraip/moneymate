import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../lib/api";
import { renderWithProviders } from "../../test/render";
import { LoginPage } from "./LoginPage";
import { useAuth } from "./useAuth";

vi.mock("./useAuth", () => ({
  useAuth: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);

describe("LoginPage", () => {
  beforeEach(() => {
    mockedUseAuth.mockReturnValue({
      accessToken: null,
      isBootstrapping: false,
      login: vi.fn(),
      logout: vi.fn(),
      user: null,
    });
  });

  it("menampilkan error login dari API", async () => {
    const user = userEvent.setup();
    const login = vi.fn().mockRejectedValue(new ApiError("Email atau password salah", "UNAUTHORIZED", "req_test"));
    mockedUseAuth.mockReturnValue({
      accessToken: null,
      isBootstrapping: false,
      login,
      logout: vi.fn(),
      user: null,
    });

    renderWithProviders(<LoginPage />, { route: "/login" });

    await user.clear(screen.getByLabelText("Email"));
    await user.type(screen.getByLabelText("Email"), "admin@moneymate.local");
    await user.clear(screen.getByLabelText("Password"));
    await user.type(screen.getByLabelText("Password"), "password-salah");
    await user.click(screen.getByRole("button", { name: "Masuk" }));

    expect(await screen.findByText("Email atau password salah")).toBeInTheDocument();
    expect(login).toHaveBeenCalledWith({
      email: "admin@moneymate.local",
      password: "password-salah",
    });
  });
});
