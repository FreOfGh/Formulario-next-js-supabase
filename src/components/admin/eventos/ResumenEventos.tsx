"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/clients";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Trophy, Users, Star } from "lucide-react";

export default function ResumenEventos() {
  const supabase = createClient();
  const [stats, setStats] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      const { data } = await supabase.from("vista_resumen_eventos").select("*");
      setStats(data || []);
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatMiniCard label="Eventos Totales" value={stats.length} icon={<Star className="text-amber-500" />} />
        <StatMiniCard label="Inscritos Globales" value={stats.reduce((acc, curr) => acc + curr.total_inscritos, 0)} icon={<Users className="text-indigo-500" />} />
        <StatMiniCard label="Recaudación Histórica" value={`$${(stats.reduce((acc, curr) => acc + curr.total_recaudado, 0) / 1e6).toFixed(1)}M`} icon={<Trophy className="text-emerald-500" />} />
      </div>

      <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8">Comparativa de Recaudación por Evento</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats}>
              <XAxis dataKey="nombre" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900}} />
              <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
              <Bar dataKey="total_recaudado" radius={[10, 10, 0, 0]} barSize={40}>
                {stats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.esta_activo ? "#4f46e5" : "#e2e8f0"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function StatMiniCard({ label, value, icon }: any) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex items-center gap-5">
      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center">{icon}</div>
      <div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
        <p className="text-2xl font-black text-slate-900 italic">{value}</p>
      </div>
    </div>
  );
}