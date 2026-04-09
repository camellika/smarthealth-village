"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBalita } from "@/services/balitaService";
import { getLansia } from "@/services/lansiaService";
import { getPosyanduBalita } from "@/services/posyanduBalitaService";
import { getPosyanduLansia } from "@/services/posyanduLansiaService";
import { getJadwalTerdekat } from "@/services/penjadwalanService";
import {
  Baby, AlertTriangle, TrendingUp, CalendarDays, ArrowRight,
  Users, Heart, Activity, Droplets
} from "lucide-react";
import Link from "next/link";
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Line
} from "recharts";

/* ── dummy tren balita — ganti dengan data API kalau ada ── */
const trendBB = [
  { bulan: "Jan", rataRata: 10.2, normal: 11.0 },
  { bulan: "Feb", rataRata: 10.5, normal: 11.2 },
  { bulan: "Mar", rataRata: 10.8, normal: 11.4 },
  { bulan: "Apr", rataRata: 11.0, normal: 11.5 },
  { bulan: "Mei", rataRata: 11.3, normal: 11.7 },
  { bulan: "Jun", rataRata: 11.6, normal: 11.8 },
];
const trendTB = [
  { bulan: "Jan", rataRata: 76, normal: 79 },
  { bulan: "Feb", rataRata: 77, normal: 80 },
  { bulan: "Mar", rataRata: 78, normal: 81 },
  { bulan: "Apr", rataRata: 79, normal: 82 },
  { bulan: "Mei", rataRata: 80, normal: 83 },
  { bulan: "Jun", rataRata: 81, normal: 84 },
];
const statusGizi = [
  { label: "Normal",   value: 89, color: "#2d7a4f" },
  { label: "Kurang",   value: 18, color: "#d97706" },
  { label: "Stunting", value: 10, color: "#be185d" },
  { label: "Lebih",    value: 3,  color: "#6abd8f" },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#fff", border: "1px solid #dde8de", borderRadius: 10, padding: "10px 14px", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", fontSize: 13 }}>
      <p style={{ color: "#9aab9a", fontSize: 11, marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

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
 

  /* ── computed balita ── */
  const totalBalita  = balitaList.length;
  const potensiStunt = Math.round(totalBalita * 0.083);
  const bbKurang     = pemBalita.filter(p => p.bb && p.bb < 10).length;
  const kunjBalita   = pemBalita.filter(p => {
    const d = new Date(p.tanggal);
    return d.getMonth() === new Date().getMonth() && d.getFullYear() === new Date().getFullYear();
  }).length;

  /* ── computed lansia ── */
  const totalLansia  = lansiaList.length;
  const risikoTinggi = lansiaList.filter(l => {
    const pemTerakhir = pemLansia.filter(p => p.lansiaId === l.id);
    if (!pemTerakhir.length) return false;
    const last = pemTerakhir[0];
    return (last.tensi && last.tensi > 140) || (last.gulaDarah && last.gulaDarah > 200);
  }).length;
  const tensiTinggi = pemLansia.filter(p => p.tensi && p.tensi > 140).length;
  const kunjLansia  = pemLansia.filter(p => {
    const d = new Date(p.tanggal);
    return d.getMonth() === new Date().getMonth() && d.getFullYear() === new Date().getFullYear();
  }).length;

  /* ── distribusi status lansia ── */
  const normalLansia  = lansiaList.length - risikoTinggi;
  const statusLansia  = [
    { label: "Normal",       value: normalLansia,  color: "#2d7a4f" },
    { label: "Risiko Tinggi",value: risikoTinggi,  color: "#be185d" },
    { label: "Tensi Tinggi", value: tensiTinggi,   color: "#d97706" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>

      {/* ══════════════════════════════════════
          SEKSI BALITA
      ══════════════════════════════════════ */}
      <div>
        {/* Section header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ background: "#e8f5ed", borderRadius: 10, padding: 8 }}>
              <Baby size={18} color="#2d7a4f" />
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 800, color: "#1f2d1f" }}>Laporan Posyandu Balita</p>
              <p style={{ fontSize: 12, color: "#9aab9a" }}>Ringkasan data kesehatan balita</p>
            </div>
          </div>
          <Link href="/balita/posyandu" style={{ display: "flex", alignItems: "center", gap: 5, color: "#2d7a4f", fontSize: 13, fontWeight: 600, textDecoration: "none", background: "#e8f5ed", padding: "7px 13px", borderRadius: 9, border: "1px solid #c6e2d1" }}>
            Kelola Data <ArrowRight size={13} />
          </Link>
        </div>

        {/* Stat cards balita */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 16 }}>
          {[
            { icon: Baby,          label: "Total Balita",      value: totalBalita,  sub: "Terdaftar aktif",        accent: "#2d7a4f", bg: "#e8f5ed" },
            { icon: AlertTriangle, label: "Potensi Stunting",  value: potensiStunt, sub: "Perlu pemantauan lebih", accent: "#be185d", bg: "#fce7f3" },
            { icon: TrendingUp,    label: "Berat Kurang",      value: loading ? "–" : bbKurang, sub: "Di bawah batas normal", accent: "#d97706", bg: "#fef3c7" },
            { icon: CalendarDays,  label: "Kunjungan Bln Ini", value: loading ? "–" : kunjBalita, sub: "Pemeriksaan tercatat", accent: "#3a9e6e", bg: "#eaf6f0" },
          ].map(({ icon: Icon, label, value, sub, accent, bg }) => (
            <div key={label} style={{ background: "#fff", border: "1px solid #e4ede6", borderRadius: 14, padding: "18px 16px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", position: "relative", overflow: "hidden", transition: "transform 0.2s", cursor: "default" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; }}
            >
              <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: accent, borderRadius: "14px 0 0 14px" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ background: bg, borderRadius: 9, padding: 8 }}><Icon size={16} color={accent} /></div>
                <span style={{ color: "#6b7c6b", fontSize: 12 }}>{label}</span>
              </div>
              <p style={{ fontSize: 28, fontWeight: 800, color: "#1f2d1f", letterSpacing: -0.5 }}>{loading ? "–" : value}</p>
              <p style={{ color: "#9aab9a", fontSize: 11, marginTop: 3 }}>{sub}</p>
            </div>
          ))}
        </div>

        {/* Charts balita */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

          {/* Tren BB */}
          <div className="card" style={{ padding: "20px" }}>
            <p className="section-title">Tren Rata-rata Berat Badan</p>
            <p className="section-sub">Perbandingan dengan standar WHO (kg)</p>
            <div style={{ display: "flex", gap: 14, margin: "12px 0" }}>
              {[{ c: "#2d7a4f", l: "Rata-rata Balita" }, { c: "#d1d5db", l: "Standar Normal" }].map(({ c, l }) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: c }} />
                  <span style={{ color: "#6b7c6b", fontSize: 12 }}>{l}</span>
                </div>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trendBB}>
                <defs>
                  <linearGradient id="gBB" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#2d7a4f" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2d7a4f" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2ee" />
                <XAxis dataKey="bulan" tick={{ fill: "#9aab9a", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#9aab9a", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="rataRata" name="Rata-rata" stroke="#2d7a4f" strokeWidth={2.5} fill="url(#gBB)" dot={{ r: 3, fill: "#2d7a4f", strokeWidth: 0 }} />
                <Line type="monotone" dataKey="normal"   name="Standar"   stroke="#d1d5db" strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Distribusi Status Gizi */}
          <div className="card" style={{ padding: "20px" }}>
            <p className="section-title">Distribusi Status Gizi Balita</p>
            <p className="section-sub">Berdasarkan data BB/TB terbaru</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
              {statusGizi.map(({ label, value, color }) => {
                const total = statusGizi.reduce((s, i) => s + i.value, 0);
                const pct   = ((value / total) * 100).toFixed(0);
                return (
                  <div key={label}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 13, color: "#1f2d1f", fontWeight: 600 }}>{label}</span>
                      <span style={{ fontSize: 13, color: "#6b7c6b" }}>{value} anak <span style={{ color: "#9aab9a" }}>({pct}%)</span></span>
                    </div>
                    <div style={{ height: 8, background: "#f0f6f2", borderRadius: 50, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 50, transition: "width 0.8s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── DIVIDER ── */}
      <div style={{ height: 1, background: "linear-gradient(to right, transparent, #e4ede6, transparent)" }} />

      {/* ══════════════════════════════════════
          SEKSI LANSIA
      ══════════════════════════════════════ */}
      <div>
        {/* Section header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ background: "#eaf3fb", borderRadius: 10, padding: 8 }}>
              <Users size={18} color="#2563ab" />
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 800, color: "#1f2d1f" }}>Laporan Posyandu Lansia</p>
              <p style={{ fontSize: 12, color: "#9aab9a" }}>Ringkasan data kesehatan lansia</p>
            </div>
          </div>
          <Link href="/lansia/posyandu" style={{ display: "flex", alignItems: "center", gap: 5, color: "#2563ab", fontSize: 13, fontWeight: 600, textDecoration: "none", background: "#eaf3fb", padding: "7px 13px", borderRadius: 9, border: "1px solid #bfdbfe" }}>
            Kelola Data <ArrowRight size={13} />
          </Link>
        </div>

        {/* Stat cards lansia */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 16 }}>
          {[
            { icon: Users,         label: "Total Lansia",      value: loading ? "–" : totalLansia,   sub: "Terdaftar aktif",        accent: "#2563ab", bg: "#eaf3fb" },
            { icon: AlertTriangle, label: "Risiko Tinggi",     value: loading ? "–" : risikoTinggi,  sub: "Tensi/gula darah tinggi", accent: "#be185d", bg: "#fce7f3" },
            { icon: Heart,         label: "Tensi Tinggi",      value: loading ? "–" : tensiTinggi,   sub: ">140 mmHg",              accent: "#d97706", bg: "#fef3c7" },
            { icon: Activity,      label: "Kunjungan Bln Ini", value: loading ? "–" : kunjLansia,    sub: "Pemeriksaan tercatat",   accent: "#0891b2", bg: "#ecfeff" },
          ].map(({ icon: Icon, label, value, sub, accent, bg }) => (
            <div key={label} style={{ background: "#fff", border: "1px solid #e4ede6", borderRadius: 14, padding: "18px 16px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", position: "relative", overflow: "hidden", transition: "transform 0.2s", cursor: "default" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; }}
            >
              <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: accent, borderRadius: "14px 0 0 14px" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ background: bg, borderRadius: 9, padding: 8 }}><Icon size={16} color={accent} /></div>
                <span style={{ color: "#6b7c6b", fontSize: 12 }}>{label}</span>
              </div>
              <p style={{ fontSize: 28, fontWeight: 800, color: "#1f2d1f", letterSpacing: -0.5 }}>{value}</p>
              <p style={{ color: "#9aab9a", fontSize: 11, marginTop: 3 }}>{sub}</p>
            </div>
          ))}
        </div>

        {/* Charts & jadwal lansia */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

          {/* Distribusi status lansia */}
          <div className="card" style={{ padding: "20px" }}>
            <p className="section-title">Distribusi Status Kesehatan Lansia</p>
            <p className="section-sub">Berdasarkan data tensi & gula darah terbaru</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
              {loading ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 0", gap: 8, color: "#9aab9a" }}>
                  <div style={{ width: 16, height: 16, border: "2px solid #e4ede6", borderTopColor: "#2563ab", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                  Memuat data…
                </div>
              ) : statusLansia.map(({ label, value, color }) => {
                const total = Math.max(statusLansia.reduce((s, i) => s + i.value, 0), 1);
                const pct   = ((value / total) * 100).toFixed(0);
                return (
                  <div key={label}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 13, color: "#1f2d1f", fontWeight: 600 }}>{label}</span>
                      <span style={{ fontSize: 13, color: "#6b7c6b" }}>{value} lansia <span style={{ color: "#9aab9a" }}>({pct}%)</span></span>
                    </div>
                    <div style={{ height: 8, background: "#f0f4fa", borderRadius: 50, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 50, transition: "width 0.8s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Ringkasan indikator vital */}
            {!loading && pemLansia.length > 0 && (() => {
              const withBB    = pemLansia.filter(p => p.bb);
              const withTensi = pemLansia.filter(p => p.tensi);
              const withGula  = pemLansia.filter(p => p.gulaDarah);
              const rataaBB   = withBB.length   ? (withBB.reduce((s,p) => s + p.bb, 0) / withBB.length).toFixed(1)         : "-";
              const rataaTensi= withTensi.length ? (withTensi.reduce((s,p) => s + p.tensi, 0) / withTensi.length).toFixed(0) : "-";
              const rataaGula = withGula.length  ? (withGula.reduce((s,p) => s + p.gulaDarah, 0) / withGula.length).toFixed(0): "-";
              return (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 18, paddingTop: 16, borderTop: "1px solid #f0f4fa" }}>
                  {[
                    { icon: Activity, label: "Rata BB",    value: rataaBB !== "-" ? `${rataaBB} kg`   : "-", accent: "#2563ab", bg: "#eaf3fb" },
                    { icon: Heart,    label: "Rata Tensi", value: rataaTensi !== "-" ? `${rataaTensi} mmHg` : "-", accent: "#d97706", bg: "#fef3c7" },
                    { icon: Droplets, label: "Rata Gula",  value: rataaGula !== "-" ? `${rataaGula} mg/dL` : "-", accent: "#be185d", bg: "#fce7f3" },
                  ].map(({ icon: Icon, label, value, accent, bg }) => (
                    <div key={label} style={{ background: bg, borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
                      <Icon size={14} color={accent} style={{ margin: "0 auto 4px" }} />
                      <p style={{ fontSize: 13, fontWeight: 800, color: "#1f2d1f" }}>{value}</p>
                      <p style={{ fontSize: 10, color: "#9aab9a" }}>{label}</p>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* Jadwal terdekat + daftar lansia risiko tinggi */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Jadwal terdekat */}
            <div className="card" style={{ padding: "20px", flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div>
                  <p className="section-title">Jadwal Posyandu Terdekat</p>
                  <p className="section-sub">Kegiatan yang akan datang</p>
                </div>
                <Link href="/balita/posyandu" style={{ display: "flex", alignItems: "center", gap: 4, color: "#2d7a4f", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                  Lihat Semua <ArrowRight size={13} />
                </Link>
              </div>

              {jadwalDekat.length === 0 ? (
                <div style={{ textAlign: "center", padding: "20px 0", color: "#9aab9a" }}>
                  <CalendarDays size={26} color="#dde8de" style={{ margin: "0 auto 8px" }} />
                  <p style={{ fontSize: 13 }}>Belum ada jadwal</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {jadwalDekat.slice(0, 3).map((item) => (
                    <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: "#f8fbf9", borderRadius: 10, border: "1px solid #e4ede6" }}>
                      <div style={{ background: "#e8f5ed", borderRadius: 8, padding: "7px 10px", textAlign: "center", flexShrink: 0 }}>
                        <p style={{ color: "#2d7a4f", fontSize: 15, fontWeight: 800, lineHeight: 1 }}>
                          {new Date(item.tanggal).getDate()}
                        </p>
                        <p style={{ color: "#6abd8f", fontSize: 10, fontWeight: 600, textTransform: "uppercase" }}>
                          {new Date(item.tanggal).toLocaleDateString("id-ID", { month: "short" })}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#1f2d1f" }}>{item.kegiatan}</p>
                        <p style={{ fontSize: 12, color: "#9aab9a" }}>{item.tempat}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Lansia risiko tinggi */}
            <div className="card" style={{ padding: "20px", flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div>
                  <p className="section-title">Lansia Perlu Perhatian</p>
                  <p className="section-sub">Tensi &gt;140 atau gula darah &gt;200</p>
                </div>
                <Link href="/lansia/posyandu" style={{ display: "flex", alignItems: "center", gap: 4, color: "#2563ab", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                  Lihat Semua <ArrowRight size={13} />
                </Link>
              </div>

              {loading ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 0", gap: 8, color: "#9aab9a" }}>
                  <div style={{ width: 16, height: 16, border: "2px solid #e4ede6", borderTopColor: "#2563ab", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                  Memuat…
                </div>
              ) : (() => {
                /* ambil pemeriksaan terakhir per lansia yang punya risiko */
                const risikoList = pemLansia
                  .filter(p => (p.tensi && p.tensi > 140) || (p.gulaDarah && p.gulaDarah > 200))
                  .reduce((acc, p) => {
                    if (!acc.find(a => a.lansiaId === p.lansiaId)) acc.push(p);
                    return acc;
                  }, [])
                  .slice(0, 3);

                if (risikoList.length === 0) return (
                  <div style={{ textAlign: "center", padding: "20px 0", color: "#9aab9a" }}>
                    <Heart size={26} color="#dde8de" style={{ margin: "0 auto 8px" }} />
                    <p style={{ fontSize: 13 }}>Semua lansia dalam kondisi normal</p>
                  </div>
                );

                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {risikoList.map(p => {
                      const tensiRisiko = p.tensi && p.tensi > 140;
                      const gulaRisiko  = p.gulaDarah && p.gulaDarah > 200;
                      return (
                        <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: "#fff5f5", borderRadius: 10, border: "1px solid #fecaca" }}>
                          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#dc2626", flexShrink: 0 }}>
                            {p.lansia?.nama?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() ?? "??"}
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 13, fontWeight: 700, color: "#1f2d1f" }}>{p.lansia?.nama ?? "-"}</p>
                            <div style={{ display: "flex", gap: 6, marginTop: 3 }}>
                              {tensiRisiko && (
                                <span style={{ background: "#fef3c7", color: "#d97706", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 50 }}>
                                  Tensi: {p.tensi} mmHg
                                </span>
                              )}
                              {gulaRisiko && (
                                <span style={{ background: "#fee2e2", color: "#dc2626", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 50 }}>
                                  Gula: {p.gulaDarah} mg/dL
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}