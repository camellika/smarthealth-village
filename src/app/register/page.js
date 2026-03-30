"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser, searchPendudukByNik } from "@/services/authService";

export default function RegisterPage() {

  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [nik, setNik] = useState("");
  const [namaBalita, setNamaBalita] = useState("");

  const [balitaId, setBalitaId] = useState(null);

  const [results, setResults] = useState([]);

  const [error, setError] = useState("");

  const [lansiaId, setLansiaId] = useState(null);
  

  // =========================
  // SEARCH NIK
  // =========================

  const handleSearchNik = async (value) => {

  setNik(value);
  setNamaBalita("");
  setBalitaId(null);
  setLansiaId(null);

  if (value.length < 3) {
    setResults([]);
    return;
  }

  const data = await searchPendudukByNik(value);
  setResults(data || []);

};

  // =========================
  // PILIH BALITA
  // =========================

  const handleSelectPenduduk = (data) => {

  setNik(data.nik || "");
  setNamaBalita(data.nama || "");

  if (data.type === "balita") {
    setBalitaId(data.id);
    setLansiaId(null);
  } else {
    setLansiaId(data.id);
    setBalitaId(null);
  }

  setResults([]);

};

  // =========================
  // REGISTER
  // =========================

  const handleSubmit = async (e) => {

    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Password tidak sama");
      return;
    }

    if (!balitaId) {
      setError("Silakan pilih NIK dari daftar");
      return;
    }

    try {

      await registerUser({
        username,
        password,
        nik
      });

      alert("Registrasi berhasil");

      router.push("/login");

    } catch (err) {
      setError(err.message);
    }

  };

  return (

    <div style={{
      maxWidth: "400px",
      margin: "50px auto",
      padding: "30px",
      border: "1px solid #ddd",
      borderRadius: "10px"
    }}>

      <h2>Register User</h2>

      {error && (
        <p style={{ color: "red" }}>{error}</p>
      )}

      <form onSubmit={handleSubmit}>

        {/* USERNAME */}
        <div>
          <label>Username</label>
          <input
            type="text"
            value={username || ""}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        {/* PASSWORD */}
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password || ""}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* ULANGI PASSWORD */}
        <div>
          <label>Ulangi Password</label>
          <input
            type="password"
            value={confirmPassword || ""}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        {/* INPUT NIK */}
        <div style={{ position: "relative" }}>
          <label>NIK Balita</label>

          <input
            type="text"
            value={nik || ""}
            onChange={(e) => handleSearchNik(e.target.value)}
            placeholder="Ketik minimal 3 digit"
            required
          />

          {/* DROPDOWN */}
          {results.length > 0 && (

            <ul style={{
              border: "1px solid #ccc",
              listStyle: "none",
              padding: "0",
              margin: "0",
              position: "absolute",
              width: "100%",
              background: "white",
              maxHeight: "150px",
              overflowY: "auto"
            }}>

              {results.map((item) => (
                <li
                  key={item.id}
                  onClick={() => handleSelectPenduduk(item)}
                  style={{
                    padding: "8px",
                    cursor: "pointer"
                  }}
                >
                  {item.nik} - {item.nama}
                </li>
              ))}

            </ul>

          )}

        </div>

        {/* NAMA BALITA */}
        <div>
          <label>Nama Balita</label>
          <input
            type="text"
            value={namaBalita || ""}
            readOnly
          />
        </div>

        <br />

        <button type="submit">
          Register
        </button>

      </form>

    </div>

  );

}