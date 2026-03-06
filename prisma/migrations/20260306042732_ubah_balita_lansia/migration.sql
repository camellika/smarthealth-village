/*
  Warnings:

  - You are about to drop the column `UserId` on the `Balita` table. All the data in the column will be lost.
  - You are about to drop the column `UserId` on the `Lansia` table. All the data in the column will be lost.
  - You are about to drop the column `nik` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[balitaId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[lansiaId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Balita" DROP CONSTRAINT "Balita_UserId_fkey";

-- DropForeignKey
ALTER TABLE "Lansia" DROP CONSTRAINT "Lansia_UserId_fkey";

-- DropIndex
DROP INDEX "User_nik_key";

-- AlterTable
ALTER TABLE "Balita" DROP COLUMN "UserId",
ALTER COLUMN "nik" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Lansia" DROP COLUMN "UserId",
ALTER COLUMN "nik" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "nik",
ADD COLUMN     "balitaId" INTEGER,
ADD COLUMN     "lansiaId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "User_balitaId_key" ON "User"("balitaId");

-- CreateIndex
CREATE UNIQUE INDEX "User_lansiaId_key" ON "User"("lansiaId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_balitaId_fkey" FOREIGN KEY ("balitaId") REFERENCES "Balita"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_lansiaId_fkey" FOREIGN KEY ("lansiaId") REFERENCES "Lansia"("id") ON DELETE SET NULL ON UPDATE CASCADE;
