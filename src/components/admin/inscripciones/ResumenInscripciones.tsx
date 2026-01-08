"use client";

import React from "react";
import { 
  Users, Clock, CheckCircle2, AlertCircle, 
  Target, TrendingUp, ShieldCheck 
} from "lucide-react";

export default function ResumenInscripciones({ data }: { data: any[] }) {
  const stats = {
    total: data.length,
    aprobados: data.filter(i => i.estado === 'aprobada').length,
    pendientes: data.filter(i => i.estado === 'pendiente').length,
    rechazados: data.filter(i => i.estado === 'rechazada').length,
  };

  // Cálculo de porcentaje de efectividad (aprobados vs total)
  const efectividad = stats.total > 0 ? Math.round((stats.aprobados / stats.total) * 100) : 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
      {/* HEADER CON KPI DE EFECTIVIDAD */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Target size={14} className="text-indigo-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Métricas de Conversión
            </span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 uppercase italic leading-none">
            Estado de la Convocatoria
          </h2>
        </div>

        <div className="bg-white px-6 py-4 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="text-right">
            <p className="text-[9px] font-black text-slate-400 uppercase">Efectividad de Pago</p>
            <p className="text-xl font-black text-indigo-600">{efectividad}%</p>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-slate-50 border-t-indigo-500 animate-spin-slow flex items-center justify-center">
            <ShieldCheck size={18} className="text-indigo-500" />
          </div>
        </div>
      </div>

      {/* GRID DE STATS PRINCIPALES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Registros" 
          value={stats.total} 
          icon={Users} 
          color="text-indigo-600" 
          bg="bg-indigo-50"
          description="Inscritos totales"
        />
        <StatCard 
          label="Pagos Validados" 
          value={stats.aprobados} 
          icon={CheckCircle2} 
          color="text-emerald-600" 
          bg="bg-emerald-50"
          description="Dinero en caja"
        />
        <StatCard 
          label="Por Validar" 
          value={stats.pendientes} 
          icon={Clock} 
          color="text-amber-600" 
          bg="bg-amber-50"
          description="Acción requerida"
        />
        <StatCard 
          label="Rechazados" 
          value={stats.rechazados} 
          icon={AlertCircle} 
          color="text-rose-600" 
          bg="bg-rose-50"
          description="Deben re-intentar"
        />
      </div>

      {/* BARRA DE PROGRESO DE META (Opcional) */}
      <div className="bg-slate-900 p-8 rounded-[3rem] text-white overflow-hidden relative group">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
              <TrendingUp className="text-indigo-400" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Progreso de Validación</p>
              <h4 className="text-lg font-bold">Consolidación de Participantes</h4>
            </div>
          </div>
          <div className="flex-1 max-w-md w-full">
            <div className="flex justify-between mb-2 text-[10px] font-black uppercase">
              <span>{stats.aprobados} Confirmados</span>
              <span className="text-indigo-300">{efectividad}%</span>
            </div>
            <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden p-0.5">
              <div 
                className="bg-indigo-500 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(99,102,241,0.5)]" 
                style={{ width: `${efectividad}%` }}
              ></div>
            </div>
          </div>
        </div>
        {/* Decoración de fondo */}
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-700"></div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, bg, description }: any) {
  return (
    <div className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-50 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 group">
      <div className={`w-14 h-14 ${bg} ${color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-inner`}>
        <Icon size={28} />
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{value}</h3>
        <span className="text-[9px] font-bold text-slate-300 uppercase italic">{description}</span>
      </div>
    </div>
  );
}