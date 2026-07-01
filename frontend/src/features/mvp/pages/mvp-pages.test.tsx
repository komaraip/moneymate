import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "../../../test/render";
import { mvpApi } from "../api";
import { CashPage } from "./CashPage";
import { ImportPage } from "./ImportPage";
import { InstrumentsPage } from "./InstrumentsPage";
import { OverviewPage } from "./OverviewPage";
import { TransactionsPage } from "./TransactionsPage";

vi.mock("../api", () => ({
  mvpApi: {
    alerts: vi.fn(),
    allocation: vi.fn(),
    assetCategories: vi.fn(),
    auditLogs: vi.fn(),
    cashAccounts: vi.fn(),
    confirmImport: vi.fn(),
    createCashAccount: vi.fn(),
    createInstrument: vi.fn(),
    createManualPrice: vi.fn(),
    createTransaction: vi.fn(),
    deleteCashAccount: vi.fn(),
    deleteInstrument: vi.fn(),
    deleteTransaction: vi.fn(),
    holdings: vi.fn(),
    instruments: vi.fn(),
    overview: vi.fn(),
    recalculateHoldings: vi.fn(),
    transactions: vi.fn(),
    updateCashAccount: vi.fn(),
    updateInstrument: vi.fn(),
    updateTransaction: vi.fn(),
    uploadImport: vi.fn(),
  },
}));

const mockedApi = vi.mocked(mvpApi);

beforeEach(() => {
  vi.clearAllMocks();
  mockedApi.overview.mockResolvedValue({
    base_currency: "IDR",
    financial_disclaimer: "Informasi ini bukan nasihat investasi.",
    price_disclaimer: "Data bukan real-time. Harga berasal dari input manual/mock.",
    profit_loss_percent: -0.0529,
    profit_loss_value: -753255.58,
    total_cash: 151859,
    total_cost: 14250100.3,
    total_net_worth: 13648703.72,
    total_portfolio_value: 13496844.72,
  });
  mockedApi.allocation.mockResolvedValue([]);
  mockedApi.alerts.mockResolvedValue([]);
  mockedApi.instruments.mockResolvedValue([]);
  mockedApi.assetCategories.mockResolvedValue([]);
  mockedApi.transactions.mockResolvedValue([]);
  mockedApi.cashAccounts.mockResolvedValue([]);
});

describe("OverviewPage", () => {
  it("menampilkan loading state saat data masih dimuat", () => {
    mockedApi.overview.mockReturnValue(new Promise(() => undefined));

    renderWithProviders(<OverviewPage />);

    expect(screen.getByText("Memuat data")).toBeInTheDocument();
  });

  it("menampilkan error state saat overview gagal dimuat", async () => {
    mockedApi.overview.mockRejectedValue(new Error("server down"));

    renderWithProviders(<OverviewPage />);

    expect(await screen.findByText("Overview belum bisa dimuat.")).toBeInTheDocument();
  });

  it("menampilkan empty state saat overview kosong", async () => {
    mockedApi.overview.mockResolvedValue(null as never);

    renderWithProviders(<OverviewPage />);

    expect(await screen.findByText("Overview kosong")).toBeInTheDocument();
    expect(screen.getByText("Jalankan seed dan recalculate holdings terlebih dahulu.")).toBeInTheDocument();
  });
});

describe("MVP modal validation", () => {
  it("memvalidasi form tambah transaksi", async () => {
    const user = userEvent.setup();

    renderWithProviders(<TransactionsPage />);

    await user.click(await screen.findByRole("button", { name: /Tambah Transaksi/i }));
    await user.click(screen.getByRole("button", { name: "Simpan" }));

    expect(screen.getByText("Instrumen wajib dipilih.")).toBeInTheDocument();
    expect(screen.getByText("Harga wajib diisi dan tidak boleh negatif.")).toBeInTheDocument();
    expect(screen.getByText("Units wajib lebih dari 0 untuk buy/sell.")).toBeInTheDocument();
  });

  it("memvalidasi form tambah instrumen", async () => {
    const user = userEvent.setup();

    renderWithProviders(<InstrumentsPage />);

    await user.click(await screen.findByRole("button", { name: /Tambah Instrumen/i }));
    await user.click(screen.getByRole("button", { name: "Simpan" }));

    expect(screen.getByText("Nama instrumen wajib diisi.")).toBeInTheDocument();
  });

  it("memvalidasi form tambah akun cash", async () => {
    const user = userEvent.setup();

    renderWithProviders(<CashPage />);

    await user.click(await screen.findByRole("button", { name: /Tambah Akun Cash/i }));
    await user.click(screen.getByRole("button", { name: "Simpan" }));

    expect(screen.getByText("Nama akun cash wajib diisi.")).toBeInTheDocument();
    expect(screen.getByText("Saldo wajib berupa angka.")).toBeInTheDocument();
  });
});

describe("ImportPage", () => {
  it("menampilkan ringkasan preview import", async () => {
    const user = userEvent.setup();
    mockedApi.uploadImport.mockResolvedValue({
      detected_sections: ["holdings", "orders", "cash"],
      job_id: "55555555-5555-5555-5555-555555555555",
      original_filename: "sample.csv",
      rows: [
        {
          errors: [],
          id: "row-1",
          normalized: { name: "Bank Rakyat Indonesia", ticker: "BBRI" },
          raw: { Ticker: "BBRI" },
          row_number: 2,
          section: "holdings",
          status: "valid",
        },
        {
          errors: ["Nama akun cash wajib diisi"],
          id: "row-2",
          normalized: {},
          raw: { Account: "" },
          row_number: 8,
          section: "cash",
          status: "invalid",
        },
      ],
      source_type: "csv",
      summary: {
        invalid_rows: 1,
        total_rows: 3,
        valid_rows: 2,
      },
    });

    renderWithProviders(<ImportPage />);

    await user.upload(
      screen.getByLabelText("File Import"),
      new File(["INVESMENT\nTicker,Name\nBBRI,Bank Rakyat Indonesia"], "sample.csv", { type: "text/csv" }),
    );
    await user.click(screen.getByRole("button", { name: /Pratinjau/i }));

    expect(await screen.findAllByText("Portofolio")).toHaveLength(2);
    expect(screen.getByText("Transaksi")).toBeInTheDocument();
    expect(screen.getAllByText("Cash")).toHaveLength(2);
    expect(screen.getByText("Nama akun cash wajib diisi")).toBeInTheDocument();

    const totalCard = screen.getByText("Total Baris").closest("section");
    expect(totalCard).not.toBeNull();
    expect(within(totalCard as HTMLElement).getByText("3")).toBeInTheDocument();
  });
});
