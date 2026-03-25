"use client";

import { useState, useEffect } from "react";
import { getCurrentUser } from "@/services/authService";
import {
  Baby, Search, Calendar, Scale, Ruler,
  Activity, TrendingUp, TrendingDown, Minus,
  ChevronDown, ChevronUp, FileText, AlertTriangle,
  CheckCircle, Clock, Filter
} from "lucide-react";
import { getPosyanduBalitaByUser } from "@/services/balitaService";

/* ── helpers ── */
const formatDisplay = (d) => {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("id-ID", {
    day: "2-digit", month: "long", year: "numeric",
  });
};

const formatShort = (d) => {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
  });
};

const hitungUsia = (tgl) => {
  if (!tgl) return "-";
  const diff  = Date.now() - new Date(tgl).getTime();
  const bulan = Math.floor(diff / (1000 * 60 * 60 * 24 * 30.44));
  if (bulan < 12) return `${bulan} bulan`;
  return `${Math.floor(bulan / 12)} tahun ${bulan % 12} bulan`;
};

/* Tentukan status BB berdasarkan usia (bulan) & BB sederhana */
const getStatusBB = (bb, tglLahir) => {
  if (!bb || !tglLahir) return null;
  const bulan = Math.floor(
    (Date.now() - new Date(tglLahir).getTime()) / (1000 * 60 * 60 * 24 * 30.44)
  );
  // Referensi median WHO (sangat disederhanakan)
  const median = bulan <= 12 ? 9 : bulan <= 24 ? 12 : bulan <= 36 ? 14 : bulan <= 48 ? 16 : 18;
  if (bb < median * 0.8) return "buruk";
  if (bb < median * 0.9) return "kurang";
  return "normal";
};

const statusConfig = {
  normal: { label: "Normal",     color: "#2d7a4f", bg: "#e8f5ed", border: "#b8ddc5", icon: CheckCircle },
  kurang: { label: "BB Kurang",  color: "#d97706", bg: "#fef3c7", border: "#fde68a", icon: AlertTriangle },
  buruk:  { label: "Gizi Buruk", color: "#dc2626", bg: "#fee2e2", border: "#fecaca", icon: AlertTriangle },
};

/* Trend arrow antara dua pemeriksaan */
function TrendBadge({ current, previous, unit }) {
  if (!previous || !current) return <span style={{ color: "#b5ceba", fontSize: 12 }}>—</span>;
  const diff = (current - previous).toFixed(1);
  if (diff > 0) return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, color: "#2d7a4f", fontSize: 12, fontWeight: 700 }}>
      <TrendingUp size={12} /> +{diff} {unit}
    </span>
  );
  if (diff < 0) return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, color: "#dc2626", fontSize: 12, fontWeight: 700 }}>
      <TrendingDown size={12} /> {diff} {unit}
    </span>
  );
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, color: "#9aab9a", fontSize: 12 }}>
      <Minus size={12} /> Tetap
    </span>
  );
}

/* ── Detail Row (expandable) ── */
function DetailRow({ rec, prev, tglLahir, index }) {
  const [open, setOpen] = useState(false);
  const status = getStatusBB(rec.bb, tglLahir);
  const cfg    = status ? statusConfig[status] : null;
  const StatusIcon = cfg?.icon ?? CheckCircle;

  return (
    <>
      <tr
        onClick={() => setOpen(o => !o)}
        style={{
          borderBottom: open ? "none" : "1px solid #f0f6f2",
          cursor: "pointer",
          background: open ? "#f8fbf9" : index % 2 === 0 ? "#fff" : "#fafcfa",
          transition: "background 0.15s",
        }}
      >
        {/* No */}
        <td style={{ padding: "13px 16px", color: "#9aab9a", fontSize: 12, fontWeight: 600 }}>{index + 1}</td>

        {/* Kegiatan */}
        <td style={{ padding: "13px 16px" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#e8f5ed", color: "#2d7a4f", padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
            <Activity size={11} /> {rec.kegiatan || "-"}
          </span>
        </td>

        {/* Tanggal */}
        <td style={{ padding: "13px 16px", color: "#6b7c6b", fontSize: 13, whiteSpace: "nowrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Calendar size={13} color="#b5ceba" />
            {formatShort(rec.tanggal)}
          </div>
        </td>

        {/* BB */}
        <td style={{ padding: "13px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: cfg?.color ?? "#1f2d1f" }}>
              {rec.bb ?? "-"}
              {rec.bb && <span style={{ fontSize: 11, fontWeight: 500, color: "#9aab9a" }}> kg</span>}
            </span>
          </div>
          <TrendBadge current={rec.bb} previous={prev?.bb} unit="kg" />
        </td>

        {/* TB */}
        <td style={{ padding: "13px 16px" }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: "#1f2d1f" }}>
            {rec.tb ?? "-"}
            {rec.tb && <span style={{ fontSize: 11, fontWeight: 500, color: "#9aab9a" }}> cm</span>}
          </span>
          <div><TrendBadge current={rec.tb} previous={prev?.tb} unit="cm" /></div>
        </td>

        {/* LK */}
        <td style={{ padding: "13px 16px", color: "#6b7c6b", fontSize: 13 }}>
          {rec.lingkarKepala ? `${rec.lingkarKepala} cm` : <span style={{ color: "#d1dbd2" }}>—</span>}
        </td>

        {/* Status */}
        <td style={{ padding: "13px 16px" }}>
          {cfg ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
              <StatusIcon size={11} /> {cfg.label}
            </span>
          ) : <span style={{ color: "#d1dbd2", fontSize: 12 }}>—</span>}
        </td>

        {/* Expand */}
        <td style={{ padding: "13px 16px", textAlign: "center" }}>
          <div style={{ background: open ? "#e8f5ed" : "#f5f7f4", borderRadius: 7, padding: "4px 6px", display: "inline-flex", color: open ? "#2d7a4f" : "#9aab9a", transition: "all 0.15s" }}>
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </td>
      </tr>

      {/* Expanded detail */}
      {open && (
        <tr style={{ borderBottom: "1px solid #f0f6f2", background: "#f8fbf9" }}>
          <td colSpan={8} style={{ padding: "0 16px 16px 16px" }}>
            <div style={{ background: "#fff", border: "1px solid #e4ede6", borderRadius: 12, padding: "16px 20px", display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 14 }}>
              {[
                { label: "Berat Badan",     value: rec.bb ? `${rec.bb} kg` : "—",            icon: Scale,    color: "#2d7a4f" },
                { label: "Tinggi Badan",    value: rec.tb ? `${rec.tb} cm` : "—",            icon: Ruler,    color: "#0284c7" },
                { label: "Lingkar Kepala",  value: rec.lingkarKepala ? `${rec.lingkarKepala} cm` : "—", icon: Activity, color: "#7c3aed" },
                { label: "Lingkar Lengan",  value: rec.lingkarLengan ? `${rec.lingkarLengan} cm` : "—", icon: Activity, color: "#db2777" },
                { label: "Tanggal",         value: formatDisplay(rec.tanggal),                icon: Calendar, color: "#d97706" },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ background: `${color}15`, borderRadius: 8, padding: 7, flexShrink: 0 }}>
                    <Icon size={14} color={color} />
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: "#9aab9a", fontWeight: 600, marginBottom: 2 }}>{label}</p>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#1f2d1f" }}>{value}</p>
                  </div>
                </div>
              ))}

              {rec.catatan && (
                <div style={{ gridColumn: "1/-1", borderTop: "1px solid #f0f6f2", paddingTop: 12, marginTop: 2 }}>
                  <p style={{ fontSize: 11, color: "#9aab9a", fontWeight: 600, marginBottom: 4 }}>Catatan</p>
                  <p style={{ fontSize: 13, color: "#3d5542", background: "#f8fbf9", borderRadius: 8, padding: "8px 12px", border: "1px solid #e4ede6" }}>{rec.catatan}</p>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

/* ══════════════════════════════════════════
   HALAMAN UTAMA RIWAYAT PEMERIKSAAN
══════════════════════════════════════════ */
export default function RiwayatPemeriksaanPage() {
  const [user, setUser]           = useState(null);
  const [riwayat, setRiwayat]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [filterStatus, setFilterStatus] = useState("semua"); // semua | normal | kurang | buruk
  const [sortAsc, setSortAsc]     = useState(false); // default terbaru dulu

  useEffect(() => {
    async function init() {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      console.log(currentUser)
      if (!currentUser?.balitaId) { setLoading(false); return; }
      try {
        const data = await getPosyanduBalitaByUser(currentUser.balitaId);
        // sort tanggal terbaru dulu
        setRiwayat(data.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal)));
      } catch {
        /* handle error */
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  /* data untuk stat cards — ambil dari record terbaru */
  const latest  = riwayat[0] ?? null;
  const prev    = riwayat[1] ?? null;
  const balita  = latest?.balita ?? null;

  const sortedRiwayat = sortAsc
    ? [...riwayat].sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal))
    : [...riwayat].sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

  const filtered = sortedRiwayat.filter(r => {
    const matchSearch = search
      ? (r.kegiatan ?? "").toLowerCase().includes(search.toLowerCase())
      : true;
    const status = getStatusBB(r.bb, balita?.tglLahir);
    const matchStatus = filterStatus === "semua" || status === filterStatus;
    return matchSearch && matchStatus;
  });

  /* Stat summary */
  const totalPemeriksaan = riwayat.length;
  const bbTerakhir       = latest?.bb ?? null;
  const tbTerakhir       = latest?.tb ?? null;
  const tglTerakhir      = latest?.tanggal ?? null;
  const statusTerakhir   = getStatusBB(bbTerakhir, balita?.tglLahir);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, fontFamily: "'Plus Jakarta Sans',sans-serif", color: "#1f2d1f" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes spin    { to { transform: rotate(360deg) } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        .rw-search { border:1.5px solid #e4ede6;border-radius:10px;padding:8px 12px 8px 36px;font-size:13px;font-family:'Plus Jakarta Sans',sans-serif;color:#1f2d1f;background:#fff;outline:none;width:220px;transition:border-color 0.2s; }
        .rw-search:focus { border-color:#2d7a4f; }
        .rw-search::placeholder { color:#b5ceba; }
        .rw-select { border:1.5px solid #e4ede6;border-radius:10px;padding:8px 12px;font-size:13px;font-family:'Plus Jakarta Sans',sans-serif;color:#1f2d1f;background:#fff;outline:none;cursor:pointer;transition:border-color 0.2s; }
        .rw-select:focus { border-color:#2d7a4f; }
        .tr-row { transition:background 0.15s; }
        .tr-row:hover td { background:#f0f9f4 !important; }
        .stat-card { background:#fff;border:1px solid #e4ede6;border-radius:14px;padding:16px 18px;box-shadow:0 2px 8px rgba(0,0,0,0.04);display:flex;align-items:center;gap:14px;position:relative;overflow:hidden;animation:fadeUp 0.35s ease; }
        .card { background:#fff;border:1px solid #e4ede6;border-radius:16px;box-shadow:0 2px 8px rgba(0,0,0,0.04); }
      `}</style>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ background: "#e8f5ed", borderRadius: 14, padding: 13 }}>
          <FileText size={22} color="#2d7a4f" />
        </div>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "#1f2d1f", margin: 0 }}>Riwayat Pemeriksaan</h1>
          <p style={{ fontSize: 13, color: "#9aab9a", marginTop: 3 }}>
            {balita ? `${balita.nama} · ${hitungUsia(balita.tglLahir)}` : "Memuat data…"}
          </p>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      {!loading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 13 }}>
          {[
            {
              icon: FileText, label: "Total Kunjungan",
              value: totalPemeriksaan,
              sub: "Pemeriksaan tercatat",
              accent: "#2d7a4f", bg: "#e8f5ed",
            },
            {
              icon: Scale, label: "BB Terakhir",
              value: bbTerakhir ? `${bbTerakhir} kg` : "—",
              sub: bbTerakhir && prev?.bb ? `Sebelumnya ${prev.bb} kg` : "Belum ada data",
              accent: statusTerakhir === "normal" ? "#2d7a4f" : statusTerakhir === "kurang" ? "#d97706" : "#dc2626",
              bg:     statusTerakhir === "normal" ? "#e8f5ed" : statusTerakhir === "kurang" ? "#fef3c7" : "#fee2e2",
            },
            {
              icon: Ruler, label: "TB Terakhir",
              value: tbTerakhir ? `${tbTerakhir} cm` : "—",
              sub: tbTerakhir && prev?.tb ? `Sebelumnya ${prev.tb} cm` : "Belum ada data",
              accent: "#0284c7", bg: "#e0f2fe",
            },
            {
              icon: Clock, label: "Kunjungan Terakhir",
              value: tglTerakhir ? formatShort(tglTerakhir) : "—",
              sub: tglTerakhir ? latest?.kegiatan : "Belum pernah periksa",
              accent: "#7c3aed", bg: "#f3f0ff",
            },
          ].map(({ icon: Icon, label, value, sub, accent, bg }) => (
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

      {/* ── Table Card ── */}
      <div className="card" style={{ overflow: "hidden" }}>

        {/* Toolbar */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #f0f6f2", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#1f2d1f" }}>Riwayat Pemeriksaan</p>
            <p style={{ fontSize: 12, color: "#9aab9a", marginTop: 2 }}>
              {filtered.length} dari {riwayat.length} catatan pemeriksaan
            </p>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            {/* Search */}
            <div style={{ position: "relative" }}>
              <Search size={14} color="#9aab9a" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              <input
                className="rw-search"
                placeholder="Cari kegiatan…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {/* Filter Status */}
            <div style={{ position: "relative" }}>
              <Filter size={13} color="#9aab9a" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              <select
                className="rw-select"
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                style={{ paddingLeft: 30 }}
              >
                <option value="semua">Semua Status</option>
                <option value="normal">Normal</option>
                <option value="kurang">BB Kurang</option>
                <option value="buruk">Gizi Buruk</option>
              </select>
            </div>

            {/* Sort toggle */}
            <button
              onClick={() => setSortAsc(s => !s)}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#f8fbf9", border: "1.5px solid #e4ede6", borderRadius: 10, padding: "8px 13px", fontSize: 13, fontWeight: 600, color: "#6b7c6b", cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif", transition: "all 0.15s" }}
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
                {["No", "Kegiatan", "Tanggal", "Berat Badan", "Tinggi Badan", "Lingkar Kepala", "Status", ""].map(h => (
                  <th key={h} style={{ padding: "11px 16px", textAlign: "left", borderBottom: "1px solid #e4ede6", fontSize: 11, fontWeight: 700, color: "#9aab9a", whiteSpace: "nowrap", letterSpacing: 0.3 }}>
                    {h.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Loading */}
              {loading && (
                <tr>
                  <td colSpan={8} style={{ padding: "56px", textAlign: "center" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 24, height: 24, border: "3px solid #e4ede6", borderTopColor: "#2d7a4f", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                      <p style={{ color: "#9aab9a", fontSize: 13, fontWeight: 500 }}>Memuat riwayat pemeriksaan…</p>
                    </div>
                  </td>
                </tr>
              )}

              {/* Empty — no balita linked */}
              {!loading && !user?.balitaId && (
                <tr>
                  <td colSpan={8} style={{ padding: "56px", textAlign: "center" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                      <div style={{ background: "#fee2e2", borderRadius: "50%", padding: 18 }}>
                        <AlertTriangle size={28} color="#dc2626" />
                      </div>
                      <p style={{ color: "#1f2d1f", fontSize: 14, fontWeight: 700 }}>Akun tidak terhubung ke data balita</p>
                      <p style={{ color: "#9aab9a", fontSize: 13 }}>Hubungi admin untuk menghubungkan akun Anda dengan data balita.</p>
                    </div>
                  </td>
                </tr>
              )}

              {/* Empty — no data */}
              {!loading && user?.balitaId && riwayat.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: "56px", textAlign: "center" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                      <div style={{ background: "#e8f5ed", borderRadius: "50%", padding: 18 }}>
                        <Baby size={28} color="#b5ceba" />
                      </div>
                      <p style={{ color: "#9aab9a", fontSize: 14, fontWeight: 500 }}>Belum ada riwayat pemeriksaan</p>
                    </div>
                  </td>
                </tr>
              )}

              {/* Empty — filtered */}
              {!loading && riwayat.length > 0 && filtered.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: "36px", textAlign: "center", color: "#9aab9a", fontSize: 13 }}>
                    Tidak ada data yang sesuai filter.
                  </td>
                </tr>
              )}

              {/* Data rows */}
              {!loading && filtered.map((rec, i) => {
                // Cari record sebelumnya (berdasarkan tanggal)
                const allSorted = [...riwayat].sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));
                const idx       = allSorted.findIndex(r => r.id === rec.id);
                const prevRec   = idx > 0 ? allSorted[idx - 1] : null;
                return (
                  <DetailRow
                    key={rec.id}
                    rec={rec}
                    prev={prevRec}
                    tglLahir={balita?.tglLahir}
                    index={i}
                  />
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {!loading && filtered.length > 0 && (
          <div style={{ padding: "11px 20px", borderTop: "1px solid #f0f6f2", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ color: "#9aab9a", fontSize: 12 }}>
              Menampilkan {filtered.length} dari {riwayat.length} pemeriksaan
            </p>
            {statusTerakhir && (
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700,
                color: statusConfig[statusTerakhir].color,
                background: statusConfig[statusTerakhir].bg,
                border: `1px solid ${statusConfig[statusTerakhir].border}`,
                padding: "4px 11px", borderRadius: 8,
              }}>
                Status terkini: {statusConfig[statusTerakhir].label}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}