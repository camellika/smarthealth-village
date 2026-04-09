"use server";

import { generateToken, verifyToken } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getToken } from "@/utils/cookie";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// ============================================================
// Role yang berlaku di sistem ini:
//   "admin"     → Kader/Petugas  → redirect /admin
//   "perangkat" → Perangkat Desa → redirect /dashboard
//   "user"      → Warga          → redirect /warga
// ============================================================

/*
LOGIN USER
*/
export async function login(data) {
  const user = await prisma.user.findUnique({
    where: { username: data.username },
  });
  console.log(user)

  if (!user) {
    throw new Error("Username tidak ditemukan");
  }

  const validPassword = await bcrypt.compare(data.password, user.password);

  if (!validPassword) {
    throw new Error("Password salah");
  }

  const token = generateToken({ id: user.id, name: user.username, rol: user.role, balitaId: user.balitaId, lansiaId: user.lansiaId });
  const cookieStore = await cookies()

  cookieStore.set('token', token, {
    httpOnly: true,
    secure: true,     // 🔥 WAJIB di production
    sameSite: 'lax',  // 🔥 penting
    path: '/',
  })

  return {
    id: user.id,
    username: user.username,
    role: user.role,      // "admin" | "perangkat" | "user"
    balitaId: user.balitaId,
    lansiaId: user.lansiaId,
    token
  };
}

/*
LOGOUT PERINTAH
*/
export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('token');

  redirect('/login');
}

export async function getCurrentUser() {
  const token = await getToken()
  console.log(token)
  if (!token) return null

  const payload = verifyToken(token)
  return payload
}

/*
REGISTER USER BARU
- Digunakan saat mendaftarkan warga baru
- Role default: "user"
*/
export async function register(data) {
  const existingUser = await prisma.user.findUnique({
    where: { username: data.username },
  });

  if (existingUser) {
    throw new Error("Username sudah digunakan");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      username: data.username,
      password: hashedPassword,
      // Hanya izinkan role yang valid, default ke "user"
      role: ["admin", "perangkat", "user"].includes(data.role)
        ? data.role
        : "user",
      balitaId: data.balitaId ? Number(data.balitaId) : null,
      lansiaId: data.lansiaId ? Number(data.lansiaId) : null,
    },
  });

  return {
    id: user.id,
    username: user.username,
    role: user.role,
  };
}

/*
REGISTER USER — versi simpel (tanpa cek duplikat)
Digunakan dari dalam kode server yang sudah punya validasi sendiri
*/
export async function registerUser(data) {
  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      username: data.username,
      password: hashedPassword,
      role: data.role || "user",
      balitaId: data.balitaId || null,
      lansiaId: data.lansiaId || null,
    },
  });

  return user;
}

/*
CARI BALITA BERDASARKAN NIK (partial match)
*/
export async function searchBalitaByNik(nik) {
  if (!nik || nik.length < 3) return [];

  return await prisma.balita.findMany({
    where: {
      nik: { contains: nik, mode: "insensitive" },
    },
    select: { id: true, nik: true, nama: true, tglLahir: true },
    take: 5,
  });
}

/*
CARI LANSIA BERDASARKAN NIK (partial match)
*/
export async function searchLansiaByNik(nik) {
  if (!nik || nik.length < 3) return [];

  return await prisma.lansia.findMany({
    where: {
      nik: { contains: nik, mode: "insensitive" },
    },
    select: { id: true, nik: true, nama: true },
    take: 5,
  });
}

/*
CARI BALITA + LANSIA SEKALIGUS
*/
export async function searchPendudukByNik(nik) {
  if (!nik || nik.length < 3) return [];

  const [balita, lansia] = await Promise.all([
    prisma.balita.findMany({
      where: { nik: { contains: nik, mode: "insensitive" } },
      select: { id: true, nik: true, nama: true },
      take: 5,
    }),
    prisma.lansia.findMany({
      where: { nik: { contains: nik, mode: "insensitive" } },
      select: { id: true, nik: true, nama: true },
      take: 5,
    }),
  ]);

  return [
    ...balita.map((b) => ({ ...b, tipe: "balita" })),
    ...lansia.map((l) => ({ ...l, tipe: "lansia" })),
  ];
}