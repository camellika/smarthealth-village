"use client";

import { useEffect, useState } from "react";

import {
  getPosyanduBalita,
  createPosyanduBalita,
  updatePosyanduBalita,
  deletePosyanduBalita
} from "@/services/posyanduBalitaService";

import { getJadwalTerdekat } from "@/services/penjadwalanService";
import { getBalita } from "@/services/balitaService";

export default function PosyanduBalitaPage() {

  const [data, setData] = useState([]);
  const [balitaList, setBalitaList] = useState([]);
  const [jadwalList, setJadwalList] = useState([]);

  const today = new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState({
    kegiatan: "",
    tanggal: today,
    balitaId: "",
    bb: "",
    tb: "",
    lingkarKepala: "",
    lingkarLengan: ""
  });

  const [balitaInput, setBalitaInput] = useState("");
  const [editId, setEditId] = useState(null);

  async function loadData() {
    const res = await getPosyanduBalita();
    setData(res);
  }

  async function loadBalita() {
    const res = await getBalita();
    setBalitaList(res);
  }

  async function loadJadwal() {
    const res = await getJadwalTerdekat();
    setJadwalList(res);
  }

  useEffect(() => {
    loadData();
    loadBalita();
    loadJadwal();
  }, []);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  // pilih jadwal kegiatan
  function handleJadwalChange(e) {
    const jadwalId = e.target.value;

    const jadwal = jadwalList.find(j => j.id === Number(jadwalId));

    if (jadwal) {
      setForm({
        ...form,
        kegiatan: jadwal.kegiatan
      });
    }
  }

  // pilih balita dari datalist
  function handleBalitaChange(e) {

    const value = e.target.value;
    setBalitaInput(value);

    const found = balitaList.find(
      b => `${b.nama} - ${b.nik}` === value
    );

    if (found) {
      setForm({
        ...form,
        balitaId: found.id
      });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (editId) {
      await updatePosyanduBalita(editId, form);
    } else {
      await createPosyanduBalita(form);
    }

    setForm({
      kegiatan: "",
      tanggal: today,
      balitaId: "",
      bb: "",
      tb: "",
      lingkarKepala: "",
      lingkarLengan: ""
    });

    setBalitaInput("");
    setEditId(null);

    loadData();
  }

  function handleEdit(item) {

    const balitaNama =
      item.balita?.nama + " - " + item.balita?.nik;

    setBalitaInput(balitaNama);

    setForm({
      kegiatan: item.kegiatan,
      tanggal: today,
      balitaId: item.balitaId,
      bb: item.bb || "",
      tb: item.tb || "",
      lingkarKepala: item.lingkarKepala || "",
      lingkarLengan: item.lingkarLengan || ""
    });

    setEditId(item.id);
  }

  async function handleDelete(id) {
    if (confirm("Yakin hapus data?")) {
      await deletePosyanduBalita(id);
      loadData();
    }
  }

  return (
    <div className="p-10">

      <h1 className="text-2xl font-bold mb-6">
        Posyandu Balita
      </h1>

      {/* FORM */}

      <form
        onSubmit={handleSubmit}
        className="space-y-3 mb-10"
      >

        {/* PILIH KEGIATAN */}

        <select
          onChange={handleJadwalChange}
          className="border p-2 w-full"
          required
        >
          <option value="">
            Pilih Kegiatan
          </option>

          {jadwalList.map(j => (
            <option key={j.id} value={j.id}>
              {j.kegiatan}
            </option>
          ))}
        </select>


        {/* TANGGAL DEFAULT HARI INI */}

        <input
          type="date"
          value={form.tanggal}
          readOnly
          className="border p-2 w-full bg-gray-100"
        />


        {/* PILIH BALITA (SEARCH + DROPDOWN) */}

        <input
          list="balitaList"
          placeholder="Pilih / Ketik Nama atau NIK Balita"
          value={balitaInput}
          onChange={handleBalitaChange}
          className="border p-2 w-full"
          required
        />

        <datalist id="balitaList">
          {balitaList.map(b => (
            <option
              key={b.id}
              value={`${b.nama} - ${b.nik}`}
            />
          ))}
        </datalist>


        {/* DATA PEMERIKSAAN */}

        <input
          type="number"
          name="bb"
          placeholder="Berat Badan (kg)"
          value={form.bb}
          onChange={handleChange}
          className="border p-2 w-full"
        />

        <input
          type="number"
          name="tb"
          placeholder="Tinggi Badan (cm)"
          value={form.tb}
          onChange={handleChange}
          className="border p-2 w-full"
        />

        <input
          type="number"
          name="lingkarKepala"
          placeholder="Lingkar Kepala"
          value={form.lingkarKepala}
          onChange={handleChange}
          className="border p-2 w-full"
        />

        <input
          type="number"
          name="lingkarLengan"
          placeholder="Lingkar Lengan"
          value={form.lingkarLengan}
          onChange={handleChange}
          className="border p-2 w-full"
        />

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2"
        >
          {editId ? "Update Data" : "Tambah Data"}
        </button>

      </form>


      {/* TABEL DATA */}

      <table className="w-full border">

        <thead className="bg-gray-200">
          <tr>
            <th className="border p-2">Kegiatan</th>
            <th className="border p-2">Tanggal</th>
            <th className="border p-2">Balita</th>
            <th className="border p-2">BB</th>
            <th className="border p-2">TB</th>
            <th className="border p-2">Lingkar Kepala</th>
            <th className="border p-2">Lingkar Lengan</th>
            <th className="border p-2">Aksi</th>
          </tr>
        </thead>

        <tbody>

          {data.map(item => (
            <tr key={item.id}>

              <td className="border p-2">
                {item.kegiatan}
              </td>

              <td className="border p-2">
                {new Date(item.tanggal).toLocaleDateString()}
              </td>

              <td className="border p-2">
                {item.balita?.nama}
              </td>

              <td className="border p-2">{item.bb}</td>
              <td className="border p-2">{item.tb}</td>
              <td className="border p-2">{item.lingkarKepala}</td>
              <td className="border p-2">{item.lingkarLengan}</td>

              <td className="border p-2 space-x-2">

                <button
                  onClick={() => handleEdit(item)}
                  className="bg-yellow-500 text-white px-2 py-1"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="bg-red-500 text-white px-2 py-1"
                >
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