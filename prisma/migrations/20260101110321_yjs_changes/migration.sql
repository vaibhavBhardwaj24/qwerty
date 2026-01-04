-- AlterTable
ALTER TABLE "Block" ADD COLUMN     "lastSyncedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "YjsSnapshot" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "snapshot" BYTEA NOT NULL,
    "version" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "YjsSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "YjsSnapshot_pageId_idx" ON "YjsSnapshot"("pageId");

-- CreateIndex
CREATE INDEX "YjsSnapshot_createdAt_idx" ON "YjsSnapshot"("createdAt");

-- AddForeignKey
ALTER TABLE "YjsSnapshot" ADD CONSTRAINT "YjsSnapshot_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;
