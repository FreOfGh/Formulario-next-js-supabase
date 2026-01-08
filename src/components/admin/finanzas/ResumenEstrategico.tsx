"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/clients";
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from "recharts";
import { 
  Wallet, TrendingUp, Users, Clock, Target, 
  ArrowUpRight, Zap, Loader2, AlertCircle 
} from "lucide-react";

export default function ResumenEstrategico() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    recaudado: 0,
    inscritos: 0,
    metaTotal: 0,
    diasRestantes: 0,
    ticketPromedio: 0,
    inscritosHoy: 0,
    nombreEvento: ""
  });

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        
        // 1. Obtener el Evento Activo
        const { data: evento, error: evError } = await supabase
          .from('eventos')
          .select('id, nombre, fecha_inicio, meta_recaudacion')
          .eq('esta_activo', true)
          .maybeSingle();

        if (evError) throw evError;
        if (!evento) {
          setError("No hay un evento activo seleccionado.");
          return;
        }

        // 2. Obtener Datos de Inscripciones vinculadas a ese evento
        // Traemos precio_pactado para el recaudo y created_at para el conteo de hoy
        const { data: inscripciones, error: insError } = await supabase
          .from('inscripciones')
          .select('precio_pactado, created_at')
          .eq('evento_id', evento.id);

        if (insError) throw insError;

        // 3. Procesamiento de Métricas
        const totalRecaudado = inscripciones?.reduce((acc, curr) => acc + (Number(curr.precio_pactado) || 0), 0) || 0;
        const numInscritos = inscripciones?.length || 0;
        
        // Conteo de inscritos en las últimas 24 horas
        const hace24Horas = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const inscritosHoy = inscripciones?.filter(i => new Date(i.created_at) > hace24Horas).length || 0;

        // Cálculo de tiempo para el evento
        const fechaEvento = new Date(evento.fecha_inicio);
        const hoy = new Date();
        const diffTime = fechaEvento.getTime() - hoy.getTime();
        const diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        setStats({
          recaudado: totalRecaudado,
          inscritos: numInscritos,
          metaTotal: evento.meta_recaudacion || 10000000, // Fallback si no hay meta definida
          diasRestantes: diasRestantes > 0 ? diasRestantes : 0,
          ticketPromedio: numInscritos > 0 ? Math.round(totalRecaudado / numInscritos) : 0,
          inscritosHoy,
          nombreEvento: evento.nombre
        });

      } catch (err: any) {
        console.error("Dashboard Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) return (
    <div className="h-96 flex flex-col items-center justify-center gap-4 text-slate-400">
      <Loader2 className="animate-spin text-indigo-500" size={40} />
      <p className="font-black uppercase text-[10px] tracking-[0.3em]">Sincronizando Métricas...</p>
    </div>
  );

  if (error) return (
    <div className="h-96 flex flex-col items-center justify-center p-10 bg-rose-50 rounded-[3rem] border border-rose-100 text-rose-500">
      <AlertCircle size={40} className="mb-4" />
      <p className="font-bold text-center">{error}</p>
    </div>
  );

  const porcentajeMeta = Math.min(100, Math.round((stats.recaudado / stats.metaTotal) * 100));
  const chartData = [
    { name: "Recaudado", value: stats.recaudado },
    { name: "Pendiente", value: Math.max(0, stats.metaTotal - stats.recaudado) }
  ];

  return (
    <div className="space-y-10 animate-in fade-in zoom-in-95 duration-700">
      
      {/* HEADER DINÁMICO */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-4">
        <div>
          <h2 className="text-4xl font-black text-slate-900 italic uppercase tracking-tighter">
            {stats.nombreEvento}
          </h2>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Panel de Control Estratégico</p>
        </div>
        <div className="bg-amber-400 text-black px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-tighter flex items-center gap-2">
          <Zap size={12} fill="black" /> Live Updates
        </div>
      </div>

      {/* SECCIÓN SUPERIOR: TIEMPO Y PROGRESO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* CARD DE TIEMPO (DARK MODE) */}
        <div className="lg:col-span-2 bg-slate-900 rounded-[3.5rem] p-10 text-white flex flex-col justify-between relative overflow-hidden group shadow-2xl">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-indigo-500 rounded-lg shadow-lg shadow-indigo-500/40">
                <Clock size={16} className="text-white" />
              </div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Days to Launch</h3>
            </div>
            
            <div className="flex gap-12">
              <TimeUnit value={stats.diasRestantes} label="Días Restantes" />
              <div className="w-px h-20 bg-slate-800 self-center" />
              <div className="flex flex-col justify-center">
                <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Estado del Evento</span>
                <span className="text-emerald-400 text-2xl font-black italic uppercase tracking-tighter">En curso</span>
              </div>
            </div>
          </div>

          {/* Decoración de fondo */}
          <div className="absolute right-[-40px] bottom-[-40px] opacity-[0.05] text-white group-hover:rotate-12 transition-transform duration-1000">
            <Clock size={320} />
          </div>
        </div>

        {/* CARD DE META (CHART) */}
        <div className="bg-white rounded-[3.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-center justify-center relative">
          <div className="absolute top-8 left-10 flex items-center gap-2">
            <Target size={14} className="text-indigo-600" />
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Objetivo</h3>
          </div>

          <div className="h-56 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={chartData} 
                  innerRadius={70} 
                  outerRadius={90} 
                  paddingAngle={8} 
                  dataKey="value"
                  stroke="none"
                  startAngle={90}
                  endAngle={450}
                >
                  <Cell fill="#4f46e5" className="drop-shadow-[0_0_8px_rgba(79,70,229,0.3)]" />
                  <Cell fill="#f1f5f9" />
                  <Label 
                    content={({ viewBox }) => {
                      const { cx, cy } = viewBox as any;
                      return (
                        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central">
                          <tspan x={cx} y={cy} className="fill-slate-900 text-4xl font-black italic">{porcentajeMeta}%</tspan>
                        </text>
                      );
                    }}
                  />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Meta: ${stats.metaTotal.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* SECCIÓN KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <KPICard 
          icon={<Wallet className="text-emerald-600" size={24} />} 
          label="Recaudo Total" 
          value={`$${(stats.recaudado / 1000000).toFixed(2)}M`} 
          color="bg-emerald-50"
          trend={`${porcentajeMeta}% de meta`}
        />
        <KPICard 
          icon={<TrendingUp className="text-indigo-600" size={24} />} 
          label="Ticket Promedio" 
          value={`$${(stats.ticketPromedio / 1000).toFixed(0)}k`} 
          color="bg-indigo-50"
          trend="Por persona"
        />
        <KPICard 
          icon={<Users className="text-slate-600" size={24} />} 
          label="Total Inscritos" 
          value={stats.inscritos} 
          color="bg-slate-50"
          trend={stats.inscritosHoy > 0 ? `+${stats.inscritosHoy} hoy` : "Sin registros hoy"}
        />
      </div>
    </div>
  );
}

// COMPONENTES AUXILIARES
function TimeUnit({ value, label }: { value: number, label: string }) {
  return (
    <div className="flex flex-col items-start">
      <span className="text-7xl font-black italic tracking-tighter tabular-nums leading-none">
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
    <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 flex items-center justify-between group">
      <div className="flex items-center gap-6">
        <div className={`w-16 h-16 ${color} rounded-[1.5rem] flex items-center justify-center group-hover:rotate-6 transition-transform`}>
          {icon}
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
          <p className="text-3xl font-black text-slate-900 tracking-tighter italic">{value}</p>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <div className="flex items-center text-[9px] font-black text-indigo-500 bg-indigo-50 px-2 py-1 rounded-lg uppercase">
          {trend}
        </div>
      </div>
    </div>
  );
}