"use client";

import React, { useState, useMemo } from "react";
import { 
  CheckCircle, XCircle, Eye, Search, Filter, 
  User, MapPin, AlertCircle, Loader2, Calendar,
  ExternalLink, Clock
} from "lucide-react";
import { createClient } from "@/utils/supabase/clients";

export default function AprobarRechazar({ data, onUpdate }: { data: any[], onUpdate: () => void }) {
  const supabase = createClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDiocesis, setFilterDiocesis] = useState("todas");
  const [filterEstado, setFilterEstado] = useState("pendiente"); // Nuevo: Filtro por estado
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // 1. Extraer lista única de diócesis para el filtro
  const listaDiocesis = useMemo(() => {
    return Array.from(new Set(data.map(i => i.diocesis))).sort();
  }, [data]);

  // 2. Lógica de Filtrado refinada
  const inscritosFiltrados = useMemo(() => {
    return data.filter((i) => {
      const matchEstado = filterEstado === "todos" || i.estado === filterEstado;
      const matchSearch = (i.nombre + " " + i.apellido).toLowerCase().includes(searchTerm.toLowerCase()) || 
                          i.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchDiocesis = filterDiocesis === "todas" || i.diocesis === filterDiocesis;
      
      return matchEstado && matchSearch && matchDiocesis;
    });
  }, [data, searchTerm, filterDiocesis, filterEstado]);

  // 3. Acción de cambio de estado
  const handleUpdateEstado = async (id: string, nuevoEstado: string) => {
    const confirmacion = nuevoEstado === 'rechazada' 
      ? confirm("¿Estás seguro de rechazar este pago? El usuario deberá subir el comprobante nuevamente.") 
      : true;

    if (!confirmacion) return;

    setIsUpdating(id);
    const { error } = await supabase
      .from("inscripciones")
      .update({ 
        estado: nuevoEstado,
        // Opcional: podrías guardar quién aprobó y cuándo
        // validado_por: user.id,
        // fecha_validacion: new Date().toISOString()
      })
      .eq("id", id);
    
    if (!error) {
      onUpdate();
    } else {
      alert("Error al actualizar: " + error.message);
    }
    setIsUpdating(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* HEADER DINÁMICO */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Clock size={14} className="text-amber-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Control de Tesorería
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 uppercase italic leading-none">
            Validación de Pagos
          </h2>
          <p className="text-slate-500 text-sm mt-2 font-medium">
            Gestionando inscripciones del <span className="text-indigo-600 font-bold">evento actual</span>.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-2xl flex items-center gap-2 border transition-colors ${
            inscritosFiltrados.length > 0 ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-slate-50 text-slate-400 border-slate-100'
          }`}>
            <AlertCircle size={16} />
            <span className="text-[10px] font-black uppercase">{inscritosFiltrados.length} Registros en vista</span>
          </div>
        </div>
      </div>

      {/* TOOLBAR AVANZADO */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="relative lg:col-span-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input 
            type="text"
            placeholder="Buscar participante..."
            className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl py-3 pl-12 pr-4 text-sm font-bold outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
          <select 
            className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl py-3 pl-10 pr-4 text-[11px] font-black uppercase appearance-none cursor-pointer outline-none"
            value={filterDiocesis}
            onChange={(e) => setFilterDiocesis(e.target.value)}
          >
            <option value="todas">Todas las Sedes</option>
            {listaDiocesis.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="relative">
          <select 
            className="w-full bg-slate-900 text-white rounded-2xl py-3 px-6 text-[11px] font-black uppercase appearance-none cursor-pointer outline-none hover:bg-black transition-colors"
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
          >
            <option value="pendiente">⏳ Pendientes</option>
            <option value="aprobada">✅ Aprobadas</option>
            <option value="rechazada">❌ Rechazadas</option>
            <option value="todos">📋 Mostrar Todos</option>
          </select>
        </div>
      </div>

      {/* LISTADO TIPO TABLA MODERNA */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Participante / Sede</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Recibo de Pago</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Inversión</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones de Verificación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {inscritosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200">
                        <Search size={32} />
                      </div>
                      <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Sin resultados en esta categoría</p>
                    </div>
                  </td>
                </tr>
              ) : (
                inscritosFiltrados.map((i) => (
                  <tr key={i.id} className="hover:bg-indigo-50/30 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white border-2 border-slate-100 text-slate-400 group-hover:border-indigo-200 group-hover:text-indigo-600 rounded-2xl flex items-center justify-center transition-all shadow-sm">
                          <User size={20} />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 uppercase text-xs italic tracking-tight">{i.nombre} {i.apellido}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[9px] font-black uppercase">{i.diocesis}</span>
                            <span className="text-[9px] font-bold text-slate-400 italic">{i.segmentacion}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      {i.imagen_url ? (
                        <a 
                          href={i.imagen_url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-5 py-2.5 rounded-xl text-[10px] font-black hover:bg-indigo-600 hover:text-white transition-all group/btn"
                        >
                          <Eye size={14} /> EXPLORAR <ExternalLink size={12} className="opacity-50 group-hover/btn:translate-x-0.5 transition-transform" />
                        </a>
                      ) : (
                        <div className="flex items-center justify-center gap-1 text-slate-300 italic">
                          <AlertCircle size={14} />
                          <span className="text-[10px] font-bold">Sin adjunto</span>
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-base font-black text-slate-800 tracking-tighter">
                          ${Number(i.precio_pactado).toLocaleString()}
                        </span>
                        <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Monto Final</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      {isUpdating === i.id ? (
                        <Loader2 className="animate-spin text-indigo-500 ml-auto" size={24} />
                      ) : (
                        <div className="flex justify-end gap-2">
                          {i.estado !== 'rechazada' && (
                            <button 
                              onClick={() => handleUpdateEstado(i.id, 'rechazada')}
                              className="w-11 h-11 flex items-center justify-center text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                              title="Rechazar y pedir nuevo comprobante"
                            >
                              <XCircle size={22} />
                            </button>
                          )}
                          {i.estado !== 'aprobada' && (
                            <button 
                              onClick={() => handleUpdateEstado(i.id, 'aprobada')}
                              className="px-6 h-11 bg-white border-2 border-slate-100 text-slate-400 hover:text-emerald-600 hover:border-emerald-500 rounded-xl transition-all font-black text-[10px] uppercase flex items-center gap-2 shadow-sm"
                            >
                              <CheckCircle size={18} /> Aprobar Pago
                            </button>
                          )}
                          {i.estado === 'aprobada' && (
                            <div className="flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase pr-4">
                              <CheckCircle size={18} /> Verificado
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}