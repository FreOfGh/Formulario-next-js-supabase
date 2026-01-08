"use client";
import React, { useState, useEffect } from "react";
import { Save, Landmark, Mail, DollarSign, AlertCircle, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/clients";

interface Props {
  initialData?: any;
  onRefresh: () => void;
  onSuccess: () => void;
}

export default function FormDiocesis({ initialData, onRefresh, onSuccess }: Props) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [eventoActivoId, setEventoActivoId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: "",
    precio_base: 0,
    email_encargado: ""
  });

  // 1. Obtener el evento activo al cargar el componente
  useEffect(() => {
    async function getActiveEvent() {
      const { data } = await supabase
        .from("eventos")
        .select("id")
        .eq("esta_activo", true)
        .single();
      
      if (data) setEventoActivoId(data.id);
    }
    getActiveEvent();

    if (initialData) {
      setFormData({
        nombre: initialData.nombre || "",
        precio_base: initialData.precio_base || 0,
        email_encargado: initialData.email_encargado || ""
      });
    }
  }, [initialData, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventoActivoId) {
      alert("Error: No hay un evento activo seleccionado en el sistema.");
      return;
    }

    setLoading(true);

    const payload: any = {
      nombre: formData.nombre,
      precio_base: Number(formData.precio_base),
      email_encargado: formData.email_encargado,
      evento_id: eventoActivoId // <--- Vínculo obligatorio
    };

    let error;
    if (initialData) {
      // MODO EDICIÓN: El evento_id no debería cambiar, pero lo enviamos por consistencia
      const { error: err } = await supabase
        .from("jurisdicciones")
        .update(payload)
        .eq("id", initialData.id);
      error = err;
    } else {
      // MODO CREACIÓN
      const { error: err } = await supabase
        .from("jurisdicciones")
        .insert([payload]);
      error = err;
    }

    if (error) {
      alert("Error: " + error.message);
    } else {
      onRefresh();
      onSuccess();
    }
    setLoading(false);
  };

  // Si aún no tenemos el ID del evento activo, mostramos un estado de carga pequeño
  if (!eventoActivoId && !initialData) {
    return (
      <div className="p-12 text-center bg-white rounded-[2.5rem] border border-slate-100">
        <Loader2 className="animate-spin mx-auto text-indigo-500 mb-4" />
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Sincronizando Entorno...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-[3.5rem] border border-slate-100 shadow-sm max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-300">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-black text-slate-900 uppercase italic leading-none">
            {initialData ? "Editar Jurisdicción" : "Nueva Jurisdicción"}
          </h2>
          <p className="text-[10px] font-bold text-indigo-500 uppercase mt-2 tracking-tighter">
            Configuración para el evento activo
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase px-4">Nombre de la Sede</label>
            <div className="relative mt-2">
              <Landmark className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                required
                type="text"
                placeholder="Ej: Diócesis de Fontibón"
                className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-3xl p-5 pl-14 font-bold text-slate-700 outline-none transition-all"
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase px-4">Precio Base (COP)</label>
              <div className="relative mt-2">
                <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  required
                  type="number"
                  placeholder="0.00"
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-3xl p-5 pl-14 font-bold text-slate-700 outline-none transition-all"
                  value={formData.precio_base}
                  onChange={(e) => setFormData({...formData, precio_base: Number(e.target.value)})}
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase px-4">Email Contacto</label>
              <div className="relative mt-2">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="email"
                  placeholder="contacto@sede.com"
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-3xl p-5 pl-14 font-bold text-slate-700 outline-none transition-all"
                  value={formData.email_encargado}
                  onChange={(e) => setFormData({...formData, email_encargado: e.target.value})}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 p-4 rounded-2xl flex gap-3 border border-amber-100">
          <AlertCircle className="text-amber-600 shrink-0" size={20} />
          <p className="text-[10px] text-amber-700 font-medium leading-tight">
            Esta jurisdicción solo estará disponible para el evento que esté marcado como <b>ACTIVO</b> en el Dashboard principal.
          </p>
        </div>

        <div className="pt-4 flex gap-3">
          <button 
            type="button"
            onClick={onSuccess}
            className="flex-1 bg-slate-100 text-slate-500 font-black uppercase text-xs py-5 rounded-3xl hover:bg-slate-200 transition-all"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            disabled={loading}
            className="flex-[2] bg-slate-900 text-white font-black uppercase text-xs py-5 rounded-3xl shadow-xl shadow-slate-200 hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Guardar Cambios</>}
          </button>
        </div>
      </form>
    </div>
  );
}