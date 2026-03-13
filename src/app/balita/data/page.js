"use client";

import { useState, useEffect } from "react";
import { getBalita, createBalita, updateBalita, deleteBalita } from "@/services/balitaService";
import {
  Baby, Plus, Search, ChevronDown, ChevronUp,
  AlertTriangle, Calendar, X, CreditCard, User,
  Phone, MapPin, Save, Pencil, Trash2
} from "lucide-react";

/* ══════════════════════════════════════════
   HELPER FUNCTIONS
══════════════════════════════════════════ */
const INIT_FORM = { nik: "", nama: "", namaIbu: "", alamat: "", noTelp: "", tglLahir: "" };

const formatDate = (d) => {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
};

const toInputDate = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  const mm  = String(dt.getMonth() + 1).padStart(2, "0");
  const dd  = String(dt.getDate()).padStart(2, "0");
  return `${dt.getFullYear()}-${mm}-${dd}`;
};

/* ══════════════════════════════════════════
   MODAL FORM — Tambah & Edit
══════════════════════════════════════════ */
function BalitaFormModal({ onClose, onSubmit, editData }) {
  const isEdit = !!editData;

  const [form, setForm]       = useState(
    isEdit ? { ...editData, tglLahir: toInputDate(editData.tglLahir) } : INIT_FORM
  );
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name])  setErrors(p  => ({ ...p,  [name]: "" }));
    if (apiError)      setApiError("");
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
    { name: "nik",      label: "NIK",            type: "text",     icon: CreditCard, placeholder: "16 digit NIK balita",      span: 2, hint: "Nomor Induk Kependudukan 16 digit", required: true  },
    { name: "nama",     label: "Nama Balita",     type: "text",     icon: Baby,       placeholder: "Nama lengkap balita",       span: 1, required: true  },
    { name: "namaIbu",  label: "Nama Ibu",        type: "text",     icon: User,       placeholder: "Nama lengkap ibu",          span: 1, required: true  },
    { name: "noTelp",   label: "No. Telepon",     type: "text",     icon: Phone,      placeholder: "08xx-xxxx-xxxx (opsional)", span: 1, required: false },
    { name: "tglLahir", label: "Tanggal Lahir",   type: "date",     icon: Calendar,   placeholder: "",                          span: 1, required: true  },
    { name: "alamat",   label: "Alamat Lengkap",  type: "textarea", icon: MapPin,     placeholder: "RT/RW, Dusun, Desa…",      span: 2, required: true  },
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

        {/* Header */}
        <div style={{ padding: "20px 22px 16px", borderBottom: "1px solid #f0f6f2", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <div style={{ background: isEdit ? "#fef3c7" : "#e8f5ed", borderRadius: 11, padding: 10 }}>
              <Baby size={20} color={isEdit ? "#d97706" : "#2d7a4f"} />
            </div>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: "#1f2d1f" }}>
                {isEdit ? "Edit Data Balita" : "Tambah Data Balita"}
              </h2>
              <p style={{ fontSize: 12, color: "#9aab9a", marginTop: 2 }}>
                {isEdit ? `Mengubah data: ${editData.nama}` : "Lengkapi semua field yang diperlukan"}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "#f5f7f4", border: "1px solid #e4ede6", borderRadius: 9, padding: "6px 7px", cursor: "pointer", display: "flex" }}>
            <X size={16} color="#6b7c6b" />
          </button>
        </div>

        {/* Body */}
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
                    ? <textarea  name={name} value={form[name]} onChange={handleChange} placeholder={placeholder} className={`mta${errors[name] ? " err" : ""}`} />
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

        {/* Footer */}
        <div style={{ padding: "14px 22px", borderTop: "1px solid #f0f6f2", display: "flex", gap: 10, flexShrink: 0 }}>
          <button onClick={onClose} style={{ background: "#fff", color: "#6b7c6b", border: "1.5px solid #dde8de", padding: "11px 18px", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            Batal
          </button>
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
          <button onClick={onClose} style={{ flex: 1, padding: "11px", background: "#fff", border: "1.5px solid #dde8de", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif", color: "#6b7c6b" }}>
            Batal
          </button>
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
   HALAMAN UTAMA
══════════════════════════════════════════ */
export default function DataBalitaPage() {
  const [balitaList, setBalitaList]     = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showModal, setShowModal]       = useState(false);
  const [editData, setEditData]         = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]         = useState(false);
  const [search, setSearch]             = useState("");
  const [sortField, setSortField]       = useState("nama");
  const [sortAsc, setSortAsc]           = useState(true);
  const [toast, setToast]               = useState(null);

  useEffect(() => { loadBalita(); }, []);

  async function loadBalita() {
    setLoading(true);
    try {
      const data = await getBalita();
      setBalitaList(data);
    } catch {
      showToast("Gagal memuat data balita", "error");
    } finally {
      setLoading(false);
    }
  }

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleCreate(formData) {
    await createBalita(formData);
    await loadBalita();
    setShowModal(false);
    showToast("Data balita berhasil ditambahkan");
  }

  async function handleUpdate(formData) {
    await updateBalita(editData.id, formData);
    await loadBalita();
    setEditData(null);
    setShowModal(false);
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
    } finally {
      setDeleting(false);
    }
  }

  const filtered = balitaList
    .filter(b =>
      b.nama?.toLowerCase().includes(search.toLowerCase()) ||
      b.nik?.includes(search) ||
      b.namaIbu?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const va = a[sortField] ?? "";
      const vb = b[sortField] ?? "";
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, fontFamily: "'Plus Jakarta Sans',sans-serif", color: "#1f2d1f" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes toastIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }

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
      `}</style>

      {/* ── TOAST ── */}
      {toast && (
        <div style={{ position: "fixed", bottom: 28, right: 28, zIndex: 300, background: toast.type === "error" ? "#dc2626" : "#2d7a4f", color: "#fff", padding: "12px 20px", borderRadius: 12, fontSize: 14, fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.15)", animation: "toastIn 0.3s ease", display: "flex", alignItems: "center", gap: 8 }}>
          {toast.type === "error" ? "⚠" : "✓"} {toast.msg}
        </div>
      )}

      {/* ── STAT CARDS ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
        {[
          { icon: Baby,          label: "Total Balita",     value: loading ? "–" : totalBalita,  sub: "Terdaftar aktif",        accent: "#2d7a4f", bg: "#e8f5ed" },
          { icon: AlertTriangle, label: "Potensi Stunting", value: loading ? "–" : potensiStunt, sub: "Perlu pemantauan lebih", accent: "#be185d", bg: "#fce7f3" },
          { icon: Calendar,      label: "Baru Bulan Ini",   value: loading ? "–" : bulanIni,     sub: "Balita terdaftar baru",  accent: "#d97706", bg: "#fef3c7" },
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

      {/* ── TABLE CARD ── */}
      <div style={{ background: "#fff", border: "1px solid #e4ede6", borderRadius: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", overflow: "hidden" }}>

        {/* Header bar */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #f0f6f2", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#1f2d1f" }}>Daftar Balita</p>
            <p style={{ fontSize: 12, color: "#9aab9a", marginTop: 2 }}>{filtered.length} data ditemukan</p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ position: "relative" }}>
              <Search size={14} color="#9aab9a" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              <input className="search-inp" placeholder="Cari nama, NIK, nama ibu…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <button className="btn-tambah" onClick={() => { setEditData(null); setShowModal(true); }}>
              <Plus size={15} /> Tambah Balita
            </button>
          </div>
        </div>

        {/* Table */}
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
                      ? <button className="th-btn" onClick={() => toggleSort(field)}>
                          {label}
                          {sortField === field
                            ? (sortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} />)
                            : <ChevronDown size={12} color="#dde8de" />}
                        </button>
                      : <span style={{ fontSize: 12, fontWeight: 700, color: "#9aab9a" }}>{label}</span>
                    }
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan={8} style={{ padding: "44px", textAlign: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, color: "#9aab9a" }}>
                      <div style={{ width: 18, height: 18, border: "2.5px solid #e4ede6", borderTopColor: "#2d7a4f", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                      Memuat data…
                    </div>
                  </td>
                </tr>
              )}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: "52px", textAlign: "center" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                      <div style={{ background: "#e8f5ed", borderRadius: "50%", padding: 18 }}>
                        <Baby size={30} color="#b5ceba" />
                      </div>
                      <p style={{ color: "#9aab9a", fontSize: 14, fontWeight: 500 }}>
                        {search ? "Tidak ada data yang cocok dengan pencarian" : "Belum ada data balita"}
                      </p>
                      {!search && (
                        <button className="btn-tambah" onClick={() => { setEditData(null); setShowModal(true); }}>
                          <Plus size={14} /> Tambah Balita Pertama
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}

              {!loading && filtered.map((balita, i) => (
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
                    <span style={{ display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {balita.alamat || "-"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn-edit" onClick={() => { setEditData(balita); setShowModal(true); }}>
                        <Pencil size={12} /> Edit
                      </button>
                      <button className="btn-hapus" onClick={() => setDeleteTarget(balita)}>
                        <Trash2 size={12} /> Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length > 0 && (
          <div style={{ padding: "11px 20px", borderTop: "1px solid #f0f6f2" }}>
            <p style={{ color: "#9aab9a", fontSize: 12 }}>Menampilkan {filtered.length} dari {balitaList.length} data balita</p>
          </div>
        )}
      </div>

      {/* Modal Tambah / Edit */}
      {showModal && (
        <BalitaFormModal
          editData={editData}
          onClose={() => { setShowModal(false); setEditData(null); }}
          onSubmit={editData ? handleUpdate : handleCreate}
        />
      )}

      {/* Modal Konfirmasi Hapus */}
      {deleteTarget && (
        <DeleteConfirmModal
          balita={deleteTarget}
          loading={deleting}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}