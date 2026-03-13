"use client";
import Link from "next/link";
import { User, HeartPulse, TrendingUp, Users, Baby, Activity, ShieldCheck, Stethoscope, ChevronRight, MapPin, Phone, Mail } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadialBarChart, RadialBar, Legend,
  AreaChart, Area
} from "recharts";

/* ─── PALETTE ───────────────────────────────────────────
   Primary   : #2d7a4f  (forest green — kesehatan & alam)
   Secondary : #3a9e6e  (medium green)
   Accent    : #d97706  (warm amber — peringatan)
   Danger    : #dc2626  (merah lembut)
   BG        : #f5f7f4  (off-white alami)
   Card      : #ffffff
   Text      : #1f2d1f  (dark green-grey)
   Muted     : #6b7c6b
──────────────────────────────────────────────────────── */

const stuntingData = [
  { bulan: "Jan", normal: 98, stunting: 14 },
  { bulan: "Feb", normal: 100, stunting: 13 },
  { bulan: "Mar", normal: 102, stunting: 12 },
  { bulan: "Apr", normal: 104, stunting: 11 },
  { bulan: "Mei", normal: 106, stunting: 12 },
  { bulan: "Jun", normal: 108, stunting: 10 },
];

const hipertensiData = [
  { name: "Normal", value: 62, color: "#2d7a4f" },
  { name: "Pengawasan", value: 14, color: "#d97706" },
  { name: "Risiko Tinggi", value: 9, color: "#dc2626" },
];

const gulaData = [
  { name: "Normal", value: 70, color: "#3a9e6e" },
  { name: "Pra-Diabetes", value: 10, color: "#d97706" },
  { name: "Diabetes", value: 5, color: "#dc2626" },
];

const radialData = [
  { name: "Balita Sehat", value: 89.5, fill: "#2d7a4f" },
  { name: "Imunisasi", value: 76, fill: "#3a9e6e" },
  { name: "Gizi Baik", value: 82, fill: "#6abd8f" },
];

function useCounter(target, duration = 1800) {
  const [count, setCount] = useState(0);
  const ref = useRef(false);
  useEffect(() => {
    if (ref.current) return;
    ref.current = true;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      setCount(Math.floor(p * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return count;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: "#fff", border: "1px solid #d1e8d8", borderRadius: 10, padding: "10px 16px", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
        <p style={{ color: "#6b7c6b", fontSize: 12, marginBottom: 4 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color, fontSize: 13, fontWeight: 600 }}>{p.name}: {p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

function StatCard({ icon: Icon, title, value, sub, accent, lightBg }) {
  const count = useCounter(parseInt(value));
  return (
    <div style={{
      background: "#fff",
      border: "1px solid #e4ede6",
      borderRadius: 16,
      padding: "22px 20px",
      position: "relative",
      overflow: "hidden",
      transition: "transform 0.2s, box-shadow 0.2s",
      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(45,122,79,0.12)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"; }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: accent, borderRadius: "16px 0 0 16px" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <div style={{ background: lightBg, borderRadius: 10, padding: 9 }}>
          <Icon size={18} color={accent} />
        </div>
        <span style={{ color: "#6b7c6b", fontSize: 13 }}>{title}</span>
      </div>
      <div style={{ fontSize: 34, fontWeight: 800, color: "#1f2d1f", letterSpacing: -1 }}>
        {count}
      </div>
      {sub && <p style={{ color: "#9aab9a", fontSize: 12, marginTop: 4 }}>{sub}</p>}
    </div>
  );
}

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", background: "#f5f7f4", fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#1f2d1f", overflowX: "hidden" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #f0f4f1; }
        ::-webkit-scrollbar-thumb { background: #b5ceba; border-radius: 3px; }

        @keyframes slide-up { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.4} }

        .hero-title {
          font-size: clamp(32px, 4.5vw, 56px);
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -1.5px;
          color: #1f2d1f;
          animation: slide-up 0.7s ease both;
        }
        .section-title {
          font-size: clamp(22px, 2.8vw, 32px);
          font-weight: 800;
          letter-spacing: -0.8px;
          color: #1f2d1f;
        }
        .card-hover { transition: transform 0.22s, box-shadow 0.22s; }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 12px 28px rgba(45,122,79,0.1) !important; }
        .btn-primary {
          background: #2d7a4f;
          color: white;
          border: none;
          padding: 13px 26px;
          border-radius: 50px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.22s;
          box-shadow: 0 4px 14px rgba(45,122,79,0.3);
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .btn-primary:hover { background: #246240; transform: translateY(-2px); box-shadow: 0 8px 22px rgba(45,122,79,0.38); }
        .btn-outline {
          background: transparent;
          border: 1.5px solid #c2d9c8;
          color: #4a7a5a;
          padding: 13px 22px;
          border-radius: 50px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.22s;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .btn-outline:hover { background: #edf5ef; border-color: #2d7a4f; color: #2d7a4f; }
      `}</style>

      {/* ══════ NAVBAR ══════ */}
      <header style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(245,247,244,0.94)", backdropFilter: "blur(16px)", borderBottom: "1px solid #dde8de" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "14px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ background: "#2d7a4f", borderRadius: 10, padding: "7px 8px", display: "flex" }}>
              <HeartPulse size={17} color="white" />
            </div>
            <span style={{ fontWeight: 800, fontSize: 16, color: "#1f2d1f", letterSpacing: -0.3 }}>
              SmartHealth<span style={{ color: "#2d7a4f" }}>Village</span>
            </span>
          </div>

          <Link href="/login" style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "#2d7a4f", color: "white",
            padding: "9px 18px", borderRadius: 50,
            fontSize: 14, fontWeight: 600, textDecoration: "none",
            transition: "background 0.2s", boxShadow: "0 2px 8px rgba(45,122,79,0.25)"
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "#246240"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#2d7a4f"; }}
          >
            <User size={15} /> Masuk
          </Link>
        </div>
      </header>

      {/* ══════ HERO ══════ */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "64px 32px 52px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "center" }}>

          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#e8f5ed", border: "1px solid #b8ddc5", borderRadius: 50, padding: "6px 14px", marginBottom: 22 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#2d7a4f", animation: "pulse-dot 2s ease-in-out infinite" }} />
              <span style={{ color: "#2d7a4f", fontSize: 13, fontWeight: 600 }}>Sistem Aktif · Desa Ceria</span>
            </div>

            <h1 className="hero-title">
              Sistem Monitoring<br />
              <span style={{ color: "#2d7a4f" }}>Kesehatan Desa</span>
            </h1>

            <p style={{ color: "#5a7060", lineHeight: 1.75, marginTop: 18, fontSize: 15.5, maxWidth: 440, animation: "slide-up 0.7s 0.1s ease both", opacity: 0, animationFillMode: "forwards" }}>
              Platform digital terintegrasi untuk memantau kesehatan balita dan lansia, mendeteksi dini risiko stunting, hipertensi, dan mendukung kegiatan posyandu berbasis data.
            </p>

            <div style={{ display: "flex", gap: 12, marginTop: 28, animation: "slide-up 0.7s 0.2s ease both", opacity: 0, animationFillMode: "forwards" }}>
              <button className="btn-primary">Lihat Dashboard <ChevronRight size={15} /></button>
              <button className="btn-outline">Pelajari Lebih</button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "240px 185px", gap: 10 }}>
            <div style={{ gridColumn: "1/-1", borderRadius: 18, overflow: "hidden", position: "relative", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
              <img src="/images/posyandu1.jpg" alt="Kegiatan Posyandu" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(31,45,31,0.4), transparent)" }} />
              <div style={{ position: "absolute", bottom: 14, left: 14, display: "flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,0.92)", borderRadius: 50, padding: "5px 13px" }}>
                <Activity size={13} color="#2d7a4f" />
                <span style={{ color: "#2d7a4f", fontSize: 12, fontWeight: 600 }}>Posyandu Aktif</span>
              </div>
            </div>
            <div style={{ borderRadius: 18, overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
              <img src="/images/posyandu2.jpg" alt="Pemeriksaan" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ borderRadius: 18, overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
              <img src="/images/posyandu3.jpg" alt="Monitoring Lansia" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          </div>
        </div>
      </section>

      {/* ══════ STAT CARDS ══════ */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px 48px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
          <StatCard icon={Baby}       title="Total Balita"      value="120" sub="Terdaftar aktif"        accent="#2d7a4f" lightBg="#e8f5ed" />
          <StatCard icon={Users}      title="Total Lansia"      value="85"  sub="Dalam pemantauan"       accent="#3a9e6e" lightBg="#eaf6f0" />
          <StatCard icon={TrendingUp} title="Kasus Stunting"    value="12"  sub="10% dari total balita"  accent="#d97706" lightBg="#fef3c7" />
          <StatCard icon={HeartPulse} title="Risiko Hipertensi" value="9"   sub="Butuh perhatian khusus" accent="#dc2626" lightBg="#fee2e2" />
        </div>
      </section>

      {/* ══════ FEATURE CARDS ══════ */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px 56px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
          {[
            { icon: ShieldCheck, title: "Deteksi Dini", desc: "Identifikasi risiko kesehatan sejak awal melalui analisis data real-time dan historis.", featured: true },
            { icon: Activity, title: "Monitoring Berkala", desc: "Data diperbarui otomatis setiap kegiatan posyandu dengan pencatatan yang terstruktur.", featured: false },
            { icon: Stethoscope, title: "Berbasis Data", desc: "Mendukung keputusan pemerintah desa secara akurat dengan visualisasi yang informatif.", featured: false },
          ].map((item, i) => (
            <div key={i} className="card-hover" style={{
              background: item.featured ? "#2d7a4f" : "#fff",
              border: item.featured ? "none" : "1px solid #e4ede6",
              borderRadius: 18,
              padding: "26px 22px",
              boxShadow: item.featured ? "0 8px 24px rgba(45,122,79,0.22)" : "0 2px 8px rgba(0,0,0,0.04)",
            }}>
              <div style={{ background: item.featured ? "rgba(255,255,255,0.15)" : "#e8f5ed", borderRadius: 12, padding: 10, width: "fit-content", marginBottom: 14 }}>
                <item.icon size={20} color={item.featured ? "white" : "#2d7a4f"} />
              </div>
              <h4 style={{ fontSize: 16, fontWeight: 700, color: item.featured ? "#fff" : "#1f2d1f", marginBottom: 8 }}>{item.title}</h4>
              <p style={{ color: item.featured ? "rgba(255,255,255,0.78)" : "#6b7c6b", fontSize: 14, lineHeight: 1.65 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════ DIVIDER ══════ */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px" }}>
        <div style={{ height: 1, background: "#dde8de", marginBottom: 52 }} n/>
      </div>

      {/* ══════ CHART SECTION ══════ */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px 72px" }}>

        <div style={{ marginBottom: 36 }}>
          <span style={{ color: "#2d7a4f", fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Statistik Kesehatan</span>
          <h2 className="section-title" style={{ marginTop: 6 }}>Data Kondisi Masyarakat</h2>
          <p style={{ color: "#6b7c6b", marginTop: 6, fontSize: 14 }}>Pembaruan terakhir: Posyandu Juni 2025</p>
        </div>

        {/* Row 1: Stunting Bar + Radial */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 16 }}>

          <div style={{ background: "#fff", border: "1px solid #e4ede6", borderRadius: 20, padding: "26px 22px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1f2d1f", marginBottom: 4 }}>Tren Stunting Balita</h3>
            <p style={{ color: "#6b7c6b", fontSize: 13, marginBottom: 16 }}>Perbandingan balita normal vs stunting per bulan</p>
            <div style={{ display: "flex", gap: 18, marginBottom: 14 }}>
              {[{ c: "#2d7a4f", l: "Normal" }, { c: "#dc2626", l: "Stunting" }].map(({ c, l }) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: c }} />
                  <span style={{ color: "#6b7c6b", fontSize: 13 }}>{l}</span>
                </div>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={stuntingData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2ee" />
                <XAxis dataKey="bulan" tick={{ fill: "#9aab9a", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#9aab9a", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="normal" name="Normal" fill="#2d7a4f" radius={[6,6,0,0]} />
                <Bar dataKey="stunting" name="Stunting" fill="#dc2626" radius={[6,6,0,0]} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background: "#fff", border: "1px solid #e4ede6", borderRadius: 20, padding: "26px 22px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1f2d1f", marginBottom: 4 }}>Indikator Balita</h3>
            <p style={{ color: "#6b7c6b", fontSize: 13, marginBottom: 8 }}>Persentase capaian indikator</p>
            <ResponsiveContainer width="100%" height={200}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="88%" data={radialData} startAngle={180} endAngle={-180}>
                <RadialBar minAngle={15} dataKey="value" cornerRadius={5} background={{ fill: "#f0f6f2" }} />
                <Legend iconSize={9} iconType="circle" formatter={(v) => <span style={{ color: "#6b7c6b", fontSize: 12 }}>{v}</span>} />
                <Tooltip formatter={(v) => [`${v}%`]} contentStyle={{ background: "#fff", border: "1px solid #dde8de", borderRadius: 10 }} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Row 2: Hipertensi + Gula + Area */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.4fr", gap: 16 }}>

          <div style={{ background: "#fff", border: "1px solid #e4ede6", borderRadius: 20, padding: "26px 22px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1f2d1f", marginBottom: 4 }}>Risiko Hipertensi</h3>
            <p style={{ color: "#6b7c6b", fontSize: 12, marginBottom: 4 }}>Distribusi kondisi lansia</p>
            <ResponsiveContainer width="100%" height={190}>
              <PieChart>
                <Pie data={hipertensiData} cx="50%" cy="50%" innerRadius={50} outerRadius={76} paddingAngle={4} dataKey="value">
                  {hipertensiData.map((e, i) => <Cell key={i} fill={e.color} stroke="transparent" />)}
                </Pie>
                <Tooltip formatter={(v, n) => [`${v} orang`, n]} contentStyle={{ background: "#fff", border: "1px solid #dde8de", borderRadius: 10 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {hipertensiData.map(({ name, value, color }) => (
                <div key={name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                    <span style={{ color: "#6b7c6b", fontSize: 12 }}>{name}</span>
                  </div>
                  <span style={{ color: "#1f2d1f", fontSize: 13, fontWeight: 700 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "#fff", border: "1px solid #e4ede6", borderRadius: 20, padding: "26px 22px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1f2d1f", marginBottom: 4 }}>Kadar Gula Darah</h3>
            <p style={{ color: "#6b7c6b", fontSize: 12, marginBottom: 4 }}>Distribusi kondisi lansia</p>
            <ResponsiveContainer width="100%" height={190}>
              <PieChart>
                <Pie data={gulaData} cx="50%" cy="50%" innerRadius={50} outerRadius={76} paddingAngle={4} dataKey="value">
                  {gulaData.map((e, i) => <Cell key={i} fill={e.color} stroke="transparent" />)}
                </Pie>
                <Tooltip formatter={(v, n) => [`${v} orang`, n]} contentStyle={{ background: "#fff", border: "1px solid #dde8de", borderRadius: 10 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {gulaData.map(({ name, value, color }) => (
                <div key={name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                    <span style={{ color: "#6b7c6b", fontSize: 12 }}>{name}</span>
                  </div>
                  <span style={{ color: "#1f2d1f", fontSize: 13, fontWeight: 700 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "#fff", border: "1px solid #e4ede6", borderRadius: 20, padding: "26px 22px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1f2d1f", marginBottom: 4 }}>Kunjungan Posyandu</h3>
            <p style={{ color: "#6b7c6b", fontSize: 12, marginBottom: 12 }}>Jumlah kunjungan per bulan 2025</p>
            <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
              {[{ c: "#2d7a4f", l: "Balita" }, { c: "#d97706", l: "Lansia" }].map(({ c, l }) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: c }} />
                  <span style={{ color: "#6b7c6b", fontSize: 12 }}>{l}</span>
                </div>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={[
                { bulan: "Jan", balita: 88, lansia: 52 },
                { bulan: "Feb", balita: 92, lansia: 57 },
                { bulan: "Mar", balita: 86, lansia: 60 },
                { bulan: "Apr", balita: 95, lansia: 63 },
                { bulan: "Mei", balita: 100, lansia: 68 },
                { bulan: "Jun", balita: 108, lansia: 72 },
              ]}>
                <defs>
                  <linearGradient id="gBalita" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2d7a4f" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2d7a4f" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gLansia" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2ee" />
                <XAxis dataKey="bulan" tick={{ fill: "#9aab9a", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#9aab9a", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="balita" name="Balita" stroke="#2d7a4f" strokeWidth={2.5} fill="url(#gBalita)" dot={{ fill: "#2d7a4f", r: 4, strokeWidth: 0 }} />
                <Area type="monotone" dataKey="lansia" name="Lansia" stroke="#d97706" strokeWidth={2.5} fill="url(#gLansia)" dot={{ fill: "#d97706", r: 4, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* ══════ CTA ══════ */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px 72px" }}>
        <div style={{ background: "linear-gradient(135deg, #1e5c38, #2d7a4f)", borderRadius: 24, padding: "52px 44px", textAlign: "center", position: "relative", overflow: "hidden", boxShadow: "0 12px 32px rgba(45,122,79,0.22)" }}>
          <div style={{ position: "absolute", top: -50, right: -50, width: 200, height: 200, background: "rgba(255,255,255,0.06)", borderRadius: "50%" }} />
          <div style={{ position: "absolute", bottom: -40, left: -40, width: 160, height: 160, background: "rgba(255,255,255,0.06)", borderRadius: "50%" }} />
          <div style={{ position: "relative" }}>
            <h2 style={{ fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 800, color: "#fff", marginBottom: 12, letterSpacing: -0.5 }}>Mulai Monitoring Desa Anda</h2>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 15, maxWidth: 460, margin: "0 auto 28px" }}>Bergabung dengan program SmartHealth Village dan wujudkan desa yang lebih sehat bersama kami.</p>
            <button style={{ background: "#fff", color: "#2d7a4f", border: "none", padding: "14px 32px", borderRadius: 50, fontSize: 15, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, transition: "transform 0.2s", fontFamily: "'Plus Jakarta Sans', sans-serif", boxShadow: "0 4px 14px rgba(0,0,0,0.1)" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; }}
            >
              Daftar Sekarang <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ══════ FOOTER ══════ */}
      <footer style={{ background: "#1a2e1e" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "52px 32px 28px" }}>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 44, marginBottom: 44 }}>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ background: "#2d7a4f", borderRadius: 10, padding: "7px 8px", display: "flex" }}>
                  <HeartPulse size={17} color="white" />
                </div>
                <span style={{ fontWeight: 800, fontSize: 15, color: "#e8f5ed" }}>
                  SmartHealth<span style={{ color: "#6abd8f" }}>Village</span>
                </span>
              </div>
              <p style={{ color: "#4d6655", fontSize: 14, lineHeight: 1.7, maxWidth: 270 }}>
                Platform digital untuk monitoring kesehatan masyarakat desa yang terintegrasi dan berbasis data.
              </p>
              <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
                {["FB", "IG", "TW"].map((s) => (
                  <div key={s} style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#4d6655", fontSize: 11, fontWeight: 700, transition: "all 0.2s" }}
                    onMouseEnter={e => { e.target.style.background = "rgba(45,122,79,0.25)"; e.target.style.color = "#6abd8f"; }}
                    onMouseLeave={e => { e.target.style.background = "rgba(255,255,255,0.05)"; e.target.style.color = "#4d6655"; }}
                  >{s}</div>
                ))}
              </div>
            </div>

            {[
              { title: "Platform", links: ["Dashboard", "Monitoring Balita", "Monitoring Lansia", "Laporan"] },
              { title: "Program", links: ["Posyandu", "Deteksi Stunting", "Cek Hipertensi", "Vaksinasi"] },
            ].map(({ title, links }) => (
              <div key={title}>
                <h5 style={{ color: "#c8dece", fontWeight: 700, fontSize: 13, marginBottom: 14, letterSpacing: 0.3 }}>{title}</h5>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 9 }}>
                  {links.map((l) => (
                    <li key={l}>
                      <a href="#" style={{ color: "#4d6655", fontSize: 14, textDecoration: "none", transition: "color 0.2s" }}
                        onMouseEnter={e => { e.target.style.color = "#7aaa8a"; }}
                        onMouseLeave={e => { e.target.style.color = "#4d6655"; }}
                      >{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div>
              <h5 style={{ color: "#c8dece", fontWeight: 700, fontSize: 13, marginBottom: 14, letterSpacing: 0.3 }}>Kontak</h5>
              <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                {[
                  { icon: MapPin, text: "Jl. Desa Ceria No.1, Jawa Tengah" },
                  { icon: Phone, text: "+62 812-3456-7890" },
                  { icon: Mail, text: "info@smarthealthvillage.id" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
                    <Icon size={14} color="#3a9e6e" style={{ marginTop: 2, flexShrink: 0 }} />
                    <span style={{ color: "#4d6655", fontSize: 13, lineHeight: 1.5 }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 22 }} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ color: "#344d3c", fontSize: 13 }}>
              © 2025 <span style={{ color: "#6abd8f", fontWeight: 600 }}>SmartHealth Village</span> — Menuju Desa Yang Lebih Sehat
            </p>
            <div style={{ display: "flex", gap: 18 }}>
              {["Kebijakan Privasi", "Syarat & Ketentuan"].map((l) => (
                <a key={l} href="#" style={{ color: "#344d3c", fontSize: 13, textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={e => { e.target.style.color = "#4d6655"; }}
                  onMouseLeave={e => { e.target.style.color = "#344d3c"; }}
                >{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}