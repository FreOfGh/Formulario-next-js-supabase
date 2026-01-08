"use client";

import React, { useState, useMemo } from "react";
import { 
  UserCircle2, ChevronLeft, Mail, Wallet, 
  BadgePercent, Users2, Info, ArrowUpRight,
  TrendingUp, CreditCard
} from "lucide-react";

export default function InscripcionesPorRol({ data }: { data: any[] }) {
  const [selectedRol, setSelectedRol] = useState<string | null>(null);

  // 1. Agrupación y Cálculos con useMemo
  const agrupado = useMemo(() => {
    return data.reduce((acc: any, curr) => {
      const rol = curr.segmentacion || "Sin Definir";
      if (!acc[rol]) {
        acc[rol] = { 
          total: 0, 
          items: [], 
          recaudoReal: 0,
          recaudoProyectado: 0
        };
      }
      
      const monto = Number(curr.precio_pactado) || 0;
      acc[rol].total += 1;
      acc[rol].items.push(curr);
      acc[rol].recaudoProyectado += monto;
      
      if (curr.estado === 'aprobada') {
        acc[rol].recaudoReal += monto;
      }
      
      return acc;
    }, {});
  }, [data]);

  const inscritosDetalle = selectedRol ? agrupado[selectedRol]?.items : [];
  const estadisticasRol = selectedRol ? agrupado[selectedRol] : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* HEADER DINÁMICO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users2 size={14} className="text-indigo-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Segmentación de Audiencia
            </span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 uppercase italic leading-none">
            {selectedRol ? `Perfil: ${selectedRol}` : "Distribución por Roles"}
          </h2>
        </div>
        
        {selectedRol && (
          <button 
            onClick={() => setSelectedRol(null)}
            className="group flex items-center gap-2 text-slate-900 font-black text-[10px] uppercase bg-slate-100 px-6 py-3 rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-sm"
          >
            <ChevronLeft size={16} strokeWidth={3} className="group-hover:-translate-x-1 transition-transform" /> 
            Volver a la vista general
          </button>
        )}
      </div>

      {!selectedRol ? (
        /* VISTA 1: GRID DE ROLES */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(agrupado).map(([nombre, info]: any) => {
            const porcentajePoblacion = (info.total / data.length) * 100;
            return (
              <button 
                key={nombre} 
                onClick={() => setSelectedRol(nombre)}
                className="bg-white p-8 rounded-[3rem] border border-slate-100 flex flex-col group hover:border-indigo-400 hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 text-left relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-8">
                  <div className="w-16 h-16 bg-slate-50 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white rounded-[1.5rem] flex items-center justify-center transition-all duration-500 shadow-inner">
                    <UserCircle2 size={32} />
                  </div>
                  <div className="text-right">
                    <span className="text-4xl font-black text-slate-900 italic tracking-tighter group-hover:text-indigo-600 transition-colors">
                      {info.total}
                    </span>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Inscritos</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-6">
                  <h4 className="font-black text-slate-800 uppercase text-xl tracking-tighter">{nombre}</h4>
                  <ArrowUpRight size={18} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                </div>
                
                <div className="space-y-4 mt-auto">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Peso en el Evento</span>
                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                      {porcentajePoblacion.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5">
                    <div 
                      className="bg-indigo-600 h-full rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${porcentajePoblacion}%` }}
                    ></div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        /* VISTA 2: DETALLE DEL ROL */
        <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
          
          {/* DASHBOARD DEL ROL */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-100">
              <div className="flex items-center gap-2 mb-2 opacity-70">
                <TrendingUp size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Recaudo Logrado</span>
              </div>
              <h3 className="text-3xl font-black italic tracking-tighter">${estadisticasRol?.recaudoReal.toLocaleString()}</h3>
              <p className="text-[9px] font-bold mt-2 uppercase tracking-widest text-indigo-200">Total ingresos validados</p>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-2 text-slate-400">
                <CreditCard size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Por Recaudar</span>
              </div>
              <h3 className="text-3xl font-black text-slate-900 italic tracking-tighter">
                ${(estadisticasRol?.recaudoProyectado - estadisticasRol?.recaudoReal).toLocaleString()}
              </h3>
              <p className="text-[9px] font-bold mt-2 uppercase tracking-widest text-amber-500">Pendiente de validación</p>
            </div>

            <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-200 flex flex-col justify-center">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Promedio/Persona</p>
                  <p className="text-2xl font-black text-slate-800 italic">
                    ${Math.round(estadisticasRol?.recaudoProyectado / estadisticasRol?.total).toLocaleString()}
                  </p>
                </div>
                <BadgePercent size={32} className="text-slate-200" />
              </div>
            </div>
          </div>

          {/* LISTADO DE INTEGRANTES */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 px-4">
              <Info size={16} className="text-slate-300" />
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Directorio de {selectedRol}
              </h3>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {inscritosDetalle.map((i: any) => (
                <div key={i.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-indigo-200 hover:shadow-lg transition-all duration-300 group">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-xs shadow-lg group-hover:scale-110 transition-transform">
                      {i.nombre[0]}{i.apellido[0]}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 uppercase text-sm tracking-tight">{i.nombre} {i.apellido}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md uppercase tracking-tighter">
                          {i.diocesis}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                          <Mail size={12} className="text-slate-300" /> {i.email}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 justify-between md:justify-end border-t md:border-none pt-4 md:pt-0">
                    <div className="text-left md:text-right">
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Pago Pactado</p>
                      <p className="text-lg font-black text-slate-800 italic tracking-tighter leading-none">
                        ${Number(i.precio_pactado).toLocaleString()}
                      </p>
                    </div>
                    <div className={`min-w-[100px] text-center px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-colors ${
                      i.estado === 'aprobada' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                      i.estado === 'pendiente' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                    }`}>
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