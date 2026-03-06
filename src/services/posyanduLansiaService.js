"use server";

import prisma from "@/lib/prisma";

export async function getPosyanduLansia() {
  return await prisma.posyanduLansia.findMany({
    include: {
      lansia: true
    },
    orderBy: {
      tanggal: "desc"
    }
  });
}

export async function getPosyanduLansiaById(id) {
  return await prisma.posyanduLansia.findUnique({
    where: { id: Number(id) },
    include: {
      lansia: true
    }
  });
}

export async function createPosyanduLansia(data) {
  return await prisma.posyanduLansia.create({
    data: {
      kegiatan: data.kegiatan,
      tanggal: new Date(data.tanggal),

      bb: data.bb ? Number(data.bb) : null,
      tb: data.tb ? Number(data.tb) : null,
      lingkarPerut: data.lingkarPerut ? Number(data.lingkarPerut) : null,
      tensi: data.tensi ? Number(data.tensi) : null,
      gulaDarah: data.gulaDarah ? Number(data.gulaDarah) : null,

      lansiaId: Number(data.lansiaId)
    }
  });
}

export async function updatePosyanduLansia(id, data) {
  return await prisma.posyanduLansia.update({
    where: { id: Number(id) },
    data: {
      kegiatan: data.kegiatan,
      tanggal: new Date(data.tanggal),

      bb: data.bb ? Number(data.bb) : null,
      tb: data.tb ? Number(data.tb) : null,
      lingkarPerut: data.lingkarPerut ? Number(data.lingkarPerut) : null,
      tensi: data.tensi ? Number(data.tensi) : null,
      gulaDarah: data.gulaDarah ? Number(data.gulaDarah) : null,

      lansiaId: Number(data.lansiaId)
    }
  });
}

export async function deletePosyanduLansia(id) {
  return await prisma.posyanduLansia.delete({
    where: { id: Number(id) }
  });
}
export async function getRiwayatLansia(lansiaId) {
  return await prisma.posyanduLansia.findMany({
    where: {
      lansiaId: Number(lansiaId)
    },
    orderBy: {
      tanggal: "desc"
    }
  });
}