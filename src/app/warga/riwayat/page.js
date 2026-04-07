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
   TABEL Z-SCORE WHO TB/U (0–60 bulan)
   Sumber: WHO Child Growth Standards 2006
══════════════════════════════════════════ */
const WHO_TB_LAKI = [
  [0,49.9,46.1,44.2],[1,54.7,50.8,48.9],[2,58.4,54.4,52.4],[3,61.4,57.3,55.3],
  [4,63.9,59.7,57.6],[5,65.9,61.7,59.6],[6,67.6,63.3,61.2],[7,69.2,64.8,62.7],
  [8,70.6,66.2,64.0],[9,72.0,67.5,65.2],[10,73.3,68.7,66.4],[11,74.5,69.9,67.6],
  [12,75.7,71.0,68.6],[13,76.9,72.1,69.6],[14,78.0,73.1,70.6],[15,79.1,74.1,71.6],
  [16,80.2,75.0,72.5],[17,81.2,75.9,73.4],[18,82.3,76.9,74.2],[19,83.2,77.7,75.0],
  [20,84.2,78.6,75.9],[21,85.1,79.4,76.7],[22,86.0,80.2,77.4],[23,86.9,81.0,78.2],
  [24,87.8,81.7,78.8],[25,88.7,82.6,79.6],[26,89.6,83.4,80.4],[27,90.4,84.2,81.1],
  [28,91.2,84.9,81.8],[29,92.0,85.7,82.6],[30,92.9,86.5,83.3],[31,93.7,87.2,84.0],
  [32,94.4,87.9,84.7],[33,95.2,88.6,85.4],[34,96.0,89.3,86.0],[35,96.7,90.0,86.7],
  [36,97.4,90.7,87.3],[37,98.2,91.4,88.0],[38,98.9,92.0,88.6],[39,99.6,92.7,89.2],
  [40,100.3,93.3,89.8],[41,101.0,93.9,90.4],[42,101.7,94.5,91.0],[43,102.4,95.1,91.6],
  [44,103.1,95.7,92.2],[45,103.8,96.3,92.8],[46,104.4,96.9,93.3],[47,105.1,97.5,93.9],
  [48,105.7,98.1,94.4],[49,106.4,98.7,95.0],[50,107.0,99.3,95.5],[51,107.6,99.8,96.0],
  [52,108.2,100.4,96.6],[53,108.9,101.0,97.1],[54,109.5,101.5,97.6],[55,110.1,102.1,98.1],
  [56,110.7,102.6,98.6],[57,111.3,103.1,99.2],[58,111.9,103.7,99.7],[59,112.5,104.2,100.2],
  [60,113.0,104.7,100.7],
];

const WHO_TB_PEREMPUAN = [
  [0,49.1,45.4,43.6],[1,53.7,49.8,47.8],[2,57.1,53.0,51.0],[3,59.8,55.6,53.5],
  [4,62.1,57.8,55.6],[5,64.0,59.6,57.4],[6,65.7,61.2,59.0],[7,67.3,62.7,60.5],
  [8,68.7,64.0,61.7],[9,70.1,65.3,63.0],[10,71.5,66.5,64.2],[11,72.8,67.7,65.4],
  [12,74.0,68.9,66.5],[13,75.2,70.0,67.6],[14,76.4,71.1,68.7],[15,77.5,72.1,69.7],
  [16,78.6,73.1,70.7],[17,79.7,74.1,71.7],[18,80.7,75.1,72.6],[19,81.7,76.0,73.5],
  [20,82.7,76.9,74.4],[21,83.7,77.8,75.2],[22,84.6,78.7,76.1],[23,85.5,79.6,77.0],
  [24,86.4,80.3,77.7],[25,87.4,81.3,78.6],[26,88.3,82.1,79.4],[27,89.1,82.9,80.2],
  [28,90.0,83.8,81.0],[29,90.8,84.5,81.8],[30,91.6,85.3,82.5],[31,92.4,86.1,83.3],
  [32,93.2,86.8,84.0],[33,94.0,87.5,84.7],[34,94.7,88.2,85.4],[35,95.4,88.9,86.0],
  [36,96.1,89.6,86.7],[37,96.9,90.3,87.3],[38,97.6,91.0,87.9],[39,98.3,91.7,88.5],
  [40,99.0,92.3,89.2],[41,99.7,92.9,89.8],[42,100.3,93.5,90.3],[43,101.0,94.2,90.9],
  [44,101.6,94.8,91.5],[45,102.3,95.4,92.1],[46,102.9,96.0,92.6],[47,103.5,96.6,93.2],
  [48,104.1,97.2,93.8],[49,104.8,97.7,94.3],[50,105.4,98.3,94.8],[51,106.0,98.8,95.4],
  [52,106.5,99.4,95.9],[53,107.1,100.0,96.4],[54,107.7,100.5,97.0],[55,108.3,101.0,97.5],
  [56,108.8,101.6,98.0],[57,109.4,102.1,98.5],[58,110.0,102.6,99.0],[59,110.5,103.1,99.5],
  [60,111.0,103.7,100.0],
];

/* ══════════════════════════════════════════
   FUNGSI HITUNG Z-SCORE & STATUS STUNTING
   Metode: WHO TB/U (Tinggi Badan per Umur)
══════════════════════════════════════════ */
function hitungStatusStunting(tb, usiaBulan, jenisKelamin) {
  if (!tb || usiaBulan === null || usiaBulan === undefined || usiaBulan < 0 || usiaBulan > 60) return null;

  const tabel = jenisKelamin === "Perempuan" ? WHO_TB_PEREMPUAN : WHO_TB_LAKI;
  const bulan = Math.min(Math.round(usiaBulan), 60);
  const row   = tabel.find(r => r[0] === bulan);
  if (!row) return null;

  const [, median, sd2, sd3] = row;
  const sd     = median - sd2;
  const zScore = sd > 0 ? (tb - median) / sd : 0;

  let status, label, color, bg, icon;
  if (zScore < -3) {
    status = "severely_stunting";
    label  = "Severely Stunting";
    color  = "#dc2626";
    bg     = "#fee2e2";
    icon   = "🔴";
  } else if (zScore < -2) {
    status = "stunting";
    label  = "Stunting";
    color  = "#d97706";
    bg     = "#fef3c7";
    icon   = "🟡";
  } else {
    status = "normal";
    label  = "Normal";
    color  = "#2d7a4f";
    bg     = "#e8f5ed";
    icon   = "🟢";
  }

  return { zScore: zScore.toFixed(2), status, label, color, bg, icon, median, sd2, sd3 };
}


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

const hitungUsiaBulanPadaTanggal = (tglLahir, tglPeriksa) => {
  if (!tglLahir || !tglPeriksa) return null;
  return Math.floor(
    (new Date(tglPeriksa) - new Date(tglLahir)) / (1000 * 60 * 60 * 24 * 30.44)
  );
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
};

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
   FLAT ROW — BALITA
   Kolom: No, Kegiatan, Tanggal, BB, TB,
          Lingkar Kepala, Lingkar Lengan,
          Tanggal Lengkap, Status Gizi,
          Status Stunting, Catatan
══════════════════════════════════════════ */
function FlatRowBalita({ rec, prev, tglLahir, jenisKelamin, index }) {
  const status     = getStatusBB(rec.bb, tglLahir);
  const cfg        = status ? statusBalitaConfig[status] : null;
  const StatusIcon = cfg?.icon ?? CheckCircle;

  // Usia balita dalam bulan PADA SAAT tanggal pemeriksaan
  const usiaBulan  = hitungUsiaBulanPadaTanggal(tglLahir, rec.tanggal);

  // Status Stunting (TB/U WHO)
  const stunting   = hitungStatusStunting(rec.tb, usiaBulan, jenisKelamin);

  return (
    <tr
      style={{
        borderBottom: "1px solid #f0f6f2",
        background: index % 2 === 0 ? "#fff" : "#fafcfa",
        transition: "background 0.15s",
      }}
      onMouseEnter={e => { e.currentTarget.style.background = "#f4faf6"; }}
      onMouseLeave={e => { e.currentTarget.style.background = index % 2 === 0 ? "#fff" : "#fafcfa"; }}
    >
      {/* No */}
      <td style={{ padding: "12px 16px", color: "#b5ceba", fontSize: 12, fontWeight: 600 }}>{index + 1}</td>

      {/* Kegiatan */}
      <td style={{ padding: "12px 16px" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#e8f5ed", color: "#2d7a4f", padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
          <Activity size={11} /> {rec.kegiatan || "-"}
        </span>
      </td>

      {/* Tanggal (short) */}
      <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#6b7c6b", fontSize: 13 }}>
          <Calendar size={12} color="#b5ceba" /> {formatShort(rec.tanggal)}
        </div>
      </td>

      {/* Berat Badan */}
      <td style={{ padding: "12px 16px" }}>
        <span style={{ fontSize: 14, fontWeight: 800, color: cfg?.color ?? "#1f2d1f" }}>
          {rec.bb ?? "—"}{rec.bb && <span style={{ fontSize: 11, fontWeight: 500, color: "#9aab9a" }}> kg</span>}
        </span>
        <div style={{ marginTop: 2 }}><TrendBadge current={rec.bb} previous={prev?.bb} unit="kg" /></div>
      </td>

      {/* Tinggi Badan */}
      <td style={{ padding: "12px 16px" }}>
        <span style={{ fontSize: 14, fontWeight: 800, color: "#1f2d1f" }}>
          {rec.tb ?? "—"}{rec.tb && <span style={{ fontSize: 11, fontWeight: 500, color: "#9aab9a" }}> cm</span>}
        </span>
        <div style={{ marginTop: 2 }}><TrendBadge current={rec.tb} previous={prev?.tb} unit="cm" /></div>
      </td>

      {/* Lingkar Kepala */}
      <td style={{ padding: "12px 16px", color: "#6b7c6b", fontSize: 13 }}>
        {rec.lingkarKepala
          ? <>{rec.lingkarKepala}<span style={{ color: "#9aab9a", fontSize: 11 }}> cm</span></>
          : <span style={{ color: "#d1dbd2" }}>—</span>}
      </td>

      {/* Lingkar Lengan */}
      <td style={{ padding: "12px 16px", color: "#6b7c6b", fontSize: 13 }}>
        {rec.lingkarLengan
          ? <>{rec.lingkarLengan}<span style={{ color: "#9aab9a", fontSize: 11 }}> cm</span></>
          : <span style={{ color: "#d1dbd2" }}>—</span>}
      </td>

      {/* Tanggal Lengkap */}
      <td style={{ padding: "12px 16px", color: "#6b7c6b", fontSize: 13, whiteSpace: "nowrap" }}>
        {formatDisplay(rec.tanggal)}
      </td>

      {/* Status Gizi (BB/U) */}
      <td style={{ padding: "12px 16px" }}>
        {cfg ? (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            background: cfg.bg, color: cfg.color,
            border: `1px solid ${cfg.border}`,
            padding: "4px 10px", borderRadius: 8,
            fontSize: 12, fontWeight: 700, whiteSpace: "nowrap",
          }}>
            <StatusIcon size={11} /> {cfg.label}
          </span>
        ) : <span style={{ color: "#d1dbd2", fontSize: 12 }}>—</span>}
      </td>

      {/* Status Stunting (TB/U WHO) ← KOLOM BARU */}
      <td style={{ padding: "12px 16px" }}>
        {stunting ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              background: stunting.bg, color: stunting.color,
              border: `1px solid ${stunting.color}33`,
              padding: "4px 10px", borderRadius: 8,
              fontSize: 12, fontWeight: 700, whiteSpace: "nowrap",
            }}>
              {stunting.icon} {stunting.label}
            </span>
            <span style={{ fontSize: 10, color: "#9aab9a", paddingLeft: 2 }}>
              Z-Score: {stunting.zScore}
            </span>
          </div>
        ) : (
          <span style={{ color: "#d1dbd2", fontSize: 12 }}>—</span>
        )}
      </td>

      {/* Catatan */}
      <td style={{ padding: "12px 16px", maxWidth: 180 }}>
        {rec.catatan
          ? <span style={{
              fontSize: 12, color: "#6b7c6b",
              background: "#f8fbf9", borderRadius: 6,
              padding: "3px 8px", border: "1px solid #e4ede6",
              display: "inline-block", maxWidth: 160,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>{rec.catatan}</span>
          : <span style={{ color: "#d1dbd2", fontSize: 12 }}>—</span>}
      </td>
    </tr>
  );
}


/* ══════════════════════════════════════════
   FLAT ROW — LANSIA
══════════════════════════════════════════ */
function FlatRowLansia({ rec, prev, index }) {
  const status     = getStatusTensi(rec.tensi);
  const cfg        = status ? statusLansiaConfig[status] : null;
  const StatusIcon = cfg?.icon ?? CheckCircle;

  return (
    <tr
      style={{
        borderBottom: "1px solid #f0f6f2",
        background: index % 2 === 0 ? "#fff" : "#fafcfa",
        transition: "background 0.15s",
      }}
      onMouseEnter={e => { e.currentTarget.style.background = "#f8f4ff"; }}
      onMouseLeave={e => { e.currentTarget.style.background = index % 2 === 0 ? "#fff" : "#fafcfa"; }}
    >
      {/* No */}
      <td style={{ padding: "12px 16px", color: "#b5ceba", fontSize: 12, fontWeight: 600 }}>{index + 1}</td>

      {/* Kegiatan */}
      <td style={{ padding: "12px 16px" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#fdf0ff", color: "#7c3aed", padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
          <Activity size={11} /> {rec.kegiatan || "-"}
        </span>
      </td>

      {/* Tanggal (short) */}
      <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#6b7c6b", fontSize: 13 }}>
          <Calendar size={12} color="#b5ceba" /> {formatShort(rec.tanggal)}
        </div>
      </td>

      {/* Berat Badan */}
      <td style={{ padding: "12px 16px" }}>
        <span style={{ fontSize: 14, fontWeight: 800, color: "#1f2d1f" }}>
          {rec.bb ?? "—"}{rec.bb && <span style={{ fontSize: 11, fontWeight: 500, color: "#9aab9a" }}> kg</span>}
        </span>
        <div style={{ marginTop: 2 }}><TrendBadge current={rec.bb} previous={prev?.bb} unit="kg" /></div>
      </td>

      {/* Tinggi Badan */}
      <td style={{ padding: "12px 16px" }}>
        <span style={{ fontSize: 14, fontWeight: 800, color: "#1f2d1f" }}>
          {rec.tb ?? "—"}{rec.tb && <span style={{ fontSize: 11, fontWeight: 500, color: "#9aab9a" }}> cm</span>}
        </span>
        <div style={{ marginTop: 2 }}><TrendBadge current={rec.tb} previous={prev?.tb} unit="cm" /></div>
      </td>

      {/* Lingkar Perut */}
      <td style={{ padding: "12px 16px", color: "#6b7c6b", fontSize: 13 }}>
        {rec.lingkarPerut
          ? <>{rec.lingkarPerut}<span style={{ color: "#9aab9a", fontSize: 11 }}> cm</span></>
          : <span style={{ color: "#d1dbd2" }}>—</span>}
      </td>

      {/* Tensi */}
      <td style={{ padding: "12px 16px" }}>
        <span style={{ fontSize: 14, fontWeight: 800, color: cfg?.color ?? "#1f2d1f" }}>
          {rec.tensi ?? "—"}{rec.tensi && <span style={{ fontSize: 11, fontWeight: 500, color: "#9aab9a" }}> mmHg</span>}
        </span>
        <div style={{ marginTop: 2 }}><TrendBadge current={rec.tensi} previous={prev?.tensi} unit="mmHg" /></div>
      </td>

      {/* Gula Darah */}
      <td style={{ padding: "12px 16px", color: "#6b7c6b", fontSize: 13 }}>
        {rec.gulaDarah
          ? <>{rec.gulaDarah}<span style={{ color: "#9aab9a", fontSize: 11 }}> mg/dL</span></>
          : <span style={{ color: "#d1dbd2" }}>—</span>}
      </td>

      {/* Tanggal Lengkap */}
      <td style={{ padding: "12px 16px", color: "#6b7c6b", fontSize: 13, whiteSpace: "nowrap" }}>
        {formatDisplay(rec.tanggal)}
      </td>

      {/* Status Tensi */}
      <td style={{ padding: "12px 16px" }}>
        {cfg ? (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            background: cfg.bg, color: cfg.color,
            border: `1px solid ${cfg.border}`,
            padding: "4px 10px", borderRadius: 8,
            fontSize: 12, fontWeight: 700, whiteSpace: "nowrap",
          }}>
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

  /* ══ AUTH GUARD ══════════════════════════ */
  useEffect(() => {
    async function checkAuth() {
      try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
          router.replace("/login");
          return;
        }

        setUser(currentUser);
        setAuthChecked(true);

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
    {
      icon: FileText, label: "Total Kunjungan",
      value: riwayat.length, sub: "Pemeriksaan tercatat",
      accent: "#2d7a4f", bg: "#e8f5ed",
    },
    {
      icon: Scale, label: "BB Terakhir",
      value: bbTerakhir ? `${bbTerakhir} kg` : "—",
      sub: prev?.bb ? `Sebelumnya ${prev.bb} kg` : "Belum ada data",
      accent: statusTerakhir === "normal" ? "#2d7a4f" : statusTerakhir === "kurang" ? "#d97706" : "#dc2626",
      bg:     statusTerakhir === "normal" ? "#e8f5ed" : statusTerakhir === "kurang" ? "#fef3c7" : "#fee2e2",
    },
    {
      icon: Ruler, label: "TB Terakhir",
      value: tbTerakhir ? `${tbTerakhir} cm` : "—",
      sub: prev?.tb ? `Sebelumnya ${prev.tb} cm` : "Belum ada data",
      accent: "#0284c7", bg: "#e0f2fe",
    },
    {
      icon: Clock, label: "Kunjungan Terakhir",
      value: tglTerakhir ? formatShort(tglTerakhir) : "—",
      sub: latest?.kegiatan ?? "Belum pernah periksa",
      accent: "#7c3aed", bg: "#f3f0ff",
    },
  ] : [
    {
      icon: FileText, label: "Total Kunjungan",
      value: riwayat.length, sub: "Pemeriksaan tercatat",
      accent: "#7c3aed", bg: "#f3f0ff",
    },
    {
      icon: Heart, label: "Tensi Terakhir",
      value: tensiTerakhir ? `${tensiTerakhir} mmHg` : "—",
      sub: prev?.tensi ? `Sebelumnya ${prev.tensi} mmHg` : "Belum ada data",
      accent: statusTerakhir === "normal" ? "#2d7a4f" : statusTerakhir === "tinggi" ? "#dc2626" : "#d97706",
      bg:     statusTerakhir === "normal" ? "#e8f5ed" : statusTerakhir === "tinggi" ? "#fee2e2" : "#fef3c7",
    },
    {
      icon: Droplets, label: "Gula Darah Terakhir",
      value: gulaTerakhir ? `${gulaTerakhir} mg/dL` : "—",
      sub: prev?.gulaDarah ? `Sebelumnya ${prev.gulaDarah} mg/dL` : "Belum ada data",
      accent: "#d97706", bg: "#fef3c7",
    },
    {
      icon: Clock, label: "Kunjungan Terakhir",
      value: tglTerakhir ? formatShort(tglTerakhir) : "—",
      sub: latest?.kegiatan ?? "Belum pernah periksa",
      accent: "#0284c7", bg: "#e0f2fe",
    },
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

  // Balita: 11 kolom (tambah "Status Stunting")
  // Lansia: 10 kolom (tidak berubah)
  const tableHeaders = mode === "balita"
    ? ["No", "Kegiatan", "Tanggal", "Berat Badan", "Tinggi Badan",
       "Lingkar Kepala", "Lingkar Lengan", "Tanggal Lengkap",
       "Status Gizi", "Status Stunting", "Catatan"]
    : ["No", "Kegiatan", "Tanggal", "Berat Badan", "Tinggi Badan",
       "Lingkar Perut", "Tensi", "Gula Darah", "Tanggal Lengkap", "Status"];

  const colSpanCount = tableHeaders.length;

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

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f8fbf9" }}>
                {tableHeaders.map(h => (
                  <th key={h} style={{
                    padding: "11px 16px", textAlign: "left",
                    borderBottom: "1px solid #e4ede6",
                    fontSize: 11, fontWeight: 700, color: "#9aab9a",
                    whiteSpace: "nowrap", letterSpacing: 0.3,
                  }}>
                    {h.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Loading */}
              {loading && (
                <tr><td colSpan={colSpanCount} style={{ padding: "56px", textAlign: "center" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 24, height: 24, border: "3px solid #e4ede6", borderTopColor: accentColor, borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                    <p style={{ color: "#9aab9a", fontSize: 13, fontWeight: 500 }}>Memuat riwayat pemeriksaan…</p>
                  </div>
                </td></tr>
              )}

              {/* Akun tidak terhubung */}
              {!loading && !user?.balitaId && !user?.lansiaId && (
                <tr><td colSpan={colSpanCount} style={{ padding: "56px", textAlign: "center" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                    <div style={{ background: "#fee2e2", borderRadius: "50%", padding: 18 }}><AlertTriangle size={28} color="#dc2626" /></div>
                    <p style={{ color: "#1f2d1f", fontSize: 14, fontWeight: 700 }}>Akun tidak terhubung ke data balita atau lansia</p>
                    <p style={{ color: "#9aab9a", fontSize: 13 }}>Hubungi admin untuk menghubungkan akun Anda.</p>
                  </div>
                </td></tr>
              )}

              {/* Belum ada riwayat */}
              {!loading && mode && riwayat.length === 0 && (
                <tr><td colSpan={colSpanCount} style={{ padding: "56px", textAlign: "center" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                    <div style={{ background: accentBg, borderRadius: "50%", padding: 18 }}>
                      {mode === "balita" ? <Baby size={28} color="#b5ceba" /> : <Heart size={28} color="#b5ceba" />}
                    </div>
                    <p style={{ color: "#9aab9a", fontSize: 14, fontWeight: 500 }}>Belum ada riwayat pemeriksaan</p>
                  </div>
                </td></tr>
              )}

              {/* Filter kosong */}
              {!loading && riwayat.length > 0 && filtered.length === 0 && (
                <tr><td colSpan={colSpanCount} style={{ padding: "36px", textAlign: "center", color: "#9aab9a", fontSize: 13 }}>
                  Tidak ada data yang sesuai filter.
                </td></tr>
              )}

              {/* ── Data rows ── */}
              {!loading && filtered.map((rec, i) => {
                const allSorted = [...riwayat].sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));
                const idx       = allSorted.findIndex(r => r.id === rec.id);
                const prevRec   = idx > 0 ? allSorted[idx - 1] : null;

                return mode === "balita" ? (
                  <FlatRowBalita
                    key={rec.id}
                    rec={rec}
                    prev={prevRec}
                    tglLahir={subject?.tglLahir}
                    jenisKelamin={subject?.jenisKelamin}
                    index={i}
                  />
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
                display: "inline-flex", alignItems: "center", gap: 5,
                fontSize: 12, fontWeight: 700,
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