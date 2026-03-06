/*
  Warnings:

  - You are about to drop the `Posyandu` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Posyandu" DROP CONSTRAINT "Posyandu_balitaNik_fkey";

-- DropTable
DROP TABLE "Posyandu";

-- CreateTable
CREATE TABLE "PosyanduBalita" (
    "id" SERIAL NOT NULL,
    "kegiatan" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "bb" DOUBLE PRECISION,
    "tb" DOUBLE PRECISION,
    "lingkarKepala" DOUBLE PRECISION,
    "lingkarLengan" DOUBLE PRECISION,
    "balitaNik" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PosyanduBalita_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PosyanduBalita" ADD CONSTRAINT "PosyanduBalita_balitaNik_fkey" FOREIGN KEY ("balitaNik") REFERENCES "Balita"("nik") ON DELETE RESTRICT ON UPDATE CASCADE;
