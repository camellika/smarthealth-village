/*
  Warnings:

  - The primary key for the `Balita` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `nik` on the `Balita` table. All the data in the column will be lost.
  - The primary key for the `Lansia` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `nik` on the `Lansia` table. All the data in the column will be lost.
  - You are about to drop the column `balitaNik` on the `PosyanduBalita` table. All the data in the column will be lost.
  - You are about to drop the column `lansiaNik` on the `PosyanduLansia` table. All the data in the column will be lost.
  - Added the required column `balitaId` to the `PosyanduBalita` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lansiaId` to the `PosyanduLansia` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PosyanduBalita" DROP CONSTRAINT "PosyanduBalita_balitaNik_fkey";

-- DropForeignKey
ALTER TABLE "PosyanduLansia" DROP CONSTRAINT "PosyanduLansia_lansiaNik_fkey";

-- AlterTable
ALTER TABLE "Balita" DROP CONSTRAINT "Balita_pkey",
DROP COLUMN "nik",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Balita_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Lansia" DROP CONSTRAINT "Lansia_pkey",
DROP COLUMN "nik",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Lansia_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "PosyanduBalita" DROP COLUMN "balitaNik",
ADD COLUMN     "balitaId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "PosyanduLansia" DROP COLUMN "lansiaNik",
ADD COLUMN     "lansiaId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "PosyanduBalita" ADD CONSTRAINT "PosyanduBalita_balitaId_fkey" FOREIGN KEY ("balitaId") REFERENCES "Balita"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PosyanduLansia" ADD CONSTRAINT "PosyanduLansia_lansiaId_fkey" FOREIGN KEY ("lansiaId") REFERENCES "Lansia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
