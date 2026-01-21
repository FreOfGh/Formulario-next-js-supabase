"use client";
import React, { useState } from "react";
import { 
  FileSpreadsheet, FileText, Table as TableIcon, 
  Download, Loader2, Sparkles, ShieldCheck 
} from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ExportarProps {
  data: any[];
  nombreEvento?: string;
}

export default function ExportarReportes({ data = [], nombreEvento = "EVENTO OFICIAL" }: ExportarProps) {
  const [loading, setLoading] = useState<string | null>(null);

  // --- LÓGICA: EXCEL ---
  const handleExcel = () => {
    setLoading('excel');
    try {
      const preparedData = data.map(i => ({
        "FECHA REGISTRO": i.created_at ? new Date(i.created_at).toLocaleDateString() : 'N/A',
        "PARTICIPANTE": `${i.nombre} ${i.apellido}`.toUpperCase(),
        "EMAIL": i.email,
        "JURISDICCIÓN": i.jurisdicciones?.nombre?.toUpperCase() || "N/A",
        "ESTADO": i.estado?.toUpperCase() || "PENDIENTE",
        "MONTO PAGO": i.monto_pago || 0,
        "SEGMENTACIÓN": i.segmentacion || "N/A"
      }));

      const ws = XLSX.utils.json_to_sheet(preparedData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Reporte_Inscritos");
      
      // Auto-ancho de columnas
      ws['!cols'] = [{ wch: 15 }, { wch: 30 }, { wch: 25 }, { wch: 20 }, { wch: 12 }, { wch: 12 }, { wch: 15 }];

      XLSX.writeFile(wb, `REPORTE_${nombreEvento.replace(/\s/g, '_')}_${Date.now()}.xlsx`);
    } catch (error) {
      console.error("Error Excel:", error);
    } finally {
      setLoading(null);
    }
  };

  // --- LÓGICA: PDF ---
  const handlePDF = () => {
    setLoading('pdf');
    try {
      const doc = new jsPDF();
      const timestamp = new Date().toLocaleString();

      // Membrete Premium
      doc.setFillColor(15, 23, 42); // Slate-900
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(255, 255, 255);
      doc.text(nombreEvento.toUpperCase(), 14, 20);
      
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(200, 200, 200);
      doc.text(`REPORTE DE AUDITORÍA | GENERADO: ${timestamp}`, 14, 30);

      const rows = data.map(i => [
        i.created_at ? new Date(i.created_at).toLocaleDateString() : 'N/A',
        `${i.nombre} ${i.apellido}`.toUpperCase(),
        i.jurisdicciones?.nombre || "N/A",
        `$${Number(i.monto_pago || 0).toLocaleString()}`,
        i.estado?.toUpperCase() || "PENDIENTE"
      ]);

      autoTable(doc, {
        startY: 50,
        head: [['Fecha', 'Participante', 'Sede', 'Monto', 'Estado']],
        body: rows,
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229], fontSize: 9, halign: 'center' },
        styles: { fontSize: 8, font: "helvetica" },
      });

      doc.save(`PDF_${nombreEvento}_${Date.now()}.pdf`);
    } catch (error) {
      console.error("Error PDF:", error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* HEADER */}
      <div className="px-2">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={14} className="text-amber-500" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Inteligencia de Datos</span>
        </div>
        <h2 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
          Exportar Reportes
        </h2>
        <p className="text-slate-500 text-sm mt-2 font-medium italic">Genera documentos oficiales y bases de datos conciliadas.</p>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <ReportCard 
          title="Libro Contable (XLSX)" 
          desc="Estructura completa para auditorías y filtros avanzados en Excel."
          icon={<FileSpreadsheet size={32} className="text-emerald-500" />}
          onExport={handleExcel}
          loading={loading === 'excel'}
          color="hover:border-emerald-200"
        />
        <ReportCard 
          title="Documento Oficial (PDF)" 
          desc="Reporte visual con membrete diseñado para juntas directivas."
          icon={<FileText size={32} className="text-rose-500" />}
          onExport={handlePDF}
          loading={loading === 'pdf'}
          color="hover:border-rose-200"
        />
        <ReportCard 
          title="Base Plana (CSV)" 
          desc="Formato ligero optimizado para migración a software contable."
          icon={<TableIcon size={32} className="text-slate-500" />}
          onExport={handleExcel}
          loading={loading === 'csv'}
          color="hover:border-slate-300"
        />
      </div>

      {/* BANNER DE CONCILIACIÓN */}
      <div className="bg-slate-900 rounded-[3.5rem] p-10 text-white relative overflow-hidden group shadow-2xl shadow-indigo-200/50">
        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
            <div className="w-24 h-24 bg-white/10 rounded-[2.2rem] flex items-center justify-center backdrop-blur-xl border border-white/10 shadow-2xl group-hover:scale-105 transition-transform duration-500">
                <ShieldCheck size={48} className="text-indigo-400" />
            </div>
            <div className="flex-1 text-center lg:text-left">
                <h4 className="text-2xl font-black italic uppercase tracking-tight">Conciliación de Seguridad</h4>
                <p className="text-slate-400 text-sm mt-2 max-w-xl leading-relaxed font-medium">
                    El sistema detecta discrepancias entre el monto pagado y la segmentación del usuario. Usa la "Auditoría" para exportar casos con alertas de pago insuficiente.
                </p>
            </div>
            <button 
                onClick={handleExcel}
                className="bg-white text-slate-900 font-black px-10 py-5 rounded-2xl hover:bg-indigo-50 active:scale-95 transition-all uppercase text-[10px] tracking-widest flex items-center gap-3 shadow-xl"
            >
                {loading === 'excel' ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} strokeWidth={3} />}
                Descargar Auditoría
            </button>
        </div>
      </div>
    </div>
  );
}

function ReportCard({ title, desc, icon, onExport, loading, color }: any) {
  return (
    <div className={`bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm transition-all duration-500 group flex flex-col h-full ${color}`}>
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
        {loading ? <Loader2 className="animate-spin" size={18}/> : <><Download size={18} strokeWidth={3}/> Descargar </>}
      </button>
    </div>
  );
}