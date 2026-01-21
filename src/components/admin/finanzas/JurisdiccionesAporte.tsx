"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/clients";
import { BadgePercent, Users, HeartHandshake, TrendingDown, Sparkles, Loader2 } from "lucide-react";

export default function AnalisisDescuentos() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [impacto, setImpacto] = useState<any[]>([]);

  useEffect(() => {
    async function fetchImpactoSocial() {
      try {
        setLoading(true);

        // 1. Obtener Evento Activo y su Configuración
        const { data: evento } = await supabase
          .from('eventos')
          .select('id, configuracion_evento(modo_precio, precio_global_base, metodo_descuento)')
          .eq('esta_activo', true)
          .single();

        if (!evento) return;

        // 2. Traer Tipos de Persona y sus Inscritos
        // Usamos una consulta que cuente inscripciones por segmento
        const [tiposRes, inscritosRes] = await Promise.all([
          supabase.from('tipos_persona').select('*').eq('evento_id', evento.id),
          supabase.from('inscripciones').select('segmentacion, precio_pactado').eq('evento_id', evento.id)
        ]);

        const tipos = tiposRes.data || [];
        const inscritos = inscritosRes.data || [];
        const config = evento.configuracion_evento as any;

        // 3. Calcular el impacto por cada tipo (solo si tienen descuento)
        const analisis = tipos
          .filter(tipo => (tipo.descuento_porcentaje > 0 || tipo.descuento_fijo > 0))
          .map((tipo, index) => {
            const inscritosDeEsteTipo = inscritos.filter(i => i.segmentacion === tipo.valor);
            const cantidad = inscritosDeEsteTipo.length;
            
            // Calculamos el ahorro unitario
            let ahorroUnitario = 0;
            const precioBase = config.precio_global_base || 0;

            if (config.metodo_descuento === 'porcentaje') {
              ahorroUnitario = (precioBase * (tipo.descuento_porcentaje || 0)) / 100;
            } else {
              ahorroUnitario = tipo.descuento_fijo || 0;
            }

            const ahorroTotal = ahorroUnitario * cantidad;

            return {
              rol: tipo.nombre,
              ahorro: ahorroTotal > 0 ? `$${(ahorroTotal / 1000000).toFixed(1)}M` : "$0",
              rawAhorro: ahorroTotal,
              inscritos: cantidad,
              color: index % 2 === 0 ? "bg-indigo-600" : "bg-slate-900",
              shadow: index % 2 === 0 ? "shadow-indigo-200" : "shadow-slate-300"
            };
          })
          .sort((a, b) => b.rawAhorro - a.rawAhorro); // Ordenar por mayor impacto

        setImpacto(analisis);
      } catch (error) {
        console.error("Error calculando impacto:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchImpactoSocial();
  }, []);

  if (loading) return (
    <div className="h-48 flex items-center justify-center text-slate-400">
      <Loader2 className="animate-spin mr-2" /> Analizando subsidios y beneficios...
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
      {/* TÍTULO */}
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
              <span className="text-[10px] font-black uppercase">Subsidios Aplicados</span>
           </div>
        </div>
      </div>

      {/* GRID DE IMPACTO DINÁMICO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {impacto.length > 0 ? impacto.map((i) => (
          <div 
            key={i.rol} 
            className={`${i.color} p-10 rounded-[3.5rem] text-white flex justify-between items-center shadow-2xl ${i.shadow} relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500`}
          >
            <div className="absolute -right-4 -top-4 bg-white/10 w-24 h-24 rounded-full blur-2xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={12} className="text-amber-400" />
                <p className="text-[10px] font-black uppercase text-white/60 tracking-[0.2em]">{i.rol}</p>
              </div>
              <h4 className="text-5xl font-black italic tracking-tighter leading-none">{i.ahorro}</h4>
              <div className="mt-6 flex flex-col">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Ahorro Generado</span>
                <span className="text-xs font-bold text-white/80">Inversión Social</span>
              </div>
            </div>

            <div className="relative z-10 text-right flex flex-col items-end">
              <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-md mb-6 border border-white/20">
                <BadgePercent size={32} className="text-white opacity-90" />
              </div>
              <div className="flex flex-col items-end">
                <div className="text-3xl font-black">{i.inscritos}</div>
                <div className="flex items-center gap-1 text-[10px] font-black text-white/50 uppercase tracking-tighter mt-1">
                  <Users size={10} /> Beneficiarios
                </div>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-2 p-12 text-center bg-slate-50 rounded-[3rem] border border-dashed border-slate-300 text-slate-400 font-bold uppercase text-xs">
            No se han aplicado descuentos en este evento aún
          </div>
        )}
      </div>

      {/* BANNER DE RESUMEN FINAL */}
      <div className="p-8 bg-slate-50 rounded-[3rem] border border-slate-200/50 border-dashed flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-indigo-600">
                <HeartHandshake size={24} />
            </div>
            <div>
                <p className="text-sm font-bold text-slate-800">Compromiso con la Formación</p>
                <p className="text-[11px] text-slate-500 font-medium">Cálculo basado en la diferencia entre el precio base y el precio pactado por rol.</p>
            </div>
        </div>
      </div>
    </div>
  );
}