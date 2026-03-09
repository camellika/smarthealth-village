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
    <div className="max-w-5xl mx-auto p-6">

      <h1 className="text-3xl font-bold mb-6 text-center">
        Data Balita Baru
      </h1>

      {/* FORM */}
      <div className="bg-white shadow-md rounded-xl p-6 mb-10">

        <h2 className="text-xl font-semibold mb-4">
          Tambah Data Balita
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">

          <div>
            <label className="text-sm font-medium">NIK</label>
            <input
              type="text"
              name="nik"
              value={form.nik}
              onChange={handleChange}
              required
              className="w-full border rounded-lg p-2 mt-1 focus:ring focus:ring-blue-200"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Nama Balita</label>
            <input
              type="text"
              name="nama"
              value={form.nama}
              onChange={handleChange}
              required
              className="w-full border rounded-lg p-2 mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Nama Ibu</label>
            <input
              type="text"
              name="namaIbu"
              value={form.namaIbu}
              onChange={handleChange}
              required
              className="w-full border rounded-lg p-2 mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">No Telp</label>
            <input
              type="text"
              name="noTelp"
              value={form.noTelp}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 mt-1"
            />
          </div>

          <div className="col-span-2">
            <label className="text-sm font-medium">Alamat</label>
            <textarea
              name="alamat"
              value={form.alamat}
              onChange={handleChange}
              required
              className="w-full border rounded-lg p-2 mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Tanggal Lahir</label>
            <input
              type="date"
              name="tglLahir"
              value={form.tglLahir}
              onChange={handleChange}
              required
              className="w-full border rounded-lg p-2 mt-1"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Tambah Balita
            </button>
          </div>

        </form>
      </div>

      {/* TABLE */}
      <div className="bg-white shadow-md rounded-xl p-6">

        <h2 className="text-xl font-semibold mb-4">
          Daftar Balita
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200">

            <thead className="bg-blue-100">
              <tr>
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">NIK</th>
                <th className="p-3 text-left">Nama</th>
                <th className="p-3 text-left">Nama Ibu</th>
                <th className="p-3 text-left">Alamat</th>
                <th className="p-3 text-left">No Telp</th>
                <th className="p-3 text-left">Tanggal Lahir</th>
              </tr>
            </thead>

            <tbody>
              {balitaList.map((balita) => (
                <tr
                  key={balita.id}
                  className="border-t hover:bg-gray-50"
                >
                  <td className="p-3">{balita.id}</td>
                  <td className="p-3">{balita.nik}</td>
                  <td className="p-3">{balita.nama}</td>
                  <td className="p-3">{balita.namaIbu}</td>
                  <td className="p-3">{balita.alamat}</td>
                  <td className="p-3">{balita.noTelp}</td>
                  <td className="p-3">
                    {new Date(balita.tglLahir).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>

      </div>

    </div>
  );
}