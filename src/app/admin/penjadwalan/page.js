"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getPenjadwalan, createPenjadwalan,
  updatePenjadwalan, deletePenjadwalan, getJadwalTerdekat
} from "@/services/penjadwalanService";
import {
  CalendarDays, Plus, Pencil, Trash2, X, Save, MapPin, Calendar
} from "lucide-react";

/* ── helpers ── */
const formatDate = (d) => {
  if (!d) return "-";
  const dt = new Date(d);
  const mm  = String(dt.getMonth() + 1).padStart(2, "0");
  const dd  = String(dt.getDate()).padStart(2, "0");
  return `${dt.getFullYear()}-${mm}-${dd}`;
};
const formatDisplay = (d) => {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
};

const JADWAL_INIT = { kegiatan: "", tanggal: "", tempat: "" };

export default function PenjadwalanPage() {
  const [jadwal, setJadwal]           = useState([]);
  const [jadwalDekat, setJadwalDekat] = useState([]);
  const [showJadwalForm, setShowJadwalForm] = useState(false);
  const [editId, setEditId]           = useState(null);
  const [jadwalForm, setJadwalForm]   = useState(JADWAL_INIT);
  const [jadwalErr, setJadwalErr]     = useState({});
  const [savingJadwal, setSavingJadwal] = useState(false);



  useEffect(() => { 
    loadAll(); }, []);

  async function loadAll() {
    const [j, jd] = await Promise.all([getPenjadwalan(), getJadwalTerdekat()]);
    setJadwal(j);
    setJadwalDekat(jd);
  }

  function handleJadwalChange(e) {
    const { name, value } = e.target;
    setJadwalForm(p => ({ ...p, [name]: value }));
    if (jadwalErr[name]) setJadwalErr(p => ({ ...p, [name]: "" }));
  }

  function validateJadwal() {
    const e = {};
    if (!jadwalForm.kegiatan.trim()) e.kegiatan = "Nama kegiatan wajib diisi";
    if (!jadwalForm.tanggal)         e.tanggal  = "Tanggal wajib diisi";
    if (!jadwalForm.tempat.trim())   e.tempat   = "Tempat wajib diisi";
    return e;
  }

  async function handleJadwalSubmit(ev) {
    ev.preventDefault();
    const errs = validateJadwal();
    if (Object.keys(errs).length) { setJadwalErr(errs); return; }
    setSavingJadwal(true);
    try {
      if (editId) await updatePenjadwalan(editId, jadwalForm);
      else        await createPenjadwalan(jadwalForm);
      setJadwalForm(JADWAL_INIT); setEditId(null); setShowJadwalForm(false);
      await loadAll();
    } finally { setSavingJadwal(false); }
  }

  function handleEdit(item) {
    setEditId(item.id);
    setJadwalForm({ kegiatan: item.kegiatan, tanggal: formatDate(item.tanggal), tempat: item.tempat });
    setShowJadwalForm(true);
  }

  async function handleDelete(id) {
    if (!confirm("Yakin ingin menghapus jadwal ini?")) return;
    await deletePenjadwalan(id);
    await loadAll();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Header + tombol */}
      <div className="card" style={{ padding: "18px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <div>
          <p className="section-title">Penjadwalan Kegiatan Posyandu</p>
          <p className="section-sub">Kelola jadwal kegiatan dan kunjungan posyandu balita</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditId(null); setJadwalForm(JADWAL_INIT); setJadwalErr({}); setShowJadwalForm(true); }}>
          <Plus size={15} /> Tambah Jadwal
        </button>
      </div>

      {/* Jadwal Terdekat strip */}
      {jadwalDekat.length > 0 && (
        <div style={{ background: "#e8f5ed", border: "1px solid #b8ddc5", borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
          <CalendarDays size={20} color="#2d7a4f" style={{ flexShrink: 0 }} />
          <div>
            <p style={{ fontWeight: 700, fontSize: 13, color: "#1f5c35" }}>Jadwal Terdekat: {jadwalDekat[0]?.kegiatan}</p>
            <p style={{ fontSize: 12, color: "#4a7a5a" }}>{formatDisplay(jadwalDekat[0]?.tanggal)} · {jadwalDekat[0]?.tempat}</p>
          </div>
        </div>
      )}

      {/* Tabel jadwal */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f8fbf9" }}>
                {["No","Nama Kegiatan","Tanggal","Tempat","Aksi"].map(h => (
                  <th key={h} style={{ padding: "11px 14px", textAlign: "left", borderBottom: "1px solid #e4ede6", fontSize: 12, fontWeight: 700, color: "#9aab9a" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {jadwal.length === 0 && (
                <tr><td colSpan={5} style={{ padding: "36px", textAlign: "center", color: "#9aab9a" }}>Belum ada jadwal yang ditambahkan.</td></tr>
              )}
              {jadwal.map((item, i) => {
                const isPast = new Date(item.tanggal) < new Date();
                return (
                  <tr key={item.id} className="tr-row">
                    <td style={{ padding: "12px 14px", color: "#9aab9a" }}>{i + 1}</td>
                    <td style={{ padding: "12px 14px", fontWeight: 600, color: "#1f2d1f" }}>{item.kegiatan}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <span className={isPast ? "badge-yellow" : "badge-green"}>
                        {formatDisplay(item.tanggal)}
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px", color: "#6b7c6b" }}>{item.tempat}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn-outline" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => handleEdit(item)}>
                          <Pencil size={13} /> Edit
                        </button>
                        <button className="btn-danger" onClick={() => handleDelete(item.id)}>
                          <Trash2 size={13} /> Hapus
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

      {/* Form Modal Jadwal */}
      {showJadwalForm && (
        <FormModal title={editId ? "Edit Jadwal" : "Tambah Jadwal Posyandu"} icon={CalendarDays} onClose={() => { setShowJadwalForm(false); setEditId(null); setJadwalForm(JADWAL_INIT); setJadwalErr({}); }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            <div>
              <label className="label">Nama Kegiatan <span style={{ color: "#dc2626" }}>*</span></label>
              <input name="kegiatan" value={jadwalForm.kegiatan} onChange={handleJadwalChange} placeholder="cth: Posyandu Rutin Juni 2026" className={`input-bare${jadwalErr.kegiatan ? " error" : ""}`} />
              {jadwalErr.kegiatan && <p style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>⚠ {jadwalErr.kegiatan}</p>}
            </div>

            <div>
              <label className="label">Tanggal Kegiatan <span style={{ color: "#dc2626" }}>*</span></label>
              <div style={{ position: "relative" }}>
                <Calendar size={14} color="#9aab9a" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <input type="date" name="tanggal" value={jadwalForm.tanggal} onChange={handleJadwalChange} className={`input-field${jadwalErr.tanggal ? " error" : ""}`} />
              </div>
              {jadwalErr.tanggal && <p style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>⚠ {jadwalErr.tanggal}</p>}
            </div>

            <div>
              <label className="label">Tempat <span style={{ color: "#dc2626" }}>*</span></label>
              <div style={{ position: "relative" }}>
                <MapPin size={14} color="#9aab9a" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <input name="tempat" value={jadwalForm.tempat} onChange={handleJadwalChange} placeholder="cth: Balai Desa Ceria" className={`input-field${jadwalErr.tempat ? " error" : ""}`} />
              </div>
              {jadwalErr.tempat && <p style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>⚠ {jadwalErr.tempat}</p>}
            </div>
          </div>

          <ModalFooter loading={savingJadwal} onClose={() => { setShowJadwalForm(false); setEditId(null); }} onSubmit={handleJadwalSubmit} submitLabel={editId ? "Update Jadwal" : "Simpan Jadwal"} />
        </FormModal>
      )}
    </div>
  );
}

/* ── Sub-components ── */
function FormModal({ title, icon: Icon, onClose, children }) {
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,30,15,0.35)", backdropFilter: "blur(4px)", zIndex: 200 }} />
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "min(480px,100vw)", background: "#fff", boxShadow: "-8px 0 40px rgba(0,0,0,0.12)", zIndex: 201, display: "flex", flexDirection: "column", fontFamily: "'Plus Jakarta Sans',sans-serif", animation: "slide-from-right 0.28s cubic-bezier(0.16,1,0.3,1)" }}>
        <style>{`@keyframes slide-from-right{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>
        <div style={{ padding: "20px 22px 16px", borderBottom: "1px solid #f0f6f2", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ background: "#e8f5ed", borderRadius: 10, padding: 9 }}><Icon size={18} color="#2d7a4f" /></div>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#1f2d1f" }}>{title}</h2>
          </div>
          <button onClick={onClose} style={{ background: "#f5f7f4", border: "1px solid #e4ede6", borderRadius: 8, padding: "5px 6px", cursor: "pointer", display: "flex" }}>
            <X size={15} color="#6b7c6b" />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 22px" }}>
          {children}
        </div>
      </div>
    </>
  );
}

function ModalFooter({ loading, onClose, onSubmit, submitLabel }) {
  return (
    <div style={{ display: "flex", gap: 10, marginTop: 24, paddingTop: 16, borderTop: "1px solid #f0f6f2" }}>
      <button type="button" onClick={onClose} className="btn-outline" style={{ flex: "0 0 auto" }}>Batal</button>
      <button type="submit" onClick={onSubmit} disabled={loading} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, background: loading ? "#b5ceba" : "#2d7a4f", color: "#fff", border: "none", borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif", transition: "background 0.2s" }}>
        {loading
          ? <><div style={{ width: 15, height: 15, border: "2.5px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> Menyimpan…</>
          : <><Save size={15} /> {submitLabel}</>}
      </button>
    </div>
  );
}