"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Send, Loader2, User, Mail, Phone, MapPin, Heart, Sparkles, CheckCircle2 } from "lucide-react";
import { contactSchema, ContactFormData } from "@/lib/schema";
import { useState, useEffect } from "react";

export default function InscripcionForm() {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  // Observar el cambio de imagen para mostrar la vista previa
  const imagenFile = watch("imagen");
  useEffect(() => {
    if (imagenFile && imagenFile[0]) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(imagenFile[0]);
    }
  }, [imagenFile]);

  const onSubmit = async (data: ContactFormData) => {
    setIsUploading(true);
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'imagen') {
        formData.append(key, value[0]);
      } else {
        formData.append(key, value as string);
      }
    });

    try {
      const response = await fetch("/api/upload", { method: "POST", body: formData });
      if (response.ok) {
        alert("¡Registro enviado con éxito! Un administrador lo revisará pronto.");
        reset();
        setPreview(null);
      }
    } catch (error) {
      alert("Error al procesar el formulario");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center py-12 px-4 overflow-hidden bg-slate-50">
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200 rounded-full blur-[120px] opacity-50 animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-200 rounded-full blur-[120px] opacity-50 animate-pulse" />

      <div className="relative w-full max-w-3xl bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-indigo-200/50 border border-white overflow-hidden transition-all duration-500">
        
        {/* Cabecera Estilizada */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-10 text-white relative">
          <Sparkles className="absolute top-6 right-8 opacity-30 animate-bounce" />
          <h2 className="text-4xl font-black tracking-tight mb-2">Inscripción General</h2>
          <p className="text-indigo-100 font-medium tracking-wide">Únete a nuestra comunidad. Completa tu perfil debajo.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Inputs con estilo moderno */}
          <div className="space-y-6">
            <FormGroup label="Nombre" error={errors.nombre?.message} icon={<User size={18}/>}>
              <input {...register("nombre")} placeholder="Tu nombre" className="modern-input" />
            </FormGroup>

            <FormGroup label="Email" error={errors.email?.message} icon={<Mail size={18}/>}>
              <input type="email" {...register("email")} placeholder="ejemplo@correo.com" className="modern-input" />
            </FormGroup>

            <FormGroup label="Diócesis" error={errors.diocesis?.message} icon={<MapPin size={18}/>}>
              <input {...register("diocesis")} placeholder="Nombre de tu diócesis" className="modern-input" />
            </FormGroup>

            <FormGroup label="Usted es:" error={errors.segmentacion?.message}>
              <select {...register("segmentacion")} className="modern-input appearance-none bg-white">
                <option value="">Seleccione un rol...</option>
                <option value="sacerdote">Sacerdote</option>
                <option value="seminarista">Seminarista</option>
                <option value="laico">Laico</option>
              </select>
            </FormGroup>
          </div>

          <div className="space-y-6">
            <FormGroup label="Apellido" error={errors.apellido?.message} icon={<User size={18} className="opacity-0"/>}>
              <input {...register("apellido")} placeholder="Tu apellido" className="modern-input" />
            </FormGroup>

            <FormGroup label="Teléfono" error={errors.telefono?.message} icon={<Phone size={18}/>}>
              <input {...register("telefono")} placeholder="+57 300..." className="modern-input" />
            </FormGroup>

            <FormGroup label="Entidad de Salud" error={errors.entidadSalud?.message} icon={<Heart size={18}/>}>
              <input {...register("entidadSalud")} placeholder="EPS / Medicina Prepaga" className="modern-input" />
            </FormGroup>

            <div className="space-y-2 pt-1">
              <label className="text-sm font-bold text-slate-700">¿Requiere Hospedaje?</label>
              <div className="flex gap-4">
                {['si', 'no'].map((val) => (
                  <label key={val} className="flex-1 cursor-pointer group">
                    <input type="radio" value={val} {...register("hospedaje")} className="peer hidden" />
                    <div className="w-full text-center py-3 rounded-xl border-2 border-slate-100 bg-white peer-checked:border-indigo-500 peer-checked:bg-indigo-50 text-slate-500 peer-checked:text-indigo-700 font-bold transition-all group-hover:border-indigo-200 capitalize">
                      {val}
                    </div>
                  </label>
                ))}
              </div>
              {errors.hospedaje && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.hospedaje.message}</p>}
            </div>
          </div>

          {/* Zona de Carga de Imagen Dinámica */}
          <div className="md:col-span-2 space-y-3">
            <label className="text-sm font-bold text-slate-700">Fotografía de Identificación</label>
            <div className={`relative border-2 border-dashed rounded-[2rem] transition-all duration-300 group overflow-hidden ${preview ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-indigo-400 bg-slate-50'}`}>
              <input type="file" {...register("imagen")} className="absolute inset-0 opacity-0 cursor-pointer z-10" accept="image/*" />
              
              <div className="p-8 flex flex-col items-center justify-center min-h-[160px]">
                {preview ? (
                  <div className="flex flex-col items-center gap-3">
                    <img src={preview} alt="Preview" className="h-24 w-24 object-cover rounded-2xl shadow-lg ring-4 ring-white" />
                    <p className="text-indigo-600 text-sm font-bold flex items-center gap-1">
                      <CheckCircle2 size={16}/> Imagen cargada con éxito
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="p-4 bg-white rounded-2xl shadow-sm mb-3 group-hover:scale-110 transition-transform">
                      <Camera className="h-8 w-8 text-indigo-500" />
                    </div>
                    <p className="text-slate-500 font-semibold">Toca para subir una foto</p>
                    <p className="text-slate-400 text-xs">JPG, PNG o WebP (Máx 5MB)</p>
                  </>
                )}
              </div>
            </div>
            {errors.imagen && <p className="text-red-500 text-xs text-center font-bold">{String(errors.imagen.message)}</p>}
          </div>

          <button 
            disabled={isUploading} 
            className="md:col-span-2 group relative w-full bg-slate-900 text-white font-black py-5 rounded-[1.5rem] overflow-hidden transition-all active:scale-[0.98] disabled:opacity-70"
          >
            <div className="relative z-10 flex items-center justify-center gap-3 text-lg">
              {isUploading ? <Loader2 className="animate-spin" /> : <Send size={22} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
              {isUploading ? "PROCESANDO..." : "ENVIAR MI INSCRIPCIÓN"}
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </form>
      </div>

      <style jsx global>{`
        .modern-input {
          width: 100%;
          margin-top: 0.25rem;
          padding: 0.85rem 1rem;
          background-color: #f8fafc;
          border: 2px solid #f1f5f9;
          border-radius: 1rem;
          outline: none;
          color: #1e293b;
          font-weight: 500;
          transition: all 0.2s ease-in-out;
        }
        .modern-input:focus {
          background-color: #fff;
          border-color: #6366f1;
          box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.1);
        }
      `}</style>
    </main>
  );
}

function FormGroup({ label, error, icon, children }: any) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
        {icon} {label}
      </label>
      {children}
      {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-wider">{error}</p>}
    </div>
  );
}