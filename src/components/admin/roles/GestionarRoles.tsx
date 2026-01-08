"use client";
import React from "react";
import { createClient } from "@/utils/supabase/clients";
import { 
  Edit3, Trash2, ShieldCheck, Percent, 
  BadgeDollarSign, Ban, Info, AlertTriangle 
} from "lucide-react";

export default function GestionarRoles({ roles, onEdit, onDelete }: any) {
  const supabase = createClient();

  const eliminarRol = async (id: number) => {
    // Implementación de una confirmación más estética o nativa
    if (!confirm("¿Estás seguro de eliminar este perfil? Los usuarios que ya se inscribieron con este rol mantendrán su precio, pero nadie más podrá seleccionarlo.")) return;
    
    const { error } = await supabase.from("tipos_persona").delete().eq("id", id);
    if (!error) {
      onDelete();
    } else {
      console.error("Error al eliminar:", error.message);
    }
  };

  // Renderizador de etiquetas de método con lógica de color mejorada
  const renderMetodoBadge = (metodo: string) => {
    const configs: any = {
      porcentaje: { 
        bg: "bg-indigo-50 border-indigo-100", 
        text: "text-indigo-700", 
        icon: Percent, 
        label: "Cálculo por %" 
      },
      fijo: { 
        bg: "bg-emerald-50 border-emerald-100", 
        text: "text-emerald-700", 
        icon: BadgeDollarSign, 
        label: "Precio Neto" 
      },
      ninguno: { 
        bg: "bg-slate-100 border-slate-200", 
        text: "text-slate-500", 
        icon: Ban, 
        label: "Tarifa Plena" 
      },
    };

    const active = configs[metodo] || configs.ninguno;
    const Icon = active.icon;

    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${active.bg} ${active.text} transition-all`}>
        <Icon size={12} strokeWidth={3} />
        <span className="text-[10px] font-black uppercase tracking-tight">{active.label}</span>
      </div>
    );
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-700">
      {/* INFO TOOLTIP */}
      <div className="flex items-center gap-2 px-6 py-3 bg-amber-50 rounded-2xl border border-amber-100 text-amber-700">
        <Info size={16} />
        <p className="text-[10px] font-bold uppercase tracking-wide">
          Los cambios aquí afectan directamente al motor de cálculo del formulario público.
        </p>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80">
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Estructura de Perfil</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Estrategia Activa</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Impacto Financiero</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right whitespace-nowrap">Gestión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {roles.map((rol: any) => (
                <tr key={rol.id} className="hover:bg-indigo-50/20 transition-all group">
                  {/* COLUMNA: NOMBRE Y COLOR */}
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-12 h-12 rounded-[1.2rem] flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-105"
                        style={{ backgroundColor: rol.color || '#6366f1' }}
                      >
                        <ShieldCheck size={22} strokeWidth={2.5} />
                      </div>
                      <div>
                        <span className="font-black text-slate-900 uppercase italic text-sm block leading-none mb-1">
                          {rol.nombre}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-mono font-bold text-slate-500 uppercase">
                            ID: {rol.valor}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  {/* COLUMNA: MÉTODO */}
                  <td className="p-6 text-center">
                    {renderMetodoBadge(rol.metodo_activo)}
                  </td>

                  {/* COLUMNA: VALOR APLICADO */}
                  <td className="p-6 text-center">
                    <div className="flex flex-col items-center">
                      {rol.metodo_activo === 'porcentaje' ? (
                        <div className="flex flex-col items-center">
                          <span className="text-indigo-600 font-black text-base italic">-{rol.descuento_porcentaje}%</span>
                          <span className="text-[9px] font-bold text-slate-300 uppercase">Del precio base</span>
                        </div>
                      ) : rol.metodo_activo === 'fijo' ? (
                        <div className="flex flex-col items-center">
                          <span className="text-emerald-600 font-black text-base italic">-${rol.descuento_fijo.toLocaleString()}</span>
                          <span className="text-[9px] font-bold text-slate-300 uppercase">Dcto. Directo</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <span className="text-slate-300 font-black text-base italic">100%</span>
                          <span className="text-[9px] font-bold text-slate-300 uppercase">Sin descuento</span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* COLUMNA: ACCIONES */}
                  <td className="p-6 text-right whitespace-nowrap">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => onEdit(rol)}
                        className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-md rounded-2xl transition-all active:scale-90"
                        title="Editar parámetros"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button 
                        onClick={() => eliminarRol(rol.id)}
                        className="p-3 text-slate-400 hover:text-rose-600 hover:bg-white hover:shadow-md rounded-2xl transition-all active:scale-90"
                        title="Eliminar perfil"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {roles.length === 0 && (
            <div className="p-24 flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                <AlertTriangle size={32} />
              </div>
              <div className="text-center">
                <p className="text-slate-900 font-black uppercase italic">Base de datos vacía</p>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                  Empieza creando un nuevo perfil para el evento.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}