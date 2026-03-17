"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

/*
REGISTER USER
*/
export async function registerUser(data) {

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      username: data.username,
      password: hashedPassword,
      role: "user",
      balitaId: data.balitaId || null,
      lansiaId: data.lansiaId || null
    }
  });

  return user;
}


export async function register(data) {

  const existingUser = await prisma.user.findUnique({
    where: {
      username: data.username
    }
  });

  if (existingUser) {
    throw new Error("Username sudah digunakan");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      username: data.username,
      password: hashedPassword,
      role: data.role || "user",
      balitaId: data.balitaId ? Number(data.balitaId) : null,
      lansiaId: data.lansiaId ? Number(data.lansiaId) : null
    }
  });

  return {
    id: user.id,
    username: user.username,
    role: user.role
  };
}

// ============================================================
// TAMBAHKAN fungsi-fungsi ini ke src/services/authService.js
// Sesuaikan nama field jika berbeda di schema Prisma kamu
// ============================================================

/**
 * Cari balita berdasarkan NIK (partial match)
 * Sesuaikan: prisma.balita → nama model di schema kamu
 * Sesuaikan: nik, nama, tanggalLahir → nama field di schema kamu
 */
export async function searchBalitaByNik(nik) {

  if (!nik || nik.length < 3) return [];

  const results = await prisma.balita.findMany({
    where: {
      nik: {
        contains: nik,
        mode: "insensitive"
      }
    },
    select: {
      id: true,
      nik: true,
      nama: true,
      tglLahir: true
    },
    take: 5
  });

  return results;

}

/**
 * Cari lansia berdasarkan NIK (partial match)
 * Sesuaikan: prisma.lansia → nama model di schema kamu
 * Sesuaikan: nik, nama, tanggalLahir → nama field di schema kamu
 */
export async function searchLansiaByNik(nik) {
  if (!nik || nik.length < 3) return [];

  const results = await prisma.lansia.findMany({
    where: {
      nik: {
        contains: nik,
        mode: "insensitive",
      },
    },
    select: {
      id: true,
      nik: true,
      nama: true,          // sesuaikan nama field
      tanggalLahir: true,  // sesuaikan nama field, atau hapus jika tidak ada
    },
    take: 5,
  });

  return results;
}


/*
LOGIN USER
*/

export async function login(data) {

  const user = await prisma.user.findUnique({
    where: {
      username: data.username
    }
  });

  if (!user) {
    throw new Error("Username tidak ditemukan");
  }

  const validPassword = await bcrypt.compare(
    data.password,
    user.password
  );

  if (!validPassword) {
    throw new Error("Password salah");
  }

  return {
    id: user.id,
    username: user.username,
    role: user.role,
    balitaId: user.balitaId,
    lansiaId: user.lansiaId
  };
}


/*
SEARCH BALITA + LANSIA
*/

export async function searchPendudukByNik(nik) {

  if (!nik || nik.length < 3) return [];

  const balita = await prisma.balita.findMany({
    where: {
      nik: {
        contains: nik,
        mode: "insensitive"
      }
    },
    select: {
      id: true,
      nik: true,
      nama: true
    },
    take: 5
  });

  const lansia = await prisma.lansia.findMany({
    where: {
      nik: {
        contains: nik,
        mode: "insensitive"
      }
    },
    select: {
      id: true,
      nik: true,
      nama: true
    },
    take: 5
  });

  return [
    ...balita.map((b) => ({
      ...b,
      tipe: "balita"
    })),
    ...lansia.map((l) => ({
      ...l,
      tipe: "lansia"
    }))
  ];

}