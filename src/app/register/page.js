"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser, searchPendudukByNik } from "@/services/authService";
import {
  HeartPulse, User, Lock, Eye, EyeOff, Search,
  CheckCircle2, ChevronRight, ArrowRight, Baby, Users
} from "lucide-react";

export default function RegisterPage() {
  const [username, setUsername]               = useState("");
  const [password, setPassword]               = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [nik, setNik]                   = useState("");
  const [namaPenduduk, setNamaPenduduk] = useState("");
  const [tipe, setTipe]                 = useState(null);   // "balita" | "lansia" | null
  const [balitaId, setBalitaId]         = useState(null);
  const [lansiaId, setLansiaId]         = useState(null);

  const [results, setResults] = useState([]);
  const [error, setError]     = useState("");

  const [showPassword, setShowPassword]               = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focused, setFocused]     = useState(null);
  const router = useRouter();

  // ─────────────────────────────────────────
  // SEARCH NIK
  // ─────────────────────────────────────────
  const handleSearchNik = async (value) => {
    setNik(value);
    setNamaPenduduk("");
    setTipe(null);
    setBalitaId(null);
    setLansiaId(null);

    if (value.length < 3) { setResults([]); return; }
    const data = await searchPendudukByNik(value);
    setResults(data || []);
  };

  // ─────────────────────────────────────────
  // PILIH PENDUDUK
  // ─────────────────────────────────────────
  const handleSelectPenduduk = (item) => {
    setNik(item.nik || "");
    setNamaPenduduk(item.nama || "");
    setTipe(item.tipe);
    if (item.tipe === "balita") { setBalitaId(item.id); setLansiaId(null); }
    else if (item.tipe === "lansia") { setLansiaId(item.id); setBalitaId(null); }
    setResults([]);
  };

  // ─────────────────────────────────────────
  // REGISTER
  // ─────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) { setError("Password tidak sama"); return; }
    if (!balitaId && !lansiaId)       { setError("Silakan pilih NIK dari daftar"); return; }

    setIsLoading(true);
    try {
      await registerUser({
        username,
        password,
        balitaId: balitaId ?? null,
        lansiaId: lansiaId ?? null,
      });
      alert("Registrasi berhasil");
      router.push("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ─────────────────────────────────────────
  // HELPERS UI
  // ─────────────────────────────────────────
  const inputStyle = (name) => ({
    width: "100%",
    padding: "13px 16px",
    paddingLeft: "44px",
    border: `1.5px solid ${focused === name ? "#2d7a4f" : "#d8e8da"}`,
    borderRadius: 12,
    fontSize: 14,
    color: "#1a2e1a",
    background: focused === name ? "#f5fdf7" : "#fff",
    outline: "none",
    transition: "all 0.2s",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    boxShadow: focused === name ? "0 0 0 3px rgba(45,122,79,0.12)" : "none",
  });

  const tipeConfig = {
    balita: { label:"Balita", icon:Baby,  bg:"#e8f5ed", color:"#2d7a4f", border:"#b8ddc5" },
    lansia: { label:"Lansia", icon:Users, bg:"#fff7ed", color:"#d97706", border:"#fcd9a0" },
  };

  const labelStyle = {
    display: "block",
    fontSize: 12,
    fontWeight: 700,
    color: "#4a6b50",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: ".5px",
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(145deg, #e8f5ec 0%, #d4edda 50%, #e2f0e6 100%)",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      color: "#1a2e1a",
      display: "flex",
      flexDirection: "column",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes slide-up  { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fade-in   { from{opacity:0} to{opacity:1} }
        @keyframes spin      { to{transform:rotate(360deg)} }
        @keyframes tipe-pop  { 0%{opacity:0;transform:scale(.94)} 100%{opacity:1;transform:scale(1)} }

        .register-card { animation: slide-up .55s cubic-bezier(.22,1,.36,1) both; }

        .field-row { animation: slide-up .5s ease both; opacity:0; animation-fill-mode:forwards; }
        .field-row:nth-child(1){animation-delay:.05s}
        .field-row:nth-child(2){animation-delay:.10s}
        .field-row:nth-child(3){animation-delay:.15s}
        .field-row:nth-child(4){animation-delay:.20s}
        .field-row:nth-child(5){animation-delay:.25s}
        .field-row:nth-child(6){animation-delay:.30s}
        .field-row:nth-child(7){animation-delay:.35s}

        .result-item:hover { background:#edf5ef!important; }

        .btn-register {
          width:100%; padding:14px;
          background:#2d7a4f; color:white; border:none;
          border-radius:12px; font-size:15px; font-weight:700;
          cursor:pointer; font-family:'Plus Jakarta Sans',sans-serif;
          display:flex; align-items:center; justify-content:center; gap:8px;
          transition:all .22s;
          box-shadow:0 4px 18px rgba(45,122,79,.35);
          letter-spacing:-.2px;
        }
        .btn-register:hover:not(:disabled){
          background:#246240;
          transform:translateY(-1px);
          box-shadow:0 8px 28px rgba(45,122,79,.42);
        }
        .btn-register:disabled{ opacity:.7; cursor:not-allowed; }

        .spinner{ width:18px;height:18px;border:2.5px solid rgba(255,255,255,.4);border-top-color:white;border-radius:50%;animation:spin .7s linear infinite; }
        .eye-btn{ position:absolute;right:14px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;padding:2px;color:#9aab9a;transition:color .2s;display:flex; }
        .eye-btn:hover{ color:#2d7a4f; }
        .tipe-badge{ animation:tipe-pop .25s ease both; }

        .divider { display:flex;align-items:center;gap:12;margin:20px 0; }
        .divider hr { flex:1;border:none;border-top:1px solid #d4e4d6; }
      `}</style>

      {/* ── MAIN ── */}
      <main style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 16px" }}>
        <div className="register-card" style={{
          width: "100%",
          maxWidth: 480,
          background: "#fff",
          borderRadius: 24,
          boxShadow: "0 20px 60px rgba(45,122,79,.14), 0 2px 8px rgba(0,0,0,.06)",
          overflow: "hidden",
        }}>

          {/* Green top bar */}
          <div style={{ height: 5, background: "linear-gradient(90deg,#2d7a4f,#3a9e6e)" }}/>

          <div style={{ padding: "36px 40px 40px" }}>

            {/* Logo */}
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:28 }}>
              <div style={{ background:"#2d7a4f", borderRadius:12, padding:"9px 10px", display:"flex", boxShadow:"0 4px 12px rgba(45,122,79,.3)" }}>
                <HeartPulse size={18} color="white"/>
              </div>
              <div>
                <div style={{ fontWeight:800, fontSize:16, color:"#1a2e1a", letterSpacing:-.3 }}>
                  SmartHealth<span style={{ color:"#2d7a4f" }}>Village</span>
                </div>
              </div>
            </div>

            {/* Heading */}
            <h1 style={{ fontSize:22, fontWeight:800, color:"#1a2e1a", letterSpacing:-.5, marginBottom:6 }}>
              Buat Akun Baru
            </h1>
            <p style={{ color:"#6b8c6b", fontSize:14, marginBottom:28, lineHeight:1.6 }}>
              Lengkapi data berikut untuk mendaftarkan akun Anda.
            </p>

            {/* Error */}
            {error && (
              <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:10, padding:"11px 14px", marginBottom:20, display:"flex", alignItems:"center", gap:10, animation:"fade-in .3s ease" }}>
                <div style={{ width:7, height:7, borderRadius:"50%", background:"#dc2626", flexShrink:0 }}/>
                <span style={{ color:"#dc2626", fontSize:13, fontWeight:500 }}>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:16 }}>

              {/* USERNAME */}
              <div className="field-row">
                <label style={labelStyle}>Username</label>
                <div style={{ position:"relative" }}>
                  <User size={16} color={focused==="username"?"#2d7a4f":"#b0c8b0"} style={{ position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",transition:"color .2s" }}/>
                  <input type="text" value={username} onChange={(e)=>setUsername(e.target.value)}
                    onFocus={()=>setFocused("username")} onBlur={()=>setFocused(null)}
                    placeholder="Masukkan username" required style={inputStyle("username")}/>
                </div>
              </div>

              {/* PASSWORD */}
              <div className="field-row">
                <label style={labelStyle}>Kata Sandi</label>
                <div style={{ position:"relative" }}>
                  <Lock size={16} color={focused==="password"?"#2d7a4f":"#b0c8b0"} style={{ position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",transition:"color .2s" }}/>
                  <input type={showPassword?"text":"password"} value={password} onChange={(e)=>setPassword(e.target.value)}
                    onFocus={()=>setFocused("password")} onBlur={()=>setFocused(null)}
                    placeholder="Buat kata sandi" required style={{ ...inputStyle("password"), paddingRight:44 }}/>
                  <button type="button" className="eye-btn" onClick={()=>setShowPassword(!showPassword)}>
                    {showPassword?<EyeOff size={16}/>:<Eye size={16}/>}
                  </button>
                </div>
              </div>

              {/* CONFIRM PASSWORD */}
              <div className="field-row">
                <label style={labelStyle}>Ulangi Kata Sandi</label>
                <div style={{ position:"relative" }}>
                  <Lock size={16} color={focused==="confirm"?"#2d7a4f":"#b0c8b0"} style={{ position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",transition:"color .2s" }}/>
                  <input type={showConfirmPassword?"text":"password"} value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)}
                    onFocus={()=>setFocused("confirm")} onBlur={()=>setFocused(null)}
                    placeholder="Ulangi kata sandi" required
                    style={{
                      ...inputStyle("confirm"), paddingRight:44,
                      borderColor: confirmPassword && password!==confirmPassword ? "#dc2626" : focused==="confirm" ? "#2d7a4f" : "#d8e8da",
                      boxShadow:   confirmPassword && password!==confirmPassword ? "0 0 0 3px rgba(220,38,38,.1)" : focused==="confirm" ? "0 0 0 3px rgba(45,122,79,.12)" : "none",
                    }}/>
                  <button type="button" className="eye-btn" onClick={()=>setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword?<EyeOff size={16}/>:<Eye size={16}/>}
                  </button>
                </div>
                {confirmPassword && password!==confirmPassword && (
                  <p style={{ color:"#dc2626", fontSize:12, marginTop:5, fontWeight:500 }}>Password tidak cocok</p>
                )}
              </div>

              {/* NIK */}
              <div className="field-row" style={{ position:"relative", zIndex:100 }}>
                <label style={labelStyle}>
                  NIK
                  <span style={{ color:"#9aab9a", fontWeight:500, marginLeft:6, fontSize:11, textTransform:"none", letterSpacing:0 }}>— balita atau lansia, ketik minimal 3 digit</span>
                </label>
                <div style={{ position:"relative" }}>
                  <Search size={16} color={focused==="nik"?"#2d7a4f":"#b0c8b0"} style={{ position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",transition:"color .2s" }}/>
                  <input type="text" value={nik} onChange={(e)=>handleSearchNik(e.target.value)}
                    onFocus={()=>setFocused("nik")} onBlur={()=>setTimeout(()=>setFocused(null),150)}
                    placeholder="Cari berdasarkan NIK..." required style={inputStyle("nik")}/>
                  {(balitaId||lansiaId) && (
                    <CheckCircle2 size={16} color="#2d7a4f" style={{ position:"absolute",right:14,top:"50%",transform:"translateY(-50%)" }}/>
                  )}
                </div>

                {/* DROPDOWN */}
                {results.length > 0 && (
                  <ul style={{ position:"absolute",width:"100%",zIndex:999,background:"#fff",border:"1.5px solid #d8e8da",borderRadius:12,marginTop:6,padding:"6px 0",listStyle:"none",boxShadow:"0 8px 28px rgba(0,0,0,.10)",maxHeight:200,overflowY:"auto",animation:"fade-in .15s ease" }}>
                    {results.map((item) => {
                      const cfg = tipeConfig[item.tipe];
                      const Icon = cfg.icon;
                      return (
                        <li key={`${item.tipe}-${item.id}`} className="result-item"
                          onMouseDown={()=>handleSelectPenduduk(item)}
                          style={{ padding:"10px 16px",cursor:"pointer",fontSize:13,color:"#1a2e1a",display:"flex",gap:10,alignItems:"center",transition:"background .15s" }}>
                          <div style={{ width:30,height:30,borderRadius:9,background:cfg.bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                            <Icon size={14} color={cfg.color}/>
                          </div>
                          <div style={{ flex:1 }}>
                            <div style={{ fontWeight:600 }}>{item.nama}</div>
                            <div style={{ color:"#9aab9a",fontSize:11 }}>{item.nik}</div>
                          </div>
                          <span style={{ fontSize:11,fontWeight:700,color:cfg.color,background:cfg.bg,border:`1px solid ${cfg.border}`,borderRadius:20,padding:"2px 9px",flexShrink:0 }}>
                            {cfg.label}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* NAMA */}
              <div className="field-row">
                <label style={labelStyle}>Nama</label>
                <div style={{ position:"relative" }}>
                  <User size={16} color="#c8d8c8" style={{ position:"absolute",left:14,top:"50%",transform:"translateY(-50%)" }}/>
                  <div style={{ width:"100%",padding:"13px 16px 13px 44px",border:"1.5px solid #e4ede6",borderRadius:12,fontSize:14,color:namaPenduduk?"#1a2e1a":"#b0c8b0",background:"#fafcfa",fontFamily:"'Plus Jakarta Sans',sans-serif",minHeight:46,display:"flex",alignItems:"center" }}>
                    {namaPenduduk || "Terisi otomatis setelah pilih NIK"}
                  </div>
                </div>
              </div>

              {/* JENIS PENDUDUK */}
              <div className="field-row">
                <label style={labelStyle}>Jenis Penduduk</label>
                {tipe ? (
                  (() => {
                    const cfg = tipeConfig[tipe];
                    const Icon = cfg.icon;
                    return (
                      <div className="tipe-badge" style={{ display:"flex",alignItems:"center",gap:12,padding:"13px 16px",borderRadius:12,border:`1.5px solid ${cfg.border}`,background:cfg.bg }}>
                        <div style={{ width:34,height:34,borderRadius:10,background:"white",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 8px rgba(0,0,0,.06)" }}>
                          <Icon size={17} color={cfg.color}/>
                        </div>
                        <div>
                          <div style={{ fontWeight:700,color:cfg.color,fontSize:14 }}>{cfg.label}</div>
                          <div style={{ color:"#9aab9a",fontSize:12,marginTop:1 }}>
                            {tipe==="balita" ? `ID Balita: ${balitaId}` : `ID Lansia: ${lansiaId}`}
                          </div>
                        </div>
                        <CheckCircle2 size={18} color={cfg.color} style={{ marginLeft:"auto" }}/>
                      </div>
                    );
                  })()
                ) : (
                  <div style={{ display:"flex",alignItems:"center",gap:10,padding:"13px 16px",borderRadius:12,border:"1.5px solid #e4ede6",background:"#fafcfa" }}>
                    <div style={{ width:34,height:34,borderRadius:10,background:"#f0f6f2",display:"flex",alignItems:"center",justifyContent:"center" }}>
                      <Users size={16} color="#c8d8c8"/>
                    </div>
                    <span style={{ color:"#b0c8b0",fontSize:13 }}>Terisi otomatis setelah pilih NIK</span>
                  </div>
                )}
              </div>

              {/* SUBMIT */}
              <div className="field-row" style={{ marginTop:4 }}>
                <button type="submit" className="btn-register" disabled={isLoading}>
                  {isLoading
                    ? <><div className="spinner"/> Memproses...</>
                    : <>Daftar Sekarang <ArrowRight size={16}/></>}
                </button>
              </div>

            </form>

            {/* Divider */}
            <div className="divider">
              <hr/><span style={{ color:"#9aab9a",fontSize:13,whiteSpace:"nowrap" }}>atau</span><hr/>
            </div>

            {/* Back to login — matches login page's "Daftar di sini" button style */}
            <Link href="/login" style={{ textDecoration:"none" }}>
              <div style={{
                width:"100%", padding:"13px",
                border:"1.5px solid #d4e4d6", borderRadius:12,
                display:"flex", alignItems:"center", justifyContent:"center",
                gap:6, color:"#3a5a42", fontSize:14, fontWeight:600,
                background:"#fff", cursor:"pointer", transition:"all .2s",
              }}
                onMouseEnter={e=>{ e.currentTarget.style.background="#f0f8f2"; e.currentTarget.style.borderColor="#2d7a4f"; }}
                onMouseLeave={e=>{ e.currentTarget.style.background="#fff"; e.currentTarget.style.borderColor="#d4e4d6"; }}>
                Sudah punya akun?&nbsp;<span style={{ color:"#2d7a4f", fontWeight:700 }}>Masuk di sini</span>
              </div>
            </Link>

          </div>
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer style={{ padding:"18px 32px", textAlign:"center" }}>
        <p style={{ color:"#7a9a7a", fontSize:12 }}>
          © 2025 <span style={{ color:"#2d7a4f", fontWeight:600 }}>SmartHealth Village</span> — Menuju Desa Yang Lebih Sehat
        </p>
      </footer>
    </div>
  );
}