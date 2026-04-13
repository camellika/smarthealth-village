"use client";
import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";
import {
  User, HeartPulse, TrendingUp, Users, Baby, Activity,
  ShieldCheck, Stethoscope, ChevronRight, MapPin, Phone,
  Mail, Droplets, Scale, TrendingDown, Calendar, Clock
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadialBarChart, RadialBar, Legend,
  AreaChart, Area
} from "recharts";
import { getBalita } from "@/services/balitaService";
import { getLansia } from "@/services/lansiaService";
import { getPosyanduBalita } from "@/services/posyanduBalitaService";
import { getPosyanduLansia } from "@/services/posyanduLansiaService";
import { getJadwalTerdekat } from "@/services/penjadwalanService";

/* ══════════════════════════════════════════
   TABEL Z-SCORE WHO TB/U
══════════════════════════════════════════ */
const WHO_TB_LAKI = [
  [0, 49.9, 46.1, 44.2], [1, 54.7, 50.8, 48.9], [2, 58.4, 54.4, 52.4], [3, 61.4, 57.3, 55.3],
  [4, 63.9, 59.7, 57.6], [5, 65.9, 61.7, 59.6], [6, 67.6, 63.3, 61.2], [7, 69.2, 64.8, 62.7],
  [8, 70.6, 66.2, 64.0], [9, 72.0, 67.5, 65.2], [10, 73.3, 68.7, 66.4], [11, 74.5, 69.9, 67.6],
  [12, 75.7, 71.0, 68.6], [13, 76.9, 72.1, 69.6], [14, 78.0, 73.1, 70.6], [15, 79.1, 74.1, 71.6],
  [16, 80.2, 75.0, 72.5], [17, 81.2, 75.9, 73.4], [18, 82.3, 76.9, 74.2], [19, 83.2, 77.7, 75.0],
  [20, 84.2, 78.6, 75.9], [21, 85.1, 79.4, 76.7], [22, 86.0, 80.2, 77.4], [23, 86.9, 81.0, 78.2],
  [24, 87.8, 81.7, 78.8], [25, 88.7, 82.6, 79.6], [26, 89.6, 83.4, 80.4], [27, 90.4, 84.2, 81.1],
  [28, 91.2, 84.9, 81.8], [29, 92.0, 85.7, 82.6], [30, 92.9, 86.5, 83.3], [31, 93.7, 87.2, 84.0],
  [32, 94.4, 87.9, 84.7], [33, 95.2, 88.6, 85.4], [34, 96.0, 89.3, 86.0], [35, 96.7, 90.0, 86.7],
  [36, 97.4, 90.7, 87.3], [37, 98.2, 91.4, 88.0], [38, 98.9, 92.0, 88.6], [39, 99.6, 92.7, 89.2],
  [40, 100.3, 93.3, 89.8], [41, 101.0, 93.9, 90.4], [42, 101.7, 94.5, 91.0], [43, 102.4, 95.1, 91.6],
  [44, 103.1, 95.7, 92.2], [45, 103.8, 96.3, 92.8], [46, 104.4, 96.9, 93.3], [47, 105.1, 97.5, 93.9],
  [48, 105.7, 98.1, 94.4], [49, 106.4, 98.7, 95.0], [50, 107.0, 99.3, 95.5], [51, 107.6, 99.8, 96.0],
  [52, 108.2, 100.4, 96.6], [53, 108.9, 101.0, 97.1], [54, 109.5, 101.5, 97.6], [55, 110.1, 102.1, 98.1],
  [56, 110.7, 102.6, 98.6], [57, 111.3, 103.1, 99.2], [58, 111.9, 103.7, 99.7], [59, 112.5, 104.2, 100.2],
  [60, 113.0, 104.7, 100.7],
];
const WHO_TB_PEREMPUAN = [
  [0, 49.1, 45.4, 43.6], [1, 53.7, 49.8, 47.8], [2, 57.1, 53.0, 51.0], [3, 59.8, 55.6, 53.5],
  [4, 62.1, 57.8, 55.6], [5, 64.0, 59.6, 57.4], [6, 65.7, 61.2, 59.0], [7, 67.3, 62.7, 60.5],
  [8, 68.7, 64.0, 61.7], [9, 70.1, 65.3, 63.0], [10, 71.5, 66.5, 64.2], [11, 72.8, 67.7, 65.4],
  [12, 74.0, 68.9, 66.5], [13, 75.2, 70.0, 67.6], [14, 76.4, 71.1, 68.7], [15, 77.5, 72.1, 69.7],
  [16, 78.6, 73.1, 70.7], [17, 79.7, 74.1, 71.7], [18, 80.7, 75.1, 72.6], [19, 81.7, 76.0, 73.5],
  [20, 82.7, 76.9, 74.4], [21, 83.7, 77.8, 75.2], [22, 84.6, 78.7, 76.1], [23, 85.5, 79.6, 77.0],
  [24, 86.4, 80.3, 77.7], [25, 87.4, 81.3, 78.6], [26, 88.3, 82.1, 79.4], [27, 89.1, 82.9, 80.2],
  [28, 90.0, 83.8, 81.0], [29, 90.8, 84.5, 81.8], [30, 91.6, 85.3, 82.5], [31, 92.4, 86.1, 83.3],
  [32, 93.2, 86.8, 84.0], [33, 94.0, 87.5, 84.7], [34, 94.7, 88.2, 85.4], [35, 95.4, 88.9, 86.0],
  [36, 96.1, 89.6, 86.7], [37, 96.9, 90.3, 87.3], [38, 97.6, 91.0, 87.9], [39, 98.3, 91.7, 88.5],
  [40, 99.0, 92.3, 89.2], [41, 99.7, 92.9, 89.8], [42, 100.3, 93.5, 90.3], [43, 101.0, 94.2, 90.9],
  [44, 101.6, 94.8, 91.5], [45, 102.3, 95.4, 92.1], [46, 102.9, 96.0, 92.6], [47, 103.5, 96.6, 93.2],
  [48, 104.1, 97.2, 93.8], [49, 104.8, 97.7, 94.3], [50, 105.4, 98.3, 94.8], [51, 106.0, 98.8, 95.4],
  [52, 106.5, 99.4, 95.9], [53, 107.1, 100.0, 96.4], [54, 107.7, 100.5, 97.0], [55, 108.3, 101.0, 97.5],
  [56, 108.8, 101.6, 98.0], [57, 109.4, 102.1, 98.5], [58, 110.0, 102.6, 99.0], [59, 110.5, 103.1, 99.5],
  [60, 111.0, 103.7, 100.0],
];

/* ── Status helpers ── */
function hitungUsiaBulan(tglLahir, tglPemeriksaan) {
  if (!tglLahir) return null;
  const lahir = new Date(tglLahir);
  const pem = tglPemeriksaan ? new Date(tglPemeriksaan) : new Date();
  return Math.floor((pem - lahir) / (1000 * 60 * 60 * 24 * 30.44));
}

function hitungStatusStunting(tb, usiaBulan, jenisKelamin) {
  if (!tb || usiaBulan === null || usiaBulan < 0 || usiaBulan > 60) return null;
  const tabel = jenisKelamin === "Perempuan" ? WHO_TB_PEREMPUAN : WHO_TB_LAKI;
  const bulan = Math.min(Math.round(usiaBulan), 60);
  const row = tabel.find(r => r[0] === bulan);
  if (!row) return null;
  const [, median, sd2, sd3] = row;
  const sd = median - sd2;
  const z = sd > 0 ? (tb - median) / sd : 0;
  if (z < -3) return "severely_stunting";
  if (z < -2) return "stunting";
  return "normal";
}

function getStatusTensi(tensi) {
  if (!tensi) return null;
  if (tensi >= 160) return { label: "Hipertensi Tk. 2", group: "tinggi" };
  if (tensi >= 140) return { label: "Hipertensi Tk. 1", group: "tinggi" };
  if (tensi >= 120) return { label: "Pra-Hipertensi", group: "pra" };
  if (tensi < 90) return { label: "Tensi Rendah", group: "rendah" };
  return { label: "Normal", group: "normal" };
}

function getStatusGula(gula) {
  if (!gula) return null;
  if (gula >= 200) return { label: "Diabetes", group: "diabetes" };
  if (gula >= 100) return { label: "Pra-Diabetes", group: "pra" };
  return { label: "Normal", group: "normal" };
}

/* ── Format tanggal ── */
const HARI_ID = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const BULAN_ID_FULL = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

function formatTanggal(tgl) {
  const d = new Date(tgl);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dDay = new Date(d);
  dDay.setHours(0, 0, 0, 0);
  return {
    hari: HARI_ID[d.getDay()],
    tanggal: d.getDate(),
    bulan: BULAN_ID_FULL[d.getMonth()],
    tahun: d.getFullYear(),
    isHariIni: dDay.getTime() === today.getTime(),
    isAkan: dDay.getTime() > today.getTime(),
  };
}

/* ── 6 bulan terakhir ── */
function get6BulanTerakhir() {
  const BULAN_ID = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const result = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push({ tahun: d.getFullYear(), bulan: d.getMonth(), label: BULAN_ID[d.getMonth()] });
  }
  return result;
}

/* ── Health info & tips (static) ── */
const healthInfoCards = [
  {
    icon: HeartPulse, title: "Tekanan Darah Normal", accent: "#2d7a4f", lightBg: "#e8f5ed",
    items: [
      { label: "Normal", value: "< 120/80 mmHg", color: "#2d7a4f", bg: "#e8f5ed" },
      { label: "Pra-Hipertensi", value: "120–139 / 80–89 mmHg", color: "#d97706", bg: "#fef3c7" },
      { label: "Hipertensi Tkt 1", value: "140–159 / 90–99 mmHg", color: "#ea580c", bg: "#ffedd5" },
      { label: "Hipertensi Tkt 2", value: "≥ 160 / ≥ 100 mmHg", color: "#dc2626", bg: "#fee2e2" },
    ],
    tip: "💡 Kurangi garam, olahraga rutin, dan hindari stres untuk menjaga tekanan darah tetap normal.",
  },
  {
    icon: Droplets, title: "Kadar Gula Darah", accent: "#0891b2", lightBg: "#e0f2fe",
    items: [
      { label: "Normal (puasa)", value: "70–100 mg/dL", color: "#0891b2", bg: "#e0f2fe" },
      { label: "Normal (2 jam pp)", value: "< 140 mg/dL", color: "#2d7a4f", bg: "#e8f5ed" },
      { label: "Pra-Diabetes", value: "100–125 mg/dL", color: "#d97706", bg: "#fef3c7" },
      { label: "Diabetes", value: "≥ 126 mg/dL (puasa)", color: "#dc2626", bg: "#fee2e2" },
    ],
    tip: "💡 Batasi konsumsi gula dan karbohidrat olahan. Perbanyak sayur, buah, dan air putih.",
  },
  {
    icon: Scale, title: "Berat Badan Ideal (BMI)", accent: "#7c3aed", lightBg: "#ede9fe",
    items: [
      { label: "Kurus", value: "BMI < 18,5", color: "#0891b2", bg: "#e0f2fe" },
      { label: "Normal", value: "BMI 18,5 – 24,9", color: "#2d7a4f", bg: "#e8f5ed" },
      { label: "Kelebihan Berat", value: "BMI 25,0 – 29,9", color: "#d97706", bg: "#fef3c7" },
      { label: "Obesitas", value: "BMI ≥ 30", color: "#dc2626", bg: "#fee2e2" },
    ],
    tip: "💡 BMI = berat badan (kg) ÷ tinggi badan² (m). Olahraga 30 menit/hari sangat dianjurkan.",
  },
  {
    icon: Baby, title: "Pertumbuhan Balita (TB/U)", accent: "#d97706", lightBg: "#fef3c7",
    items: [
      { label: "Normal", value: "Z-score ≥ -2 SD", color: "#2d7a4f", bg: "#e8f5ed" },
      { label: "Pendek (Stunting)", value: "Z-score -3 s/d -2 SD", color: "#d97706", bg: "#fef3c7" },
      { label: "Sangat Pendek", value: "Z-score < -3 SD", color: "#dc2626", bg: "#fee2e2" },
      { label: "Tinggi", value: "Z-score > +2 SD", color: "#0891b2", bg: "#e0f2fe" },
    ],
    tip: "💡 Berikan ASI eksklusif 6 bulan, MPASI bergizi, dan rutin ke posyandu setiap bulan.",
  },
];

const tipsData = [
  { emoji: "🥗", title: "Pola Makan Sehat", desc: "Konsumsi sayur & buah minimal 5 porsi/hari. Kurangi makanan berminyak, manis, dan asin." },
  { emoji: "🚶", title: "Aktif Bergerak", desc: "Olahraga ringan 30 menit setiap hari seperti jalan kaki, senam, atau bersepeda santai." },
  { emoji: "💧", title: "Minum Air Cukup", desc: "Minum 8 gelas (±2 liter) air putih per hari untuk menjaga metabolisme tubuh." },
  { emoji: "😴", title: "Tidur Berkualitas", desc: "Dewasa butuh 7–9 jam tidur/malam. Anak-anak dan balita memerlukan lebih banyak waktu tidur." },
  { emoji: "🏥", title: "Periksa Rutin", desc: "Kunjungi posyandu setiap bulan dan lakukan pemeriksaan kesehatan berkala di puskesmas." },
  { emoji: "🚭", title: "Hindari Rokok & Alkohol", desc: "Merokok meningkatkan risiko penyakit jantung, kanker, dan mengganggu tumbuh kembang anak." },
];

/* ── Counter animation ── */
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
  const count = useCounter(typeof value === "number" ? value : parseInt(value) || 0);
  return (
    <div style={{
      background: "#fff", border: "1px solid #e4ede6", borderRadius: 16,
      padding: "22px 20px", position: "relative", overflow: "hidden",
      transition: "transform 0.2s, box-shadow 0.2s", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
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
      <div style={{ fontSize: 34, fontWeight: 800, color: "#1f2d1f", letterSpacing: -1 }}>{count}</div>
      {sub && <p style={{ color: "#9aab9a", fontSize: 12, marginTop: 4 }}>{sub}</p>}
    </div>
  );
}

/* ══════════════════════════════════════════
   JADWAL CARD COMPONENT
══════════════════════════════════════════ */
function JadwalCard({ jadwal }) {
  const fmt = formatTanggal(jadwal.tanggal);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        border: fmt.isHariIni ? "2px solid #2d7a4f" : "1px solid #dde8de",
        borderRadius: 18,
        padding: "20px 22px",
        boxShadow: hovered
          ? "0 12px 32px rgba(45,122,79,0.14)"
          : fmt.isHariIni
            ? "0 4px 20px rgba(45,122,79,0.13)"
            : "0 2px 8px rgba(0,0,0,0.04)",
        position: "relative",
        overflow: "hidden",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        transition: "all 0.25s ease",
        cursor: "default",
      }}
    >
      {/* Top accent bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 4,
        background: fmt.isHariIni
          ? "linear-gradient(90deg, #2d7a4f, #3a9e6e)"
          : "linear-gradient(90deg, #c8e6d4, #e4ede6)",
        borderRadius: "18px 18px 0 0"
      }} />

      {/* Date bubble — top right */}
      <div style={{
        position: "absolute", top: 16, right: 16,
        background: fmt.isHariIni ? "#e8f5ed" : "#f5f7f4",
        border: `1px solid ${fmt.isHariIni ? "#b8ddc5" : "#dde8de"}`,
        borderRadius: 12,
        padding: "6px 12px",
        textAlign: "center",
        minWidth: 52,
      }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: fmt.isHariIni ? "#2d7a4f" : "#4a5e4a", lineHeight: 1 }}>
          {fmt.tanggal}
        </div>
        <div style={{ fontSize: 10, fontWeight: 600, color: fmt.isHariIni ? "#3a9e6e" : "#9aab9a", textTransform: "uppercase", letterSpacing: 0.5, marginTop: 2 }}>
          {fmt.bulan.slice(0, 3)}
        </div>
      </div>

      {/* Badge */}
      <div style={{ marginBottom: 12, paddingRight: 72 }}>
        {fmt.isHariIni ? (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#e8f5ed", border: "1px solid #b8ddc5", borderRadius: 50, padding: "3px 10px" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#2d7a4f", animation: "pulse-dot 2s ease-in-out infinite" }} />
            <span style={{ color: "#2d7a4f", fontSize: 11, fontWeight: 700 }}>HARI INI</span>
          </div>
        ) : fmt.isAkan ? (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 50, padding: "3px 10px" }}>
            <Clock size={10} color="#d97706" />
            <span style={{ color: "#d97706", fontSize: 11, fontWeight: 700 }}>AKAN DATANG</span>
          </div>
        ) : (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#f5f7f4", border: "1px solid #dde8de", borderRadius: 50, padding: "3px 10px" }}>
            <span style={{ color: "#9aab9a", fontSize: 11, fontWeight: 700 }}>SELESAI</span>
          </div>
        )}
      </div>

      {/* Kegiatan */}
      <h4 style={{ fontSize: 15, fontWeight: 700, color: "#1f2d1f", marginBottom: 14, lineHeight: 1.4, paddingRight: 72 }}>
        {jadwal.kegiatan}
      </h4>

      {/* Divider */}
      <div style={{ height: 1, background: "#f0f4f1", marginBottom: 14 }} />

      {/* Info rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ background: "#e8f5ed", borderRadius: 8, padding: "5px 6px", flexShrink: 0 }}>
            <Calendar size={12} color="#2d7a4f" />
          </div>
          <span style={{ color: "#4a5e4a", fontSize: 13 }}>
            {fmt.hari}, {fmt.tanggal} {fmt.bulan} {fmt.tahun}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ background: "#e8f5ed", borderRadius: 8, padding: "5px 6px", flexShrink: 0 }}>
            <MapPin size={12} color="#2d7a4f" />
          </div>
          <span style={{ color: "#4a5e4a", fontSize: 13 }}>{jadwal.tempat}</span>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   HALAMAN UTAMA
══════════════════════════════════════════ */
export default function Home() {
  const [loading, setLoading] = useState(true);

  /* raw data */
  const [balitaList, setBalitaList] = useState([]);
  const [lansiaList, setLansiaList] = useState([]);
  const [pemBalita, setPemBalita] = useState([]);
  const [pemLansia, setPemLansia] = useState([]);
  const [jadwalList, setJadwalList] = useState([]);

  /* computed stats */
  const [stats, setStats] = useState({ balita: 0, lansia: 0, stunting: 0, severelyStunting: 0, hipertensi: 0 });
  const [stuntingChartData, setStuntingChartData] = useState([]);
  const [hipertensiData, setHipertensiData] = useState([]);
  const [gulaData, setGulaData] = useState([]);
  const [kunjunganData, setKunjunganData] = useState([]);

  useEffect(() => {
    async function loadAll() {
      try {
        const [bl, ll, pb, pl, jd] = await Promise.all([
          getBalita(), getLansia(), getPosyanduBalita(), getPosyanduLansia(), getJadwalTerdekat()
        ]);
        setBalitaList(bl);
        setLansiaList(ll);
        setPemBalita(pb);
        setPemLansia(pl);
        setJadwalList(jd);
        computeStats(bl, ll, pb, pl);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  function computeStats(bl, ll, pb, pl) {
    const bulan6 = get6BulanTerakhir();

    /* ── Stunting ── */
    let stuntingCount = 0, severeCount = 0;
    bl.forEach(b => {
      const pemB = pb.filter(p => p.balitaId === b.id).sort((a, c) => new Date(c.tanggal) - new Date(a.tanggal));
      if (!pemB.length) return;
      const last = pemB[0];
      const usia = hitungUsiaBulan(b.tglLahir, last.tanggal);
      if (usia === null || !last.tb) return;
      const s = hitungStatusStunting(parseFloat(last.tb), usia, b.jenisKelamin);
      if (s === "stunting") stuntingCount++;
      if (s === "severely_stunting") severeCount++;
    });

    /* ── Hipertensi ── */
    let hiperCount = 0;
    ll.forEach(l => {
      const pemL = pl.filter(p => p.lansiaId === l.id).sort((a, c) => new Date(c.tanggal) - new Date(a.tanggal));
      if (!pemL.length) return;
      const last = pemL[0];
      const s = getStatusTensi(last.tensi);
      if (s && (s.group === "tinggi" || s.group === "pra")) hiperCount++;
    });

    setStats({
      balita: bl.length,
      lansia: ll.length,
      stunting: stuntingCount,
      severelyStunting: severeCount,
      hipertensi: hiperCount,
    });

    /* ── Chart stunting 6 bulan ── */
    const stuntingChart = bulan6.map(({ tahun, bulan, label }) => {
      let normal = 0, stunting = 0, severely = 0;
      bl.forEach(b => {
        const pemB = pb
          .filter(p => p.balitaId === b.id)
          .filter(p => { const d = new Date(p.tanggal); return d.getFullYear() === tahun && d.getMonth() === bulan; })
          .sort((a, c) => new Date(c.tanggal) - new Date(a.tanggal));
        if (!pemB.length) return;
        const last = pemB[0];
        const usia = hitungUsiaBulan(b.tglLahir, last.tanggal);
        if (usia === null || !last.tb) { normal++; return; }
        const s = hitungStatusStunting(parseFloat(last.tb), usia, b.jenisKelamin);
        if (s === "severely_stunting") severely++;
        else if (s === "stunting") stunting++;
        else normal++;
      });
      return { bulan: label, normal, stunting, severely };
    });
    setStuntingChartData(stuntingChart);

    /* ── Chart hipertensi ── */
    const hiperMap = { Normal: 0, "Pra-Hipertensi": 0, "Hipertensi Tk. 1": 0, "Hipertensi Tk. 2": 0 };
    ll.forEach(l => {
      const pemL = pl.filter(p => p.lansiaId === l.id).sort((a, c) => new Date(c.tanggal) - new Date(a.tanggal));
      if (!pemL.length) return;
      const last = pemL[0];
      const s = getStatusTensi(last.tensi);
      if (!s) return;
      if (hiperMap[s.label] !== undefined) hiperMap[s.label]++;
      else hiperMap["Normal"]++;
    });
    setHipertensiData([
      { name: "Normal", value: hiperMap["Normal"], color: "#2d7a4f" },
      { name: "Pra-Hipertensi", value: hiperMap["Pra-Hipertensi"], color: "#d97706" },
      { name: "Hipertensi Tk.1", value: hiperMap["Hipertensi Tk. 1"], color: "#ea580c" },
      { name: "Hipertensi Tk.2", value: hiperMap["Hipertensi Tk. 2"], color: "#dc2626" },
    ].filter(d => d.value > 0));

    /* ── Chart gula darah ── */
    const gulaMap = { Normal: 0, "Pra-Diabetes": 0, Diabetes: 0 };
    ll.forEach(l => {
      const pemL = pl.filter(p => p.lansiaId === l.id).sort((a, c) => new Date(c.tanggal) - new Date(a.tanggal));
      if (!pemL.length) return;
      const last = pemL[0];
      const s = getStatusGula(last.gulaDarah);
      if (!s) return;
      gulaMap[s.label] = (gulaMap[s.label] || 0) + 1;
    });
    setGulaData([
      { name: "Normal", value: gulaMap["Normal"], color: "#2d7a4f" },
      { name: "Pra-Diabetes", value: gulaMap["Pra-Diabetes"], color: "#d97706" },
      { name: "Diabetes", value: gulaMap["Diabetes"], color: "#dc2626" },
    ].filter(d => d.value > 0));

    /* ── Chart kunjungan posyandu ── */
    const kunjungan = bulan6.map(({ tahun, bulan, label }) => {
      const balitaKunjungan = new Set(
        pb.filter(p => { const d = new Date(p.tanggal); return d.getFullYear() === tahun && d.getMonth() === bulan; }).map(p => p.balitaId)
      ).size;
      const lansiaKunjungan = new Set(
        pl.filter(p => { const d = new Date(p.tanggal); return d.getFullYear() === tahun && d.getMonth() === bulan; }).map(p => p.lansiaId)
      ).size;
      return { bulan: label, balita: balitaKunjungan, lansia: lansiaKunjungan };
    });
    setKunjunganData(kunjungan);
  }

  /* ── Radial data ── */
  const pctBalitaSehat = stats.balita > 0 ? Math.round(((stats.balita - stats.stunting - stats.severelyStunting) / stats.balita) * 100) : 0;
  const pctGiziBaik = stats.balita > 0 ? Math.round(((stats.balita - stats.severelyStunting) / stats.balita) * 100) : 0;
  const pctLansiaSehat = stats.lansia > 0 ? Math.round(((stats.lansia - stats.hipertensi) / stats.lansia) * 100) : 0;
  const radialData = [
    { name: "Balita Normal", value: pctBalitaSehat, fill: "#d97706" },
    { name: "Gizi Baik", value: pctGiziBaik, fill: "#dc2626" },
    { name: "Lansia Sehat", value: pctLansiaSehat, fill: "#2d7a4f" },
  ];

  /* ── Jadwal terdekat (maks 4 kartu di hero section) ── */
  const jadwalPreview = jadwalList.slice(0, 4);

  return (
    <div style={{ minHeight: "100vh", background: "#f5f7f4", fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#1f2d1f", overflowX: "hidden" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #f0f4f1; }
        ::-webkit-scrollbar-thumb { background: #b5ceba; border-radius: 3px; }
        @keyframes slide-up { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slide-up-delay { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes fade-in { from{opacity:0} to{opacity:1} }
        .hero-title { font-size: clamp(32px, 4.5vw, 56px); font-weight: 800; line-height: 1.1; letter-spacing: -1.5px; color: #1f2d1f; animation: slide-up 0.7s ease both; }
        .section-title { font-size: clamp(22px, 2.8vw, 32px); font-weight: 800; letter-spacing: -0.8px; color: #1f2d1f; }
        .card-hover { transition: transform 0.22s, box-shadow 0.22s; }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 12px 28px rgba(45,122,79,0.1) !important; }
        .btn-primary { background: #2d7a4f; color: white; border: none; padding: 13px 26px; border-radius: 50px; font-size: 15px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: all 0.22s; box-shadow: 0 4px 14px rgba(45,122,79,0.3); font-family: 'Plus Jakarta Sans', sans-serif; }
        .btn-primary:hover { background: #246240; transform: translateY(-2px); box-shadow: 0 8px 22px rgba(45,122,79,0.38); }
        .health-info-card { transition: transform 0.22s, box-shadow 0.22s; }
        .health-info-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.1) !important; }
        .tip-card { transition: transform 0.22s, box-shadow 0.22s; }
        .tip-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(45,122,79,0.1) !important; }
        .jadwal-section { animation: fade-in 0.6s 0.3s ease both; opacity: 0; animation-fill-mode: forwards; }
      
        /* ===== RESPONSIVE MOBILE ===== */
        @media (max-width: 768px) {
          /* Container padding */
          section, header > div, footer > div {
            padding-left: 16px !important;
            padding-right: 16px !important;
          }

          /* HERO */
          .hero-container {
            display: grid !important;
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }

          .hero-images {
            grid-template-columns: 1fr !important;
            grid-template-rows: auto !important;
          }

          /* STAT CARDS */
          .stat-grid {
            grid-template-columns: 1fr 1fr !important;
          }

          /* FEATURE */
          .feature-grid {
            grid-template-columns: 1fr !important;
          }

          /* CHART */
          .chart-grid-top {
            grid-template-columns: 1fr !important;
          }

          .chart-grid-bottom {
            grid-template-columns: 1fr !important;
          }

          /* HEALTH INFO */
          .health-grid {
            grid-template-columns: 1fr !important;
          }

          .tips-grid {
            grid-template-columns: 1fr !important;
          }

          /* JADWAL */
          .jadwal-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 768px) {
        .hero-title {
          font-size: 28px !important;
        }

        p {
          font-size: 14px !important;
        }
      }
      
      `}</style>

      {/* ══ NAVBAR ══ */}
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
          <Link href="/login" style={{ display: "flex", alignItems: "center", gap: 8, background: "#2d7a4f", color: "white", padding: "9px 18px", borderRadius: 50, fontSize: 14, fontWeight: 600, textDecoration: "none", transition: "background 0.2s", boxShadow: "0 2px 8px rgba(45,122,79,0.25)" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#246240"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#2d7a4f"; }}>
            <User size={15} /> Masuk
          </Link>
        </div>
      </header>

      {/* ══ HERO ══ */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "64px 32px 52px" }}>
        <div className="hero-container" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "center" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#e8f5ed", border: "1px solid #b8ddc5", borderRadius: 50, padding: "6px 14px", marginBottom: 22 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#2d7a4f", animation: "pulse-dot 2s ease-in-out infinite" }} />
              <span style={{ color: "#2d7a4f", fontSize: 13, fontWeight: 600 }}>Sistem Informasi · Desa Panembangan</span>
            </div>
            <h1 className="hero-title">Sistem Monitoring<br /><span style={{ color: "#2d7a4f" }}>Kesehatan Desa</span></h1>
            <p style={{ color: "#5a7060", lineHeight: 1.75, marginTop: 18, fontSize: 15.5, maxWidth: 440, animation: "slide-up 0.7s 0.1s ease both", opacity: 0, animationFillMode: "forwards" }}>
              Platform digital terintegrasi untuk memantau kesehatan balita dan lansia, mendeteksi dini risiko stunting, hipertensi, dan mendukung kegiatan posyandu berbasis data.
            </p>
          </div>
          <div className="hero-images" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "240px 185px", gap: 10 }}>
            <div style={{ gridColumn: "1/-1", borderRadius: 18, overflow: "hidden", position: "relative", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
              <img src="/assets/posyandu.jpg" alt="Kegiatan Posyandu" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(31,45,31,0.4), transparent)" }} />
              <div style={{ position: "absolute", bottom: 14, left: 14, display: "flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,0.92)", borderRadius: 50, padding: "5px 13px" }}>
                <Activity size={13} color="#2d7a4f" />
                <span style={{ color: "#2d7a4f", fontSize: 12, fontWeight: 600 }}>Posyandu Aktif</span>
              </div>
            </div>
            <div style={{ borderRadius: 18, overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
              <img src="/assets/pemeriksaan.jpg" alt="Pemeriksaan" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ borderRadius: 18, overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
              <img src="/assets/lansia.jpg" alt="Monitoring Lansia" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          </div>
        </div>
      </section>

      {/* ══ JADWAL POSYANDU TERDEKAT ══ */}
      <section className="jadwal-section" style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px 56px" }}>
        <div style={{
          background: "linear-gradient(135deg, #f0faf4 0%, #e6f4ec 100%)",
          border: "1px solid #c8e6d4",
          borderRadius: 24,
          padding: "32px 28px",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Decorative background circle */}
          <div style={{
            position: "absolute", top: -60, right: -60,
            width: 220, height: 220,
            borderRadius: "50%",
            background: "rgba(45,122,79,0.06)",
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", bottom: -40, left: -40,
            width: 160, height: 160,
            borderRadius: "50%",
            background: "rgba(45,122,79,0.04)",
            pointerEvents: "none",
          }} />

          {/* Header row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, position: "relative" }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "#2d7a4f", borderRadius: 50, padding: "5px 14px", marginBottom: 10 }}>
                <Calendar size={12} color="white" />
                <span style={{ color: "white", fontSize: 12, fontWeight: 600 }}>Jadwal Terdekat</span>
              </div>
              <h2 style={{ fontSize: "clamp(20px, 2.4vw, 28px)", fontWeight: 800, color: "#1f2d1f", letterSpacing: -0.8, marginBottom: 4 }}>
                Jadwal Posyandu
              </h2>
              <p style={{ color: "#5a7060", fontSize: 14 }}>
                Kegiatan posyandu yang akan datang di wilayah Anda
              </p>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "36px 0", color: "#9aab9a", gap: 10 }}>
              <div style={{ width: 20, height: 20, border: "2.5px solid #c8e6d4", borderTopColor: "#2d7a4f", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
              <span style={{ fontSize: 14 }}>Memuat jadwal…</span>
            </div>
          ) : jadwalPreview.length === 0 ? (
            <div style={{ textAlign: "center", padding: "36px 0", color: "#9aab9a" }}>
              <div style={{ width: 52, height: 52, background: "#e8f5ed", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                <Calendar size={24} color="#b5ceba" />
              </div>
              <p style={{ fontSize: 14, fontWeight: 500 }}>Belum ada jadwal posyandu dalam waktu dekat</p>
              <p style={{ fontSize: 13, marginTop: 4, color: "#b5ceba" }}>Jadwal akan muncul otomatis saat ditambahkan</p>
            </div>
          ) : (
            <div className="jadwal-grid" style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 14,
            }}>
              {jadwalPreview.map((jadwal) => (
                <JadwalCard key={jadwal.id} jadwal={jadwal} />
              ))}
            </div>
          )}

          {/* Footer hint jika ada lebih dari 4 jadwal */}
          {jadwalList.length > 4 && (
            <div style={{ textAlign: "center", marginTop: 18 }}>
              <span style={{ color: "#5a7060", fontSize: 13 }}>
                +{jadwalList.length - 4} jadwal lainnya ·{" "}
                <Link href="/jadwal" style={{ color: "#2d7a4f", fontWeight: 600, textDecoration: "none" }}>
                  Lihat semua
                </Link>
              </span>
            </div>
          )}
        </div>
      </section>

      {/* ══ STAT CARDS ══ */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px 48px" }}>
        {loading
          ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "40px", color: "#9aab9a", gap: 10 }}>
              <div style={{ width: 20, height: 20, border: "2.5px solid #e4ede6", borderTopColor: "#2d7a4f", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
              Memuat data…
            </div>
          ) : (
            <div className="stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14 }}>
              <StatCard icon={Baby} title="Total Balita" value={stats.balita} sub="Terdaftar aktif" accent="#2d7a4f" lightBg="#e8f5ed" />
              <StatCard icon={Users} title="Total Lansia" value={stats.lansia} sub="Dalam pemantauan" accent="#3a9e6e" lightBg="#eaf6f0" />
              <StatCard icon={TrendingUp} title="Kasus Stunting" value={stats.stunting} sub="Berdasarkan pemeriksaan" accent="#d97706" lightBg="#fef3c7" />
              <StatCard icon={TrendingDown} title="Severely Stunting" value={stats.severelyStunting} sub="Perlu penanganan segera" accent="#dc2626" lightBg="#fee2e2" />
              <StatCard icon={HeartPulse} title="Risiko Hipertensi" value={stats.hipertensi} sub="Pra & hipertensi aktif" accent="#be185d" lightBg="#fce7f3" />
            </div>
          )
        }
      </section>

      {/* ══ FEATURE CARDS ══ */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px 56px" }}>
        <div className="feature-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
          {[
            { icon: ShieldCheck, title: "Deteksi Dini", desc: "Identifikasi risiko kesehatan sejak awal melalui analisis data real-time dan historis.", featured: true },
            { icon: Activity, title: "Monitoring Berkala", desc: "Data diperbarui otomatis setiap kegiatan posyandu dengan pencatatan yang terstruktur.", featured: false },
            { icon: Stethoscope, title: "Berbasis Data", desc: "Mendukung keputusan pemerintah desa secara akurat dengan visualisasi yang informatif.", featured: false },
          ].map((item, i) => (
            <div key={i} className="card-hover" style={{
              background: item.featured ? "#2d7a4f" : "#fff",
              border: item.featured ? "none" : "1px solid #e4ede6",
              borderRadius: 18, padding: "26px 22px",
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

      {/* ══ DIVIDER ══ */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px" }}>
        <div style={{ height: 1, background: "#dde8de", marginBottom: 52 }} />
      </div>

      {/* ══ CHART SECTION ══ */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px 72px" }}>
        <div style={{ marginBottom: 36 }}>
          <span style={{ color: "#2d7a4f", fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Statistik Kesehatan</span>
          <h2 className="section-title" style={{ marginTop: 6 }}>Data Kondisi Masyarakat</h2>
          <p style={{ color: "#6b7c6b", marginTop: 6, fontSize: 14 }}>Data real-time berdasarkan pemeriksaan posyandu terakhir</p>
        </div>

        {/* Tren Stunting */}
        <div className="chart-grid-top" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 16 }}>
          <div style={{ background: "#fff", border: "1px solid #e4ede6", borderRadius: 20, padding: "26px 22px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1f2d1f", marginBottom: 4 }}>Tren Stunting Balita</h3>
            <p style={{ color: "#6b7c6b", fontSize: 13, marginBottom: 16 }}>6 bulan terakhir — Normal, Stunting, Severely Stunting</p>
            <div style={{ display: "flex", gap: 18, marginBottom: 14 }}>
              {[{ c: "#2d7a4f", l: "Normal" }, { c: "#d97706", l: "Stunting" }, { c: "#dc2626", l: "Severely" }].map(({ c, l }) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: c }} />
                  <span style={{ color: "#6b7c6b", fontSize: 13 }}>{l}</span>
                </div>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={stuntingChartData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2ee" />
                <XAxis dataKey="bulan" tick={{ fill: "#9aab9a", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#9aab9a", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="normal" name="Normal" fill="#2d7a4f" radius={[6, 6, 0, 0]} />
                <Bar dataKey="stunting" name="Stunting" fill="#d97706" radius={[6, 6, 0, 0]} />
                <Bar dataKey="severely" name="Severely" fill="#dc2626" radius={[6, 6, 0, 0]} opacity={0.9} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Radial */}
          <div style={{ background: "#fff", border: "1px solid #e4ede6", borderRadius: 20, padding: "26px 22px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1f2d1f", marginBottom: 4 }}>Indikator Kesehatan</h3>
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

        {/* Hipertensi Pie */}

        <div className="chart-grid-bottom" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.4fr", gap: 16 }}>
          <div style={{ background: "#fff", border: "1px solid #e4ede6", borderRadius: 20, padding: "26px 22px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1f2d1f", marginBottom: 4 }}>Risiko Hipertensi</h3>
            <p style={{ color: "#6b7c6b", fontSize: 12, marginBottom: 4 }}>Distribusi kondisi lansia</p>
            {hipertensiData.length === 0
              ? <div style={{ padding: "40px 0", textAlign: "center", color: "#9aab9a", fontSize: 13 }}>Belum ada data pemeriksaan lansia</div>
              : (
                <>
                  <ResponsiveContainer width="100%" height={190}>
                    <PieChart>
                      <Pie data={hipertensiData} cx="50%" cy="50%" innerRadius={50} outerRadius={76} paddingAngle={4} dataKey="value">
                        {hipertensiData.map((e, i) => <Cell key={i} fill={e.color} stroke="transparent" />)}
                      </Pie>
                      <Tooltip formatter={(v, n) => [`${v} orang`, n]} contentStyle={{ background: "#fff", border: "1px solid #dde8de", borderRadius: 10 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
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
                </>
              )
            }
          </div>

          {/* Gula Darah Pie */}
          <div style={{ background: "#fff", border: "1px solid #e4ede6", borderRadius: 20, padding: "26px 22px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1f2d1f", marginBottom: 4 }}>Kadar Gula Darah</h3>
            <p style={{ color: "#6b7c6b", fontSize: 12, marginBottom: 4 }}>Distribusi kondisi lansia</p>
            {gulaData.length === 0
              ? <div style={{ padding: "40px 0", textAlign: "center", color: "#9aab9a", fontSize: 13 }}>Belum ada data pemeriksaan lansia</div>
              : (
                <>
                  <ResponsiveContainer width="100%" height={190}>
                    <PieChart>
                      <Pie data={gulaData} cx="50%" cy="50%" innerRadius={50} outerRadius={76} paddingAngle={4} dataKey="value">
                        {gulaData.map((e, i) => <Cell key={i} fill={e.color} stroke="transparent" />)}
                      </Pie>
                      <Tooltip formatter={(v, n) => [`${v} orang`, n]} contentStyle={{ background: "#fff", border: "1px solid #dde8de", borderRadius: 10 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
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
                </>
              )
            }
          </div>

          {/* Kunjungan Posyandu Area */}
          <div style={{ background: "#fff", border: "1px solid #e4ede6", borderRadius: 20, padding: "26px 22px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1f2d1f", marginBottom: 4 }}>Kunjungan Posyandu</h3>
            <p style={{ color: "#6b7c6b", fontSize: 12, marginBottom: 12 }}>Jumlah peserta unik per bulan (6 bulan terakhir)</p>
            <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
              {[{ c: "#2d7a4f", l: "Balita" }, { c: "#d97706", l: "Lansia" }].map(({ c, l }) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: c }} />
                  <span style={{ color: "#6b7c6b", fontSize: 12 }}>{l}</span>
                </div>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={kunjunganData}>
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

      {/* ══ DIVIDER ══ */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px" }}>
        <div style={{ height: 1, background: "#dde8de", marginBottom: 52 }} />
      </div>

      {/* ══ HEALTH INFO ══ */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px 72px" }}>
        <div style={{ marginBottom: 36 }}>
          <span style={{ color: "#2d7a4f", fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Edukasi Kesehatan</span>
          <h2 className="section-title" style={{ marginTop: 6 }}>Informasi Kesehatan untuk Warga</h2>
          <p style={{ color: "#6b7c6b", marginTop: 6, fontSize: 14, maxWidth: 560 }}>Kenali batas normal kondisi kesehatan Anda dan keluarga. Deteksi dini adalah kunci hidup sehat.</p>
        </div>


        <div className="health-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16, marginBottom: 28 }}>
          {healthInfoCards.map((card, i) => (
            <div key={i} className="health-info-card" style={{ background: "#fff", border: "1px solid #e4ede6", borderRadius: 20, padding: "26px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: card.accent, borderRadius: "20px 20px 0 0" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                <div style={{ background: card.lightBg, borderRadius: 12, padding: 10 }}>
                  <card.icon size={20} color={card.accent} />
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1f2d1f" }}>{card.title}</h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                {card.items.map((item, j) => (
                  <div key={j} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: item.bg, borderRadius: 10, padding: "9px 14px" }}>
                    <span style={{ color: "#4a5e4a", fontSize: 13, fontWeight: 500 }}>{item.label}</span>
                    <span style={{ color: item.color, fontSize: 13, fontWeight: 700, textAlign: "right", maxWidth: "55%" }}>{item.value}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: "#f5f7f4", border: "1px solid #dde8de", borderRadius: 10, padding: "10px 14px" }}>
                <p style={{ color: "#5a7060", fontSize: 13, lineHeight: 1.6 }}>{card.tip}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: "linear-gradient(135deg, #2d7a4f 0%, #1e5c39 100%)", borderRadius: 22, padding: "36px 32px", boxShadow: "0 8px 32px rgba(45,122,79,0.2)" }}>
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 4 }}>6 Tips Hidup Sehat Setiap Hari</h3>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 14 }}>Kebiasaan kecil yang berdampak besar untuk kesehatan keluarga Anda</p>
          </div>
          <div className="tips-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
            {tipsData.map((tip, i) => (
              <div key={i} className="tip-card" style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 14, padding: "18px 16px", backdropFilter: "blur(8px)" }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{tip.emoji}</div>
                <h4 style={{ color: "#fff", fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{tip.title}</h4>
                <p style={{ color: "rgba(255,255,255,0.68)", fontSize: 13, lineHeight: 1.6 }}>{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{ background: "#2a4a35" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 32px 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 30, marginBottom: 30 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ background: "#3a9e6e", borderRadius: 10, padding: "7px 8px", display: "flex" }}>
                  <HeartPulse size={17} color="white" />
                </div>
                <span style={{ fontWeight: 800, fontSize: 16, color: "#e8f5ed" }}>SmartHealth<span style={{ color: "#7dd3a8" }}>Village</span></span>
              </div>
              <p style={{ color: "#8abda0", fontSize: 13, lineHeight: 1.7 }}>Platform digital untuk mendukung kegiatan posyandu agar lebih modern, efisien, dan terintegrasi dalam meningkatkan kesehatan masyarakat desa.</p>
            </div>
            <div>
              <h4 style={{ color: "#e8f5ed", fontSize: 14, marginBottom: 10 }}>Layanan</h4>
              {["Monitoring Balita", "Pendataan Lansia", "Jadwal Posyandu", "Laporan Kesehatan"].map(item => (
                <p key={item} style={{ color: "#a8ccb8", fontSize: 13, margin: "6px 0" }}>{item}</p>
              ))}
            </div>
            <div>
              <h4 style={{ color: "#e8f5ed", fontSize: 14, marginBottom: 10 }}>Kontak</h4>
              {[
                { icon: MapPin, text: "Jalan Raya, Dusun I, Panembangan, Cilongok, Banyumas" },
                { icon: Phone, text: "+62 812-3456-7890" },
                { icon: Mail, text: "info@smarthealthvillage.id" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <Icon size={14} color="#7dd3a8" />
                  <span style={{ color: "#a8ccb8", fontSize: 13 }}>{text}</span>
                </div>
              ))}
              <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                {[Facebook, Instagram, Twitter].map((Icon, i) => (
                  <div key={i} style={{ background: "#3a9e6e", padding: 6, borderRadius: 6, cursor: "pointer" }}>
                    <Icon size={14} color="white" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ height: 1, background: "rgba(255,255,255,0.1)", marginBottom: 18 }} />
          <p style={{ color: "#6fa385", fontSize: 13, textAlign: "center" }}>
            © 2025 <span style={{ color: "#7dd3a8", fontWeight: 600 }}>SmartHealth Village</span> — Hak Cipta Dilindungi
          </p>
        </div>
      </footer>
    </div>
  );
}