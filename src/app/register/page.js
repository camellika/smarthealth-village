"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser, searchPendudukByNik } from "@/services/authService";
import {
  HeartPulse, User, Lock, Eye, EyeOff, Search,
  CheckCircle2, ChevronRight, ArrowLeft, Baby, Users
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername]               = useState("");
  const [password, setPassword]               = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [nik, setNik]               = useState("");
  const [namaPenduduk, setNamaPenduduk] = useState("");
  const [tipe, setTipe]             = useState(null);   // "balita" | "lansia" | null
  const [balitaId, setBalitaId]     = useState(null);
  const [lansiaId, setLansiaId]     = useState(null);

  const [results, setResults]       = useState([]);
  const [error, setError]           = useState("");

  const [showPassword, setShowPassword]               = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading]   = useState(false);
  const [focused, setFocused]       = useState(null);

  // ─────────────────────────────────────────
  // SEARCH NIK  →  cari di Balita + Lansia
  // ─────────────────────────────────────────
  const handleSearchNik = async (value) => {
    setNik(value);
    // Reset pilihan sebelumnya
    setNamaPenduduk("");
    setTipe(null);
    setBalitaId(null);
    setLansiaId(null);

    if (value.length < 3) {
      setResults([]);
      return;
    }

    const data = await searchPendudukByNik(value);
    setResults(data || []);
  };

  // ─────────────────────────────────────────
  // PILIH PENDUDUK dari dropdown
  // ─────────────────────────────────────────
  const handleSelectPenduduk = (item) => {
    setNik(item.nik || "");
    setNamaPenduduk(item.nama || "");
    setTipe(item.tipe);                         // "balita" atau "lansia"

    // Set id ke kolom yang sesuai, kosongkan yang lain
    if (item.tipe === "balita") {
      setBalitaId(item.id);
      setLansiaId(null);
    } else if (item.tipe === "lansia") {
      setLansiaId(item.id);
      setBalitaId(null);
    }

    setResults([]);
  };

  // ─────────────────────────────────────────
  // REGISTER
  // ─────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Password tidak sama");
      return;
    }

    if (!balitaId && !lansiaId) {
      setError("Silakan pilih NIK dari daftar");
      return;
    }

    setIsLoading(true);
    try {
      await registerUser({
        username,
        password,
        balitaId: balitaId ?? null,   // terisi jika balita, null jika lansia
        lansiaId: lansiaId ?? null,   // terisi jika lansia, null jika balita
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
    padding: "12px 16px",
    paddingLeft: "44px",
    border: `1.5px solid ${focused === name ? "#2d7a4f" : "#dde8de"}`,
    borderRadius: 12,
    fontSize: 14,
    color: "#1f2d1f",
    background: focused === name ? "#f5fdf7" : "#fafcfa",
    outline: "none",
    transition: "all 0.2s",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    boxShadow: focused === name ? "0 0 0 3px rgba(45,122,79,0.1)" : "none",
  });

  const tipeConfig = {
    balita: { label:"Balita", icon:Baby,  bg:"#e8f5ed", color:"#2d7a4f", border:"#b8ddc5" },
    lansia: { label:"Lansia", icon:Users, bg:"#fff7ed", color:"#d97706", border:"#fcd9a0" },
  };

  const steps = [
    { label:"Akun",      done: username.length > 0 && password.length > 0 },
    { label:"Identitas", done: !!(balitaId || lansiaId) },
    { label:"Selesai",   done: false },
  ];

  return (
    <div style={{ minHeight:"100vh", background:"#f5f7f4", fontFamily:"'Plus Jakarta Sans', sans-serif", color:"#1f2d1f", display:"flex", flexDirection:"column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes slide-up  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fade-in   { from{opacity:0} to{opacity:1} }
        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.85)} }
        @keyframes spin      { to{transform:rotate(360deg)} }
        @keyframes tipe-pop  { 0%{opacity:0;transform:scale(.94)} 100%{opacity:1;transform:scale(1)} }

        .register-card { animation: slide-up .6s ease both; }

        .form-field { animation: slide-up .5s ease both; opacity:0; animation-fill-mode:forwards; }
        .form-field:nth-child(1){animation-delay:.05s}
        .form-field:nth-child(2){animation-delay:.10s}
        .form-field:nth-child(3){animation-delay:.15s}
        .form-field:nth-child(4){animation-delay:.20s}
        .form-field:nth-child(5){animation-delay:.25s}
        .form-field:nth-child(6){animation-delay:.30s}

        .result-item:hover { background:#edf5ef!important; }

        .btn-register {
          width:100%; padding:14px;
          background:#2d7a4f; color:white; border:none;
          border-radius:14px; font-size:15px; font-weight:700;
          cursor:pointer; font-family:'Plus Jakarta Sans',sans-serif;
          display:flex; align-items:center; justify-content:center; gap:8px;
          transition:all .22s;
          box-shadow:0 4px 16px rgba(45,122,79,.3);
          letter-spacing:-.2px;
        }
        .btn-register:hover:not(:disabled){ background:#246240; transform:translateY(-2px); box-shadow:0 8px 24px rgba(45,122,79,.38); }
        .btn-register:disabled{ opacity:.7; cursor:not-allowed; }

        .spinner{ width:18px;height:18px;border:2.5px solid rgba(255,255,255,.4);border-top-color:white;border-radius:50%;animation:spin .7s linear infinite; }
        .eye-btn{ position:absolute;right:14px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;padding:2px;color:#9aab9a;transition:color .2s;display:flex; }
        .eye-btn:hover{ color:#2d7a4f; }
        .tipe-badge{ animation:tipe-pop .25s ease both; }

        .side-panel{ display:none; }
        @media(min-width:1024px){ .side-panel{display:flex;} .register-wrapper{flex-direction:row;} }
      `}</style>

      {/* ── NAVBAR ── */}
      <header style={{ position:"sticky",top:0,zIndex:100,background:"rgba(245,247,244,0.94)",backdropFilter:"blur(16px)",borderBottom:"1px solid #dde8de" }}>
        <div style={{ maxWidth:1280,margin:"0 auto",padding:"14px 32px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <Link href="/" style={{ display:"flex",alignItems:"center",gap:10,textDecoration:"none" }}>
            <div style={{ background:"#2d7a4f",borderRadius:10,padding:"7px 8px",display:"flex" }}>
              <HeartPulse size={17} color="white" />
            </div>
            <span style={{ fontWeight:800,fontSize:16,color:"#1f2d1f",letterSpacing:-.3 }}>
              SmartHealth<span style={{ color:"#2d7a4f" }}>Village</span>
            </span>
          </Link>
          <Link href="/login" style={{ display:"flex",alignItems:"center",gap:7,color:"#4a7a5a",fontSize:14,fontWeight:600,textDecoration:"none" }}>
            <ArrowLeft size={15}/> Sudah punya akun?&nbsp;<span style={{ color:"#2d7a4f" }}>Masuk</span>
          </Link>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main style={{ flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"40px 16px" }}>
        <div className="register-wrapper" style={{ display:"flex",width:"100%",maxWidth:980,borderRadius:24,overflow:"hidden",boxShadow:"0 16px 56px rgba(45,122,79,.12),0 2px 8px rgba(0,0,0,.06)" }}>

          {/* ── LEFT PANEL ── */}
          <div className="side-panel" style={{ width:360,background:"linear-gradient(160deg,#1e5c38 0%,#2d7a4f 60%,#3a9e6e 100%)",padding:"44px 36px",flexDirection:"column",justifyContent:"space-between",position:"relative",overflow:"hidden",flexShrink:0 }}>
            <div style={{ position:"absolute",top:-60,right:-60,width:220,height:220,borderRadius:"50%",background:"rgba(255,255,255,.06)" }}/>
            <div style={{ position:"absolute",bottom:60,left:-80,width:260,height:260,borderRadius:"50%",background:"rgba(255,255,255,.05)" }}/>
            <div style={{ position:"absolute",bottom:-40,right:20,width:140,height:140,borderRadius:"50%",background:"rgba(255,255,255,.06)" }}/>

            <div style={{ position:"relative" }}>
              <div style={{ display:"inline-flex",alignItems:"center",gap:8,background:"rgba(255,255,255,.12)",borderRadius:50,padding:"6px 14px",marginBottom:28 }}>
                <div style={{ width:7,height:7,borderRadius:"50%",background:"#a8e6c3",animation:"pulse-dot 2s ease-in-out infinite" }}/>
                <span style={{ color:"rgba(255,255,255,.9)",fontSize:12,fontWeight:600 }}>Sistem Aktif · Desa Ceria</span>
              </div>
              <h2 style={{ color:"#fff",fontSize:26,fontWeight:800,lineHeight:1.25,letterSpacing:-.8,marginBottom:14 }}>
                Bergabung dengan<br/>SmartHealth Village
              </h2>
              <p style={{ color:"rgba(255,255,255,.65)",fontSize:14,lineHeight:1.7 }}>
                Daftarkan diri Anda untuk memantau tumbuh kembang balita dan kesehatan lansia di desa Anda secara digital.
              </p>
            </div>

            <div style={{ position:"relative",display:"flex",flexDirection:"column",gap:12 }}>
              {[
                { label:"Balita Terdaftar", value:"120+", sub:"Aktif dipantau" },
                { label:"Lansia Terdaftar", value:"85+",  sub:"Dalam monitoring" },
                { label:"Posyandu Aktif",   value:"6",    sub:"Kegiatan per bulan" },
              ].map((s) => (
                <div key={s.label} style={{ background:"rgba(255,255,255,.1)",borderRadius:14,padding:"14px 16px",border:"1px solid rgba(255,255,255,.1)",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                  <div>
                    <div style={{ color:"rgba(255,255,255,.6)",fontSize:12 }}>{s.label}</div>
                    <div style={{ color:"rgba(255,255,255,.5)",fontSize:11,marginTop:1 }}>{s.sub}</div>
                  </div>
                  <div style={{ color:"#fff",fontSize:22,fontWeight:800,letterSpacing:-1 }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: FORM ── */}
          <div className="register-card" style={{ flex:1,background:"#fff",padding:"44px 40px",display:"flex",flexDirection:"column" }}>

            <div style={{ marginBottom:28 }}>
              <h1 style={{ fontSize:24,fontWeight:800,color:"#1f2d1f",letterSpacing:-.6,marginBottom:6 }}>Buat Akun Baru</h1>
              <p style={{ color:"#6b7c6b",fontSize:14 }}>Isi data berikut untuk mendaftarkan akun Anda</p>
            </div>

            {/* Step indicator */}
            <div style={{ display:"flex",alignItems:"center",marginBottom:28 }}>
              {steps.map((step,i) => (
                <div key={step.label} style={{ display:"flex",alignItems:"center",flex:i<steps.length-1?1:"none" }}>
                  <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:4 }}>
                    <div style={{ width:28,height:28,borderRadius:"50%",background:step.done?"#2d7a4f":"#f0f6f2",border:`2px solid ${step.done?"#2d7a4f":"#dde8de"}`,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .3s" }}>
                      {step.done
                        ? <CheckCircle2 size={14} color="white" strokeWidth={2.5}/>
                        : <span style={{ fontSize:11,fontWeight:700,color:"#9aab9a" }}>{i+1}</span>}
                    </div>
                    <span style={{ fontSize:10,fontWeight:600,color:step.done?"#2d7a4f":"#9aab9a",whiteSpace:"nowrap" }}>{step.label}</span>
                  </div>
                  {i<steps.length-1 && (
                    <div style={{ flex:1,height:2,background:step.done?"#2d7a4f":"#e4ede6",margin:"0 6px",marginBottom:18,transition:"background .3s" }}/>
                  )}
                </div>
              ))}
            </div>

            {/* Error banner */}
            {error && (
              <div style={{ background:"#fef2f2",border:"1px solid #fecaca",borderRadius:12,padding:"12px 16px",marginBottom:20,display:"flex",alignItems:"center",gap:10,animation:"fade-in .3s ease" }}>
                <div style={{ width:8,height:8,borderRadius:"50%",background:"#dc2626",flexShrink:0 }}/>
                <span style={{ color:"#dc2626",fontSize:13,fontWeight:500 }}>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display:"flex",flexDirection:"column",gap:16 }}>

              {/* USERNAME */}
              <div className="form-field">
                <label style={{ display:"block",fontSize:13,fontWeight:600,color:"#3a5042",marginBottom:7 }}>Username</label>
                <div style={{ position:"relative" }}>
                  <User size={16} color={focused==="username"?"#2d7a4f":"#9aab9a"} style={{ position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",transition:"color .2s" }}/>
                  <input type="text" value={username} onChange={(e)=>setUsername(e.target.value)}
                    onFocus={()=>setFocused("username")} onBlur={()=>setFocused(null)}
                    placeholder="Masukkan username" required style={inputStyle("username")}/>
                </div>
              </div>

              {/* PASSWORD */}
              <div className="form-field">
                <label style={{ display:"block",fontSize:13,fontWeight:600,color:"#3a5042",marginBottom:7 }}>Password</label>
                <div style={{ position:"relative" }}>
                  <Lock size={16} color={focused==="password"?"#2d7a4f":"#9aab9a"} style={{ position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",transition:"color .2s" }}/>
                  <input type={showPassword?"text":"password"} value={password} onChange={(e)=>setPassword(e.target.value)}
                    onFocus={()=>setFocused("password")} onBlur={()=>setFocused(null)}
                    placeholder="Buat password" required style={{ ...inputStyle("password"),paddingRight:44 }}/>
                  <button type="button" className="eye-btn" onClick={()=>setShowPassword(!showPassword)}>
                    {showPassword?<EyeOff size={16}/>:<Eye size={16}/>}
                  </button>
                </div>
              </div>

              {/* CONFIRM PASSWORD */}
              <div className="form-field">
                <label style={{ display:"block",fontSize:13,fontWeight:600,color:"#3a5042",marginBottom:7 }}>Ulangi Password</label>
                <div style={{ position:"relative" }}>
                  <Lock size={16} color={focused==="confirm"?"#2d7a4f":"#9aab9a"} style={{ position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",transition:"color .2s" }}/>
                  <input type={showConfirmPassword?"text":"password"} value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)}
                    onFocus={()=>setFocused("confirm")} onBlur={()=>setFocused(null)}
                    placeholder="Ulangi password" required
                    style={{
                      ...inputStyle("confirm"), paddingRight:44,
                      borderColor: confirmPassword && password!==confirmPassword ? "#dc2626" : focused==="confirm" ? "#2d7a4f" : "#dde8de",
                      boxShadow:   confirmPassword && password!==confirmPassword ? "0 0 0 3px rgba(220,38,38,.1)" : focused==="confirm" ? "0 0 0 3px rgba(45,122,79,.1)" : "none",
                    }}/>
                  <button type="button" className="eye-btn" onClick={()=>setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword?<EyeOff size={16}/>:<Eye size={16}/>}
                  </button>
                </div>
                {confirmPassword && password!==confirmPassword && (
                  <p style={{ color:"#dc2626",fontSize:12,marginTop:5,fontWeight:500 }}>Password tidak cocok</p>
                )}
              </div>

              {/* SEARCH NIK */}
              <div className="form-field" style={{ position:"relative", zIndex: 100 }}>
                <label style={{ display:"block",fontSize:13,fontWeight:600,color:"#3a5042",marginBottom:7 }}>
                  NIK
                  <span style={{ color:"#9aab9a",fontWeight:400,marginLeft:6,fontSize:12 }}>— balita atau lansia, ketik minimal 3 digit</span>
                </label>
                <div style={{ position:"relative" }}>
                  <Search size={16} color={focused==="nik"?"#2d7a4f":"#9aab9a"} style={{ position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",transition:"color .2s" }}/>
                  <input type="text" value={nik} onChange={(e)=>handleSearchNik(e.target.value)}
                    onFocus={()=>setFocused("nik")} onBlur={()=>setTimeout(()=>setFocused(null),150)}
                    placeholder="Cari berdasarkan NIK..." required style={inputStyle("nik")}/>
                  {(balitaId||lansiaId) && (
                    <CheckCircle2 size={16} color="#2d7a4f" style={{ position:"absolute",right:14,top:"50%",transform:"translateY(-50%)" }}/>
                  )}
                </div>

                {/* DROPDOWN */}
                {results.length > 0 && (
                  <ul style={{ position:"absolute",width:"100%",zIndex:999,background:"#fff",border:"1.5px solid #dde8de",borderRadius:12,marginTop:6,padding:"6px 0",listStyle:"none",boxShadow:"0 8px 24px rgba(0,0,0,.10)",maxHeight:200,overflowY:"auto",animation:"fade-in .15s ease" }}>
                    {results.map((item) => {
                      const cfg = tipeConfig[item.tipe];
                      const Icon = cfg.icon;
                      return (
                        <li key={`${item.tipe}-${item.id}`} className="result-item"
                          onMouseDown={()=>handleSelectPenduduk(item)}
                          style={{ padding:"10px 16px",cursor:"pointer",fontSize:13,color:"#1f2d1f",display:"flex",gap:10,alignItems:"center",transition:"background .15s" }}>
                          <div style={{ width:30,height:30,borderRadius:9,background:cfg.bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                            <Icon size={14} color={cfg.color}/>
                          </div>
                          <div style={{ flex:1 }}>
                            <div style={{ fontWeight:600 }}>{item.nama}</div>
                            <div style={{ color:"#9aab9a",fontSize:11 }}>{item.nik}</div>
                          </div>
                          {/* Badge tipe di dropdown */}
                          <span style={{ fontSize:11,fontWeight:700,color:cfg.color,background:cfg.bg,border:`1px solid ${cfg.border}`,borderRadius:20,padding:"2px 9px",flexShrink:0 }}>
                            {cfg.label}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* NAMA — readonly */}
              <div className="form-field">
                <label style={{ display:"block",fontSize:13,fontWeight:600,color:"#3a5042",marginBottom:7 }}>Nama</label>
                <div style={{ position:"relative" }}>
                  <User size={16} color="#c8d8c8" style={{ position:"absolute",left:14,top:"50%",transform:"translateY(-50%)" }}/>
                  <div style={{ width:"100%",padding:"12px 16px 12px 44px",border:"1.5px solid #e4ede6",borderRadius:12,fontSize:14,color:namaPenduduk?"#1f2d1f":"#b0c0b0",background:"#f9fdf9",fontFamily:"'Plus Jakarta Sans',sans-serif",minHeight:44,display:"flex",alignItems:"center" }}>
                    {namaPenduduk || "Terisi otomatis setelah pilih NIK"}
                  </div>
                </div>
              </div>

              {/* JENIS PENDUDUK — otomatis dari tipe NIK yang dipilih */}
              <div className="form-field">
                <label style={{ display:"block",fontSize:13,fontWeight:600,color:"#3a5042",marginBottom:7 }}>Jenis Penduduk</label>
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
                  <div style={{ display:"flex",alignItems:"center",gap:10,padding:"13px 16px",borderRadius:12,border:"1.5px dashed #dde8de",background:"#fafcfa" }}>
                    <div style={{ width:34,height:34,borderRadius:10,background:"#f0f6f2",display:"flex",alignItems:"center",justifyContent:"center" }}>
                      <Users size={16} color="#c8d8c8"/>
                    </div>
                    <span style={{ color:"#b0c0b0",fontSize:13 }}>Terisi otomatis setelah pilih NIK</span>
                  </div>
                )}
              </div>

              {/* SUBMIT */}
              <div style={{ marginTop:6 }}>
                <button type="submit" className="btn-register" disabled={isLoading}>
                  {isLoading
                    ? <><div className="spinner"/> Memproses...</>
                    : <>Daftar Sekarang <ChevronRight size={16}/></>}
                </button>
              </div>

            </form>

            <p style={{ textAlign:"center",color:"#9aab9a",fontSize:13,marginTop:20 }}>
              Sudah punya akun?{" "}
              <Link href="/login" style={{ color:"#2d7a4f",fontWeight:700,textDecoration:"none" }}>Masuk di sini</Link>
            </p>
          </div>

        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop:"1px solid #dde8de",padding:"18px 32px",textAlign:"center" }}>
        <p style={{ color:"#9aab9a",fontSize:12 }}>
          © 2025 <span style={{ color:"#2d7a4f",fontWeight:600 }}>SmartHealth Village</span> — Menuju Desa Yang Lebih Sehat
        </p>
      </footer>
    </div>
  );
}