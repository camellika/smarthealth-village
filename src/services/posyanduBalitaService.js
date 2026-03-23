"use server";

import prisma from "@/lib/prisma";


export async function getPosyanduBalita() {
  return await prisma.posyanduBalita.findMany({
    include: {
      balita: true
    },
    orderBy: {
      tanggal: "desc"
    }
  });
}

export async function getPosyanduBalitaByBulan(tahun, bulan) {
  return await prisma.posyanduBalita.findMany({
    where: {
      tanggal: {
        gte: new Date(tahun, bulan - 1, 1),
        lt:  new Date(tahun, bulan, 1),
      }
    },
    include: { balita: true },
    orderBy: { tanggal: "desc" }
  });
}

export async function getPosyanduBalitaById(id) {
  return await prisma.posyanduBalita.findUnique({
    where: { id: Number(id) },
    include: {
      balita: true
    }
  });
}

export async function createPosyanduBalita(data) {
  return await prisma.posyanduBalita.create({
    data: {
      kegiatan: data.kegiatan,
      tanggal: new Date(data.tanggal),

      bb: data.bb ? Number(data.bb) : null,
      tb: data.tb ? Number(data.tb) : null,
      lingkarKepala: data.lingkarKepala ? Number(data.lingkarKepala) : null,
      lingkarLengan: data.lingkarLengan ? Number(data.lingkarLengan) : null,

      balitaId: Number(data.balitaId)
    }
  });
}

export async function updatePosyanduBalita(id, data) {
  return await prisma.posyanduBalita.update({
    where: { id: Number(id) },
    data: {
      kegiatan: data.kegiatan,
      tanggal: new Date(data.tanggal),

      bb: data.bb ? Number(data.bb) : null,
      tb: data.tb ? Number(data.tb) : null,
      lingkarKepala: data.lingkarKepala ? Number(data.lingkarKepala) : null,
      lingkarLengan: data.lingkarLengan ? Number(data.lingkarLengan) : null,

      balitaId: Number(data.balitaId)
    }
  });
}

export async function deletePosyanduBalita(id) {
  return await prisma.posyanduBalita.delete({
    where: { id: Number(id) }
  });
}
export async function getRiwayatBalita(balitaId) {
  return await prisma.posyanduBalita.findMany({
    where: {
      balitaId: Number(balitaId)
    },
    orderBy: {
      tanggal: "desc"
    }
  });
}