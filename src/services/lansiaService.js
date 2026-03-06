"use server";

import prisma from "@/lib/prisma";

export async function getLansia() {
  return await prisma.lansia.findMany({
    include: {
      user: true,
      riwayat: true
    }
  });
}

export async function getLansiaById(id) {
  return await prisma.lansia.findUnique({
    where: { id: Number(id) }
  });
}

export async function createLansia(data) {
  return await prisma.lansia.create({
    data: {
      nik: data.nik,
      nama: data.nama,
      alamat: data.alamat,
      noTelp: data.noTelp || null,
      tglLahir: new Date(data.tglLahir)
    }
  });
}

export async function updateLansia(id, data) {
  return await prisma.lansia.update({
    where: { id: Number(id) },
    data: {
      nik: data.nik,
      nama: data.nama,
      alamat: data.alamat,
      noTelp: data.noTelp || null,
      tglLahir: new Date(data.tglLahir)
    }
  });
}

export async function deleteLansia(id) {
  return await prisma.lansia.delete({
    where: { id: Number(id) }
  });
}

export async function getLansiaByNik(nik) {
  return await prisma.lansia.findUnique({
    where: { nik }
  });
}