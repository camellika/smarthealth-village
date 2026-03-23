"use client";

import { useState, useEffect } from "react";
import { getBalita, createBalita, updateBalita, deleteBalita } from "@/services/balitaService";
import {
  getPosyanduBalita,
  createPosyanduBalita,
} from "@/services/posyanduBalitaService";
import {
  Baby, Plus, Search, ChevronDown, ChevronUp,
  AlertTriangle, Calendar, X, CreditCard, User,
  Phone, MapPin, Save, Pencil, Trash2, Scale, Ruler
} from "lucide-react";
import { getJadwalTerdekat } from "@/services/penjadwalanService";

/* ── helpers ── */
const INIT_FORM = { nik: "", nama: "", namaIbu: "", alamat: "", noTelp: "", tglLahir: "" };
const PEMERIKSAAN_INIT = { balitaId: "", kegiatan: "", bb: "", tb: "", lingkarKepala: "", catatan: "" };
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
  const bulan = Math.floor(diff / (1000 * 60 * 60 * 24 * 30.44));
  if (bulan < 12) return `${bulan} bln`;
  return `${Math.floor(bulan / 12)} th ${bulan % 12} bln`;
};

/* ══════════════════════════════════════════
   MODAL FORM BALITA — Tambah & Edit
══════════════════════════════════════════ */
function BalitaFormModal({ onClose, onSubmit, editData }) {
  const isEdit = !!editData;
  const [form, setForm]         = useState(isEdit ? { ...editData, tglLahir: toInputDate(editData.tglLahir) } : INIT_FORM);
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
    if (!form.nik.trim())                   e.nik      = "NIK wajib diisi";
    else if (form.nik.trim().length !== 16) e.nik      = "NIK harus 16 digit";
    if (!form.nama.trim())                  e.nama     = "Nama balita wajib diisi";
    if (!form.namaIbu.trim())               e.namaIbu  = "Nama ibu wajib diisi";
    if (!form.alamat.trim())                e.alamat   = "Alamat wajib diisi";
    if (!form.tglLahir)                     e.tglLahir = "Tanggal lahir wajib diisi";
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await onSubmit(form);
    } catch (err) {
      setApiError(err?.message || "Terjadi kesalahan, coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  const fields = [
    { name: "nik",      label: "NIK",           type: "text",     icon: CreditCard, placeholder: "16 digit NIK balita",      span: 2, hint: "Nomor Induk Kependudukan 16 digit", required: true  },
    { name: "nama",     label: "Nama Balita",    type: "text",     icon: Baby,       placeholder: "Nama lengkap balita",       span: 1, required: true  },
    { name: "namaIbu",  label: "Nama Ibu",       type: "text",     icon: User,       placeholder: "Nama lengkap ibu",          span: 1, required: true  },
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
        <style>{`
          @keyframes popIn    { from{opacity:0;transform:translate(-50%,-50%) scale(0.92)} to{opacity:1;transform:translate(-50%,-50%) scale(1)} }
          @keyframes spinAnim { to{transform:rotate(360deg)} }
        `}</style>
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
function PemeriksaanFormModal({ balitaList, onClose, onSubmit, saving }) {
  const [pemForm, setPemForm]       = useState(PEMERIKSAAN_INIT);
  const [pemErr, setPemErr]         = useState({});
  const [jadwalList, setJadwalList] = useState([]);

  useEffect(() => {
    getJadwalTerdekat().then(setJadwalList);
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setPemForm(p => ({ ...p, [name]: value }));
    if (pemErr[name]) setPemErr(p => ({ ...p, [name]: "" }));
  }

  function validate() {
    const e = {};
    if (!pemForm.balitaId) e.balitaId = "Pilih balita";
    if (!pemForm.kegiatan) e.kegiatan = "Pilih kegiatan";
    if (!pemForm.bb)       e.bb       = "Berat badan wajib diisi";
    if (!pemForm.tb)       e.tb       = "Tinggi badan wajib diisi";
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

            {/* Pilih Kegiatan */}
            <div style={{ gridColumn: "1/-1" }}>
              <label className="label">Nama Kegiatan <span style={{ color: "#dc2626" }}>*</span></label>
              <select name="kegiatan" value={pemForm.kegiatan} onChange={handleChange}
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

            {/* Pilih Balita */}
            <div style={{ gridColumn: "1/-1" }}>
              <label className="label">Nama Balita <span style={{ color: "#dc2626" }}>*</span></label>
              <select name="balitaId" value={pemForm.balitaId} onChange={handleChange}
                style={{ width: "100%", border: `1.5px solid ${pemErr.balitaId ? "#dc2626" : "#e4ede6"}`, borderRadius: 10, padding: "10px 12px", fontSize: 14, fontFamily: "'Plus Jakarta Sans',sans-serif", color: pemForm.balitaId ? "#1f2d1f" : "#9aab9a", background: "#fff", outline: "none" }}>
                <option value="">-- Pilih balita --</option>
                {balitaList.map(b => <option key={b.id} value={b.id}>{b.nama} ({hitungUsia(b.tglLahir)})</option>)}
              </select>
              {pemErr.balitaId && <p style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>⚠ {pemErr.balitaId}</p>}
            </div>

            {/* BB */}
            <div>
              <label className="label">Berat Badan (kg) <span style={{ color: "#dc2626" }}>*</span></label>
              <div style={{ position: "relative" }}>
                <Scale size={14} color="#9aab9a" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <input type="number" step="0.1" min="0" name="bb" value={pemForm.bb} onChange={handleChange} placeholder="cth: 10.5" className={`input-field${pemErr.bb ? " error" : ""}`} />
              </div>
              {pemErr.bb && <p style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>⚠ {pemErr.bb}</p>}
            </div>

            {/* TB */}
            <div>
              <label className="label">Tinggi Badan (cm) <span style={{ color: "#dc2626" }}>*</span></label>
              <div style={{ position: "relative" }}>
                <Ruler size={14} color="#9aab9a" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <input type="number" step="0.1" min="0" name="tb" value={pemForm.tb} onChange={handleChange} placeholder="cth: 82" className={`input-field${pemErr.tb ? " error" : ""}`} />
              </div>
              {pemErr.tb && <p style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>⚠ {pemErr.tb}</p>}
            </div>

            {/* Lingkar Kepala */}
            <div style={{ gridColumn: "1/-1" }}>
              <label className="label">Lingkar Kepala (cm) <span style={{ color: "#9aab9a", fontWeight: 400 }}>opsional</span></label>
              <input type="number" step="0.1" min="0" name="lingkarKepala" value={pemForm.lingkarKepala} onChange={handleChange} placeholder="cth: 44" className="input-bare" />
            </div>

            {/* Catatan */}
            <div style={{ gridColumn: "1/-1" }}>
              <label className="label">Catatan <span style={{ color: "#9aab9a", fontWeight: 400 }}>opsional</span></label>
              <textarea name="catatan" value={pemForm.catatan} onChange={handleChange} placeholder="Catatan kondisi balita…" className="textarea-bare" />
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 24, paddingTop: 16, borderTop: "1px solid #f0f6f2" }}>
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
  const [tab, setTab] = useState("data"); // "data" | "pemeriksaan"

  /* ── state data balita ── */
  const [balitaList, setBalitaList]       = useState([]);
  const [loadingBalita, setLoadingBalita] = useState(true);
  const [showModal, setShowModal]         = useState(false);
  const [editData, setEditData]           = useState(null);
  const [deleteTarget, setDeleteTarget]   = useState(null);
  const [deleting, setDeleting]           = useState(false);
  const [searchBalita, setSearchBalita]   = useState("");
  const [sortField, setSortField]         = useState("nama");
  const [sortAsc, setSortAsc]             = useState(true);
  const [toast, setToast]                 = useState(null);

  /* ── state pemeriksaan ── */
  const [showPemForm, setShowPemForm]   = useState(false);
  const [savingPem, setSavingPem]       = useState(false);
  const [searchPem, setSearchPem]       = useState("");
  const [pemHistory, setPemHistory]     = useState([]);
  const [loadingPem, setLoadingPem]     = useState(true);

  useEffect(() => { loadBalita(); }, []);

  /* load pemeriksaan saat tab aktif */
  useEffect(() => {
    if (tab === "pemeriksaan") loadPemeriksaan();
  }, [tab]);

  async function loadBalita() {
    setLoadingBalita(true);
    try {
      const data = await getBalita();
      setBalitaList(data);
    } catch {
      showToast("Gagal memuat data balita", "error");
    } finally {
      setLoadingBalita(false);
    }
  }

  async function loadPemeriksaan() {
    setLoadingPem(true);
    try {
      const data = await getPosyanduBalita();
      setPemHistory(data);
    } catch {
      showToast("Gagal memuat data pemeriksaan", "error");
    } finally {
      setLoadingPem(false);
    }
  }

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  /* ── handlers balita ── */
  async function handleCreate(formData) {
    await createBalita(formData);
    await loadBalita();
    setShowModal(false);
    showToast("Data balita berhasil ditambahkan");
  }
  async function handleUpdate(formData) {
    await updateBalita(editData.id, formData);
    await loadBalita();
    setEditData(null); setShowModal(false);
    showToast("Data balita berhasil diperbarui");
  }
  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteBalita(deleteTarget.id);
      await loadBalita();
      setDeleteTarget(null);
      showToast("Data balita berhasil dihapus");
    } catch {
      showToast("Gagal menghapus data balita", "error");
    } finally { setDeleting(false); }
  }

  /* ── handlers pemeriksaan ── */
  async function handlePemSubmit(pemForm) {
    setSavingPem(true);
    try {
      await createPosyanduBalita(pemForm);
      await loadPemeriksaan();
      setShowPemForm(false);
      showToast("Pemeriksaan berhasil disimpan");
    } catch {
      showToast("Gagal menyimpan pemeriksaan", "error");
    } finally {
      setSavingPem(false);
    }
  }

  /* ── computed ── */
  const filtered = balitaList
    .filter(b =>
      b.nama?.toLowerCase().includes(searchBalita.toLowerCase()) ||
      b.nik?.includes(searchBalita) ||
      b.namaIbu?.toLowerCase().includes(searchBalita.toLowerCase())
    )
    .sort((a, b) => {
      const va = a[sortField] ?? "", vb = b[sortField] ?? "";
      if (typeof va === "string") return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
      return sortAsc ? va - vb : vb - va;
    });

  function toggleSort(field) {
    if (sortField === field) setSortAsc(s => !s);
    else { setSortField(field); setSortAsc(true); }
  }

  const totalBalita  = balitaList.length;
  const potensiStunt = Math.round(totalBalita * 0.083);
  const bulanIni     = balitaList.filter(b => {
    const d = new Date(b.tglLahir || b.createdAt);
    return d.getMonth() === new Date().getMonth() && d.getFullYear() === new Date().getFullYear();
  }).length;

  /* filter pemeriksaan: cocokan lewat relasi balita.nama */
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
      `}</style>

      {/* ── TOAST ── */}
      {toast && (
        <div style={{ position: "fixed", bottom: 28, right: 28, zIndex: 300, background: toast.type === "error" ? "#dc2626" : "#2d7a4f", color: "#fff", padding: "12px 20px", borderRadius: 12, fontSize: 14, fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.15)", animation: "toastIn 0.3s ease", display: "flex", alignItems: "center", gap: 8 }}>
          {toast.type === "error" ? "⚠" : "✓"} {toast.msg}
        </div>
      )}

      {/* ── TAB BAR ── */}
      <div style={{ display: "flex", gap: 6, background: "#fff", border: "1px solid #e4ede6", borderRadius: 14, padding: 5, width: "fit-content", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        {[
          { id: "data",        label: "Data Balita",      icon: Baby  },
          { id: "pemeriksaan", label: "Input Pemeriksaan", icon: Scale },
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

      {/* ══════════ TAB DATA BALITA ══════════ */}
      {tab === "data" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

          {/* Stat cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
            {[
              { icon: Baby,          label: "Total Balita",     value: loadingBalita ? "–" : totalBalita,  sub: "Terdaftar aktif",        accent: "#2d7a4f", bg: "#e8f5ed" },
              { icon: AlertTriangle, label: "Potensi Stunting", value: loadingBalita ? "–" : potensiStunt, sub: "Perlu pemantauan lebih", accent: "#be185d", bg: "#fce7f3" },
              { icon: Calendar,      label: "Baru Bulan Ini",   value: loadingBalita ? "–" : bulanIni,     sub: "Balita terdaftar baru",  accent: "#d97706", bg: "#fef3c7" },
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

          {/* Table card */}
          <div style={{ background: "#fff", border: "1px solid #e4ede6", borderRadius: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #f0f6f2", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#1f2d1f" }}>Daftar Balita</p>
                <p style={{ fontSize: 12, color: "#9aab9a", marginTop: 2 }}>{filtered.length} data ditemukan</p>
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
                      { label: "No",          field: null },
                      { label: "NIK",         field: "nik" },
                      { label: "Nama Balita", field: "nama" },
                      { label: "Nama Ibu",    field: "namaIbu" },
                      { label: "Tgl Lahir",   field: "tglLahir" },
                      { label: "No Telp",     field: "noTelp" },
                      { label: "Alamat",      field: "alamat" },
                      { label: "Aksi",        field: null },
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
                    <tr><td colSpan={8} style={{ padding: "44px", textAlign: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, color: "#9aab9a" }}>
                        <div style={{ width: 18, height: 18, border: "2.5px solid #e4ede6", borderTopColor: "#2d7a4f", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                        Memuat data…
                      </div>
                    </td></tr>
                  )}
                  {!loadingBalita && filtered.length === 0 && (
                    <tr><td colSpan={8} style={{ padding: "52px", textAlign: "center" }}>
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

      {/* ══════════ TAB PEMERIKSAAN ══════════ */}
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
                    {["No","Kegiatan","Nama Balita","Tgl Pemeriksaan","BB (kg)","TB (cm)","Lk. Kepala (cm)","Catatan","Status"].map(h => (
                      <th key={h} style={{ padding: "11px 14px", textAlign: "left", borderBottom: "1px solid #e4ede6", fontSize: 12, fontWeight: 700, color: "#9aab9a", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loadingPem && (
                    <tr><td colSpan={9} style={{ padding: "44px", textAlign: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, color: "#9aab9a" }}>
                        <div style={{ width: 18, height: 18, border: "2.5px solid #e4ede6", borderTopColor: "#2d7a4f", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                        Memuat data…
                      </div>
                    </td></tr>
                  )}
                  {!loadingPem && filteredPem.length === 0 && (
                    <tr><td colSpan={9} style={{ padding: "36px", textAlign: "center", color: "#9aab9a" }}>Belum ada data pemeriksaan.</td></tr>
                  )}
                  {!loadingPem && filteredPem.map((p, i) => {
                    const statusBB = (p.bb ?? 0) < 10 ? "kurang" : "normal";
                    return (
                      <tr key={p.id} className="tr-row">
                        <td style={{ padding: "12px 14px", color: "#9aab9a" }}>{i + 1}</td>
                        <td style={{ padding: "12px 14px", color: "#6b7c6b" }}>{p.kegiatan || "-"}</td>
                        <td style={{ padding: "12px 14px", fontWeight: 600, color: "#1f2d1f" }}>{p.balita?.nama ?? "-"}</td>
                        <td style={{ padding: "12px 14px", color: "#6b7c6b" }}>{formatDisplay(p.tanggal)}</td>
                        <td style={{ padding: "12px 14px", fontWeight: 700, color: statusBB === "kurang" ? "#d97706" : "#2d7a4f" }}>{p.bb ?? "-"}</td>
                        <td style={{ padding: "12px 14px", color: "#1f2d1f", fontWeight: 600 }}>{p.tb ?? "-"}</td>
                        <td style={{ padding: "12px 14px", color: "#6b7c6b" }}>{p.lingkarKepala ?? "-"}</td>
                        <td style={{ padding: "12px 14px", color: "#6b7c6b" }}>{p.catatan || "-"}</td>
                        <td style={{ padding: "12px 14px" }}>
                          <span className={statusBB === "kurang" ? "badge-yellow" : "badge-green"}>
                            {statusBB === "kurang" ? "BB Kurang" : "Normal"}
                          </span>
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

      {/* ── Modals ── */}
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
    </div>
  );
}