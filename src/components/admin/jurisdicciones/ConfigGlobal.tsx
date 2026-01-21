"use client";

import React, { useState, useEffect, useCallback } from "react";
import { LayoutGrid, Map, Save, Loader2, CheckCircle2, DollarSign, AlertTriangle } from "lucide-react";
import { createClient } from "@/utils/supabase/clients";

export default function ConfigGlobal() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Estado para el contexto del evento
  const [eventoActivo, setEventoActivo] = useState<any>(null);

  // Estados de configuración (Tabla: configuracion_evento)
  const [modo, setModo] = useState("diocesis"); 
  const [precioGlobal, setPrecioGlobal] = useState(0);

  const fetchConfigData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Primero identificamos el evento activo
      const { data: evento, error: errorEv } = await supabase
        .from('eventos')
        .select('id, nombre')
        .eq('esta_activo', true)
        .single();

      if (errorEv || !evento) throw new Error("No hay evento activo");
      setEventoActivo(evento);

      // 2. Buscamos la configuración que pertenezca a ese evento_id
      const { data: config, error: errorConf } = await supabase
        .from('configuracion_evento')
        .select('*')
        .eq('evento_id', evento.id)
        .single();

      if (config) {
        setModo(config.modo_precio || "diocesis");
        setPrecioGlobal(config.precio_global_base || 0);
      } else {
        // Si no existe fila de configuración para este evento, podríamos crearla o usar defaults
        console.warn("No se encontró fila de configuración para este evento.");
      }
    } catch (err) {
      console.error("Error de sincronización:", err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchConfigData();
  }, [fetchConfigData]);

  async function handleSave() {
    if (!eventoActivo) return;
    setSaving(true);
    
    try {
      // Actualizamos la tabla 'configuracion_evento' filtrando por el 'evento_id' activo
      const { error } = await supabase
        .from("configuracion_evento")
        .update({
          modo_precio: modo,
          precio_global_base: Number(precioGlobal),
          updated_at: new Date().toISOString(),
        })
        .eq("evento_id", eventoActivo.id);

      if (error) throw error;

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error: any) {
      alert("Error al guardar en configuracion_evento: " + error.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-80 text-slate-400">
      <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
      <p className="text-[10px] font-black uppercase tracking-widest">Consultando Tablas de Configuración...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* HEADER */}
      <div className="px-2">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500">
            Configuración Vinculada a: {eventoActivo?.nombre}
          </span>
        </div>
        <h2 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
          Estrategia de <span className="text-indigo-600">Recaudo</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* MODO INDIVIDUAL */}
        <button 
          onClick={() => setModo("diocesis")}
          className={`p-10 rounded-[3rem] border-2 text-left transition-all duration-300 relative ${
            modo === 'diocesis' 
            ? 'border-indigo-600 bg-white shadow-xl' 
            : 'border-slate-100 bg-slate-50 opacity-60'
          }`}
        >
          <Map className={`mb-4 ${modo === 'diocesis' ? 'text-indigo-600' : 'text-slate-300'}`} size={32} />
          <h3 className="font-black text-slate-900 uppercase italic text-xl">Precios por Diócesis</h3>
          <p className="text-[11px] text-slate-500 mt-2 font-bold uppercase tracking-tight">Usa el valor individual de cada sede.</p>
          {modo === 'diocesis' && <CheckCircle2 className="absolute top-8 right-8 text-indigo-600" size={24} />}
        </button>

        {/* MODO GLOBAL */}
        <button 
          onClick={() => setModo("global")}
          className={`p-10 rounded-[3rem] border-2 text-left transition-all duration-300 relative ${
            modo === 'global' 
            ? 'border-indigo-600 bg-white shadow-xl' 
            : 'border-slate-100 bg-slate-50 opacity-60'
          }`}
        >
          <LayoutGrid className={`mb-4 ${modo === 'global' ? 'text-indigo-600' : 'text-slate-300'}`} size={32} />
          <h3 className="font-black text-slate-900 uppercase italic text-xl">Precio Global Único</h3>
          <p className="text-[11px] text-slate-500 mt-2 font-bold uppercase tracking-tight">Ignora sedes y aplica tarifa única.</p>
          {modo === 'global' && <CheckCircle2 className="absolute top-8 right-8 text-indigo-600" size={24} />}
        </button>
      </div>

      {/* INPUT PRECIO GLOBAL */}
      {modo === "global" && (
        <div className="bg-slate-900 p-10 rounded-[3rem] text-white animate-in slide-in-from-top-4">
          <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-4">Monto Nacional</label>
          <div className="relative max-w-sm">
            <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-500" size={28} />
            <input 
              type="number"
              className="w-full bg-white/10 border-none rounded-[2rem] py-6 pl-16 text-3xl font-black focus:ring-2 focus:ring-indigo-500 outline-none"
              value={precioGlobal}
              onChange={(e) => setPrecioGlobal(Number(e.target.value))}
            />
          </div>
        </div>
      )}

      {/* GUARDAR */}
      <div className="flex items-center gap-6">
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-slate-900 text-white font-black uppercase px-12 py-6 rounded-2xl shadow-lg hover:bg-indigo-600 transition-all flex items-center gap-3 active:scale-95"
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          {saving ? "Guardando..." : "Sincronizar Cambios"}
        </button>
        {showSuccess && (
          <div className="text-emerald-600 font-black text-[11px] uppercase tracking-widest flex items-center gap-2">
            <CheckCircle2 size={18} /> ¡Base de datos actualizada!
          </div>
        )}
      </div>
    </div>
  );
}