"use client";
import React, { useState } from "react";
import { createClient } from "@/utils/supabase/clients";
import { 
  Settings2, Percent, BadgeDollarSign, Ban, 
  Loader2, Sparkles, Check, ShieldAlert 
} from "lucide-react";

export default function ConfigurarAplicacion({ roles, onUpdate }: any) {
  const supabase = createClient();
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const cambiarMetodo = async (id: number, nuevoMetodo: string) => {
    setLoadingId(id);
    const { error } = await supabase
      .from("tipos_persona")
      .update({ metodo_activo: nuevoMetodo })
      .eq("id", id);
    
    if (!error) {
      setLastUpdated(id);
      onUpdate();
      // Limpiar el estado de "éxito" después de 2 segundos
      setTimeout(() => setLastUpdated(null), 2000);
    } else {
      alert("Error al actualizar la regla: " + error.message);
    }
    setLoadingId(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* HEADER ESTRATÉGICO */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={14} className="text-amber-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Motor de Precios Dinámicos
            </span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 uppercase italic leading-none">
            Reglas de Aplicación
          </h2>
          <p className="text-slate-500 text-sm mt-2 font-medium">
            Define la jerarquía de cobro para los asistentes del <span className="text-indigo-600 font-bold">evento actual</span>.
          </p>
        </div>
      </div>

      {/* MATRIZ DE CONFIGURACIÓN */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <Settings2 size={16} />
            </div>
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Configuración por Perfil</span>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {roles.map((rol: any) => (
            <div key={rol.id} className="p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-slate-50/50 transition-all group">
              <div className="flex items-center gap-5">
                <div 
                  className="w-14 h-14 rounded-[1.5rem] flex items-center justify-center text-white shadow-inner relative group-hover:scale-110 transition-transform duration-500" 
                  style={{ backgroundColor: rol.color || '#6366f1' }}
                >
                  <span className="font-black text-xl">{rol.nombre.charAt(0)}</span>
                  {lastUpdated === rol.id && (
                    <div className="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full p-1 animate-bounce">
                      <Check size={12} strokeWidth={4} />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-black text-slate-800 uppercase text-lg tracking-tighter">{rol.nombre}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Estado:</span>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                      rol.metodo_activo === 'ninguno' ? 'bg-slate-100 text-slate-500' : 'bg-indigo-50 text-indigo-600'
                    }`}>
                      {rol.metodo_activo === 'porcentaje' ? 'Basado en %' : 
                       rol.metodo_activo === 'fijo' ? 'Precio Neto' : 'Tarifa Plena'}
                    </span>
                  </div>
                </div>
              </div>

              {/* SELECTOR TIPO SWITCH MODERNO */}
              <div className="flex bg-slate-100 p-1.5 rounded-[2rem] gap-1 self-start lg:self-center border border-slate-200/50 shadow-inner">
                {[
                  { id: 'porcentaje', icon: Percent, label: 'Descuento %' },
                  { id: 'fijo', icon: BadgeDollarSign, label: 'Valor Fijo' },
                  { id: 'ninguno', icon: Ban, label: 'Sin Rebaja' }
                ].map((metodo) => {
                  const isActive = rol.metodo_activo === metodo.id;
                  return (
                    <button
                      key={metodo.id}
                      onClick={() => cambiarMetodo(rol.id, metodo.id)}
                      disabled={loadingId === rol.id}
                      className={`
                        flex items-center gap-2 px-6 py-3 rounded-[1.5rem] text-[10px] font-black uppercase transition-all duration-300
                        ${isActive 
                          ? 'bg-white text-indigo-600 shadow-md transform scale-105' 
                          : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
                        }
                        ${loadingId === rol.id && !isActive ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      {loadingId === rol.id && isActive ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <metodo.icon size={14} strokeWidth={isActive ? 3 : 2} />
                      )}
                      <span className="hidden sm:inline">{metodo.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* INFO BOX DINÁMICO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-8 bg-indigo-900 rounded-[2.5rem] text-white flex gap-5 items-start shadow-xl shadow-indigo-100">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 backdrop-blur-sm">
            <Settings2 className="text-indigo-300" size={24} />
          </div>
          <div className="space-y-2">
            <p className="font-black text-[11px] uppercase tracking-widest text-indigo-300">Impacto en Formulario</p>
            <p className="text-xs text-indigo-100 leading-relaxed font-medium">
              Al activar un método, el sistema prioriza esa lógica sobre las demás. 
              <b> Porcentajes</b> se calculan sobre el precio base, mientras que <b>Valor Fijo</b> establece un precio único ignorando el base.
            </p>
          </div>
        </div>

        <div className="p-8 bg-amber-50 rounded-[2.5rem] border-2 border-amber-100 flex gap-5 items-start">
          <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-amber-200">
            <ShieldAlert size={24} />
          </div>
          <div className="space-y-2">
            <p className="font-black text-[11px] uppercase tracking-widest text-amber-600">Advertencia de Cambios</p>
            <p className="text-xs text-amber-800 leading-relaxed font-medium">
              Los cambios son instantáneos. Si hay usuarios navegando en el formulario de inscripción, verán los nuevos precios al recargar o avanzar de sección.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}