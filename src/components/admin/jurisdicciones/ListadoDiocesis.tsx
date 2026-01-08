"use client";
import React from "react";
import { 
  Trash2, 
  Edit3, 
  MapPin, 
  Banknote,
  AlertCircle,
  Globe2
} from "lucide-react";
import { createClient } from "@/utils/supabase/clients";

interface Props {
  data: any[];
  onEdit: (item: any) => void;
  onRefresh: () => void;
}

export default function ListadoDiocesis({ data, onEdit, onRefresh }: Props) {
  const supabase = createClient();

  const handleEliminar = async (id: string, nombre: string) => {
    // Advertencia más severa ya que esto afecta las inscripciones del evento actual
    const confirmar = confirm(
      `¿Estás seguro de eliminar la jurisdicción "${nombre}"?\n\n` +
      `Si hay personas inscritas bajo esta sede en el evento actual, podrías causar errores en los reportes.`
    );
    
    if (confirmar) {
      const { error } = await supabase
        .from("jurisdicciones")
        .delete()
        .eq("id", id);
      
      if (error) {
        alert("Error al eliminar: " + error.message);
      } else {
        onRefresh();
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* HEADER DE CONTEXTO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Globe2 size={14} className="text-indigo-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">
              Sedes del Entorno Activo
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 uppercase italic leading-none">
            Jurisdicciones
          </h2>
          <p className="text-slate-500 text-sm mt-2 font-medium">
            Listado de sedes habilitadas para este evento.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {data.length === 0 ? (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] p-16 text-center">
            <AlertCircle className="mx-auto text-slate-300 mb-4" size={40} />
            <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.2em]">
              No hay sedes configuradas para este evento
            </p>
          </div>
        ) : (
          data.map((item) => (
            <div 
              key={item.id} 
              className="bg-white p-6 md:p-8 rounded-[2.5rem] border-2 border-slate-50 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-300"
            >
              {/* INFO PRINCIPAL */}
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-slate-50 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white rounded-[1.5rem] flex items-center justify-center transition-all duration-500 shadow-inner">
                  <MapPin size={28} strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-900 uppercase italic tracking-tighter group-hover:text-indigo-600 transition-colors">
                    {item.nombre}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                      {item.email_encargado || "Sin correo de contacto"}
                    </p>
                  </div>
                </div>
              </div>

              {/* VALORES Y ACCIONES */}
              <div className="flex items-center justify-between md:justify-end gap-8 border-t md:border-t-0 border-slate-50 pt-4 md:pt-0">
                <div className="text-left md:text-right">
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.15em] mb-1">
                    Tarifa Base
                  </p>
                  <div className="flex items-center gap-2 text-slate-900 font-black text-xl italic">
                    <Banknote size={18} className="text-emerald-500" />
                    <span>${Number(item.precio_base).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-3xl">
                  <button 
                    onClick={() => onEdit(item)}
                    className="p-4 bg-white text-slate-400 hover:text-indigo-600 rounded-2xl transition-all shadow-sm hover:shadow-md"
                    title="Editar Jurisdicción"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button 
                    onClick={() => handleEliminar(item.id, item.nombre)}
                    className="p-4 bg-white text-slate-400 hover:text-rose-600 rounded-2xl transition-all shadow-sm hover:shadow-md"
                    title="Eliminar"
                  >
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