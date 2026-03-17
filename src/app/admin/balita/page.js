"use client";

import { useEffect, useState } from "react";
import { getBalita } from "@/services/balitaService";
import { getJadwalTerdekat } from "@/services/penjadwalanService";
import { Baby, AlertTriangle, TrendingUp, CalendarDays, ArrowRight } from "lucide-react";
import Link from "next/link";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line
} from "recharts";

/* dummy tren — ganti dengan data API kalau ada */
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

export default function DashboardBalitaPage() {
  const [balitaList, setBalitaList]       = useState([]);
  const [jadwalDekat, setJadwalDekat]     = useState([]);
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    Promise.all([getBalita(), getJadwalTerdekat()])
      .then(([b, j]) => { setBalitaList(b); setJadwalDekat(j); })
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (d) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  };

  const totalBalita   = balitaList.length;
  const potensiStunt  = Math.round(totalBalita * 0.083);
  const bulanIni      = balitaList.filter(b => new Date(b.tglLahir || b.createdAt).getMonth() === new Date().getMonth()).length;
  const kunjBulanIni  = 42; // dari API posyandu nanti

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── STAT CARDS ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
        {[
          { icon: Baby,          label: "Total Balita",      value: totalBalita,  sub: "Terdaftar aktif",          accent: "#2d7a4f", bg: "#e8f5ed" },
          { icon: AlertTriangle, label: "Potensi Stunting",  value: potensiStunt, sub: "Perlu pemantauan lebih",   accent: "#be185d", bg: "#fce7f3" },
          { icon: TrendingUp,    label: "Berat Kurang",      value: 18,           sub: "Di bawah batas normal",    accent: "#d97706", bg: "#fef3c7" },
          { icon: CalendarDays,  label: "Posyandu Bln Ini",  value: kunjBulanIni, sub: "Kunjungan tercatat",       accent: "#3a9e6e", bg: "#eaf6f0" },
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

      {/* ── CHART ROW 1 ── */}
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

        {/* Tren TB */}
        <div className="card" style={{ padding: "20px" }}>
          <p className="section-title">Tren Rata-rata Tinggi Badan</p>
          <p className="section-sub">Perbandingan dengan standar WHO (cm)</p>
          <div style={{ display: "flex", gap: 14, margin: "12px 0" }}>
            {[{ c: "#3a9e6e", l: "Rata-rata Balita" }, { c: "#d1d5db", l: "Standar Normal" }].map(({ c, l }) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: c }} />
                <span style={{ color: "#6b7c6b", fontSize: 12 }}>{l}</span>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trendTB}>
              <defs>
                <linearGradient id="gTB" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3a9e6e" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3a9e6e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2ee" />
              <XAxis dataKey="bulan" tick={{ fill: "#9aab9a", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#9aab9a", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="rataRata" name="Rata-rata" stroke="#3a9e6e" strokeWidth={2.5} fill="url(#gTB)" dot={{ r: 3, fill: "#3a9e6e", strokeWidth: 0 }} />
              <Line type="monotone" dataKey="normal"   name="Standar"   stroke="#d1d5db" strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── CHART ROW 2 + JADWAL ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

        {/* Status Gizi Bar */}
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

        {/* Jadwal Terdekat */}
        <div className="card" style={{ padding: "20px" }}>
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
            <div style={{ textAlign: "center", padding: "24px 0", color: "#9aab9a" }}>
              <CalendarDays size={28} color="#dde8de" style={{ margin: "0 auto 8px" }} />
              <p style={{ fontSize: 13 }}>Belum ada jadwal</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {jadwalDekat.slice(0, 4).map((item) => (
                <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: "#f8fbf9", borderRadius: 10, border: "1px solid #e4ede6" }}>
                  <div style={{ background: "#e8f5ed", borderRadius: 8, padding: "8px 10px", textAlign: "center", flexShrink: 0 }}>
                    <p style={{ color: "#2d7a4f", fontSize: 16, fontWeight: 800, lineHeight: 1 }}>
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
      </div>
    </div>
  );
}