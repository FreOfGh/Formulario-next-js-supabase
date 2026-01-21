"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/clients";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend
} from "recharts";
import { Users, DollarSign, PieChart as PieIcon, Activity, Target, Loader2 } from "lucide-react";

export default function ResumenRolesActivo() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [rolesActivos, setRolesActivos] = useState<any[]>([]);

  useEffect(() => {
    async function fetchRolesDelEventoActivo() {
      setLoading(true);
      try {
        // 1. Buscamos el ID del evento activo primero
        const { data: evento } = await supabase
          .from('eventos')
          .select('id, nombre')
          .eq('esta_activo', true)
          .single();

        if (evento) {
          // 2. Traemos las métricas de roles filtrando por ese evento_id específico
          // Suponiendo que tienes una vista o tabla agregada llamada 'vista_roles_metricas'
          const { data: roles } = await supabase
            .from('tipos_persona')
            .select('*')
            .eq('evento_id', evento.id);

          setRolesActivos(roles || []);
        }
      } catch (err) {
        console.error("Error filtrando roles:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchRolesDelEventoActivo();
  }, [supabase]);

  if (loading) return (
    <div className="h-96 flex flex-col items-center justify-center space-y-4">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Filtrando roles del evento activo...</p>
    </div>
  );

  // Mapeo de datos (Usando los campos de tu SQL: cantidad, total_ingresos, etc.)
  const dataInscritos = rolesActivos.map(r => ({
    name: r.nombre,
    cantidad: r.cantidad_inscritos || 0, // Ajustado a conteo real
    color: r.color || "#6366f1"
  }));

  const dataFinanciera = rolesActivos.map(r => ({
    name: r.nombre,
    ingresos: Number(r.total_recaudado_rol) || 0,
    descuentos: Number(r.total_descuento_rol) || 0,
    color: r.color || "#6366f1"
  }));

  const totalIngresos = dataFinanciera.reduce((acc, curr) => acc + curr.ingresos, 0);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* HEADER DINÁMICO */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Monitoreo en Vivo</span>
          </div>
          <h2 className="text-5xl font-black text-slate-900 uppercase italic leading-none tracking-tighter">
            Roles <span className="text-indigo-600 font-outline-2">Activos</span>
          </h2>
        </div>
        
        <div className="bg-slate-900 text-white p-6 rounded-[2.5rem] shadow-2xl flex flex-col min-w-[240px]">
            <span className="text-[9px] font-black uppercase text-indigo-400 tracking-[0.2em] mb-2">Ingreso por Roles Activos</span>
            <div className="flex items-center justify-between">
                <span className="text-3xl font-black italic">${totalIngresos.toLocaleString()}</span>
                <DollarSign className="text-emerald-400" size={24} />
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* GRÁFICO: DISTRIBUCIÓN DE ROLES */}
        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-[10px] font-black uppercase text-slate-400 mb-10 tracking-widest flex items-center gap-2">
            <Users size={16} className="text-indigo-600" /> Participantes Actuales
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataInscritos}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '20px', border: 'none'}} />
                <Bar dataKey="cantidad" radius={[12, 12, 12, 12]} barSize={50}>
                  {dataInscritos.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRÁFICO: IMPACTO FINANCIERO */}
        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-[10px] font-black uppercase text-slate-400 mb-10 tracking-widest flex items-center gap-2">
            <PieIcon size={16} className="text-emerald-500" /> Distribución de Recaudo
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataFinanciera}
                  dataKey="ingresos"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={10}
                  stroke="none"
                >
                  {dataFinanciera.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{fontSize: '9px', fontWeight: '900', textTransform: 'uppercase'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}