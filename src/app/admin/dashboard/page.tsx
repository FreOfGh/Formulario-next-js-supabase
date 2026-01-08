"use client";

import React, { useEffect, useState, useMemo } from "react";
import { createClient } from "@/utils/supabase/clients";
import AdminNavbar from "@/components/AdminNavbar";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from "recharts";
import { 
  TrendingUp, Users, Home, AlertCircle, Filter, 
  Database, FlaskConical, RefreshCcw, Sparkles
} from "lucide-react";
import { format, parseISO, getMonth, getDate } from "date-fns";
import { es } from "date-fns/locale";

// --- CONFIGURACIÓN VISUAL ---
const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

const getWeekOfMonth = (date: Date) => {
  const dayOfMonth = date.getDate();
  return Math.ceil(dayOfMonth / 7);
};

export default function AdminDashboard() {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [dbData, setDbData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados de Filtros
  const [selMonth, setSelMonth] = useState("all");
  const [selWeek, setSelWeek] = useState("all");
  const [selDay, setSelDay] = useState("all");

  const supabase = createClient();

  const loadData = async () => {
    setLoading(true);
    const { data } = await supabase.from("inscripciones").select("*").order('created_at', { ascending: true });
    setDbData(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!isDemoMode) loadData();
  }, [isDemoMode]);

  // Datos Mock para demostración instantánea
  const MOCK_DATA = [
    { id: "1", nombre_completo: "Juan Pérez", diocesis: "Bogotá", segmentacion: "laico", precio_pactado: 120000, estado: "aprobada", hospedaje: "si", created_at: "2024-10-05T10:00:00Z" },
    { id: "2", nombre_completo: "Mateo Gómez", diocesis: "Medellín", segmentacion: "sacerdote", precio_pactado: 40000, estado: "aprobada", hospedaje: "si", created_at: "2024-10-06T12:00:00Z" },
    { id: "3", nombre_completo: "Carlos Ruiz", diocesis: "Cali", segmentacion: "seminarista", precio_pactado: 50000, estado: "pendiente", hospedaje: "no", created_at: "2024-10-12T15:30:00Z" },
    { id: "4", nombre_completo: "Ana Sosa", diocesis: "Bogotá", segmentacion: "laico", precio_pactado: 150000, estado: "aprobada", hospedaje: "si", created_at: "2024-10-15T09:15:00Z" },
    { id: "5", nombre_completo: "Luis Vargas", diocesis: "Barranquilla", segmentacion: "laico", precio_pactado: 120000, estado: "rechazada", hospedaje: "no", created_at: "2024-11-02T11:00:00Z" },
  ];

  const sourceData = isDemoMode ? MOCK_DATA : dbData;

  // --- LÓGICA DE FILTRADO ---
  const filteredData = useMemo(() => {
    return sourceData.filter(item => {
      const d = parseISO(item.created_at);
      const mMatch = selMonth === "all" || getMonth(d).toString() === selMonth;
      const wMatch = selWeek === "all" || getWeekOfMonth(d).toString() === selWeek;
      const dMatch = selDay === "all" || getDate(d).toString() === selDay;
      return mMatch && wMatch && dMatch;
    });
  }, [sourceData, selMonth, selWeek, selDay]);

  // --- PROCESAMIENTO DE ESTADÍSTICAS ---
  const stats = useMemo(() => {
    const aprobadas = filteredData.filter(i => i.estado === 'aprobada');
    
    const totalRecaudado = aprobadas.reduce((acc, curr) => acc + Number(curr.precio_pactado), 0);
    const trendMap = filteredData.reduce((acc: any, item) => {
      const day = format(parseISO(item.created_at), 'dd MMM', { locale: es });
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {});
    const trendData = Object.keys(trendMap).map(date => ({ date, cantidad: trendMap[date] }));

    const dioMap = aprobadas.reduce((acc: any, item) => {
      acc[item.diocesis] = (acc[item.diocesis] || 0) + Number(item.precio_pactado);
      return acc;
    }, {});
    const dioData = Object.entries(dioMap).map(([name, value]) => ({ name, value })).sort((a:any, b:any) => b.value - a.value);

    const roleMap = filteredData.reduce((acc: any, item) => {
      acc[item.segmentacion] = (acc[item.segmentacion] || 0) + 1;
      return acc;
    }, {});
    const roleData = Object.entries(roleMap).map(([name, value]) => ({ name, value }));

    return { 
      totalRecaudado, 
      inscritos: filteredData.length, 
      pendientes: filteredData.filter(i => i.estado === 'pendiente').length, 
      hospedajes: aprobadas.filter(i => i.hospedaje === 'si').length,
      trendData, dioData, roleData 
    };
  }, [filteredData]);

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 overflow-x-hidden">
      <AdminNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* HEADER & SWITCHER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-indigo-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Panel de Control Principal</span>
            </div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">
              Data en <span className="text-indigo-600">Vivo</span>
            </h1>
          </div>
          
          <button 
            onClick={() => setIsDemoMode(!isDemoMode)}
            className={`flex items-center gap-3 px-8 py-4 rounded-[2rem] font-black text-[10px] tracking-widest transition-all shadow-2xl active:scale-95 ${
              isDemoMode ? "bg-amber-500 text-white shadow-amber-200" : "bg-slate-900 text-white shadow-slate-200"
            }`}
          >
            {isDemoMode ? <FlaskConical size={18}/> : <Database size={18}/>}
            {isDemoMode ? "SALIR DE MODO DEMO" : "SIMULAR DATOS"}
          </button>
        </div>

        {/* BARRA DE FILTROS BENTO */}
        <section className="bg-white p-4 md:p-8 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-wrap items-center gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Filter size={80} />
          </div>
          
          <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest mr-4">
            <Filter size={18} strokeWidth={3} /> Segmentación Temporal
          </div>
          
          <div className="flex flex-wrap gap-6">
            <FilterSelect label="Mes del año" value={selMonth} onChange={setSelMonth}>
              <option value="all">Todo el año</option>
              {["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"].map((m, i) => (
                <option key={m} value={i}>{m}</option>
              ))}
            </FilterSelect>

            <FilterSelect label="Semana específica" value={selWeek} onChange={setSelWeek}>
              <option value="all">Todas las semanas</option>
              {[1, 2, 3, 4, 5].map(w => <option key={w} value={w.toString()}>Semana {w}</option>)}
            </FilterSelect>

            <FilterSelect label="Día puntual" value={selDay} onChange={setSelDay}>
              <option value="all">Día del mes</option>
              {Array.from({ length: 31 }, (_, i) => (
                <option key={i + 1} value={(i + 1).toString()}>{i + 1}</option>
              ))}
            </FilterSelect>
          </div>

          <button 
            onClick={() => {setSelMonth("all"); setSelWeek("all"); setSelDay("all");}}
            className="ml-auto flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-rose-500 uppercase tracking-widest transition-all"
          >
            <RefreshCcw size={14} strokeWidth={3}/> Limpiar Filtros
          </button>
        </section>

        {/* KPIS REFINADOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <StatCard title="Recaudación" value={`$${stats.totalRecaudado.toLocaleString()}`} icon={TrendingUp} color="indigo" />
          <StatCard title="Total Inscritos" value={stats.inscritos} icon={Users} color="blue" />
          <StatCard title="Pagos Pendientes" value={stats.pendientes} icon={AlertCircle} color="orange" />
          <StatCard title="Uso Hospedaje" value={stats.hospedajes} icon={Home} color="purple" />
        </div>

        {/* GRÁFICAS PRINCIPALES */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* LÍNEA DE TENDENCIA */}
          <div className="lg:col-span-8 bg-white p-10 rounded-[3.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-10 flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-500 rounded-full" /> Flujo Dinámico de Inscripciones
            </h3>
            <div className="h-[380px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.trendData}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', padding: '20px'}}
                    itemStyle={{fontWeight: '900', textTransform: 'uppercase', fontSize: '10px'}}
                  />
                  <Area type="monotone" dataKey="cantidad" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* DONUT DE PERFILES */}
          <div className="lg:col-span-4 bg-white p-10 rounded-[3.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-10 self-start">Segmentación de Roles</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.roleData} innerRadius={75} outerRadius={95} paddingAngle={8} dataKey="value" stroke="none">
                    {stats.roleData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', paddingTop: '20px'}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-8 w-full p-6 bg-slate-900 rounded-3xl">
                <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Ratio Eficiencia</span>
                    <span className="text-xl font-black text-white italic">
                        {stats.inscritos > 0 ? Math.round(((stats.inscritos - stats.pendientes) / stats.inscritos) * 100) : 0}%
                    </span>
                </div>
            </div>
          </div>
        </div>

        {/* BAR CHART: JURISDICCIONES */}
        <div className="bg-white p-10 rounded-[3.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 group">
            <div className="flex items-center justify-between mb-10">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Top Jurisdicciones por Recaudo</h3>
                <div className="h-px flex-1 mx-8 bg-slate-50" />
            </div>
            <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.dioData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#1e293b'}} width={140} />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '15px'}} />
                    <Bar dataKey="value" fill="#6366f1" radius={[0, 20, 20, 0]} barSize={35} className="hover:fill-indigo-400 transition-all cursor-pointer" />
                  </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </main>
    </div>
  );
}

// --- SUBCOMPONENTES DE UI ---

function FilterSelect({ label, value, onChange, children }: any) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-2 leading-none">{label}</label>
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="bg-slate-50 border-2 border-transparent rounded-2xl text-[11px] font-black uppercase px-5 py-3 focus:border-indigo-500 focus:bg-white transition-all outline-none cursor-pointer appearance-none shadow-sm hover:bg-slate-100"
      >
        {children}
      </select>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
    const colors: any = {
      indigo: "bg-indigo-600 text-white shadow-indigo-200",
      blue: "bg-white text-blue-600 border-slate-100",
      orange: "bg-white text-orange-600 border-slate-100",
      purple: "bg-white text-purple-600 border-slate-100",
    };
    
    return (
      <div className={`p-8 rounded-[3rem] border shadow-xl shadow-slate-200/40 flex items-center gap-6 group hover:translate-y-[-6px] transition-all duration-500 ${colors[color]}`}>
        <div className={`w-16 h-16 rounded-[1.8rem] flex items-center justify-center transition-transform group-hover:rotate-12 ${color === 'indigo' ? 'bg-white/20' : 'bg-slate-50'}`}>
          <Icon size={32} strokeWidth={2.5} />
        </div>
        <div>
          <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${color === 'indigo' ? 'text-indigo-200' : 'text-slate-400'}`}>{title}</p>
          <h4 className={`text-3xl font-black tracking-tighter italic ${color === 'indigo' ? 'text-white' : 'text-slate-900'}`}>{value}</h4>
        </div>
      </div>
    );
}