"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { createClient } from "@/utils/supabase/clients";
import AdminNavbar from "@/components/AdminNavbar";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Pie, Cell, Legend, AreaChart, Area, LineChart, Line,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";
import { 
  TrendingUp, Users, Home, AlertCircle, Filter, 
  Database, FlaskConical, RefreshCcw, Sparkles, Trash2, 
  Zap, Loader2, CheckCircle2, Download, Settings,
  BarChart3, Target, DollarSign, Calendar, Clock,
  Building, Shield, Activity, Cpu, Server,
  Eye, FileText, Printer, DatabaseBackup, Network,
  TrendingDown, Percent, ArrowUpRight, ArrowDownRight,
  ChevronRight, ChevronLeft, Maximize2, Minimize2,
  Bell, MessageSquare, Award, Crown, PieChart
} from "lucide-react";
import { format, parseISO, getMonth, getDate, subDays, startOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#14b8a6'];

export default function AdminDashboard() {
  const supabase = createClient();
  const [dbData, setDbData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "all">("30d");
  const [expandedView, setExpandedView] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  
  // Filtros
  const [selMonth, setSelMonth] = useState("all");
  const [selDiocesis, setSelDiocesis] = useState("all");
  const [selEstado, setSelEstado] = useState("all");

  const loadData = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("inscripciones")
        .select(`*, eventos(nombre), tipos_persona(nombre, color), jurisdicciones(nombre)`)
        .order('created_at', { ascending: false });
      setDbData(data || []);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    loadData(); 
    // Auto-refresh cada 30 segundos
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleGenerateGhostData = async () => {
    setIsProcessing(true);
    const timestamp = Date.now();
    const ghostName = `🧪 LAB-${format(new Date(), 'HH:mm')}`;

    try {
      // 1. Crear evento
      const { data: evento, error: evError } = await supabase
        .from('eventos')
        .insert([{ 
          nombre: ghostName, 
          slug: `lab-${timestamp}`,
          esta_activo: false,
          meta_recaudacion: 15000000,
          ubicacion: "Sede Virtual de Pruebas",
          descripcion: "Laboratorio de pruebas generado automáticamente"
        }])
        .select().single();

      if (evError) throw evError;

      // 2. Configuración del evento
      await supabase
        .from('configuracion_evento')
        .insert([{
          evento_id: evento.id,
          modo_precio: 'individual',
          precio_global_base: 100000,
          metodo_descuento: 'porcentaje',
          valor_hospedaje_general: 45000,
          usar_hospedaje_diocesis: true
        }]);

      // 3. Jurisdicciones
      const jurNames = ["Bogotá", "Medellín", "Cali", "Barranquilla", "Pereira", "Cartagena", "Bucaramanga"];
      const { data: jurs } = await supabase
        .from('jurisdicciones')
        .insert(jurNames.map(name => ({
          nombre: name,
          evento_id: evento.id,
          precio_base: Math.floor(Math.random() * (120000 - 80000) + 80000),
          email_encargado: `contacto@${name.toLowerCase()}.com`
        })))
        .select();

      // 4. Tipos de persona
      const rolesData = [
        { nombre: 'Laico', desc: 0, color: '#6366f1' },
        { nombre: 'Sacerdote', desc: 20, color: '#8b5cf6' },
        { nombre: 'Seminarista', desc: 50, color: '#ec4899' },
        { nombre: 'Religioso', desc: 30, color: '#f59e0b' },
        { nombre: 'Obispo', desc: 100, color: '#10b981' }
      ];

      const { data: roles } = await supabase
        .from('tipos_persona')
        .insert(rolesData.map(r => ({
          nombre: r.nombre,
          valor: r.nombre,
          descuento_porcentaje: r.desc,
          color: r.color,
          evento_id: evento.id,
          metodo_activo: 'porcentaje',
          cupo_maximo: Math.floor(Math.random() * 100) + 50
        })))
        .select();

      if (!jurs || !roles) throw new Error("Error al crear jurisdicciones o roles");

      // 5. Generar 250 inscripciones realistas
      const nombres = ["Andrés", "Beatriz", "Carlos", "Diana", "Esteban", "Fabiola", "Gustavo", "Elena", "Héctor", "Isabel"];
      const apellidos = ["García", "Martínez", "López", "Sánchez", "Rodríguez", "Pérez", "Vargas", "Ramírez", "Torres"];

      const ghostInscriptions = Array.from({ length: 250 }).map(() => {
        const randomJur = jurs[Math.floor(Math.random() * jurs.length)];
        const randomRole = roles[Math.floor(Math.random() * roles.length)];
        const daysAgo = Math.floor(Math.random() * 90);
        const randomDate = subDays(new Date(), daysAgo);
        
        const precioBase = Number(randomJur.precio_base);
        const descuento = Number(randomRole.descuento_porcentaje) / 100;
        const final = Math.round(precioBase - (precioBase * descuento));

        const estados = ['aprobada', 'pendiente', 'rechazada'];
        const estado = estados[Math.floor(Math.random() * 3)];
        const montoPagado = estado === 'aprobada' ? final : estado === 'pendiente' ? Math.round(final * Math.random()) : 0;

        return {
          evento_id: evento.id,
          nombre: nombres[Math.floor(Math.random() * nombres.length)],
          apellido: apellidos[Math.floor(Math.random() * apellidos.length)],
          email: `test${Math.floor(Math.random() * 10000)}@test.com`,
          documento: `1${Math.floor(Math.random() * 900000000)}`,
          diocesis: randomJur.nombre,
          segmentacion: randomRole.nombre,
          precio_pactado: final,
          monto_pagado: montoPagado,
          estado: estado,
          hospedaje: Math.random() > 0.5 ? 'si' : 'no',
          created_at: randomDate.toISOString()
        };
      });

      await supabase.from('inscripciones').insert(ghostInscriptions);

      alert(`✅ Laboratorio creado exitosamente:\n• Evento: ${ghostName}\n• Jurisdicciones: ${jurs.length}\n• Roles: ${roles.length}\n• Inscripciones: 250`);
      await loadData();

    } catch (err: any) {
      console.error("Error en el Laboratorio:", err);
      alert(`Error: ${err.message || 'Error desconocido'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePurgeGhostData = async () => {
    if (!confirm("⚠️ ¿Eliminar TODOS los datos de prueba de la base de datos?\nEsta acción no se puede deshacer.")) return;
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('eventos')
        .delete()
        .ilike('nombre', '%LAB-%');

      if (error) throw error;
      await loadData();
      alert("✅ Datos de prueba eliminados correctamente");
    } catch (err) {
      alert("❌ Error al purgar datos");
    } finally {
      setIsProcessing(false);
    }
  };

  const generarPDF = async () => {
    if (!reportRef.current || exporting) return;
    
    setExporting(true);
    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff"
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // Título
      pdf.setFontSize(20);
      pdf.text("Reporte del Dashboard", pdfWidth / 2, 15, { align: "center" });
      pdf.setFontSize(12);
      pdf.text("Administración Central", pdfWidth / 2, 22, { align: "center" });
      pdf.text(`Generado: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, pdfWidth / 2, 29, { align: "center" });
      
      // Dashboard principal
      pdf.addImage(imgData, "PNG", 10, 40, pdfWidth - 20, pdfHeight * (pdfWidth - 20) / pdfWidth);
      
      // Página adicional con detalles
      pdf.addPage();
      pdf.setFontSize(16);
      pdf.text("Análisis Estadístico Detallado", 20, 20);
      
      const detalles = [
        `Total Inscripciones: ${filteredData.length}`,
        `Aprobadas: ${stats.aprobadas} (${stats.tasaAprobacion}%)`,
        `Pendientes: ${stats.pendientes}`,
        `Rechazadas: ${stats.rechazadas}`,
        `Recaudo Total: $${stats.totalRecaudado.toLocaleString()}`,
        `Recaudo Pendiente: $${stats.recaudoPendiente.toLocaleString()}`,
        `Ticket Promedio: $${stats.ticketPromedio.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
        `Diocesis Activas: ${stats.diocesisActivas}`,
        `Roles Registrados: ${stats.rolesRegistrados}`,
        `Tasa de Crecimiento: ${stats.tasaCrecimiento >= 0 ? '+' : ''}${stats.tasaCrecimiento.toFixed(1)}%`,
        `Hospedajes Solicitados: ${stats.hospedajes}`
      ];
      
      detalles.forEach((line, index) => {
        pdf.text(line, 20, 40 + (index * 10));
      });
      
      pdf.save(`Dashboard-Reporte-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    } catch (error) {
      console.error("Error generando PDF:", error);
      alert("Error al generar el PDF. Por favor, intente nuevamente.");
    } finally {
      setExporting(false);
    }
  };

  const filteredData = useMemo(() => {
    let filtered = dbData;
    
    // Filtrar por rango de tiempo
    if (timeRange !== "all") {
      const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
      const cutoffDate = subDays(new Date(), days);
      filtered = filtered.filter(item => new Date(item.created_at) >= cutoffDate);
    }
    
    // Filtrar por mes
    if (selMonth !== "all") {
      filtered = filtered.filter(item => getMonth(parseISO(item.created_at)).toString() === selMonth);
    }
    
    // Filtrar por diócesis
    if (selDiocesis !== "all") {
      filtered = filtered.filter(item => item.diocesis === selDiocesis);
    }
    
    // Filtrar por estado
    if (selEstado !== "all") {
      filtered = filtered.filter(item => item.estado === selEstado);
    }
    
    return filtered;
  }, [dbData, timeRange, selMonth, selDiocesis, selEstado]);

  const stats = useMemo(() => {
    const aprobadas = filteredData.filter(i => i.estado === 'aprobada');
    const pendientes = filteredData.filter(i => i.estado === 'pendiente');
    const rechazadas = filteredData.filter(i => i.estado === 'rechazada');
    
    const totalRecaudado = aprobadas.reduce((acc, curr) => acc + Number(curr.monto_pagado || 0), 0);
    const recaudoPendiente = pendientes.reduce((acc, curr) => acc + Number(curr.precio_pactado || 0), 0);
    const ticketPromedio = aprobadas.length > 0 ? totalRecaudado / aprobadas.length : 0;
    
    const diocesisActivas = [...new Set(filteredData.map(i => i.diocesis).filter(Boolean))].length;
    const rolesRegistrados = [...new Set(filteredData.map(i => i.segmentacion).filter(Boolean))].length;
    
    const tasaAprobacion = filteredData.length > 0 ? (aprobadas.length / filteredData.length) * 100 : 0;
    
    // Cálculo de tasa de crecimiento (últimos 7 días vs anteriores 7 días)
    const hoy = new Date();
    const ultimaSemana = filteredData.filter(i => {
      const fecha = new Date(i.created_at);
      return fecha >= subDays(hoy, 7);
    }).length;
    
    const semanaAnterior = filteredData.filter(i => {
      const fecha = new Date(i.created_at);
      return fecha >= subDays(hoy, 14) && fecha < subDays(hoy, 7);
    }).length;
    
    const tasaCrecimiento = semanaAnterior > 0 
      ? ((ultimaSemana - semanaAnterior) / semanaAnterior) * 100 
      : ultimaSemana > 0 ? 100 : 0;

    // Datos para gráficos
    const trendData = filteredData.reduce((acc: any[], item) => {
      const day = format(parseISO(item.created_at), 'dd MMM', { locale: es });
      const existing = acc.find(d => d.date === day);
      if (existing) {
        existing.cantidad += 1;
        existing.recaudo += Number(item.monto_pagado || 0);
      } else {
        acc.push({ date: day, cantidad: 1, recaudo: Number(item.monto_pagado || 0) });
      }
      return acc;
    }, []).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const dioData = filteredData.reduce((acc: Record<string, number>, item) => {
      const diocesis = item.diocesis || 'Sin asignar';
      acc[diocesis] = (acc[diocesis] || 0) + 1;
      return acc;
    }, {});
    
    const dioChartData = Object.entries(dioData)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    const roleData = filteredData.reduce((acc: Record<string, number>, item) => {
      const role = item.segmentacion || 'Sin rol';
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {});
    
    const roleChartData = Object.entries(roleData)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const estadoData = [
      { name: 'Aprobadas', value: aprobadas.length, color: '#10b981' },
      { name: 'Pendientes', value: pendientes.length, color: '#f59e0b' },
      { name: 'Rechazadas', value: rechazadas.length, color: '#ef4444' },
    ];

    return { 
      totalRecaudado, 
      recaudoPendiente,
      ticketPromedio,
      aprobadas: aprobadas.length, 
      pendientes: pendientes.length,
      rechazadas: rechazadas.length,
      hospedajes: aprobadas.filter(i => i.hospedaje === 'si').length,
      diocesisActivas,
      rolesRegistrados,
      tasaAprobacion,
      tasaCrecimiento,
      trendData,
      dioChartData,
      roleChartData,
      estadoData,
      totalInscritos: filteredData.length
    };
  }, [filteredData]);

  const diocesisList = useMemo(() => {
    return [...new Set(dbData.map(i => i.diocesis).filter(Boolean))].sort();
  }, [dbData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center">
        <div className="relative">
          <Loader2 className="animate-spin text-indigo-600" size={64} />
          <div className="absolute inset-0 animate-ping bg-indigo-600/20 rounded-full"></div>
        </div>
        <p className="mt-6 text-2xl font-black text-slate-900">Inicializando Dashboard</p>
        <p className="text-slate-500 mt-2">Cargando datos del sistema...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 font-sans">
      <AdminNavbar />
      
      <div ref={reportRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-10">
        
        {/* HEADER MEJORADO */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-8 rounded-3xl shadow-lg">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-100 rounded-2xl">
                <Activity className="text-indigo-600" size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                    Sistema de Inteligencia
                  </span>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse delay-100"></div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse delay-200"></div>
                  </div>
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 mt-2">
                  Dashboard de Control
                </h1>
                <p className="text-slate-500 flex items-center gap-2">
                  <Database size={14} />
                  {dbData.length} registros totales
                  <span className="mx-2">•</span>
                  <Server size={14} />
                  {stats.diocesisActivas} diócesis activas
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={generarPDF}
              disabled={exporting}
              className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {exporting ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Download size={18} />
              )}
              {exporting ? "Generando..." : "Exportar PDF"}
            </button>
            
            <button 
              onClick={loadData}
              className="px-4 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCcw size={18} />
              Actualizar
            </button>
          </div>
        </div>

        {/* CONTROLES Y FILTROS */}
        <div className="bg-white p-6 rounded-3xl shadow-lg">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-6">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setActiveTab("overview")}
                className={`px-6 py-3 rounded-2xl font-bold transition-colors ${
                  activeTab === "overview" 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Resumen
              </button>
              <button 
                onClick={() => setActiveTab("analytics")}
                className={`px-6 py-3 rounded-2xl font-bold transition-colors ${
                  activeTab === "analytics" 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Análisis
              </button>
              <button 
                onClick={() => setActiveTab("tools")}
                className={`px-6 py-3 rounded-2xl font-bold transition-colors ${
                  activeTab === "tools" 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Herramientas
              </button>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <select 
                className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
              >
                <option value="7d">Últimos 7 días</option>
                <option value="30d">Últimos 30 días</option>
                <option value="90d">Últimos 90 días</option>
                <option value="all">Todo el tiempo</option>
              </select>
              
              <select 
                className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={selDiocesis}
                onChange={(e) => setSelDiocesis(e.target.value)}
              >
                <option value="all">Todas las diócesis</option>
                {diocesisList.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              
              <select 
                className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={selEstado}
                onChange={(e) => setSelEstado(e.target.value)}
              >
                <option value="all">Todos los estados</option>
                <option value="aprobada">Aprobadas</option>
                <option value="pendiente">Pendientes</option>
                <option value="rechazada">Rechazadas</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="col-span-2 md:col-span-1 flex items-center gap-3">
              <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
              <div>
                <p className="text-sm font-bold text-slate-500">Filtros activos</p>
                <p className="font-bold text-slate-900">
                  {timeRange !== "all" ? timeRange : "Todo"} • {selDiocesis === "all" ? "Todas" : "1"} diocesis
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <div>
                <p className="text-sm font-bold text-slate-500">Resultados</p>
                <p className="font-bold text-slate-900">{filteredData.length} inscripciones</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
              <div>
                <p className="text-sm font-bold text-slate-500">Tasa aprobación</p>
                <p className="font-bold text-slate-900">{stats.tasaAprobacion.toFixed(1)}%</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <div>
                <p className="text-sm font-bold text-slate-500">Crecimiento</p>
                <p className={`font-bold ${stats.tasaCrecimiento >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {stats.tasaCrecimiento >= 0 ? '+' : ''}{stats.tasaCrecimiento.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* KPI GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-6 rounded-3xl text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white/80">Recaudación</p>
                <p className="text-3xl font-black mt-2">${stats.totalRecaudado.toLocaleString()}</p>
              </div>
              <DollarSign size={32} className="text-white/80" />
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm">
                <span>Pendiente</span>
                <span className="font-bold">${stats.recaudoPendiente.toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-500">Inscripciones</p>
                <p className="text-3xl font-black text-slate-900 mt-2">{stats.totalInscritos}</p>
              </div>
              <Users className="text-indigo-600" size={32} />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="text-center">
                <div className="text-sm font-bold text-emerald-600">{stats.aprobadas}</div>
                <div className="text-xs text-slate-500">Aprobadas</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-amber-600">{stats.pendientes}</div>
                <div className="text-xs text-slate-500">Pendientes</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-rose-600">{stats.rechazadas}</div>
                <div className="text-xs text-slate-500">Rechazadas</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-500">Ticket Promedio</p>
                <p className="text-3xl font-black text-emerald-600 mt-2">
                  ${stats.ticketPromedio.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
              <TrendingUp className="text-emerald-600" size={32} />
            </div>
            <div className="mt-4">
              <p className="text-sm text-slate-500">Valor promedio por inscripción aprobada</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-500">Distribución</p>
                <p className="text-3xl font-black text-purple-600 mt-2">
                  {stats.diocesisActivas} / {stats.rolesRegistrados}
                </p>
              </div>
              <Network className="text-purple-600" size={32} />
            </div>
            <div className="mt-4">
              <p className="text-sm text-slate-500">Diocesis / Roles activos</p>
            </div>
          </div>
        </div>

        {/* GRÁFICOS PRINCIPALES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gráfico de Tendencia */}
          <div className="bg-white p-8 rounded-3xl shadow-lg">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Tendencia Temporal</h3>
                <p className="text-slate-500 text-sm">Inscripciones y recaudo por día</p>
              </div>
              <BarChart3 className="text-indigo-600" size={24} />
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.trendData.slice(-15)}>
                  <defs>
                    <linearGradient id="colorCantidad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'recaudo') return [`$${Number(value).toLocaleString()}`, 'Recaudo'];
                      return [value, 'Inscritos'];
                    }}
                  />
                  <Legend />
                  <Area 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="cantidad" 
                    stroke="#4f46e5" 
                    strokeWidth={2}
                    fill="url(#colorCantidad)"
                    name="Inscritos"
                  />
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="recaudo" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={false}
                    name="Recaudo"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfico de Estados */}
          <div className="bg-white p-8 rounded-3xl shadow-lg">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Distribución por Estado</h3>
                <p className="text-slate-500 text-sm">Estado de las inscripciones</p>
              </div>
              <PieChart className="text-indigo-600" size={24} />
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.estadoData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={(entry) => `${entry.name}: ${entry.value}`}
                  >
                    {stats.estadoData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Inscritos']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* GRÁFICOS SECUNDARIOS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Diócesis */}
          <div className="bg-white p-8 rounded-3xl shadow-lg">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Top Diócesis</h3>
                <p className="text-slate-500 text-sm">Por cantidad de inscritos</p>
              </div>
              <Building className="text-indigo-600" size={24} />
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.dioChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip formatter={(value) => [value, 'Inscritos']} />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Distribución por Rol */}
          <div className="bg-white p-8 rounded-3xl shadow-lg">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Distribución por Rol</h3>
                <p className="text-slate-500 text-sm">Segmentación de participantes</p>
              </div>
              <Crown className="text-indigo-600" size={24} />
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.roleChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={(entry) => `${entry.name}: ${entry.value}`}
                  >
                    {stats.roleChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Inscritos']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* SECCIÓN DE HERRAMIENTAS */}
        <div className="bg-white p-8 rounded-3xl shadow-lg">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Herramientas de Desarrollo</h3>
              <p className="text-slate-500 text-sm">Generación y gestión de datos de prueba</p>
            </div>
            <FlaskConical className="text-indigo-600" size={24} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl border border-indigo-100">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center mb-4">
                    <Zap className="text-indigo-600" size={24} />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">Generar Datos de Prueba</h4>
                  <p className="text-slate-600 mb-6">
                    Crea un evento completo con 250 inscripciones realistas para pruebas y desarrollo.
                  </p>
                </div>
              </div>
              <button 
                onClick={handleGenerateGhostData}
                disabled={isProcessing}
                className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {isProcessing ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Zap size={20} />
                )}
                {isProcessing ? "Generando..." : "Generar Laboratorio de Pruebas"}
              </button>
              <div className="mt-4 text-sm text-slate-500">
                <p>• 1 evento con configuración</p>
                <p>• 7 jurisdicciones diferentes</p>
                <p>• 5 tipos de roles</p>
                <p>• 250 inscripciones realistas</p>
              </div>
            </div>
            
            <div className="p-6 bg-gradient-to-br from-rose-50 to-amber-50 rounded-3xl border border-rose-100">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center mb-4">
                    <Trash2 className="text-rose-600" size={24} />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">Limpiar Datos de Prueba</h4>
                  <p className="text-slate-600 mb-6">
                    Elimina todos los eventos y datos generados por el laboratorio de pruebas.
                  </p>
                </div>
              </div>
              <button 
                onClick={handlePurgeGhostData}
                disabled={isProcessing}
                className="w-full py-4 bg-white border-2 border-rose-200 text-rose-600 font-bold rounded-2xl hover:bg-rose-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {isProcessing ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Trash2 size={20} />
                )}
                {isProcessing ? "Limpiando..." : "Limpiar Laboratorio de Pruebas"}
              </button>
              <div className="mt-4 text-sm text-slate-500">
                <p className="text-rose-600 font-bold">⚠️ Acción irreversible</p>
                <p>• Elimina eventos "LAB-"</p>
                <p>• Borra todas sus inscripciones</p>
                <p>• No afecta datos reales</p>
              </div>
            </div>
          </div>
        </div>

        {/* ESTADÍSTICAS RÁPIDAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="text-emerald-600" size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500">Tasa de Éxito</p>
                <p className="text-2xl font-black text-emerald-600">{stats.tasaAprobacion.toFixed(1)}%</p>
              </div>
            </div>
            <p className="text-sm text-slate-500">Inscripciones aprobadas vs totales</p>
          </div>
          
          <div className="bg-white p-6 rounded-3xl shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Home className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500">Hospedajes</p>
                <p className="text-2xl font-black text-blue-600">{stats.hospedajes}</p>
              </div>
            </div>
            <p className="text-sm text-slate-500">Solicitudes de alojamiento</p>
          </div>
          
          <div className="bg-white p-6 rounded-3xl shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <DatabaseBackup className="text-purple-600" size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500">Datos Total</p>
                <p className="text-2xl font-black text-purple-600">{dbData.length}</p>
              </div>
            </div>
            <p className="text-sm text-slate-500">Registros en la base de datos</p>
          </div>
        </div>
      </div>
    </div>
  );
}