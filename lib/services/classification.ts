import { DocumentType } from "@prisma/client";

export function classifyDocument(rawText: string) {
  const normalized = rawText.toLowerCase();
  const signals = [
    normalized.includes("client stock activity"),
    normalized.includes("grand total"),
    normalized.includes("client code"),
    normalized.includes("sid")
  ];

  const score = signals.filter(Boolean).length / signals.length;

  if (score >= 0.5) {
    return {
      documentType: DocumentType.STOCK_ACTIVITY_STATEMENT,
      confidence: Number((0.64 + score * 0.32).toFixed(4))
    };
  }

  return {
    documentType: DocumentType.UNKNOWN,
    confidence: Number((0.25 + score * 0.2).toFixed(4))
  };
}

