-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "roleId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Balita" (
    "nik" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "namaIbu" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "noTelp" TEXT,
    "tglLahir" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Balita_pkey" PRIMARY KEY ("nik")
);

-- CreateTable
CREATE TABLE "Posyandu" (
    "id" SERIAL NOT NULL,
    "kegiatan" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "bb" DOUBLE PRECISION,
    "tb" DOUBLE PRECISION,
    "lingkarKepala" DOUBLE PRECISION,
    "lingkarLengan" DOUBLE PRECISION,
    "balitaNik" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Posyandu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Penjadwalan" (
    "id" SERIAL NOT NULL,
    "kegiatan" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "tempat" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Penjadwalan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Posyandu" ADD CONSTRAINT "Posyandu_balitaNik_fkey" FOREIGN KEY ("balitaNik") REFERENCES "Balita"("nik") ON DELETE RESTRICT ON UPDATE CASCADE;
