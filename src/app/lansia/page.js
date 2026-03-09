"use client";

import { useEffect, useState } from "react";
import {
  getLansia,
  createLansia,
  updateLansia,
  deleteLansia
} from "@/services/lansiaService";

export default function LansiaPage() {
  const [lansia, setLansia] = useState([]);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    nik: "",
    nama: "",
    alamat: "",
    noTelp: "",
    tglLahir: ""
  });

  const loadData = async () => {
    const data = await getLansia();
    setLansia(data);
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
      await updateLansia(editId, form);
      setEditId(null);
    } else {
      await createLansia(form);
    }

    setForm({
      nik: "",
      nama: "",
      alamat: "",
      noTelp: "",
      tglLahir: ""
    });

    loadData();
  };

    const formatDate = (date) => {
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
      // PERUBAHAN: sebelumnya pakai .split() -> error
      // tglLahir: data.tglLahir.split("T")[0]
      tglLahir: formatDate(data.tglLahir) // PERBAIKAN
    });
  }


   async function handleDelete(id) {
  const confirmDelete = confirm(
    "Apakah Anda yakin ingin menghapus data ini?\n" +
    "Semua riwayat posyandu lansia terkait juga akan terhapus!"
  );

  if (!confirmDelete) return;

  try {
    await deleteLansia(id);
    loadData();
  } catch (err) {
    alert(err.message);
  }
}

  return (
    <div style={{ padding: "20px" }}>
      <h1>Manajemen Data Lansia</h1>

      {/* FORM */}
      <form onSubmit={handleSubmit}>
        <input
          name="nik"
          placeholder="NIK"
          value={form.nik}
          onChange={handleChange}
          required
        />
        <br />

        <input
          name="nama"
          placeholder="Nama"
          value={form.nama}
          onChange={handleChange}
          required
        />
        <br />

        <input
          name="alamat"
          placeholder="Alamat"
          value={form.alamat}
          onChange={handleChange}
          required
        />
        <br />

        <input
          name="noTelp"
          placeholder="No Telp"
          value={form.noTelp}
          onChange={handleChange}
        />
        <br />

        <input
          type="date"
          name="tglLahir"
          value={form.tglLahir}
          onChange={handleChange}
          required
        />
        <br /><br />

        <button type="submit">
          {editId ? "Update Data" : "Tambah Data"}
        </button>
      </form>

      <br />

      {/* TABEL */}
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>NIK</th>
            <th>Nama</th>
            <th>Alamat</th>
            <th>No Telp</th>
            <th>Tgl Lahir</th>
            <th>Aksi</th>
          </tr>
        </thead>

        <tbody>
          {lansia.map((item) => (
            <tr key={item.id}>
              <td>{item.nik}</td>
              <td>{item.nama}</td>
              <td>{item.alamat}</td>
              <td>{item.noTelp}</td>
              <td>{item.tglLahir?.toString().slice(0, 10)}</td>
              <td>
                <button onClick={() => handleEdit(item)}>Edit</button>
                <button onClick={() => handleDelete(item.id)}>
                  Hapus
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}