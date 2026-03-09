"use client";

import { useState } from "react";
import { register } from "@/services/authService";

export default function RegisterPage() {

  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    balitaId: "",
    lansiaId: ""
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // validasi password
    if (form.password !== form.confirmPassword) {
      setError("Password dan ulangi password harus sama");
      return;
    }

    try {
      await register({
        username: form.username,
        password: form.password,
        balitaId: form.balitaId || null,
        lansiaId: form.lansiaId || null
      });

      setSuccess("Registrasi berhasil");

      setForm({
        username: "",
        password: "",
        confirmPassword: "",
        balitaId: "",
        lansiaId: ""
      });

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "400px" }}>
      <h1>Registrasi User</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <form onSubmit={handleSubmit}>

        <input
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          required
        />
        <br /><br />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <br /><br />

        {/* ULANGI PASSWORD */}
        <input
          type="password"
          name="confirmPassword"
          placeholder="Ulangi Password"
          value={form.confirmPassword}
          onChange={handleChange}
          required
        />
        <br /><br />

        <input
          type="number"
          name="balitaId"
          placeholder="Balita ID (opsional)"
          value={form.balitaId}
          onChange={handleChange}
        />
        <br /><br />

        <input
          type="number"
          name="lansiaId"
          placeholder="Lansia ID (opsional)"
          value={form.lansiaId}
          onChange={handleChange}
        />
        <br /><br />

        <button type="submit">
          Registrasi
        </button>

      </form>
    </div>
  );
}