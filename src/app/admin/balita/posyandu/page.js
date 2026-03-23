"use client";

import { useEffect, useState } from "react";
import { getBalita } from "@/services/balitaService";
import {
  getPosyanduBalita,
  createPosyanduBalita,
  deletePosyanduBalita,
} from "@/services/posyanduBalitaService";
import {
  Scale, Ruler, Plus, Save, X, Search, Trash2
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
const hitungUsia = (tgl) => {
  if (!tgl) return "-";
  const diff  = Date.now() - new Date(tgl).getTime();
  const bulan = Math.floor(diff / (1000 * 60 * 60 * 24 * 30.44));
  if (bulan < 12) return `${bulan} bln`;
  return `${Math.floor(bulan / 12)} th ${bulan % 12} bln`;
};

const PEMERIKSAAN_INIT = {
  balitaId: "",
  kegiatan: "",
  tanggal: new Date().toISOString().split("T")[0],
  bb: "",
  tb: "",
  lingkarKepala: "",
  lingkarLengan: "",
  catatan: "",
};

export default function PosyanduPemeriksaanPage() {
  const [balitaList, setBalitaList]   = useState([]);
  const [pemHistory, setPemHistory]   = useState([]);
  const [showPemForm, setShowPemForm] = useState(false);
  const [pemForm, setPemForm]         = useState(PEMERIKSAAN_INIT);
  const [pemErr, setPemErr]           = useState({});
  const [savingPem, setSavingPem]     = useState(false);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");

  /* ── fetch data awal ── */
  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      try {
        const [balita, pem] = await Promise.all([getBalita(), getPosyanduBalita()]);
        setBalitaList(balita);
        setPemHistory(pem);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  function handlePemChange(e) {
    const { name, value } = e.target;
    setPemForm(p => ({ ...p, [name]: value }));
    if (pemErr[name]) setPemErr(p => ({ ...p, [name]: "" }));
  }

  function validatePem() {
    const e = {};
    if (!pemForm.balitaId) e.balitaId = "Pilih balita";
    if (!pemForm.tanggal)  e.tanggal  = "Tanggal wajib diisi";
    if (!pemForm.bb)       e.bb       = "Berat badan wajib diisi";
    if (!pemForm.tb)       e.tb       = "Tinggi badan wajib diisi";
    return e;
  }

  async function handlePemSubmit(ev) {
    ev.preventDefault();
    const errs = validatePem();
    if (Object.keys(errs).length) { setPemErr(errs); return; }
    setSavingPem(true);
    try {
      const created = await createPosyanduBalita({
        balitaId:     pemForm.balitaId,
        kegiatan:     pemForm.kegiatan,
        tanggal:      pemForm.tanggal,
        bb:           pemForm.bb,
        tb:           pemForm.tb,
        lingkarKepala: pemForm.lingkarKepala || null,
        lingkarLengan: pemForm.lingkarLengan || null,
      });

      /* Re-fetch agar relasi balita ikut ter-include */
      const fresh = await getPosyanduBalita();
      setPemHistory(fresh);

      setPemForm(PEMERIKSAAN_INIT);
      setShowPemForm(false);
    } finally {
      setSavingPem(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Hapus data pemeriksaan ini?")) return;
    await deletePosyanduBalita(id);
    setPemHistory(prev => prev.filter(p => p.id !== id));
  }

  /* ── filter ── */
  const filteredPem = pemHistory.filter(p =>
    (p.balita?.nama ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Header + tombol */}
      <div className="card" style={{ padding: "18px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <div>
          <p className="section-title">Data Pemeriksaan Balita</p>
          <p className="section-sub">Catat BB, TB, dan lingkar kepala setiap kunjungan posyandu</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ position: "relative" }}>
            <Search size={14} color="#9aab9a" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            <input className="search-inp" placeholder="Cari nama balita…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn-primary" onClick={() => setShowPemForm(true)}>
            <Plus size={15} /> Input Pemeriksaan
          </button>
        </div>
      </div>

      {/* Tabel pemeriksaan */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f8fbf9" }}>
                {["No","Nama Balita","Tgl Pemeriksaan","BB (kg)","TB (cm)","Lk. Kepala (cm)","Lk. Lengan (cm)","Status","Aksi"].map(h => (
                  <th key={h} style={{ padding: "11px 14px", textAlign: "left", borderBottom: "1px solid #e4ede6", fontSize: 12, fontWeight: 700, color: "#9aab9a", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={9} style={{ padding: "36px", textAlign: "center", color: "#9aab9a" }}>Memuat data…</td></tr>
              )}
              {!loading && filteredPem.length === 0 && (
                <tr><td colSpan={9} style={{ padding: "36px", textAlign: "center", color: "#9aab9a" }}>Belum ada data pemeriksaan.</td></tr>
              )}
              {!loading && filteredPem.map((p, i) => {
                const statusBB = p.bb < 10 ? "kurang" : "normal";
                return (
                  <tr key={p.id} className="tr-row">
                    <td style={{ padding: "12px 14px", color: "#9aab9a" }}>{i + 1}</td>
                    <td style={{ padding: "12px 14px", fontWeight: 600, color: "#1f2d1f" }}>{p.balita?.nama ?? "-"}</td>
                    <td style={{ padding: "12px 14px", color: "#6b7c6b" }}>{formatDisplay(p.tanggal)}</td>
                    <td style={{ padding: "12px 14px", fontWeight: 700, color: statusBB === "kurang" ? "#d97706" : "#2d7a4f" }}>{p.bb ?? "-"}</td>
                    <td style={{ padding: "12px 14px", color: "#1f2d1f", fontWeight: 600 }}>{p.tb ?? "-"}</td>
                    <td style={{ padding: "12px 14px", color: "#6b7c6b" }}>{p.lingkarKepala ?? "-"}</td>
                    <td style={{ padding: "12px 14px", color: "#6b7c6b" }}>{p.lingkarLengan ?? "-"}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <span className={statusBB === "kurang" ? "badge-yellow" : "badge-green"}>
                        {statusBB === "kurang" ? "BB Kurang" : "Normal"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <button onClick={() => handleDelete(p.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }} title="Hapus">
                        <Trash2 size={14} color="#dc2626" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal Pemeriksaan */}
      {showPemForm && (
        <FormModal title="Input Pemeriksaan Balita" icon={Scale} onClose={() => { setShowPemForm(false); setPemForm(PEMERIKSAAN_INIT); setPemErr({}); }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 14px" }}>

            <div style={{ gridColumn: "1/-1" }}>
              <label className="label">Nama Balita <span style={{ color: "#dc2626" }}>*</span></label>
              <select name="balitaId" value={pemForm.balitaId} onChange={handlePemChange}
                style={{ width: "100%", border: `1.5px solid ${pemErr.balitaId ? "#dc2626" : "#e4ede6"}`, borderRadius: 10, padding: "10px 12px", fontSize: 14, fontFamily: "'Plus Jakarta Sans',sans-serif", color: pemForm.balitaId ? "#1f2d1f" : "#9aab9a", background: "#fff", outline: "none" }}>
                <option value="">-- Pilih balita --</option>
                {balitaList.map(b => <option key={b.id} value={b.id}>{b.nama} ({hitungUsia(b.tglLahir)})</option>)}
              </select>
              {pemErr.balitaId && <p style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>⚠ {pemErr.balitaId}</p>}
            </div>

            <div style={{ gridColumn: "1/-1" }}>
              <label className="label">Tanggal Pemeriksaan <span style={{ color: "#dc2626" }}>*</span></label>
              <input type="date" name="tanggal" value={pemForm.tanggal} onChange={handlePemChange}
                className={`input-bare${pemErr.tanggal ? " error" : ""}`} />
              {pemErr.tanggal && <p style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>⚠ {pemErr.tanggal}</p>}
            </div>

            <div style={{ gridColumn: "1/-1" }}>
              <label className="label">Kegiatan <span style={{ color: "#9aab9a", fontWeight: 400 }}>opsional</span></label>
              <input type="text" name="kegiatan" value={pemForm.kegiatan} onChange={handlePemChange}
                placeholder="cth: Posyandu Rutin Maret 2026" className="input-bare" />
            </div>

            <div>
              <label className="label">Berat Badan (kg) <span style={{ color: "#dc2626" }}>*</span></label>
              <div style={{ position: "relative" }}>
                <Scale size={14} color="#9aab9a" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <input type="number" step="0.1" min="0" name="bb" value={pemForm.bb} onChange={handlePemChange} placeholder="cth: 10.5" className={`input-field${pemErr.bb ? " error" : ""}`} />
              </div>
              {pemErr.bb && <p style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>⚠ {pemErr.bb}</p>}
            </div>

            <div>
              <label className="label">Tinggi Badan (cm) <span style={{ color: "#dc2626" }}>*</span></label>
              <div style={{ position: "relative" }}>
                <Ruler size={14} color="#9aab9a" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <input type="number" step="0.1" min="0" name="tb" value={pemForm.tb} onChange={handlePemChange} placeholder="cth: 82" className={`input-field${pemErr.tb ? " error" : ""}`} />
              </div>
              {pemErr.tb && <p style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>⚠ {pemErr.tb}</p>}
            </div>

            <div>
              <label className="label">Lingkar Kepala (cm) <span style={{ color: "#9aab9a", fontWeight: 400 }}>opsional</span></label>
              <input type="number" step="0.1" min="0" name="lingkarKepala" value={pemForm.lingkarKepala} onChange={handlePemChange} placeholder="cth: 44" className="input-bare" />
            </div>

            <div>
              <label className="label">Lingkar Lengan (cm) <span style={{ color: "#9aab9a", fontWeight: 400 }}>opsional</span></label>
              <input type="number" step="0.1" min="0" name="lingkarLengan" value={pemForm.lingkarLengan} onChange={handlePemChange} placeholder="cth: 14" className="input-bare" />
            </div>

          </div>

          <ModalFooter loading={savingPem} onClose={() => { setShowPemForm(false); setPemForm(PEMERIKSAAN_INIT); }} onSubmit={handlePemSubmit} submitLabel="Simpan Pemeriksaan" />
        </FormModal>
      )}
    </div>
  );
}

/* ── Sub-components (tidak diubah sama sekali) ── */
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