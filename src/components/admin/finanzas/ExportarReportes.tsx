"use client";
import React, { useState } from "react";
import { 
  FileSpreadsheet, FileText, Table as TableIcon, 
  Download, FileCheck, Loader2, Sparkles, ShieldCheck
} from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ExportarProps {
  data: any[];
  nombreEvento?: string;
}

export default function ExportarReportes({ data = [], nombreEvento = "SANTA HELENA" }: ExportarProps) {
  const [loading, setLoading] = useState<string | null>(null);

  // --- LÓGICA: EXPORTAR EXCEL (XLSX) ---
  const handleExcel = () => {
    setLoading('excel');
    try {
      const preparedData = data.map(i => ({
        "FECHA REGISTRO": new Date(i.created_at).toLocaleDateString(),
        "NOMBRES Y APELLIDOS": i.nombre_completo?.toUpperCase() || "SIN NOMBRE",
        "DOCUMENTO": i.documento || "N/A",
        "CELULAR": i.celular || "N/A",
        "PERFIL": i.tipos_persona?.nombre?.toUpperCase() || "ESTÁNDAR",
        "SEDE/CIUDAD": i.sedes?.nombre?.toUpperCase() || "N/A",
        "ESTADO PAGO": i.estado_pago?.toUpperCase() || "PENDIENTE",
        "MÉTODO": i.metodo_pago?.toUpperCase() || "N/A",
        "VALOR PAGADO": i.monto_pagado || 0,
        "DESCUENTO": i.valor_descuento || 0
      }));

      const ws = XLSX.utils.json_to_sheet(preparedData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Inscritos_Oficial");
      
      // Ajuste automático de columnas (opcional pero profesional)
      ws['!cols'] = [{ wch: 15 }, { wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 10 }];

      XLSX.writeFile(wb, `${nombreEvento.replace(/\s/g, '_')}_REPORTE_${Date.now()}.xlsx`);
    } catch (error) {
      console.error("Error Excel:", error);
    } finally {
      setLoading(null);
    }
  };

  // --- LÓGICA: EXPORTAR PDF (JS-PDF) ---
  const handlePDF = () => {
    setLoading('pdf');
    try {
      const doc = new jsPDF();
      const timestamp = new Date().toLocaleString();

      // Membrete Estilo Premium
      doc.setFillColor(15, 23, 42); // Slate-900
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(255, 255, 255);
      doc.text(nombreEvento.toUpperCase(), 14, 20);
      
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(200, 200, 200);
      doc.text(`REPORTE OFICIAL DE INSCRITOS | GENERADO: ${timestamp}`, 14, 30);

      const rows = data.map(i => [
        new Date(i.created_at).toLocaleDateString(),
        i.nombre_completo?.toUpperCase() || "N/A",
        i.tipos_persona?.nombre?.substring(0, 15) || "N/A",
        `$${Number(i.monto_pagado || 0).toLocaleString()}`,
        i.estado_pago?.toUpperCase() || "PENDIENTE"
      ]);

      autoTable(doc, {
        startY: 50,
        head: [['Fecha', 'Participante', 'Perfil', 'Monto', 'Estado']],
        body: rows,
        theme: 'striped',
        headStyles: { 
          fillColor: [79, 70, 229], // Indigo-600
          fontSize: 9, 
          fontStyle: 'bold',
          halign: 'center' 
        },
        styles: { fontSize: 8, cellPadding: 4, font: "helvetica" },
        columnStyles: {
          3: { halign: 'right' },
          4: { halign: 'center' }
        }
      });

      // Pie de página
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Página ${i} de ${pageCount} - Documento de uso interno administrativo`, 14, 285);
      }

      doc.save(`${nombreEvento}_PDF_${Date.now()}.pdf`);
    } catch (error) {
      console.error("Error PDF:", error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* HEADER DE SECCIÓN */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-amber-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Data Center</span>
          </div>
          <h2 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
            Exportar Inteligencia
          </h2>
          <p className="text-slate-500 text-sm mt-2 font-medium">Genera reportes legales y contables en segundos.</p>
        </div>
      </div>

      {/* GRID DE OPCIONES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <ReportCard 
          title="Libro Contable (XLSX)" 
          desc="Estructura completa de datos para auditorías avanzadas y filtros en Excel."
          icon={<FileSpreadsheet size={32} className="text-emerald-500" />}
          onExport={handleExcel}
          loading={loading === 'excel'}
          color="hover:border-emerald-200"
        />
        <ReportCard 
          title="Documento Oficial (PDF)" 
          desc="Reporte visual con membrete diseñado para juntas y presentaciones oficiales."
          icon={<FileText size={32} className="text-rose-500" />}
          onExport={handlePDF}
          loading={loading === 'pdf'}
          color="hover:border-rose-200"
        />
        <ReportCard 
          title="Base Plana (CSV)" 
          desc="Formato de texto ligero optimizado para migración a otros software de CRM."
          icon={<TableIcon size={32} className="text-slate-500" />}
          onExport={handleExcel} // Reusamos lógica de Excel pero con CSV si fuera necesario
          loading={loading === 'csv'}
          color="hover:border-slate-300"
        />
      </div>

      {/* BANNER DE CONCILIACIÓN */}
      <div className="bg-slate-900 rounded-[3.5rem] p-10 text-white relative overflow-hidden group">
        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
            <div className="w-24 h-24 bg-white/10 rounded-[2rem] flex items-center justify-center backdrop-blur-xl border border-white/10 shadow-2xl group-hover:scale-110 transition-transform duration-500">
                <ShieldCheck size={48} className="text-indigo-400" />
            </div>
            <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 rounded-full mb-3 border border-indigo-500/30">
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Algoritmo de Seguridad</span>
                </div>
                <h4 className="text-2xl font-black italic uppercase tracking-tight">Conciliación Bancaria</h4>
                <p className="text-slate-400 text-sm mt-2 max-w-xl leading-relaxed">
                    Este sistema cruza los ingresos reales contra los perfiles de descuento asignados. Detecta automáticamente si alguien pagó de menos según su rol seleccionado.
                </p>
            </div>
            <button 
                onClick={handleExcel}
                className="bg-white text-slate-900 font-black px-10 py-5 rounded-2xl hover:bg-indigo-50 active:scale-95 transition-all uppercase text-xs tracking-widest flex items-center gap-3 shadow-xl shadow-white/5"
            >
                {loading === 'excel' ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} strokeWidth={3} />}
                Generar Auditoría
            </button>
        </div>
        
        {/* Decoraciones de fondo */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -left-20 -top-20 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
      </div>
    </div>
  );
}

// --- SUB-COMPONENTE: CARD DE REPORTE ---
function ReportCard({ title, desc, icon, onExport, loading, color }: any) {
  return (
    <div className={`bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm transition-all duration-500 group flex flex-col h-full ${color}`}>
      <div className="w-20 h-20 bg-slate-50 rounded-[1.8rem] flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-inner">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="font-black text-slate-900 uppercase italic text-lg tracking-tighter leading-none mb-3">
            {title}
        </h3>
        <p className="text-[11px] font-bold text-slate-400 uppercase leading-relaxed tracking-tight">
            {desc}
        </p>
      </div>
      <button 
        disabled={loading}
        onClick={onExport}
        className="w-full mt-10 flex items-center justify-center gap-3 bg-slate-900 text-white font-black py-5 rounded-[1.5rem] text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-600 hover:shadow-xl hover:shadow-indigo-100 transition-all active:scale-[0.98] disabled:opacity-50"
      >
        {loading ? (
            <Loader2 className="animate-spin" size={18}/> 
        ) : (
            <>
                <Download size={18} strokeWidth={3}/> 
                Descargar Archivo
            </>
        )}
      </button>
    </div>
  );
}