"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  HeartPulse, LayoutDashboard, Baby, FileText,
  CalendarDays, LogOut, Bell, Users
} from "lucide-react";
import { logout, getCurrentUser } from "@/services/authService";

const NAV_BALITA = [
  { href: "/admin/balita/data",    label: "Data Balita",    icon: Baby },
  { href: "/admin/balita/posyandu",label: "Posyandu & Jadwal", icon: CalendarDays },
];

const NAV_LANSIA = [
  { href: "/admin/lansia/data",    label: "Data Lansia",    icon: Users },
  { href: "/admin/lansia/posyandu",label: "Penjadwalan",    icon: CalendarDays },
];

const NAV_LAPORAN = [
  { href: "/admin/laporan", label: "Laporan", icon: FileText },
];

export default function AdminLayout({ children }) {
  const path   = usePathname();
  const router = useRouter();
  const [user, setUser]       = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    getCurrentUser().then((u) => {
      if (!u || u.rol !== "admin") {
        router.replace("/login");
      } else {
        setUser(u);
        setChecked(true);
      }
    });
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  if (!checked) return null;

  return (
    <div className="admin-shell">

      {/* ══ SIDEBAR ══ */}
      <aside className="sidebar">

        {/* Logo */}
        <div className="sidebar-logo">
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div className="sidebar-logo-icon">
              <HeartPulse size={16} color="white" />
            </div>
            <div>
              <p className="sidebar-logo-title">
                SmartHealth<span style={{ color: "#2d7a4f" }}>Village</span>
              </p>
              <p className="sidebar-logo-sub">Modul Balita & Lansia</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">

          <Link href="/admin" className={`nav-link ${path === "/admin" ? "active" : ""}`}>
            <LayoutDashboard size={16} /> Dashboard
          </Link>

          <Link href="/admin/balita" className={`nav-link ${path === "/admin/balita" || path.startsWith("/admin/balita/") ? "active" : ""}`}>
            <Baby size={16} /> Balita
          </Link>

          <Link href="/admin/lansia" className={`nav-link ${path === "/admin/lansia" || path.startsWith("/admin/lansia/") ? "active" : ""}`}>
            <Users size={16} /> Lansia
          </Link>

          <Link href="/admin/penjadwalan" className={`nav-link ${path === "/admin/penjadwalan" || path.startsWith("/admin/penjadwalan/") ? "active" : ""}`}>
            <CalendarDays size={16} /> Penjadwalan
          </Link>

          {NAV_LAPORAN.map(({ href, label, icon: Icon }) => {
            const active = path === href || path.startsWith(href + "/");
            return (
              <Link key={href} href={href} className={`nav-link ${active ? "active" : ""}`}>
                <Icon size={16} /> {label}
              </Link>
            );
          })}

        </nav>

        {/* User + logout */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {user?.name?.slice(0, 2).toUpperCase() ?? "AD"}
            </div>
            <div>
              <p className="sidebar-user-name">{user?.name ?? "Admin"}</p>
              <p className="sidebar-user-sub">Desa Panembangan</p>
            </div>
          </div>
          <button className="btn-danger" onClick={handleLogout}>
            <LogOut size={13} /> Keluar
          </button>
        </div>
      </aside>

      {/* ══ PAGE CONTENT ══ */}
      <div className="main-content">

        {/* Top bar */}
        <header className="topbar">
          <div>
            <p className="topbar-title">
              {path === "/admin"
                ? "Dashboard Utama"
                : [...NAV_BALITA, ...NAV_LANSIA, ...NAV_LAPORAN]
                    .slice()
                    .reverse()
                    .find(n => path === n.href || path.startsWith(n.href + "/"))
                    ?.label ?? "Modul Balita & Lansia"
              }
            </p>
          </div>
          <button className="topbar-bell">
            <Bell size={15} color="#6b7c6b" />
          </button>
        </header>

        <main className="main-body">
          {children}
        </main>
      </div>
    </div>
  );
}