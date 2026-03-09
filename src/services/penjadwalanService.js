"use server";

import prisma from "@/lib/prisma";

export async function getPenjadwalan() {
  return await prisma.penjadwalan.findMany({
    orderBy: {
      tanggal: "desc"
    }
  });
}

export async function getPenjadwalanById(id) {
  return await prisma.penjadwalan.findUnique({
    where: { id: Number(id) }
  });
}

export async function createPenjadwalan(data) {
  return await prisma.penjadwalan.create({
    data: {
      kegiatan: data.kegiatan,
      tanggal: new Date(data.tanggal),
      tempat: data.tempat
    }
  });
}

export async function updatePenjadwalan(id, data) {
  return await prisma.penjadwalan.update({
    where: { id: Number(id) },
    data: {
      kegiatan: data.kegiatan,
      tanggal: new Date(data.tanggal),
      tempat: data.tempat
    }
  });
}

export async function deletePenjadwalan(id) {
  return await prisma.penjadwalan.delete({
    where: { id: Number(id) }
  });
}
export async function getJadwalTerdekat() {

  const now = new Date();

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(now.getDate() - 7);

  return await prisma.penjadwalan.findMany({
    where: {
      tanggal: {
        gte: oneWeekAgo
      }
    },
    orderBy: {
      tanggal: "asc"
    }
  });

}