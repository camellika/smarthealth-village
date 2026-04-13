"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  HeartPulse, LayoutDashboard, Baby, FileText,
  CalendarDays, LogOut, Bell, Users, Menu, X
} from "lucide-react";
import { logout, getCurrentUser } from "@/services/authService";

const NAV_ITEMS = [
  { href: "/admin",            label: "Dashboard",    icon: LayoutDashboard, exact: true },
  { href: "/admin/balita",     label: "Balita",       icon: Baby },
  { href: "/admin/lansia",     label: "Lansia",       icon: Users },
  { href: "/admin/penjadwalan",label: "Penjadwalan",  icon: CalendarDays },
  { href: "/admin/laporan",    label: "Laporan",      icon: FileText },
];

export default function AdminLayout({ children }) {
  const path   = usePathname();
  const router = useRouter();
  const [user, setUser]           = useState(null);
  const [checked, setChecked]     = useState(false);
  const [sidebarOpen, setSidebar] = useState(false);

  useEffect(() => {
    getCurrentUser().then((u) => {
      if (!u || u.rol !== "admin") router.replace("/login");
      else { setUser(u); setChecked(true); }
    });
  }, []);

  // Tutup sidebar otomatis saat pindah halaman
  useEffect(() => { setSidebar(false); }, [path]);

  const handleLogout = async () => { await logout(); };

  if (!checked) return null;

  const pageTitle = NAV_ITEMS.find(n =>
    n.exact ? path === n.href : (path === n.href || path.startsWith(n.href + "/"))
  )?.label ?? "Modul Balita & Lansia";

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#f5f7f4", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background:#b5ceba; border-radius:3px; }
        @keyframes slide-up  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fade-in   { from{opacity:0} to{opacity:1} }
        @keyframes spin      { to{transform:rotate(360deg)} }
        @keyframes slideInL  { from{transform:translateX(-100%)} to{transform:translateX(0)} }

        /* ── NAV LINKS ── */
        .nav-link { display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:12px;font-size:14px;font-weight:600;text-decoration:none;color:#6b7c6b;transition:all 0.18s;border:none;background:none;width:100%;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif; }
        .nav-link:hover  { background:#e8f5ed; color:#2d7a4f; }
        .nav-link.active { background:#2d7a4f; color:#fff; box-shadow:0 4px 14px rgba(45,122,79,0.28); }

        /* ── SIDEBAR ── */
        .sidebar {
          width: 232px;
          background: #fff;
          border-right: 1px solid #e4ede6;
          display: flex;
          flex-direction: column;
          padding: 0 12px;
          position: sticky;
          top: 0;
          height: 100vh;
          flex-shrink: 0;
          z-index: 40;
          overflow-y: auto;
          transition: transform 0.3s cubic-bezier(0.16,1,0.3,1);
        }

        /* ── OVERLAY ── */
        .sidebar-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.4);
          z-index: 39;
          backdrop-filter: blur(2px);
          animation: fade-in 0.2s ease;
        }

        /* ── HAMBURGER ── */
        .hamburger-btn {
          display: none;
          align-items: center;
          justify-content: center;
          background: #f5f7f4;
          border: 1px solid #e4ede6;
          border-radius: 10px;
          padding: 7px 9px;
          cursor: pointer;
          transition: background 0.18s;
        }
        .hamburger-btn:hover { background: #e8f5ed; }

        /* ── GLOBAL UTILITIES ── */
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

        /* ── GRID RESPONSIF ── */
        .grid-responsive-4 { display:grid;grid-template-columns:repeat(4,1fr);gap:14px; }
        .grid-responsive-3 { display:grid;grid-template-columns:repeat(3,1fr);gap:14px; }
        .grid-responsive-2 { display:grid;grid-template-columns:repeat(2,1fr);gap:14px; }
        .table-wrapper { width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch; }
        .hide-mobile { display:table-cell; }
        .table-header-wrap { display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap; }
        .table-action-wrap { display:flex;gap:8px;align-items:center; }

        /* ── RESPONSIVE BREAKPOINTS ── */
        @media (max-width: 1024px) {
          .grid-responsive-4 { grid-template-columns: repeat(2,1fr); }
          .grid-responsive-3 { grid-template-columns: repeat(2,1fr); }
        }

        @media (max-width: 768px) {
          /* Sidebar jadi drawer */
          .sidebar {
            position: fixed;
            top: 0; left: 0; bottom: 0;
            transform: translateX(-100%);
            box-shadow: 4px 0 24px rgba(0,0,0,0.12);
            animation: none;
          }
          .sidebar.open {
            transform: translateX(0);
            animation: slideInL 0.3s cubic-bezier(0.16,1,0.3,1);
          }
          .sidebar-overlay.show { display: block; }

          /* Hamburger muncul */
          .hamburger-btn { display: flex; }

          /* Konten utama full width */
          .main-content { padding: 16px !important; }

          /* Grid */
          .grid-responsive-4 { grid-template-columns: 1fr; }
          .grid-responsive-3 { grid-template-columns: 1fr; }
          .grid-responsive-2 { grid-template-columns: 1fr; }

          /* Tabel */
          .hide-mobile { display: none !important; }
          .table-header-wrap { flex-direction: column; align-items: stretch; }
          .table-action-wrap { flex-direction: column; }
          .table-action-wrap button { width:100%; justify-content:center; }
          .search-inp { width: 100% !important; }
        }
      `}</style>

      {/* ── OVERLAY (klik untuk tutup sidebar) ── */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? "show" : ""}`}
        onClick={() => setSidebar(false)}
      />

      {/* ══ SIDEBAR ══ */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>

        {/* Logo + tombol tutup (mobile) */}
        <div style={{ padding: "18px 6px 16px", borderBottom: "1px solid #f0f6f2", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ background: "#2d7a4f", borderRadius: 9, padding: "6px 7px", display: "flex" }}>
              <HeartPulse size={16} color="white" />
            </div>
            <div>
              <p style={{ fontWeight: 800, fontSize: 13, color: "#1f2d1f", lineHeight: 1.2 }}>
                SmartHealth<span style={{ color: "#2d7a4f" }}>Village</span>
              </p>
              <p style={{ fontSize: 10, color: "#9aab9a" }}>Modul Balita & Lansia</p>
            </div>
          </div>
          {/* Tombol X hanya di mobile */}
          <button
            onClick={() => setSidebar(false)}
            style={{ background: "#f5f7f4", border: "1px solid #e4ede6", borderRadius: 8, padding: "5px 6px", cursor: "pointer", display: "flex" }}
            className="hamburger-btn"
          >
            <X size={15} color="#6b7c6b" />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
            const active = exact
              ? path === href
              : path === href || path.startsWith(href + "/");
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
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#2d7a4f,#3a9e6e)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
              {user?.name?.slice(0, 2).toUpperCase() ?? "AD"}
            </div>
            <div style={{ overflow: "hidden" }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#1f2d1f", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user?.name ?? "Admin"}
              </p>
              <p style={{ fontSize: 10, color: "#9aab9a" }}>Desa Panembangan</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "#fee2e2", color: "#dc2626", border: "1px solid #fecaca", padding: "7px 12px", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer", width: "100%", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            <LogOut size={13} /> Keluar
          </button>
        </div>
      </aside>

      {/* ══ PAGE CONTENT ══ */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto", minWidth: 0 }}>

        {/* Top bar */}
        <header style={{ background: "#fff", borderBottom: "1px solid #e4ede6", padding: "0 20px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 30, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Tombol hamburger — hanya muncul di mobile via CSS */}
            <button
              className="hamburger-btn"
              onClick={() => setSidebar(true)}
            >
              <Menu size={16} color="#6b7c6b" />
            </button>
            <p style={{ fontSize: 15, fontWeight: 800, color: "#1f2d1f" }}>{pageTitle}</p>
          </div>
          <button style={{ background: "#f5f7f4", border: "1px solid #e4ede6", borderRadius: 10, padding: "7px 9px", cursor: "pointer", display: "flex" }}>
            <Bell size={15} color="#6b7c6b" />
          </button>
        </header>

        <main className="main-content" style={{ flex: 1, padding: "24px 28px 48px", animation: "slide-up 0.45s ease both" }}>
          {children}
        </main>
      </div>
    </div>
  );
}