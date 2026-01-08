"use client";
import React from "react";
import { UserX, MessageCircle, AlertCircle, Mail, Clock, ExternalLink, ShieldAlert } from "lucide-react";

export default function ListadoRechazados({ rechazados: propRechazados }: any) {
  // Datos de ejemplo si no vienen por props
  const defaultRechazados = [
    { 
      id: 1, 
      nombre: "Juan Pérez", 
      motivo: "Comprobante Ilegible", 
      fecha: "Hace 2h", 
      email: "juan@mail.com",
      whatsapp: "573001234567" 
    },
    { 
      id: 2, 
      nombre: "María López", 
      motivo: "Monto Insuficiente", 
      fecha: "Hace 5h", 
      email: "maria@mail.com",
      whatsapp: "573119876543" 
    },
  ];

  const data = propRechazados || defaultRechazados;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
      {/* HEADER DE AUDITORÍA */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert size={16} className="text-rose-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Control de Incidencias</span>
          </div>
          <h2 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
            Auditoría de Rechazos
          </h2>
          <p className="text-slate-500 text-sm mt-2 font-medium">Gestión de inscripciones con discrepancias en el pago.</p>
        </div>
        
        <div className="bg-rose-50 border border-rose-100 px-6 py-3 rounded-2xl flex items-center gap-3">
          <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
          <span className="text-[11px] font-black text-rose-600 uppercase tracking-widest">
            {data.length} Casos por resolver
          </span>
        </div>
      </div>

      {/* LISTADO DE CASOS */}
      <div className="bg-white rounded-[3.5rem] border border-slate-100 overflow-hidden shadow-2xl shadow-slate-200/50">
        <div className="divide-y divide-slate-50">
          {data.map((user: any) => (
            <div key={user.id} className="p-8 flex flex-col lg:flex-row lg:items-center justify-between hover:bg-rose-50/20 transition-all group gap-6">
              
              {/* Información del Usuario */}
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-[1.5rem] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500 shrink-0">
                  <UserX size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 uppercase italic text-lg leading-none mb-1">
                    {user.nombre}
                  </h4>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                      <Mail size={10} /> {user.email}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-300 uppercase tracking-tighter">
                      <Clock size={10} /> {user.fecha}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Motivo y Acción */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Motivo del Rechazo</p>
                  <div className="flex items-center gap-2 text-rose-600 font-black text-sm italic uppercase">
                    <AlertCircle size={14} /> {user.motivo}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Botón WhatsApp (Recuperación rápida) */}
                  <a 
                    href={`https://wa.me/${user.whatsapp}?text=Hola ${user.nombre}, tenemos un problema con tu inscripción...`}
                    target="_blank"
                    className="flex items-center gap-2 bg-emerald-500 text-white px-6 py-4 rounded-2xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 active:scale-95 text-[10px] font-black uppercase tracking-widest"
                  >
                    <MessageCircle size={18} />
                    Contactar
                  </a>

                  {/* Botón Ver Ficha */}
                  <button className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200 active:scale-95">
                    <ExternalLink size={18} />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>

        {data.length === 0 && (
          <div className="p-20 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4">
               <ShieldAlert size={40} className="opacity-20" />
            </div>
            <p className="text-slate-400 font-black uppercase text-xs tracking-[0.2em]">Todo bajo control: No hay rechazos pendientes</p>
          </div>
        )}
      </div>

      {/* FOOTER INFORMATIVO */}
      <div className="p-6 bg-slate-900 rounded-[2rem] text-white flex items-center gap-4">
        <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shrink-0">
          <Mail size={20} />
        </div>
        <p className="text-[11px] text-slate-300 font-medium">
          <b className="text-white uppercase italic">Protocolo Automático:</b> Al rechazar una inscripción, el sistema envía un correo electrónico notificando el motivo y habilitando un enlace único para que el usuario vuelva a subir su comprobante.
        </p>
      </div>
    </div>
  );
}