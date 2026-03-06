/*
  Warnings:

  - A unique constraint covering the columns `[nik]` on the table `Balita` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nik]` on the table `Lansia` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nik]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `UserId` to the `Balita` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nik` to the `Balita` table without a default value. This is not possible if the table is not empty.
  - Added the required column `UserId` to the `Lansia` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nik` to the `Lansia` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nik` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Balita" ADD COLUMN     "UserId" INTEGER NOT NULL,
ADD COLUMN     "nik" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Lansia" ADD COLUMN     "UserId" INTEGER NOT NULL,
ADD COLUMN     "nik" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "nik" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Balita_nik_key" ON "Balita"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "Lansia_nik_key" ON "Lansia"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "User_nik_key" ON "User"("nik");

-- AddForeignKey
ALTER TABLE "Balita" ADD CONSTRAINT "Balita_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lansia" ADD CONSTRAINT "Lansia_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
