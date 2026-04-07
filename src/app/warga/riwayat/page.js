"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/services/authService";
import {
  Baby, Search, Calendar, Scale, Ruler,
  Activity, TrendingUp, TrendingDown, Minus,
  ChevronDown, ChevronUp, FileText, AlertTriangle,
  CheckCircle, Clock, Filter, Heart, Droplets, User,
  Info, X, AlertCircle   // ✅ tambahkan ini
} from "lucide-react";
import { getPosyanduBalitaByUser } from "@/services/balitaService";
import { getPosyanduLansiaByUser } from "@/services/lansiaService";


/* ══════════════════════════════════════════
   TABEL Z-SCORE WHO TB/U (0–60 bulan)
   Sumber: WHO Child Growth Standards 2006
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


/* ══════════════════════════════════════════
   FUNGSI STATUS — BALITA
══════════════════════════════════════════ */

/** Status Stunting TB/U berdasarkan tabel WHO */
function hitungStatusStunting(tb, usiaBulan, jenisKelamin) {
  if (!tb || usiaBulan === null || usiaBulan === undefined || usiaBulan < 0 || usiaBulan > 60) return null;
  const tabel = jenisKelamin === "Perempuan" ? WHO_TB_PEREMPUAN : WHO_TB_LAKI;
  const bulan = Math.min(Math.round(usiaBulan), 60);
  const row = tabel.find(r => r[0] === bulan);
  if (!row) return null;
  const [, median, sd2] = row;
  const sd = median - sd2;
  const zScore = sd > 0 ? (tb - median) / sd : 0;
  if (zScore < -3) return { zScore: zScore.toFixed(2), status: "severely_stunting", label: "Severely Stunting", color: "#dc2626", bg: "#fee2e2", icon: "🔴", median, sd2 };
  if (zScore < -2) return { zScore: zScore.toFixed(2), status: "stunting", label: "Stunting", color: "#d97706", bg: "#fef3c7", icon: "🟡", median, sd2 };
  return { zScore: zScore.toFixed(2), status: "normal", label: "Normal", color: "#2d7a4f", bg: "#e8f5ed", icon: "🟢", median, sd2 };
}

/** Status Gizi BB/U (kasar) */
function getStatusBB(bb, tglLahir) {
  if (!bb || !tglLahir) return null;
  const bulan = Math.floor((Date.now() - new Date(tglLahir).getTime()) / (1000 * 60 * 60 * 24 * 30.44));
  const median = bulan <= 12 ? 9 : bulan <= 24 ? 12 : bulan <= 36 ? 14 : bulan <= 48 ? 16 : 18;
  if (bb < median * 0.8) return "buruk";
  if (bb < median * 0.9) return "kurang";
  return "normal";
}

const statusGiziBB = {
  normal: { label: "Normal", color: "#2d7a4f", bg: "#e8f5ed", border: "#b8ddc5", icon: CheckCircle },
  kurang: { label: "BB Kurang", color: "#d97706", bg: "#fef3c7", border: "#fde68a", icon: AlertTriangle },
  buruk: { label: "Gizi Buruk", color: "#dc2626", bg: "#fee2e2", border: "#fecaca", icon: AlertTriangle },
};

const hitungUsiaBulan = (tglLahir, tglPeriksa) => {
  if (!tglLahir || !tglPeriksa) return null;
  return Math.floor((new Date(tglPeriksa) - new Date(tglLahir)) / (1000 * 60 * 60 * 24 * 30.44));
};

function DetailModalBalita({ data, onClose }) {
  if (!data) return null;

  const balita = data.balita;
  const usiaBulan = hitungUsiaBulan(balita?.tglLahir, data.tanggal);
  const stunting = data.tb && usiaBulan !== null
    ? hitungStatusStunting(parseFloat(data.tb), usiaBulan, balita?.jenisKelamin)
    : null;

  const saran = {
    normal: {
      judul: "Pertahankan Tumbuh Kembang Optimal",
      warna: "#2d7a4f", bg: "#e8f5ed", border: "#b8ddc5",
      poin: [
        "✅ Berikan ASI eksklusif hingga usia 6 bulan, lanjutkan hingga 2 tahun",
        "🥦 Perkenalkan MPASI bergizi seimbang: sayur, buah, protein hewani & nabati",
        "🥚 Pastikan asupan protein cukup: telur, ikan, daging, tahu, tempe setiap hari",
        "🌞 Jemur di pagi hari 15–30 menit untuk mendukung pembentukan vitamin D",
        "📅 Rutin kunjungi posyandu setiap bulan untuk pemantauan tumbuh kembang",
        "💊 Berikan suplemen vitamin A sesuai jadwal posyandu",
      ],
    },
    stunting: {
      judul: "Tindakan Penanganan Stunting",
      warna: "#d97706", bg: "#fef3c7", border: "#fde68a",
      poin: [
        "🏥 Segera konsultasikan ke dokter atau ahli gizi untuk penanganan lebih lanjut",
        "🥩 Tingkatkan konsumsi protein hewani: telur, ikan, ayam, daging setiap hari",
        "🫘 Tambahkan sumber protein nabati: tahu, tempe, kacang-kacangan",
        "🥕 Perbanyak sayur dan buah berwarna (wortel, bayam, mangga, pepaya)",
        "🧴 Berikan PMT (Pemberian Makanan Tambahan) sesuai anjuran kader/bidan",
        "💊 Konsumsi suplemen zinc, vitamin A, dan zat besi sesuai resep dokter",
        "📏 Pantau tinggi badan setiap bulan dan catat perkembangannya",
        "🚫 Hindari makanan rendah gizi: mie instan, jajanan manis berlebihan",
      ],
    },
    severely_stunting: {
      judul: "Penanganan Darurat Severely Stunting",
      warna: "#dc2626", bg: "#fee2e2", border: "#fecaca",
      poin: [
        "🚨 Rujuk segera ke Puskesmas atau rumah sakit untuk penanganan intensif",
        "👨‍⚕️ Wajib konsultasi dokter spesialis anak dan ahli gizi klinis",
        "🍼 Ikuti program Therapeutic Feeding / Pemberian Makanan Terapeutik (F75/F100)",
        "🥜 Berikan RUTF (Ready-to-Use Therapeutic Food) jika direkomendasikan dokter",
        "💉 Pantau dan tangani infeksi penyerta (diare, ISPA) yang memperburuk kondisi",
        "📊 Lakukan pemantauan berat dan tinggi badan setiap minggu",
        "🏠 Pastikan lingkungan rumah bersih, air minum aman, sanitasi memadai",
        "❤️ Berikan stimulasi tumbuh kembang: ajak bermain, berbicara, dan berinteraksi aktif",
      ],
    },
  };

  const info = stunting ? saran[stunting.status] : null;

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,30,15,0.45)", backdropFilter: "blur(5px)", zIndex: 200 }} />
      <div style={{
        position: "fixed", top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        width: "min(460px,94vw)", maxHeight: "88vh", overflowY: "auto",
        background: "#fff", borderRadius: 20,
        boxShadow: "0 24px 64px rgba(0,0,0,0.16)",
        zIndex: 201, fontFamily: "'Plus Jakarta Sans',sans-serif",
        animation: "popIn 0.22s cubic-bezier(0.16,1,0.3,1)"
      }}>

        {/* Header */}
        <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid #f0f6f2", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ background: stunting ? stunting.bg : "#f5f7f4", borderRadius: 10, padding: 9 }}>
              <Info size={18} color={stunting ? stunting.color : "#9aab9a"} />
            </div>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: "#1f2d1f" }}>Hasil Pemeriksaan</h2>
              <p style={{ fontSize: 12, color: "#9aab9a", marginTop: 1 }}>{balita?.nama ?? "-"} · {data.kegiatan}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "#f5f7f4", border: "1px solid #e4ede6", borderRadius: 9, padding: "6px 7px", cursor: "pointer", display: "flex" }}>
            <X size={16} color="#6b7c6b" />
          </button>
        </div>

        <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Status Banner */}
          {stunting ? (
            <div style={{ background: stunting.bg, border: `1.5px solid ${stunting.color}35`, borderRadius: 14, padding: "16px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                <span style={{ fontSize: 28 }}>{stunting.icon}</span>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: stunting.color, textTransform: "uppercase", letterSpacing: 0.6 }}>Status Pertumbuhan WHO</p>
                  <p style={{ fontSize: 20, fontWeight: 800, color: stunting.color }}>{stunting.label}</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 16, fontSize: 12, color: stunting.color + "cc", paddingTop: 8, borderTop: `1px solid ${stunting.color}20` }}>
                <span>Z-Score: <strong>{stunting.zScore} SD</strong></span>
                <span>Median WHO: <strong>{stunting.median} cm</strong></span>
                <span>-2 SD: <strong>{stunting.sd2} cm</strong></span>
              </div>
            </div>
          ) : (
            <div style={{ background: "#f8fbf9", border: "1px solid #e4ede6", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
              <AlertCircle size={16} color="#9aab9a" />
              <p style={{ fontSize: 13, color: "#9aab9a" }}>Data tinggi badan belum tersedia — status tidak dapat dihitung.</p>
            </div>
          )}

          {/* Data Pengukuran */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#9aab9a", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>Hasil Pengukuran</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                { label: "Berat Badan", value: data.bb ? `${data.bb} kg` : "-", accent: true },
                { label: "Tinggi Badan", value: data.tb ? `${data.tb} cm` : "-", accent: true },
                { label: "Lingkar Kepala", value: data.lingkarKepala ? `${data.lingkarKepala} cm` : "-" },
              ].map(({ label, value, accent }) => (
                <div key={label} style={{ background: accent ? "#e8f5ed" : "#f8fbf9", border: `1px solid ${accent ? "#b8ddc5" : "#f0f6f2"}`, borderRadius: 10, padding: "10px 12px" }}>
                  <p style={{ fontSize: 11, color: accent ? "#2d7a4f" : "#9aab9a", fontWeight: 600 }}>{label}</p>
                  <p style={{ fontSize: 16, fontWeight: 800, color: accent ? "#2d7a4f" : "#1f2d1f", marginTop: 2 }}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Saran & Tindakan */}
          {info && (
            <div style={{ background: info.bg, border: `1.5px solid ${info.border}`, borderRadius: 14, padding: "14px 16px" }}>
              <p style={{ fontSize: 13, fontWeight: 800, color: info.warna, marginBottom: 12 }}>💡 {info.judul}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {info.poin.map((p, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.6)", borderRadius: 8, padding: "8px 12px" }}>
                    <p style={{ fontSize: 12, color: "#1f2d1f", lineHeight: 1.6 }}>{p}</p>
                  </div>
                ))}
              </div>
            </div>
          )}



        </div>

        <div style={{ padding: "12px 20px", borderTop: "1px solid #f0f6f2", position: "sticky", bottom: 0, background: "#fff" }}>
          <button onClick={onClose} style={{ width: "100%", padding: "11px", background: "#2d7a4f", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            Tutup
          </button>
        </div>
      </div>
    </>
  );
}


function DetailModalLansia({ data, onClose }) {
  if (!data) return null;

  const tensiStatus = data.tensi ? getStatusTensi(parseFloat(data.tensi)) : null;
  const gulaStatus = data.gulaDarah ? getStatusGula(parseFloat(data.gulaDarah)) : null;

  const saranTensi = {
    normal: {
      judul: "Pertahankan Tekanan Darah Normal",
      warna: "#2d7a4f", bg: "#e8f5ed", border: "#b8ddc5",
      poin: [
        "✅ Pertahankan pola makan rendah garam dan lemak jenuh",
        "🚶 Lakukan aktivitas fisik ringan seperti jalan kaki 30 menit/hari",
        "🧘 Kelola stres dengan istirahat cukup dan relaksasi",
        "💊 Rutin kontrol tekanan darah minimal sebulan sekali",
        "🚭 Hindari rokok dan konsumsi alkohol",
        "🥦 Perbanyak konsumsi buah, sayur, dan makanan berserat tinggi",
      ],
    },
    prehiper: {
      judul: "Waspadai Pra-Hipertensi",
      warna: "#d97706", bg: "#fef3c7", border: "#fde68a",
      poin: [
        "⚠️ Kurangi konsumsi garam — maksimal 1 sendok teh/hari",
        "🏃 Tingkatkan aktivitas fisik secara bertahap dan konsisten",
        "🥗 Terapkan diet DASH: banyak buah, sayur, dan produk susu rendah lemak",
        "⚖️ Jaga berat badan ideal — turunkan bila berlebih",
        "📅 Pantau tekanan darah setiap 2 minggu sekali",
        "🚫 Hindari makanan olahan, fast food, dan minuman berkafein berlebihan",
      ],
    },
    tinggi1: {
      judul: "Penanganan Hipertensi Tingkat 1",
      warna: "#dc2626", bg: "#fee2e2", border: "#fecaca",
      poin: [
        "🏥 Konsultasikan ke dokter atau puskesmas untuk evaluasi medis",
        "💊 Ikuti anjuran dokter — mungkin diperlukan obat antihipertensi",
        "🧂 Batasi garam secara ketat — hindari makanan asin dan olahan",
        "📊 Ukur tekanan darah setiap hari dan catat hasilnya",
        "🥩 Kurangi daging merah, santan, dan makanan berlemak tinggi",
        "😴 Pastikan tidur cukup 7–8 jam per malam untuk membantu regulasi tekanan darah",
      ],
    },
    tinggi2: {
      judul: "Penanganan Darurat Hipertensi Tingkat 2",
      warna: "#7c2d12", bg: "#fee2e2", border: "#fca5a5",
      poin: [
        "🚨 Segera rujuk ke dokter atau IGD rumah sakit terdekat",
        "💉 Wajib mendapat penanganan medis dan kemungkinan rawat inap",
        "💊 Jangan hentikan obat tanpa sepengetahuan dokter",
        "🛌 Batasi aktivitas fisik berat — istirahat total bila diperlukan",
        "📵 Hindari stres, kafein, dan stimulan apapun",
        "👨‍👩‍👧 Libatkan keluarga untuk memantau kondisi dan memastikan minum obat teratur",
      ],
    },
    rendah: {
      judul: "Penanganan Tensi Rendah",
      warna: "#d97706", bg: "#fef3c7", border: "#fde68a",
      poin: [
        "💧 Perbanyak minum air putih minimal 8 gelas/hari",
        "🧂 Tambahkan sedikit garam dalam makanan sesuai anjuran dokter",
        "🛏️ Hindari berdiri terlalu cepat dari posisi duduk atau berbaring",
        "🩺 Konsultasikan ke dokter bila disertai pusing, lemas, atau pingsan",
        "🥜 Makan dalam porsi kecil tapi sering untuk menjaga tekanan darah stabil",
      ],
    },
  };

  const saranGula = {
    Normal: {
      judul: "Pertahankan Kadar Gula Normal",
      warna: "#2d7a4f", bg: "#e8f5ed", border: "#b8ddc5",
      poin: [
        "✅ Pertahankan pola makan sehat dan teratur",
        "🏃 Olahraga ringan minimal 150 menit per minggu",
        "🍚 Batasi karbohidrat olahan — pilih nasi merah, oat, atau ubi",
        "📅 Periksa gula darah minimal 3 bulan sekali",
      ],
    },
    "Pra-Diabetes": {
      judul: "Cegah Perkembangan ke Diabetes",
      warna: "#d97706", bg: "#fef3c7", border: "#fde68a",
      poin: [
        "⚠️ Kurangi konsumsi gula, minuman manis, dan karbohidrat sederhana",
        "🥗 Perbanyak serat: sayur, buah, kacang-kacangan",
        "⚖️ Turunkan berat badan 5–7% bila kelebihan berat badan",
        "🏋️ Aktif bergerak — aktivitas fisik membantu sensitivitas insulin",
        "🩺 Konsultasi dokter untuk pemantauan lebih ketat",
      ],
    },
    Diabetes: {
      judul: "Penanganan Diabetes",
      warna: "#dc2626", bg: "#fee2e2", border: "#fecaca",
      poin: [
        "🏥 Wajib dalam pengawasan dokter dan mendapat terapi medis",
        "💊 Minum obat atau insulin sesuai resep — jangan berhenti sendiri",
        "🍬 Hindari total gula murni, minuman manis, dan makanan tinggi GI",
        "📊 Cek gula darah secara rutin sesuai anjuran dokter",
        "👣 Periksa kaki setiap hari — diabetes meningkatkan risiko luka sulit sembuh",
        "🥦 Diet DM: nasi porsi kecil, banyak sayur, protein tanpa lemak",
      ],
    },
  };

  const infoTensi = tensiStatus ? saranTensi[tensiStatus.status] : null;
  const infoGula = gulaStatus ? saranGula[gulaStatus.label] : null;

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,30,15,0.45)", backdropFilter: "blur(5px)", zIndex: 200 }} />
      <div style={{
        position: "fixed", top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        width: "min(460px,94vw)", maxHeight: "88vh", overflowY: "auto",
        background: "#fff", borderRadius: 20,
        boxShadow: "0 24px 64px rgba(0,0,0,0.16)",
        zIndex: 201, fontFamily: "'Plus Jakarta Sans',sans-serif",
        animation: "popIn 0.22s cubic-bezier(0.16,1,0.3,1)"
      }}>
        {/* Header */}
        <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid #f0f6f2", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ background: tensiStatus ? tensiStatus.bg : "#f5f7f4", borderRadius: 10, padding: 9 }}>
              <Info size={18} color={tensiStatus ? tensiStatus.color : "#9aab9a"} />
            </div>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: "#1f2d1f" }}>Hasil Pemeriksaan</h2>
              <p style={{ fontSize: 12, color: "#9aab9a", marginTop: 1 }}>{data.lansia?.nama ?? "-"} · {data.kegiatan}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "#f5f7f4", border: "1px solid #e4ede6", borderRadius: 9, padding: "6px 7px", cursor: "pointer", display: "flex" }}>
            <X size={16} color="#6b7c6b" />
          </button>
        </div>

        <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Status Tensi Banner */}
          {tensiStatus ? (
            <div style={{ background: tensiStatus.bg, border: `1.5px solid ${tensiStatus.color}35`, borderRadius: 14, padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                <span style={{ fontSize: 26 }}>{tensiStatus.icon}</span>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: tensiStatus.color, textTransform: "uppercase", letterSpacing: 0.6 }}>Status Tekanan Darah</p>
                  <p style={{ fontSize: 19, fontWeight: 800, color: tensiStatus.color }}>{tensiStatus.label}</p>
                </div>
              </div>
              <p style={{ fontSize: 12, color: tensiStatus.color + "cc", paddingTop: 8, borderTop: `1px solid ${tensiStatus.color}20` }}>
                Tensi: <strong>{data.tensi} mmHg</strong>
              </p>
            </div>
          ) : (
            <div style={{ background: "#f8fbf9", border: "1px solid #e4ede6", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
              <AlertCircle size={16} color="#9aab9a" />
              <p style={{ fontSize: 13, color: "#9aab9a" }}>Tensi belum diisi — status tidak dapat dihitung.</p>
            </div>
          )}

          {/* Status Gula Banner */}
          {gulaStatus && (
            <div style={{ background: gulaStatus.bg, border: `1.5px solid ${gulaStatus.color}35`, borderRadius: 14, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: gulaStatus.color, textTransform: "uppercase", letterSpacing: 0.6 }}>Status Gula Darah</p>
                <p style={{ fontSize: 19, fontWeight: 800, color: gulaStatus.color }}>{gulaStatus.label}</p>
                <p style={{ fontSize: 12, color: gulaStatus.color + "cc", marginTop: 4 }}>Gula darah: <strong>{data.gulaDarah} mg/dL</strong></p>
              </div>
            </div>
          )}

          {/* Data Pengukuran */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#9aab9a", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>Hasil Pengukuran</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                { label: "Berat Badan", value: data.bb ? `${data.bb} kg` : "-", accent: true, c: "#2d7a4f", bg: "#e8f5ed", border: "#b8ddc5" },
                { label: "Tinggi Badan", value: data.tb ? `${data.tb} cm` : "-", accent: true, c: "#0284c7", bg: "#e0f2fe", border: "#bae6fd" },
                { label: "Lingkar Perut", value: data.lingkarPerut ? `${data.lingkarPerut} cm` : "-", accent: false },
                { label: "Tensi", value: data.tensi ? `${data.tensi} mmHg` : "-", accent: !!data.tensi, c: tensiStatus?.color ?? "#dc2626", bg: tensiStatus?.bg ?? "#fee2e2", border: (tensiStatus?.color ?? "#dc2626") + "40" },
                { label: "Gula Darah", value: data.gulaDarah ? `${data.gulaDarah} mg/dL` : "-", accent: !!data.gulaDarah, c: gulaStatus?.color ?? "#6b7c6b", bg: gulaStatus?.bg ?? "#f8fbf9", border: (gulaStatus?.color ?? "#9aab9a") + "40" },
              ].map(({ label, value, accent, c, bg, border }) => (
                <div key={label} style={{ background: accent ? bg : "#f8fbf9", border: `1px solid ${accent ? border : "#f0f6f2"}`, borderRadius: 10, padding: "10px 12px" }}>
                  <p style={{ fontSize: 11, color: accent ? c : "#9aab9a", fontWeight: 600 }}>{label}</p>
                  <p style={{ fontSize: 15, fontWeight: 800, color: accent ? c : "#1f2d1f", marginTop: 2 }}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Saran Tensi */}
          {infoTensi && (
            <div style={{ background: infoTensi.bg, border: `1.5px solid ${infoTensi.border}`, borderRadius: 14, padding: "14px 16px" }}>
              <p style={{ fontSize: 13, fontWeight: 800, color: infoTensi.warna, marginBottom: 12 }}>💡 {infoTensi.judul}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {infoTensi.poin.map((p, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.6)", borderRadius: 8, padding: "8px 12px" }}>
                    <p style={{ fontSize: 12, color: "#1f2d1f", lineHeight: 1.6 }}>{p}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Saran Gula */}
          {infoGula && (
            <div style={{ background: infoGula.bg, border: `1.5px solid ${infoGula.border}`, borderRadius: 14, padding: "14px 16px" }}>
              <p style={{ fontSize: 13, fontWeight: 800, color: infoGula.warna, marginBottom: 12 }}>🩸 {infoGula.judul}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {infoGula.poin.map((p, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.6)", borderRadius: 8, padding: "8px 12px" }}>
                    <p style={{ fontSize: 12, color: "#1f2d1f", lineHeight: 1.6 }}>{p}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: "12px 20px", borderTop: "1px solid #f0f6f2", position: "sticky", bottom: 0, background: "#fff" }}>
          <button onClick={onClose} style={{ width: "100%", padding: "11px", background: "#2d7a4f", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            Tutup
          </button>
        </div>
      </div>
    </>
  );
}


/* ══════════════════════════════════════════
   FUNGSI STATUS — LANSIA
══════════════════════════════════════════ */

/** Status Tekanan Darah (sistolik) */
function getStatusTensi(tensi) {
  if (!tensi) return null;
  if (tensi >= 160) return { status: "tinggi2", label: "Hipertensi Tk. 2", color: "#7c2d12", bg: "#fee2e2", border: "#fecaca", icon: "🔴" };
  if (tensi >= 140) return { status: "tinggi1", label: "Hipertensi Tk. 1", color: "#dc2626", bg: "#fee2e2", border: "#fecaca", icon: "🔴" };
  if (tensi >= 120) return { status: "prehiper", label: "Pra-Hipertensi", color: "#d97706", bg: "#fef3c7", border: "#fde68a", icon: "🟡" };
  if (tensi < 90) return { status: "rendah", label: "Tensi Rendah", color: "#d97706", bg: "#fef3c7", border: "#fde68a", icon: "🟡" };
  return { status: "normal", label: "Normal", color: "#2d7a4f", bg: "#e8f5ed", border: "#b8ddc5", icon: "🟢" };
}

/** Status Gula Darah */
function getStatusGula(gula) {
  if (!gula) return null;
  if (gula >= 200) return { label: "Diabetes", color: "#dc2626", bg: "#fee2e2", border: "#fecaca" };
  if (gula >= 100) return { label: "Pra-Diabetes", color: "#d97706", bg: "#fef3c7", border: "#fde68a" };
  return { label: "Normal", color: "#2d7a4f", bg: "#e8f5ed", border: "#b8ddc5" };
}


/* ══════════════════════════════════════════
   HELPERS UMUM
══════════════════════════════════════════ */
const formatDisplay = (d) => {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
};
const formatShort = (d) => {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
};
const hitungUsia = (tgl) => {
  if (!tgl) return "-";
  const bulan = Math.floor((Date.now() - new Date(tgl).getTime()) / (1000 * 60 * 60 * 24 * 30.44));
  if (bulan < 12) return `${bulan} bulan`;
  return `${Math.floor(bulan / 12)} tahun ${bulan % 12} bulan`;
};
const hitungUsiaBulanPadaTanggal = (tglLahir, tglPeriksa) => {
  if (!tglLahir || !tglPeriksa) return null;
  return Math.floor((new Date(tglPeriksa) - new Date(tglLahir)) / (1000 * 60 * 60 * 24 * 30.44));
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
   8 kolom: No | Kegiatan | Tanggal | BB | TB |
   Lingkar Kepala | Status Gizi | Status Stunting
══════════════════════════════════════════ */
function FlatRowBalita({ rec, prev, tglLahir, jenisKelamin, index, onDetail }) {
  const statusGiziKey = getStatusBB(rec.bb, tglLahir);
  const giziCfg = statusGiziKey ? statusGiziBB[statusGiziKey] : null;
  const GiziIcon = giziCfg?.icon ?? CheckCircle;

  const usiaBulan = hitungUsiaBulanPadaTanggal(tglLahir, rec.tanggal);
  const stunting = hitungStatusStunting(rec.tb, usiaBulan, jenisKelamin);

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
        <span style={{ fontSize: 14, fontWeight: 800, color: giziCfg?.color ?? "#1f2d1f" }}>
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

      {/* Status Gizi (BB/U) */}
      <td style={{ padding: "12px 16px" }}>
        {giziCfg ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: giziCfg.bg, color: giziCfg.color, border: `1px solid ${giziCfg.border}`, padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>
            <GiziIcon size={11} /> {giziCfg.label}
          </span>
        ) : <span style={{ color: "#d1dbd2", fontSize: 12 }}>—</span>}
      </td>

      {/* Status Stunting (TB/U WHO) */}
      <td style={{ padding: "12px 16px" }}>
        {stunting ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: stunting.bg, color: stunting.color, border: `1px solid ${stunting.color}33`, padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>
              {stunting.icon} {stunting.label}
            </span>
            <span style={{ fontSize: 10, color: "#9aab9a", paddingLeft: 2 }}>Z-Score: {stunting.zScore}</span>
          </div>
        ) : <span style={{ color: "#d1dbd2", fontSize: 12 }}>—</span>}
      </td>
      <td style={{ padding: "12px 16px" }}>
        <button
          onClick={onDetail}
          style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#e8f5ed", color: "#2d7a4f", border: "1px solid #b8ddc5", borderRadius: 8, padding: "5px 11px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif" }}
        >
          <Info size={12} /> Detail
        </button>
      </td>
    </tr>
  );
}

/* ══════════════════════════════════════════
   FLAT ROW — LANSIA
   11 kolom: No | Kegiatan | Tanggal | BB | TB |
   Lingkar Perut | Tensi | Status Tensi |
   Gula Darah | Status Gula 
══════════════════════════════════════════ */
function FlatRowLansia({ rec, prev, index, onDetail }) {
  const tensiCfg = getStatusTensi(rec.tensi);
  const gulaCfg = getStatusGula(rec.gulaDarah);

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

      {/* Tensi (nilai) */}
      <td style={{ padding: "12px 16px" }}>
        <span style={{ fontSize: 14, fontWeight: 800, color: tensiCfg?.color ?? "#1f2d1f" }}>
          {rec.tensi ?? "—"}{rec.tensi && <span style={{ fontSize: 11, fontWeight: 500, color: "#9aab9a" }}> mmHg</span>}
        </span>
        <div style={{ marginTop: 2 }}><TrendBadge current={rec.tensi} previous={prev?.tensi} unit="mmHg" /></div>
      </td>

      {/* Status Tensi */}
      <td style={{ padding: "12px 16px" }}>
        {tensiCfg ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: tensiCfg.bg, color: tensiCfg.color, border: `1px solid ${tensiCfg.border}`, padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>
            {tensiCfg.icon} {tensiCfg.label}
          </span>
        ) : <span style={{ color: "#d1dbd2", fontSize: 12 }}>—</span>}
      </td>

      {/* Gula Darah (nilai) */}
      <td style={{ padding: "12px 16px" }}>
        <span style={{ fontSize: 14, fontWeight: 800, color: gulaCfg?.color ?? "#1f2d1f" }}>
          {rec.gulaDarah ?? "—"}{rec.gulaDarah && <span style={{ fontSize: 11, fontWeight: 500, color: "#9aab9a" }}> mg/dL</span>}
        </span>
        <div style={{ marginTop: 2 }}><TrendBadge current={rec.gulaDarah} previous={prev?.gulaDarah} unit="mg/dL" /></div>
      </td>

      {/* Status Gula */}
      <td style={{ padding: "12px 16px" }}>
        {gulaCfg ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: gulaCfg.bg, color: gulaCfg.color, border: `1px solid ${gulaCfg.border}`, padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>
            {gulaCfg.label}
          </span>
        ) : <span style={{ color: "#d1dbd2", fontSize: 12 }}>—</span>}
      </td>
      <td style={{ padding: "12px 16px" }}>
        <button
          onClick={onDetail}
          style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#fdf0ff", color: "#7c3aed", border: "1px solid #ddd6fe", borderRadius: 8, padding: "5px 11px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif" }}
        >
          <Info size={12} /> Detail
        </button>
      </td>
    </tr>
  );
}


/* ══════════════════════════════════════════
   HALAMAN UTAMA
══════════════════════════════════════════ */
export default function RiwayatPemeriksaanPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [riwayatBalita, setRiwayatBalita] = useState([]);
  const [riwayatLansia, setRiwayatLansia] = useState([]);
  const [subjectBalita, setSubjectBalita] = useState(null);
  const [subjectLansia, setSubjectLansia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasBalita, setHasBalita] = useState(false);
  const [hasLansia, setHasLansia] = useState(false);
  const [activeTab, setActiveTab] = useState(null); // "balita" | "lansia"
  const [search, setSearch] = useState("");
  const [filterGizi, setFilterGizi] = useState("semua");
  const [filterTensi, setFilterTensi] = useState("semua");
  const [filterGula, setFilterGula] = useState("semua");
  const [sortAsc, setSortAsc] = useState(false);
  const [detailModal, setDetailModal] = useState(null);

  /* ══ AUTH GUARD ════════════════════════ */
  useEffect(() => {
    async function checkAuth() {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) { router.replace("/login"); return; }

        setUser(currentUser);
        setAuthChecked(true);

        const fetches = [];

        if (currentUser.balitaId) {
          setHasBalita(true);
          fetches.push(
            getPosyanduBalitaByUser(currentUser.balitaId)
              .then(data => {
                const sorted = data.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
                setRiwayatBalita(sorted);
                if (sorted[0]?.balita) setSubjectBalita(sorted[0].balita);
              })
              .catch(err => console.error("Gagal memuat data balita:", err))
          );
        }

        if (currentUser.lansiaId) {
          setHasLansia(true);
          fetches.push(
            getPosyanduLansiaByUser(currentUser.lansiaId)
              .then(data => {
                const sorted = data.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
                setRiwayatLansia(sorted);
                if (sorted[0]?.lansia) setSubjectLansia(sorted[0].lansia);
              })
              .catch(err => console.error("Gagal memuat data lansia:", err))
          );
        }

        await Promise.all(fetches);
        setLoading(false);
      } catch (err) {
        console.error("Auth error:", err);
        router.replace("/login");
      }
    }
    checkAuth();
  }, [router]);

  /* Set tab default setelah data masuk */
  useEffect(() => {
    if (!activeTab) {
      if (hasBalita) setActiveTab("balita");
      else if (hasLansia) setActiveTab("lansia");
    }
  }, [hasBalita, hasLansia, activeTab]);

  /* ── Loading auth ── */
  if (!authChecked) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        <div style={{ width: 28, height: 28, border: "3px solid #e4ede6", borderTopColor: "#2d7a4f", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
        <p style={{ color: "#9aab9a", fontSize: 13, fontWeight: 500 }}>Memeriksa sesi login…</p>
      </div>
    );
  }

  /* ── Derived: data & subject sesuai tab aktif ── */
  const isBalita = activeTab === "balita";
  const riwayat = isBalita ? riwayatBalita : riwayatLansia;
  const subject = isBalita ? subjectBalita : subjectLansia;
  const accentColor = isBalita ? "#2d7a4f" : "#7c3aed";
  const accentBg = isBalita ? "#e8f5ed" : "#f3f0ff";

  /* ── Sort ── */
  const sortedRiwayat = [...riwayat].sort((a, b) =>
    sortAsc ? new Date(a.tanggal) - new Date(b.tanggal)
      : new Date(b.tanggal) - new Date(a.tanggal)
  );

  /* ── Filter ── */
  const filtered = sortedRiwayat.filter(r => {
    const matchSearch = !search || (r.kegiatan ?? "").toLowerCase().includes(search.toLowerCase());
    if (isBalita) {
      const matchGizi = filterGizi === "semua" || getStatusBB(r.bb, subject?.tglLahir) === filterGizi;
      return matchSearch && matchGizi;
    } else {
      const tensiCfg = getStatusTensi(r.tensi);
      const gulaCfg = getStatusGula(r.gulaDarah);
      const matchTensi = filterTensi === "semua" || tensiCfg?.status === filterTensi;
      const matchGula = filterGula === "semua" || gulaCfg?.label === filterGula;
      return matchSearch && matchTensi && matchGula;
    }
  });

  /* ── Stat Cards ── */
  const latest = riwayat[0] ?? null;
  const prev = riwayat[1] ?? null;
  const tensiLatest = getStatusTensi(latest?.tensi);
  const gulaLatest = getStatusGula(latest?.gulaDarah);

  const statCardsBalita = [
    { icon: FileText, label: "Total Kunjungan", value: riwayatBalita.length, sub: "Pemeriksaan tercatat", accent: "#2d7a4f", bg: "#e8f5ed" },
    { icon: Scale, label: "BB Terakhir", value: latest?.bb ? `${latest.bb} kg` : "—", sub: prev?.bb ? `Sebelumnya ${prev.bb} kg` : "Belum ada data", accent: "#2d7a4f", bg: "#e8f5ed" },
    { icon: Ruler, label: "TB Terakhir", value: latest?.tb ? `${latest.tb} cm` : "—", sub: prev?.tb ? `Sebelumnya ${prev.tb} cm` : "Belum ada data", accent: "#0284c7", bg: "#e0f2fe" },
    { icon: Clock, label: "Kunjungan Terakhir", value: latest?.tanggal ? formatShort(latest.tanggal) : "—", sub: latest?.kegiatan ?? "Belum pernah periksa", accent: "#7c3aed", bg: "#f3f0ff" },
  ];

  const statCardsLansia = [
    { icon: FileText, label: "Total Kunjungan", value: riwayatLansia.length, sub: "Pemeriksaan tercatat", accent: "#7c3aed", bg: "#f3f0ff" },
    { icon: Heart, label: "Tensi Terakhir", value: latest?.tensi ? `${latest.tensi} mmHg` : "—", sub: prev?.tensi ? `Sebelumnya ${prev.tensi} mmHg` : "Belum ada data", accent: tensiLatest?.color ?? "#7c3aed", bg: tensiLatest?.bg ?? "#f3f0ff" },
    { icon: Droplets, label: "Gula Darah Terakhir", value: latest?.gulaDarah ? `${latest.gulaDarah} mg/dL` : "—", sub: prev?.gulaDarah ? `Sebelumnya ${prev.gulaDarah} mg/dL` : "Belum ada data", accent: gulaLatest?.color ?? "#d97706", bg: gulaLatest?.bg ?? "#fef3c7" },
    { icon: Clock, label: "Kunjungan Terakhir", value: latest?.tanggal ? formatShort(latest.tanggal) : "—", sub: latest?.kegiatan ?? "Belum pernah periksa", accent: "#0284c7", bg: "#e0f2fe" },
  ];

  const statCards = isBalita ? statCardsBalita : statCardsLansia;

  /* ── Table headers ── */
  // Balita & Lansia sama-sama 8 kolom
  const tableHeaders = isBalita
    ? ["No", "Kegiatan", "Tanggal", "Berat Badan", "Tinggi Badan",
      "Lingkar Kepala", "Status Gizi", "Status Stunting", "Detail"]
    : ["No", "Kegiatan", "Tanggal", "Berat Badan", "Tinggi Badan",
      "Lingkar Perut", "Tensi", "Status Tensi",
      "Gula Darah", "Status Gula", "Detail"];

  const colSpanCount = tableHeaders.length;

  /* ── Filter options ── */
  const filterOptionsGizi = [
    { value: "semua", label: "Semua Gizi" },
    { value: "normal", label: "Normal" },
    { value: "kurang", label: "BB Kurang" },
    { value: "buruk", label: "Gizi Buruk" },
  ];
  const filterOptionsTensi = [
    { value: "semua", label: "Semua Tensi" },
    { value: "normal", label: "Normal" },
    { value: "prehiper", label: "Pra-Hipertensi" },
    { value: "tinggi1", label: "Hipertensi Tk. 1" },
    { value: "tinggi2", label: "Hipertensi Tk. 2" },
    { value: "rendah", label: "Tensi Rendah" },
  ];
  const filterOptionsGula = [
    { value: "semua", label: "Semua Gula" },
    { value: "Normal", label: "Normal" },
    { value: "Pra-Diabetes", label: "Pra-Diabetes" },
    { value: "Diabetes", label: "Diabetes" },
  ];

  /* ══════════════ RENDER ══════════════ */
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, fontFamily: "'Plus Jakarta Sans',sans-serif", color: "#1f2d1f" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes spin   { to { transform: rotate(360deg) } }
        @keyframes fadeUp { from { opacity:0;transform:translateY(12px) } to { opacity:1;transform:translateY(0) } }
        .rw-search { border:1.5px solid #e4ede6;border-radius:10px;padding:8px 12px 8px 36px;font-size:13px;font-family:'Plus Jakarta Sans',sans-serif;color:#1f2d1f;background:#fff;outline:none;width:190px;transition:border-color 0.2s; }
        .rw-search:focus { border-color:${accentColor}; }
        .rw-search::placeholder { color:#b5ceba; }
        .rw-select { border:1.5px solid #e4ede6;border-radius:10px;padding:8px 12px;font-size:13px;font-family:'Plus Jakarta Sans',sans-serif;color:#1f2d1f;background:#fff;outline:none;cursor:pointer;transition:border-color 0.2s; }
        .rw-select:focus { border-color:${accentColor}; }
        .stat-card { background:#fff;border:1px solid #e4ede6;border-radius:14px;padding:16px 18px;box-shadow:0 2px 8px rgba(0,0,0,0.04);display:flex;align-items:center;gap:14px;position:relative;overflow:hidden;animation:fadeUp 0.35s ease; }
        .card      { background:#fff;border:1px solid #e4ede6;border-radius:16px;box-shadow:0 2px 8px rgba(0,0,0,0.04); }
        .tab-btn   { display:inline-flex;align-items:center;gap:8px;padding:9px 20px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;border:none;font-family:'Plus Jakarta Sans',sans-serif;transition:all 0.18s; }
      `}</style>

      {/* ══ HEADER ════════════════════════════ */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ background: accentBg, borderRadius: 14, padding: 13 }}>
            <FileText size={22} color={accentColor} />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "#1f2d1f", margin: 0 }}>
              Riwayat Pemeriksaan
            </h1>
            <p style={{ fontSize: 13, color: "#9aab9a", marginTop: 3 }}>
              {subject
                ? `${subject.nama} · ${hitungUsia(subject.tglLahir)}`
                : loading ? "Memuat data…" : "—"}
            </p>
          </div>
        </div>

        {/* ── Tab switcher Balita / Lansia ── */}
        {(hasBalita || hasLansia) && (
          <div style={{ display: "flex", gap: 6, background: "#f4f7f4", borderRadius: 12, padding: 5 }}>
            {hasBalita && (
              <button
                className="tab-btn"
                onClick={() => setActiveTab("balita")}
                style={{
                  background: activeTab === "balita" ? "#fff" : "transparent",
                  color: activeTab === "balita" ? "#2d7a4f" : "#9aab9a",
                  boxShadow: activeTab === "balita" ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                }}
              >
                <Baby size={15} /> Balita
              </button>
            )}
            {hasLansia && (
              <button
                className="tab-btn"
                onClick={() => setActiveTab("lansia")}
                style={{
                  background: activeTab === "lansia" ? "#fff" : "transparent",
                  color: activeTab === "lansia" ? "#7c3aed" : "#9aab9a",
                  boxShadow: activeTab === "lansia" ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                }}
              >
                <User size={15} /> Lansia
              </button>
            )}
          </div>
        )}
      </div>

      {/* ══ STAT CARDS ════════════════════════ */}
      {!loading && activeTab && (
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

      {/* ══ TABLE CARD ════════════════════════ */}
      <div className="card" style={{ overflow: "hidden" }}>

        {/* Toolbar */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #f0f6f2", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#1f2d1f" }}>
              Riwayat Pemeriksaan
              {activeTab && (
                <span style={{ marginLeft: 8, fontSize: 12, fontWeight: 600, background: accentBg, color: accentColor, padding: "2px 9px", borderRadius: 7 }}>
                  {isBalita ? "Balita" : "Lansia"}
                </span>
              )}
            </p>
            <p style={{ fontSize: 12, color: "#9aab9a", marginTop: 2 }}>
              {filtered.length} dari {riwayat.length} catatan pemeriksaan
            </p>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            {/* Search */}
            <div style={{ position: "relative" }}>
              <Search size={14} color="#9aab9a" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              <input className="rw-search" placeholder="Cari kegiatan…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            {/* Filter Balita: Status Gizi */}
            {isBalita && (
              <select className="rw-select" value={filterGizi} onChange={e => setFilterGizi(e.target.value)}>
                {filterOptionsGizi.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            )}

            {/* Filter Lansia: Tensi + Gula */}
            {!isBalita && activeTab && (
              <>
                <select className="rw-select" value={filterTensi} onChange={e => setFilterTensi(e.target.value)}>
                  {filterOptionsTensi.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <select className="rw-select" value={filterGula} onChange={e => setFilterGula(e.target.value)}>
                  {filterOptionsGula.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </>
            )}

            {/* Sort */}
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
                  <th key={h} style={{ padding: "11px 16px", textAlign: "left", borderBottom: "1px solid #e4ede6", fontSize: 11, fontWeight: 700, color: "#9aab9a", whiteSpace: "nowrap", letterSpacing: 0.3 }}>
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
              {!loading && !hasBalita && !hasLansia && (
                <tr><td colSpan={colSpanCount} style={{ padding: "56px", textAlign: "center" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                    <div style={{ background: "#fee2e2", borderRadius: "50%", padding: 18 }}><AlertTriangle size={28} color="#dc2626" /></div>
                    <p style={{ color: "#1f2d1f", fontSize: 14, fontWeight: 700 }}>Akun tidak terhubung ke data balita atau lansia</p>
                    <p style={{ color: "#9aab9a", fontSize: 13 }}>Hubungi admin untuk menghubungkan akun Anda.</p>
                  </div>
                </td></tr>
              )}

              {/* Belum ada riwayat */}
              {!loading && activeTab && riwayat.length === 0 && (
                <tr><td colSpan={colSpanCount} style={{ padding: "56px", textAlign: "center" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                    <div style={{ background: accentBg, borderRadius: "50%", padding: 18 }}>
                      {isBalita ? <Baby size={28} color="#b5ceba" /> : <Heart size={28} color="#b5ceba" />}
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
                const idx = allSorted.findIndex(r => r.id === rec.id);
                const prevRec = idx > 0 ? allSorted[idx - 1] : null;

                return isBalita ? (
                  <FlatRowBalita
                    key={rec.id}
                    rec={rec}
                    prev={prevRec}
                    tglLahir={subject?.tglLahir}
                    jenisKelamin={subject?.jenisKelamin}
                    index={i}
                    onDetail={() => setDetailModal({ ...rec, balita: subject })}
                  />
                ) : (
                  <FlatRowLansia
                    key={rec.id}
                    rec={rec}
                    prev={prevRec}
                    index={i}
                    onDetail={() => setDetailModal({ ...rec, lansia: subjectLansia })}
                  />
                );
              })}

            </tbody>
          </table>
        </div>

        {/* Table footer */}
        {!loading && filtered.length > 0 && (
          <div style={{ padding: "11px 20px", borderTop: "1px solid #f0f6f2", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <p style={{ color: "#9aab9a", fontSize: 12 }}>
              Menampilkan {filtered.length} dari {riwayat.length} pemeriksaan
            </p>

            {/* Badge status terkini — Lansia */}
            {!isBalita && activeTab && latest && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {tensiLatest && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: tensiLatest.color, background: tensiLatest.bg, border: `1px solid ${tensiLatest.border}`, padding: "4px 11px", borderRadius: 8 }}>
                    {tensiLatest.icon} Tensi: {tensiLatest.label}
                  </span>
                )}
                {gulaLatest && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: gulaLatest.color, background: gulaLatest.bg, border: `1px solid ${gulaLatest.border}`, padding: "4px 11px", borderRadius: 8 }}>
                    Gula: {gulaLatest.label}
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      {detailModal && activeTab === "balita" && (
        <DetailModalBalita data={detailModal} onClose={() => setDetailModal(null)} />
      )}
      {detailModal && activeTab === "lansia" && (
        <DetailModalLansia data={detailModal} onClose={() => setDetailModal(null)} />
      )}
    </div>
  );
}