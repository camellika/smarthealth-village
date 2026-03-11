"use client";

import { useEffect, useState } from "react";
import {
  getLansia,
  createLansia,
  updateLansia,
  deleteLansia,
} from "@/services/lansiaService";

export default function LansiaPage() {
  const [lansia, setLansia] = useState([]);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [form, setForm] = useState({
    nik: "",
    nama: "",
    alamat: "",
    noTelp: "",
    tglLahir: "",
  });

  const loadData = async () => {
    setIsLoading(true);
    const data = await getLansia();
    setLansia(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    if (editId) {
      await updateLansia(editId, form);
      setEditId(null);
    } else {
      await createLansia(form);
    }
    setForm({ nik: "", nama: "", alamat: "", noTelp: "", tglLahir: "" });
    setShowForm(false);
    await loadData();
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatDateInput = (date) => {
    if (!date) return "";
    return new Date(date).toISOString().slice(0, 10);
  };

  function handleEdit(data) {
    setEditId(data.id);
    setForm({
      nik: data.nik,
      nama: data.nama,
      alamat: data.alamat,
      noTelp: data.noTelp || "",
      tglLahir: formatDateInput(data.tglLahir),
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    setDeleteConfirm(null);
    setIsLoading(true);
    try {
      await deleteLansia(id);
      await loadData();
    } catch (err) {
      alert(err.message);
      setIsLoading(false);
    }
  }

  const handleCancelForm = () => {
    setShowForm(false);
    setEditId(null);
    setForm({ nik: "", nama: "", alamat: "", noTelp: "", tglLahir: "" });
  };

  const filteredLansia = lansia.filter(
    (item) =>
      item.nama?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nik?.includes(searchQuery) ||
      item.alamat?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=DM+Serif+Display:ital@0;1&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .lansia-root {
          min-height: 100vh;
          background: #f0faf4;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: #1a3328;
          padding: 0;
          position: relative;
          overflow-x: hidden;
        }

        /* === BACKGROUND DECORATIONS === */
        .lansia-root::before {
          content: '';
          position: fixed;
          top: -120px;
          right: -120px;
          width: 420px;
          height: 420px;
          background: radial-gradient(circle, rgba(34,197,94,0.15) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }
        .lansia-root::after {
          content: '';
          position: fixed;
          bottom: -80px;
          left: -80px;
          width: 320px;
          height: 320px;
          background: radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        /* === HEADER === */
        .page-header {
          background: linear-gradient(135deg, #14532d 0%, #166534 50%, #15803d 100%);
          padding: 36px 40px 28px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(20,83,45,0.35);
        }
        .page-header::before {
          content: '';
          position: absolute;
          top: -60px; right: -60px;
          width: 260px; height: 260px;
          border-radius: 50%;
          background: rgba(255,255,255,0.06);
        }
        .page-header::after {
          content: '';
          position: absolute;
          bottom: -40px; left: 30%;
          width: 180px; height: 180px;
          border-radius: 50%;
          background: rgba(255,255,255,0.04);
        }
        .header-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.25);
          border-radius: 20px;
          padding: 4px 14px;
          font-size: 12px;
          color: #bbf7d0;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 12px;
        }
        .header-title {
          font-family: 'DM Serif Display', serif;
          font-size: 2.4rem;
          color: #ffffff;
          line-height: 1.1;
          margin-bottom: 6px;
        }
        .header-subtitle {
          font-size: 14px;
          color: rgba(187,247,208,0.85);
          font-weight: 400;
        }
        .header-stats {
          display: flex;
          gap: 20px;
          margin-top: 20px;
        }
        .stat-chip {
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 10px;
          padding: 8px 16px;
          display: flex;
          flex-direction: column;
        }
        .stat-chip-num {
          font-size: 1.4rem;
          font-weight: 700;
          color: #ffffff;
          line-height: 1;
        }
        .stat-chip-label {
          font-size: 11px;
          color: #bbf7d0;
          font-weight: 500;
          margin-top: 2px;
        }

        /* === MAIN CONTENT === */
        .page-body {
          padding: 32px 40px;
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        /* === TOOLBAR === */
        .toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        .search-wrap {
          position: relative;
          flex: 1;
          min-width: 220px;
          max-width: 380px;
        }
        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #6b9e7e;
          font-size: 16px;
          pointer-events: none;
        }
        .search-input {
          width: 100%;
          background: #ffffff;
          border: 2px solid #bbf7d0;
          border-radius: 12px;
          padding: 10px 16px 10px 40px;
          font-size: 14px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: #1a3328;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .search-input:focus {
          border-color: #22c55e;
          box-shadow: 0 0 0 3px rgba(34,197,94,0.12);
        }
        .search-input::placeholder { color: #9bc4ac; }

        .btn-tambah {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #16a34a, #15803d);
          color: #ffffff;
          border: none;
          border-radius: 12px;
          padding: 11px 22px;
          font-size: 14px;
          font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(22,163,74,0.4);
          transition: all 0.2s;
          white-space: nowrap;
        }
        .btn-tambah:hover {
          background: linear-gradient(135deg, #15803d, #166534);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(22,163,74,0.5);
        }
        .btn-tambah:active { transform: translateY(0); }
        .btn-tambah-icon {
          width: 20px; height: 20px;
          background: rgba(255,255,255,0.25);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: 300;
          line-height: 1;
        }

        /* === MODAL OVERLAY (FORM) === */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(10,40,20,0.55);
          backdrop-filter: blur(4px);
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .modal-card {
          background: #ffffff;
          border-radius: 20px;
          padding: 36px;
          width: 100%;
          max-width: 520px;
          box-shadow: 0 30px 80px rgba(10,40,20,0.35);
          animation: slideUp 0.25s ease;
          position: relative;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 28px;
        }
        .modal-title-wrap {}
        .modal-eyebrow {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #22c55e;
          margin-bottom: 4px;
        }
        .modal-title {
          font-family: 'DM Serif Display', serif;
          font-size: 1.6rem;
          color: #14532d;
        }
        .modal-close {
          background: #f0fdf4;
          border: none;
          border-radius: 10px;
          width: 36px; height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #6b9e7e;
          font-size: 18px;
          transition: all 0.15s;
          flex-shrink: 0;
          margin-left: 12px;
        }
        .modal-close:hover {
          background: #dcfce7;
          color: #166534;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .form-group.full { grid-column: 1 / -1; }
        .form-label {
          font-size: 12px;
          font-weight: 700;
          color: #2d6a4f;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .form-input {
          background: #f8fffe;
          border: 2px solid #d1fae5;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 14px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: #1a3328;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          width: 100%;
        }
        .form-input:focus {
          border-color: #22c55e;
          box-shadow: 0 0 0 3px rgba(34,197,94,0.12);
          background: #ffffff;
        }
        .form-input::placeholder { color: #a7c4b3; }

        .form-actions {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }
        .btn-submit {
          flex: 1;
          background: linear-gradient(135deg, #16a34a, #15803d);
          color: #ffffff;
          border: none;
          border-radius: 12px;
          padding: 13px;
          font-size: 15px;
          font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(22,163,74,0.35);
          transition: all 0.2s;
        }
        .btn-submit:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(22,163,74,0.45);
        }
        .btn-cancel {
          background: #f0fdf4;
          color: #166534;
          border: 2px solid #bbf7d0;
          border-radius: 12px;
          padding: 13px 20px;
          font-size: 15px;
          font-weight: 600;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-cancel:hover {
          background: #dcfce7;
          border-color: #86efac;
        }

        /* === TABLE CARD === */
        .table-card {
          background: #ffffff;
          border-radius: 20px;
          box-shadow: 0 4px 20px rgba(20,83,45,0.08), 0 1px 4px rgba(20,83,45,0.05);
          overflow: hidden;
          border: 1px solid #dcfce7;
        }
        .table-card-header {
          padding: 20px 28px 16px;
          border-bottom: 1px solid #f0fdf4;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .table-title {
          font-weight: 700;
          font-size: 15px;
          color: #14532d;
        }
        .table-count {
          font-size: 12px;
          color: #6b9e7e;
          background: #f0fdf4;
          border-radius: 8px;
          padding: 3px 10px;
          font-weight: 600;
        }

        .table-wrap {
          overflow-x: auto;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        thead tr {
          background: #f0fdf4;
          border-bottom: 2px solid #bbf7d0;
        }
        th {
          padding: 14px 20px;
          text-align: left;
          font-size: 11px;
          font-weight: 700;
          color: #2d6a4f;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          white-space: nowrap;
        }
        td {
          padding: 14px 20px;
          font-size: 14px;
          color: #374151;
          border-bottom: 1px solid #f0fdf4;
          vertical-align: middle;
        }
        tbody tr:last-child td { border-bottom: none; }
        tbody tr {
          transition: background 0.15s;
        }
        tbody tr:hover { background: #fafffe; }

        .nik-badge {
          display: inline-block;
          background: #ecfdf5;
          border: 1px solid #bbf7d0;
          border-radius: 8px;
          padding: 3px 10px;
          font-size: 12px;
          font-weight: 700;
          color: #15803d;
          letter-spacing: 0.02em;
          font-family: monospace;
        }
        .nama-text {
          font-weight: 600;
          color: #1a3328;
        }
        .alamat-text {
          max-width: 180px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color: #6b7280;
          font-size: 13px;
        }
        .date-text {
          font-size: 13px;
          color: #6b7280;
          white-space: nowrap;
        }
        .notelp-text {
          font-size: 13px;
          color: #6b7280;
          white-space: nowrap;
        }

        /* === ACTION BUTTONS === */
        .action-wrap { display: flex; gap: 8px; }
        .btn-edit {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: #f0fdf4;
          border: 1px solid #86efac;
          color: #16a34a;
          border-radius: 8px;
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 600;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .btn-edit:hover {
          background: #dcfce7;
          border-color: #4ade80;
          color: #15803d;
        }
        .btn-delete {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: #fff1f2;
          border: 1px solid #fecdd3;
          color: #e11d48;
          border-radius: 8px;
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 600;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .btn-delete:hover {
          background: #ffe4e6;
          border-color: #fda4af;
          color: #be123c;
        }

        /* === EMPTY STATE === */
        .empty-state {
          text-align: center;
          padding: 64px 20px;
        }
        .empty-icon {
          font-size: 52px;
          margin-bottom: 16px;
          display: block;
          opacity: 0.5;
        }
        .empty-title {
          font-weight: 700;
          color: #2d6a4f;
          margin-bottom: 6px;
          font-size: 16px;
        }
        .empty-sub {
          font-size: 13px;
          color: #9bc4ac;
        }

        /* === LOADING === */
        .loading-overlay {
          position: fixed;
          inset: 0;
          background: rgba(240,250,244,0.7);
          z-index: 200;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .spinner {
          width: 44px; height: 44px;
          border: 4px solid #bbf7d0;
          border-top-color: #16a34a;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* === DELETE CONFIRM MODAL === */
        .confirm-modal {
          background: #ffffff;
          border-radius: 20px;
          padding: 32px;
          max-width: 400px;
          width: 100%;
          box-shadow: 0 30px 80px rgba(10,40,20,0.35);
          animation: slideUp 0.25s ease;
          text-align: center;
        }
        .confirm-icon {
          width: 60px; height: 60px;
          background: #fff1f2;
          border-radius: 50%;
          margin: 0 auto 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
        }
        .confirm-title {
          font-family: 'DM Serif Display', serif;
          font-size: 1.4rem;
          color: #1a3328;
          margin-bottom: 8px;
        }
        .confirm-text {
          font-size: 13px;
          color: #6b7280;
          line-height: 1.6;
          margin-bottom: 24px;
        }
        .confirm-actions {
          display: flex;
          gap: 10px;
        }
        .btn-confirm-cancel {
          flex: 1;
          background: #f9fafb;
          color: #374151;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 11px;
          font-size: 14px;
          font-weight: 600;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer;
          transition: all 0.15s;
        }
        .btn-confirm-cancel:hover { background: #f3f4f6; }
        .btn-confirm-delete {
          flex: 1;
          background: linear-gradient(135deg, #e11d48, #be123c);
          color: #ffffff;
          border: none;
          border-radius: 12px;
          padding: 11px;
          font-size: 14px;
          font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(225,29,72,0.35);
          transition: all 0.15s;
        }
        .btn-confirm-delete:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(225,29,72,0.45);
        }

        @media (max-width: 640px) {
          .page-header { padding: 28px 20px 20px; }
          .page-body { padding: 20px 16px; }
          .header-title { font-size: 1.8rem; }
          .form-grid { grid-template-columns: 1fr; }
          .toolbar { flex-direction: column; align-items: stretch; }
          .search-wrap { max-width: 100%; }
          .table-card-header { padding: 16px 16px 12px; }
          th, td { padding: 12px 12px; }
        }
      `}</style>

      <div className="lansia-root">
        {/* LOADING */}
        {isLoading && (
          <div className="loading-overlay">
            <div className="spinner" />
          </div>
        )}

        {/* HEADER */}
        <div className="page-header">
          <div className="header-badge">
            <span>🏥</span> Posyandu Lansia
          </div>
          <h1 className="header-title">Manajemen Data Lansia</h1>
          <p className="header-subtitle">
            Kelola data warga lansia dengan mudah dan terstruktur
          </p>
          <div className="header-stats">
            <div className="stat-chip">
              <span className="stat-chip-num">{lansia.length}</span>
              <span className="stat-chip-label">Total Lansia</span>
            </div>
            <div className="stat-chip">
              <span className="stat-chip-num">{filteredLansia.length}</span>
              <span className="stat-chip-label">Ditampilkan</span>
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="page-body">
          {/* TOOLBAR */}
          <div className="toolbar">
            <div className="search-wrap">
              <span className="search-icon">🔍</span>
              <input
                className="search-input"
                placeholder="Cari nama, NIK, atau alamat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="btn-tambah" onClick={() => setShowForm(true)}>
              <span className="btn-tambah-icon">+</span>
              Tambah Data Lansia
            </button>
          </div>

          {/* TABLE */}
          <div className="table-card">
            <div className="table-card-header">
              <span className="table-title">Daftar Data Lansia</span>
              <span className="table-count">{filteredLansia.length} data</span>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>NIK</th>
                    <th>Nama Lengkap</th>
                    <th>Alamat</th>
                    <th>No. Telepon</th>
                    <th>Tgl Lahir</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLansia.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <div className="empty-state">
                          <span className="empty-icon">👴</span>
                          <p className="empty-title">
                            {searchQuery
                              ? "Data tidak ditemukan"
                              : "Belum ada data lansia"}
                          </p>
                          <p className="empty-sub">
                            {searchQuery
                              ? "Coba kata kunci lain"
                              : "Klik tombol Tambah Data Lansia untuk mulai"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredLansia.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <span className="nik-badge">{item.nik}</span>
                        </td>
                        <td className="nama-text">{item.nama}</td>
                        <td>
                          <span
                            className="alamat-text"
                            title={item.alamat}
                          >
                            {item.alamat}
                          </span>
                        </td>
                        <td className="notelp-text">
                          {item.noTelp || (
                            <span style={{ color: "#d1d5db" }}>—</span>
                          )}
                        </td>
                        <td className="date-text">
                          {formatDate(item.tglLahir)}
                        </td>
                        <td>
                          <div className="action-wrap">
                            <button
                              className="btn-edit"
                              onClick={() => handleEdit(item)}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              className="btn-delete"
                              onClick={() => setDeleteConfirm(item.id)}
                            >
                              🗑️ Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* FORM MODAL */}
        {showForm && (
          <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) handleCancelForm(); }}>
            <div className="modal-card">
              <div className="modal-header">
                <div className="modal-title-wrap">
                  <p className="modal-eyebrow">
                    {editId ? "Edit Data" : "Tambah Baru"}
                  </p>
                  <h2 className="modal-title">
                    {editId ? "Perbarui Data Lansia" : "Data Lansia Baru"}
                  </h2>
                </div>
                <button className="modal-close" onClick={handleCancelForm}>✕</button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group full">
                    <label className="form-label">NIK *</label>
                    <input
                      className="form-input"
                      name="nik"
                      placeholder="Masukkan NIK (16 digit)"
                      value={form.nik}
                      onChange={handleChange}
                      required
                      maxLength={16}
                    />
                  </div>

                  <div className="form-group full">
                    <label className="form-label">Nama Lengkap *</label>
                    <input
                      className="form-input"
                      name="nama"
                      placeholder="Masukkan nama lengkap"
                      value={form.nama}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group full">
                    <label className="form-label">Alamat *</label>
                    <input
                      className="form-input"
                      name="alamat"
                      placeholder="Masukkan alamat lengkap"
                      value={form.alamat}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">No. Telepon</label>
                    <input
                      className="form-input"
                      name="noTelp"
                      placeholder="08xx-xxxx-xxxx"
                      value={form.noTelp}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tanggal Lahir *</label>
                    <input
                      className="form-input"
                      type="date"
                      name="tglLahir"
                      value={form.tglLahir}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-cancel" onClick={handleCancelForm}>
                    Batal
                  </button>
                  <button type="submit" className="btn-submit">
                    {editId ? "💾 Simpan Perubahan" : "✅ Tambah Data"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* DELETE CONFIRM MODAL */}
        {deleteConfirm && (
          <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setDeleteConfirm(null); }}>
            <div className="confirm-modal">
              <div className="confirm-icon">⚠️</div>
              <h2 className="confirm-title">Hapus Data?</h2>
              <p className="confirm-text">
                Apakah Anda yakin ingin menghapus data ini?
                <br />
                <strong>Semua riwayat posyandu lansia terkait juga akan terhapus!</strong>
              </p>
              <div className="confirm-actions">
                <button className="btn-confirm-cancel" onClick={() => setDeleteConfirm(null)}>
                  Batal
                </button>
                <button className="btn-confirm-delete" onClick={() => handleDelete(deleteConfirm)}>
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}