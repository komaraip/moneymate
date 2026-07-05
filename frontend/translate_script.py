import os
import re

PAGES_DIR = r"c:\Users\Komara Indra Putra\Documents\Business\MoneyMate\frontend\src\pages"

TRANSLATIONS = {
    # Form labels & headers
    r'"Tipe"': '"Type"',
    r'"Tanggal"': '"Date"',
    r'"Akun asal"': '"Source Account"',
    r'"Akun tujuan"': '"Destination Account"',
    r'"Akun"': '"Account"',
    r'"Kategori"': '"Category"',
    r'"Nominal"': '"Amount"',
    r'"Instrumen"': '"Instrument"',
    r'"Harga"': '"Price"',
    r'"Unit"': '"Units"',
    r'"Mata uang"': '"Currency"',
    r'"Kurs ke IDR"': '"Exchange Rate to IDR"',
    r'"Biaya"': '"Fees"',
    r'"Pajak"': '"Tax"',
    r'"Catatan"': '"Notes"',
    
    # Types
    r'"Pengeluaran"': '"Expense"',
    r'"Pemasukan"': '"Income"',
    r'"Beli Investasi"': '"Buy Investment"',
    r'"Jual Investasi"': '"Sell Investment"',
    r'"Dividen"': '"Dividend"',
    r'"Penyesuaian"': '"Adjustment"',
    
    # Placeholders & Defaults
    r'"Pilih akun"': '"Select account"',
    r'"Pilih akun tujuan"': '"Select destination account"',
    r'"Pilih kategori"': '"Select category"',
    r'"Pilih instrumen"': '"Select instrument"',
    
    # Messages
    r'"Transaksi berhasil ditambahkan."': '"Transaction added successfully."',
    r'"Transaksi cepat berhasil disimpan."': '"Quick transaction saved successfully."',
    r'"Transaksi berhasil diperbarui."': '"Transaction updated successfully."',
    r'"Transaksi berhasil dihapus."': '"Transaction deleted successfully."',
    r'"Transaksi belum bisa dimuat."': '"Transactions could not be loaded."',
    r'"Transaksi belum dipilih."': '"Transaction not selected."',
    
    # Validations
    r'"Tanggal transaksi wajib diisi."': '"Transaction date is required."',
    r'"Tipe transaksi tidak valid."': '"Invalid transaction type."',
    r'"Mata uang wajib diisi."': '"Currency is required."',
    r'"Kurs ke IDR wajib diisi untuk transaksi non-IDR."': '"Exchange rate is required for non-IDR transactions."',
    r'"Akun wajib dipilih."': '"Account must be selected."',
    r'"Nominal wajib lebih dari 0."': '"Amount must be greater than 0."',
    r'"Kategori wajib dipilih."': '"Category must be selected."',
    r'"Akun tujuan wajib dipilih."': '"Destination account must be selected."',
    r'"Akun asal dan tujuan transfer harus berbeda."': '"Source and destination accounts must be different."',
    r'"Instrumen wajib dipilih."': '"Instrument must be selected."',
    r'"Harga wajib diisi dan tidak boleh negatif."': '"Price must be provided and cannot be negative."',
    r'"Unit wajib lebih dari 0 untuk beli/jual."': '"Units must be greater than 0 for buy/sell."',
    r'"Biaya tidak boleh negatif."': '"Fees cannot be negative."',
    r'"Pajak tidak boleh negatif."': '"Tax cannot be negative."',
}

def replace_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    original = content

    # Apply translations
    for id_text, en_text in TRANSLATIONS.items():
        content = content.replace(id_text, en_text)

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated translations in {os.path.basename(filepath)}")

for root, dirs, files in os.walk(PAGES_DIR):
    for file in files:
        if file.endswith('.tsx'):
            replace_in_file(os.path.join(root, file))

print("Translation script complete")
