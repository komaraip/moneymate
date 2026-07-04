import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "../../../test/render";
import { mvpApi } from "../api";
import { BudgetsPage } from "./BudgetsPage";
import { CashPage } from "./CashPage";
import { ImportPage } from "./ImportPage";
import { InstrumentsPage } from "./InstrumentsPage";
import { OverviewPage } from "./OverviewPage";
import { ReportsPage } from "./ReportsPage";
import { TransactionsPage } from "./TransactionsPage";

vi.mock("../api", () => ({
  mvpApi: {
    alerts: vi.fn(),
    allocation: vi.fn(),
    assetCategories: vi.fn(),
    auditLogs: vi.fn(),
    budgets: vi.fn(),
    cashAccounts: vi.fn(),
    cashAdjustments: vi.fn(),
    confirmImport: vi.fn(),
    createBudget: vi.fn(),
    createCashAdjustment: vi.fn(),
    createCashAccount: vi.fn(),
    createInstrument: vi.fn(),
    createManualPrice: vi.fn(),
    createTransaction: vi.fn(),
    createTransactionCategory: vi.fn(),
    deleteBudget: vi.fn(),
    deleteCashAccount: vi.fn(),
    deleteInstrument: vi.fn(),
    deleteTransaction: vi.fn(),
    deleteTransactionCategory: vi.fn(),
    exportReportsCsv: vi.fn(),
    holdings: vi.fn(),
    instruments: vi.fn(),
    monthlySummary: vi.fn(),
    overview: vi.fn(),
    portfolioPerformance: vi.fn(),
    recalculateHoldings: vi.fn(),
    transactions: vi.fn(),
    transactionCategories: vi.fn(),
    updateBudget: vi.fn(),
    updateCashAccount: vi.fn(),
    updateInstrument: vi.fn(),
    updateTransaction: vi.fn(),
    updateTransactionCategory: vi.fn(),
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
    monthly_expense: 125000,
    monthly_income: 500000,
    monthly_net_cashflow: 375000,
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
  mockedApi.transactionCategories.mockResolvedValue([]);
  mockedApi.budgets.mockResolvedValue([]);
  mockedApi.cashAccounts.mockResolvedValue([]);
  mockedApi.cashAdjustments.mockResolvedValue([]);
  mockedApi.createCashAdjustment.mockResolvedValue({
    adjustment_date: "2026-06-15",
    amount: 50000,
    balance_after: 150000,
    balance_before: 100000,
    cash_account_id: "cash-1",
    created_at: "2026-06-15T10:00:00Z",
    currency: "IDR",
    id: "adjustment-1",
    note: "Top up",
    type: "deposit",
  });
  mockedApi.monthlySummary.mockResolvedValue({
    base_currency: "IDR",
    beginning_net_worth: null,
    cash_balance: 151859,
    cash_movements: [
      {
        adjustment_count: 1,
        total_idr: 50000,
        type: "deposit",
      },
    ],
    cash_net_movement: 50000,
    expense_total: 125000,
    income_total: 500000,
    net_cashflow: 375000,
    budgets: [
      {
        amount: 1000000,
        category_id: "category-food",
        category_name: "Makan",
        id: "budget-1",
        month: "2026-06",
        over_budget: false,
        percent_used: 0.125,
        remaining: 875000,
        spent: 125000,
      },
    ],
    data_not_realtime: "Data manual/mock, bukan real-time.",
    disclaimer: "Laporan ini bukan rekomendasi beli/jual.",
    ending_net_worth: 13648703.72,
    generated_at: "2026-07-02T10:00:00Z",
    month: "2026-06",
    net_worth_change: null,
    portfolio_snapshot_date: "2026-06-30",
    portfolio_value: 13496844.72,
    realized_profit_loss: null,
    top_contributors: [],
    top_detractors: [],
    transaction_totals_by_asset_type: [
      {
        asset_type: "stock",
        total_idr: 30000,
        transaction_count: 1,
        transaction_type: "buy",
      },
    ],
    transaction_totals_by_instrument: [
      {
        instrument_id: "33333333-3333-3333-3333-333333333333",
        instrument_type: "stock",
        name: "Bank Rakyat Indonesia",
        original_currency: "IDR",
        ticker: "BBRI",
        total_idr: 30000,
        transaction_count: 1,
        transaction_type: "buy",
      },
    ],
    unrealized_profit_loss: -753255.58,
    warnings: [
      {
        code: "DATA_NOT_REALTIME",
        message: "Semua harga MVP berasal dari input manual/mock dan bukan real-time.",
        severity: "info",
      },
    ],
  });
  mockedApi.portfolioPerformance.mockResolvedValue({
    absolute_change: null,
    allocation_breakdown: [
      {
        asset: "Saham",
        percent: 0.34,
        value: 4641000,
      },
    ],
    base_currency: "IDR",
    cash_summary: {
      active_accounts: 3,
      currency: "IDR",
      history_available: false,
      note: "Cash memakai saldo aktif saat ini.",
      period_movement: 50000,
      total_cash: 151859,
    },
    data_not_realtime: "Data manual/mock, bukan real-time.",
    disclaimer: "Laporan ini bukan rekomendasi beli/jual.",
    ending_snapshot_date: "2026-06-30",
    ending_value: 13496844.72,
    from_date: "2026-06-01",
    generated_at: "2026-07-02T10:00:00Z",
    holdings_performance: [
      {
        average_price_idr: 3000,
        current_price_idr: 3500,
        current_value_idr: 35000,
        fx_rate_to_idr: null,
        instrument_currency: "IDR",
        instrument_id: "33333333-3333-3333-3333-333333333333",
        instrument_type: "stock",
        latest_price: 3500,
        latest_price_currency: "IDR",
        name: "Bank Rakyat Indonesia",
        price_source: "manual",
        price_updated_at: "2026-06-30T10:00:00Z",
        profit_loss_percent: 0.1667,
        profit_loss_value_idr: 5000,
        ticker: "BBRI",
        total_cost_idr: 30000,
        units: 10,
        warnings: [],
      },
    ],
    method: "simple_portfolio_change",
    percentage_change: null,
    starting_snapshot_date: null,
    starting_value: null,
    to_date: "2026-06-30",
    warnings: [
      {
        code: "DATA_NOT_REALTIME",
        message: "Semua harga MVP berasal dari input manual/mock dan bukan real-time.",
        severity: "info",
      },
    ],
  });
  mockedApi.exportReportsCsv.mockResolvedValue(new Blob(["section\nmetadata"], { type: "text/csv" }));
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

    expect(await screen.findByText("Ringkasan belum bisa dimuat.")).toBeInTheDocument();
  });

  it("menampilkan empty state saat overview kosong", async () => {
    mockedApi.overview.mockResolvedValue(null as never);

    renderWithProviders(<OverviewPage />);

    expect(await screen.findByText("Ringkasan kosong")).toBeInTheDocument();
    expect(screen.getByText("Jalankan seed dan hitung ulang portofolio terlebih dahulu.")).toBeInTheDocument();
  });
});

describe("MVP modal validation", () => {
  it("memvalidasi form tambah transaksi", async () => {
    const user = userEvent.setup();

    renderWithProviders(<TransactionsPage />);

    await user.click(await screen.findByRole("button", { name: /Tambah Transaksi/i }));
    await user.click(screen.getByRole("button", { name: "Simpan" }));

    expect(screen.getByText("Akun wajib dipilih.")).toBeInTheDocument();
    expect(screen.getByText("Kategori wajib dipilih.")).toBeInTheDocument();
    expect(screen.getByText("Nominal wajib lebih dari 0.")).toBeInTheDocument();
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

    await user.click(await screen.findByRole("button", { name: /Tambah Akun Kas/i }));
    await user.click(screen.getByRole("button", { name: "Simpan" }));

    expect(screen.getByText("Nama akun cash wajib diisi.")).toBeInTheDocument();
    expect(screen.getByText("Saldo wajib berupa angka.")).toBeInTheDocument();
  });

  it("memvalidasi form adjustment cash", async () => {
    const user = userEvent.setup();
    mockedApi.cashAccounts.mockResolvedValue([
      {
        account_name: "Seabank",
        account_type: "bank",
        balance: 100000,
        created_at: "2026-06-01T10:00:00Z",
        currency: "IDR",
        id: "cash-1",
        is_active: true,
        updated_at: "2026-06-01T10:00:00Z",
      },
    ]);

    renderWithProviders(<CashPage />);

    await user.click(await screen.findByRole("button", { name: /Sesuaikan Saldo/i }));
    await user.click(screen.getByRole("button", { name: "Simpan Penyesuaian" }));

    expect(screen.getByText("Nominal penyesuaian wajib lebih dari 0.")).toBeInTheDocument();
  });

  it("memvalidasi form tambah anggaran", async () => {
    const user = userEvent.setup();
    mockedApi.transactionCategories.mockResolvedValue([
      {
        color_key: "expense",
        created_at: "2026-06-01T10:00:00Z",
        id: "category-food",
        is_active: true,
        name: "Makan",
        sort_order: 10,
        type: "expense",
        updated_at: "2026-06-01T10:00:00Z",
      },
    ]);

    renderWithProviders(<BudgetsPage />);

    await user.click(await screen.findByRole("button", { name: /Tambah Anggaran/i }));
    await user.click(screen.getByRole("button", { name: "Simpan" }));

    expect(screen.getByText("Kategori pengeluaran wajib dipilih.")).toBeInTheDocument();
    expect(screen.getByText("Nominal anggaran wajib lebih dari 0.")).toBeInTheDocument();
  });
});

describe("Cash history", () => {
  it("menampilkan histori adjustment cash", async () => {
    const user = userEvent.setup();
    mockedApi.cashAccounts.mockResolvedValue([
      {
        account_name: "Seabank",
        account_type: "bank",
        balance: 150000,
        created_at: "2026-06-01T10:00:00Z",
        currency: "IDR",
        id: "cash-1",
        is_active: true,
        updated_at: "2026-06-15T10:00:00Z",
      },
    ]);
    mockedApi.cashAdjustments.mockResolvedValue([
      {
        adjustment_date: "2026-06-15",
        amount: 50000,
        balance_after: 150000,
        balance_before: 100000,
        cash_account_id: "cash-1",
        created_at: "2026-06-15T10:00:00Z",
        currency: "IDR",
        id: "adjustment-1",
        note: "Top up",
        type: "deposit",
      },
    ]);

    renderWithProviders(<CashPage />);

    await user.click(await screen.findByRole("button", { name: "Histori" }));

    expect(await screen.findByText("Histori Penyesuaian Kas")).toBeInTheDocument();
    expect(screen.getByText("Deposit")).toBeInTheDocument();
    expect(screen.getByText("Top up")).toBeInTheDocument();
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
      screen.getByLabelText("File Impor"),
      new File(["INVESMENT\nTicker,Name\nBBRI,Bank Rakyat Indonesia"], "sample.csv", { type: "text/csv" }),
    );
    await user.click(screen.getByRole("button", { name: /Pratinjau/i }));

    expect(await screen.findAllByText("Portofolio")).toHaveLength(2);
    expect(screen.getByText("Transaksi")).toBeInTheDocument();
    expect(screen.getAllByText("Kas")).toHaveLength(2);
    expect(screen.getByText("Nama akun cash wajib diisi")).toBeInTheDocument();

    const totalCard = screen.getByText("Total Baris").closest("section");
    expect(totalCard).not.toBeNull();
    expect(within(totalCard as HTMLElement).getByText("3")).toBeInTheDocument();
  });
});

describe("ReportsPage", () => {
  it("menampilkan ringkasan laporan dan tombol export", async () => {
    renderWithProviders(<ReportsPage />);

    expect(await screen.findByText("Ringkasan Bulanan 2026-06")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Ekspor CSV/i })).toBeInTheDocument();
    expect(screen.getAllByText("DATA_NOT_REALTIME").length).toBeGreaterThan(0);
  });

  it("menampilkan loading state saat laporan dimuat", () => {
    mockedApi.monthlySummary.mockReturnValue(new Promise(() => undefined));

    renderWithProviders(<ReportsPage />);

    expect(screen.getByText("Memuat data")).toBeInTheDocument();
  });

  it("menampilkan error state saat laporan gagal dimuat", async () => {
    mockedApi.monthlySummary.mockRejectedValue(new Error("server down"));

    renderWithProviders(<ReportsPage />);

    expect(await screen.findByText("Laporan belum bisa dimuat.")).toBeInTheDocument();
  });
});
