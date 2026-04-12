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
    
    // Buat batas bulan dalam UTC+7 (WIB)
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-indexed
    
    // Start of month WIB = tanggal 1 jam 00:00 WIB = tanggal 1 jam -7:00 UTC (hari sebelumnya jam 17:00 UTC)
    const startOfMonth = new Date(Date.UTC(year, month, 1, -7, 0, 0));
    // End of month WIB = hari terakhir jam 23:59 WIB = hari terakhir jam 16:59 UTC
    const endOfMonth = new Date(Date.UTC(year, month + 1, 0, 16, 59, 59));

    console.log("startOfMonth:", startOfMonth);
    console.log("endOfMonth:", endOfMonth);

    const count = await prisma.lansia.count({
      where: {
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        }
      }
    });

    console.log("bulanIni count:", count);
    return count;
  } catch (err) {
    console.error("getLansiaCount error:", err);
    return 0;
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