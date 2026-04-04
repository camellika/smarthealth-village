import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

// Route yang membutuhkan autentikasi beserta role yang diizinkan
const PROTECTED_ROUTES = [
  { path: "/admin",     roles: ["admin"] },
  { path: "/perangkat", roles: ["perangkat"] },
  { path: "/warga",     roles: ["user"] },
];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Cari apakah route ini perlu proteksi
  const matched = PROTECTED_ROUTES.find(({ path }) =>
    pathname === path || pathname.startsWith(path + "/")
  );

  // Route tidak perlu proteksi → lanjutkan
  if (!matched) return NextResponse.next();

  // Ambil token dari cookie
  const token = request.cookies.get("token")?.value;

  // Tidak ada token → redirect ke login
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname); // opsional: simpan halaman asal
    return NextResponse.redirect(loginUrl);
  }

  // Verifikasi token
  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    // Token tidak valid / expired → hapus cookie lama & redirect login
    const loginUrl = new URL("/login", request.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("token");
    return response;
  }

  // Cek role cocok
  if (!matched.roles.includes(payload.rol)) {
    // Login tapi role salah → redirect ke halaman yang sesuai role-nya
    const roleRedirect = {
      admin:     "/admin",
      perangkat: "/perangkat",
      user:      "/warga/riwayat",
    };
    const dest = roleRedirect[payload.rol] ?? "/login";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  // ✅ Token valid & role cocok → lanjutkan
  return NextResponse.next();
}

export const config = {
  // Middleware hanya berjalan pada route berikut (bukan _next, api, dsb)
  matcher: [
    "/admin/:path*",
    "/perangkat/:path*",
    "/warga/:path*",
  ],
};