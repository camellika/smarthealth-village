"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getLansia, createLansia, updateLansia, deleteLansia } from "@/services/lansiaService";
import { getPosyanduLansia, createPosyanduLansia, updatePosyanduLansia, deletePosyanduLansia } from "@/services/posyanduLansiaService";
import { getJadwalTerdekat } from "@/services/penjadwalanService";
import {
  Users, Plus, Search, ChevronDown, ChevronUp,
  AlertTriangle, Calendar, X, CreditCard,
  Phone, MapPin, Save, Pencil, Trash2, Scale, Ruler,
  Activity, Droplets, Heart, Info, CheckCircle, AlertCircle
} from "lucide-react";

/* ══════════════════════════════════════════
   HELPERS
══════════════════════════════════════════ */
const INIT_FORM_LANSIA = { nik: "", nama: "", alamat: "", noTelp: "", tglLahir: "", jenisKelamin: "" };
const INIT_FORM_PEM    = { lansiaId: "", kegiatan: "", tanggal: "", bb: "", tb: "", lingkarPerut: "", tensi: "", gulaDarah: "" };

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
  const mm  = String(dt.getMonth() + 1).padStart(2, "0");
  const dd  = String(dt.getDate()).padStart(2, "0");
  return `${dt.getFullYear()}-${mm}-${dd}`;
};
const hitungUsia = (tgl) => {
  if (!tgl) return "-";
  const diff  = Date.now() - new Date(tgl).getTime();
  const tahun = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  return `${tahun} th`;
};

/* ── Status Tensi ── */
function getStatusTensi(tensi) {
  if (!tensi) return null;
  if (tensi >= 160) return { status: "tinggi2",  label: "Hipertensi Tk. 2", color: "#7c2d12", bg: "#fee2e2", border: "#fecaca", icon: "🔴" };
  if (tensi >= 140) return { status: "tinggi1",  label: "Hipertensi Tk. 1", color: "#dc2626", bg: "#fee2e2", border: "#fecaca", icon: "🔴" };
  if (tensi >= 120) return { status: "prehiper", label: "Pra-Hipertensi",   color: "#d97706", bg: "#fef3c7", border: "#fde68a", icon: "🟡" };
  if (tensi < 90)   return { status: "rendah",   label: "Tensi Rendah",     color: "#d97706", bg: "#fef3c7", border: "#fde68a", icon: "🟡" };
  return               { status: "normal",   label: "Normal",           color: "#2d7a4f", bg: "#e8f5ed", border: "#b8ddc5", icon: "🟢" };
}

/* ── Status Gula Darah ── */
function getStatusGula(gula) {
  if (!gula) return null;
  if (gula >= 200) return { label: "Diabetes",     color: "#dc2626", bg: "#fee2e2", border: "#fecaca", icon: "🔴" };
  if (gula >= 100) return { label: "Pra-Diabetes", color: "#d97706", bg: "#fef3c7", border: "#fde68a", icon: "🟡" };
  return              { label: "Normal",        color: "#2d7a4f", bg: "#e8f5ed", border: "#b8ddc5", icon: "🟢" };
}

/* ══════════════════════════════════════════
   MODAL DETAIL PEMERIKSAAN LANSIA
══════════════════════════════════════════ */
function DetailModal({ data, onClose }) {
  if (!data) return null;

  const tensiStatus = data.tensi     ? getStatusTensi(parseFloat(data.tensi))    : null;
  const gulaStatus  = data.gulaDarah ? getStatusGula(parseFloat(data.gulaDarah)) : null;

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
  const infoGula  = gulaStatus  ? saranGula[gulaStatus.label]    : null;

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
                { label: "Berat Badan",   value: data.bb           ? `${data.bb} kg`           : "-", accent: true,         c: "#2d7a4f",                       bg: "#e8f5ed",                      border: "#b8ddc5" },
                { label: "Tinggi Badan",  value: data.tb           ? `${data.tb} cm`           : "-", accent: true,         c: "#0284c7",                       bg: "#e0f2fe",                      border: "#bae6fd" },
                { label: "Lingkar Perut", value: data.lingkarPerut ? `${data.lingkarPerut} cm`  : "-", accent: false },
                { label: "Tensi",         value: data.tensi        ? `${data.tensi} mmHg`      : "-", accent: !!data.tensi, c: tensiStatus?.color ?? "#dc2626", bg: tensiStatus?.bg ?? "#fee2e2",   border: (tensiStatus?.color ?? "#dc2626") + "40" },
                { label: "Gula Darah",    value: data.gulaDarah    ? `${data.gulaDarah} mg/dL`  : "-", accent: !!data.gulaDarah, c: gulaStatus?.color ?? "#6b7c6b", bg: gulaStatus?.bg ?? "#f8fbf9", border: (gulaStatus?.color ?? "#9aab9a") + "40" },
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
   MODAL FORM LANSIA — Tambah & Edit
══════════════════════════════════════════ */
function LansiaFormModal({ onClose, onSubmit, editData }) {
  const isEdit = !!editData;
  const [form, setForm] = useState(
    isEdit
      ? { ...editData, tglLahir: toInputDate(editData.tglLahir), jenisKelamin: editData.jenisKelamin ?? "" }
      : INIT_FORM_LANSIA
  );
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [apiError, setApiError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: "" }));
    if (apiError)     setApiError("");
  }

  function validate() {
    const e = {};
    if (!form.nik.trim())                   e.nik          = "NIK wajib diisi";
    else if (form.nik.trim().length !== 16) e.nik          = "NIK harus 16 digit";
    if (!form.nama.trim())                  e.nama         = "Nama lansia wajib diisi";
    if (!form.alamat.trim())                e.alamat       = "Alamat wajib diisi";
    if (!form.tglLahir)                     e.tglLahir     = "Tanggal lahir wajib diisi";
    if (!form.jenisKelamin)                 e.jenisKelamin = "Jenis kelamin wajib dipilih";
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
    { name: "nik",      label: "NIK",           type: "text",     icon: CreditCard, placeholder: "16 digit NIK lansia",      span: 2, hint: "Nomor Induk Kependudukan 16 digit", required: true  },
    { name: "nama",     label: "Nama Lansia",    type: "text",     icon: Users,      placeholder: "Nama lengkap lansia",       span: 1, required: true  },
    { name: "noTelp",   label: "No. Telepon",    type: "text",     icon: Phone,      placeholder: "08xx-xxxx-xxxx (opsional)", span: 1, required: false },
    { name: "tglLahir", label: "Tanggal Lahir",  type: "date",     icon: Calendar,   placeholder: "",                          span: 1, required: true  },
    { name: "alamat",   label: "Alamat Lengkap", type: "textarea", icon: MapPin,     placeholder: "RT/RW, Dusun, Desa…",      span: 2, required: true  },
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
              <Users size={20} color={isEdit ? "#d97706" : "#2d7a4f"} />
            </div>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: "#1f2d1f" }}>{isEdit ? "Edit Data Lansia" : "Tambah Data Lansia"}</h2>
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
              : <><Save size={15} /> {isEdit ? "Simpan Perubahan" : "Simpan Data Lansia"}</>
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
function DeleteConfirmModal({ lansia, onClose, onConfirm, loading }) {
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,30,15,0.4)", backdropFilter: "blur(4px)", zIndex: 200 }} />
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "min(420px,90vw)", background: "#fff", borderRadius: 18, boxShadow: "0 20px 60px rgba(0,0,0,0.15)", zIndex: 201, fontFamily: "'Plus Jakarta Sans',sans-serif", animation: "popIn 0.22s cubic-bezier(0.16,1,0.3,1)" }}>
        <style>{`
          @keyframes popIn    { from{opacity:0;transform:translate(-50%,-50%) scale(0.92)} to{opacity:1;transform:translate(-50%,-50%) scale(1)} }
          @keyframes spinAnim { to{transform:rotate(360deg)} }
        `}</style>
        <div style={{ padding: "28px 28px 20px", textAlign: "center" }}>
          <div style={{ width: 56, height: 56, background: "#fee2e2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Trash2 size={24} color="#dc2626" />
          </div>
          <h3 style={{ fontSize: 17, fontWeight: 800, color: "#1f2d1f", marginBottom: 8 }}>Hapus Data Lansia?</h3>
          <p style={{ color: "#6b7c6b", fontSize: 14, lineHeight: 1.6 }}>
            Data <strong>{lansia?.nama}</strong> beserta seluruh riwayat pemeriksaannya akan dihapus permanen dan tidak bisa dikembalikan.
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
   MODAL FORM PEMERIKSAAN LANSIA
══════════════════════════════════════════ */
function PemeriksaanFormModal({ lansiaList, editData, onClose, onSubmit, saving }) {
const isEdit = !!editData;
  const [pemForm, setPemForm]             = useState(isEdit ? { ...editData, tanggal: toInputDate(editData.tanggal) } : { ...INIT_FORM_PEM, tanggal: new Date().toISOString().split("T")[0] });
  const [pemErr, setPemErr]               = useState({});
  const [jadwalList, setJadwalList]       = useState([]);
  const [loadingJadwal, setLoadingJadwal] = useState(true);  useEffect(() => {
    getJadwalTerdekat().then(setJadwalList).finally(() => setLoadingJadwal(false));
  }, []);

  const tensiPreview = pemForm.tensi ? getStatusTensi(parseFloat(pemForm.tensi)) : null;

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === "kegiatan") {
      const jadwalDipilih = jadwalList.find(j => j.kegiatan === value);
      setPemForm(p => ({ ...p, kegiatan: value }));
    } else {
      setPemForm(p => ({ ...p, [name]: value }));
    }
    if (pemErr[name]) setPemErr(p => ({ ...p, [name]: "" }));
  }

  function validate() {
    const e = {};
    if (!pemForm.lansiaId)        e.lansiaId = "Pilih lansia";
    if (!pemForm.kegiatan.trim()) e.kegiatan = "Pilih kegiatan";
    if (!pemForm.tanggal)         e.tanggal  = "Tanggal wajib diisi";
    return e;
  }

  function handleSubmit(ev) {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setPemErr(errs); return; }
    onSubmit(pemForm);
  }

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,30,15,0.35)", backdropFilter: "blur(4px)", zIndex: 200 }} />
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "min(520px,100vw)", background: "#fff", boxShadow: "-8px 0 40px rgba(0,0,0,0.12)", zIndex: 201, display: "flex", flexDirection: "column", fontFamily: "'Plus Jakarta Sans',sans-serif", animation: "slideInRight 0.28s cubic-bezier(0.16,1,0.3,1)" }}>

        <div style={{ padding: "20px 22px 16px", borderBottom: "1px solid #f0f6f2", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ background: isEdit ? "#fef3c7" : "#f3f0ff", borderRadius: 10, padding: 9 }}>
              <Activity size={18} color={isEdit ? "#d97706" : "#2d7a4f"} />
            </div>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: "#1f2d1f" }}>{isEdit ? "Edit Pemeriksaan Lansia" : "Input Pemeriksaan Lansia"}</h2>
              <p style={{ fontSize: 12, color: "#9aab9a", marginTop: 2 }}>Catat hasil pemeriksaan kesehatan lansia</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "#f5f7f4", border: "1px solid #e4ede6", borderRadius: 8, padding: "5px 6px", cursor: "pointer", display: "flex" }}>
            <X size={15} color="#6b7c6b" />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "20px 22px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 14px" }}>

            {/* Kegiatan */}
            <div style={{ gridColumn: "1/-1" }}>
              <label className="label">Nama Kegiatan <span style={{ color: "#dc2626" }}>*</span></label>
              <select name="kegiatan" value={pemForm.kegiatan ?? ""} onChange={handleChange} disabled={loadingJadwal}
                style={{ width: "100%", border: `1.5px solid ${pemErr.kegiatan ? "#dc2626" : "#e4ede6"}`, borderRadius: 10, padding: "10px 12px", fontSize: 14, fontFamily: "'Plus Jakarta Sans',sans-serif", color: pemForm.kegiatan ? "#1f2d1f" : "#9aab9a", background: loadingJadwal ? "#f8fbf9" : "#fff", outline: "none", cursor: loadingJadwal ? "not-allowed" : "pointer" }}>
                <option value="">{loadingJadwal ? "Memuat jadwal…" : "-- Pilih jadwal kegiatan --"}</option>
                {jadwalList.map(j => (
                  <option key={j.id} value={j.kegiatan}>
                    {j.kegiatan} · {new Date(j.tanggal).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })} · {j.tempat}
                  </option>
                ))}
              </select>
              {pemErr.kegiatan && <p style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>⚠ {pemErr.kegiatan}</p>}
            </div>

            {/* Nama Lansia */}
            <div style={{ gridColumn: "1/-1" }}>
              <label className="label">Nama Lansia <span style={{ color: "#dc2626" }}>*</span></label>
              <select name="lansiaId" value={pemForm.lansiaId ?? ""} onChange={handleChange}
                style={{ width: "100%", border: `1.5px solid ${pemErr.lansiaId ? "#dc2626" : "#e4ede6"}`, borderRadius: 10, padding: "10px 12px", fontSize: 14, fontFamily: "'Plus Jakarta Sans',sans-serif", color: pemForm.lansiaId ? "#1f2d1f" : "#9aab9a", background: "#fff", outline: "none" }}>
                <option value="">-- Pilih lansia --</option>
                {lansiaList.map(l => <option key={l.id} value={l.id}>{l.nama} ({hitungUsia(l.tglLahir)})</option>)}
              </select>
              {pemErr.lansiaId && <p style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>⚠ {pemErr.lansiaId}</p>}
            </div>

            {/* Tanggal */}
            <div style={{ gridColumn: "1/-1" }}>
              <label className="label">
                Tanggal Pemeriksaan <span style={{ color: "#dc2626" }}>*</span>
                {pemForm.kegiatan && <span style={{ color: "#9aab9a", fontWeight: 400, marginLeft: 6, fontSize: 11 }}>(otomatis dari jadwal, bisa diubah)</span>}
              </label>
              <div style={{ position: "relative" }}>
                <Calendar size={14} color="#9aab9a" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <input type="date" name="tanggal" value={pemForm.tanggal ?? ""} onChange={handleChange}
                  className={`input-field${pemErr.tanggal ? " error" : ""}`} />
              </div>
              {pemErr.tanggal && <p style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>⚠ {pemErr.tanggal}</p>}
            </div>

            {/* BB */}
            <div>
              <label className="label">Berat Badan (kg) <span style={{ color: "#9aab9a", fontWeight: 400 }}>opsional</span></label>
              <div style={{ position: "relative" }}>
                <Scale size={14} color="#9aab9a" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <input type="number" step="0.1" min="0" name="bb" value={pemForm.bb ?? ""} onChange={handleChange} placeholder="cth: 55.5" className="input-field" />
              </div>
            </div>

            {/* TB */}
            <div>
              <label className="label">Tinggi Badan (cm) <span style={{ color: "#9aab9a", fontWeight: 400 }}>opsional</span></label>
              <div style={{ position: "relative" }}>
                <Ruler size={14} color="#9aab9a" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <input type="number" step="0.1" min="0" name="tb" value={pemForm.tb ?? ""} onChange={handleChange} placeholder="cth: 155" className="input-field" />
              </div>
            </div>

            {/* Lingkar Perut */}
            <div>
              <label className="label">Lingkar Perut (cm) <span style={{ color: "#9aab9a", fontWeight: 400 }}>opsional</span></label>
              <div style={{ position: "relative" }}>
                <Ruler size={14} color="#9aab9a" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <input type="number" step="0.1" min="0" name="lingkarPerut" value={pemForm.lingkarPerut ?? ""} onChange={handleChange} placeholder="cth: 80" className="input-field" />
              </div>
            </div>

            {/* Tensi */}
            <div>
              <label className="label">Tensi (mmHg) <span style={{ color: "#9aab9a", fontWeight: 400 }}>opsional</span></label>
              <div style={{ position: "relative" }}>
                <Heart size={14} color="#9aab9a" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <input type="number" step="1" min="0" name="tensi" value={pemForm.tensi ?? ""} onChange={handleChange} placeholder="cth: 120" className="input-field" />
              </div>
            </div>

            {/* Gula Darah */}
            <div style={{ gridColumn: "1/-1" }}>
              <label className="label">Gula Darah (mg/dL) <span style={{ color: "#9aab9a", fontWeight: 400 }}>opsional</span></label>
              <div style={{ position: "relative" }}>
                <Droplets size={14} color="#9aab9a" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <input type="number" step="1" min="0" name="gulaDarah" value={pemForm.gulaDarah ?? ""} onChange={handleChange} placeholder="cth: 100" className="input-field" />
              </div>
            </div>
          </div>

          {/* Preview Status Tensi */}
          {tensiPreview && (
            <div style={{ marginTop: 16, background: tensiPreview.bg, border: `1.5px solid ${tensiPreview.color}40`, borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20 }}>{tensiPreview.icon}</span>
              <div>
                <p style={{ fontSize: 11, color: tensiPreview.color, fontWeight: 700 }}>PREDIKSI STATUS TENSI</p>
                <p style={{ fontSize: 14, fontWeight: 800, color: tensiPreview.color }}>
                  {tensiPreview.label}
                  <span style={{ fontWeight: 400, fontSize: 12 }}> ({pemForm.tensi} mmHg)</span>
                </p>
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 24, paddingTop: 16, borderTop: "1px solid #f0f6f2" }}>
            <button type="button" onClick={onClose} className="btn-outline" style={{ flex: "0 0 auto" }}>Batal</button>
            <button type="submit" onClick={handleSubmit} disabled={saving} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, background: saving ? "#b5ceba" : "#2d7a4f", color: "#fff", border: "none", borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif", transition: "background 0.2s", boxShadow: saving ? "none" : "0 4px 14px rgba(124,58,237,0.28)" }}>
              {saving
                ? <><div style={{ width: 15, height: 15, border: "2.5px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> Menyimpan…</>
                : <><Save size={15} /> {isEdit ? "Simpan Perubahan" : "Simpan Pemeriksaan"}</>}
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
export default function PosyanduLansiaPage() {
  const [tab, setTab] = useState("data");

  const [lansiaList, setLansiaList]       = useState([]);
  const [loadingLansia, setLoadingLansia] = useState(true);
  const [showModal, setShowModal]         = useState(false);
  const [editData, setEditData]           = useState(null);
  const [deleteTarget, setDeleteTarget]   = useState(null);
  const [deleting, setDeleting]           = useState(false);
  const [searchLansia, setSearchLansia]   = useState("");
  const [sortField, setSortField]         = useState("nama");
  const [sortAsc, setSortAsc]             = useState(true);
  const [toast, setToast]                 = useState(null);

  const [pemList, setPemList]                 = useState([]);
  const [loadingPem, setLoadingPem]           = useState(true);
  const [showPemForm, setShowPemForm]         = useState(false);
  const [editPem, setEditPem]                 = useState(null);
  const [savingPem, setSavingPem]             = useState(false);
  const [deletePemTarget, setDeletePemTarget] = useState(null);
  const [deletingPem, setDeletingPem]         = useState(false);
  const [searchPem, setSearchPem]             = useState("");
  const [detailData, setDetailData]           = useState(null);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoadingLansia(true);
    setLoadingPem(true);
    try {
      const [l, p] = await Promise.all([getLansia(), getPosyanduLansia()]);
      setLansiaList(l);
      setPemList(p);
    } catch {
      showToast("Gagal memuat data", "error");
    } finally {
      setLoadingLansia(false);
      setLoadingPem(false);
    }
  }

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleCreate(formData) {
    try {
      await createLansia(formData);
      await loadAll();
      setShowModal(false);
      showToast("Data lansia berhasil ditambahkan");
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
  async function handleUpdate(formData)  { await updateLansia(editData.id, formData); await loadAll(); setEditData(null); setShowModal(false); showToast("Data lansia berhasil diperbarui"); }
  async function handleDelete() {
    setDeleting(true);
    try { await deleteLansia(deleteTarget.id); await loadAll(); setDeleteTarget(null); showToast("Data lansia berhasil dihapus"); }
    catch (err) { showToast(err?.message || "Gagal menghapus data lansia", "error"); }
    finally { setDeleting(false); }
  }

  async function handlePemSubmit(pemForm) {
    setSavingPem(true);
    try {
      if (editPem) { await updatePosyanduLansia(editPem.id, pemForm); showToast("Pemeriksaan berhasil diperbarui"); }
      else         { await createPosyanduLansia(pemForm);              showToast("Pemeriksaan berhasil disimpan"); }
      await loadAll(); setShowPemForm(false); setEditPem(null);
    } catch { showToast("Gagal menyimpan pemeriksaan", "error"); }
    finally { setSavingPem(false); }
  }

  async function handleDeletePem() {
    setDeletingPem(true);
    try { await deletePosyanduLansia(deletePemTarget.id); await loadAll(); setDeletePemTarget(null); showToast("Pemeriksaan berhasil dihapus"); }
    catch { showToast("Gagal menghapus pemeriksaan", "error"); }
    finally { setDeletingPem(false); }
  }

  const filtered = lansiaList
    .filter(l => l.nama?.toLowerCase().includes(searchLansia.toLowerCase()) || l.nik?.includes(searchLansia))
    .sort((a, b) => {
      const va = a[sortField] ?? "", vb = b[sortField] ?? "";
      if (typeof va === "string") return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
      return sortAsc ? va - vb : vb - va;
    });

  function toggleSort(field) {
    if (sortField === field) setSortAsc(s => !s);
    else { setSortField(field); setSortAsc(true); }
  }

  const totalLansia  = lansiaList.length;
  const risikoTinggi = lansiaList.filter(l => {
    const pem = pemList.filter(p => p.lansiaId === l.id);
    if (!pem.length) return false;
    const last = pem[0];
    return (last.tensi && last.tensi > 140) || (last.gulaDarah && last.gulaDarah > 200);
  }).length;
  const bulanIni = lansiaList.filter(l => {
    const d = new Date(l.tglLahir || l.createdAt);
    return d.getMonth() === new Date().getMonth() && d.getFullYear() === new Date().getFullYear();
  }).length;

  const filteredPem = pemList.filter(p =>
    p.lansia?.nama?.toLowerCase().includes(searchPem.toLowerCase()) ||
    p.kegiatan?.toLowerCase().includes(searchPem.toLowerCase())
  );

  /* ── Helper render badge status ── */
  function BadgeTensi({ tensiSt }) {
    if (!tensiSt) return <span className="badge-nodata">—</span>;
    if (tensiSt.status === "tinggi2" || tensiSt.status === "tinggi1")
      return <span className="badge-tinggi">{tensiSt.icon} {tensiSt.label}</span>;
    if (tensiSt.status === "prehiper" || tensiSt.status === "rendah")
      return <span className="badge-prehiper">{tensiSt.icon} {tensiSt.label}</span>;
    return <span className="badge-normal">{tensiSt.icon} {tensiSt.label}</span>;
  }

  function BadgeGula({ gulaSt }) {
    if (!gulaSt) return <span className="badge-nodata">—</span>;
    if (gulaSt.label === "Diabetes")
      return <span className="badge-tinggi">{gulaSt.icon} {gulaSt.label}</span>;
    if (gulaSt.label === "Pra-Diabetes")
      return <span className="badge-prehiper">{gulaSt.icon} {gulaSt.label}</span>;
    return <span className="badge-normal">{gulaSt.icon} {gulaSt.label}</span>;
  }

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
        .btn-tambah:hover { background:#245f3d;transform:translateY(-1px); }
        .btn-edit   { display:inline-flex;align-items:center;gap:5px;background:#fef3c7;color:#d97706;border:1px solid #fde68a;padding:6px 10px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;transition:all 0.15s; }
        .btn-edit:hover   { background:#fde68a; }
        .btn-hapus  { display:inline-flex;align-items:center;gap:5px;background:#fee2e2;color:#dc2626;border:1px solid #fecaca;padding:6px 10px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;transition:all 0.15s; }
        .btn-hapus:hover  { background:#fecaca; }
        .btn-detail { display:inline-flex;align-items:center;gap:5px;background:#eff6ff;color:#2563eb;border:1px solid #bfdbfe;padding:6px 10px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;transition:all 0.15s; }
        .btn-detail:hover { background:#dbeafe; }
        .stat-card { background:#fff;border:1px solid #e4ede6;border-radius:14px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.04);display:flex;align-items:center;gap:13px;position:relative;overflow:hidden;transition:transform 0.18s; }
        .stat-card:hover { transform:translateY(-2px); }
        .input-field { width:100%;border:1.5px solid #e4ede6;border-radius:10px;padding:10px 12px 10px 38px;font-size:14px;font-family:'Plus Jakarta Sans',sans-serif;color:#1f2d1f;background:#fff;outline:none;transition:border-color 0.2s,box-shadow 0.2s; }
        .input-field:focus { border-color:#2d7a4f;box-shadow:0 0 0 3px rgba(45,122,79,0.1); }
        .input-field::placeholder { color:#b5ceba; }
        .input-field.error { border-color:#dc2626; }
        .label { display:block;font-size:13px;font-weight:700;color:#3d5542;margin-bottom:6px; }
        .btn-outline { display:inline-flex;align-items:center;gap:7px;background:#fff;color:#2d7a4f;border:1.5px solid #ddd6fe;padding:9px 16px;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;transition:all 0.2s; }
        .btn-outline:hover { background:#f5f3ff; }
        .btn-primary { display:inline-flex;align-items:center;gap:7px;background:#2d7a4f;color:#fff;border:none;padding:10px 18px;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;transition:all 0.2s;box-shadow:0 4px 14px rgba(45,122,79,0.28); }
        .btn-primary:hover { background:#245f3d;transform:translateY(-1px); }
        .card { background:#fff;border:1px solid #e4ede6;border-radius:16px;box-shadow:0 2px 8px rgba(0,0,0,0.04); }
        .section-title { font-size:15px;font-weight:700;color:#1f2d1f; }
        .section-sub   { font-size:12px;color:#9aab9a;margin-top:2px; }
        .badge-normal   { display:inline-flex;align-items:center;gap:4px;background:#e8f5ed;color:#2d7a4f;border:1px solid #b8ddc5;font-size:11px;font-weight:700;padding:4px 10px;border-radius:8px;white-space:nowrap; }
        .badge-prehiper { display:inline-flex;align-items:center;gap:4px;background:#fef3c7;color:#d97706;border:1px solid #fde68a;font-size:11px;font-weight:700;padding:4px 10px;border-radius:8px;white-space:nowrap; }
        .badge-tinggi   { display:inline-flex;align-items:center;gap:4px;background:#fee2e2;color:#dc2626;border:1px solid #fecaca;font-size:11px;font-weight:700;padding:4px 10px;border-radius:8px;white-space:nowrap; }
        .badge-nodata   { display:inline-flex;align-items:center;background:#f3f4f6;color:#9ca3af;border:1px solid #e5e7eb;font-size:11px;font-weight:600;padding:4px 10px;border-radius:8px; }
        .badge-laki     { display:inline-flex;align-items:center;gap:4px;background:#dbeafe;color:#1d4ed8;border-radius:6px;padding:3px 8px;font-size:11px;font-weight:700; }
        .badge-perempuan { display:inline-flex;align-items:center;gap:4px;background:#fce7f3;color:#be185d;border-radius:6px;padding:3px 8px;font-size:11px;font-weight:700; }
        .badge-null     { display:inline-flex;align-items:center;background:#f3f4f6;color:#9ca3af;border-radius:6px;padding:3px 8px;font-size:11px;font-weight:600; }
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
          { id: "data",        label: "Data Lansia",       icon: Users    },
          { id: "pemeriksaan", label: "Input Pemeriksaan", icon: Activity },
        ].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)} style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "9px 18px", borderRadius: 10,
            background: tab === id ? "#2d7a4f" : "transparent",
            color: tab === id ? "#fff" : "#6b7c6b",
            border: "none", cursor: "pointer", fontWeight: 700, fontSize: 14,
            fontFamily: "'Plus Jakarta Sans',sans-serif",
            boxShadow: tab === id ? "0 2px 8px rgba(45,122,79,0.25)" : "none",
            transition: "all 0.18s",
          }}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* TAB DATA LANSIA */}
      {tab === "data" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
            {[
              { icon: Users,         label: "Total Lansia",   value: loadingLansia ? "–" : totalLansia,  sub: "Terdaftar aktif",        accent: "#2d7a4f", bg: "#e8f5ed" },
              { icon: AlertTriangle, label: "Risiko Tinggi",  value: loadingLansia ? "–" : risikoTinggi, sub: "Tensi/gula darah tinggi", accent: "#be185d", bg: "#fce7f3" },
              { icon: Calendar,      label: "Baru Bulan Ini", value: loadingLansia ? "–" : bulanIni,     sub: "Lansia terdaftar baru",   accent: "#d97706", bg: "#fef3c7" },
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
                <p style={{ fontSize: 15, fontWeight: 700, color: "#1f2d1f" }}>Daftar Lansia</p>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ position: "relative" }}>
                  <Search size={14} color="#9aab9a" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  <input className="search-inp" placeholder="Cari nama atau NIK…" value={searchLansia} onChange={e => setSearchLansia(e.target.value)} />
                </div>
                <button className="btn-tambah" onClick={() => { setEditData(null); setShowModal(true); }}>
                  <Plus size={15} /> Tambah Lansia
                </button>
              </div>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#f8fbf9" }}>
                    {[
                      { label: "No",            field: null },
                      { label: "NIK",           field: "nik" },
                      { label: "Nama Lansia",   field: "nama" },
                      { label: "Tgl Lahir",     field: "tglLahir" },
                      { label: "Usia",          field: null },
                      { label: "No Telp",       field: "noTelp" },
                      { label: "Alamat",        field: "alamat" },
                      { label: "Jenis Kelamin", field: "jenisKelamin" },
                      { label: "Aksi",          field: null },
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
                  {loadingLansia && (
                    <tr><td colSpan={9} style={{ padding: "44px", textAlign: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, color: "#9aab9a" }}>
                        <div style={{ width: 18, height: 18, border: "2.5px solid #e4ede6", borderTopColor: "#2d7a4f", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                        Memuat data…
                      </div>
                    </td></tr>
                  )}
                  {!loadingLansia && filtered.length === 0 && (
                    <tr><td colSpan={9} style={{ padding: "52px", textAlign: "center" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                        <div style={{ background: "#f3f0ff", borderRadius: "50%", padding: 18 }}><Users size={30} color="#c4b5fd" /></div>
                        <p style={{ color: "#9aab9a", fontSize: 14, fontWeight: 500 }}>{searchLansia ? "Tidak ada data yang cocok" : "Belum ada data lansia"}</p>
                        {!searchLansia && <button className="btn-tambah" onClick={() => { setEditData(null); setShowModal(true); }}><Plus size={14} /> Tambah Lansia Pertama</button>}
                      </div>
                    </td></tr>
                  )}
                  {!loadingLansia && filtered.map((lansia, i) => (
                    <tr key={lansia.id} className="tr-row">
                      <td style={{ padding: "12px 14px", color: "#9aab9a", fontSize: 12 }}>{i + 1}</td>
                      <td style={{ padding: "12px 14px", fontFamily: "monospace", fontSize: 12, color: "#6b7c6b" }}>{lansia.nik}</td>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#f3f0ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#2d7a4f", flexShrink: 0 }}>
                            {lansia.nama?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 600, color: "#1f2d1f" }}>{lansia.nama}</span>
                        </div>
                      </td>
                      <td style={{ padding: "12px 14px", color: "#6b7c6b", whiteSpace: "nowrap" }}>{formatDate(lansia.tglLahir)}</td>
                      <td style={{ padding: "12px 14px", color: "#6b7c6b" }}>{hitungUsia(lansia.tglLahir)}</td>
                      <td style={{ padding: "12px 14px", color: "#6b7c6b" }}>{lansia.noTelp || "-"}</td>
                      <td style={{ padding: "12px 14px", color: "#6b7c6b", maxWidth: 160 }}>
                        <span style={{ display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{lansia.alamat || "-"}</span>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        {lansia.jenisKelamin === "Laki-laki"
                          ? <span className="badge-laki">♂ Laki-laki</span>
                          : lansia.jenisKelamin === "Perempuan"
                          ? <span className="badge-perempuan">♀ Perempuan</span>
                          : <span className="badge-null">-</span>
                        }
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="btn-edit"  onClick={() => { setEditData(lansia); setShowModal(true); }}><Pencil size={12} /> Edit</button>
                          <button className="btn-hapus" onClick={() => setDeleteTarget(lansia)}><Trash2 size={12} /> Hapus</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {!loadingLansia && filtered.length > 0 && (
              <div style={{ padding: "11px 20px", borderTop: "1px solid #f0f6f2" }}>
                <p style={{ color: "#9aab9a", fontSize: 12 }}>Menampilkan {filtered.length} dari {lansiaList.length} data lansia</p>
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
              <p className="section-title">Data Pemeriksaan Lansia</p>
              <p className="section-sub">Catat hasil pemeriksaan kesehatan setiap kunjungan posyandu lansia</p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ position: "relative" }}>
                <Search size={14} color="#9aab9a" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <input className="search-inp" placeholder="Cari nama atau kegiatan…" value={searchPem} onChange={e => setSearchPem(e.target.value)} />
              </div>
              <button className="btn-primary" onClick={() => { setEditPem(null); setShowPemForm(true); }}>
                <Plus size={15} /> Input Pemeriksaan
              </button>
            </div>
          </div>

          <div className="card" style={{ overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#f8fbf9" }}>
                    {[
                      "No", "Nama Lansia", "Kegiatan", "Tanggal",
                      "BB (kg)", "TB (cm)", "Lk. Perut (cm)",
                      "Tensi (mmHg)", "Status Tensi",
                      "Gula Darah (mg/dL)", "Status Gula",
                      "Aksi"
                    ].map(h => (
                      <th key={h} style={{ padding: "11px 14px", textAlign: "left", borderBottom: "1px solid #e4ede6", fontSize: 11, fontWeight: 700, color: "#9aab9a", whiteSpace: "nowrap", letterSpacing: 0.3 }}>
                        {h.toUpperCase()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loadingPem && (
                    <tr><td colSpan={12} style={{ padding: "44px", textAlign: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, color: "#9aab9a" }}>
                        <div style={{ width: 18, height: 18, border: "2.5px solid #e4ede6", borderTopColor: "#2d7a4f", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                        Memuat data…
                      </div>
                    </td></tr>
                  )}
                  {!loadingPem && filteredPem.length === 0 && (
                    <tr><td colSpan={12} style={{ padding: "36px", textAlign: "center", color: "#9aab9a" }}>Belum ada data pemeriksaan.</td></tr>
                  )}
                  {!loadingPem && filteredPem.map((p, i) => {
                    const tensiSt = p.tensi     ? getStatusTensi(parseFloat(p.tensi))     : null;
                    const gulaSt  = p.gulaDarah ? getStatusGula(parseFloat(p.gulaDarah))  : null;
                    return (
                      <tr key={p.id} className="tr-row">
                        <td style={{ padding: "12px 14px", color: "#9aab9a", fontSize: 12 }}>{i + 1}</td>

                        {/* Nama Lansia */}
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#f3f0ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#7c3aed", flexShrink: 0 }}>
                              {p.lansia?.nama?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() ?? "?"}
                            </div>
                            <span style={{ fontWeight: 600, color: "#1f2d1f" }}>{p.lansia?.nama ?? "-"}</span>
                          </div>
                        </td>

                        {/* Kegiatan */}
                        <td style={{ padding: "12px 14px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#fdf0ff", color: "#7c3aed", padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
                            <Activity size={11} /> {p.kegiatan}
                          </span>
                        </td>

                        {/* Tanggal */}
                        <td style={{ padding: "12px 14px", color: "#6b7c6b", whiteSpace: "nowrap", fontSize: 12 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <Calendar size={11} color="#b5ceba" /> {formatDisplay(p.tanggal)}
                          </div>
                        </td>

                        {/* BB */}
                        <td style={{ padding: "12px 14px", fontWeight: 700, color: "#1f2d1f" }}>
                          {p.bb ? <>{p.bb}<span style={{ fontSize: 11, fontWeight: 400, color: "#9aab9a" }}> kg</span></> : <span style={{ color: "#d1dbd2" }}>—</span>}
                        </td>

                        {/* TB */}
                        <td style={{ padding: "12px 14px", fontWeight: 700, color: "#1f2d1f" }}>
                          {p.tb ? <>{p.tb}<span style={{ fontSize: 11, fontWeight: 400, color: "#9aab9a" }}> cm</span></> : <span style={{ color: "#d1dbd2" }}>—</span>}
                        </td>

                        {/* Lingkar Perut */}
                        <td style={{ padding: "12px 14px", color: "#6b7c6b" }}>
                          {p.lingkarPerut ? <>{p.lingkarPerut}<span style={{ fontSize: 11, color: "#9aab9a" }}> cm</span></> : <span style={{ color: "#d1dbd2" }}>—</span>}
                        </td>

                        {/* Tensi (nilai) */}
                        <td style={{ padding: "12px 14px" }}>
                          <span style={{ fontSize: 14, fontWeight: 800, color: tensiSt?.color ?? "#1f2d1f" }}>
                            {p.tensi ? <>{p.tensi}<span style={{ fontSize: 11, fontWeight: 400, color: "#9aab9a" }}> mmHg</span></> : <span style={{ color: "#d1dbd2", fontWeight: 400 }}>—</span>}
                          </span>
                        </td>

                        {/* Status Tensi */}
                        <td style={{ padding: "12px 14px" }}>
                          <BadgeTensi tensiSt={tensiSt} />
                        </td>

                        {/* Gula Darah (nilai) */}
                        <td style={{ padding: "12px 14px" }}>
                          <span style={{ fontSize: 14, fontWeight: 800, color: gulaSt?.color ?? "#1f2d1f" }}>
                            {p.gulaDarah ? <>{p.gulaDarah}<span style={{ fontSize: 11, fontWeight: 400, color: "#9aab9a" }}> mg/dL</span></> : <span style={{ color: "#d1dbd2", fontWeight: 400 }}>—</span>}
                          </span>
                        </td>

                        {/* Status Gula */}
                        <td style={{ padding: "12px 14px" }}>
                          <BadgeGula gulaSt={gulaSt} />
                        </td>

                        {/* Aksi */}
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button className="btn-detail" onClick={() => setDetailData(p)}><Info size={12} /> Detail</button>
                            <button className="btn-edit"   onClick={() => { setEditPem(p); setShowPemForm(true); }}><Pencil size={12} /> Edit</button>
                            <button className="btn-hapus"  onClick={() => setDeletePemTarget(p)}><Trash2 size={12} /> Hapus</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer tabel */}
            {!loadingPem && filteredPem.length > 0 && (
              <div style={{ padding: "11px 20px", borderTop: "1px solid #f0f6f2", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                <p style={{ color: "#9aab9a", fontSize: 12 }}>
                  Menampilkan {filteredPem.length} dari {pemList.length} data pemeriksaan
                </p>
                {/* Legenda badge */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "#9aab9a", fontWeight: 600 }}>Keterangan:</span>
                  <span className="badge-normal">🟢 Normal</span>
                  <span className="badge-prehiper">🟡 Waspada</span>
                  <span className="badge-tinggi">🔴 Tinggi / Diabetes</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      {showModal && (
        <LansiaFormModal
          editData={editData}
          onClose={() => { setShowModal(false); setEditData(null); }}
          onSubmit={editData ? handleUpdate : handleCreate}
        />
      )}
      {deleteTarget && (
        <DeleteConfirmModal
          lansia={deleteTarget}
          loading={deleting}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
      {showPemForm && (
        <PemeriksaanFormModal
          lansiaList={lansiaList}
          editData={editPem}
          saving={savingPem}
          onClose={() => { setShowPemForm(false); setEditPem(null); }}
          onSubmit={handlePemSubmit}
        />
      )}
      {deletePemTarget && (
        <DeleteConfirmModal
          lansia={deletePemTarget}
          loading={deletingPem}
          onClose={() => setDeletePemTarget(null)}
          onConfirm={handleDeletePem}
        />
      )}
      {detailData && (
        <DetailModal
          data={detailData}
          onClose={() => setDetailData(null)}
        />
      )}
    </div>
  );
}