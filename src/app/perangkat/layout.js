"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HeartPulse, LayoutDashboard, Baby, FileText,
  CalendarDays, LogOut, Bell, ChevronLeft, Users
} from "lucide-react";
import { logout } from "@/services/authService";


const NAV_LAPORAN = [
  { href: "/perangkat/laporan", label: "Laporan", icon: FileText },
];

const handleClick = async () => {
  await logout()
}

export default function PerangkatLayout({ children }) {
  const path = usePathname();

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#f5f7f4", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-thumb { background:#b5ceba; border-radius:3px; }
        @keyframes slide-up { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fade-in  { from{opacity:0} to{opacity:1} }
        @keyframes spin     { to{transform:rotate(360deg)} }

        .nav-link { display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:12px;font-size:14px;font-weight:600;text-decoration:none;color:#6b7c6b;transition:all 0.18s;border:none;background:none;width:100%;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif; }
        .nav-link:hover  { background:#e8f5ed; color:#2d7a4f; }
        .nav-link.active { background:#2d7a4f; color:#fff; box-shadow:0 4px 14px rgba(45,122,79,0.28); }

        .card { background:#fff; border:1px solid #e4ede6; border-radius:16px; box-shadow:0 2px 8px rgba(0,0,0,0.04); }
        .btn-primary { display:inline-flex;align-items:center;gap:7px;background:#2d7a4f;color:#fff;border:none;padding:10px 18px;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;transition:all 0.2s;box-shadow:0 4px 14px rgba(45,122,79,0.28); }
        .btn-primary:hover { background:#246240;transform:translateY(-1px); }
        .btn-outline { display:inline-flex;align-items:center;gap:7px;background:#fff;color:#2d7a4f;border:1.5px solid #b8ddc5;padding:9px 16px;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;transition:all 0.2s; }
        .btn-outline:hover { background:#e8f5ed; }
        .btn-danger { display:inline-flex;align-items:center;gap:6px;background:#fee2e2;color:#dc2626;border:1px solid #fecaca;padding:7px 12px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;transition:all 0.18s; }
        .btn-danger:hover { background:#fecaca; }

        .input-field { width:100%;border:1.5px solid #e4ede6;border-radius:10px;padding:10px 12px 10px 38px;font-size:14px;font-family:'Plus Jakarta Sans',sans-serif;color:#1f2d1f;background:#fff;outline:none;transition:border-color 0.2s,box-shadow 0.2s; }
        .input-field:focus { border-color:#2d7a4f;box-shadow:0 0 0 3px rgba(45,122,79,0.1); }
        .input-field::placeholder { color:#b5ceba; }
        .input-field.error { border-color:#dc2626; }
        .input-bare { width:100%;border:1.5px solid #e4ede6;border-radius:10px;padding:10px 12px;font-size:14px;font-family:'Plus Jakarta Sans',sans-serif;color:#1f2d1f;background:#fff;outline:none;transition:border-color 0.2s,box-shadow 0.2s; }
        .input-bare:focus { border-color:#2d7a4f;box-shadow:0 0 0 3px rgba(45,122,79,0.1); }
        .input-bare::placeholder { color:#b5ceba; }
        .input-bare.error { border-color:#dc2626; }
        .textarea-bare { width:100%;border:1.5px solid #e4ede6;border-radius:10px;padding:10px 12px;font-size:14px;font-family:'Plus Jakarta Sans',sans-serif;color:#1f2d1f;background:#fff;outline:none;resize:vertical;min-height:72px;transition:border-color 0.2s,box-shadow 0.2s; }
        .textarea-bare:focus { border-color:#2d7a4f;box-shadow:0 0 0 3px rgba(45,122,79,0.1); }
        .label { display:block;font-size:13px;font-weight:700;color:#3d5542;margin-bottom:6px; }
        .search-inp { border:1.5px solid #e4ede6;border-radius:10px;padding:8px 12px 8px 36px;font-size:13px;font-family:'Plus Jakarta Sans',sans-serif;color:#1f2d1f;background:#fff;outline:none;width:260px;transition:border-color 0.2s; }
        .search-inp:focus { border-color:#2d7a4f; }
        .search-inp::placeholder { color:#9aab9a; }
        .th-btn { background:none;border:none;cursor:pointer;display:flex;align-items:center;gap:4px;font-size:12px;font-weight:700;color:#9aab9a;font-family:'Plus Jakarta Sans',sans-serif;padding:0;white-space:nowrap; }
        .th-btn:hover { color:#4a7a5a; }
        .tr-row { border-bottom:1px solid #f0f6f2;transition:background 0.15s; }
        .tr-row:last-child { border-bottom:none; }
        .tr-row:hover { background:#f8fbf9; }
        .section-title { font-size:15px;font-weight:700;color:#1f2d1f; }
        .section-sub   { font-size:12px;color:#9aab9a;margin-top:2px; }
        .badge-green  { background:#e8f5ed;color:#2d7a4f;font-size:11px;font-weight:700;padding:3px 10px;border-radius:50px; }
        .badge-red    { background:#fee2e2;color:#dc2626;font-size:11px;font-weight:700;padding:3px 10px;border-radius:50px; }
        .badge-yellow { background:#fef3c7;color:#d97706;font-size:11px;font-weight:700;padding:3px 10px;border-radius:50px; }
        .badge-pink   { background:#fce7f3;color:#be185d;font-size:11px;font-weight:700;padding:3px 10px;border-radius:50px; }
      `}</style>

      {/* ══ SIDEBAR ══ */}
      <aside style={{ width: 232, background: "#fff", borderRight: "1px solid #e4ede6", display: "flex", flexDirection: "column", padding: "0 12px", position: "sticky", top: 0, height: "100vh", flexShrink: 0, zIndex: 40, overflowY: "auto" }}>

        {/* Logo */}
        <div style={{ padding: "18px 6px 16px", borderBottom: "1px solid #f0f6f2", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
            <div style={{ background: "#2d7a4f", borderRadius: 9, padding: "6px 7px", display: "flex" }}>
              <HeartPulse size={16} color="white" />
            </div>
            <div>
              <p style={{ fontWeight: 800, fontSize: 13, color: "#1f2d1f", lineHeight: 1.2 }}>SmartHealth<span style={{ color: "#2d7a4f" }}>Village</span></p>
              
            </div>
          </div>
          <Link href="/perangkat" style={{ display: "flex", alignItems: "center", gap: 6, color: "#9aab9a", fontSize: 12, fontWeight: 600, textDecoration: "none", padding: "5px 8px", borderRadius: 8, transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#2d7a4f"; e.currentTarget.style.background = "#f0f6f2"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#9aab9a"; e.currentTarget.style.background = ""; }}
          >

          </Link>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>

          {/* — Dashboard — */}

          <Link
            href="/perangkat"
            className={`nav-link ${path === "/perangkat" ? "active" : ""}`}
          >
            <LayoutDashboard size={16} /> Dashboard
          </Link>

          



          {/* — Laporan Section — */}
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
        <div style={{ borderTop: "1px solid #f0f6f2", padding: "12px 6px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#2d7a4f,#3a9e6e)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff", flexShrink: 0 }}>AD</div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#1f2d1f" }}>Admin Desa</p>
              <p style={{ fontSize: 10, color: "#9aab9a" }}>Desa Ceria</p>
            </div>
          </div>
          <button
            onClick={() => handleClick()}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "#fee2e2", color: "#dc2626", border: "1px solid #fecaca", padding: "7px 12px", borderRadius: 9, fontSize: 13, fontWeight: 600, textDecoration: "none", transition: "background 0.18s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#fecaca"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#fee2e2"; }}
          >
            <LogOut size={13} /> Keluar
          </button>
        </div>
      </aside>

      {/* ══ PAGE CONTENT ══ */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto" }}>

        {/* Top bar */}
        <header style={{ background: "#fff", borderBottom: "1px solid #e4ede6", padding: "0 28px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 30, flexShrink: 0 }}>
          <div>
            <p style={{ fontSize: 15, fontWeight: 800, color: "#1f2d1f" }}>
              {path === "/perangkat"
                ? "Dashboard Utama"
                : [...NAV_LAPORAN]
                  .slice()
                  .reverse()
                  .find(n => path === n.href || path.startsWith(n.href + "/"))
                  ?.label ?? "Laporan Posyandu Balita & Lansia"
              }
            </p>
          </div>
          <button style={{ background: "#f5f7f4", border: "1px solid #e4ede6", borderRadius: 10, padding: "7px 9px", cursor: "pointer", display: "flex", position: "relative" }}>
            <Bell size={15} color="#6b7c6b" />
          </button>
        </header>

        <main style={{ flex: 1, padding: "24px 28px 48px", animation: "slide-up 0.45s ease both" }}>
          {children}
        </main>
      </div>
    </div>
  );
}