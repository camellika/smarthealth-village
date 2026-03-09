"use client";

import { useEffect, useState } from "react";
import {
  getPenjadwalan,
  createPenjadwalan,
  updatePenjadwalan,
  deletePenjadwalan,
  getJadwalTerdekat
} from "@/services/penjadwalanService";

export default function PenjadwalanPage() {

  const [jadwal, setJadwal] = useState([]);
  const [jadwalTerdekat, setJadwalTerdekat] = useState([]);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    kegiatan: "",
    tanggal: "",
    tempat: ""
  });

  const loadData = async () => {
    const data = await getPenjadwalan();
    const terdekat = await getJadwalTerdekat();

    setJadwal(data);
    setJadwalTerdekat(terdekat);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editId) {
      await updatePenjadwalan(editId, form);
      setEditId(null);
    } else {
      await createPenjadwalan(form);
    }

    setForm({
      kegiatan: "",
      tanggal: "",
      tempat: ""
    });

    loadData();
  };

  // Perbaikan: format tanggal aman
  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const handleEdit = (data) => {
    setEditId(data.id);

    setForm({
      kegiatan: data.kegiatan,
      // PERUBAHAN: gunakan formatDate, bukan split
      // tanggal: data.tanggal.split("T")[0],
      tanggal: formatDate(data.tanggal),
      tempat: data.tempat
    });
  };

  const handleDelete = async (id) => {
    if (confirm("Yakin ingin menghapus jadwal?")) {
      await deletePenjadwalan(id);
      loadData();
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Manajemen Penjadwalan Posyandu</h1>

      {/* FORM TAMBAH / EDIT */}
      <form onSubmit={handleSubmit}>
        <h3>{editId ? "Edit Jadwal" : "Tambah Jadwal"}</h3>

        <input
          name="kegiatan"
          placeholder="Nama Kegiatan"
          value={form.kegiatan}
          onChange={handleChange}
          required
        />
        <br />

        <input
          type="date"
          name="tanggal"
          value={form.tanggal}
          onChange={handleChange}
          required
        />
        <br />

        <input
          name="tempat"
          placeholder="Tempat"
          value={form.tempat}
          onChange={handleChange}
          required
        />
        <br /><br />

        <button type="submit">
          {editId ? "Update Jadwal" : "Tambah Jadwal"}
        </button>
      </form>

      <br /><br />

      {/* JADWAL TERDEKAT */}
      <h2>Jadwal Terdekat</h2>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Kegiatan</th>
            <th>Tanggal</th>
            <th>Tempat</th>
          </tr>
        </thead>

        <tbody>
          {jadwalTerdekat.map((item) => (
            <tr key={item.id}>
              <td>{item.kegiatan}</td>
              <td>{formatDate(item.tanggal)}</td>
              <td>{item.tempat}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <br /><br />

      {/* SEMUA JADWAL */}
      <h2>Semua Jadwal</h2>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Kegiatan</th>
            <th>Tanggal</th>
            <th>Tempat</th>
            <th>Aksi</th>
          </tr>
        </thead>

        <tbody>
          {jadwal.map((item) => (
            <tr key={item.id}>
              <td>{item.kegiatan}</td>
              <td>{formatDate(item.tanggal)}</td>
              <td>{item.tempat}</td>
              <td>
                <button onClick={() => handleEdit(item)}>Edit</button>
                <button onClick={() => handleDelete(item.id)}>Hapus</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}