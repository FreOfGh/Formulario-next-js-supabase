"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/clients";
import { useRouter } from "next/navigation";
import { Lock, Mail, Loader2, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Credenciales inválidas. Intenta de nuevo.");
      setLoading(false);
    } else {
      router.push("/admin/dashboard"); // Redirigir al panel
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* Cabecera */}
        <div className="bg-[#0f172a] p-10 text-center relative">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30">
            <Lock className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-tight">Admin Login</h1>
          <p className="text-slate-400 text-sm mt-1">Acceso al panel de control</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleLogin} className="p-10 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-xs font-bold text-center border border-red-100 animate-shake">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Mail size={12}/> Correo Electrónico
            </label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="modern-input" 
              placeholder="admin@ejemplo.com"
              required 
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Lock size={12}/> Contraseña
            </label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="modern-input" 
              placeholder="••••••••"
              required 
            />
          </div>

          <button 
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl text-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : "ENTRAR AL PANEL"}
          </button>

          <Link href="/" className="flex items-center justify-center gap-2 text-slate-400 text-xs font-bold hover:text-indigo-600 transition-colors uppercase tracking-widest">
            <ChevronLeft size={14}/> Volver al registro
          </Link>
        </form>
      </div>

      <style jsx global>{`
        .modern-input {
          width: 100%;
          padding: 0.9rem 1.2rem;
          background: #f8fafc;
          border: 2px solid #f1f5f9;
          border-radius: 1rem;
          font-weight: 600;
          outline: none;
          transition: 0.2s;
        }
        .modern-input:focus {
          border-color: #6366f1;
          background: white;
          box-shadow: 0 10px 20px -10px rgba(99,102,241,0.1);
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.3s ease-in-out; }
      `}</style>
    </div>
  );
}