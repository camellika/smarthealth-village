"use client";

import { useEffect, useState } from "react";

import {
  getPosyanduLansia,
  createPosyanduLansia,
  updatePosyanduLansia,
  deletePosyanduLansia
} from "@/services/posyanduLansiaService";

import { getJadwalTerdekat } from "@/services/penjadwalanService";
import { getLansia } from "@/services/lansiaService";

export default function PosyanduLansiaPage() {

  const [data, setData] = useState([]);
  const [lansiaList, setLansiaList] = useState([]);
  const [jadwalList, setJadwalList] = useState([]);

  const today = new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState({
    kegiatan: "",
    tanggal: today,
    lansiaId: "",
    bb: "",
    tb: "",
    lingkarPerut: "",
    tensi: "",
    gulaDarah: ""
  });

  const [lansiaInput, setLansiaInput] = useState("");
  const [editId, setEditId] = useState(null);

  async function loadData() {
    const res = await getPosyanduLansia();
    setData(res);
  }

  async function loadLansia() {
    const res = await getLansia();
    setLansiaList(res);
  }

  async function loadJadwal() {
    const res = await getJadwalTerdekat();
    setJadwalList(res);
  }

  useEffect(() => {
    loadData();
    loadLansia();
    loadJadwal();
  }, []);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  // pilih kegiatan
  function handleJadwalChange(e) {

    const jadwalId = e.target.value;

    const jadwal = jadwalList.find(
      j => j.id === Number(jadwalId)
    );

    if (jadwal) {
      setForm({
        ...form,
        kegiatan: jadwal.kegiatan
      });
    }
  }

  // pilih lansia (search + dropdown)
  function handleLansiaChange(e) {

    const value = e.target.value;
    setLansiaInput(value);

    const found = lansiaList.find(
      l => `${l.nama} - ${l.nik}` === value
    );

    if (found) {
      setForm({
        ...form,
        lansiaId: found.id
      });
    }
  }

  async function handleSubmit(e) {

    e.preventDefault();

    if (editId) {
      await updatePosyanduLansia(editId, form);
    } else {
      await createPosyanduLansia(form);
    }

    setForm({
      kegiatan: "",
      tanggal: today,
      lansiaId: "",
      bb: "",
      tb: "",
      lingkarPerut: "",
      tensi: "",
      gulaDarah: ""
    });

    setLansiaInput("");
    setEditId(null);

    loadData();
  }

  function handleEdit(item) {

    const lansiaNama =
      item.lansia?.nama + " - " + item.lansia?.nik;

    setLansiaInput(lansiaNama);

    setForm({
      kegiatan: item.kegiatan,
      tanggal: today,
      lansiaId: item.lansiaId,
      bb: item.bb || "",
      tb: item.tb || "",
      lingkarPerut: item.lingkarPerut || "",
      tensi: item.tensi || "",
      gulaDarah: item.gulaDarah || ""
    });

    setEditId(item.id);
  }

  async function handleDelete(id) {

    if (confirm("Yakin hapus data?")) {

      await deletePosyanduLansia(id);
      loadData();

    }
  }

  return (
    <div className="p-10">

      <h1 className="text-2xl font-bold mb-6">
        Posyandu Lansia
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


        {/* TANGGAL */}

        <input
          type="date"
          value={form.tanggal}
          readOnly
          className="border p-2 w-full bg-gray-100"
        />


        {/* PILIH LANSIA */}

        <input
          list="lansiaList"
          placeholder="Pilih / Ketik Nama atau NIK Lansia"
          value={lansiaInput}
          onChange={handleLansiaChange}
          className="border p-2 w-full"
          required
        />

        <datalist id="lansiaList">

          {lansiaList.map(l => (
            <option
              key={l.id}
              value={`${l.nama} - ${l.nik}`}
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
          name="lingkarPerut"
          placeholder="Lingkar Perut"
          value={form.lingkarPerut}
          onChange={handleChange}
          className="border p-2 w-full"
        />

        <input
          type="number"
          name="tensi"
          placeholder="Tensi"
          value={form.tensi}
          onChange={handleChange}
          className="border p-2 w-full"
        />

        <input
          type="number"
          name="gulaDarah"
          placeholder="Gula Darah"
          value={form.gulaDarah}
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
            <th className="border p-2">Lansia</th>
            <th className="border p-2">BB</th>
            <th className="border p-2">TB</th>
            <th className="border p-2">Lingkar Perut</th>
            <th className="border p-2">Tensi</th>
            <th className="border p-2">Gula Darah</th>
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
                {item.lansia?.nama}
              </td>

              <td className="border p-2">{item.bb}</td>
              <td className="border p-2">{item.tb}</td>
              <td className="border p-2">{item.lingkarPerut}</td>
              <td className="border p-2">{item.tensi}</td>
              <td className="border p-2">{item.gulaDarah}</td>

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