import { AppError } from "@/lib/utils/errors";

export async function extractTextFromPdf(buffer: Buffer) {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const document = await pdfjs.getDocument({
    data: new Uint8Array(buffer)
  }).promise;

  const pages: string[] = [];
  for (let index = 1; index <= document.numPages; index += 1) {
    const page = await document.getPage(index);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .trim();

    if (pageText) {
      pages.push(pageText);
    }
  }

  if (pages.length === 0) {
    throw new AppError(
      "OCR is not yet supported for scanned PDFs. Upload a text-based PDF for the Phase 2 MVP.",
      422,
      "ocr_not_supported"
    );
  }

  return pages.join("\n");
}
