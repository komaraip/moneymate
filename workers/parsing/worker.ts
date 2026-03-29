import { getBoss, queueNames } from "@/lib/jobs/boss";
import { processDocumentById } from "@/lib/services/document-processing";

async function startWorker() {
  const boss = await getBoss();

  await boss.work<{ documentId: string }>(queueNames.processDocument, async ([job]) => {
    if (!job) {
      return;
    }

    const documentId = `${job.data.documentId ?? ""}`;
    if (!documentId) {
      throw new Error("documents.process job received no documentId payload.");
    }

    await processDocumentById(documentId);
  });

  console.log(`[worker] listening on queue ${queueNames.processDocument}`);
}

startWorker().catch((error) => {
  console.error("[worker] fatal startup error", error);
  process.exitCode = 1;
});
