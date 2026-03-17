"use client";

import { useEffect, useState } from "react";
import {
  getPenjadwalan, createPenjadwalan,
  updatePenjadwalan, deletePenjadwalan, getJadwalTerdekat
} from "@/services/penjadwalanService";
import { getBalita } from "@/services/balitaService";
import {
  CalendarDays, Plus, Pencil, Trash2, X, Save,
  Scale, Ruler, User, MapPin, Calendar, Search, ChevronDown, ChevronUp
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

const JADWAL_INIT = { kegiatan: "", tanggal: "", tempat: "" };
const PEMERIKSAAN_INIT = { balitaId: "", bb: "", tb: "", lingkarKepala: "", catatan: "" };

export default function PosyanduPage() {
  const [tab, setTab]               = useState("pemeriksaan"); // "pemeriksaan" | "jadwal"
  const [balitaList, setBalitaList] = useState([]);
  const [jadwal, setJadwal]         = useState([]);
  const [jadwalDekat, setJadwalDekat] = useState([]);

  /* jadwal state */
  const [showJadwalForm, setShowJadwalForm] = useState(false);
  const [editId, setEditId]         = useState(null);
  const [jadwalForm, setJadwalForm] = useState(JADWAL_INIT);
  const [jadwalErr, setJadwalErr]   = useState({});

  /* pemeriksaan state */
  const [showPemForm, setShowPemForm]   = useState(false);
  const [pemForm, setPemForm]           = useState(PEMERIKSAAN_INIT);
  const [pemErr, setPemErr]             = useState({});
  const [savingPem, setSavingPem]       = useState(false);
  const [savingJadwal, setSavingJadwal] = useState(false);
  const [search, setSearch]             = useState("");

  /* dummy pemeriksaan history — ganti dengan data API pemeriksaan */
  const [pemHistory, setPemHistory] = useState([
    { id: 1, balitaId: 1, namBalita: "Danessya Intan", tgl: "2026-03-10", bb: 11.2, tb: 83, lingkarKepala: 45, catatan: "Normal" },
    { id: 2, balitaId: 2, namBalita: "Eka Firmani",    tgl: "2026-03-10", bb: 9.1,  tb: 75, lingkarKepala: 43, catatan: "BB kurang" },
  ]);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    const [b, j, jd] = await Promise.all([getBalita(), getPenjadwalan(), getJadwalTerdekat()]);
    setBalitaList(b);
    setJadwal(j);
    setJadwalDekat(jd);
  }

  /* ── JADWAL handlers ── */
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

  /* ── PEMERIKSAAN handlers ── */
  function handlePemChange(e) {
    const { name, value } = e.target;
    setPemForm(p => ({ ...p, [name]: value }));
    if (pemErr[name]) setPemErr(p => ({ ...p, [name]: "" }));
  }
  function validatePem() {
    const e = {};
    if (!pemForm.balitaId) e.balitaId = "Pilih balita";
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
      /* TODO: ganti dengan API createPemeriksaan */
      const selected = balitaList.find(b => String(b.id) === String(pemForm.balitaId));
      setPemHistory(prev => [{
        id: Date.now(), balitaId: pemForm.balitaId, namBalita: selected?.nama ?? "-",
        tgl: new Date().toISOString().split("T")[0],
        bb: parseFloat(pemForm.bb), tb: parseFloat(pemForm.tb),
        lingkarKepala: pemForm.lingkarKepala ? parseFloat(pemForm.lingkarKepala) : null,
        catatan: pemForm.catatan,
      }, ...prev]);
      setPemForm(PEMERIKSAAN_INIT); setShowPemForm(false);
    } finally { setSavingPem(false); }
  }

  const filteredPem = pemHistory.filter(p =>
    p.namBalita.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── TAB BAR ── */}
      <div style={{ display: "flex", gap: 6, background: "#fff", border: "1px solid #e4ede6", borderRadius: 14, padding: 5, width: "fit-content", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        {[
          { id: "pemeriksaan", label: "Input Pemeriksaan", icon: Scale },
          { id: "jadwal",      label: "Penjadwalan",       icon: CalendarDays },
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

      {/* ══════════ TAB PEMERIKSAAN ══════════ */}
      {tab === "pemeriksaan" && (
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
                    {["No","Nama Balita","Tgl Pemeriksaan","BB (kg)","TB (cm)","Lk. Kepala (cm)","Catatan","Status"].map(h => (
                      <th key={h} style={{ padding: "11px 14px", textAlign: "left", borderBottom: "1px solid #e4ede6", fontSize: 12, fontWeight: 700, color: "#9aab9a", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredPem.length === 0 && (
                    <tr><td colSpan={8} style={{ padding: "36px", textAlign: "center", color: "#9aab9a" }}>Belum ada data pemeriksaan.</td></tr>
                  )}
                  {filteredPem.map((p, i) => {
                    const statusBB = p.bb < 10 ? "kurang" : "normal";
                    return (
                      <tr key={p.id} className="tr-row">
                        <td style={{ padding: "12px 14px", color: "#9aab9a" }}>{i + 1}</td>
                        <td style={{ padding: "12px 14px", fontWeight: 600, color: "#1f2d1f" }}>{p.namBalita}</td>
                        <td style={{ padding: "12px 14px", color: "#6b7c6b" }}>{formatDisplay(p.tgl)}</td>
                        <td style={{ padding: "12px 14px", fontWeight: 700, color: statusBB === "kurang" ? "#d97706" : "#2d7a4f" }}>{p.bb}</td>
                        <td style={{ padding: "12px 14px", color: "#1f2d1f", fontWeight: 600 }}>{p.tb}</td>
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

          {/* Form Modal Pemeriksaan */}
          {showPemForm && (
            <FormModal title="Input Pemeriksaan Balita" icon={Scale} onClose={() => { setShowPemForm(false); setPemForm(PEMERIKSAAN_INIT); setPemErr({}); }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 14px" }}>

                {/* Pilih balita */}
                <div style={{ gridColumn: "1/-1" }}>
                  <label className="label">Nama Balita <span style={{ color: "#dc2626" }}>*</span></label>
                  <select name="balitaId" value={pemForm.balitaId} onChange={handlePemChange}
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
                    <input type="number" step="0.1" min="0" name="bb" value={pemForm.bb} onChange={handlePemChange} placeholder="cth: 10.5" className={`input-field${pemErr.bb ? " error" : ""}`} />
                  </div>
                  {pemErr.bb && <p style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>⚠ {pemErr.bb}</p>}
                </div>

                {/* TB */}
                <div>
                  <label className="label">Tinggi Badan (cm) <span style={{ color: "#dc2626" }}>*</span></label>
                  <div style={{ position: "relative" }}>
                    <Ruler size={14} color="#9aab9a" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                    <input type="number" step="0.1" min="0" name="tb" value={pemForm.tb} onChange={handlePemChange} placeholder="cth: 82" className={`input-field${pemErr.tb ? " error" : ""}`} />
                  </div>
                  {pemErr.tb && <p style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>⚠ {pemErr.tb}</p>}
                </div>

                {/* Lingkar Kepala */}
                <div style={{ gridColumn: "1/-1" }}>
                  <label className="label">Lingkar Kepala (cm) <span style={{ color: "#9aab9a", fontWeight: 400 }}>opsional</span></label>
                  <input type="number" step="0.1" min="0" name="lingkarKepala" value={pemForm.lingkarKepala} onChange={handlePemChange} placeholder="cth: 44" className="input-bare" />
                </div>

                {/* Catatan */}
                <div style={{ gridColumn: "1/-1" }}>
                  <label className="label">Catatan <span style={{ color: "#9aab9a", fontWeight: 400 }}>opsional</span></label>
                  <textarea name="catatan" value={pemForm.catatan} onChange={handlePemChange} placeholder="Catatan kondisi balita…" className="textarea-bare" />
                </div>
              </div>

              <ModalFooter loading={savingPem} onClose={() => { setShowPemForm(false); setPemForm(PEMERIKSAAN_INIT); }} onSubmit={handlePemSubmit} submitLabel="Simpan Pemeriksaan" />
            </FormModal>
          )}
        </div>
      )}

      {/* ══════════ TAB JADWAL ══════════ */}
      {tab === "jadwal" && (
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

          {/* Tabel semua jadwal */}
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
      )}
    </div>
  );
}

/* ── Reusable sub-components ── */
function FormModal({ title, icon: Icon, onClose, children }) {
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,30,15,0.35)", backdropFilter: "blur(4px)", zIndex: 200 }} />
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "min(480px,100vw)", background: "#fff", boxShadow: "-8px 0 40px rgba(0,0,0,0.12)", zIndex: 201, display: "flex", flexDirection: "column", fontFamily: "'Plus Jakarta Sans',sans-serif", animation: "slide-from-right 0.28s cubic-bezier(0.16,1,0.3,1)" }}>
        <style>{`@keyframes slide-from-right{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>

        {/* header */}
        <div style={{ padding: "20px 22px 16px", borderBottom: "1px solid #f0f6f2", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ background: "#e8f5ed", borderRadius: 10, padding: 9 }}><Icon size={18} color="#2d7a4f" /></div>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#1f2d1f" }}>{title}</h2>
          </div>
          <button onClick={onClose} style={{ background: "#f5f7f4", border: "1px solid #e4ede6", borderRadius: 8, padding: "5px 6px", cursor: "pointer", display: "flex" }}>
            <X size={15} color="#6b7c6b" />
          </button>
        </div>

        {/* body */}
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