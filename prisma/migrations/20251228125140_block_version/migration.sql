/*
  Warnings:

  - Added the required column `changedBy` to the `BlockVersion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BlockVersion" ADD COLUMN     "changedBy" TEXT NOT NULL;
