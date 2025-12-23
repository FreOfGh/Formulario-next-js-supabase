"use client";
import { useState, useEffect } from "react";
import { 
  Check, X, Eye, Loader2, Clock, CheckCircle, 
  XCircle, FileDown, Users, Search, Filter 
} from "lucide-react";
import * as XLSX from "xlsx";
// 1. Definición de la estructura
interface Registro {
  id: number;           // Identificador único (timestamp)
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  diocesis: string;
  entidadSalud: string;
  segmentacion: "sacerdote" | "seminarista" | "laico"; // Solo permite estos valores
  hospedaje: "si" | "no";
  rutaImagen: string;   // La URL local: /uploads/imagen.jpg
  fechaRegistro: string;
  motivoRechazo?: string; // El '?' significa que es opcional (solo existe si fue rechazado)
}

type TabType = "pendientes" | "aprobados" | "rechazados";

export default function AdminPanel() {
  const [registros, setRegistros] = useState<Registro[]>([]);  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("pendientes");
  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  const [idParaRechazar, setIdParaRechazar] = useState<number | null>(null);
  const [motivo, setMotivo] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchRegistros = async (tipo: TabType) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/get-registros?tipo=${tipo}`);
      const data = await res.json();
      setRegistros(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando registros:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRegistros(activeTab); }, [activeTab]);

  const exportarExcel = async () => {
    const tipos = ["pendientes", "aprobados", "rechazados"];
    const wb = XLSX.utils.book_new();

    await Promise.all(tipos.map(async (tipo) => {
      const res = await fetch(`/api/admin/get-registros?tipo=${tipo}`);
      const data = await res.json();
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, tipo.charAt(0).toUpperCase() + tipo.slice(1));
    }));

    XLSX.writeFile(wb, `Reporte_General_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleAction = async (id: number, accion: 'aprobar' | 'rechazar', razon?: string) => {
    try {
      const res = await fetch("/api/admin/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, accion, motivo: razon }),
      });
      
      if (res.ok) {
        setIdParaRechazar(null);
        setMotivo("");
        fetchRegistros(activeTab);
      }
    } catch (error) {
      alert("Error en el servidor");
    }
  };

  const registrosFiltrados = registros.filter((reg: any) => 
    `${reg.nombre} ${reg.apellido} ${reg.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      {/* Barra Superior Decorativa */}
      <div className="h-2 bg-indigo-600 w-full" />

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* HEADER DINÁMICO */}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider">
              <Users size={14} /> Gestión de Comunidad
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Administración</h1>
            <p className="text-slate-500 font-medium">Control de acceso y validación de inscritos.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button 
              onClick={exportarExcel}
              className="group flex items-center gap-2 bg-white border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-500 hover:text-white px-5 py-2.5 rounded-2xl font-bold transition-all duration-300"
            >
              <FileDown size={20} className="group-hover:bounce" />
              Descargar Reporte
            </button>
          </div>
        </header>

        {/* BARRA DE ACCIONES RÁPIDAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text"
              placeholder="Buscar por nombre o correo..."
              className="w-full pl-12 pr-4 py-4 bg-white border-none shadow-sm rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
            <TabButton active={activeTab === "pendientes"} onClick={() => setActiveTab("pendientes")} icon={<Clock size={18}/>} label="Espera" count={activeTab === "pendientes" ? registrosFiltrados.length : null} />
            <TabButton active={activeTab === "aprobados"} onClick={() => setActiveTab("aprobados")} icon={<CheckCircle size={18}/>} label="Éxito" count={activeTab === "aprobados" ? registrosFiltrados.length : null}/>
            <TabButton active={activeTab === "rechazados"} onClick={() => setActiveTab("rechazados")} icon={<XCircle size={18}/>} label="Baja" count={activeTab === "rechazados" ? registrosFiltrados.length : null}/>
          </div>
        </div>

        {/* CONTENEDOR DE TABLA */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          {loading ? (
            <div className="py-32 flex flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin text-indigo-600" size={48} />
              <p className="text-slate-400 font-bold animate-pulse">Sincronizando base de datos...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="p-6 text-sm font-bold text-slate-400 uppercase">Información Personal</th>
                    <th className="p-6 text-sm font-bold text-slate-400 uppercase">Detalles</th>
                    <th className="p-6 text-sm font-bold text-slate-400 uppercase text-center">Identificación</th>
                    <th className="p-6 text-sm font-bold text-slate-400 uppercase text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {registrosFiltrados.map((reg: any) => (
                    <tr key={reg.id} className="group hover:bg-slate-50/50 transition-all">
                      <td className="p-6">
                        <div className="flex flex-col">
                          <span className="text-lg font-bold text-slate-800">{reg.nombre} {reg.apellido}</span>
                          <span className="text-sm text-indigo-500 font-medium">{reg.email}</span>
                        </div>
                      </td>
                      <td className="p-6 text-sm text-slate-600">
                        <div className="font-semibold">{reg.diocesis}</div>
                        <div className="opacity-60">{reg.segmentacion} • {reg.telefono}</div>
                      </td>
                      <td className="p-6">
                        <div className="flex justify-center">
                          <button 
                            onClick={() => setSelectedImg(reg.rutaImagen)}
                            className="relative h-14 w-14 rounded-2xl border-2 border-white shadow-lg overflow-hidden transform group-hover:scale-110 transition-transform duration-300"
                          >
                            <img src={reg.rutaImagen} className="object-cover h-full w-full" />
                          </button>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex justify-center gap-3">
                          {activeTab === "pendientes" ? (
                            <>
                              <button 
                                onClick={() => handleAction(reg.id, 'aprobar')}
                                className="h-11 w-11 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                              >
                                <Check size={20} strokeWidth={3} />
                              </button>
                              <button 
                                onClick={() => setIdParaRechazar(reg.id)}
                                className="h-11 w-11 flex items-center justify-center bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                              >
                                <X size={20} strokeWidth={3} />
                              </button>
                            </>
                          ) : (
                            <span className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest ${
                              activeTab === "aprobados" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                            }`}>
                              {activeTab === "aprobados" ? "Validado" : "Denegado"}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* MODAL DE RECHAZO (DISEÑO DINÁMICO) */}
      {idParaRechazar && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-8 animate-in zoom-in duration-300">
            <div className="h-16 w-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mb-6">
              <XCircle size={32} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Confirmar Rechazo</h3>
            <p className="text-slate-500 font-medium mb-6">Escribe la razón para notificar al postulante de manera clara.</p>
            <textarea 
              className="w-full border-2 border-slate-100 bg-slate-50 rounded-2xl p-4 text-black focus:border-rose-500 outline-none transition-all resize-none font-medium"
              rows={4}
              placeholder="Ej: Foto de identificación ilegible..."
              onChange={(e) => setMotivo(e.target.value)}
            />
            <div className="flex gap-3 mt-8">
              <button onClick={() => setIdParaRechazar(null)} className="flex-1 py-4 text-slate-400 font-bold hover:bg-slate-50 rounded-2xl transition-colors">Cancelar</button>
              <button 
                onClick={() => handleAction(idParaRechazar, 'rechazar', motivo)}
                className="flex-[2] py-4 bg-rose-600 text-white font-bold rounded-2xl hover:bg-rose-700 shadow-lg shadow-rose-200 transition-all"
              >
                Confirmar Acción
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VISOR DE FOTOS (GLASSMORPHISM) */}
      {selectedImg && (
        <div className="fixed inset-0 bg-slate-950/80 z-[110] flex items-center justify-center p-4 backdrop-blur-xl" onClick={() => setSelectedImg(null)}>
          <div className="relative group max-w-5xl w-full h-full flex items-center justify-center">
            <img src={selectedImg} className="max-w-full max-h-[85vh] rounded-3xl shadow-2xl border-4 border-white/10" />
            <button className="absolute top-10 right-10 bg-white/20 hover:bg-white text-white hover:text-black p-4 rounded-full transition-all">
              <X size={32} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function TabButton({ active, onClick, icon, label, count }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
        active 
          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
          : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
      }`}
    >
      {icon} 
      <span className="hidden sm:inline">{label}</span>
      {count !== null && (
        <span className={`text-[10px] px-2 py-0.5 rounded-md font-black ${active ? "bg-white/20" : "bg-slate-100"}`}>
          {count}
        </span>
      )}
    </button>
  );
}