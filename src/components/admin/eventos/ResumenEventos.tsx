"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/clients";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, YAxis } from "recharts";
import { Trophy, Users, Star, Loader2, ArrowUpRight } from "lucide-react";

export default function ResumenEventos() {
  const supabase = createClient();
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Consultamos la vista de resumen que mencionaste
        const { data, error } = await supabase
          .from("vista_resumen_eventos")
          .select("*")
          .order('fecha_inicio', { ascending: true });

        if (error) throw error;
        setStats(data || []);
      } catch (err) {
        console.error("Error cargando estadísticas:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [supabase]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 text-slate-400">
      <Loader2 className="animate-spin mb-4 text-indigo-500" size={32} />
      <p className="text-[10px] font-black uppercase tracking-[0.3em]">Analizando Historial...</p>
    </div>
  );

  // Cálculos rápidos para las tarjetas
  const totalInscritos = stats.reduce((acc, curr) => acc + (curr.total_inscritos || 0), 0);
  const totalRecaudado = stats.reduce((acc, curr) => acc + (curr.total_recaudado || 0), 0);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* TARJETAS DE MÉTRICAS GLOBALES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatMiniCard 
          label="Eventos Registrados" 
          value={stats.length} 
          icon={<Star className="text-amber-500" size={20} />} 
          color="bg-amber-50"
        />
        <StatMiniCard 
          label="Comunidad Global" 
          value={totalInscritos.toLocaleString()} 
          icon={<Users className="text-indigo-500" size={20} />} 
          color="bg-indigo-50"
        />
        <StatMiniCard 
          label="Recaudación Total" 
          value={`$${(totalRecaudado / 1e6).toFixed(2)}M`} 
          icon={<Trophy className="text-emerald-500" size={20} />} 
          color="bg-emerald-50"
          isTrend
        />
      </div>

      {/* GRÁFICA COMPARATIVA */}
      <div className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-2xl shadow-slate-200/50 relative overflow-hidden">
        <div className="flex justify-between items-start mb-10">
          <div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-1">
              Rendimiento Histórico
            </h3>
            <p className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">
              Comparativa de Ingresos
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-full bg-indigo-600" />
               <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Activo</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-full bg-slate-200" />
               <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Pasados</span>
            </div>
          </div>
        </div>

        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis 
                dataKey="nombre" 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}} 
                dy={15}
              />
              <YAxis hide domain={[0, 'auto']} />
              <Tooltip 
                cursor={{fill: '#f1f5f9', radius: 20}} 
                contentStyle={{
                  borderRadius: '24px', 
                  border: 'none', 
                  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
                  padding: '20px'
                }} 
                itemStyle={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '10px'}}
              />
              <Bar dataKey="total_recaudado" radius={[15, 15, 15, 15]} barSize={50}>
                {stats.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.esta_activo ? "#4f46e5" : "#f1f5f9"} 
                    className="transition-all duration-500 hover:opacity-80"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function StatMiniCard({ label, value, icon, color, isTrend }: any) {
  return (
    <div className="bg-white p-8 rounded-[3rem] border border-slate-50 flex items-center justify-between group hover:border-indigo-100 transition-all duration-500 shadow-sm hover:shadow-xl">
      <div className="flex items-center gap-5">
        <div className={`w-14 h-14 ${color} rounded-[1.5rem] flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
          {icon}
        </div>
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">{label}</p>
          <p className="text-3xl font-black text-slate-900 italic tracking-tighter">{value}</p>
        </div>
      </div>
      {isTrend && (
        <div className="bg-emerald-500/10 p-2 rounded-full text-emerald-600">
          <ArrowUpRight size={16} strokeWidth={3} />
        </div>
      )}
    </div>
  );
}