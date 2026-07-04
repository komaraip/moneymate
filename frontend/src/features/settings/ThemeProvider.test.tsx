import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider, useTheme } from "./ThemeProvider";

function ThemeProbe() {
  const { mode, resolvedTheme, setMode } = useTheme();

  return (
    <div>
      <p>Mode: {mode}</p>
      <p>Tema: {resolvedTheme}</p>
      <button onClick={() => setMode("light")} type="button">
        Terang
      </button>
      <button onClick={() => setMode("dark")} type="button">
        Gelap
      </button>
    </div>
  );
}

describe("ThemeProvider", () => {
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
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.removeAttribute("data-theme-mode");
  });

  it("menyimpan pilihan tema dan menerapkan data-theme", async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    expect(screen.getByText("Mode: system")).toBeInTheDocument();
    expect(document.documentElement.dataset.theme).toBe("dark");

    await user.click(screen.getByRole("button", { name: "Terang" }));

    expect(screen.getByText("Mode: light")).toBeInTheDocument();
    expect(screen.getByText("Tema: light")).toBeInTheDocument();
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(window.localStorage.getItem("moneymate_theme")).toBe("light");
  });
});
