"use client";

import { useState } from "react";
import { X, Baby, User, Phone, MapPin, Calendar, CreditCard, Loader2 } from "lucide-react";

const INITIAL_FORM = {
  nik: "",
  nama: "",
  namaIbu: "",
  alamat: "",
  noTelp: "",
  tglLahir: "",
};

export default function BalitaFormModal({ onClose, onSubmit }) {
  const [form, setForm]       = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  }

  function validate() {
    const errs = {};
    if (!form.nik.trim())      errs.nik      = "NIK wajib diisi";
    if (form.nik.length !== 16 && form.nik.trim()) errs.nik = "NIK harus 16 digit";
    if (!form.nama.trim())     errs.nama     = "Nama balita wajib diisi";
    if (!form.namaIbu.trim())  errs.namaIbu  = "Nama ibu wajib diisi";
    if (!form.alamat.trim())   errs.alamat   = "Alamat wajib diisi";
    if (!form.tglLahir)        errs.tglLahir = "Tanggal lahir wajib diisi";
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    try {
      await onSubmit(form);
    } finally {
      setLoading(false);
    }
  }

  /* ── field helpers ── */
  const fields = [
    {
      name: "nik", label: "NIK", type: "text", icon: CreditCard,
      placeholder: "16 digit NIK balita", colSpan: 1,
      hint: "Nomor Induk Kependudukan 16 digit",
    },
    {
      name: "nama", label: "Nama Balita", type: "text", icon: Baby,
      placeholder: "Nama lengkap balita", colSpan: 1,
    },
    {
      name: "namaIbu", label: "Nama Ibu", type: "text", icon: User,
      placeholder: "Nama lengkap ibu", colSpan: 1,
    },
    {
      name: "noTelp", label: "No. Telepon", type: "text", icon: Phone,
      placeholder: "08xx-xxxx-xxxx (opsional)", colSpan: 1,
    },
    {
      name: "tglLahir", label: "Tanggal Lahir", type: "date", icon: Calendar,
      placeholder: "", colSpan: 1,
    },
    {
      name: "alamat", label: "Alamat Lengkap", type: "textarea", icon: MapPin,
      placeholder: "RT/RW, Dusun, Desa…", colSpan: 2,
    },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(15,30,15,0.35)",
          backdropFilter: "blur(4px)", zIndex: 200,
          animation: "fade-in 0.2s ease",
        }}
      />

      {/* Modal panel */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0,
        width: "min(520px, 100vw)",
        background: "#fff",
        boxShadow: "-8px 0 40px rgba(0,0,0,0.12)",
        zIndex: 201,
        display: "flex", flexDirection: "column",
        animation: "slide-from-right 0.3s cubic-bezier(0.16,1,0.3,1)",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
          @keyframes fade-in        { from{opacity:0} to{opacity:1} }
          @keyframes slide-from-right { from{transform:translateX(100%)} to{transform:translateX(0)} }
          @keyframes spin           { to{transform:rotate(360deg)} }

          .modal-input {
            width: 100%;
            border: 1.5px solid #e4ede6;
            border-radius: 10px;
            padding: 10px 12px 10px 40px;
            font-size: 14px;
            font-family: 'Plus Jakarta Sans', sans-serif;
            color: #1f2d1f;
            background: #fff;
            outline: none;
            transition: border-color 0.2s, box-shadow 0.2s;
          }
          .modal-input:focus {
            border-color: #2d7a4f;
            box-shadow: 0 0 0 3px rgba(45,122,79,0.1);
          }
          .modal-input::placeholder { color: #b5ceba; }
          .modal-input.error { border-color: #dc2626; box-shadow: 0 0 0 3px rgba(220,38,38,0.08); }
          .modal-textarea {
            width: 100%;
            border: 1.5px solid #e4ede6;
            border-radius: 10px;
            padding: 10px 12px 10px 40px;
            font-size: 14px;
            font-family: 'Plus Jakarta Sans', sans-serif;
            color: #1f2d1f;
            background: #fff;
            outline: none;
            resize: vertical;
            min-height: 80px;
            transition: border-color 0.2s, box-shadow 0.2s;
          }
          .modal-textarea:focus {
            border-color: #2d7a4f;
            box-shadow: 0 0 0 3px rgba(45,122,79,0.1);
          }
          .modal-textarea::placeholder { color: #b5ceba; }
          .modal-textarea.error { border-color: #dc2626; }

          .btn-submit {
            display: flex; align-items: center; justify-content: center; gap: 8px;
            background: #2d7a4f; color: white; border: none;
            padding: 13px 24px; border-radius: 12px;
            font-size: 15px; font-weight: 700; cursor: pointer;
            font-family: 'Plus Jakarta Sans', sans-serif;
            transition: all 0.22s;
            box-shadow: 0 4px 14px rgba(45,122,79,0.3);
            flex: 1;
          }
          .btn-submit:hover:not(:disabled) { background: #246240; transform: translateY(-1px); }
          .btn-submit:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }
          .btn-cancel {
            display: flex; align-items: center; justify-content: center;
            background: #fff; color: #6b7c6b;
            border: 1.5px solid #dde8de; padding: 13px 20px;
            border-radius: 12px; font-size: 15px; font-weight: 600;
            cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
            transition: all 0.18s;
          }
          .btn-cancel:hover { background: #f5f7f4; border-color: #b5ceba; color: #1f2d1f; }
        `}</style>

        {/* Header */}
        <div style={{ padding: "22px 24px 18px", borderBottom: "1px solid #f0f6f2", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ background: "#e8f5ed", borderRadius: 12, padding: 10 }}>
              <Baby size={20} color="#2d7a4f" />
            </div>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: "#1f2d1f", letterSpacing: -0.3 }}>Tambah Data Balita</h2>
              <p style={{ fontSize: 12, color: "#9aab9a", marginTop: 2 }}>Lengkapi semua field yang diperlukan</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "#f5f7f4", border: "1px solid #e4ede6", borderRadius: 9, padding: "6px 7px", cursor: "pointer", display: "flex", transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.borderColor = "#fecaca"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#f5f7f4"; e.currentTarget.style.borderColor = "#e4ede6"; }}
          >
            <X size={16} color="#6b7c6b" />
          </button>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: "auto", padding: "22px 24px", display: "flex", flexDirection: "column", gap: 0 }}>

          {/* Info banner */}
          <div style={{ background: "#e8f5ed", border: "1px solid #b8ddc5", borderRadius: 12, padding: "12px 14px", marginBottom: 22, display: "flex", gap: 10 }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>📋</span>
            <p style={{ color: "#2d5c3a", fontSize: 13, lineHeight: 1.55 }}>
              Data yang dimasukkan akan langsung tersimpan ke sistem dan dapat digunakan untuk pemantauan kesehatan balita.
            </p>
          </div>

          {/* Grid fields */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px 16px" }}>
            {fields.map(({ name, label, type, icon: Icon, placeholder, colSpan, hint }) => (
              <div key={name} style={{ gridColumn: colSpan === 2 ? "1 / -1" : "auto" }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#3d5542", marginBottom: 7 }}>
                  {label}
                  {["nik","nama","namaIbu","alamat","tglLahir"].includes(name) && (
                    <span style={{ color: "#dc2626", marginLeft: 3 }}>*</span>
                  )}
                </label>
                <div style={{ position: "relative" }}>
                  <Icon size={15} color="#9aab9a" style={{ position: "absolute", left: 12, top: type === "textarea" ? 12 : "50%", transform: type === "textarea" ? "none" : "translateY(-50%)", pointerEvents: "none", flexShrink: 0 }} />
                  {type === "textarea" ? (
                    <textarea
                      name={name}
                      value={form[name]}
                      onChange={handleChange}
                      placeholder={placeholder}
                      className={`modal-textarea${errors[name] ? " error" : ""}`}
                    />
                  ) : (
                    <input
                      type={type}
                      name={name}
                      value={form[name]}
                      onChange={handleChange}
                      placeholder={placeholder}
                      className={`modal-input${errors[name] ? " error" : ""}`}
                      maxLength={name === "nik" ? 16 : undefined}
                    />
                  )}
                </div>
                {errors[name] && (
                  <p style={{ color: "#dc2626", fontSize: 11, marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                    ⚠ {errors[name]}
                  </p>
                )}
                {hint && !errors[name] && (
                  <p style={{ color: "#9aab9a", fontSize: 11, marginTop: 4 }}>{hint}</p>
                )}
              </div>
            ))}
          </div>

          {/* Required note */}
          <p style={{ color: "#b5ceba", fontSize: 11, marginTop: 16 }}>
            <span style={{ color: "#dc2626" }}>*</span> Field wajib diisi
          </p>
        </form>

        {/* Footer actions */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid #f0f6f2", display: "flex", gap: 10, flexShrink: 0 }}>
          <button type="button" className="btn-cancel" onClick={onClose}>Batal</button>
          <button
            type="submit"
            className="btn-submit"
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading ? (
              <>
                <div style={{ width: 16, height: 16, border: "2.5px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                Menyimpan…
              </>
            ) : (
              <>
                <Baby size={16} /> Simpan Data Balita
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}