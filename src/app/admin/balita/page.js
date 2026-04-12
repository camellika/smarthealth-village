"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getBalita, createBalita, updateBalita, deleteBalita } from "@/services/balitaService";
import {
  getPosyanduBalita,
  createPosyanduBalita,
  updatePosyanduBalita,
  deletePosyanduBalita,
} from "@/services/posyanduBalitaService";
import {
  Baby, Plus, Search, ChevronDown, ChevronUp,
  AlertTriangle, Calendar, X, CreditCard, User,
  Phone, MapPin, Save, Pencil, Trash2, Scale, Ruler,
  Info, CheckCircle, TrendingDown, AlertCircle
} from "lucide-react";
import { getJadwalTerdekat } from "@/services/penjadwalanService";

/* ══════════════════════════════════════════
   TABEL Z-SCORE WHO TB/U (0–60 bulan)
   Sumber: WHO Child Growth Standards 2006
   Format: [median, -1SD, -2SD, -3SD, +1SD, +2SD, +3SD]
   Indeks: bulan usia (0–60)
══════════════════════════════════════════ */

// TB/U Laki-laki (cm): [median, SD]  — SD dihitung dari tabel WHO
// Data: median dan nilai -2SD, -3SD per bulan
const WHO_TB_LAKI = [
  // [bulan, median, -2SD, -3SD]
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

// TB/U Perempuan (cm): [bulan, median, -2SD, -3SD]
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
   FUNGSI HITUNG Z-SCORE & STATUS STUNTING
   Metode: WHO TB/U (Tinggi Badan per Umur)
══════════════════════════════════════════ */
function hitungStatusStunting(tb, usiaBulan, jenisKelamin) {
  if (!tb || usiaBulan === null || usiaBulan < 0 || usiaBulan > 60) return null;

  const tabel = jenisKelamin === "Perempuan" ? WHO_TB_PEREMPUAN : WHO_TB_LAKI;
  const bulan = Math.min(Math.round(usiaBulan), 60);
  const row = tabel.find(r => r[0] === bulan);
  if (!row) return null;

  const [, median, sd2, sd3] = row;
  const sd = median - sd2; // ✅ BENAR — selisih median dengan -2SD
  const zScore = sd > 0 ? (tb - median) / sd : 0;

  let status, label, color, bg, icon;
  if (zScore < -3) {
    status = "severely_stunting";
    label = "Severely Stunting";
    color = "#dc2626";
    bg = "#fee2e2";
    icon = "🔴";
  } else if (zScore < -2) {
    status = "stunting";
    label = "Stunting";
    color = "#d97706";
    bg = "#fef3c7";
    icon = "🟡";
  } else {
    status = "normal";
    label = "Normal";
    color = "#2d7a4f";
    bg = "#e8f5ed";
    icon = "🟢";
  }

  return { zScore: zScore.toFixed(2), status, label, color, bg, icon, median, sd2, sd3 };
}

function hitungUsiaBulan(tglLahir, tglPemeriksaan) {
  if (!tglLahir) return null;
  const lahir = new Date(tglLahir);
  const pem = tglPemeriksaan ? new Date(tglPemeriksaan) : new Date();
  const diff = (pem - lahir) / (1000 * 60 * 60 * 24 * 30.44);
  return Math.floor(diff);
}

/* ── helpers ── */
const INIT_FORM = { nik: "", nama: "", namaIbu: "", alamat: "", noTelp: "", tglLahir: "", jenisKelamin: "" };
const PEMERIKSAAN_INIT = { balitaId: "", kegiatan: "", bb: "", tb: "", lingkarKepala: "", lingkarLengan: "" };

const formatDate = (d) => {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
};
const formatDisplay = (d) => {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
};
const toInputDate = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${dt.getFullYear()}-${mm}-${dd}`;
};
const hitungUsia = (tgl) => {
  if (!tgl) return "-";
  const diff = Date.now() - new Date(tgl).getTime();
  const bulan = Math.floor(diff / (1000 * 60 * 60 * 24 * 30.44));
  if (bulan < 12) return `${bulan} bln`;
  return `${Math.floor(bulan / 12)} th ${bulan % 12} bln`;
};

/* ══════════════════════════════════════════
   MODAL DETAIL PEMERIKSAAN
══════════════════════════════════════════ */
function DetailModal({ data, onClose }) {
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

/* ══════════════════════════════════════════
   MODAL FORM BALITA — Tambah & Edit
══════════════════════════════════════════ */
function BalitaFormModal({ onClose, onSubmit, editData }) {
  const isEdit = !!editData;
  const [form, setForm] = useState(isEdit ? { ...editData, tglLahir: toInputDate(editData.tglLahir), jenisKelamin: editData.jenisKelamin ?? "" } : INIT_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: "" }));
    if (apiError) setApiError("");
  }

  function validate() {
    const e = {};
    if (!form.nik.trim()) e.nik = "NIK wajib diisi";
    else if (form.nik.trim().length !== 16) e.nik = "NIK harus 16 digit";
    if (!form.nama.trim()) e.nama = "Nama balita wajib diisi";
    if (!form.namaIbu.trim()) e.namaIbu = "Nama ibu wajib diisi";
    if (!form.alamat.trim()) e.alamat = "Alamat wajib diisi";
    if (!form.tglLahir) e.tglLahir = "Tanggal lahir wajib diisi";
    if (!form.jenisKelamin) e.jenisKelamin = "Jenis kelamin wajib dipilih";
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try { await onSubmit(form); }
    catch (err) { setApiError(err?.message || "Terjadi kesalahan, coba lagi."); }
    finally { setLoading(false); }
  }

  const fields = [
    { name: "nik", label: "NIK", type: "text", icon: CreditCard, placeholder: "16 digit NIK balita", span: 2, hint: "Nomor Induk Kependudukan 16 digit", required: true },
    { name: "nama", label: "Nama Balita", type: "text", icon: Baby, placeholder: "Nama lengkap balita", span: 1, required: true },
    { name: "namaIbu", label: "Nama Ibu", type: "text", icon: User, placeholder: "Nama lengkap ibu", span: 1, required: true },
    { name: "noTelp", label: "No. Telepon", type: "text", icon: Phone, placeholder: "08xx-xxxx-xxxx (opsional)", span: 1, required: false },
    { name: "tglLahir", label: "Tanggal Lahir", type: "date", icon: Calendar, placeholder: "", span: 1, required: true },
    { name: "alamat", label: "Alamat Lengkap", type: "textarea", icon: MapPin, placeholder: "RT/RW, Dusun, Desa…", span: 2, required: true },
  ];

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,30,15,0.4)", backdropFilter: "blur(4px)", zIndex: 200 }} />
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "min(500px,100vw)", background: "#fff", boxShadow: "-8px 0 40px rgba(0,0,0,0.12)", zIndex: 201, display: "flex", flexDirection: "column", fontFamily: "'Plus Jakarta Sans',sans-serif", animation: "slideInRight 0.28s cubic-bezier(0.16,1,0.3,1)" }}>
        <style>{`
          @keyframes slideInRight { from{transform:translateX(100%)} to{transform:translateX(0)} }
          @keyframes spinAnim     { to{transform:rotate(360deg)} }
          .mi  { width:100%;border:1.5px solid #e4ede6;border-radius:10px;padding:10px 12px 10px 38px;font-size:14px;font-family:'Plus Jakarta Sans',sans-serif;color:#1f2d1f;background:#fff;outline:none;transition:border-color 0.2s,box-shadow 0.2s; }
          .mi:focus  { border-color:#2d7a4f;box-shadow:0 0 0 3px rgba(45,122,79,0.1); }
          .mi::placeholder { color:#b5ceba; }
          .mi.err    { border-color:#dc2626; }
          .mta { width:100%;border:1.5px solid #e4ede6;border-radius:10px;padding:10px 12px 10px 38px;font-size:14px;font-family:'Plus Jakarta Sans',sans-serif;color:#1f2d1f;background:#fff;outline:none;resize:vertical;min-height:80px;transition:border-color 0.2s; }
          .mta:focus { border-color:#2d7a4f;box-shadow:0 0 0 3px rgba(45,122,79,0.1); }
          .mta::placeholder { color:#b5ceba; }
          .mta.err   { border-color:#dc2626; }
          .msel { width:100%;border:1.5px solid #e4ede6;border-radius:10px;padding:10px 12px;font-size:14px;font-family:'Plus Jakarta Sans',sans-serif;color:#1f2d1f;background:#fff;outline:none;transition:border-color 0.2s,box-shadow 0.2s;appearance:none;cursor:pointer; }
          .msel:focus { border-color:#2d7a4f;box-shadow:0 0 0 3px rgba(45,122,79,0.1); }
          .msel.err   { border-color:#dc2626; }
        `}</style>

        <div style={{ padding: "20px 22px 16px", borderBottom: "1px solid #f0f6f2", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <div style={{ background: isEdit ? "#fef3c7" : "#e8f5ed", borderRadius: 11, padding: 10 }}>
              <Baby size={20} color={isEdit ? "#d97706" : "#2d7a4f"} />
            </div>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: "#1f2d1f" }}>{isEdit ? "Edit Data Balita" : "Tambah Data Balita"}</h2>
              <p style={{ fontSize: 12, color: "#9aab9a", marginTop: 2 }}>{isEdit ? `Mengubah data: ${editData.nama}` : "Lengkapi semua field yang diperlukan"}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "#f5f7f4", border: "1px solid #e4ede6", borderRadius: 9, padding: "6px 7px", cursor: "pointer", display: "flex" }}>
            <X size={16} color="#6b7c6b" />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "20px 22px" }}>
          {apiError && (
            <div style={{ background: "#fee2e2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 14px", marginBottom: 16, color: "#dc2626", fontSize: 13 }}>
              ⚠ {apiError}
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 14px" }}>
            {fields.map(({ name, label, type, icon: Icon, placeholder, span, hint, required }) => (
              <div key={name} style={{ gridColumn: span === 2 ? "1/-1" : "auto" }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#3d5542", marginBottom: 7 }}>
                  {label} {required && <span style={{ color: "#dc2626" }}>*</span>}
                </label>
                <div style={{ position: "relative" }}>
                  <Icon size={14} color="#9aab9a" style={{ position: "absolute", left: 11, top: type === "textarea" ? 12 : "50%", transform: type === "textarea" ? "none" : "translateY(-50%)", pointerEvents: "none" }} />
                  {type === "textarea"
                    ? <textarea name={name} value={form[name]} onChange={handleChange} placeholder={placeholder} className={`mta${errors[name] ? " err" : ""}`} />
                    : <input type={type} name={name} value={form[name]} onChange={handleChange} placeholder={placeholder} maxLength={name === "nik" ? 16 : undefined} className={`mi${errors[name] ? " err" : ""}`} />
                  }
                </div>
                {errors[name] && <p style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>⚠ {errors[name]}</p>}
                {hint && !errors[name] && <p style={{ color: "#9aab9a", fontSize: 11, marginTop: 4 }}>{hint}</p>}
              </div>
            ))}

            <div style={{ gridColumn: "auto" }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#3d5542", marginBottom: 7 }}>
                Jenis Kelamin <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <div style={{ position: "relative" }}>
                <ChevronDown size={14} color="#9aab9a" style={{ position: "absolute", right: 11, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <select name="jenisKelamin" value={form.jenisKelamin ?? ""} onChange={handleChange}
                  className={`msel${errors.jenisKelamin ? " err" : ""}`}
                  style={{ color: form.jenisKelamin ? "#1f2d1f" : "#b5ceba" }}>
                  <option value="" disabled>-- Pilih jenis kelamin --</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>
              {errors.jenisKelamin && <p style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>⚠ {errors.jenisKelamin}</p>}
            </div>
          </div>
          <p style={{ color: "#b5ceba", fontSize: 11, marginTop: 14 }}><span style={{ color: "#dc2626" }}>*</span> Field wajib diisi</p>
        </div>

        <div style={{ padding: "14px 22px", borderTop: "1px solid #f0f6f2", display: "flex", gap: 10, flexShrink: 0 }}>
          <button onClick={onClose} style={{ background: "#fff", color: "#6b7c6b", border: "1.5px solid #dde8de", padding: "11px 18px", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Batal</button>
          <button onClick={handleSubmit} disabled={loading} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: loading ? "#b5ceba" : (isEdit ? "#d97706" : "#2d7a4f"), color: "#fff", border: "none", padding: "11px", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif", boxShadow: loading ? "none" : "0 4px 14px rgba(45,122,79,0.25)" }}>
            {loading
              ? <><div style={{ width: 15, height: 15, border: "2.5px solid rgba(255,255,255,0.35)", borderTopColor: "#fff", borderRadius: "50%", animation: "spinAnim 0.7s linear infinite" }} /> Menyimpan…</>
              : <><Save size={15} /> {isEdit ? "Simpan Perubahan" : "Simpan Data Balita"}</>
            }
          </button>
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════
   MODAL KONFIRMASI HAPUS
══════════════════════════════════════════ */
function DeleteConfirmModal({ balita, onClose, onConfirm, loading }) {
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,30,15,0.4)", backdropFilter: "blur(4px)", zIndex: 200 }} />
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "min(420px,90vw)", background: "#fff", borderRadius: 18, boxShadow: "0 20px 60px rgba(0,0,0,0.15)", zIndex: 201, fontFamily: "'Plus Jakarta Sans',sans-serif", animation: "popIn 0.22s cubic-bezier(0.16,1,0.3,1)" }}>
        <style>{`@keyframes spinAnim { to{transform:rotate(360deg)} }`}</style>
        <div style={{ padding: "28px 28px 20px", textAlign: "center" }}>
          <div style={{ width: 56, height: 56, background: "#fee2e2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Trash2 size={24} color="#dc2626" />
          </div>
          <h3 style={{ fontSize: 17, fontWeight: 800, color: "#1f2d1f", marginBottom: 8 }}>Hapus Data Balita?</h3>
          <p style={{ color: "#6b7c6b", fontSize: 14, lineHeight: 1.6 }}>
            Data <strong>{balita?.nama}</strong> beserta seluruh riwayat pemeriksaannya akan dihapus permanen dan tidak bisa dikembalikan.
          </p>
        </div>
        <div style={{ padding: "0 28px 24px", display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "11px", background: "#fff", border: "1.5px solid #dde8de", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif", color: "#6b7c6b" }}>Batal</button>
          <button onClick={onConfirm} disabled={loading} style={{ flex: 1, padding: "11px", background: loading ? "#fca5a5" : "#dc2626", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
            {loading
              ? <><div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spinAnim 0.7s linear infinite" }} /> Menghapus…</>
              : <><Trash2 size={14} /> Ya, Hapus</>
            }
          </button>
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════
   MODAL FORM PEMERIKSAAN
══════════════════════════════════════════ */
function PemeriksaanFormModal({ balitaList, onClose, onSubmit, saving, editData }) {
  const isEdit = !!editData;
  const [pemForm, setPemForm] = useState(
    isEdit
      ? {
          balitaId: editData.balitaId,
          kegiatan: editData.kegiatan,
          bb: editData.bb ?? "",
          tb: editData.tb ?? "",
          lingkarKepala: editData.lingkarKepala ?? "",
          lingkarLengan: editData.lingkarLengan ?? "",
        }
      : PEMERIKSAAN_INIT
  );

  const [pemErr, setPemErr] = useState({});
  const [jadwalList, setJadwalList] = useState([]);

  useEffect(() => { getJadwalTerdekat().then(setJadwalList); }, []);

  // Preview stunting real-time
  const selectedBalita = balitaList.find(b => String(b.id) === String(pemForm.balitaId));
  const jadwalDipilih = jadwalList.find(j => j.kegiatan === pemForm.kegiatan);
  const tanggalPem = new Date().toISOString();
  const usiaBulanPreview = selectedBalita ? hitungUsiaBulan(selectedBalita.tglLahir, tanggalPem) : null;
  const stuntingPreview = (pemForm.tb && selectedBalita && usiaBulanPreview !== null)
    ? hitungStatusStunting(parseFloat(pemForm.tb), usiaBulanPreview, selectedBalita.jenisKelamin)
    : null;

  function handleChange(e) {
    const { name, value } = e.target;
    setPemForm(p => ({ ...p, [name]: value }));
    if (pemErr[name]) setPemErr(p => ({ ...p, [name]: "" }));
  }

  function validate() {
    const e = {};
    if (!pemForm.balitaId) e.balitaId = "Pilih balita";
    if (!pemForm.kegiatan) e.kegiatan = "Pilih kegiatan";
    if (!pemForm.bb) e.bb = "Berat badan wajib diisi";
    if (!pemForm.tb) e.tb = "Tinggi badan wajib diisi";
    return e;
  }

  function handleSubmit(ev) {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setPemErr(errs); return; }
    onSubmit({ ...pemForm, tanggal: new Date().toISOString().split("T")[0] });
  }

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,30,15,0.35)", backdropFilter: "blur(4px)", zIndex: 200 }} />
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "min(480px,100vw)", background: "#fff", boxShadow: "-8px 0 40px rgba(0,0,0,0.12)", zIndex: 201, display: "flex", flexDirection: "column", fontFamily: "'Plus Jakarta Sans',sans-serif", animation: "slideInRight 0.28s cubic-bezier(0.16,1,0.3,1)" }}>

        <div style={{ padding: "20px 22px 16px", borderBottom: "1px solid #f0f6f2", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ background: "#e8f5ed", borderRadius: 10, padding: 9 }}><Scale size={18} color="#2d7a4f" /></div>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#1f2d1f" }}>Input Pemeriksaan Balita</h2>
          </div>
          <button onClick={onClose} style={{ background: "#f5f7f4", border: "1px solid #e4ede6", borderRadius: 8, padding: "5px 6px", cursor: "pointer", display: "flex" }}>
            <X size={15} color="#6b7c6b" />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "20px 22px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 14px" }}>

            <div style={{ gridColumn: "1/-1" }}>
              <label className="label">Nama Kegiatan <span style={{ color: "#dc2626" }}>*</span></label>
              <select name="kegiatan" value={pemForm.kegiatan ?? ""} onChange={handleChange}
                style={{ width: "100%", border: `1.5px solid ${pemErr.kegiatan ? "#dc2626" : "#e4ede6"}`, borderRadius: 10, padding: "10px 12px", fontSize: 14, fontFamily: "'Plus Jakarta Sans',sans-serif", color: pemForm.kegiatan ? "#1f2d1f" : "#9aab9a", background: "#fff", outline: "none" }}>
                <option value="">-- Pilih jadwal kegiatan --</option>
                {jadwalList.map(j => (
                  <option key={j.id} value={j.kegiatan}>
                    {j.kegiatan} · {new Date(j.tanggal).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })} · {j.tempat}
                  </option>
                ))}
              </select>
              {pemErr.kegiatan && <p style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>⚠ {pemErr.kegiatan}</p>}
            </div>

            <div style={{ gridColumn: "1/-1" }}>
              <label className="label">Nama Balita <span style={{ color: "#dc2626" }}>*</span></label>
              <select name="balitaId" value={pemForm.balitaId ?? ""} onChange={handleChange}
                style={{ width: "100%", border: `1.5px solid ${pemErr.balitaId ? "#dc2626" : "#e4ede6"}`, borderRadius: 10, padding: "10px 12px", fontSize: 14, fontFamily: "'Plus Jakarta Sans',sans-serif", color: pemForm.balitaId ? "#1f2d1f" : "#9aab9a", background: "#fff", outline: "none" }}>
                <option value="">-- Pilih balita --</option>
                {balitaList.map(b => <option key={b.id} value={b.id}>{b.nama} ({hitungUsia(b.tglLahir)})</option>)}
              </select>
              {pemErr.balitaId && <p style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>⚠ {pemErr.balitaId}</p>}
            </div>

            <div>
              <label className="label">Berat Badan (kg) <span style={{ color: "#dc2626" }}>*</span></label>
              <div style={{ position: "relative" }}>
                <Scale size={14} color="#9aab9a" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <input type="number" step="0.1" min="0" name="bb" value={pemForm.bb ?? ""} onChange={handleChange} placeholder="cth: 10.5" className={`input-field${pemErr.bb ? " error" : ""}`} />
              </div>
              {pemErr.bb && <p style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>⚠ {pemErr.bb}</p>}
            </div>

            <div>
              <label className="label">Tinggi Badan (cm) <span style={{ color: "#dc2626" }}>*</span></label>
              <div style={{ position: "relative" }}>
                <Ruler size={14} color="#9aab9a" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <input type="number" step="0.1" min="0" name="tb" value={pemForm.tb ?? ""} onChange={handleChange} placeholder="cth: 82" className={`input-field${pemErr.tb ? " error" : ""}`} />
              </div>
              {pemErr.tb && <p style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>⚠ {pemErr.tb}</p>}
            </div>

            <div>
              <label className="label">Lingkar Kepala (cm) <span style={{ color: "#9aab9a", fontWeight: 400 }}>opsional</span></label>
              <input type="number" step="0.1" min="0" name="lingkarKepala" value={pemForm.lingkarKepala ?? ""} onChange={handleChange} placeholder="cth: 44" className="input-bare" />
            </div>




          </div>

          {/* Preview Status Stunting */}
          {stuntingPreview && (
            <div style={{ marginTop: 16, background: stuntingPreview.bg, border: `1.5px solid ${stuntingPreview.color}40`, borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20 }}>{stuntingPreview.icon}</span>
              <div>
                <p style={{ fontSize: 11, color: stuntingPreview.color, fontWeight: 700 }}>PREDIKSI STATUS</p>
                <p style={{ fontSize: 14, fontWeight: 800, color: stuntingPreview.color }}>{stuntingPreview.label} <span style={{ fontWeight: 400, fontSize: 12 }}>(Z-Score: {stuntingPreview.zScore} SD)</span></p>
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 20, paddingTop: 16, borderTop: "1px solid #f0f6f2" }}>
            <button type="button" onClick={onClose} className="btn-outline" style={{ flex: "0 0 auto" }}>Batal</button>
            <button type="submit" onClick={handleSubmit} disabled={saving} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, background: saving ? "#b5ceba" : "#2d7a4f", color: "#fff", border: "none", borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif", transition: "background 0.2s" }}>
              {saving
                ? <><div style={{ width: 15, height: 15, border: "2.5px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> Menyimpan…</>
                : <><Save size={15} /> Simpan Pemeriksaan</>}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════
   HALAMAN UTAMA
══════════════════════════════════════════ */
export default function PosyanduPage() {
  const [tab, setTab] = useState("data");

  const [balitaList, setBalitaList] = useState([]);
  const [loadingBalita, setLoadingBalita] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [searchBalita, setSearchBalita] = useState("");
  const [sortField, setSortField] = useState("nama");
  const [sortAsc, setSortAsc] = useState(true);
  const [toast, setToast] = useState(null);

  const [showPemForm, setShowPemForm] = useState(false);
  const [savingPem, setSavingPem] = useState(false);
  const [searchPem, setSearchPem] = useState("");
  const [pemHistory, setPemHistory] = useState([]);
  const [loadingPem, setLoadingPem] = useState(true);
  const [detailData, setDetailData] = useState(null);

  const [editPemData, setEditPemData] = useState(null);
  const [deletePemTarget, setDeletePemTarget] = useState(null);
  const [deletingPem, setDeletingPem] = useState(false);

  // useEffect(() => { loadBalita(); }, []);
  // useEffect(() => {

  //   if (tab === "pemeriksaan") loadPemeriksaan();
  // }, [tab]);

  useEffect(() => {
  loadBalita();
  loadPemeriksaan(); // ← tambahkan ini agar pemHistory tersedia dari awal
  }, []);

  useEffect(() => {
    if (tab === "pemeriksaan") loadPemeriksaan();
  }, [tab]);


  async function handlePemUpdate(pemForm) {
    setSavingPem(true);
    try {
      await updatePosyanduBalita(editPemData.id, {
        ...pemForm,
        tanggal: new Date().toISOString().split("T")[0],
      });
      await loadPemeriksaan();
      setEditPemData(null);
      showToast("Pemeriksaan berhasil diperbarui");
    } catch {
      showToast("Gagal memperbarui pemeriksaan", "error");
    } finally {
      setSavingPem(false);
    }
  }

  async function handlePemDelete() {
    setDeletingPem(true);
    try {
      await deletePosyanduBalita(deletePemTarget.id);
      await loadPemeriksaan();
      setDeletePemTarget(null);
      showToast("Pemeriksaan berhasil dihapus");
    } catch {
      showToast("Gagal menghapus pemeriksaan", "error");
    } finally {
      setDeletingPem(false);
    }
  }
  async function loadBalita() {
    setLoadingBalita(true);
    try { const data = await getBalita(); setBalitaList(data); }
    catch { showToast("Gagal memuat data balita", "error"); }
    finally { setLoadingBalita(false); }
  }

  async function loadPemeriksaan() {
    setLoadingPem(true);
    try { const data = await getPosyanduBalita(); setPemHistory(data); }
    catch { showToast("Gagal memuat data pemeriksaan", "error"); }
    finally { setLoadingPem(false); }
  }

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleCreate(formData) {
    try {
      await createBalita(formData);
      await loadBalita();
      setShowModal(false);
      showToast("Data balita berhasil ditambahkan");
    } catch (err) {
      const msg = err?.message || "";
      if (msg.includes("Unique constraint") && msg.includes("nik")) {
        throw new Error("NIK sudah terdaftar. Gunakan NIK yang berbeda atau cek data yang sudah ada.");
      } else if (msg.includes("Unique constraint")) {
        throw new Error("Data duplikat terdeteksi. Periksa kembali data yang dimasukkan.");
      } else {
        throw new Error("Gagal menyimpan data. Coba lagi.");
      }
    }
  }
  async function handleUpdate(formData) { await updateBalita(editData.id, formData); await loadBalita(); setEditData(null); setShowModal(false); showToast("Data balita berhasil diperbarui"); }
  async function handleDelete() {
    setDeleting(true);
    try { await deleteBalita(deleteTarget.id); await loadBalita(); setDeleteTarget(null); showToast("Data balita berhasil dihapus"); }
    catch { showToast("Gagal menghapus data balita", "error"); }
    finally { setDeleting(false); }
  }
  async function handlePemSubmit(pemForm) {
    setSavingPem(true);
    try { await createPosyanduBalita(pemForm); await loadPemeriksaan(); setShowPemForm(false); showToast("Pemeriksaan berhasil disimpan"); }
    catch { showToast("Gagal menyimpan pemeriksaan", "error"); }
    finally { setSavingPem(false); }
  }

  const filtered = balitaList
    .filter(b => b.nama?.toLowerCase().includes(searchBalita.toLowerCase()) || b.nik?.includes(searchBalita) || b.namaIbu?.toLowerCase().includes(searchBalita.toLowerCase()))
    .sort((a, b) => {
      const va = a[sortField] ?? "", vb = b[sortField] ?? "";
      if (typeof va === "string") return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
      return sortAsc ? va - vb : vb - va;
    });

  function toggleSort(field) {
    if (sortField === field) setSortAsc(s => !s);
    else { setSortField(field); setSortAsc(true); }
  }

  const totalBalita = balitaList.length;

  const stuntingCount = balitaList.filter(b => {
    const pemB = pemHistory
      .filter(p => String(p.balitaId) === String(b.id)) // ← paksa string
      .sort((a, c) => new Date(c.tanggal) - new Date(a.tanggal));
    if (!pemB.length) return false;
    const last = pemB[0];
    const usia = hitungUsiaBulan(b.tglLahir, last.tanggal);
    if (usia === null || usia === undefined || !last.tb) return false;
    const s = hitungStatusStunting(parseFloat(last.tb), usia, b.jenisKelamin);
    return s && s.status === "stunting";
  }).length;

  const severelyStuntingCount = balitaList.filter(b => {
    const pemB = pemHistory
      .filter(p => String(p.balitaId) === String(b.id)) // ← paksa string
      .sort((a, c) => new Date(c.tanggal) - new Date(a.tanggal));
    if (!pemB.length) return false;
    const last = pemB[0];
    const usia = hitungUsiaBulan(b.tglLahir, last.tanggal);
    if (usia === null || usia === undefined || !last.tb) return false;
    const s = hitungStatusStunting(parseFloat(last.tb), usia, b.jenisKelamin);
    return s && s.status === "severely_stunting";
  }).length;


  const bulanIni = balitaList.filter(b => {
    const d = new Date(b.tglLahir || b.createdAt);
    return d.getMonth() === new Date().getMonth() && d.getFullYear() === new Date().getFullYear();
  }).length;

  const filteredPem = pemHistory.filter(p =>
    (p.balita?.nama ?? "").toLowerCase().includes(searchPem.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, fontFamily: "'Plus Jakarta Sans',sans-serif", color: "#1f2d1f" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes toastIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideInRight { from{transform:translateX(100%)} to{transform:translateX(0)} }
        @keyframes popIn { from{opacity:0;transform:translate(-50%,-50%) scale(0.92)} to{opacity:1;transform:translate(-50%,-50%) scale(1)} }
        .th-btn { background:none;border:none;cursor:pointer;display:flex;align-items:center;gap:4px;font-size:12px;font-weight:700;color:#9aab9a;font-family:'Plus Jakarta Sans',sans-serif;padding:0;white-space:nowrap; }
        .th-btn:hover { color:#4a7a5a; }
        .tr-row { border-bottom:1px solid #f0f6f2;transition:background 0.15s; }
        .tr-row:last-child { border-bottom:none; }
        .tr-row:hover { background:#f8fbf9; }
        .search-inp { border:1.5px solid #e4ede6;border-radius:10px;padding:8px 12px 8px 36px;font-size:13px;font-family:'Plus Jakarta Sans',sans-serif;color:#1f2d1f;background:#fff;outline:none;width:240px;transition:border-color 0.2s; }
        .search-inp:focus { border-color:#2d7a4f; }
        .search-inp::placeholder { color:#9aab9a; }
        .btn-tambah { display:inline-flex;align-items:center;gap:7px;background:#2d7a4f;color:#fff;border:none;padding:10px 16px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;transition:all 0.2s;box-shadow:0 4px 14px rgba(45,122,79,0.25); }
        .btn-tambah:hover { background:#246240;transform:translateY(-1px); }
        .btn-edit  { display:inline-flex;align-items:center;gap:5px;background:#fef3c7;color:#d97706;border:1px solid #fde68a;padding:6px 10px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;transition:all 0.15s; }
        .btn-edit:hover  { background:#fde68a; }
        .btn-hapus { display:inline-flex;align-items:center;gap:5px;background:#fee2e2;color:#dc2626;border:1px solid #fecaca;padding:6px 10px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;transition:all 0.15s; }
        .btn-hapus:hover { background:#fecaca; }
        .btn-detail { display:inline-flex;align-items:center;gap:5px;background:#eff6ff;color:#2563eb;border:1px solid #bfdbfe;padding:6px 10px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;transition:all 0.15s; }
        .btn-detail:hover { background:#dbeafe; }
        .stat-card { background:#fff;border:1px solid #e4ede6;border-radius:14px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.04);display:flex;align-items:center;gap:13px;position:relative;overflow:hidden;transition:transform 0.18s; }
        .stat-card:hover { transform:translateY(-2px); }
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
        .btn-outline { display:inline-flex;align-items:center;gap:7px;background:#fff;color:#2d7a4f;border:1.5px solid #b8ddc5;padding:9px 16px;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;transition:all 0.2s; }
        .btn-outline:hover { background:#e8f5ed; }
        .btn-primary { display:inline-flex;align-items:center;gap:7px;background:#2d7a4f;color:#fff;border:none;padding:10px 18px;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;transition:all 0.2s;box-shadow:0 4px 14px rgba(45,122,79,0.28); }
        .btn-primary:hover { background:#246240;transform:translateY(-1px); }
        .badge-laki { display:inline-flex;align-items:center;gap:4px;background:#dbeafe;color:#1d4ed8;border-radius:6px;padding:3px 8px;font-size:11px;font-weight:700; }
        .badge-perempuan { display:inline-flex;align-items:center;gap:4px;background:#fce7f3;color:#be185d;border-radius:6px;padding:3px 8px;font-size:11px;font-weight:700; }
        .badge-null { display:inline-flex;align-items:center;background:#f3f4f6;color:#9ca3af;border-radius:6px;padding:3px 8px;font-size:11px;font-weight:600; }
        .badge-normal { background:#e8f5ed;color:#2d7a4f;font-size:11px;font-weight:700;padding:3px 10px;border-radius:50px; }
        .badge-stunting { background:#fef3c7;color:#d97706;font-size:11px;font-weight:700;padding:3px 10px;border-radius:50px; }
        .badge-severely { background:#fee2e2;color:#dc2626;font-size:11px;font-weight:700;padding:3px 10px;border-radius:50px; }
        .badge-nodata { background:#f3f4f6;color:#9ca3af;font-size:11px;font-weight:600;padding:3px 10px;border-radius:50px; }
        .section-title { font-size:15px;font-weight:700;color:#1f2d1f; }
        .section-sub   { font-size:12px;color:#9aab9a;margin-top:2px; }
      `}</style>

      {/* TOAST */}
      {toast && (
        <div style={{ position: "fixed", bottom: 28, right: 28, zIndex: 300, background: toast.type === "error" ? "#dc2626" : "#2d7a4f", color: "#fff", padding: "12px 20px", borderRadius: 12, fontSize: 14, fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.15)", animation: "toastIn 0.3s ease", display: "flex", alignItems: "center", gap: 8 }}>
          {toast.type === "error" ? "⚠" : "✓"} {toast.msg}
        </div>
      )}

      {/* TAB BAR */}
      <div style={{ display: "flex", gap: 6, background: "#fff", border: "1px solid #e4ede6", borderRadius: 14, padding: 5, width: "fit-content", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        {[
          { id: "data", label: "Data Balita", icon: Baby },
          { id: "pemeriksaan", label: "Input Pemeriksaan", icon: Scale },
        ].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)} style={{
            display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 10,
            background: tab === id ? "#2d7a4f" : "transparent", color: tab === id ? "#fff" : "#6b7c6b",
            border: "none", cursor: "pointer", fontWeight: 700, fontSize: 14,
            fontFamily: "'Plus Jakarta Sans',sans-serif",
            boxShadow: tab === id ? "0 2px 8px rgba(45,122,79,0.25)" : "none", transition: "all 0.18s",
          }}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* TAB DATA BALITA */}
      {tab === "data" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
            {[
              { icon: Baby, label: "Total Balita", value: loadingBalita ? "–" : totalBalita, sub: "Terdaftar aktif", accent: "#2d7a4f", bg: "#e8f5ed" },
              { icon: AlertTriangle, label: "Stunting", value: (loadingBalita || loadingPem) ? "–" : stuntingCount, sub: "Terdeteksi pemeriksaan", accent: "#d97706", bg: "#fef3c7" },
              { icon: TrendingDown, label: "Severely Stunting", value: (loadingBalita || loadingPem) ? "–" : severelyStuntingCount, sub: "Perlu penanganan segera", accent: "#dc2626", bg: "#fee2e2" },
              { icon: Calendar, label: "Baru Bulan Ini", value: loadingBalita ? "–" : bulanIni, sub: "Balita terdaftar baru", accent: "#be185d", bg: "#fce7f3" },
            ].map(({ icon: Icon, label, value, sub, accent, bg }) => (
              <div key={label} className="stat-card">
                <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: accent, borderRadius: "14px 0 0 14px" }} />
                <div style={{ background: bg, borderRadius: 10, padding: 9 }}><Icon size={18} color={accent} /></div>
                <div>
                  <p style={{ color: "#9aab9a", fontSize: 12 }}>{label}</p>
                  <p style={{ fontSize: 26, fontWeight: 800, color: "#1f2d1f", letterSpacing: -0.5 }}>{value}</p>
                  <p style={{ color: "#b5ceba", fontSize: 11, marginTop: 2 }}>{sub}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: "#fff", border: "1px solid #e4ede6", borderRadius: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #f0f6f2", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#1f2d1f" }}>Daftar Balita</p>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ position: "relative" }}>
                  <Search size={14} color="#9aab9a" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  <input className="search-inp" placeholder="Cari nama, NIK, nama ibu…" value={searchBalita} onChange={e => setSearchBalita(e.target.value)} />
                </div>
                <button className="btn-tambah" onClick={() => { setEditData(null); setShowModal(true); }}>
                  <Plus size={15} /> Tambah Balita
                </button>
              </div>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#f8fbf9" }}>
                    {[
                      { label: "No", field: null }, { label: "NIK", field: "nik" },
                      { label: "Nama Balita", field: "nama" }, { label: "Nama Ibu", field: "namaIbu" },
                      { label: "Tgl Lahir", field: "tglLahir" }, { label: "No Telp", field: "noTelp" },
                      { label: "Alamat", field: "alamat" }, { label: "Jenis Kelamin", field: "jenisKelamin" },
                      { label: "Aksi", field: null },
                    ].map(({ label, field }) => (
                      <th key={label} style={{ padding: "11px 14px", textAlign: "left", borderBottom: "1px solid #e4ede6", whiteSpace: "nowrap" }}>
                        {field
                          ? <button className="th-btn" onClick={() => toggleSort(field)}>{label}{sortField === field ? (sortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : <ChevronDown size={12} color="#dde8de" />}</button>
                          : <span style={{ fontSize: 12, fontWeight: 700, color: "#9aab9a" }}>{label}</span>
                        }
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loadingBalita && (
                    <tr><td colSpan={9} style={{ padding: "44px", textAlign: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, color: "#9aab9a" }}>
                        <div style={{ width: 18, height: 18, border: "2.5px solid #e4ede6", borderTopColor: "#2d7a4f", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                        Memuat data…
                      </div>
                    </td></tr>
                  )}
                  {!loadingBalita && filtered.length === 0 && (
                    <tr><td colSpan={9} style={{ padding: "52px", textAlign: "center" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                        <div style={{ background: "#e8f5ed", borderRadius: "50%", padding: 18 }}><Baby size={30} color="#b5ceba" /></div>
                        <p style={{ color: "#9aab9a", fontSize: 14, fontWeight: 500 }}>{searchBalita ? "Tidak ada data yang cocok" : "Belum ada data balita"}</p>
                        {!searchBalita && <button className="btn-tambah" onClick={() => { setEditData(null); setShowModal(true); }}><Plus size={14} /> Tambah Balita Pertama</button>}
                      </div>
                    </td></tr>
                  )}
                  {!loadingBalita && filtered.map((balita, i) => (
                    <tr key={balita.id} className="tr-row">
                      <td style={{ padding: "12px 14px", color: "#9aab9a", fontSize: 12 }}>{i + 1}</td>
                      <td style={{ padding: "12px 14px", fontFamily: "monospace", fontSize: 12, color: "#6b7c6b" }}>{balita.nik}</td>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#e8f5ed", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#2d7a4f", flexShrink: 0 }}>
                            {balita.nama?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 600, color: "#1f2d1f" }}>{balita.nama}</span>
                        </div>
                      </td>
                      <td style={{ padding: "12px 14px", color: "#6b7c6b" }}>{balita.namaIbu || "-"}</td>
                      <td style={{ padding: "12px 14px", color: "#6b7c6b", whiteSpace: "nowrap" }}>{formatDate(balita.tglLahir)}</td>
                      <td style={{ padding: "12px 14px", color: "#6b7c6b" }}>{balita.noTelp || "-"}</td>
                      <td style={{ padding: "12px 14px", color: "#6b7c6b", maxWidth: 160 }}>
                        <span style={{ display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{balita.alamat || "-"}</span>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        {balita.jenisKelamin === "Laki-laki" ? <span className="badge-laki">♂ Laki-laki</span>
                          : balita.jenisKelamin === "Perempuan" ? <span className="badge-perempuan">♀ Perempuan</span>
                            : <span className="badge-null">-</span>}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="btn-edit" onClick={() => { setEditData(balita); setShowModal(true); }}><Pencil size={12} /> Edit</button>
                          <button className="btn-hapus" onClick={() => setDeleteTarget(balita)}><Trash2 size={12} /> Hapus</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {!loadingBalita && filtered.length > 0 && (
              <div style={{ padding: "11px 20px", borderTop: "1px solid #f0f6f2" }}>
                <p style={{ color: "#9aab9a", fontSize: 12 }}>Menampilkan {filtered.length} dari {balitaList.length} data balita</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB PEMERIKSAAN */}
      {tab === "pemeriksaan" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card" style={{ padding: "18px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <div>
              <p className="section-title">Data Pemeriksaan Balita</p>
              <p className="section-sub">Catat BB, TB, dan lingkar kepala setiap kunjungan posyandu</p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ position: "relative" }}>
                <Search size={14} color="#9aab9a" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <input className="search-inp" placeholder="Cari nama balita…" value={searchPem} onChange={e => setSearchPem(e.target.value)} />
              </div>
              <button className="btn-primary" onClick={() => setShowPemForm(true)}>
                <Plus size={15} /> Input Pemeriksaan
              </button>
            </div>
          </div>

          <div className="card" style={{ overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#f8fbf9" }}>
                    {["No", "Kegiatan", "Nama Balita", "Tgl Pemeriksaan", "BB (kg)", "TB (cm)", "Lk. Kepala", "Status", "Aksi"].map(h => (
                      <th key={h} style={{ padding: "11px 14px", textAlign: "left", borderBottom: "1px solid #e4ede6", fontSize: 12, fontWeight: 700, color: "#9aab9a", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loadingPem && (
                    <tr><td colSpan={10} style={{ padding: "44px", textAlign: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, color: "#9aab9a" }}>
                        <div style={{ width: 18, height: 18, border: "2.5px solid #e4ede6", borderTopColor: "#2d7a4f", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                        Memuat data…
                      </div>
                    </td></tr>
                  )}
                  {!loadingPem && filteredPem.length === 0 && (
                    <tr><td colSpan={10} style={{ padding: "36px", textAlign: "center", color: "#9aab9a" }}>Belum ada data pemeriksaan.</td></tr>
                  )}
                  {!loadingPem && filteredPem.map((p, i) => {
                    const balita = p.balita;
                    const usiaBulan = hitungUsiaBulan(balita?.tglLahir, p.tanggal);
                    const stunting = (p.tb && usiaBulan !== null)
                      ? hitungStatusStunting(parseFloat(p.tb), usiaBulan, balita?.jenisKelamin)
                      : null;

                    return (
                      <tr key={p.id} className="tr-row">
                        <td style={{ padding: "12px 14px", color: "#9aab9a" }}>{i + 1}</td>
                        <td style={{ padding: "12px 14px", color: "#6b7c6b" }}>{p.kegiatan || "-"}</td>
                        <td style={{ padding: "12px 14px", fontWeight: 600, color: "#1f2d1f" }}>{balita?.nama ?? "-"}</td>
                        <td style={{ padding: "12px 14px", color: "#6b7c6b", whiteSpace: "nowrap" }}>{formatDisplay(p.tanggal)}</td>
                        <td style={{ padding: "12px 14px", fontWeight: 700, color: "#1f2d1f" }}>{p.bb ?? "-"}</td>
                        <td style={{ padding: "12px 14px", fontWeight: 700, color: "#1f2d1f" }}>{p.tb ?? "-"}</td>
                        <td style={{ padding: "12px 14px", color: "#6b7c6b" }}>{p.lingkarKepala ?? "-"}</td>

                        {/* ── Kolom Status Stunting WHO ── */}
                        <td style={{ padding: "12px 14px" }}>
                          {stunting
                            ? stunting.status === "severely_stunting"
                              ? <span className="badge-severely">🔴 Severely Stunting</span>
                              : stunting.status === "stunting"
                                ? <span className="badge-stunting">🟡 Stunting</span>
                                : <span className="badge-normal">🟢 Normal</span>
                            : <span className="badge-nodata">-</span>
                          }
                        </td>
                        {/* ── Kolom Detail ── */}
                       
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button className="btn-detail" onClick={() => setDetailData(p)}>
                              <Info size={12} /> Detail
                            </button>
                            <button className="btn-edit" onClick={() => setEditPemData(p)}>
                              <Pencil size={12} /> Edit
                            </button>
                            <button className="btn-hapus" onClick={() => setDeletePemTarget(p)}>
                              <Trash2 size={12} /> Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showModal && (
        <BalitaFormModal
          editData={editData}
          onClose={() => { setShowModal(false); setEditData(null); }}
          onSubmit={editData ? handleUpdate : handleCreate}
        />
      )}
      {deleteTarget && (
        <DeleteConfirmModal
          balita={deleteTarget}
          loading={deleting}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
      {showPemForm && (
        <PemeriksaanFormModal
          balitaList={balitaList}
          saving={savingPem}
          onClose={() => setShowPemForm(false)}
          onSubmit={handlePemSubmit}
        />
      )}
      {/* ── Detail Modal ── */}
      {detailData && (
        <DetailModal
          data={detailData}
          onClose={() => setDetailData(null)}
        />
      )}
      {editPemData && (
        <PemeriksaanFormModal
          balitaList={balitaList}
          saving={savingPem}
          editData={editPemData}
          onClose={() => setEditPemData(null)}
          onSubmit={handlePemUpdate}
        />
      )}

      {deletePemTarget && (
        <DeleteConfirmModal
          balita={{ nama: deletePemTarget.balita?.nama }}
          loading={deletingPem}
          onClose={() => setDeletePemTarget(null)}
          onConfirm={handlePemDelete}
        />
      )}
    </div>
  );
}