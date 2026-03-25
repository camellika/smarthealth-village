"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/services/authService";

export default function LoginPages() {
  const router = useRouter();

  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form);

      // ✅ REDIRECT BERDASARKAN ROLE
      if (user.role === "admin")     router.push("/admin");      // Kader
      if (user.role === "perangkat") router.push("/perangkat");  // Perangkat Desa
      if (user.role === "user")      router.push("/warga");      // Warga

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%,60%  { transform: translateX(-5px); }
          40%,80%  { transform: translateX(5px); }
        }

        .login-root {
          min-height: 100vh;
          background: linear-gradient(145deg, #e8f5ed 0%, #f0faf4 60%, #d1fae5 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          position: relative;
          overflow: hidden;
        }
        .login-root::before {
          content: '';
          position: fixed;
          top: -140px; right: -140px;
          width: 480px; height: 480px;
          background: radial-gradient(circle, rgba(34,197,94,0.15) 0%, transparent 65%);
          pointer-events: none;
        }
        .login-root::after {
          content: '';
          position: fixed;
          bottom: -100px; left: -100px;
          width: 380px; height: 380px;
          background: radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 65%);
          pointer-events: none;
        }

        .login-card {
          background: #ffffff;
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(20,83,45,0.12), 0 4px 16px rgba(20,83,45,0.07);
          border: 1.5px solid #d1fae5;
          width: 100%;
          max-width: 420px;
          padding: 44px 40px 36px;
          position: relative;
          z-index: 1;
          animation: fadeUp 0.5s ease both;
        }
        .card-accent {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 4px;
          background: linear-gradient(90deg, #16a34a, #22c55e, #4ade80);
          border-radius: 24px 24px 0 0;
        }

        .logo-wrap {
          display: flex;
          align-items: center;
          gap: 11px;
          margin-bottom: 28px;
        }
        .logo-icon {
          width: 46px; height: 46px;
          background: linear-gradient(135deg, #16a34a, #15803d);
          border-radius: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 23px;
          box-shadow: 0 4px 14px rgba(22,163,74,0.3);
          flex-shrink: 0;
        }
        .logo-title {
          font-size: 17px;
          font-weight: 800;
          color: #14532d;
          letter-spacing: -0.3px;
          line-height: 1.2;
        }
        .logo-title span { color: #22c55e; }
        .logo-sub {
          font-size: 11.5px;
          color: #6b9e7e;
          font-weight: 500;
        }

        .login-heading {
          font-size: 24px;
          font-weight: 800;
          color: #1a3328;
          letter-spacing: -0.5px;
          margin-bottom: 6px;
        }
        .login-subheading {
          font-size: 14px;
          color: #6b7c6b;
          margin-bottom: 28px;
          line-height: 1.55;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 16px;
        }
        .form-label {
          font-size: 12.5px;
          font-weight: 700;
          color: #2d6a4f;
          letter-spacing: 0.03em;
          text-transform: uppercase;
        }
        .input-wrap { position: relative; }
        .form-input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #d1fae5;
          border-radius: 12px;
          font-size: 14.5px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: #1a3328;
          background: #f8fffe;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .form-input:focus {
          border-color: #22c55e;
          box-shadow: 0 0 0 3px rgba(34,197,94,0.12);
          background: #ffffff;
        }
        .form-input.has-error {
          border-color: #fca5a5;
          box-shadow: 0 0 0 3px rgba(239,68,68,0.08);
        }
        .form-input::placeholder { color: #a7c4b3; }
        .form-input.has-toggle { padding-right: 44px; }

        .toggle-pw {
          position: absolute;
          right: 13px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none;
          cursor: pointer;
          font-size: 15px;
          padding: 0; display: flex;
          transition: opacity 0.15s;
        }
        .toggle-pw:hover { opacity: 0.7; }

        .error-box {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #fff1f2;
          border: 1.5px solid #fecdd3;
          border-radius: 11px;
          padding: 11px 14px;
          margin-bottom: 16px;
          animation: shake 0.35s ease;
        }
        .error-msg {
          font-size: 13.5px;
          font-weight: 600;
          color: #be123c;
        }

        .btn-submit {
          width: 100%;
          padding: 13px;
          background: linear-gradient(135deg, #16a34a, #15803d);
          color: #ffffff;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 800;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 16px rgba(22,163,74,0.38);
          transition: all 0.2s;
          margin-top: 4px;
        }
        .btn-submit:hover:not(:disabled) {
          background: linear-gradient(135deg, #15803d, #166534);
          transform: translateY(-1px);
          box-shadow: 0 7px 22px rgba(22,163,74,0.45);
        }
        .btn-submit:active:not(:disabled) { transform: translateY(0); }
        .btn-submit:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }

        .spinner {
          width: 17px; height: 17px;
          border: 2.5px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 22px 0 18px;
        }
        .divider-line { flex: 1; height: 1px; background: #e4ede6; }
        .divider-text { font-size: 13px; color: #9aab9a; }

        .register-box {
          text-align: center;
          font-size: 14px;
          color: #6b7c6b;
          background: #f0fdf4;
          border: 1.5px solid #bbf7d0;
          border-radius: 12px;
          padding: 14px;
        }
        .register-link {
          color: #16a34a;
          font-weight: 700;
          text-decoration: none;
          transition: color 0.15s;
        }
        .register-link:hover {
          color: #15803d;
          text-decoration: underline;
        }

        .footer-note {
          text-align: center;
          margin-top: 24px;
          font-size: 12px;
          color: #9aab9a;
          position: relative;
          z-index: 1;
        }
        .footer-note span { color: #16a34a; font-weight: 600; }

        @media (max-width: 480px) {
          .login-card { padding: 36px 24px 28px; }
          .login-heading { font-size: 21px; }
        }
      `}</style>

      <div className="login-root">
        <div className="login-card">
          <div className="card-accent" />

          {/* Logo */}
          <div className="logo-wrap">
            <div className="logo-icon">🏥</div>
            <div>
              <div className="logo-title">
                SmartHealth<span>Village</span>
              </div>
              <div className="logo-sub">Sistem Kesehatan Desa</div>
            </div>
          </div>

          {/* Heading */}
          <h1 className="login-heading">Masuk ke Akun Anda</h1>
          <p className="login-subheading">
            Masukkan username dan kata sandi untuk mengakses dashboard.
          </p>

          {/* Error */}
          {error && (
            <div className="error-box">
              <span style={{ fontSize: 18 }}>⚠️</span>
              <span className="error-msg">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <div className="input-wrap">
                <input
                  className={`form-input ${error ? "has-error" : ""}`}
                  type="text"
                  name="username"
                  placeholder="Masukkan username"
                  value={form.username}
                  onChange={handleChange}
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Kata Sandi</label>
              <div className="input-wrap">
                <input
                  className={`form-input has-toggle ${error ? "has-error" : ""}`}
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Masukkan kata sandi"
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="toggle-pw"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner" />
                  Memproses...
                </>
              ) : (
                "Masuk →"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="divider">
            <div className="divider-line" />
            <span className="divider-text">atau</span>
            <div className="divider-line" />
          </div>

          {/* Register */}
          <div className="register-box">
            Belum punya akun?{" "}
            <Link href="/register" className="register-link">
              Daftar di sini
            </Link>
          </div>
        </div>

        <p className="footer-note">
          © 2025 <span>SmartHealth Village</span> — Menuju Desa Yang Lebih Sehat
        </p>
      </div>
    </>
  );
}