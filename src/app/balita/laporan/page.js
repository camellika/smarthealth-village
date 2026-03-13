"use client";

import { useState } from "react";
import { Download, FileText, TrendingUp, Baby, AlertTriangle } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend, LineChart, Line
} from "recharts";

/* ── dummy data laporan ── ganti dengan data API ── */
const bulananData = [
  { bulan: "Jan", kunjungan: 38, bbNormal: 28, bbKurang: 7, stunting: 3 },
  { bulan: "Feb", kunjungan: 42, bbNormal: 30, bbKurang: 8, stunting: 4 },
  { bulan: "Mar", kunjungan: 40, bbNormal: 31, bbKurang: 6, stunting: 3 },
  { bulan: "Apr", kunjungan: 45, bbNormal: 33, bbKurang: 8, stunting: 4 },
  { bulan: "Mei", kunjungan: 48, bbNormal: 35, bbKurang: 9, stunting: 4 },
  { bulan: "Jun", kunjungan: 42, bbNormal: 34, bbKurang: 6, stunting: 2 },
];
const statusGiziPie = [
  { name: "Normal",   value: 89, color: "#2d7a4f" },
  { name: "Kurang",   value: 18, color: "#d97706" },
  { name: "Stunting", value: 10, color: "#be185d" },
  { name: "Lebih",    value: 3,  color: "#6abd8f" },
];
const trendBBTB = [
  { bulan: "Jan", bb: 10.2, tb: 76 },
  { bulan: "Feb", bb: 10.5, tb: 77 },
  { bulan: "Mar", bb: 10.8, tb: 78 },
  { bulan: "Apr", bb: 11.0, tb: 79 },
  { bulan: "Mei", bb: 11.3, tb: 80 },
  { bulan: "Jun", bb: 11.6, tb: 81 },
];

const TAHUN_OPT = ["2026", "2025", "2024"];
const BULAN_OPT = ["Semua","Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#fff", border: "1px solid #dde8de", borderRadius: 10, padding: "10px 14px", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", fontSize: 13 }}>
      <p style={{ color: "#9aab9a", fontSize: 11, marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || p.stroke, fontWeight: 600 }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export default function LaporanBalitaPage() {
  const [tahun, setTahun] = useState("2026");
  const [bulan, setBulan] = useState("Semua");

  function handleExport() {
    alert("Fitur ekspor PDF/Excel akan terhubung ke backend. Silakan implementasikan endpoint /api/laporan/balita/export");
  }

  const totalKunjungan = bulananData.reduce((s, b) => s + b.kunjungan, 0);
  const totalStunting  = bulananData.reduce((s, b) => s + b.stunting, 0);
  const totalKurang    = bulananData.reduce((s, b) => s + b.bbKurang, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── FILTER + EXPORT BAR ── */}
      <div className="card" style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <p className="section-title">Laporan Perkembangan Balita</p>
          <p className="section-sub">Rekap data pemeriksaan dan status gizi seluruh balita</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {/* Filter Tahun */}
          <select value={tahun} onChange={e => setTahun(e.target.value)}
            style={{ border: "1.5px solid #e4ede6", borderRadius: 9, padding: "8px 12px", fontSize: 13, fontFamily: "'Plus Jakarta Sans',sans-serif", color: "#1f2d1f", background: "#fff", outline: "none" }}>
            {TAHUN_OPT.map(t => <option key={t}>{t}</option>)}
          </select>
          {/* Filter Bulan */}
          <select value={bulan} onChange={e => setBulan(e.target.value)}
            style={{ border: "1.5px solid #e4ede6", borderRadius: 9, padding: "8px 12px", fontSize: 13, fontFamily: "'Plus Jakarta Sans',sans-serif", color: "#1f2d1f", background: "#fff", outline: "none" }}>
            {BULAN_OPT.map(b => <option key={b}>{b}</option>)}
          </select>
          {/* Export */}
          <button onClick={handleExport} className="btn-primary">
            <Download size={15} /> Ekspor Laporan
          </button>
        </div>
      </div>

      {/* ── RINGKASAN CARDS ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        {[
          { icon: Baby,          label: "Total Kunjungan",   value: totalKunjungan, sub: `Periode ${tahun}`,        accent: "#2d7a4f", bg: "#e8f5ed" },
          { icon: TrendingUp,    label: "Rata-rata BB",       value: "11.2 kg",      sub: "Bulan Juni",             accent: "#3a9e6e", bg: "#eaf6f0" },
          { icon: TrendingUp,    label: "Rata-rata TB",       value: "81 cm",        sub: "Bulan Juni",             accent: "#6abd8f", bg: "#f0faf5" },
          { icon: AlertTriangle, label: "Total Stunting",     value: totalStunting,  sub: `Kasus sepanjang ${tahun}`,accent: "#be185d", bg: "#fce7f3" },
        ].map(({ icon: Icon, label, value, sub, accent, bg }) => (
          <div key={label} style={{ background: "#fff", border: "1px solid #e4ede6", borderRadius: 14, padding: "16px 16px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: accent, borderRadius: "14px 0 0 14px" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 9 }}>
              <div style={{ background: bg, borderRadius: 8, padding: 7 }}><Icon size={15} color={accent} /></div>
              <span style={{ color: "#6b7c6b", fontSize: 12 }}>{label}</span>
            </div>
            <p style={{ fontSize: 24, fontWeight: 800, color: "#1f2d1f", letterSpacing: -0.5 }}>{value}</p>
            <p style={{ color: "#9aab9a", fontSize: 11, marginTop: 2 }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* ── CHART ROW 1 ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16 }}>

        {/* Kunjungan & Status Gizi Bar */}
        <div className="card" style={{ padding: "20px" }}>
          <p className="section-title">Kunjungan & Status Gizi per Bulan</p>
          <p className="section-sub">Jumlah kunjungan posyandu dan kondisi BB balita</p>
          <div style={{ display: "flex", gap: 14, margin: "12px 0" }}>
            {[{ c: "#2d7a4f", l: "BB Normal" }, { c: "#d97706", l: "BB Kurang" }, { c: "#be185d", l: "Stunting" }].map(({ c, l }) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 9, height: 9, borderRadius: 2, background: c }} />
                <span style={{ color: "#6b7c6b", fontSize: 12 }}>{l}</span>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={bulananData} barGap={3}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2ee" />
              <XAxis dataKey="bulan" tick={{ fill: "#9aab9a", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#9aab9a", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="bbNormal" name="BB Normal" fill="#2d7a4f" radius={[4,4,0,0]} />
              <Bar dataKey="bbKurang" name="BB Kurang" fill="#d97706" radius={[4,4,0,0]} />
              <Bar dataKey="stunting" name="Stunting"  fill="#be185d" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie status gizi */}
        <div className="card" style={{ padding: "20px" }}>
          <p className="section-title">Distribusi Status Gizi</p>
          <p className="section-sub">Keseluruhan balita terdaftar</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={statusGiziPie} cx="50%" cy="50%" innerRadius={50} outerRadius={76} paddingAngle={3} dataKey="value">
                {statusGiziPie.map((e, i) => <Cell key={i} fill={e.color} stroke="transparent" />)}
              </Pie>
              <Tooltip formatter={(v, n) => [`${v} anak`, n]} contentStyle={{ background: "#fff", border: "1px solid #dde8de", borderRadius: 10, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {statusGiziPie.map(({ name, value, color }) => {
              const total = statusGiziPie.reduce((s, i) => s + i.value, 0);
              return (
                <div key={name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                    <span style={{ color: "#6b7c6b", fontSize: 12 }}>{name}</span>
                  </div>
                  <span style={{ color: "#1f2d1f", fontSize: 13, fontWeight: 700 }}>{value} <span style={{ color: "#9aab9a", fontWeight: 400, fontSize: 11 }}>({((value/total)*100).toFixed(0)}%)</span></span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── CHART ROW 2 ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

        {/* BB Trend */}
        <div className="card" style={{ padding: "20px" }}>
          <p className="section-title">Tren Rata-rata Berat Badan (kg)</p>
          <p className="section-sub">Perkembangan BB rata-rata balita per bulan</p>
          <ResponsiveContainer width="100%" height={200} style={{ marginTop: 12 }}>
            <AreaChart data={trendBBTB}>
              <defs>
                <linearGradient id="lBB" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#2d7a4f" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2d7a4f" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2ee" />
              <XAxis dataKey="bulan" tick={{ fill: "#9aab9a", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#9aab9a", fontSize: 11 }} axisLine={false} tickLine={false} domain={["auto","auto"]} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="bb" name="BB (kg)" stroke="#2d7a4f" strokeWidth={2.5} fill="url(#lBB)" dot={{ r: 4, fill: "#2d7a4f", strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* TB Trend */}
        <div className="card" style={{ padding: "20px" }}>
          <p className="section-title">Tren Rata-rata Tinggi Badan (cm)</p>
          <p className="section-sub">Perkembangan TB rata-rata balita per bulan</p>
          <ResponsiveContainer width="100%" height={200} style={{ marginTop: 12 }}>
            <AreaChart data={trendBBTB}>
              <defs>
                <linearGradient id="lTB" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3a9e6e" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3a9e6e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2ee" />
              <XAxis dataKey="bulan" tick={{ fill: "#9aab9a", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#9aab9a", fontSize: 11 }} axisLine={false} tickLine={false} domain={["auto","auto"]} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="tb" name="TB (cm)" stroke="#3a9e6e" strokeWidth={2.5} fill="url(#lTB)" dot={{ r: 4, fill: "#3a9e6e", strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── INFO EXPORT ── */}
      <div style={{ background: "#e8f5ed", border: "1px solid #b8ddc5", borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "flex-start", gap: 12 }}>
        <FileText size={18} color="#2d7a4f" style={{ flexShrink: 0, marginTop: 1 }} />
        <div>
          <p style={{ fontWeight: 700, fontSize: 13, color: "#1f5c35", marginBottom: 3 }}>Tentang Fitur Ekspor</p>
          <p style={{ fontSize: 13, color: "#4a7a5a", lineHeight: 1.6 }}>
            Tombol <strong>Ekspor Laporan</strong> akan menghasilkan file PDF atau Excel berisi seluruh data yang ditampilkan.
            Hubungkan dengan endpoint <code style={{ background: "rgba(45,122,79,0.1)", padding: "1px 6px", borderRadius: 4, fontSize: 12 }}>/api/laporan/balita/export</code> di backend untuk mengaktifkan fitur ini.
          </p>
        </div>
      </div>
    </div>
  );
}