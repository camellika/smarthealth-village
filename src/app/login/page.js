"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/services/authService";

export default function LoginPage() {

  const router = useRouter();

  const [form, setForm] = useState({
    username: "",
    password: ""
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {

      const user = await login(form);
      console.log(user)

      // simpan ke localStorage
      localStorage.setItem("user", JSON.stringify(user));

      // redirect sesuai role
      if (user.role === "user") {
        router.push("/dashboard");
      }

      if (user.role === "balita") {
        router.push("/dashboard-balita");
      }

      if (user.role === "lansia") {
        router.push("/dashboard-lansia");
      }

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "#f3f4f6"
      }}
    >

      <div
        style={{
          background: "white",
          padding: "30px",
          borderRadius: "10px",
          width: "350px",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)"
        }}
      >

        <h2 style={{ textAlign: "center" }}>
          Login SmartHealth
        </h2>

        <form onSubmit={handleSubmit}>

          <label>Username</label>
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
          />

          {error && (
            <p style={{ color: "red" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "10px",
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "5px"
            }}
          >
            Login
          </button>

        </form>

      </div>
    </div>
  );
}