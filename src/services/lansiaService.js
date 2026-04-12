"use server";

import prisma from "@/lib/prisma";

export async function getLansia() {
  const data = await prisma.lansia.findMany({
    include: {
      user: true,
      riwayat: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Serialize createdAt ke string agar bisa dikirim ke client
  return data.map(l => ({
    ...l,
    createdAt: l.createdAt?.toISOString() ?? null,
    tglLahir:  l.tglLahir?.toISOString()  ?? null,
  }));
}

export async function getLansiaById(id) {
  return await prisma.lansia.findUnique({
    where: { id: Number(id) },
  });
}

export async function createLansia(data) {
  // Debug: cek semua field yang masuk
  console.log("=== createLansia data masuk ===", JSON.stringify(data));

  const payload = {
    nik:          String(data.nik        ?? ""),
    nama:         String(data.nama       ?? ""),
    alamat:       String(data.alamat     ?? ""),
    noTelp:       data.noTelp ? String(data.noTelp) : null,
    tglLahir:     new Date(data.tglLahir),
    jenisKelamin: data.jenisKelamin ? String(data.jenisKelamin) : null,
  };

  console.log("=== createLansia payload ke DB ===", JSON.stringify(payload));

  return await prisma.lansia.create({ data: payload });
}

export async function updateLansia(id, data) {
  // Debug: cek semua field yang masuk
  console.log("=== updateLansia data masuk ===", JSON.stringify(data));

  const payload = {
    nik:          String(data.nik        ?? ""),
    nama:         String(data.nama       ?? ""),
    alamat:       String(data.alamat     ?? ""),
    noTelp:       data.noTelp ? String(data.noTelp) : null,
    tglLahir:     new Date(data.tglLahir),
    jenisKelamin: data.jenisKelamin ? String(data.jenisKelamin) : null,
  };

  console.log("=== updateLansia payload ke DB ===", JSON.stringify(payload));

  return await prisma.lansia.update({
    where: { id: Number(id) },
    data:  payload,
  });
}

export async function deleteLansia(id) {
  // 1. Hapus riwayat posyandu lansia terkait
  await prisma.posyanduLansia.deleteMany({
    where: { lansiaId: Number(id) },
  });

  // 2. Hapus user yang terhubung ke lansia ini
  await prisma.user.deleteMany({
    where: { lansiaId: Number(id) },
  });

  // 3. Hapus lansia
  return await prisma.lansia.delete({
    where: { id: Number(id) },
  });
}

export async function getLansiaByNik(nik) {
  return await prisma.lansia.findUnique({
    where: { nik },
  });
}

export async function getPosyanduLansiaByUser(lansiaId) {
  return await prisma.posyanduLansia.findMany({
    where:   { lansiaId: Number(lansiaId) },
    include: { lansia: true },
    orderBy: { tanggal: "desc" },
  });
}