"use client";
import React, { useEffect, useState, useCallback } from "react";
import { 
  Trash2, Edit3, MapPin, Banknote, 
  AlertCircle, Globe2, Loader2 
} from "lucide-react";
import { createClient } from "@/utils/supabase/clients";

interface Props {
  onEdit: (item: any) => void;
  // Añadimos refreshKey para forzar recargas desde fuera si es necesario
  refreshKey?: number; 
}

export default function ListadoDiocesis({ onEdit, refreshKey = 0 }: Props) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [jurisdicciones, setJurisdicciones] = useState<any[]>([]);
  const [eventoNombre, setEventoNombre] = useState("");

  const fetchJurisdiccionesActivas = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Buscamos el evento que tiene la bandera esta_activo = true
      const { data: evento, error: errorEvento } = await supabase
        .from('eventos')
        .select('id, nombre')
        .eq('esta_activo', true)
        .single();

      if (errorEvento || !evento) {
        console.warn("No se encontró un evento activo");
        setJurisdicciones([]);
        return;
      }

      setEventoNombre(evento.nombre);

      // 2. Traemos las jurisdicciones filtradas por ese evento_id
      const { data, error: errorJuri } = await supabase
        .from("jurisdicciones")
        .select("*")
        .eq("evento_id", evento.id)
        .order('nombre', { ascending: true });

      if (errorJuri) throw errorJuri;
      setJurisdicciones(data || []);

    } catch (error) {
      console.error("Error cargando jurisdicciones:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Cargar al montar y cuando cambie la llave de refresco
  useEffect(() => {
    fetchJurisdiccionesActivas();
  }, [fetchJurisdiccionesActivas, refreshKey]);

  const handleEliminar = async (id: string, nombre: string) => {
    const confirmar = confirm(`¿Eliminar jurisdicción "${nombre}"?`);
    if (confirmar) {
      const { error } = await supabase.from("jurisdicciones").delete().eq("id", id);
      if (error) alert("Error: " + error.message);
      else fetchJurisdiccionesActivas();
    }
  };

  if (loading) return (
    <div className="p-20 flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-indigo-500" size={40} />
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sincronizando Sedes...</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 px-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Globe2 size={14} className="text-indigo-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">
              Sedes: {eventoNombre || "Sin Evento Activo"}
            </span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 uppercase italic leading-none tracking-tighter">
            Jurisdicciones
          </h2>
          <p className="text-slate-500 text-sm mt-2 font-medium">
            Listado exclusivo para el entorno de trabajo actual.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {jurisdicciones.length === 0 ? (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] p-16 text-center">
            <AlertCircle className="mx-auto text-slate-300 mb-4" size={40} />
            <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.2em]">
              No hay sedes vinculadas a {eventoNombre || "este evento"}
            </p>
          </div>
        ) : (
          jurisdicciones.map((item) => (
            <div key={item.id} className="bg-white p-6 md:p-8 rounded-[2.5rem] border-2 border-slate-50 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-indigo-100 transition-all duration-300">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-slate-50 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white rounded-[1.5rem] flex items-center justify-center transition-all shadow-inner shrink-0">
                  <MapPin size={28} strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-900 uppercase italic tracking-tighter leading-tight group-hover:text-indigo-600">
                    {item.nombre}
                  </h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-1">
                    {item.email_encargado || "ADMINISTRACIÓN GENERAL"}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-8">
                <div className="text-left md:text-right">
                  <p className="text-[9px] font-black text-slate-300 uppercase mb-1">Inversión Base</p>
                  <div className="flex items-center gap-2 text-slate-900 font-black text-xl italic leading-none">
                    <Banknote size={18} className="text-emerald-500" />
                    <span>${Number(item.precio_base).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-3xl">
                  <button onClick={() => onEdit(item)} className="p-4 bg-white text-slate-400 hover:text-indigo-600 rounded-2xl transition-all shadow-sm">
                    <Edit3 size={18} />
                  </button>
                  <button onClick={() => handleEliminar(item.id, item.nombre)} className="p-4 bg-white text-slate-400 hover:text-rose-600 rounded-2xl transition-all shadow-sm">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}