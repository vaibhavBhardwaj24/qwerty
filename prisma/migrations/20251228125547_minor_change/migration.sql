/*
  Warnings:

  - Added the required column `name` to the `WorkspaceMember` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WorkspaceMember" ADD COLUMN     "name" TEXT NOT NULL;
