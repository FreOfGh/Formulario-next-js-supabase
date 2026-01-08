"use client";

import React, { useState, useMemo } from "react";
import { 
  MapPin, ChevronLeft, User, Phone, Mail, 
  ArrowRight, Banknote, Landmark, PieChart, 
  TrendingUp, Users, Download
} from "lucide-react";

export default function InscripcionesPorDiocesis({ data }: { data: any[] }) {
  const [selectedDiocesis, setSelectedDiocesis] = useState<string | null>(null);

  // 1. Agrupación avanzada con useMemo para rendimiento
  const agrupado = useMemo(() => {
    return data.reduce((acc: any, curr) => {
      const sede = curr.diocesis || "Sin Sede";
      if (!acc[sede]) {
        acc[sede] = { 
          total: 0, 
          items: [], 
          recaudoReal: 0, 
          recaudoProyectado: 0 
        };
      }
      
      const monto = Number(curr.precio_pactado) || 0;
      acc[sede].total += 1;
      acc[sede].items.push(curr);
      acc[sede].recaudoProyectado += monto;
      
      if (curr.estado === 'aprobada') {
        acc[sede].recaudoReal += monto;
      }
      
      return acc;
    }, {});
  }, [data]);

  const inscritosDetalle = selectedDiocesis ? agrupado[selectedDiocesis]?.items : [];
  const finanzasSede = selectedDiocesis ? agrupado[selectedDiocesis] : null;

  // Cálculo de porcentaje de cumplimiento para la sede seleccionada
  const porcentajeCumplimiento = finanzasSede 
    ? (finanzasSede.recaudoReal / finanzasSede.recaudoProyectado) * 100 
    : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* HEADER DINÁMICO CON CONTEXTO DE EVENTO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <PieChart size={14} className="text-indigo-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Reporte Financiero por Jurisdicción
            </span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 uppercase italic leading-none">
            {selectedDiocesis ? selectedDiocesis : "Análisis de Sedes"}
          </h2>
        </div>
        
        {selectedDiocesis ? (
          <button 
            onClick={() => setSelectedDiocesis(null)}
            className="flex items-center gap-2 text-slate-900 font-black text-[10px] uppercase bg-slate-100 px-6 py-3 rounded-2xl hover:bg-slate-200 transition-all"
          >
            <ChevronLeft size={16} strokeWidth={3} /> Volver al resumen
          </button>
        ) : (
          <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-2xl border border-indigo-100">
            <TrendingUp size={16} />
            <span className="text-[10px] font-black uppercase">{Object.keys(agrupado).length} Sedes Activas</span>
          </div>
        )}
      </div>

      {!selectedDiocesis ? (
        /* VISTA 1: GRID DE SEDES (ESTILO DASHBOARD) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(agrupado).map(([nombre, info]: any) => {
            const cumplimiento = (info.recaudoReal / info.recaudoProyectado) * 100;
            return (
              <button 
                key={nombre} 
                onClick={() => setSelectedDiocesis(nombre)}
                className="bg-white p-8 rounded-[3rem] border border-slate-100 flex flex-col group hover:border-indigo-400 hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 text-left relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-8">
                  <div className="w-14 h-14 bg-slate-50 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white rounded-2xl flex items-center justify-center transition-all duration-500 shadow-inner">
                    <MapPin size={28} />
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1 text-slate-900 font-black text-2xl">
                      <Users size={16} className="text-indigo-500" />
                      {info.total}
                    </div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Inscritos Totales</p>
                  </div>
                </div>

                <h4 className="font-black text-slate-800 uppercase text-xl tracking-tighter mb-6 group-hover:text-indigo-600 transition-colors">
                  {nombre}
                </h4>
                
                <div className="mt-auto space-y-3">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[9px] font-black text-slate-300 uppercase mb-1">Recaudo Real</p>
                      <p className="text-lg font-black text-emerald-600 leading-none">
                        ${info.recaudoReal.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-800">{cumplimiento.toFixed(0)}%</p>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-50">
                    <div 
                      className={`h-full transition-all duration-1000 ease-out ${cumplimiento === 100 ? 'bg-indigo-600' : 'bg-emerald-500'}`}
                      style={{ width: `${cumplimiento}%` }}
                    ></div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        /* VISTA 2: DETALLE PROFUNDO DE LA SEDE */
        <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-500">
          
          {/* KPI'S DE LA SEDE */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-slate-200 relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4 opacity-60">
                  <Landmark size={20} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Caja Real</span>
                </div>
                <h3 className="text-4xl font-black italic tracking-tighter">
                  ${finanzasSede?.recaudoReal.toLocaleString()}
                </h3>
                <p className="text-[10px] mt-2 font-bold text-emerald-400 uppercase tracking-widest">Dinero Verificado</p>
              </div>
              <Banknote className="absolute -right-4 -bottom-4 text-white/5 group-hover:scale-110 transition-transform duration-700" size={140} />
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4 text-slate-400">
                <TrendingUp size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest">Meta de Recaudo</span>
              </div>
              <h3 className="text-4xl font-black text-slate-800 italic tracking-tighter">
                ${finanzasSede?.recaudoProyectado.toLocaleString()}
              </h3>
              <div className="mt-4 flex items-center gap-2">
                <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full" style={{ width: `${porcentajeCumplimiento}%` }}></div>
                </div>
                <span className="text-[11px] font-black text-indigo-600">{porcentajeCumplimiento.toFixed(1)}%</span>
              </div>
            </div>

            <div className="bg-indigo-50 p-8 rounded-[2.5rem] border-2 border-indigo-100 flex flex-col justify-center text-center">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2">Estado del Grupo</p>
              <div className="flex items-center justify-center gap-3">
                <Users size={32} className="text-indigo-600" />
                <span className="text-5xl font-black text-indigo-900 tracking-tighter">{finanzasSede?.total}</span>
              </div>
            </div>
          </div>

          {/* LISTADO DE PERSONAS CON FILTRO DE ESTADO VISUAL */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-4">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Listado Nominal - {selectedDiocesis}</h3>
              <button className="text-[10px] font-black text-indigo-600 flex items-center gap-2 hover:underline">
                <Download size={14} /> EXPORTAR EXCEL
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {inscritosDetalle.map((i: any) => (
                <div key={i.id} className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center justify-between group hover:shadow-md transition-all">
                  <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm transition-all ${
                      i.estado === 'aprobada' 
                        ? 'bg-emerald-500 text-white rotate-3 group-hover:rotate-0' 
                        : 'bg-slate-100 text-slate-400'
                    }`}>
                      {i.nombre[0]}{i.apellido[0]}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 uppercase text-sm tracking-tight">{i.nombre} {i.apellido}</h4>
                      <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-slate-400">
                        <span className="flex items-center gap-1"><Mail size={10} /> {i.email}</span>
                        <span className="bg-slate-50 px-2 py-0.5 rounded text-indigo-500 uppercase">{i.segmentacion}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right border-l border-slate-50 pl-8">
                    <p className="text-lg font-black text-slate-800 tracking-tighter leading-none">
                      ${Number(i.precio_pactado).toLocaleString()}
                    </p>
                    <div className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                      i.estado === 'aprobada' 
                        ? 'bg-emerald-50 text-emerald-600' 
                        : 'bg-amber-50 text-amber-600'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${i.estado === 'aprobada' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></div>
                      {i.estado}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}