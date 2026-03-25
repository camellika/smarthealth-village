"use server";

import prisma from "@/lib/prisma";

export async function getBalita() {
  return await prisma.balita.findMany({
    include: {
      user: true,
      riwayat: true
    }
  });
}

export async function getBalitaById(id) {
  return await prisma.balita.findUnique({
    where: { id: Number(id) }
  });
}

export async function createBalita(data) {
  return await prisma.balita.create({
    data: {
      nik: data.nik,
      nama: data.nama,
      namaIbu: data.namaIbu,
      alamat: data.alamat,
      noTelp: data.noTelp || null,
      tglLahir: new Date(data.tglLahir)
    }
  });
}

export async function updateBalita(id, data) {
  return await prisma.balita.update({
    where: { id: Number(id) },
    data: {
      nik: data.nik,
      nama: data.nama,
      namaIbu: data.namaIbu,
      alamat: data.alamat,
      noTelp: data.noTelp || null,
      tglLahir: new Date(data.tglLahir)
    }
  });
}

export async function deleteBalita(id) {
  // Hapus data posyandu balita yang terkait dulu
  await prisma.posyanduBalita.deleteMany({
    where: {
      balitaId: Number(id)
    }
  });

  // Baru hapus balita
  return await prisma.balita.delete({
    where: { id: Number(id) }
  });
}

export async function getBalitaByNik(nik) {
  return await prisma.balita.findUnique({
    where: { nik }
  });
}

/**
 * Ambil semua riwayat pemeriksaan berdasarkan balitaId milik user yang login.
 */
export async function getPosyanduBalitaByUser(balitaId) {
  return await prisma.posyanduBalita.findMany({
    where: {
      balitaId: Number(balitaId),
    },
    include: {
      balita: true,
    },
    orderBy: {
      tanggal: "desc",
    },
  });
}