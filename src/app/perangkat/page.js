"use client";

import { useEffect, useState } from "react";
import { getBalita } from "@/services/balitaService";
import { getLansia } from "@/services/lansiaService";
import { getPosyanduBalita } from "@/services/posyanduBalitaService";
import { getPosyanduLansia } from "@/services/posyanduLansiaService";
import { getJadwalTerdekat } from "@/services/penjadwalanService";
import {
  Baby, AlertTriangle, TrendingDown, CalendarDays, ArrowRight,
  Users, Heart, Activity, Droplets,
} from "lucide-react";
import Link from "next/link";
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Line,
} from "recharts";

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const BULAN = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];

/* ─────────────────────────────────────────────
   ANTHROPOMETRI HELPERS (WHO 2006)
───────────────────────────────────────────── */

/** Hitung umur dalam bulan dari tanggal lahir */
function umurBulan(tglLahir) {
  if (!tglLahir) return null;
  const lahir    = new Date(tglLahir);
  const sekarang = new Date();
  return (
    (sekarang.getFullYear() - lahir.getFullYear()) * 12 +
    (sekarang.getMonth() - lahir.getMonth())
  );
}

/**
 * Z-score BB/U (Weight-for-Age) WHO 2006.
 * [median, SD] per bulan — nilai approx.
 * Untuk produksi, ganti dengan tabel referensi lengkap atau library.
 */
function hitungZScoreBBU(bb, umur, jk) {
  if (bb == null || umur == null || umur < 0 || umur > 60) return null;

  const refL = [
    [3.35,0.42],[4.47,0.54],[5.57,0.63],[6.40,0.70],[7.00,0.75],
    [7.51,0.78],[7.93,0.81],[8.30,0.84],[8.61,0.86],[8.90,0.88],
    [9.17,0.90],[9.42,0.92],[9.66,0.94],[9.88,0.96],[10.09,0.98],
    [10.30,1.00],[10.51,1.02],[10.71,1.03],[10.90,1.05],[11.10,1.07],
    [11.30,1.09],[11.49,1.10],[11.69,1.12],[11.88,1.14],[12.08,1.16],
    [12.28,1.18],[12.48,1.19],[12.68,1.21],[12.88,1.23],[13.08,1.25],
    [13.28,1.27],[13.48,1.29],[13.68,1.30],[13.88,1.32],[14.08,1.34],
    [14.28,1.36],[14.48,1.38],[14.68,1.39],[14.88,1.41],[15.08,1.43],
    [15.28,1.45],[15.48,1.47],[15.68,1.49],[15.88,1.50],[16.08,1.52],
    [16.28,1.54],[16.48,1.56],[16.68,1.58],[16.88,1.60],[17.08,1.61],
    [17.28,1.63],[17.48,1.65],[17.68,1.67],[17.88,1.69],[18.08,1.71],
    [18.28,1.72],[18.48,1.74],[18.68,1.76],[18.88,1.78],[19.08,1.80],[19.28,1.82],
  ];
  const refP = [
    [3.23,0.39],[4.19,0.49],[5.14,0.58],[5.85,0.64],[6.43,0.68],
    [6.88,0.72],[7.25,0.74],[7.59,0.76],[7.89,0.79],[8.17,0.81],
    [8.42,0.83],[8.66,0.85],[8.89,0.87],[9.10,0.88],[9.30,0.90],
    [9.49,0.92],[9.67,0.94],[9.84,0.95],[10.01,0.97],[10.18,0.99],
    [10.34,1.00],[10.50,1.02],[10.65,1.04],[10.81,1.06],[10.96,1.07],
    [11.11,1.09],[11.26,1.11],[11.40,1.12],[11.55,1.14],[11.69,1.16],
    [11.84,1.17],[11.98,1.19],[12.12,1.21],[12.26,1.23],[12.41,1.24],
    [12.55,1.26],[12.69,1.28],[12.83,1.29],[12.97,1.31],[13.11,1.33],
    [13.26,1.34],[13.40,1.36],[13.54,1.38],[13.68,1.40],[13.82,1.41],
    [13.96,1.43],[14.10,1.45],[14.24,1.46],[14.38,1.48],[14.52,1.50],
    [14.66,1.52],[14.80,1.53],[14.94,1.55],[15.08,1.57],[15.22,1.58],
    [15.36,1.60],[15.50,1.62],[15.64,1.64],[15.77,1.65],[15.91,1.67],[16.05,1.69],
  ];

  const ref       = jk === "Perempuan" ? refP : refL;
  const [med, sd] = ref[Math.min(Math.floor(umur), ref.length - 1)];
  return parseFloat(((bb - med) / sd).toFixed(2));
}

/**
 * Z-score TB/U (Height-for-Age) WHO 2006 — approx.
 */
function hitungZScoreTBU(tb, umur, jk) {
  if (tb == null || umur == null || umur < 0 || umur > 60) return null;

  const medL = [
    49.9,54.7,58.4,61.4,63.9,65.9,67.6,69.2,70.6,72.0,73.3,74.5,75.7,
    76.9,78.0,79.1,80.2,81.2,82.3,83.2,84.2,85.1,86.0,86.9,87.8,88.7,
    89.6,90.4,91.2,92.1,92.9,93.7,94.4,95.2,95.9,96.7,97.4,98.2,98.9,
    99.6,100.3,101.0,101.7,102.4,103.1,103.8,104.4,105.1,105.7,106.4,
    107.0,107.7,108.3,108.9,109.5,110.1,110.7,111.3,111.9,112.5,113.1,
  ];
  const medP = [
    49.1,53.7,57.1,59.8,62.1,64.0,65.7,67.3,68.7,70.1,71.5,72.8,74.0,
    75.2,76.4,77.5,78.6,79.7,80.7,81.7,82.7,83.7,84.6,85.5,86.4,87.3,
    88.1,89.0,89.8,90.6,91.4,92.2,93.0,93.8,94.5,95.3,96.0,96.7,97.4,
    98.1,98.8,99.5,100.2,100.9,101.5,102.2,102.8,103.4,104.1,104.7,
    105.3,105.9,106.5,107.1,107.7,108.3,108.8,109.4,109.9,110.5,111.0,
  ];

  const sdApprox = umur < 12 ? 2.0 : umur < 24 ? 2.5 : 3.0;
  const med      = (jk === "Perempuan" ? medP : medL)[Math.min(Math.floor(umur), 60)];
  return parseFloat(((tb - med) / sdApprox).toFixed(2));
}

/* ─────────────────────────────────────────────
   SHARED UI COMPONENTS
───────────────────────────────────────────── */
const Spinner = ({ color = "#2d7a4f" }) => (
  <div style={{
    width: 16, height: 16, flexShrink: 0,
    border: "2px solid #e4ede6", borderTopColor: color,
    borderRadius: "50%", animation: "spin 0.7s linear infinite",
  }} />
);

const LoadingRow = ({ color, text = "Memuat data…" }) => (
  <div style={{ display:"flex", alignItems:"center", justifyContent:"center",
    height: 200, gap: 8, color: "#9aab9a" }}>
    <Spinner color={color} />{text}
  </div>
);

const EmptyState = ({ icon: Icon, text }) => (
  <div style={{ textAlign:"center", padding:"20px 0", color:"#9aab9a" }}>
    <Icon size={26} color="#dde8de" style={{ margin:"0 auto 8px", display:"block" }} />
    <p style={{ fontSize: 13, margin: 0 }}>{text}</p>
  </div>
);

const LegendDot = ({ color, label }) => (
  <div style={{ display:"flex", alignItems:"center", gap:5 }}>
    <div style={{ width:10, height:10, borderRadius:3, background:color }} />
    <span style={{ color:"#6b7c6b", fontSize:12 }}>{label}</span>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"#fff", border:"1px solid #dde8de", borderRadius:10,
      padding:"10px 14px", boxShadow:"0 4px 16px rgba(0,0,0,0.08)", fontSize:13 }}>
      <p style={{ color:"#9aab9a", fontSize:11, marginBottom:4, marginTop:0 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color:p.color, fontWeight:600, margin:0 }}>
          {p.name}: {p.value ?? "—"}
        </p>
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function DashboardPage() {
  const [balitaList,  setBalitaList]  = useState([]);
  const [lansiaList,  setLansiaList]  = useState([]);
  const [pemBalita,   setPemBalita]   = useState([]);
  const [pemLansia,   setPemLansia]   = useState([]);
  const [jadwalDekat, setJadwalDekat] = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([
      getBalita(),
      getLansia(),
      getPosyanduBalita(),
      getPosyanduLansia(),
      getJadwalTerdekat(),
    ])
      .then(([b, l, pb, pl, j]) => {
        setBalitaList(b);
        setLansiaList(l);
        setPemBalita(pb);
        setPemLansia(pl);
        setJadwalDekat(j);
      })
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();

  /* ══════════════════════════════════════════
     COMPUTED — BALITA
  ══════════════════════════════════════════ */

  /** Pemeriksaan terbaru per balita + z-score */
  const latestPemBalita = balitaList.map(b => {
    const riwayat = pemBalita
      .filter(p => p.balitaId === b.id && p.bb != null)
      .sort((a, z) => new Date(z.tanggal) - new Date(a.tanggal));
    if (!riwayat.length) return null;
    const pem  = riwayat[0];
    const umur = umurBulan(b.tanggalLahir);
    const jk   = b.jenisKelamin; // "Laki-laki" | "Perempuan"
    return {
      ...pem,
      umur, jk,
      zBBU: hitungZScoreBBU(pem.bb, umur, jk),
      zTBU: pem.tb ? hitungZScoreTBU(pem.tb, umur, jk) : null,
    };
  }).filter(Boolean);

  const totalBalita        = balitaList.length;
  const stuntingCount      = latestPemBalita.filter(p => p.zTBU !== null && p.zTBU < -2 && p.zTBU >= -3).length;
  const severelyStuntCount = latestPemBalita.filter(p => p.zTBU !== null && p.zTBU < -3).length;
  const baruBulanIni       = balitaList.filter(b => {
    const d = new Date(b.createdAt ?? b.tanggalDaftar ?? b.tanggalLahir);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const trendBB = BULAN.map((bulan, idx) => {
    const rows = pemBalita.filter(p => new Date(p.tanggal).getMonth() === idx && p.bb != null);
    const rata = rows.length
      ? parseFloat((rows.reduce((s, p) => s + p.bb, 0) / rows.length).toFixed(1))
      : null;
    return { bulan, rataRata: rata, normal: parseFloat((9.5 + idx * 0.22).toFixed(1)) };
  }).filter(d => d.rataRata !== null);

  const trendTB = BULAN.map((bulan, idx) => {
    const rows = pemBalita.filter(p => new Date(p.tanggal).getMonth() === idx && p.tb != null);
    const rata = rows.length
      ? parseFloat((rows.reduce((s, p) => s + p.tb, 0) / rows.length).toFixed(1))
      : null;
    return { bulan, rataRata: rata, normal: parseFloat((74 + idx * 1.5).toFixed(1)) };
  }).filter(d => d.rataRata !== null);

  const statusGiziData = (() => {
    let normal = 0, kurang = 0, buruk = 0, lebih = 0;
    latestPemBalita.forEach(p => {
      if (p.zBBU === null) return;
      if      (p.zBBU < -3) buruk++;
      else if (p.zBBU < -2) kurang++;
      else if (p.zBBU >  2) lebih++;
      else                   normal++;
    });
    return [
      { label:"Normal (≥ -2 SD)",           value:normal, color:"#2d7a4f", bg:"#e8f5ed" },
      { label:"Gizi Kurang (-3 s/d -2 SD)", value:kurang, color:"#d97706", bg:"#fef3c7" },
      { label:"Gizi Buruk (< -3 SD)",       value:buruk,  color:"#be185d", bg:"#fce7f3" },
      { label:"Gizi Lebih (> +2 SD)",       value:lebih,  color:"#0891b2", bg:"#ecfeff" },
    ];
  })();

  /* ══════════════════════════════════════════
     COMPUTED — LANSIA
  ══════════════════════════════════════════ */

  const totalLansia = lansiaList.length;

  /** Pemeriksaan terbaru per lansia */
  const latestPemLansia = lansiaList.map(l => {
    const riwayat = pemLansia
      .filter(p => p.lansiaId === l.id)
      .sort((a, z) => new Date(z.tanggal) - new Date(a.tanggal));
    return riwayat.length ? { ...riwayat[0], lansia: l } : null;
  }).filter(Boolean);

  const risikoTinggi = latestPemLansia.filter(p =>
    (p.tensi && p.tensi > 140) || (p.gulaDarah && p.gulaDarah > 200)
  ).length;
  const tensiTinggi  = latestPemLansia.filter(p => p.tensi && p.tensi > 140).length;
  const kunjLansia   = pemLansia.filter(p => {
    const d = new Date(p.tanggal);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const withBB     = pemLansia.filter(p => p.bb);
  const withTensi  = pemLansia.filter(p => p.tensi);
  const withGula   = pemLansia.filter(p => p.gulaDarah);
  const rataaBB    = withBB.length    ? (withBB.reduce((s,p) => s+p.bb, 0) / withBB.length).toFixed(1)              : "-";
  const rataaTensi = withTensi.length ? (withTensi.reduce((s,p) => s+p.tensi, 0) / withTensi.length).toFixed(0)     : "-";
  const rataaGula  = withGula.length  ? (withGula.reduce((s,p) => s+p.gulaDarah, 0) / withGula.length).toFixed(0)   : "-";

  const normalLansia = totalLansia - risikoTinggi;
  const statusLansia = [
    { label:"Normal",                   value:normalLansia, color:"#2d7a4f", bg:"#e8f5ed" },
    { label:"Risiko Tinggi",            value:risikoTinggi, color:"#be185d", bg:"#fce7f3" },
    { label:"Tensi Tinggi (>140 mmHg)", value:tensiTinggi,  color:"#d97706", bg:"#fef3c7" },
  ];

  const trendTensi = BULAN.map((bulan, idx) => {
    const rows = pemLansia.filter(p => new Date(p.tanggal).getMonth() === idx && p.tensi != null);
    const rata = rows.length
      ? parseFloat((rows.reduce((s,p) => s+p.tensi, 0) / rows.length).toFixed(0))
      : null;
    return { bulan, rataRata: rata, normal: 120 };
  }).filter(d => d.rataRata !== null);

  const trendGula = BULAN.map((bulan, idx) => {
    const rows = pemLansia.filter(p => new Date(p.tanggal).getMonth() === idx && p.gulaDarah != null);
    const rata = rows.length
      ? parseFloat((rows.reduce((s,p) => s+p.gulaDarah, 0) / rows.length).toFixed(0))
      : null;
    return { bulan, rataRata: rata, normal: 140 };
  }).filter(d => d.rataRata !== null);

  const risikoList = latestPemLansia
    .filter(p => (p.tensi && p.tensi > 140) || (p.gulaDarah && p.gulaDarah > 200))
    .slice(0, 4);

  /* ══════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════ */
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:24,
      fontFamily:"'Plus Jakarta Sans',sans-serif" }}>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .stat-card {
          background:#fff; border:1px solid #e4ede6; border-radius:14px;
          padding:18px 16px; box-shadow:0 2px 8px rgba(0,0,0,0.04);
          position:relative; overflow:hidden; transition:transform 0.2s; cursor:default;
        }
        .stat-card:hover { transform:translateY(-2px); }
        .card {
          background:#fff; border:1px solid #e4ede6; border-radius:14px;
          box-shadow:0 2px 8px rgba(0,0,0,0.04);
        }
        .section-title { font-size:14px; font-weight:800; color:#1f2d1f; margin:0 0 2px; }
        .section-sub   { font-size:12px; color:#9aab9a; margin:0; }
      `}</style>

      {/* ════════════════════════════════════
          SEKSI BALITA
      ════════════════════════════════════ */}
      <div>
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ background:"#e8f5ed", borderRadius:10, padding:8 }}>
              <Baby size={18} color="#2d7a4f" />
            </div>
            <div>
              <p style={{ fontSize:15, fontWeight:800, color:"#1f2d1f", margin:0 }}>Laporan Posyandu Balita</p>
              <p style={{ fontSize:12, color:"#9aab9a", margin:0 }}>Ringkasan data kesehatan balita</p>
            </div>
          </div>
          {/* <Link href="/admin/balita" style={{
            display:"flex", alignItems:"center", gap:5, color:"#2d7a4f", fontSize:13,
            fontWeight:600, textDecoration:"none", background:"#e8f5ed",
            padding:"7px 13px", borderRadius:9, border:"1px solid #c6e2d1",
          }}>
          
          </Link> */}
        </div>

        {/* Stat cards balita — sesuai tampilan gambar */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:16 }}>
          {[
            { icon:Baby,          label:"Total Balita",      value:totalBalita,        sub:"Terdaftar aktif",         accent:"#2d7a4f", bg:"#e8f5ed" },
            { icon:AlertTriangle, label:"Stunting",          value:stuntingCount,      sub:"Terdeteksi pemeriksaan",  accent:"#d97706", bg:"#fef3c7" },
            { icon:TrendingDown,  label:"Severely Stunting", value:severelyStuntCount, sub:"Perlu penanganan segera", accent:"#be185d", bg:"#fce7f3" },
            { icon:CalendarDays,  label:"Baru Bulan Ini",    value:baruBulanIni,       sub:"Balita terdaftar baru",   accent:"#3a9e6e", bg:"#eaf6f0" },
          ].map(({ icon:Icon, label, value, sub, accent, bg }) => (
            <div key={label} className="stat-card">
              <div style={{ position:"absolute", top:0, left:0, width:4, height:"100%",
                background:accent, borderRadius:"14px 0 0 14px" }} />
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                <div style={{ background:bg, borderRadius:9, padding:8 }}>
                  <Icon size={16} color={accent} />
                </div>
                <span style={{ color:"#6b7c6b", fontSize:12 }}>{label}</span>
              </div>
              <p style={{ fontSize:28, fontWeight:800, color:"#1f2d1f", letterSpacing:-0.5, margin:0 }}>
                {loading ? "–" : value}
              </p>
              <p style={{ color:"#9aab9a", fontSize:11, marginTop:3, marginBottom:0 }}>{sub}</p>
            </div>
          ))}
        </div>

        {/* Charts BB & TB */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>

          {/* Tren Berat Badan */}
          <div className="card" style={{ padding:20 }}>
            <p className="section-title">Tren Rata-rata Berat Badan</p>
            <p className="section-sub">Perbandingan dengan standar WHO (kg)</p>
            <div style={{ display:"flex", gap:14, margin:"12px 0" }}>
              <LegendDot color="#2d7a4f" label="Rata-rata Balita" />
              <LegendDot color="#d1d5db" label="Standar Normal WHO" />
            </div>
            {loading ? <LoadingRow color="#2d7a4f" /> : trendBB.length === 0 ? (
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center",
                height:200, color:"#9aab9a", fontSize:13 }}>Belum ada data pemeriksaan</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={trendBB}>
                  <defs>
                    <linearGradient id="gBB" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#2d7a4f" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#2d7a4f" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2ee" />
                  <XAxis dataKey="bulan" tick={{ fill:"#9aab9a", fontSize:11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill:"#9aab9a", fontSize:11 }} axisLine={false} tickLine={false} unit=" kg" />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="rataRata" name="Rata-rata" stroke="#2d7a4f" strokeWidth={2.5}
                    fill="url(#gBB)" dot={{ r:3, fill:"#2d7a4f", strokeWidth:0 }} connectNulls />
                  <Line type="monotone" dataKey="normal" name="Standar WHO" stroke="#d1d5db"
                    strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Tren Tinggi Badan */}
          <div className="card" style={{ padding:20 }}>
            <p className="section-title">Tren Rata-rata Tinggi Badan</p>
            <p className="section-sub">Perbandingan dengan standar WHO (cm)</p>
            <div style={{ display:"flex", gap:14, margin:"12px 0" }}>
              <LegendDot color="#0891b2" label="Rata-rata Balita" />
              <LegendDot color="#d1d5db" label="Standar Normal WHO" />
            </div>
            {loading ? <LoadingRow color="#0891b2" /> : trendTB.length === 0 ? (
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center",
                height:200, color:"#9aab9a", fontSize:13 }}>Belum ada data pemeriksaan</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={trendTB}>
                  <defs>
                    <linearGradient id="gTB" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#0891b2" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#0891b2" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2ee" />
                  <XAxis dataKey="bulan" tick={{ fill:"#9aab9a", fontSize:11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill:"#9aab9a", fontSize:11 }} axisLine={false} tickLine={false} unit=" cm" />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="rataRata" name="Rata-rata" stroke="#0891b2" strokeWidth={2.5}
                    fill="url(#gTB)" dot={{ r:3, fill:"#0891b2", strokeWidth:0 }} connectNulls />
                  <Line type="monotone" dataKey="normal" name="Standar WHO" stroke="#d1d5db"
                    strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Distribusi Status Gizi */}
        <div className="card" style={{ padding:20 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
            <div>
              <p className="section-title">Distribusi Status Gizi Balita</p>
              <p className="section-sub">Berdasarkan Z-score BB/U standar WHO 2006 — pemeriksaan terbaru per balita</p>
            </div>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap", justifyContent:"flex-end" }}>
              {statusGiziData.map(d => (
                <LegendDot key={d.label} color={d.color} label={d.label.split(" ")[0]} />
              ))}
            </div>
          </div>
          {loading ? <LoadingRow color="#2d7a4f" /> : (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:"12px 28px" }}>
              {statusGiziData.map(({ label, value, color, bg }) => {
                const total = Math.max(statusGiziData.reduce((s,i) => s+i.value, 0), 1);
                const pct   = ((value / total) * 100).toFixed(1);
                return (
                  <div key={label}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                        <div style={{ width:10, height:10, borderRadius:3, background:color, flexShrink:0 }} />
                        <span style={{ fontSize:13, color:"#1f2d1f", fontWeight:600 }}>{label}</span>
                      </div>
                      <span style={{ fontSize:13, color:"#6b7c6b" }}>
                        {value} anak <span style={{ fontSize:11, color:"#9aab9a" }}>({pct}%)</span>
                      </span>
                    </div>
                    <div style={{ height:9, background:"#f0f6f2", borderRadius:50, overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${pct}%`, background:color,
                        borderRadius:50, transition:"width 0.8s ease" }} />
                    </div>
                    <div style={{ marginTop:5 }}>
                      <span style={{ background:bg, color:color, fontSize:10, fontWeight:700,
                        padding:"2px 8px", borderRadius:50 }}>{value} balita</span>
                    </div>
                  </div>
                );
              })}
              {statusGiziData.every(d => d.value === 0) && (
                <p style={{ gridColumn:"1/-1", color:"#9aab9a", fontSize:13, textAlign:"center", margin:"12px 0 0" }}>
                  Belum ada data pemeriksaan BB/TB
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* DIVIDER */}
      <div style={{ height:1, background:"linear-gradient(to right, transparent, #e4ede6, transparent)" }} />

      {/* ════════════════════════════════════
          SEKSI LANSIA
      ════════════════════════════════════ */}
      <div>
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ background:"#eaf3fb", borderRadius:10, padding:8 }}>
              <Users size={18} color="#2563ab" />
            </div>
            <div>
              <p style={{ fontSize:15, fontWeight:800, color:"#1f2d1f", margin:0 }}>Laporan Posyandu Lansia</p>
              <p style={{ fontSize:12, color:"#9aab9a", margin:0 }}>Ringkasan data kesehatan lansia</p>
            </div>
          </div>
          {/* <Link href="/admin/lansia" style={{
            display:"flex", alignItems:"center", gap:5, color:"#2563ab", fontSize:13,
            fontWeight:600, textDecoration:"none", background:"#eaf3fb",
            padding:"7px 13px", borderRadius:9, border:"1px solid #bfdbfe",
          }}>
           
          </Link> */}
        </div>

        {/* Stat cards lansia */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:16 }}>
          {[
            { icon:Users,         label:"Total Lansia",      value:totalLansia,  sub:"Terdaftar aktif",         accent:"#2563ab", bg:"#eaf3fb" },
            { icon:AlertTriangle, label:"Risiko Tinggi",     value:risikoTinggi, sub:"Tensi/gula darah tinggi", accent:"#be185d", bg:"#fce7f3" },
            { icon:Heart,         label:"Tensi Tinggi",      value:tensiTinggi,  sub:">140 mmHg",               accent:"#d97706", bg:"#fef3c7" },
            { icon:Activity,      label:"Kunjungan Bln Ini", value:kunjLansia,   sub:"Pemeriksaan tercatat",    accent:"#0891b2", bg:"#ecfeff" },
          ].map(({ icon:Icon, label, value, sub, accent, bg }) => (
            <div key={label} className="stat-card">
              <div style={{ position:"absolute", top:0, left:0, width:4, height:"100%",
                background:accent, borderRadius:"14px 0 0 14px" }} />
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                <div style={{ background:bg, borderRadius:9, padding:8 }}>
                  <Icon size={16} color={accent} />
                </div>
                <span style={{ color:"#6b7c6b", fontSize:12 }}>{label}</span>
              </div>
              <p style={{ fontSize:28, fontWeight:800, color:"#1f2d1f", letterSpacing:-0.5, margin:0 }}>
                {loading ? "–" : value}
              </p>
              <p style={{ color:"#9aab9a", fontSize:11, marginTop:3, marginBottom:0 }}>{sub}</p>
            </div>
          ))}
        </div>

        {/* Charts tren vital lansia */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>

          {/* Tren Tekanan Darah */}
          <div className="card" style={{ padding:20 }}>
            <p className="section-title">Tren Rata-rata Tekanan Darah</p>
            <p className="section-sub">Sistolik rata-rata vs batas normal (mmHg)</p>
            <div style={{ display:"flex", gap:14, margin:"12px 0" }}>
              <LegendDot color="#be185d" label="Rata-rata Tensi" />
              <LegendDot color="#d1d5db" label="Batas Normal (120)" />
            </div>
            {loading ? <LoadingRow color="#be185d" /> : trendTensi.length === 0 ? (
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center",
                height:200, color:"#9aab9a", fontSize:13 }}>Belum ada data pemeriksaan</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={trendTensi}>
                  <defs>
                    <linearGradient id="gTensi" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#be185d" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#be185d" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2ee" />
                  <XAxis dataKey="bulan" tick={{ fill:"#9aab9a", fontSize:11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill:"#9aab9a", fontSize:11 }} axisLine={false} tickLine={false} unit=" mmHg" />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="rataRata" name="Rata-rata" stroke="#be185d" strokeWidth={2.5}
                    fill="url(#gTensi)" dot={{ r:3, fill:"#be185d", strokeWidth:0 }} connectNulls />
                  <Line type="monotone" dataKey="normal" name="Batas Normal" stroke="#d1d5db"
                    strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Tren Gula Darah */}
          <div className="card" style={{ padding:20 }}>
            <p className="section-title">Tren Rata-rata Gula Darah</p>
            <p className="section-sub">Rata-rata gula darah vs batas normal (mg/dL)</p>
            <div style={{ display:"flex", gap:14, margin:"12px 0" }}>
              <LegendDot color="#d97706" label="Rata-rata Gula Darah" />
              <LegendDot color="#d1d5db" label="Batas Normal (140)" />
            </div>
            {loading ? <LoadingRow color="#d97706" /> : trendGula.length === 0 ? (
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center",
                height:200, color:"#9aab9a", fontSize:13 }}>Belum ada data pemeriksaan</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={trendGula}>
                  <defs>
                    <linearGradient id="gGula" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#d97706" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2ee" />
                  <XAxis dataKey="bulan" tick={{ fill:"#9aab9a", fontSize:11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill:"#9aab9a", fontSize:11 }} axisLine={false} tickLine={false} unit=" mg/dL" />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="rataRata" name="Rata-rata" stroke="#d97706" strokeWidth={2.5}
                    fill="url(#gGula)" dot={{ r:3, fill:"#d97706", strokeWidth:0 }} connectNulls />
                  <Line type="monotone" dataKey="normal" name="Batas Normal" stroke="#d1d5db"
                    strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Distribusi + Jadwal + Risiko */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>

          {/* Distribusi status kesehatan lansia */}
          <div className="card" style={{ padding:20 }}>
            <p className="section-title">Distribusi Status Kesehatan Lansia</p>
            <p className="section-sub">Berdasarkan data tensi &amp; gula darah terbaru per lansia</p>
            {loading ? (
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center",
                padding:"32px 0", gap:8, color:"#9aab9a" }}>
                <Spinner color="#2563ab" /> Memuat data…
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:10, marginTop:16 }}>
                {statusLansia.map(({ label, value, color }) => {
                  const total = Math.max(statusLansia.reduce((s,i) => s+i.value, 0), 1);
                  const pct   = ((value / total) * 100).toFixed(0);
                  return (
                    <div key={label}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                          <div style={{ width:10, height:10, borderRadius:3, background:color, flexShrink:0 }} />
                          <span style={{ fontSize:13, color:"#1f2d1f", fontWeight:600 }}>{label}</span>
                        </div>
                        <span style={{ fontSize:13, color:"#6b7c6b" }}>
                          {value} lansia <span style={{ color:"#9aab9a" }}>({pct}%)</span>
                        </span>
                      </div>
                      <div style={{ height:9, background:"#f0f4fa", borderRadius:50, overflow:"hidden" }}>
                        <div style={{ height:"100%", width:`${pct}%`, background:color,
                          borderRadius:50, transition:"width 0.8s ease" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Ringkasan indikator vital */}
            {!loading && pemLansia.length > 0 && (
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8,
                marginTop:18, paddingTop:16, borderTop:"1px solid #f0f4fa" }}>
                {[
                  { icon:Activity, label:"Rata BB",    value:rataaBB    !== "-" ? `${rataaBB} kg`      : "-", accent:"#2563ab", bg:"#eaf3fb" },
                  { icon:Heart,    label:"Rata Tensi", value:rataaTensi !== "-" ? `${rataaTensi} mmHg` : "-", accent:"#d97706", bg:"#fef3c7" },
                  { icon:Droplets, label:"Rata Gula",  value:rataaGula  !== "-" ? `${rataaGula} mg/dL` : "-", accent:"#be185d", bg:"#fce7f3" },
                ].map(({ icon:Icon, label, value, accent, bg }) => (
                  <div key={label} style={{ background:bg, borderRadius:10, padding:"10px 8px", textAlign:"center" }}>
                    <Icon size={14} color={accent} style={{ margin:"0 auto 4px", display:"block" }} />
                    <p style={{ fontSize:13, fontWeight:800, color:"#1f2d1f", margin:0 }}>{value}</p>
                    <p style={{ fontSize:10, color:"#9aab9a", margin:0 }}>{label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Kolom kanan: Jadwal + Risiko */}
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

            {/* Jadwal terdekat */}
            <div className="card" style={{ padding:20, flex:1 }}>
              <p className="section-title">Jadwal Posyandu Terdekat</p>
              <p className="section-sub" style={{ marginBottom:14 }}>Kegiatan yang akan datang</p>
              {loading ? (
                <div style={{ display:"flex", alignItems:"center", justifyContent:"center",
                  padding:"20px 0", gap:8, color:"#9aab9a" }}>
                  <Spinner /> Memuat…
                </div>
              ) : jadwalDekat.length === 0 ? (
                <EmptyState icon={CalendarDays} text="Belum ada jadwal" />
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {jadwalDekat.slice(0, 3).map(item => (
                    <div key={item.id} style={{ display:"flex", alignItems:"center", gap:12,
                      padding:"10px 12px", background:"#f8fbf9", borderRadius:10, border:"1px solid #e4ede6" }}>
                      <div style={{ background:"#e8f5ed", borderRadius:8, padding:"7px 10px",
                        textAlign:"center", flexShrink:0 }}>
                        <p style={{ color:"#2d7a4f", fontSize:15, fontWeight:800, lineHeight:1, margin:0 }}>
                          {new Date(item.tanggal).getDate()}
                        </p>
                        <p style={{ color:"#6abd8f", fontSize:10, fontWeight:600,
                          textTransform:"uppercase", margin:0 }}>
                          {new Date(item.tanggal).toLocaleDateString("id-ID", { month:"short" })}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize:13, fontWeight:700, color:"#1f2d1f", margin:0 }}>{item.kegiatan}</p>
                        <p style={{ fontSize:12, color:"#9aab9a", margin:0 }}>{item.tempat}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Lansia risiko tinggi */}
            <div className="card" style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column" }}>

              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div>
                  <p className="section-title">Lansia perlu perhatian</p>
                  <p className="section-sub">Tensi &gt;140 mmHg atau gula darah &gt;200 mg/dL</p>
                </div>
                {!loading && risikoList.length > 0 && (
                  <span style={{
                    background: "#fee2e2", color: "#991f1f",
                    fontSize: 11, fontWeight: 700,
                    padding: "3px 10px", borderRadius: 99,
                  }}>
                    {latestPemLansia.filter(p =>
                      (p.tensi && p.tensi > 140) || (p.gulaDarah && p.gulaDarah > 200)
                    ).length} lansia
                  </span>
                )}
              </div>

              {/* Body */}
              {loading ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
                  flex: 1, padding: "20px 0", gap: 8, color: "#9aab9a" }}>
                  <div style={{ width: 16, height: 16, border: "2px solid #e4ede6",
                    borderTopColor: "#2563ab", borderRadius: "50%",
                    animation: "spin 0.7s linear infinite" }} />
                  Memuat…
                </div>
              ) : risikoList.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
                  justifyContent: "center", flex: 1, padding: "24px 0", color: "#9aab9a" }}>
                  <Heart size={26} color="#dde8de" style={{ marginBottom: 8 }} />
                  <p style={{ fontSize: 13, margin: 0 }}>Semua lansia dalam kondisi normal</p>
                </div>
              ) : (
                <div
                  className="risiko-scroll"
                  style={{
                    display: "flex", flexDirection: "column", gap: 8,
                    maxHeight: 240, overflowY: "auto", paddingRight: 4, flex: 1,
                  }}
                >
                  {risikoList.map(p => {
                    const tensiRisiko = p.tensi     && p.tensi     > 140;
                    const gulaRisiko  = p.gulaDarah && p.gulaDarah > 200;
                    const initials    = (p.lansia?.nama ?? "")
                      .split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "??";
                    return (
                      <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12,
                        padding: "10px 12px", background: "#fff5f5",
                        borderRadius: 10, border: "0.5px solid #fecaca", flexShrink: 0 }}>
                        <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#fee2e2",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 11, fontWeight: 700, color: "#991f1f", flexShrink: 0 }}>
                          {initials}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 700, color: "#1f2d1f",
                            margin: "0 0 4px", whiteSpace: "nowrap",
                            overflow: "hidden", textOverflow: "ellipsis" }}>
                            {p.lansia?.nama ?? "-"}
                          </p>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                            {tensiRisiko && (
                              <span style={{ background: "#fef3c7", color: "#854F0B",
                                fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99 }}>
                                Tensi: {p.tensi} mmHg
                              </span>
                            )}
                            {gulaRisiko && (
                              <span style={{ background: "#fee2e2", color: "#791F1F",
                                fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99 }}>
                                Gula: {p.gulaDarah} mg/dL
                              </span>
                            )}
                            <span style={{ background: "#f0f4fa", color: "#6b7c6b",
                              fontSize: 10, padding: "2px 8px", borderRadius: 99 }}>
                              {new Date(p.tanggal).toLocaleDateString("id-ID",
                                { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}