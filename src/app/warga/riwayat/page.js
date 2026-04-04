"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/services/authService";
import {
  Baby, Search, Calendar, Scale, Ruler,
  Activity, TrendingUp, TrendingDown, Minus,
  ChevronDown, ChevronUp, FileText, AlertTriangle,
  CheckCircle, Clock, Filter, Heart, Droplets
} from "lucide-react";
import { getPosyanduBalitaByUser } from "@/services/balitaService";
import { getPosyanduLansiaByUser } from "@/services/lansiaService";


/* ══════════════════════════════════════════
   HELPERS
══════════════════════════════════════════ */
const formatDisplay = (d) => {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("id-ID", {
    day: "2-digit", month: "long", year: "numeric",
  });
};

const formatShort = (d) => {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
  });
};

const hitungUsia = (tgl) => {
  if (!tgl) return "-";
  const diff  = Date.now() - new Date(tgl).getTime();
  const bulan = Math.floor(diff / (1000 * 60 * 60 * 24 * 30.44));
  if (bulan < 12) return `${bulan} bulan`;
  return `${Math.floor(bulan / 12)} tahun ${bulan % 12} bulan`;
};

const getStatusBB = (bb, tglLahir) => {
  if (!bb || !tglLahir) return null;
  const bulan = Math.floor(
    (Date.now() - new Date(tglLahir).getTime()) / (1000 * 60 * 60 * 24 * 30.44)
  );
  const median = bulan <= 12 ? 9 : bulan <= 24 ? 12 : bulan <= 36 ? 14 : bulan <= 48 ? 16 : 18;
  if (bb < median * 0.8) return "buruk";
  if (bb < median * 0.9) return "kurang";
  return "normal";
};1

const getStatusTensi = (tensi) => {
  if (!tensi) return null;
  if (tensi >= 140) return "tinggi";
  if (tensi < 90)   return "rendah";
  return "normal";
};

const statusBalitaConfig = {
  normal: { label: "Normal",     color: "#2d7a4f", bg: "#e8f5ed", border: "#b8ddc5", icon: CheckCircle },
  kurang: { label: "BB Kurang",  color: "#d97706", bg: "#fef3c7", border: "#fde68a", icon: AlertTriangle },
  buruk:  { label: "Gizi Buruk", color: "#dc2626", bg: "#fee2e2", border: "#fecaca", icon: AlertTriangle },
};

const statusLansiaConfig = {
  normal: { label: "Tensi Normal", color: "#2d7a4f", bg: "#e8f5ed", border: "#b8ddc5", icon: CheckCircle },
  tinggi: { label: "Tensi Tinggi", color: "#dc2626", bg: "#fee2e2", border: "#fecaca", icon: AlertTriangle },
  rendah: { label: "Tensi Rendah", color: "#d97706", bg: "#fef3c7", border: "#fde68a", icon: AlertTriangle },
};

/* ── Trend Badge ── */
function TrendBadge({ current, previous, unit }) {
  if (!previous || !current) return <span style={{ color: "#b5ceba", fontSize: 11 }}>—</span>;
  const diff = (current - previous).toFixed(1);
  if (diff > 0) return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 2, color: "#2d7a4f", fontSize: 11, fontWeight: 700 }}>
      <TrendingUp size={10} /> +{diff} {unit}
    </span>
  );
  if (diff < 0) return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 2, color: "#dc2626", fontSize: 11, fontWeight: 700 }}>
      <TrendingDown size={10} /> {diff} {unit}
    </span>
  );
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 2, color: "#9aab9a", fontSize: 11 }}>
      <Minus size={10} /> Tetap
    </span>
  );
}

/* ══════════════════════════════════════════
   FLAT ROW — BALITA (satu baris, tanpa expand)
══════════════════════════════════════════ */
function FlatRowBalita({ rec, prev, tglLahir, index }) {
  const status     = getStatusBB(rec.bb, tglLahir);
  const cfg        = status ? statusBalitaConfig[status] : null;
  const StatusIcon = cfg?.icon ?? CheckCircle;

  return (
    <tr
      style={{ borderBottom: "1px solid #f0f6f2", background: index % 2 === 0 ? "#fff" : "#fafcfa", transition: "background 0.15s" }}
      onMouseEnter={e => { e.currentTarget.style.background = "#f4faf6"; }}
      onMouseLeave={e => { e.currentTarget.style.background = index % 2 === 0 ? "#fff" : "#fafcfa"; }}
    >
      <td style={{ padding: "12px 16px", color: "#b5ceba", fontSize: 12, fontWeight: 600 }}>{index + 1}</td>

      <td style={{ padding: "12px 16px" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#e8f5ed", color: "#2d7a4f", padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
          <Activity size={11} /> {rec.kegiatan || "-"}
        </span>
      </td>

      <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#6b7c6b", fontSize: 13 }}>
          <Calendar size={12} color="#b5ceba" /> {formatShort(rec.tanggal)}
        </div>
      </td>

      <td style={{ padding: "12px 16px" }}>
        <span style={{ fontSize: 14, fontWeight: 800, color: cfg?.color ?? "#1f2d1f" }}>
          {rec.bb ?? "—"}{rec.bb && <span style={{ fontSize: 11, fontWeight: 500, color: "#9aab9a" }}> kg</span>}
        </span>
        <div style={{ marginTop: 2 }}><TrendBadge current={rec.bb} previous={prev?.bb} unit="kg" /></div>
      </td>

      <td style={{ padding: "12px 16px" }}>
        <span style={{ fontSize: 14, fontWeight: 800, color: "#1f2d1f" }}>
          {rec.tb ?? "—"}{rec.tb && <span style={{ fontSize: 11, fontWeight: 500, color: "#9aab9a" }}> cm</span>}
        </span>
        <div style={{ marginTop: 2 }}><TrendBadge current={rec.tb} previous={prev?.tb} unit="cm" /></div>
      </td>

      <td style={{ padding: "12px 16px", color: "#6b7c6b", fontSize: 13 }}>
        {rec.lingkarKepala ? <>{rec.lingkarKepala}<span style={{ color: "#9aab9a", fontSize: 11 }}> cm</span></> : <span style={{ color: "#d1dbd2" }}>—</span>}
      </td>

      <td style={{ padding: "12px 16px", color: "#6b7c6b", fontSize: 13 }}>
        {rec.lingkarLengan ? <>{rec.lingkarLengan}<span style={{ color: "#9aab9a", fontSize: 11 }}> cm</span></> : <span style={{ color: "#d1dbd2" }}>—</span>}
      </td>

      <td style={{ padding: "12px 16px", color: "#6b7c6b", fontSize: 13, whiteSpace: "nowrap" }}>
        {formatDisplay(rec.tanggal)}
      </td>

      <td style={{ padding: "12px 16px" }}>
        {cfg ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>
            <StatusIcon size={11} /> {cfg.label}
          </span>
        ) : <span style={{ color: "#d1dbd2", fontSize: 12 }}>—</span>}
      </td>

      <td style={{ padding: "12px 16px", maxWidth: 180 }}>
        {rec.catatan
          ? <span style={{ fontSize: 12, color: "#6b7c6b", background: "#f8fbf9", borderRadius: 6, padding: "3px 8px", border: "1px solid #e4ede6", display: "inline-block", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{rec.catatan}</span>
          : <span style={{ color: "#d1dbd2", fontSize: 12 }}>—</span>}
      </td>
    </tr>
  );
}

/* ══════════════════════════════════════════
   FLAT ROW — LANSIA (satu baris, tanpa expand)
══════════════════════════════════════════ */
function FlatRowLansia({ rec, prev, index }) {
  const status     = getStatusTensi(rec.tensi);
  const cfg        = status ? statusLansiaConfig[status] : null;
  const StatusIcon = cfg?.icon ?? CheckCircle;

  return (
    <tr
      style={{ borderBottom: "1px solid #f0f6f2", background: index % 2 === 0 ? "#fff" : "#fafcfa", transition: "background 0.15s" }}
      onMouseEnter={e => { e.currentTarget.style.background = "#f8f4ff"; }}
      onMouseLeave={e => { e.currentTarget.style.background = index % 2 === 0 ? "#fff" : "#fafcfa"; }}
    >
      <td style={{ padding: "12px 16px", color: "#b5ceba", fontSize: 12, fontWeight: 600 }}>{index + 1}</td>

      <td style={{ padding: "12px 16px" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#fdf0ff", color: "#7c3aed", padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
          <Activity size={11} /> {rec.kegiatan || "-"}
        </span>
      </td>

      <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#6b7c6b", fontSize: 13 }}>
          <Calendar size={12} color="#b5ceba" /> {formatShort(rec.tanggal)}
        </div>
      </td>

      <td style={{ padding: "12px 16px" }}>
        <span style={{ fontSize: 14, fontWeight: 800, color: "#1f2d1f" }}>
          {rec.bb ?? "—"}{rec.bb && <span style={{ fontSize: 11, fontWeight: 500, color: "#9aab9a" }}> kg</span>}
        </span>
        <div style={{ marginTop: 2 }}><TrendBadge current={rec.bb} previous={prev?.bb} unit="kg" /></div>
      </td>

      <td style={{ padding: "12px 16px" }}>
        <span style={{ fontSize: 14, fontWeight: 800, color: "#1f2d1f" }}>
          {rec.tb ?? "—"}{rec.tb && <span style={{ fontSize: 11, fontWeight: 500, color: "#9aab9a" }}> cm</span>}
        </span>
        <div style={{ marginTop: 2 }}><TrendBadge current={rec.tb} previous={prev?.tb} unit="cm" /></div>
      </td>

      <td style={{ padding: "12px 16px", color: "#6b7c6b", fontSize: 13 }}>
        {rec.lingkarPerut ? <>{rec.lingkarPerut}<span style={{ color: "#9aab9a", fontSize: 11 }}> cm</span></> : <span style={{ color: "#d1dbd2" }}>—</span>}
      </td>

      <td style={{ padding: "12px 16px" }}>
        <span style={{ fontSize: 14, fontWeight: 800, color: cfg?.color ?? "#1f2d1f" }}>
          {rec.tensi ?? "—"}{rec.tensi && <span style={{ fontSize: 11, fontWeight: 500, color: "#9aab9a" }}> mmHg</span>}
        </span>
        <div style={{ marginTop: 2 }}><TrendBadge current={rec.tensi} previous={prev?.tensi} unit="mmHg" /></div>
      </td>

      <td style={{ padding: "12px 16px", color: "#6b7c6b", fontSize: 13 }}>
        {rec.gulaDarah ? <>{rec.gulaDarah}<span style={{ color: "#9aab9a", fontSize: 11 }}> mg/dL</span></> : <span style={{ color: "#d1dbd2" }}>—</span>}
      </td>

      <td style={{ padding: "12px 16px", color: "#6b7c6b", fontSize: 13, whiteSpace: "nowrap" }}>
        {formatDisplay(rec.tanggal)}
      </td>

      <td style={{ padding: "12px 16px" }}>
        {cfg ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>
            <StatusIcon size={11} /> {cfg.label}
          </span>
        ) : <span style={{ color: "#d1dbd2", fontSize: 12 }}>—</span>}
      </td>
    </tr>
  );
}

/* ══════════════════════════════════════════
   HALAMAN UTAMA
══════════════════════════════════════════ */
export default function RiwayatPemeriksaanPage() {
  const router = useRouter();

  const [user, setUser]                 = useState(null);
  const [authChecked, setAuthChecked]   = useState(false);
  const [riwayat, setRiwayat]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");
  const [sortAsc, setSortAsc]           = useState(false);
  const [mode, setMode]                 = useState(null); // "balita" | "lansia"

  /* ══ AUTH GUARD ══════════════════════════
     Cek sesi login terlebih dahulu.
     Jika tidak ada user → redirect ke /login.
     Halaman tidak akan dirender sampai auth selesai.
  ════════════════════════════════════════ */
  useEffect(() => {
    async function checkAuth() {
      try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
          // Belum login → arahkan ke halaman login
          router.replace("/login");
          return;
        }

        setUser(currentUser);
        setAuthChecked(true);

        // Auth OK → fetch data riwayat
        try {
          if (currentUser.balitaId) {
            setMode("balita");
            const data = await getPosyanduBalitaByUser(currentUser.balitaId);
            setRiwayat(data.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal)));
          } else if (currentUser.lansiaId) {
            setMode("lansia");
            const data = await getPosyanduLansiaByUser(currentUser.lansiaId);
            setRiwayat(data.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal)));
          }
        } catch (err) {
          console.error("Gagal memuat data riwayat:", err);
        } finally {
          setLoading(false);
        }
      } catch (err) {
        // Error saat cek auth → paksa ke halaman login
        console.error("Auth error:", err);
        router.replace("/login");
      }
    }

    checkAuth();
  }, [router]);

  /* ── Loading screen saat auth belum selesai ── */
  if (!authChecked) {
    return (
      <div style={{
        minHeight: "60vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 14,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        <div style={{
          width: 28, height: 28,
          border: "3px solid #e4ede6", borderTopColor: "#2d7a4f",
          borderRadius: "50%", animation: "spin 0.7s linear infinite",
        }} />
        <p style={{ color: "#9aab9a", fontSize: 13, fontWeight: 500 }}>
          Memeriksa sesi login…
        </p>
      </div>
    );
  }

  /* ── Derived values ── */
  const latest  = riwayat[0] ?? null;
  const subject = mode === "balita" ? latest?.balita : latest?.lansia;

  const sortedRiwayat = [...riwayat].sort((a, b) =>
    sortAsc
      ? new Date(a.tanggal) - new Date(b.tanggal)
      : new Date(b.tanggal) - new Date(a.tanggal)
  );

  const filtered = sortedRiwayat.filter(r => {
    const matchSearch = search
      ? (r.kegiatan ?? "").toLowerCase().includes(search.toLowerCase())
      : true;
    let matchStatus = true;
    if (filterStatus !== "semua") {
      matchStatus = mode === "balita"
        ? getStatusBB(r.bb, subject?.tglLahir) === filterStatus
        : getStatusTensi(r.tensi) === filterStatus;
    }
    return matchSearch && matchStatus;
  });

  const bbTerakhir    = latest?.bb        ?? null;
  const tbTerakhir    = latest?.tb        ?? null;
  const tensiTerakhir = latest?.tensi     ?? null;
  const gulaTerakhir  = latest?.gulaDarah ?? null;
  const tglTerakhir   = latest?.tanggal   ?? null;
  const prev          = riwayat[1]        ?? null;

  const statusTerakhir = mode === "balita"
    ? getStatusBB(bbTerakhir, subject?.tglLahir)
    : getStatusTensi(tensiTerakhir);
  const statusConfig = mode === "balita" ? statusBalitaConfig : statusLansiaConfig;

  const statCards = mode === "balita" ? [
    { icon: FileText, label: "Total Kunjungan",   value: riwayat.length,                          sub: "Pemeriksaan tercatat",                              accent: "#2d7a4f", bg: "#e8f5ed" },
    { icon: Scale,    label: "BB Terakhir",        value: bbTerakhir ? `${bbTerakhir} kg` : "—",  sub: prev?.bb ? `Sebelumnya ${prev.bb} kg` : "Belum ada data", accent: statusTerakhir === "normal" ? "#2d7a4f" : statusTerakhir === "kurang" ? "#d97706" : "#dc2626", bg: statusTerakhir === "normal" ? "#e8f5ed" : statusTerakhir === "kurang" ? "#fef3c7" : "#fee2e2" },
    { icon: Ruler,    label: "TB Terakhir",        value: tbTerakhir ? `${tbTerakhir} cm` : "—",  sub: prev?.tb ? `Sebelumnya ${prev.tb} cm` : "Belum ada data", accent: "#0284c7", bg: "#e0f2fe" },
    { icon: Clock,    label: "Kunjungan Terakhir", value: tglTerakhir ? formatShort(tglTerakhir) : "—", sub: latest?.kegiatan ?? "Belum pernah periksa",   accent: "#7c3aed", bg: "#f3f0ff" },
  ] : [
    { icon: FileText, label: "Total Kunjungan",       value: riwayat.length,                                sub: "Pemeriksaan tercatat",                                   accent: "#7c3aed", bg: "#f3f0ff" },
    { icon: Heart,    label: "Tensi Terakhir",         value: tensiTerakhir ? `${tensiTerakhir} mmHg` : "—", sub: prev?.tensi ? `Sebelumnya ${prev.tensi} mmHg` : "Belum ada data", accent: statusTerakhir === "normal" ? "#2d7a4f" : statusTerakhir === "tinggi" ? "#dc2626" : "#d97706", bg: statusTerakhir === "normal" ? "#e8f5ed" : statusTerakhir === "tinggi" ? "#fee2e2" : "#fef3c7" },
    { icon: Droplets, label: "Gula Darah Terakhir",   value: gulaTerakhir ? `${gulaTerakhir} mg/dL` : "—",  sub: prev?.gulaDarah ? `Sebelumnya ${prev.gulaDarah} mg/dL` : "Belum ada data", accent: "#d97706", bg: "#fef3c7" },
    { icon: Clock,    label: "Kunjungan Terakhir",     value: tglTerakhir ? formatShort(tglTerakhir) : "—", sub: latest?.kegiatan ?? "Belum pernah periksa",               accent: "#0284c7", bg: "#e0f2fe" },
  ];

  const filterOptions = mode === "balita" ? [
    { value: "semua",  label: "Semua Status" },
    { value: "normal", label: "Normal" },
    { value: "kurang", label: "BB Kurang" },
    { value: "buruk",  label: "Gizi Buruk" },
  ] : [
    { value: "semua",  label: "Semua Status" },
    { value: "normal", label: "Tensi Normal" },
    { value: "tinggi", label: "Tensi Tinggi" },
    { value: "rendah", label: "Tensi Rendah" },
  ];

  /* Header kolom — semua kolom tampil langsung dalam satu baris */
  const tableHeaders = mode === "balita"
    ? ["No", "Kegiatan", "Tanggal", "Berat Badan", "Tinggi Badan", "Lingkar Kepala", "Lingkar Lengan", "Tanggal Lengkap", "Status", "Catatan"]
    : ["No", "Kegiatan", "Tanggal", "Berat Badan", "Tinggi Badan", "Lingkar Perut", "Tensi", "Gula Darah", "Tanggal Lengkap", "Status"];

  const accentColor = mode === "lansia" ? "#7c3aed" : "#2d7a4f";
  const accentBg    = mode === "lansia" ? "#f3f0ff" : "#e8f5ed";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, fontFamily: "'Plus Jakarta Sans',sans-serif", color: "#1f2d1f" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes spin   { to { transform: rotate(360deg) } }
        @keyframes fadeUp { from { opacity:0;transform:translateY(12px) } to { opacity:1;transform:translateY(0) } }
        .rw-search { border:1.5px solid #e4ede6;border-radius:10px;padding:8px 12px 8px 36px;font-size:13px;font-family:'Plus Jakarta Sans',sans-serif;color:#1f2d1f;background:#fff;outline:none;width:220px;transition:border-color 0.2s; }
        .rw-search:focus { border-color:${accentColor}; }
        .rw-search::placeholder { color:#b5ceba; }
        .rw-select { border:1.5px solid #e4ede6;border-radius:10px;padding:8px 12px;font-size:13px;font-family:'Plus Jakarta Sans',sans-serif;color:#1f2d1f;background:#fff;outline:none;cursor:pointer;transition:border-color 0.2s; }
        .rw-select:focus { border-color:${accentColor}; }
        .stat-card { background:#fff;border:1px solid #e4ede6;border-radius:14px;padding:16px 18px;box-shadow:0 2px 8px rgba(0,0,0,0.04);display:flex;align-items:center;gap:14px;position:relative;overflow:hidden;animation:fadeUp 0.35s ease; }
        .card { background:#fff;border:1px solid #e4ede6;border-radius:16px;box-shadow:0 2px 8px rgba(0,0,0,0.04); }
      `}</style>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ background: accentBg, borderRadius: 14, padding: 13 }}>
          <FileText size={22} color={accentColor} />
        </div>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "#1f2d1f", margin: 0 }}>
            Riwayat Pemeriksaan
            {mode && (
              <span style={{ marginLeft: 10, fontSize: 13, fontWeight: 600, background: accentBg, color: accentColor, padding: "3px 10px", borderRadius: 8, verticalAlign: "middle" }}>
                {mode === "balita" ? "Balita" : "Lansia"}
              </span>
            )}
          </h1>
          <p style={{ fontSize: 13, color: "#9aab9a", marginTop: 3 }}>
            {subject
              ? `${subject.nama} · ${hitungUsia(subject.tglLahir)}`
              : loading ? "Memuat data…" : "—"}
          </p>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      {!loading && mode && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 13 }}>
          {statCards.map(({ icon: Icon, label, value, sub, accent, bg }) => (
            <div key={label} className="stat-card">
              <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: accent, borderRadius: "14px 0 0 14px" }} />
              <div style={{ background: bg, borderRadius: 10, padding: 9, flexShrink: 0 }}>
                <Icon size={18} color={accent} />
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ color: "#9aab9a", fontSize: 11, fontWeight: 600 }}>{label}</p>
                <p style={{ fontSize: 20, fontWeight: 800, color: "#1f2d1f", letterSpacing: -0.5, marginTop: 2 }}>{value}</p>
                <p style={{ color: "#b5ceba", fontSize: 11, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sub}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Table Card ── */}
      <div className="card" style={{ overflow: "hidden" }}>

        {/* Toolbar */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #f0f6f2", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#1f2d1f" }}>Riwayat Pemeriksaan</p>
            <p style={{ fontSize: 12, color: "#9aab9a", marginTop: 2 }}>
              {filtered.length} dari {riwayat.length} catatan pemeriksaan
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ position: "relative" }}>
              <Search size={14} color="#9aab9a" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              <input className="rw-search" placeholder="Cari kegiatan…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            {mode && (
              <div style={{ position: "relative" }}>
                <Filter size={13} color="#9aab9a" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <select className="rw-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ paddingLeft: 30 }}>
                  {filterOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
            )}
            <button
              onClick={() => setSortAsc(s => !s)}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#f8fbf9", border: "1.5px solid #e4ede6", borderRadius: 10, padding: "8px 13px", fontSize: 13, fontWeight: 600, color: "#6b7c6b", cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif" }}
            >
              <Calendar size={13} />
              {sortAsc ? "Terlama" : "Terbaru"}
              {sortAsc ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          </div>
        </div>

        {/* Table — horizontal scroll untuk kolom banyak */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f8fbf9" }}>
                {tableHeaders.map(h => (
                  <th key={h} style={{ padding: "11px 16px", textAlign: "left", borderBottom: "1px solid #e4ede6", fontSize: 11, fontWeight: 700, color: "#9aab9a", whiteSpace: "nowrap", letterSpacing: 0.3 }}>
                    {h.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={10} style={{ padding: "56px", textAlign: "center" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 24, height: 24, border: "3px solid #e4ede6", borderTopColor: accentColor, borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                    <p style={{ color: "#9aab9a", fontSize: 13, fontWeight: 500 }}>Memuat riwayat pemeriksaan…</p>
                  </div>
                </td></tr>
              )}

              {!loading && !user?.balitaId && !user?.lansiaId && (
                <tr><td colSpan={10} style={{ padding: "56px", textAlign: "center" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                    <div style={{ background: "#fee2e2", borderRadius: "50%", padding: 18 }}><AlertTriangle size={28} color="#dc2626" /></div>
                    <p style={{ color: "#1f2d1f", fontSize: 14, fontWeight: 700 }}>Akun tidak terhubung ke data balita atau lansia</p>
                    <p style={{ color: "#9aab9a", fontSize: 13 }}>Hubungi admin untuk menghubungkan akun Anda.</p>
                  </div>
                </td></tr>
              )}

              {!loading && mode && riwayat.length === 0 && (
                <tr><td colSpan={10} style={{ padding: "56px", textAlign: "center" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                    <div style={{ background: accentBg, borderRadius: "50%", padding: 18 }}>
                      {mode === "balita" ? <Baby size={28} color="#b5ceba" /> : <Heart size={28} color="#b5ceba" />}
                    </div>
                    <p style={{ color: "#9aab9a", fontSize: 14, fontWeight: 500 }}>Belum ada riwayat pemeriksaan</p>
                  </div>
                </td></tr>
              )}

              {!loading && riwayat.length > 0 && filtered.length === 0 && (
                <tr><td colSpan={10} style={{ padding: "36px", textAlign: "center", color: "#9aab9a", fontSize: 13 }}>
                  Tidak ada data yang sesuai filter.
                </td></tr>
              )}

              {/* ── Flat data rows ── */}
              {!loading && filtered.map((rec, i) => {
                const allSorted = [...riwayat].sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));
                const idx       = allSorted.findIndex(r => r.id === rec.id);
                const prevRec   = idx > 0 ? allSorted[idx - 1] : null;

                return mode === "balita" ? (
                  <FlatRowBalita key={rec.id} rec={rec} prev={prevRec} tglLahir={subject?.tglLahir} index={i} />
                ) : (
                  <FlatRowLansia key={rec.id} rec={rec} prev={prevRec} index={i} />
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        {!loading && filtered.length > 0 && (
          <div style={{ padding: "11px 20px", borderTop: "1px solid #f0f6f2", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ color: "#9aab9a", fontSize: 12 }}>
              Menampilkan {filtered.length} dari {riwayat.length} pemeriksaan
            </p>
            {statusTerakhir && statusConfig[statusTerakhir] && (
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700,
                color: statusConfig[statusTerakhir].color,
                background: statusConfig[statusTerakhir].bg,
                border: `1px solid ${statusConfig[statusTerakhir].border}`,
                padding: "4px 11px", borderRadius: 8,
              }}>
                Status terkini: {statusConfig[statusTerakhir].label}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}