"use client";

import React, { useState, useEffect } from "react";
import { LayoutGrid, Map, Save, Loader2, CheckCircle2, DollarSign } from "lucide-react";
import { createClient } from "@/utils/supabase/clients";

export default function ConfigGlobal() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Estados de configuración
  const [modo, setModo] = useState("individual"); // 'global' o 'individual'
  const [precioGlobal, setPrecioGlobal] = useState(0);

  // 1. Cargar la configuración actual al iniciar
  useEffect(() => {
    fetchConfig();
  }, []);

  async function fetchConfig() {
    setLoading(true);
    const { data, error } = await supabase
      .from("configuracion_evento")
      .select("*")
      .eq("id", 1)
      .single();

    if (data) {
      setModo(data.modo_precio);
      setPrecioGlobal(data.precio_global_base);
    }
    setLoading(false);
  }

  // 2. Guardar los cambios
 async function handleSave() {
  setSaving(true);
  
  // Creamos el objeto de actualización de forma limpia
  const updates = {
    modo_precio: modo,
    precio_global_base: Number(precioGlobal),
    updated_at: new Date().toISOString(), // Aseguramos formato ISO
  };

  const { error } = await supabase
    .from("configuracion_evento")
    .update(updates)
    .eq("id", 1)
    .select(); // El .select() ayuda a forzar la actualización del caché

  if (!error) {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  } else {
    console.error("Error completo:", error);
    alert("Error al guardar: " + error.message);
  }
  setSaving(false);
}

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 text-slate-400">
      <Loader2 className="animate-spin mb-2" />
      <p className="text-xs font-bold uppercase tracking-widest">Cargando configuración...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-black text-slate-900 uppercase italic">Configuración de Precios</h2>
        <p className="text-slate-500 text-sm">Define la estrategia de cobro para todo el evento.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* OPCIÓN: PRECIO INDIVIDUAL */}
        <button 
          onClick={() => setModo("individual")}
          className={`p-8 rounded-[2.5rem] border-2 text-left transition-all relative overflow-hidden ${
            modo === 'individual' 
            ? 'border-indigo-600 bg-indigo-50/30' 
            : 'border-slate-100 bg-white hover:border-slate-200'
          }`}
        >
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
            modo === 'individual' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'
          }`}>
            <Map size={24} />
          </div>
          <h3 className="font-black text-slate-900 uppercase">Precios por Diócesis</h3>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Cada sede tiene su propio precio definido en el módulo de "Listado". Útil para aplicar subsidios regionales.
          </p>
          {modo === 'individual' && <CheckCircle2 className="absolute top-6 right-6 text-indigo-600" size={20} />}
        </button>

        {/* OPCIÓN: PRECIO GLOBAL */}
        <button 
          onClick={() => setModo("global")}
          className={`p-8 rounded-[2.5rem] border-2 text-left transition-all relative overflow-hidden ${
            modo === 'global' 
            ? 'border-indigo-600 bg-indigo-50/30' 
            : 'border-slate-100 bg-white hover:border-slate-200'
          }`}
        >
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
            modo === 'global' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'
          }`}>
            <LayoutGrid size={24} />
          </div>
          <h3 className="font-black text-slate-900 uppercase">Precio Global Único</h3>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Se ignora el precio de cada sede y se aplica un valor estándar para todos los inscritos del país.
          </p>
          {modo === 'global' && <CheckCircle2 className="absolute top-6 right-6 text-indigo-600" size={20} />}
        </button>
      </div>

      {/* PANEL DE EDICIÓN DE PRECIO GLOBAL (Solo se muestra si modo === 'global') */}
      {modo === "global" && (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm animate-in slide-in-from-top-4 duration-500">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-xs">
              <label className="text-[10px] font-black text-slate-400 uppercase px-2">Valor Único de Inscripción</label>
              <div className="relative mt-2">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input 
                  type="number"
                  placeholder="0.00"
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 pl-12 font-black text-slate-700 text-xl"
                  value={precioGlobal}
                  onChange={(e) => setPrecioGlobal(Number(e.target.value))}
                />
              </div>
            </div>
            <div className="flex-1 bg-amber-50 p-4 rounded-2xl border border-amber-100">
              <p className="text-[10px] font-black text-amber-600 uppercase mb-1">Nota importante</p>
              <p className="text-[11px] text-amber-700 leading-tight">
                Al activar el <b>Precio Global</b>, el sistema ignorará los valores individuales guardados en cada diócesis. Este cambio afectará a todos los nuevos registros de inmediato.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* BOTÓN DE GUARDAR GLOBAL */}
      <div className="flex items-center gap-4 pt-4">
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-slate-900 text-white font-black uppercase px-10 py-4 rounded-2xl shadow-xl shadow-slate-200 hover:bg-black transition-all flex items-center gap-3 disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          {saving ? "Guardando..." : "Aplicar Configuración"}
        </button>

        {showSuccess && (
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm animate-in fade-in slide-in-from-left-4">
            <CheckCircle2 size={18} />
            Configuración actualizada con éxito
          </div>
        )}
      </div>
    </div>
  );
}