"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Sparkles, CheckCircle2, ShieldCheck, Send, Info } from "lucide-react";
import { createClient } from "@/utils/supabase/clients"; // Ajustado el path del cliente

import { FormField } from "@/components/formulario/FormField";
import { ResumenPago } from "@/components/formulario/ResumenPago";
import { UploadComprobante } from "@/components/formulario/UploadComprobante";
import { contactSchema, ContactFormData } from "@/lib/schema";

const NoEventCard = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-slate-900 mb-4">No hay evento activo</h2>
      <p className="text-slate-600">Por favor, configura un evento activo en el dashboard.</p>
    </div>
  </div>
);

const SuccessCard = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="text-center">
      <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-slate-900 mb-4">¡Registro completado!</h2>
      <p className="text-slate-600">Tu inscripción ha sido enviada correctamente.</p>
    </div>
  </div>
);

export default function InscripcionPage() {
  const supabase = createClient();
  
  const [isMounted, setIsMounted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [eventoActivo, setEventoActivo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dbData, setDbData] = useState<any>({ tipos: [], eps: [], dio: [], config: null });

  const { register, handleSubmit, watch, formState: { errors } } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { hospedaje: "no" },
  });

  const dioWatch = watch("diocesis");
  const rolWatch = watch("segmentacion");
  const hospWatch = watch("hospedaje");

  useEffect(() => {
    setIsMounted(true);
    async function loadInitialData() {
      setLoading(true);
      try {
        // 1. Buscamos el ÚNICO evento activo
        const { data: evento } = await supabase
          .from('eventos')
          .select('*')
          .eq('esta_activo', true)
          .single();

        if (evento) {
          setEventoActivo(evento);
          
          // 2. Cargamos dependencias filtradas por el ID del evento activo
          const [t, e, d, c] = await Promise.all([
            supabase.from('tipos_persona').select('*').eq('evento_id', evento.id),
            supabase.from('eps').select('*').order('nombre'),
            // Importante: Jurisdicciones filtradas por evento_id
            supabase.from('jurisdicciones').select('*').eq('evento_id', evento.id).order('nombre'),
            supabase.from('configuracion_evento').select('*').eq('evento_id', evento.id).maybeSingle()
          ]);

          setDbData({ 
            tipos: t.data || [], 
            eps: e.data || [], 
            dio: d.data || [], 
            config: c.data 
          });
        }
      } catch (err) {
        console.error("Error cargando configuración:", err);
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, [supabase]);

  // Motor de cálculo dinámico basado en el contexto activo
  const resumen = useMemo(() => {
    const { config, dio, tipos } = dbData;
    if (!config || !eventoActivo) return { base: 0, dto: 0, hospedaje: 0, total: 0 };

    const diocesisEncontrada = dio.find((i: any) => i.nombre === dioWatch);
    const rolEncontrado = tipos.find((i: any) => i.valor === rolWatch);

    // Selección de precio base (Global vs Por Diócesis)
    let base = config.modo_precio === 'global' 
      ? Number(config.precio_global_base) || 0 
      : Number(diocesisEncontrada?.precio_base) || 0;

    // Aplicación de descuento según la regla del rol (Configurada en el Dashboard)
    let dto = 0;
    if (rolEncontrado && base > 0) {
      dto = rolEncontrado.metodo_activo === 'porcentaje' // Usamos el campo metodo_activo del rol
        ? (base * (rolEncontrado.descuento_porcentaje || 0)) / 100
        : Number(rolEncontrado.descuento_fijo) || 0;
    }

    let costHosp = hospWatch === "si"
      ? (config.usar_hospedaje_diocesis ? Number(diocesisEncontrada?.precio_hospedaje_especifico) || 0 : Number(config.valor_hospedaje_general) || 0)
      : 0;

    return { base, dto, hospedaje: costHosp, total: Math.max(0, base - dto + costHosp) };
  }, [dioWatch, rolWatch, hospWatch, dbData, eventoActivo]);

  const onSubmit = async (data: ContactFormData) => {
    setIsUploading(true);
    try {
      let imageUrl = "";
      // Proceso de subida de comprobante al Storage (Carpeta por Evento)
      if (data.imagen?.[0]) {
        const file = data.imagen[0];
        const fileName = `${eventoActivo.slug}/${Date.now()}_${data.apellido.replace(/\s/g, '_')}.jpg`;
        const { error: upErr } = await supabase.storage.from('comprobantes').upload(fileName, file);
        if (upErr) throw upErr;
        const { data: { publicUrl } } = supabase.storage.from('comprobantes').getPublicUrl(fileName);
        imageUrl = publicUrl;
      }

      const { imagen, entidadSalud, ...rest } = data;
      const { error } = await supabase.from('inscripciones').insert([{
        ...rest,
        entidadSalud,
        evento_id: eventoActivo.id, // Vínculo obligatorio al evento activo
        imagen_url: imageUrl,
        precio_pactado: resumen.total,
        estado: 'pendiente'
      }]);

      if (error) throw error;
      setSubmitted(true);
    } catch (err: any) {
      alert("Error al procesar registro: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  if (!isMounted) return null;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
    </div>
  );

  if (!eventoActivo) return <NoEventCard />;
  if (submitted) return <SuccessCard />;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 md:p-12">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 bg-white rounded-[3.5rem] shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* PANEL IZQUIERDO: Branding Dinámico */}
        <div className="lg:col-span-4 bg-[#0f172a] p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mb-10 shadow-xl shadow-indigo-500/20 rotate-3">
              <Sparkles className="text-white" />
            </div>
            <h1 className="text-4xl font-black italic uppercase leading-none tracking-tighter mb-6">
              {eventoActivo?.nombre}
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">{eventoActivo?.descripcion}</p>
            <div className="inline-flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-700">
              <Info size={14} className="text-indigo-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-100 italic">Inscripción Activa</span>
            </div>
          </div>
          
          <div className="relative z-10 text-indigo-400 font-bold text-[10px] uppercase tracking-[0.3em] border-t border-slate-800 pt-8">
             {eventoActivo?.slug} — 2026
          </div>
        </div>

        {/* FORMULARIO DE REGISTRO */}
        <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-8 p-8 md:p-16 space-y-10 max-h-[90vh] overflow-y-auto custom-scrollbar">
          {/* Secciones de campos... igual a tu código original pero garantizando datos del evento activo */}
          {/* ... */}
          <section className="space-y-6">
            <h3 className="text-xs font-black text-indigo-600 uppercase tracking-[0.4em] mb-8 flex items-center gap-2">
               <div className="w-8 h-[2px] bg-indigo-600" /> Información Personal
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField label="Nombres Completos" error={errors.nombre?.message}>
                <input {...register("nombre")} className="modern-input" placeholder="Ej. Juan Andrés" />
              </FormField>
              <FormField label="Apellidos" error={errors.apellido?.message}>
                <input {...register("apellido")} className="modern-input" placeholder="Ej. Gómez Restrepo" />
              </FormField>
              <FormField label="EPS / Seguridad Social" error={errors.entidadSalud?.message}>
                <select {...register("entidadSalud")} className="modern-input">
                  <option value="">Selecciona tu entidad...</option>
                  {dbData.eps.map((e: any) => <option key={e.id} value={e.nombre}>{e.nombre}</option>)}
                </select>
              </FormField>
              <FormField label="Correo Electrónico" error={errors.email?.message}>
                <input {...register("email")} className="modern-input" placeholder="correo@ejemplo.com" />
              </FormField>
            </div>
          </section>

          <section className="space-y-6 pt-6 border-t border-slate-50">
            <h3 className="text-xs font-black text-indigo-600 uppercase tracking-[0.4em] mb-8 flex items-center gap-2">
               <div className="w-8 h-[2px] bg-indigo-600" /> Ubicación y Perfil
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField label="Jurisdicción de Origen" error={errors.diocesis?.message}>
                <select {...register("diocesis")} className="modern-input">
                  <option value="">Seleccionar Sede...</option>
                  {dbData.dio.map((d: any) => <option key={d.id} value={d.nombre}>{d.nombre}</option>)}
                </select>
              </FormField>
              <FormField label="Tipo de Participante" error={errors.segmentacion?.message}>
                <select {...register("segmentacion")} className="modern-input">
                  <option value="">¿Cómo participas?</option>
                  {dbData.tipos?.map((t: any) => (
                    <option key={t.id} value={t.valor}>{t.nombre}</option>
                  ))}
                </select>
              </FormField>
            </div>
          </section>

          {/* Resumen dinámico que solo aparece cuando se seleccionan los campos clave */}
          {dioWatch && rolWatch && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
              <ResumenPago resumen={resumen} />
              <UploadComprobante register={register} error={errors.imagen?.message} />
              <button disabled={isUploading} type="submit" className="w-full bg-slate-900 text-white font-black py-6 rounded-2xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-4 shadow-2xl shadow-indigo-200 active:scale-[0.98]">
                {isUploading ? <><Loader2 className="animate-spin" /> Sincronizando...</> : <><Send size={20}/> FINALIZAR REGISTRO</>}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}