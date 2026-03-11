"use client";

export default function DashboardPage() {
  return (
    <div
      style={{
        padding: "40px",
        fontFamily: "Arial",
        background: "#f5f7fa",
        minHeight: "100vh"
      }}
    >
      {/* JUDUL */}
      <h1 style={{ textAlign: "center", color: "#2563eb" }}>
        SmartHealth Posyandu
      </h1>

      <p style={{ textAlign: "center", marginTop: "10px", fontSize: "18px" }}>
        Sistem Informasi Pengelolaan Data Posyandu Balita dan Lansia
      </p>

      {/* DESKRIPSI */}
      <div
        style={{
          marginTop: "40px",
          background: "white",
          padding: "25px",
          borderRadius: "10px",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)"
        }}
      >
        <h2>Tentang Aplikasi</h2>

        <p>
          SmartHealth Posyandu adalah sistem informasi yang digunakan untuk
          membantu pengelolaan data kegiatan posyandu secara digital.
          Aplikasi ini mempermudah kader posyandu dalam mencatat,
          mengelola, dan memantau data kesehatan balita serta lansia.
        </p>

        <p>
          Dengan sistem ini, proses pencatatan yang sebelumnya dilakukan
          secara manual dapat dilakukan secara lebih cepat, akurat,
          dan terorganisir.
        </p>
      </div>

      {/* FITUR */}
      <div
        style={{
          marginTop: "30px",
          background: "white",
          padding: "25px",
          borderRadius: "10px",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)"
        }}
      >
        <h2>Fitur Utama Sistem</h2>

        <ul style={{ lineHeight: "30px" }}>
          <li>Manajemen Data Balita</li>
          <li>Manajemen Data Lansia</li>
          <li>Pencatatan Riwayat Posyandu Balita</li>
          <li>Pencatatan Riwayat Posyandu Lansia</li>
          <li>Penjadwalan Kegiatan Posyandu</li>
          <li>Pengelolaan Data Pengguna</li>
        </ul>
      </div>

      {/* INFO */}
      <div
        style={{
          marginTop: "30px",
          background: "white",
          padding: "25px",
          borderRadius: "10px",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)"
        }}
      >
        <h2>Tujuan Sistem</h2>

        <p>
          Tujuan dari pengembangan sistem ini adalah untuk meningkatkan
          efektivitas pengelolaan data kesehatan di posyandu sehingga
          kader dan petugas kesehatan dapat memantau kondisi balita
          dan lansia secara lebih baik.
        </p>
      </div>
    </div>
  );
}