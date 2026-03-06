"use client";

import { useState, useEffect } from "react";
import { getBalita, createBalita } from "@/services/balitaService";

export default function BalitaPage() {

  const [balitaList, setBalitaList] = useState([]);

  const [form, setForm] = useState({
    nik: "",
    nama: "",
    namaIbu: "",
    alamat: "",
    noTelp: "",
    tglLahir: ""
  });

  useEffect(() => {
    loadBalita();
  }, []);

  async function loadBalita() {
    const data = await getBalita();
    setBalitaList(data);
  }

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    await createBalita(form);

    setForm({
      nik: "",
      nama: "",
      namaIbu: "",
      alamat: "",
      noTelp: "",
      tglLahir: ""
    });

    loadBalita();
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Data Balita</h1>

      {/* FORM INPUT BALITA */}
      <form onSubmit={handleSubmit}>

        <div>
          <label>NIK</label><br/>
          <input
            type="text"
            name="nik"
            value={form.nik}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Nama Balita</label><br/>
          <input
            type="text"
            name="nama"
            value={form.nama}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Nama Ibu</label><br/>
          <input
            type="text"
            name="namaIbu"
            value={form.namaIbu}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Alamat</label><br/>
          <textarea
            name="alamat"
            value={form.alamat}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>No Telp</label><br/>
          <input
            type="text"
            name="noTelp"
            value={form.noTelp}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Tanggal Lahir</label><br/>
          <input
            type="date"
            name="tglLahir"
            value={form.tglLahir}
            onChange={handleChange}
            required
          />
        </div>

        <br/>

        <button type="submit">Tambah Balita</button>

      </form>

      <hr/>

      {/* TABEL BALITA */}
      <h2>Daftar Balita</h2>

      <table border="1" cellPadding="8">
        <thead>
          <tr className="bg-red-100">
            <th>ID</th>
            <th>NIK</th>
            <th>Nama</th>
            <th>Nama Ibu</th>
            <th>Alamat</th>
            <th>No Telp</th>
            <th>Tanggal Lahir</th>
          </tr>
        </thead>

        <tbody>
          {balitaList.map((balita) => (
            <tr key={balita.id}>
              <td>{balita.id}</td>
              <td>{balita.nik}</td>
              <td>{balita.nama}</td>
              <td>{balita.namaIbu}</td>
              <td>{balita.alamat}</td>
              <td>{balita.noTelp}</td>
              <td>
                {new Date(balita.tglLahir).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}