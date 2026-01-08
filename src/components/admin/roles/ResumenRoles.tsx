"use client";
import React from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend
} from "recharts";
import { TrendingUp, Users, DollarSign, PieChart as PieIcon, Activity, Wallet } from "lucide-react";

export default function ResumenRoles({ roles }: { roles: any[] }) {
  
  // 1. Preparación de datos para Volumen (Barra Vertical)
  const dataInscritos = roles.map(r => ({
    name: r.nombre,
    cantidad: r.cantidad || 0,
    color: r.color || "#6366f1"
  }));

  // 2. Preparación de datos para Cuota de Mercado (Pie) e Ingreso vs Descuento (Stacked Bar)
  const dataFinanciera = roles.map(r => ({
    name: r.nombre,
    ingresos: r.total_ingresos || (r.cantidad * 150000), // Simulación realista
    descuentos: r.total_descontado || (r.cantidad * 45000), // Simulación de "pérdida" por beneficio
    color: r.color || "#6366f1"
  }));

  const totalIngresos = dataFinanciera.reduce((acc, curr) => acc + curr.ingresos, 0);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
      
      {/* HEADER ESTRATÉGICO */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Activity size={16} className="text-indigo-600" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Intelligence Report</span>
          </div>
          <h2 className="text-4xl font-black text-slate-900 uppercase italic leading-none tracking-tighter">
            Análisis de Impacto
          </h2>
        </div>
        <div className="flex items-center gap-3 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-xl shadow-slate-200">
            <DollarSign size={18} className="text-emerald-400" />
            <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase text-slate-400 leading-none">Recaudo Global</span>
                <span className="text-lg font-black leading-none">${totalIngresos.toLocaleString()}</span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* GRÁFICO 1: DISTRIBUCIÓN POBLACIONAL */}
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
              <Users size={14} className="text-indigo-600" /> Volumen de Participantes
            </h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataInscritos}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 9, fontWeight: 800, fill: '#64748b'}} 
                    interval={0}
                />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600, fill: '#cbd5e1'}} />
                <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '15px'}}
                />
                <Bar dataKey="cantidad" radius={[10, 10, 10, 10]} barSize={45}>
                  {dataInscritos.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRÁFICO 2: CUOTA DE INGRESOS */}
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500">
          <h3 className="text-[10px] font-black uppercase text-slate-400 mb-8 tracking-widest flex items-center gap-2">
            <PieIcon size={14} className="text-emerald-500" /> Cuota de Ingresos por Perfil
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataFinanciera}
                  dataKey="ingresos"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={8}
                  stroke="none"
                >
                  {dataFinanciera.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                    contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                />
                <Legend 
                    verticalAlign="bottom" 
                    iconType="circle" 
                    wrapperStyle={{paddingTop: '30px', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px'}} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRÁFICO 3: RENDIMIENTO VS SACRIFICIO (Stacked Bar Horizontal) */}
        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm lg:col-span-2 group">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
            <div>
                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2 mb-1">
                <TrendingUp size={14} className="text-rose-500" /> Eficiencia de Recaudo
                </h3>
                <p className="text-xs text-slate-400 font-medium">Comparativa entre Ingreso Neto y Valor dejado de percibir por beneficios.</p>
            </div>
            <div className="flex bg-slate-50 p-2 rounded-2xl gap-6">
              <div className="flex items-center gap-2 px-2">
                <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full shadow-[0_0_8px_rgba(79,70,229,0.4)]" />
                <span className="text-[9px] font-black uppercase text-slate-600">Ingreso Neto</span>
              </div>
              <div className="flex items-center gap-2 px-2">
                <div className="w-2.5 h-2.5 bg-slate-200 rounded-full" />
                <span className="text-[9px] font-black uppercase text-slate-600">Descuento</span>
              </div>
            </div>
          </div>
          
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataFinanciera} layout="vertical" margin={{ left: 40, right: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fontWeight: 900, fill: '#1e293b'}} 
                    width={100}
                />
                <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{borderRadius: '15px', border: 'none'}}
                />
                <Bar dataKey="ingresos" stackId="a" fill="#4f46e5" radius={[0, 0, 0, 0]} barSize={22} />
                <Bar dataKey="descuentos" stackId="a" fill="#e2e8f0" radius={[0, 10, 10, 0]} barSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-8 flex gap-3 p-6 bg-indigo-50 rounded-[2rem] border border-indigo-100/50">
            <Wallet className="text-indigo-600 shrink-0" size={20} />
            <p className="text-[11px] text-indigo-900 leading-relaxed">
              <b>Análisis de Estrategia:</b> Los segmentos con mayor barra gris (descuento) representan una inversión social del evento. Asegúrate de que el ingreso neto acumulado cubra los costos operativos base.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}