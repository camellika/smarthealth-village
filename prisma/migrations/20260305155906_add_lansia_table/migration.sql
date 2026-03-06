-- CreateTable
CREATE TABLE "Lansia" (
    "nik" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "noTelp" TEXT,
    "tglLahir" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lansia_pkey" PRIMARY KEY ("nik")
);

-- CreateTable
CREATE TABLE "PosyanduLansia" (
    "id" SERIAL NOT NULL,
    "kegiatan" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "bb" DOUBLE PRECISION,
    "tb" DOUBLE PRECISION,
    "lingkarPerut" DOUBLE PRECISION,
    "tensi" DOUBLE PRECISION,
    "gulaDarah" DOUBLE PRECISION,
    "lansiaNik" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PosyanduLansia_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PosyanduLansia" ADD CONSTRAINT "PosyanduLansia_lansiaNik_fkey" FOREIGN KEY ("lansiaNik") REFERENCES "Lansia"("nik") ON DELETE RESTRICT ON UPDATE CASCADE;
