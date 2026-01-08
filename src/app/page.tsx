"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Sparkles, CheckCircle2, ShieldCheck, Send, Info } from "lucide-react";
import { createClient } from "@/utils/supabase/clients";

import { FormField } from "@/components/formulario/FormField";
import { ResumenPago } from "@/components/formulario/ResumenPago";
import { UploadComprobante } from "@/components/formulario/UploadComprobante";
import { contactSchema, ContactFormData } from "@/lib/schema";

export default function InscripcionPage() {
  const supabase = createClient();
  
  const [isMounted, setIsMounted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [eventoActivo, setEventoActivo] = useState<any>(null);
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
      const { data: evento } = await supabase
        .from('eventos')
        .select('*')
        .eq('esta_activo', true)
        .single();

      if (evento) {
        setEventoActivo(evento);
        const [t, e, d, c] = await Promise.all([
          supabase.from('tipos_persona').select('*').eq('evento_id', evento.id),
          supabase.from('eps').select('*').order('nombre'),
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
    }
    loadInitialData();
  }, []);

  const resumen = useMemo(() => {
    const { config, dio, tipos } = dbData;
    if (!config || !eventoActivo) return { base: 0, dto: 0, hospedaje: 0, total: 0 };

    const diocesisEncontrada = dio.find((i: any) => i.nombre === dioWatch);
    const rolEncontrado = tipos.find((i: any) => i.valor === rolWatch);

    let base = config.modo_precio === 'global' 
      ? Number(config.precio_global_base) || 0 
      : Number(diocesisEncontrada?.precio_base) || 0;

    let dto = 0;
    if (rolEncontrado && base > 0) {
      dto = config.metodo_descuento === 'porcentaje'
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
      if (data.imagen?.[0]) {
        const file = data.imagen[0];
        // Usamos nombre y apellido para el nombre del archivo al no haber cédula
        const fileName = `${eventoActivo.slug}/${Date.now()}_${data.apellido.replace(/\s/g, '_')}.jpg`;
        const { error: upErr } = await supabase.storage.from('comprobantes').upload(fileName, file);
        if (upErr) throw upErr;
        const { data: { publicUrl } } = supabase.storage.from('comprobantes').getPublicUrl(fileName);
        imageUrl = publicUrl;
      }

      const { imagen, entidadSalud, ...rest } = data;
      const { error } = await supabase.from('inscripciones').insert([{
        ...rest,
        eps: entidadSalud,
        evento_id: eventoActivo.id,
        imagen_url: imageUrl,
        precio_pactado: resumen.total,
        estado: 'pendiente'
      }]);

      if (error) throw error;
      setSubmitted(true);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  if (!isMounted) return null;
  if (!eventoActivo && !isUploading) return <NoEventCard />;
  if (submitted) return <SuccessCard />;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 md:p-12">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 bg-white rounded-[3.5rem] shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* PANEL IZQUIERDO */}
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
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-100">Registro Oficial</span>
            </div>
          </div>
          <div className="mt-12 opacity-10 pointer-events-none absolute -bottom-10 -left-10 text-white">
            <ShieldCheck size={280} strokeWidth={1} />
          </div>
          <div className="relative z-10 text-indigo-400 font-bold text-[10px] uppercase tracking-[0.3em] border-t border-slate-800 pt-8">
             {eventoActivo?.slug}
          </div>
        </div>

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-8 p-8 md:p-16 space-y-10 max-h-[90vh] overflow-y-auto custom-scrollbar">
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
              <FormField label="WhatsApp / Celular" error={errors.telefono?.message}>
                <input {...register("telefono")} className="modern-input" placeholder="300 000 0000" />
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
      <option key={t.id} value={t.valor}>
        {t.nombre}
      </option>
    ))}
  </select>
</FormField>
            </div>
          </section>

          {dioWatch && rolWatch && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
              <ResumenPago resumen={resumen} />
              <UploadComprobante register={register} error={errors.imagen?.message} />
              <button disabled={isUploading} type="submit" className="w-full bg-slate-900 text-white font-black py-6 rounded-2xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-4 shadow-2xl shadow-indigo-200 active:scale-[0.98]">
                {isUploading ? <><Loader2 className="animate-spin" /> Procesando...</> : <><Send size={20}/> FINALIZAR REGISTRO</>}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

// ... NoEventCard y SuccessCard se mantienen igual ...

function NoEventCard() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="max-w-md w-full bg-white p-12 rounded-[3rem] shadow-2xl text-center">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <ShieldCheck size={32} />
        </div>
        <h2 className="text-2xl font-black uppercase italic tracking-tighter">Inscripciones Cerradas</h2>
        <p className="text-slate-500 mt-4 font-medium">Actualmente no hay ningún evento activo para registro. Por favor, intenta más tarde.</p>
      </div>
    </div>
  );
}

function SuccessCard() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="max-w-md w-full bg-white p-12 rounded-[3rem] shadow-2xl text-center">
        <CheckCircle2 size={60} className="text-emerald-500 mx-auto mb-6" />
        <h2 className="text-2xl font-black uppercase italic tracking-tighter">¡Registro Exitoso!</h2>
        <p className="text-slate-500 mt-4 font-medium">Hemos recibido tu comprobante. En breve recibirás un correo con la confirmación de tu cupo.</p>
        <button onClick={() => window.location.reload()} className="mt-8 text-indigo-600 font-bold uppercase text-xs border-b-2 border-indigo-100">Inscribir a otra persona</button>
      </div>
    </div>
  );
}