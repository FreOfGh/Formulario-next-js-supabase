"use client";
import React, { useEffect, useState, useMemo } from "react";
import { createClient } from "@/utils/supabase/clients";
import { 
  TrendingUp, Target, Zap, AlertTriangle, 
  ArrowUpRight, PieChart as PieIcon, Activity,
  Calendar, CheckCircle2, Loader2, DollarSign
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from "recharts";

export default function AnalisisMetaFinanciera() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    async function loadFinanzas() {
      setLoading(true);
      const { data: evento } = await supabase.from('eventos').select('*').eq('esta_activo', true).single();
      
      if (evento) {
        const [config, inscripciones] = await Promise.all([
          supabase.from('configuracion_evento').select('*').eq('evento_id', evento.id).single(),
          supabase.from('inscripciones').select('estado, precio_pactado, created_at').eq('evento_id', evento.id)
        ]);

        const totalInscritos = inscripciones.data?.length || 0;
        const metaRecaudo = Number(config.data?.meta_financiera_objetivo) || 50000000; // Meta por defecto si no existe
        
        const aprobado = inscripciones.data?.filter(i => i.estado === 'aprobado') || [];
        const pendiente = inscripciones.data?.filter(i => i.estado === 'pendiente') || [];
        
        const recaudoReal = aprobado.reduce((acc, curr) => acc + (curr.precio_pactado || 0), 0);
        const recaudoProyectado = pendiente.reduce((acc, curr) => acc + (curr.precio_pactado || 0), 0);
        
        setStats({
          evento,
          metaRecaudo,
          recaudoReal,
          recaudoProyectado,
          totalInscritos,
          faltanteMeta: Math.max(0, metaRecaudo - recaudoReal),
          porcentajeLogrado: (recaudoReal / metaRecaudo) * 100,
          dataGrafico: procesarDataHistorica(inscripciones.data || [])
        });
      }
      setLoading(false);
    }
    loadFinanzas();
  }, []);

  // Procesa inscripciones para ver crecimiento en el tiempo
  const procesarDataHistorica = (data: any[]) => {
    const grupos = data.reduce((acc: any, curr) => {
      const fecha = new Date(curr.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
      acc[fecha] = (acc[fecha] || 0) + (curr.precio_pactado || 0);
      return acc;
    }, {});
    return Object.keys(grupos).map(k => ({ fecha: k, monto: grupos[k] }));
  };

  const pieData = useMemo(() => [
    { name: 'Recaudado', value: stats?.recaudoReal, color: '#6366f1' },
    { name: 'Pendiente', value: stats?.recaudoProyectado, color: '#f59e0b' },
    { name: 'Por Alcanzar', value: stats?.faltanteMeta, color: '#e2e8f0' },
  ], [stats]);

  if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>;
  if (!stats) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* SECCIÓN 1: EL VELOCÍMETRO DE LA META */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <Target className="text-indigo-600" size={20} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Progreso hacia la Meta</span>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="w-full md:w-1/2 h-[250px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      innerRadius={80}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-4xl font-black italic text-slate-900">{stats.porcentajeLogrado.toFixed(1)}%</span>
                  <span className="text-[10px] font-black text-indigo-500 uppercase">Completado</span>
                </div>
              </div>

              <div className="w-full md:w-1/2 space-y-6">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Faltante para Meta</p>
                  <h3 className="text-4xl font-black text-rose-500 italic">${stats.faltanteMeta.toLocaleString()}</h3>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 mb-2">
                    <span>Meta Total</span>
                    <span>${stats.metaRecaudo.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full transition-all duration-1000" style={{ width: `${stats.porcentajeLogrado}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MÉTRICAS RÁPIDAS */}
        <div className="lg:col-span-5 grid grid-cols-1 gap-6">
          <div className="bg-slate-900 p-8 rounded-[3rem] text-white flex items-center justify-between group">
            <div>
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2">Ingreso Proyectado</p>
              <h4 className="text-3xl font-black italic">${(stats.recaudoReal + stats.recaudoProyectado).toLocaleString()}</h4>
              <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase">Cifra si se aprueban todos los pendientes</p>
            </div>
            <Activity className="text-indigo-500/30 group-hover:text-indigo-400 transition-colors" size={60} />
          </div>

          <div className="bg-indigo-600 p-8 rounded-[3rem] text-white flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.2em] mb-2">Inscritos Activos</p>
              <h4 className="text-4xl font-black italic">{stats.totalInscritos}</h4>
              <p className="text-[10px] text-indigo-100 mt-2 font-bold uppercase flex items-center gap-1">
                <CheckCircle2 size={12} /> Comunidad Registrada
              </p>
            </div>
            <Users2 className="text-white/20" size={60} />
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: GRÁFICO DE CRECIMIENTO TEMPORAL */}
      <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h3 className="text-[11px] font-black uppercase text-slate-400 tracking-[0.3em] mb-1">Ritmo de Ingresos</h3>
            <p className="text-xl font-black text-slate-900 italic">Flujo de Caja Diario</p>
          </div>
          <div className="flex gap-2">
            <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 text-[10px] font-black text-slate-500 uppercase">
              Últimos Registros
            </div>
          </div>
        </div>
        
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.dataGrafico}>
              <defs>
                <linearGradient id="colorMonto" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="fecha" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800}} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
              />
              <Area type="monotone" dataKey="monto" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorMonto)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SECCIÓN 3: ALERTA DE ACCIÓN ESTRATÉGICA */}
      <div className="bg-amber-50 p-8 rounded-[3rem] border border-amber-100 flex flex-col md:flex-row items-center gap-8">
        <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-amber-200">
          <Zap size={30} fill="currentColor" />
        </div>
        <div className="flex-1">
          <h4 className="text-amber-900 font-black uppercase italic tracking-tight">Análisis de Brecha Crítica</h4>
          <p className="text-amber-700 text-xs mt-1 leading-relaxed font-medium">
            Para alcanzar la meta de <span className="font-black">${stats.metaRecaudo.toLocaleString()}</span>, se requiere un esfuerzo adicional de <span className="font-black">${stats.faltanteMeta.toLocaleString()}</span>. 
            Actualmente tienes un capital en espera (pendientes) de <span className="font-black text-indigo-600">${stats.recaudoProyectado.toLocaleString()}</span>. 
            Aprobando todos los pendientes, reducirías la brecha al <span className="font-black italic">{(((stats.faltanteMeta - stats.recaudoProyectado) / stats.metaRecaudo) * 100).toFixed(1)}%</span>.
          </p>
        </div>
        <button className="bg-white text-amber-600 font-black px-8 py-4 rounded-xl text-[10px] uppercase tracking-widest shadow-sm hover:bg-amber-100 transition-all">
          <a href="/admin/inscripciones" className="flex items-center gap-2">
            Verificar Pendientes
          </a>
        </button>
      </div>
    </div>
  );
}

// Icono auxiliar que faltaba
function Users2(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  )
}