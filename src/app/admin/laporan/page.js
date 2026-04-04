"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getBalita } from "@/services/balitaService";
import { getLansia } from "@/services/lansiaService";
import { getPosyanduBalita, getPosyanduBalitaByBulan } from "@/services/posyanduBalitaService";
import { getPosyanduLansia, getPosyanduLansiaByBulan } from "@/services/posyanduLansiaService";
import {
  FileText, Baby, Users, Filter, Printer,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  Download, Calendar, RotateCcw
} from "lucide-react";

/* ── helpers ── */
const BULAN = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

const formatDate = (d) => {
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
const tglCetak = () => new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });

/* ── EMPTY STATE ── */
function PilihKategori() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "72px 24px", gap: 14 }}>
      <div style={{ background: "#e8f5ed", borderRadius: "50%", padding: 22 }}>
        <Filter size={32} color="#b5ceba" />
      </div>
      <p style={{ fontSize: 15, fontWeight: 700, color: "#6b7c6b" }}>Silahkan pilih kategori terlebih dahulu</p>
      <p style={{ fontSize: 13, color: "#9aab9a" }}>Pilih Balita atau Lansia untuk menampilkan data</p>
    </div>
  );
}

/* ── SORT ICON ── */
function SortIcon({ field, active, asc }) {
  return active
    ? (asc ? <ChevronUp size={12} color="#2d7a4f" /> : <ChevronDown size={12} color="#2d7a4f" />)
    : <ChevronDown size={12} color="#dde8de" />;
}

/* ── PAGINATION ── */
function Pagination({ page, totalPage, onPrev, onNext, perPage, onPerPage, total }) {
  return (
    <div style={{ padding: "12px 20px", borderTop: "1px solid #f0f6f2", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <p style={{ fontSize: 12, color: "#9aab9a" }}>Tampilkan</p>
        <select value={perPage} onChange={e => onPerPage(Number(e.target.value))}
          style={{ border: "1.5px solid #e4ede6", borderRadius: 8, padding: "4px 8px", fontSize: 13, fontFamily: "'Plus Jakarta Sans',sans-serif", color: "#1f2d1f", background: "#fff", outline: "none" }}>
          {[5, 10, 25, 50].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <p style={{ fontSize: 12, color: "#9aab9a" }}>dari {total} data</p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <button onClick={onPrev} disabled={page === 1}
          style={{ background: page === 1 ? "#f5f7f4" : "#fff", border: "1.5px solid #e4ede6", borderRadius: 8, padding: "5px 8px", cursor: page === 1 ? "not-allowed" : "pointer", display: "flex", opacity: page === 1 ? 0.5 : 1 }}>
          <ChevronLeft size={14} color="#6b7c6b" />
        </button>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#1f2d1f", minWidth: 80, textAlign: "center" }}>
          Hal {page} / {totalPage || 1}
        </p>
        <button onClick={onNext} disabled={page >= totalPage}
          style={{ background: page >= totalPage ? "#f5f7f4" : "#fff", border: "1.5px solid #e4ede6", borderRadius: 8, padding: "5px 8px", cursor: page >= totalPage ? "not-allowed" : "pointer", display: "flex", opacity: page >= totalPage ? 0.5 : 1 }}>
          <ChevronRight size={14} color="#6b7c6b" />
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   HALAMAN UTAMA
══════════════════════════════════════════ */
export default function LaporanPage() {
  const [section, setSection] = useState("data"); // "data" | "posyandu"

  /* ── Section 1: Data ── */
  const [kategoriData, setKategoriData]   = useState("");
  const [balitaList, setBalitaList]       = useState([]);
  const [lansiaList, setLansiaList]       = useState([]);
  const [loadingData, setLoadingData]     = useState(false);
  const [sortFieldData, setSortFieldData] = useState("id");
  const [sortAscData, setSortAscData]     = useState(true);
  const [pageData, setPageData]           = useState(1);
  const [perPageData, setPerPageData]     = useState(10);

  /* ── Section 2: Posyandu ── */
  const [kategoriPos, setKategoriPos]     = useState("");
  const [tahunList]                       = useState(() => {
    const now = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => now - i);
  });
  const [tahunPilih, setTahunPilih]       = useState("");
  const [bulanPilih, setBulanPilih]       = useState("");
  const [posData, setPosData]             = useState([]);
  const [loadingPos, setLoadingPos]       = useState(false);
  const [sortFieldPos, setSortFieldPos]   = useState("id");
  const [sortAscPos, setSortAscPos]       = useState(true);
  const [pagePos, setPagePos]             = useState(1);
  const [perPagePos, setPerPagePos]       = useState(10);

  const printDataRef = useRef();
  const printPosRef  = useRef();
  

  /* ── Load data section 1 saat kategori berubah ── */
  useEffect(() => {

    if (!kategoriData) return;
    setLoadingData(true);
    setPageData(1);
    setSortFieldData("id");
    setSortAscData(true);
    async function load() {
      try {
        if (kategoriData === "balita") {
          const d = await getBalita();
          setBalitaList(d);
        } else {
          const d = await getLansia();
          setLansiaList(d);
        }
      } catch {}
      finally { setLoadingData(false); }
    }
    load();
  }, [kategoriData]);

  /* ── Load data section 2 saat kategori berubah ── */
  useEffect(() => {

    if (!kategoriPos) return;
    setLoadingPos(true);
    setPosData([]);
    setTahunPilih("");
    setBulanPilih("");
    setPagePos(1);
    setSortFieldPos("id");
    setSortAscPos(true);
    async function load() {
      try {
        if (kategoriPos === "balita") {
          const d = await getPosyanduBalita();
          setPosData(d);
        } else {
          const d = await getPosyanduLansia();
          setPosData(d);
        }
      } catch {}
      finally { setLoadingPos(false); }
    }
    load();
  }, [kategoriPos]);

  /* ── Filter by bulan ── */
  async function handleFilterPos() {
    if (!kategoriPos || !tahunPilih || !bulanPilih) return;
    setLoadingPos(true);
    setPagePos(1);
    try {
      if (kategoriPos === "balita") {
        const d = await getPosyanduBalitaByBulan(Number(tahunPilih), Number(bulanPilih));
        setPosData(d);
      } else {
        const d = await getPosyanduLansiaByBulan(Number(tahunPilih), Number(bulanPilih));
        setPosData(d);
      }
    } catch {}
    finally { setLoadingPos(false); }
  }

  /* ── Reset filter posyandu ── */
  async function handleResetFilter() {
    setTahunPilih("");
    setBulanPilih("");
    setLoadingPos(true);
    setPagePos(1);
    try {
      if (kategoriPos === "balita") {
        const d = await getPosyanduBalita();
        setPosData(d);
      } else {
        const d = await getPosyanduLansia();
        setPosData(d);
      }
    } catch {}
    finally { setLoadingPos(false); }
  }

  /* ── Sort helpers ── */
  function toggleSortData(field) {
    if (sortFieldData === field) setSortAscData(s => !s);
    else { setSortFieldData(field); setSortAscData(true); }
  }
  function toggleSortPos(field) {
    if (sortFieldPos === field) setSortAscPos(s => !s);
    else { setSortFieldPos(field); setSortAscPos(true); }
  }

  /* ── Computed section data ── */
  const rawData    = kategoriData === "balita" ? balitaList : lansiaList;
  const sortedData = [...rawData].sort((a, b) => {
    const va = a[sortFieldData] ?? "", vb = b[sortFieldData] ?? "";
    if (typeof va === "string") return sortAscData ? va.localeCompare(vb) : vb.localeCompare(va);
    return sortAscData ? va - vb : vb - va;
  });
  const totalPageData = Math.ceil(sortedData.length / perPageData) || 1;
  const pagedData     = sortedData.slice((pageData - 1) * perPageData, pageData * perPageData);

  /* ── Computed section posyandu ── */
  const sortedPos = [...posData].sort((a, b) => {
    const va = a[sortFieldPos] ?? "", vb = b[sortFieldPos] ?? "";
    if (typeof va === "string") return sortAscPos ? va.localeCompare(vb) : vb.localeCompare(va);
    return sortAscPos ? va - vb : vb - va;
  });
  const totalPagePos = Math.ceil(sortedPos.length / perPagePos) || 1;
  const pagedPos     = sortedPos.slice((pagePos - 1) * perPagePos, pagePos * perPagePos);

  /* ── Judul laporan ── */
  const judulData = kategoriData
    ? `Laporan Data ${kategoriData === "balita" ? "Balita" : "Lansia"}`
    : "Laporan Data";
  const judulPos = kategoriPos
    ? `Laporan Data Posyandu ${kategoriPos === "balita" ? "Balita" : "Lansia"}${tahunPilih && bulanPilih ? ` — ${BULAN[Number(bulanPilih) - 1]} ${tahunPilih}` : ""}`
    : "Laporan Data Posyandu";

  /* ── Print helper ── */
  function doPrint(ref, judul, pagedItems, kategori) {
  const win = window.open("", "_blank");

  // Konversi logo ke base64 agar bisa muncul di tab baru
  const logoUrl = new URL("/src/assets/logoDesa.jpg", window.location.origin).href;

  // Render kolom header sesuai kategori
  const getHeaders = () => {
    if (kategori === "balita-data")    return ["No","NIK","Nama Balita","Nama Ibu","Tgl Lahir","Usia","No Telp","Alamat"];
    if (kategori === "lansia-data")    return ["No","NIK","Nama Lansia","Tgl Lahir","Usia","No Telp","Alamat"];
    if (kategori === "balita-posyandu") return ["No","Nama Balita","Kegiatan","Tanggal","BB (kg)","TB (cm)","Lk. Kepala (cm)","Lk. Lengan (cm)"];
    if (kategori === "lansia-posyandu") return ["No","Nama Lansia","Kegiatan","Tanggal","BB (kg)","TB (cm)","Lk. Perut (cm)","Tensi (mmHg)","Gula Darah (mg/dL)"];
    return [];
  };

  const getRows = () => pagedItems.map((item, i) => {
    let cells = [];
    if (kategori === "balita-data") {
      cells = [
        i + 1,
        item.nik ?? "-",
        item.nama ?? "-",
        item.namaIbu ?? "-",
        formatDate(item.tglLahir),
        hitungUsia(item.tglLahir),
        item.noTelp ?? "-",
        item.alamat ?? "-",
      ];
    } else if (kategori === "lansia-data") {
      cells = [
        i + 1,
        item.nik ?? "-",
        item.nama ?? "-",
        formatDate(item.tglLahir),
        hitungUsia(item.tglLahir),
        item.noTelp ?? "-",
        item.alamat ?? "-",
      ];
    } else if (kategori === "balita-posyandu") {
      cells = [
        i + 1,
        item.balita?.nama ?? "-",
        item.kegiatan ?? "-",
        formatDate(item.tanggal),
        item.bb ?? "-",
        item.tb ?? "-",
        item.lingkarKepala ?? "-",
        item.lingkarLengan ?? "-",
      ];
    } else if (kategori === "lansia-posyandu") {
      cells = [
        i + 1,
        item.lansia?.nama ?? "-",
        item.kegiatan ?? "-",
        formatDate(item.tanggal),
        item.bb ?? "-",
        item.tb ?? "-",
        item.lingkarPerut ?? "-",
        item.tensi ?? "-",
        item.gulaDarah ?? "-",
      ];
    }
    return `<tr>${cells.map(c => `<td>${c}</td>`).join("")}</tr>`;
  }).join("");

  win.document.write(`
    <html>
    <head>
      <title>${judul}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
        body { padding: 32px 40px; color: #1f2d1f; font-size: 12px; }

        /* ── KOP SURAT ── */
        .kop {
          display: flex;
          align-items: center;
          gap: 20px;
          padding-bottom: 14px;
          border-bottom: 3px solid #2d7a4f;
          margin-bottom: 6px;
        }
        .kop img {
          width: 64px;
          height: 64px;
          object-fit: contain;
        }
        .kop-center { flex: 1; text-align: center; }
        .kop-instansi {
          font-size: 11px;
          font-weight: 600;
          color: #6b7c6b;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin-bottom: 2px;
        }
        .kop-nama {
          font-size: 18px;
          font-weight: 800;
          color: #1f2d1f;
          line-height: 1.2;
        }
        .kop-alamat {
          font-size: 10px;
          color: #9aab9a;
          margin-top: 4px;
        }
        .kop-right { width: 64px; }

        /* ── JUDUL LAPORAN ── */
        .judul-wrap {
          text-align: center;
          margin: 18px 0 20px;
        }
        .judul-laporan {
          font-size: 14px;
          font-weight: 800;
          color: #1f2d1f;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .judul-sub {
          font-size: 11px;
          color: #6b7c6b;
          margin-top: 4px;
        }
        .judul-line {
          width: 60px;
          height: 3px;
          background: #2d7a4f;
          margin: 8px auto 0;
          border-radius: 10px;
        }

        /* ── INFO ROW ── */
        .info-row {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: #6b7c6b;
          margin-bottom: 14px;
          padding: 8px 12px;
          background: #f8fbf9;
          border-radius: 8px;
          border: 1px solid #e4ede6;
        }

        /* ── TABEL ── */
        table { width: 100%; border-collapse: collapse; }
        thead tr { background: #2d7a4f; }
        thead th {
          padding: 9px 11px;
          text-align: left;
          font-size: 11px;
          font-weight: 700;
          color: #ffffff;
          white-space: nowrap;
          border: 1px solid #246240;
        }
        tbody td {
          padding: 8px 11px;
          border: 1px solid #e4ede6;
          font-size: 11.5px;
          color: #1f2d1f;
          vertical-align: top;
        }
        tbody tr:nth-child(even) td { background: #f8fbf9; }
        tbody tr:last-child td { border-bottom: 2px solid #2d7a4f; }

        /* ── FOOTER ── */
        .footer {
          margin-top: 40px;
          display: flex;
          justify-content: flex-end;
        }
        .ttd-box { text-align: center; font-size: 11px; color: #1f2d1f; }
        .ttd-box .ttd-kota { color: #6b7c6b; margin-bottom: 4px; }
        .ttd-box .ttd-jabatan { font-weight: 700; margin-top: 60px; }
        .ttd-box .ttd-garis {
          margin: 4px auto 0;
          width: 120px;
          border-top: 1.5px solid #1f2d1f;
        }
        .ttd-box .ttd-nama { font-weight: 600; font-size: 12px; margin-top: 4px; }

        /* ── PRINT ── */
        @media print {
          body { padding: 16px 24px; }
          @page { margin: 1.5cm; }
        }
      </style>
    </head>
    <body>

      <!-- KOP SURAT -->
      <div class="kop">
        <img src="${logoUrl}" alt="Logo Desa" onerror="this.style.display='none'" />
        <div class="kop-center">
          <p class="kop-instansi">Pemerintah Desa</p>
          <p class="kop-nama">NAMA DESA ANDA</p>
          <p class="kop-alamat">Jl. Nama Jalan No. XX, Kecamatan ..., Kabupaten ..., Provinsi ... · Kode Pos XXXXX</p>
        </div>
        <div class="kop-right"></div>
      </div>

      <!-- JUDUL LAPORAN -->
      <div class="judul-wrap">
        <p class="judul-laporan">${judul}</p>
        <div class="judul-line"></div>
        <p class="judul-sub">Periode: ${tahunPilih && bulanPilih ? `${BULAN[Number(bulanPilih) - 1]} ${tahunPilih}` : "Semua Periode"}</p>
      </div>

      <!-- INFO ROW -->
      <div class="info-row">
        <span>Dicetak: ${tglCetak()}</span>
        <span>Jumlah Data: ${pagedItems.length} record</span>
        <span>Sistem: SmartHealth Village</span>
      </div>

      <!-- TABEL DATA -->
      <table>
        <thead>
          <tr>${getHeaders().map(h => `<th>${h}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${getRows()}
        </tbody>
      </table>

      <!-- TANDA TANGAN -->
      <div class="footer">
        <div class="ttd-box">
          <p class="ttd-kota">..., ${tglCetak()}</p>
          <p class="ttd-jabatan">Kepala Desa / Bidan Desa</p>
          <div class="ttd-garis"></div>
          <p class="ttd-nama">( _________________ )</p>
        </div>
      </div>

    </body>
    </html>
  `);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 500);
}

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, fontFamily: "'Plus Jakarta Sans',sans-serif", color: "#1f2d1f" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes spin   { to{transform:rotate(360deg)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .th-btn { background:none;border:none;cursor:pointer;display:flex;align-items:center;gap:4px;font-size:12px;font-weight:700;color:#6b7c6b;font-family:'Plus Jakarta Sans',sans-serif;padding:0;white-space:nowrap; }
        .th-btn:hover { color:#2d7a4f; }
        .tr-row { border-bottom:1px solid #f0f6f2;transition:background 0.15s; }
        .tr-row:last-child { border-bottom:none; }
        .tr-row:hover { background:#f8fbf9; }
        .kat-btn { display:flex;align-items:center;gap:7px;padding:9px 20px;border-radius:10px;border:1.5px solid #e4ede6;background:#fff;font-size:14px;font-weight:700;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;transition:all 0.18s;color:#6b7c6b; }
        .kat-btn:hover { border-color:#2d7a4f;color:#2d7a4f;background:#f0faf4; }
        .kat-btn.active { background:#2d7a4f;color:#fff;border-color:#2d7a4f;box-shadow:0 4px 14px rgba(45,122,79,0.25); }
        .card { background:#fff;border:1px solid #e4ede6;border-radius:16px;box-shadow:0 2px 8px rgba(0,0,0,0.04); }
        .sel { border:1.5px solid #e4ede6;border-radius:10px;padding:9px 12px;font-size:13px;font-family:'Plus Jakarta Sans',sans-serif;color:#1f2d1f;background:#fff;outline:none;transition:border-color 0.2s;cursor:pointer; }
        .sel:focus { border-color:#2d7a4f; }
        .sel:disabled { background:#f5f7f4;color:#b5ceba;cursor:not-allowed; }
        .btn-print { display:flex;align-items:center;gap:7px;background:#fff;color:#2d7a4f;border:1.5px solid #b8ddc5;padding:9px 14px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;transition:all 0.2s; }
        .btn-print:hover { background:#e8f5ed; }
        .btn-pdf { display:flex;align-items:center;gap:7px;background:#2d7a4f;color:#fff;border:none;padding:9px 14px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;box-shadow:0 4px 14px rgba(45,122,79,0.25);transition:all 0.2s; }
        .btn-pdf:hover { background:#246240; }
        .section-title { font-size:15px;font-weight:700;color:#1f2d1f; }
        .section-sub   { font-size:12px;color:#9aab9a;margin-top:2px; }
        .badge-green  { background:#e8f5ed;color:#2d7a4f;font-size:11px;font-weight:700;padding:3px 10px;border-radius:50px; }
        .badge-yellow { background:#fef3c7;color:#d97706;font-size:11px;font-weight:700;padding:3px 10px;border-radius:50px; }
        .badge-red    { background:#fee2e2;color:#dc2626;font-size:11px;font-weight:700;padding:3px 10px;border-radius:50px; }
      `}</style>

      {/* ── SECTION TAB ── */}
      <div style={{ display: "flex", gap: 6, background: "#fff", border: "1px solid #e4ede6", borderRadius: 14, padding: 5, width: "fit-content", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        {[
          { id: "data",     label: "Data Balita & Lansia",         icon: Users    },
          { id: "posyandu", label: "Data Posyandu Balita & Lansia", icon: FileText },
        ].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setSection(id)} style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "9px 18px", borderRadius: 10,
            background: section === id ? "#2d7a4f" : "transparent",
            color: section === id ? "#fff" : "#6b7c6b",
            border: "none", cursor: "pointer", fontWeight: 700, fontSize: 14,
            fontFamily: "'Plus Jakarta Sans',sans-serif",
            boxShadow: section === id ? "0 2px 8px rgba(45,122,79,0.25)" : "none",
            transition: "all 0.18s",
          }}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* ══════════ SECTION 1: DATA BALITA & LANSIA ══════════ */}
      {section === "data" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, animation: "fadeIn 0.3s ease" }}>

          {/* Filter kategori */}
          <div className="card" style={{ padding: "18px 22px" }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#3d5542", marginBottom: 12 }}>Pilih Kategori</p>
            <div style={{ display: "flex", gap: 10 }}>
              {[
                { id: "balita", label: "Balita", icon: Baby  },
                { id: "lansia", label: "Lansia", icon: Users },
              ].map(({ id, label, icon: Icon }) => (
                <button key={id}
                  className={`kat-btn ${kategoriData === id ? "active" : ""}`}
                  onClick={() => setKategoriData(id)}>
                  <Icon size={15} /> {label}
                </button>
              ))}
            </div>
          </div>

          {/* Konten data */}
          {!kategoriData
            ? <div className="card"><PilihKategori /></div>
            : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16, animation: "fadeIn 0.3s ease" }}>

                {/* Header aksi */}
                <div className="card" style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                  <div>
                    <p className="section-title">{kategoriData === "balita" ? "Data Balita" : "Data Lansia"}</p>
                    <p className="section-sub">{sortedData.length} data ditemukan</p>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn-print" onClick={() => doPrint(printDataRef, judulData, pagedData, `${kategoriData}-data`)}>
                    <Printer size={14} /> Print
                    </button>
                    <button className="btn-pdf" onClick={() => doPrint(printDataRef, judulData, pagedData, `${kategoriData}-data`)}>
                      <Download size={14} /> Ekspor PDF
                    </button>
                  </div>
                </div>

                {/* Tabel */}
                <div ref={printDataRef} className="card" style={{ overflow: "hidden" }}>
                  {loadingData
                    ? (
                      <div style={{ padding: "44px", textAlign: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, color: "#9aab9a" }}>
                          <div style={{ width: 18, height: 18, border: "2.5px solid #e4ede6", borderTopColor: "#2d7a4f", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                          Memuat data…
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={{ overflowX: "auto" }}>
                          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                            <thead>
                              <tr style={{ background: "#f8fbf9" }}>
                                {(kategoriData === "balita"
                                  ? [
                                      { label: "No",          field: null       },
                                      { label: "NIK",         field: "nik"      },
                                      { label: "Nama Balita", field: "nama"     },
                                      { label: "Nama Ibu",    field: "namaIbu"  },
                                      { label: "Tgl Lahir",   field: "tglLahir" },
                                      { label: "Usia",        field: null       },
                                      { label: "No Telp",     field: "noTelp"   },
                                      { label: "Alamat",      field: "alamat"   },
                                    ]
                                  : [
                                      { label: "No",          field: null       },
                                      { label: "NIK",         field: "nik"      },
                                      { label: "Nama Lansia", field: "nama"     },
                                      { label: "Tgl Lahir",   field: "tglLahir" },
                                      { label: "Usia",        field: null       },
                                      { label: "No Telp",     field: "noTelp"   },
                                      { label: "Alamat",      field: "alamat"   },
                                    ]
                                ).map(({ label, field }) => (
                                  <th key={label} style={{ padding: "11px 14px", textAlign: "left", borderBottom: "1px solid #e4ede6", whiteSpace: "nowrap" }}>
                                    {field
                                      ? <button className="th-btn" onClick={() => toggleSortData(field)}>
                                          {label} <SortIcon field={field} active={sortFieldData === field} asc={sortAscData} />
                                        </button>
                                      : <span style={{ fontSize: 12, fontWeight: 700, color: "#9aab9a" }}>{label}</span>
                                    }
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {pagedData.length === 0 && (
                                <tr><td colSpan={8} style={{ padding: "36px", textAlign: "center", color: "#9aab9a" }}>Belum ada data.</td></tr>
                              )}
                              {pagedData.map((item, i) => (
                                <tr key={item.id} className="tr-row">
                                  <td style={{ padding: "12px 14px", color: "#9aab9a", fontSize: 12 }}>{(pageData - 1) * perPageData + i + 1}</td>
                                  <td style={{ padding: "12px 14px", fontFamily: "monospace", fontSize: 12, color: "#6b7c6b" }}>{item.nik}</td>
                                  <td style={{ padding: "12px 14px", fontWeight: 600, color: "#1f2d1f" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#e8f5ed", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#2d7a4f", flexShrink: 0 }}>
                                        {item.nama?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                                      </div>
                                      {item.nama}
                                    </div>
                                  </td>
                                  {kategoriData === "balita" && (
                                    <td style={{ padding: "12px 14px", color: "#6b7c6b" }}>{item.namaIbu || "-"}</td>
                                  )}
                                  <td style={{ padding: "12px 14px", color: "#6b7c6b", whiteSpace: "nowrap" }}>{formatDate(item.tglLahir)}</td>
                                  <td style={{ padding: "12px 14px", color: "#6b7c6b" }}>{hitungUsia(item.tglLahir)}</td>
                                  <td style={{ padding: "12px 14px", color: "#6b7c6b" }}>{item.noTelp || "-"}</td>
                                  <td style={{ padding: "12px 14px", color: "#6b7c6b", maxWidth: 160 }}>
                                    <span style={{ display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.alamat || "-"}</span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <Pagination
                          page={pageData} totalPage={totalPageData}
                          onPrev={() => setPageData(p => Math.max(1, p - 1))}
                          onNext={() => setPageData(p => Math.min(totalPageData, p + 1))}
                          perPage={perPageData} onPerPage={v => { setPerPageData(v); setPageData(1); }}
                          total={sortedData.length}
                        />
                      </>
                    )
                  }
                </div>
              </div>
            )
          }
        </div>
      )}

      {/* ══════════ SECTION 2: DATA POSYANDU ══════════ */}
      {section === "posyandu" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, animation: "fadeIn 0.3s ease" }}>

          {/* Filter */}
          <div className="card" style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Kategori */}
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#3d5542", marginBottom: 12 }}>Pilih Kategori</p>
              <div style={{ display: "flex", gap: 10 }}>
                {[
                  { id: "balita", label: "Balita", icon: Baby  },
                  { id: "lansia", label: "Lansia", icon: Users },
                ].map(({ id, label, icon: Icon }) => (
                  <button key={id}
                    className={`kat-btn ${kategoriPos === id ? "active" : ""}`}
                    onClick={() => setKategoriPos(id)}>
                    <Icon size={15} /> {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter waktu bertingkat */}
            {kategoriPos && (
              <div style={{ display: "flex", alignItems: "flex-end", gap: 12, flexWrap: "wrap", paddingTop: 4, borderTop: "1px solid #f0f6f2" }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#3d5542", marginBottom: 8 }}>Filter Tahun</p>
                  <select className="sel" value={tahunPilih}
                    onChange={e => { setTahunPilih(e.target.value); setBulanPilih(""); }}
                    style={{ minWidth: 130 }}>
                    <option value="">-- Semua Tahun --</option>
                    {tahunList.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>

                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#3d5542", marginBottom: 8 }}>Filter Bulan</p>
                  <select className="sel" value={bulanPilih} disabled={!tahunPilih}
                    onChange={e => setBulanPilih(e.target.value)}
                    style={{ minWidth: 160 }}>
                    <option value="">-- Pilih Bulan --</option>
                    {BULAN.map((b, idx) => <option key={idx + 1} value={idx + 1}>{b}</option>)}
                  </select>
                </div>

                <button
                  onClick={handleFilterPos}
                  disabled={!tahunPilih || !bulanPilih}
                  style={{ display: "flex", alignItems: "center", gap: 7, background: (!tahunPilih || !bulanPilih) ? "#b5ceba" : "#2d7a4f", color: "#fff", border: "none", padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: (!tahunPilih || !bulanPilih) ? "not-allowed" : "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif", transition: "background 0.2s" }}>
                  <Filter size={14} /> Filter
                </button>

                <button
                  onClick={handleResetFilter}
                  disabled={!tahunPilih && !bulanPilih}
                  style={{ display: "flex", alignItems: "center", gap: 7, background: "#fff", color: (!tahunPilih && !bulanPilih) ? "#b5ceba" : "#2d7a4f", border: `1.5px solid ${(!tahunPilih && !bulanPilih) ? "#e4ede6" : "#b8ddc5"}`, padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: (!tahunPilih && !bulanPilih) ? "not-allowed" : "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif", transition: "all 0.2s" }}>
                  <RotateCcw size={14} /> Reset
                </button>
              </div>
            )}
          </div>

          {/* Konten posyandu */}
          {!kategoriPos
            ? <div className="card"><PilihKategori /></div>
            : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16, animation: "fadeIn 0.3s ease" }}>

                {/* Header aksi */}
                <div className="card" style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                  <div>
                    <p className="section-title">{judulPos}</p>
                    <p className="section-sub">{sortedPos.length} data ditemukan</p>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn-print" onClick={() => doPrint(printPosRef, judulPos, pagedPos, `${kategoriPos}-posyandu`)}>
                      <Printer size={14} /> Print
                    </button>
                    <button className="btn-pdf" onClick={() => doPrint(printPosRef, judulPos, pagedPos, `${kategoriPos}-posyandu`)}>
                      <Download size={14} /> Ekspor PDF
                    </button>
                  </div>
                </div>

                {/* Tabel */}
                <div ref={printPosRef} className="card" style={{ overflow: "hidden" }}>
                  {loadingPos
                    ? (
                      <div style={{ padding: "44px", textAlign: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, color: "#9aab9a" }}>
                          <div style={{ width: 18, height: 18, border: "2.5px solid #e4ede6", borderTopColor: "#2d7a4f", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                          Memuat data…
                        </div>
                      </div>
                    ) : posData.length === 0
                      ? (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 24px", gap: 12 }}>
                          <div style={{ background: "#fef3c7", borderRadius: "50%", padding: 18 }}>
                            <Calendar size={28} color="#d97706" />
                          </div>
                          <p style={{ fontSize: 14, fontWeight: 600, color: "#6b7c6b" }}>Tidak ada data pada periode ini</p>
                        </div>
                      ) : (
                        <>
                          <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                              <thead>
                                <tr style={{ background: "#f8fbf9" }}>
                                  {(kategoriPos === "balita"
                                    ? [
                                        { label: "No",              field: null            },
                                        { label: "Nama Balita",     field: "balitaId"      },
                                        { label: "Kegiatan",        field: "kegiatan"      },
                                        { label: "Tanggal",         field: "tanggal"       },
                                        { label: "BB (kg)",         field: "bb"            },
                                        { label: "TB (cm)",         field: "tb"            },
                                        { label: "Lk. Kepala (cm)", field: "lingkarKepala" },
                                        { label: "Lk. Lengan (cm)", field: "lingkarLengan" },
                                      ]
                                    : [
                                        { label: "No",                 field: null           },
                                        { label: "Nama Lansia",        field: "lansiaId"     },
                                        { label: "Kegiatan",           field: "kegiatan"     },
                                        { label: "Tanggal",            field: "tanggal"      },
                                        { label: "BB (kg)",            field: "bb"           },
                                        { label: "TB (cm)",            field: "tb"           },
                                        { label: "Lk. Perut (cm)",     field: "lingkarPerut" },
                                        { label: "Tensi (mmHg)",       field: "tensi"        },
                                        { label: "Gula Darah (mg/dL)", field: "gulaDarah"    },
                                      ]
                                  ).map(({ label, field }) => (
                                    <th key={label} style={{ padding: "11px 14px", textAlign: "left", borderBottom: "1px solid #e4ede6", whiteSpace: "nowrap" }}>
                                      {field
                                        ? <button className="th-btn" onClick={() => toggleSortPos(field)}>
                                            {label} <SortIcon field={field} active={sortFieldPos === field} asc={sortAscPos} />
                                          </button>
                                        : <span style={{ fontSize: 12, fontWeight: 700, color: "#9aab9a" }}>{label}</span>
                                      }
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>

                                {/* Row balita */}
                                {kategoriPos === "balita" && pagedPos.map((p, i) => (
                                  <tr key={p.id} className="tr-row">
                                    <td style={{ padding: "12px 14px", color: "#9aab9a", fontSize: 12 }}>{(pagePos - 1) * perPagePos + i + 1}</td>
                                    <td style={{ padding: "12px 14px", fontWeight: 600, color: "#1f2d1f" }}>{p.balita?.nama ?? "-"}</td>
                                    <td style={{ padding: "12px 14px", color: "#6b7c6b" }}>{p.kegiatan}</td>
                                    <td style={{ padding: "12px 14px", color: "#6b7c6b", whiteSpace: "nowrap" }}>{formatDate(p.tanggal)}</td>
                                    <td style={{ padding: "12px 14px", fontWeight: 700, color: p.bb && p.bb < 10 ? "#d97706" : "#1f2d1f" }}>{p.bb ?? "-"}</td>
                                    <td style={{ padding: "12px 14px", color: "#1f2d1f" }}>{p.tb ?? "-"}</td>
                                    <td style={{ padding: "12px 14px", color: "#6b7c6b" }}>{p.lingkarKepala ?? "-"}</td>
                                    <td style={{ padding: "12px 14px", color: "#6b7c6b" }}>{p.lingkarLengan ?? "-"}</td>
                                  </tr>
                                ))}

                                {/* Row lansia */}
                                {kategoriPos === "lansia" && pagedPos.map((p, i) => (
                                  <tr key={p.id} className="tr-row">
                                    <td style={{ padding: "12px 14px", color: "#9aab9a", fontSize: 12 }}>{(pagePos - 1) * perPagePos + i + 1}</td>
                                    <td style={{ padding: "12px 14px", fontWeight: 600, color: "#1f2d1f" }}>{p.lansia?.nama ?? "-"}</td>
                                    <td style={{ padding: "12px 14px", color: "#6b7c6b" }}>{p.kegiatan}</td>
                                    <td style={{ padding: "12px 14px", color: "#6b7c6b", whiteSpace: "nowrap" }}>{formatDate(p.tanggal)}</td>
                                    <td style={{ padding: "12px 14px", color: "#1f2d1f" }}>{p.bb ?? "-"}</td>
                                    <td style={{ padding: "12px 14px", color: "#1f2d1f" }}>{p.tb ?? "-"}</td>
                                    <td style={{ padding: "12px 14px", color: "#6b7c6b" }}>{p.lingkarPerut ?? "-"}</td>
                                    <td style={{ padding: "12px 14px", fontWeight: 700, color: p.tensi && p.tensi > 140 ? "#dc2626" : "#1f2d1f" }}>{p.tensi ?? "-"}</td>
                                    <td style={{ padding: "12px 14px", fontWeight: 700, color: p.gulaDarah && p.gulaDarah > 200 ? "#dc2626" : "#1f2d1f" }}>{p.gulaDarah ?? "-"}</td>
                                  </tr>
                                ))}

                              </tbody>
                            </table>
                          </div>
                          <Pagination
                            page={pagePos} totalPage={totalPagePos}
                            onPrev={() => setPagePos(p => Math.max(1, p - 1))}
                            onNext={() => setPagePos(p => Math.min(totalPagePos, p + 1))}
                            perPage={perPagePos} onPerPage={v => { setPerPagePos(v); setPagePos(1); }}
                            total={sortedPos.length}
                          />
                        </>
                      )
                  }
                </div>
              </div>
            )
          }
        </div>
      )}
    </div>
  );
}