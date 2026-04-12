"use server";

import prisma from "@/lib/prisma";

export async function getLansia() {
  return await prisma.lansia.findMany({
    include: {
      user: true,
      riwayat: true,
    },
  });
}

export async function getLansiaById(id) {
  return await prisma.lansia.findUnique({
    where: { id: Number(id) },
  });
}

export async function getLansiaCount() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    
    return await prisma.lansia.count({
      where: {
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        }
      }
    });
  } catch (err) {
    console.error("getLansiaCount error:", err);
    return 0; // ← return 0 kalau error, tidak crash
  }
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