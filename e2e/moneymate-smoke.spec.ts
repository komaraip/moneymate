import { expect, test } from "@playwright/test";
import type { APIRequestContext, Page } from "@playwright/test";
import path from "node:path";

const apiBaseURL = process.env.E2E_API_BASE_URL ?? "http://localhost:8080";
const ownerEmail = process.env.E2E_OWNER_EMAIL ?? "owner@moneymate.local";
const ownerPassword = process.env.E2E_OWNER_PASSWORD ?? "changeme-local-demo";

test.describe("MoneyMate MVP smoke", () => {
  test("login owner dan dashboard menampilkan net worth", async ({ page, request }) => {
    await login(page);
    await recalculateHoldings(page, request);
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Dashboard Keuangan" })).toBeVisible();
    await expect(page.getByText(/^Total Kekayaan Bersih$/)).toBeVisible();
    await expect(page.getByText(/Rp/).first()).toBeVisible();
  });

  test("portfolio dan halaman data utama dapat dibuka", async ({ page, request }) => {
    await loginAndPrepare(page, request);

    await page.getByRole("link", { name: "Portofolio" }).click();
    await expect(page.getByRole("heading", { name: "Portofolio" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Hitung Ulang" })).toBeVisible();
    await expect(page.getByRole("cell", { name: /BBRI|Bank Rakyat Indonesia/ }).first()).toBeVisible();
  });

  test("modal transaksi dapat dibuka untuk create edit dan delete", async ({ page, request }) => {
    await loginAndPrepare(page, request);

    await page.getByRole("link", { name: "Transaksi" }).click();
    await expect(page.getByRole("heading", { name: "Transaksi" })).toBeVisible();

    await page.getByRole("button", { name: /Tambah Transaksi/i }).click();
    await expect(page.getByRole("heading", { name: "Tambah Transaksi" })).toBeVisible();
    await page.getByRole("button", { name: "Batal" }).click();

    await page.getByTitle("Edit transaksi").first().click();
    await expect(page.getByRole("heading", { name: "Edit Transaksi" })).toBeVisible();
    await page.getByRole("button", { name: "Batal" }).click();

    await page.getByTitle("Hapus transaksi").first().click();
    await expect(page.getByRole("heading", { name: "Hapus Transaksi" })).toBeVisible();
    await page.getByRole("button", { name: "Batal" }).click();
  });

  test("modal instrumen dan cash dapat dibuka", async ({ page, request }) => {
    await loginAndPrepare(page, request);

    await page.getByRole("link", { name: "Instrumen" }).click();
    await expect(page.getByRole("heading", { name: "Instrumen" })).toBeVisible();
    await page.getByRole("button", { name: /Tambah Instrumen/i }).click();
    await expect(page.getByRole("heading", { name: "Tambah Instrumen" })).toBeVisible();
    await page.getByRole("button", { name: "Batal" }).click();
    await page.getByTitle("Edit instrumen").first().click();
    await expect(page.getByRole("heading", { name: "Edit Instrumen" })).toBeVisible();
    await page.getByRole("button", { name: "Batal" }).click();
    await page.getByTitle("Nonaktifkan instrumen").first().click();
    await expect(page.getByRole("heading", { name: "Nonaktifkan Instrumen" })).toBeVisible();
    await page.getByRole("button", { name: "Batal" }).click();

    await page.getByRole("link", { name: "Kas", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Kas" })).toBeVisible();
    await page.getByRole("button", { name: /Tambah Akun Kas/i }).click();
    await expect(page.getByRole("heading", { name: "Tambah Akun Kas" })).toBeVisible();
    await page.getByRole("button", { name: "Batal" }).click();
    await page.getByTitle("Edit akun cash").first().click();
    await expect(page.getByRole("heading", { name: "Edit Akun Kas" })).toBeVisible();
    await page.getByRole("button", { name: "Batal" }).click();
    await page.getByRole("button", { name: /Sesuaikan Saldo/i }).first().click();
    await expect(page.getByRole("heading", { name: "Sesuaikan Saldo Kas" })).toBeVisible();
    await page.getByRole("button", { name: "Batal" }).click();
    await page.getByRole("button", { name: "Histori" }).first().click();
    await expect(page.getByRole("heading", { name: "Histori Penyesuaian Kas" })).toBeVisible();
    await page.getByTitle("Tutup").click();
    await page.getByTitle("Nonaktifkan akun cash").first().click();
    await expect(page.getByRole("heading", { name: "Nonaktifkan Akun Kas" })).toBeVisible();
    await page.getByRole("button", { name: "Batal" }).click();
  });

  test("halaman import dapat menampilkan preview CSV kecil", async ({ page, request }) => {
    await loginAndPrepare(page, request);

    await page.getByRole("link", { name: "Impor Data" }).click();
    await expect(page.getByRole("heading", { name: "Impor Spreadsheet" })).toBeVisible();
    await expect(page.getByText("Belum ada pratinjau impor.")).toBeVisible();

    await page.getByLabel("File Impor").setInputFiles(path.join("e2e", "fixtures", "sample-import.csv"));
    await page.getByRole("button", { name: /Pratinjau/i }).click();

    await expect(page.getByText("Total Baris")).toBeVisible();
    await expect(page.getByText("Portofolio", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Transaksi", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Kas", { exact: true }).first()).toBeVisible();
  });

  test("halaman laporan memuat ringkasan dan export CSV", async ({ page, request }) => {
    await loginAndPrepare(page, request);

    await page.getByRole("link", { name: "Laporan" }).click();
    await expect(page.getByRole("heading", { name: "Laporan" })).toBeVisible();
    await expect(page.getByText("Data manual/mock, bukan real-time.").first()).toBeVisible();
    await expect(page.getByText(/Ringkasan Bulanan/)).toBeVisible();

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: /Ekspor CSV/i }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain("moneymate");
  });
});

async function loginAndPrepare(page: Page, request: APIRequestContext) {
  await login(page);
  await recalculateHoldings(page, request);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Dashboard Keuangan" })).toBeVisible();
}

async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(ownerEmail);
  await page.getByLabel("Password").fill(ownerPassword);
  await page.getByRole("button", { name: "Masuk" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard Keuangan" })).toBeVisible();
}

async function recalculateHoldings(page: Page, request: APIRequestContext) {
  const accessToken = await page.evaluate(() => window.localStorage.getItem("moneymate_access_token"));
  expect(accessToken).toBeTruthy();

  const response = await request.post(`${apiBaseURL}/api/v1/holdings/recalculate?date=2026-06-30`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  expect(response.ok()).toBeTruthy();
}
