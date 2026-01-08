"use client";
import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from "recharts";
import { Wallet, TrendingUp, Users, Clock, Target, ArrowUpRight, Zap } from "lucide-react";

export default function ResumenEstrategico() {
  const [timeLeft, setTimeLeft] = useState({ dias: 0, horas: 0, min: 0 });
  
  // Estos valores deberían venir de tu base de datos o props
  const metaTotal = 50000000;
  const recaudado = 32500000;
  const porcentaje = Math.round((recaudado / metaTotal) * 100);

  const dataMeta = [
    { name: "Recaudado", value: recaudado },
    { name: "Faltante", value: metaTotal - recaudado }
  ];

  useEffect(() => {
    // Aquí podrías calcular la diferencia real entre la fecha actual y la del evento
    const interval = setInterval(() => {
      setTimeLeft({ dias: 45, horas: 12, min: 30 });
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-10 animate-in fade-in zoom-in-95 duration-700">
      
      {/* SECCIÓN SUPERIOR: TIEMPO Y PROGRESO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* CARD DE TIEMPO (DARK MODE) */}
        <div className="lg:col-span-2 bg-slate-900 rounded-[3.5rem] p-10 text-white flex flex-col justify-between relative overflow-hidden group shadow-2xl shadow-slate-200">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-indigo-500 rounded-lg">
                <Clock size={16} className="text-white" />
              </div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Time to Launch</h3>
            </div>
            
            <div className="flex gap-8 md:gap-12">
              <TimeUnit value={timeLeft.dias} label="Días" />
              <div className="w-px h-16 bg-slate-800 self-center hidden md:block" />
              <TimeUnit value={timeLeft.horas} label="Horas" />
              <div className="w-px h-16 bg-slate-800 self-center hidden md:block" />
              <TimeUnit value={timeLeft.min} label="Minutos" />
            </div>
          </div>

          <div className="mt-10 relative z-10 flex items-center gap-2 text-slate-500">
            <Zap size={14} className="text-amber-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Sincronizado con servidor central</span>
          </div>

          {/* Decoración de fondo */}
          <div className="absolute right-[-40px] bottom-[-40px] opacity-[0.03] text-white group-hover:rotate-12 transition-transform duration-1000">
            <Clock size={320} />
          </div>
        </div>

        {/* CARD DE META (CHART) */}
        <div className="bg-white rounded-[3.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-100/50 flex flex-col items-center justify-center relative group">
          <div className="absolute top-8 left-10 flex items-center gap-2">
            <Target size={14} className="text-indigo-600" />
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Progreso</h3>
          </div>

          <div className="h-56 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={dataMeta} 
                  innerRadius={70} 
                  outerRadius={90} 
                  paddingAngle={10} 
                  dataKey="value"
                  stroke="none"
                  startAngle={90}
                  endAngle={450}
                >
                  <Cell fill="#4f46e5" className="drop-shadow-[0_0_10px_rgba(79,70,229,0.3)]" />
                  <Cell fill="#f1f5f9" />
                  <Label 
                    content={({ viewBox }) => {
                      const { cx, cy } = viewBox as any;
                      return (
                        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central">
                          <tspan x={cx} y={cy} className="fill-slate-900 text-3xl font-black italic">
                            {porcentaje}%
                          </tspan>
                          <tspan x={cx} y={cy + 20} className="fill-slate-400 text-[9px] font-black uppercase tracking-widest">
                            Meta
                          </tspan>
                        </text>
                      );
                    }}
                  />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="text-center mt-2">
            <p className="text-[10px] font-black text-slate-400 uppercase">Faltan ${(metaTotal - recaudado).toLocaleString()} COP</p>
          </div>
        </div>
      </div>

      {/* SECCIÓN KPIs (BENTO BOX STYLE) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <KPICard 
          icon={<Wallet className="text-emerald-600" size={24} />} 
          label="Recaudo Neto" 
          value={`$${(recaudado / 1000000).toFixed(1)}M`} 
          color="bg-emerald-50"
          trend="+12%"
        />
        <KPICard 
          icon={<TrendingUp className="text-indigo-600" size={24} />} 
          label="Ticket Promedio" 
          value="$185k" 
          color="bg-indigo-50"
          trend="Estable"
        />
        <KPICard 
          icon={<Users className="text-slate-600" size={24} />} 
          label="Inscritos" 
          value="482" 
          color="bg-slate-50"
          trend="+4 hoy"
        />
      </div>
    </div>
  );
}

// COMPONENTES AUXILIARES
function TimeUnit({ value, label }: { value: number, label: string }) {
  return (
    <div className="flex flex-col items-start">
      <span className="text-6xl font-black italic tracking-tighter tabular-nums leading-none">
        {value < 10 ? `0${value}` : value}
      </span>
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2 ml-1">
        {label}
      </span>
      </div>
  );
}

function KPICard({ icon, label, value, color, trend }: any) {
  return (
    <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 flex items-center justify-between group">
      <div className="flex items-center gap-6">
        <div className={`w-16 h-16 ${color} rounded-[1.5rem] flex items-center justify-center group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
          <p className="text-3xl font-black text-slate-900 tracking-tighter italic">{value}</p>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <div className="flex items-center text-[9px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">
          <ArrowUpRight size={10} /> {trend}
        </div>
      </div>
    </div>
  );
}