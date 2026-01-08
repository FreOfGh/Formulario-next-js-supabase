"use client";
import React from "react";
import { 
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, 
  Tooltip, Cell, CartesianGrid 
} from "recharts";
import { MapPin, Trophy, Globe, TrendingUp } from "lucide-react";

export default function JurisdiccionesAporte({ dataJurisdicciones }: { dataJurisdicciones?: any[] }) {
  // Datos de respaldo por si no vienen props
  const defaultData = [
    { name: "Arquidiócesis de Cali", monto: 12450000, inscritos: 85, color: "#4f46e5" },
    { name: "Diócesis de Bogotá", monto: 8900000, inscritos: 62, color: "#6366f1" },
    { name: "Diócesis de Medellín", monto: 5200000, inscritos: 34, color: "#818cf8" },
    { name: "Diócesis de Pasto", monto: 3100000, inscritos: 21, color: "#a5b4fc" },
  ];

  const data = dataJurisdicciones || defaultData;

  // Custom Tooltip para un look Premium
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 p-4 rounded-2xl shadow-2xl border border-slate-800">
          <p className="text-[10px] font-black uppercase text-indigo-400 mb-1">{payload[0].payload.name}</p>
          <p className="text-lg font-black text-white italic">
            ${payload[0].value.toLocaleString()}
          </p>
          <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">
            Recaudación Total
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-1000">
      {/* HEADER CON INDICADORES */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Globe size={16} className="text-indigo-600" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Geografía de Inscritos</span>
          </div>
          <h2 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
            Top Jurisdicciones
          </h2>
          <p className="text-slate-500 text-sm mt-2 font-medium italic">Liderazgo regional por recaudación neta acumulada.</p>
        </div>
        
        <div className="flex gap-2">
            <div className="bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 flex items-center gap-2">
                <Trophy size={14} className="text-indigo-600" />
                <span className="text-[10px] font-black uppercase text-indigo-700">Líder: {data[0].name}</span>
            </div>
        </div>
      </div>

      <div className="bg-white p-8 md:p-12 rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 relative overflow-hidden group">
        
        {/* Gráfico */}
        <div className="h-96 w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={data} 
              layout="vertical" 
              margin={{ left: 40, right: 60, top: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 11, fontWeight: 900, fill: '#1e293b', width: 200}} 
                width={160}
              />
              <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
              <Bar 
                dataKey="monto" 
                radius={[0, 20, 20, 0]} 
                barSize={32}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color || '#4f46e5'} 
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Decoración de fondo */}
        <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-700">
            <MapPin size={240} strokeWidth={1} />
        </div>
      </div>

      {/* FOOTER ANALÍTICO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.slice(0, 3).map((item, idx) => (
            <div key={item.name} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-lg transition-all">
                <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Puesto #{idx + 1}</p>
                    <p className="text-sm font-black text-slate-800 uppercase italic leading-none">{item.name.split(' ').pop()}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs font-black text-indigo-600">${(item.monto / 1000000).toFixed(1)}M</p>
                    <div className="flex items-center gap-1 justify-end text-[9px] font-bold text-slate-400 uppercase">
                        <TrendingUp size={10} /> {item.inscritos} Pax
                    </div>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}