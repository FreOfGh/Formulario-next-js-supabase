"use client";
import React from "react";
import { BadgePercent, Users, HeartHandshake, TrendingDown, Sparkles } from "lucide-react";

export default function AnalisisDescuentos() {
  // Estos datos vendrían idealmente calculados por props o desde Supabase
  const impacto = [
    { 
      rol: "Sacerdotes", 
      ahorro: "$4.5M", 
      inscritos: 80, 
      color: "bg-indigo-600",
      shadow: "shadow-indigo-200"
    },
    { 
      rol: "Seminaristas", 
      ahorro: "$2.1M", 
      inscritos: 45, 
      color: "bg-slate-900",
      shadow: "shadow-slate-300" 
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
      {/* TÍTULO CON ESTILO EDITORIAL */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <HeartHandshake size={14} className="text-rose-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Responsabilidad Social</span>
          </div>
          <h2 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
            Impacto Social
          </h2>
        </div>
        <div className="hidden md:block">
           <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-2xl border border-emerald-100 flex items-center gap-2">
              <TrendingDown size={14} strokeWidth={3} />
              <span className="text-[10px] font-black uppercase">Ahorro Comunitario Activo</span>
           </div>
        </div>
      </div>

      {/* GRID DE IMPACTO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {impacto.map((i) => (
          <div 
            key={i.rol} 
            className={`${i.color} p-10 rounded-[3.5rem] text-white flex justify-between items-center shadow-2xl ${i.shadow} relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500`}
          >
            {/* Decoración de fondo */}
            <div className="absolute -right-4 -top-4 bg-white/10 w-24 h-24 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={12} className="text-amber-400" />
                <p className="text-[10px] font-black uppercase text-white/60 tracking-[0.2em]">{i.rol}</p>
              </div>
              <h4 className="text-5xl font-black italic tracking-tighter leading-none">{i.ahorro}</h4>
              <div className="mt-6 flex flex-col">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Valor Total</span>
                <span className="text-xs font-bold text-white/80">Subsidio Otorgado</span>
              </div>
            </div>

            <div className="relative z-10 text-right flex flex-col items-end">
              <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-md mb-6 border border-white/20 shadow-inner">
                <BadgePercent size={32} className="text-white opacity-90" />
              </div>
              <div className="flex flex-col items-end">
                <div className="text-3xl font-black leading-none">{i.inscritos}</div>
                <div className="flex items-center gap-1 text-[10px] font-black text-white/50 uppercase tracking-tighter mt-1">
                  <Users size={10} /> Beneficiarios
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* BANNER DE RESUMEN FINAL */}
      <div className="p-8 bg-slate-50 rounded-[3rem] border border-slate-200/50 border-dashed flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-indigo-600">
                <HeartHandshake size={24} />
            </div>
            <div>
                <p className="text-sm font-bold text-slate-800">Compromiso con la Formación</p>
                <p className="text-[11px] text-slate-500 font-medium">Este resumen refleja la inversión del evento en el fortalecimiento de los perfiles priorizados.</p>
            </div>
        </div>
        <button className="bg-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-900 border border-slate-200 hover:bg-slate-900 hover:text-white transition-all shadow-sm">
            Descargar Reporte de Impacto
        </button>
      </div>
    </div>
  );
}