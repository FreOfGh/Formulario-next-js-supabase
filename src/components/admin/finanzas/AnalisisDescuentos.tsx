"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/clients";
import { 
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, 
  Tooltip, Cell, CartesianGrid 
} from "recharts";
import { MapPin, Trophy, Globe, TrendingUp, Loader2 } from "lucide-react";

export default function JurisdiccionesTop() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    async function fetchJurisdicciones() {
      try {
        setLoading(true);

        // 1. Obtener el ID del evento activo
        const { data: evento } = await supabase
          .from('eventos')
          .select('id')
          .eq('esta_activo', true)
          .single();

        if (!evento) return;

        // 2. Traer inscripciones con el nombre de su jurisdicción
        // Relación: inscripciones -> jurisdicciones (vía jurisdiccion_id)
        const { data: inscritos, error } = await supabase
          .from('inscripciones')
          .select(`
            monto_pago,
            jurisdicciones ( nombre )
          `)
          .eq('evento_id', evento.id);

        if (error) throw error;

        // 3. Procesar y agrupar datos
        const grouped = (inscritos || []).reduce((acc: any, curr: any) => {
          const name = curr.jurisdicciones?.nombre || "Sin Asignar";
          if (!acc[name]) {
            acc[name] = { name, monto: 0, inscritos: 0 };
          }
          acc[name].monto += curr.monto_pago || 0;
          acc[name].inscritos += 1;
          return acc;
        }, {});

        // 4. Formatear para el gráfico y ordenar por monto
        const formatted = Object.values(grouped)
          .sort((a: any, b: any) => b.monto - a.monto)
          .map((item: any, index: number) => ({
            ...item,
            // Escala de azules/indigos para el look premium
            color: index === 0 ? "#4f46e5" : index === 1 ? "#6366f1" : "#818cf8",
          }));

        setData(formatted);
      } catch (error) {
        console.error("Error cargando jurisdicciones:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchJurisdicciones();
  }, [supabase]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 p-4 rounded-2xl shadow-2xl border border-slate-800">
          <p className="text-[10px] font-black uppercase text-indigo-400 mb-1">
            {payload[0].payload.name}
          </p>
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

  if (loading) return (
    <div className="h-96 flex flex-col items-center justify-center text-slate-400 gap-4">
      <Loader2 className="animate-spin text-indigo-600" size={32} />
      <span className="text-[10px] font-black uppercase tracking-widest">Mapeando Geografía...</span>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-1000">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Globe size={16} className="text-indigo-600" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Distribución Regional</span>
          </div>
          <h2 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
            Top Jurisdicciones
          </h2>
          <p className="text-slate-500 text-sm mt-2 font-medium italic">Liderazgo por recaudación neta acumulada.</p>
        </div>
        
        {data.length > 0 && (
          <div className="bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 flex items-center gap-2">
              <Trophy size={14} className="text-indigo-600" />
              <span className="text-[10px] font-black uppercase text-indigo-700 leading-none">Líder: {data[0].name}</span>
          </div>
        )}
      </div>

      {/* CARD PRINCIPAL DEL GRÁFICO */}
      <div className="bg-white p-8 md:p-12 rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 relative overflow-hidden group">
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
                tick={{fontSize: 10, fontWeight: 900, fill: '#1e293b'}} 
                width={150}
              />
              <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
              <Bar dataKey="monto" radius={[0, 20, 20, 0]} barSize={32}>
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color} 
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

      {/* FOOTER ANALÍTICO DE LOS TOP 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.slice(0, 3).map((item, idx) => (
            <div key={item.name} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-lg transition-all">
                <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Posición #{idx + 1}</p>
                    <p className="text-sm font-black text-slate-800 uppercase italic leading-none">{item.name}</p>
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