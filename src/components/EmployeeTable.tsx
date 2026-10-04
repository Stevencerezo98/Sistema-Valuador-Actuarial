import React, { useState, useMemo } from 'react';
import { EmpleadoProcesado, VariablesMacro, ResumenMotor, ItemSensibilidad } from '../types/actuarial';
import { 
  Search, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  Upload, 
  Download, 
  Trash2, 
  FileSpreadsheet, 
  AlertTriangle, 
  FileDown, 
  FileText
} from 'lucide-react';
import { exportarResultadosAExcel } from '../services/actuarialEngine';
import { generarFichaActuarialPDF } from '../services/pdfReportGenerator';

interface EmployeeTableProps {
  resultados: EmpleadoProcesado[];
  resumen: ResumenMotor;
  variables: VariablesMacro;
  sensibilidad?: ItemSensibilidad[];
  onSelectEmployee: (emp: EmpleadoProcesado) => void;
  onOpenUpload: () => void;
  onClearData: () => void;
}

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
  resultados,
  resumen,
  variables,
  sensibilidad,
  onSelectEmployee,
  onOpenUpload,
  onClearData
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'eligible' | 'not_eligible' | 'capped'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filteredData = useMemo(() => {
    return resultados.filter(emp => {
      const term = searchTerm.toLowerCase();
      const matchSearch = 
        emp.Nombre.toLowerCase().includes(term) || 
        emp.Cedula.includes(term) ||
        (emp.Cargo && emp.Cargo.toLowerCase().includes(term));

      if (!matchSearch) return false;

      if (filterType === 'eligible') return emp.elegible_jubilacion;
      if (filterType === 'not_eligible') return !emp.elegible_jubilacion;
      if (filterType === 'capped') return emp.tope_aplicado !== 'NINGUNO';

      return true;
    });
  }, [resultados, searchTerm, filterType]);

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredData.length && filteredData.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredData.map(e => e.id)));
    }
  };

  const toggleSelectOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleDownloadSelectedPDFs = () => {
    const seleccionados = resultados.filter(e => selectedIds.has(e.id));
    if (seleccionados.length === 0) return;
    
    // Descarga el primero y notifica
    generarFichaActuarialPDF(seleccionados[0], variables);
    if (seleccionados.length > 1) {
      alert(`Se ha descargado la ficha del primer colaborador (${seleccionados[0].Nombre}). Para generar el informe consolidado completo de todos los colaboradores, use el botón "Estudio PDF" en la barra superior.`);
    }
  };

  const fmt = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(val);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
      
      {/* Modern Card Header with Search and Filters */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white">
        
        {/* Left: Title & Counters */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
            {resultados.length}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Nómina Individual & Provisiones Actuariales
            </h3>
            <p className="text-[11px] text-slate-500">
              Evaluación individual conforme a normas ecuatorianas vigentes.
            </p>
          </div>
        </div>

        {/* Right: Controls & Filters */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Search box */}
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar colaborador..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-slate-400"
            />
          </div>

          {/* Filter Segmented Control */}
          <div className="inline-flex rounded-xl p-1 bg-slate-100 text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                filterType === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterType('eligible')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                filterType === 'eligible' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Elegibles ({resultados.filter(r => r.elegible_jubilacion).length})
            </button>
            <button
              onClick={() => setFilterType('capped')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                filterType === 'capped' ? 'bg-white text-amber-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Topes SBU
            </button>
          </div>

          {selectedIds.size > 0 && (
            <button
              onClick={handleDownloadSelectedPDFs}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1 cursor-pointer transition animate-in fade-in"
              title="Descargar Ficha Actuarial en PDF de los seleccionados"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Ficha ({selectedIds.size})</span>
            </button>
          )}

          <button
            onClick={() => exportarResultadosAExcel(resultados, resumen, variables, sensibilidad)}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1 cursor-pointer transition"
            title="Exportar archivo Excel con 3 hojas contables NIIF"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Excel</span>
          </button>
        </div>
      </div>

      {/* Modern Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50/80 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200/80">
            <tr>
              <th className="py-3 px-3 text-center w-8">
                <input
                  type="checkbox"
                  checked={filteredData.length > 0 && selectedIds.size === filteredData.length}
                  onChange={toggleSelectAll}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  title="Seleccionar todos"
                />
              </th>
              <th className="py-3 px-3">Colaborador / Cédula</th>
              <th className="py-3 px-2 text-center">Gen</th>
              <th className="py-3 px-2 text-center">Edad / Antig.</th>
              <th className="py-3 px-2 text-center">Años Falt.</th>
              <th className="py-3 px-2 text-center">Antig. Retiro</th>
              <th className="py-3 px-3 text-right">Sueldo Actual</th>
              <th className="py-3 px-3 text-right">Sueldo Proy.</th>
              <th className="py-3 px-3 text-right text-blue-900 font-bold bg-blue-50/40">
                VPO Desahucio
              </th>
              <th className="py-3 px-2 text-center">Jubilación (≥25a)</th>
              <th className="py-3 px-3 text-right">Pensión Acotada</th>
              <th className="py-3 px-3 text-right text-purple-900 font-bold bg-purple-50/30">
                VPO Jubilación
              </th>
              <th className="py-3 px-3 text-right text-slate-900 font-bold bg-emerald-50/40">
                VPO Total (DBO)
              </th>
              <th className="py-3 px-3 text-center whitespace-nowrap">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800 font-mono text-[11px]">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={14} className="py-12 text-center text-slate-400 font-sans text-xs">
                  No se encontraron colaboradores que coincidan con la búsqueda.
                </td>
              </tr>
            ) : (
              filteredData.map((emp) => (
                <tr 
                  key={emp.id} 
                  className={`hover:bg-slate-50/80 transition-colors ${
                    selectedIds.has(emp.id) ? 'bg-blue-50/50' : ''
                  }`}
                >
                  
                  {/* Checkbox Selector */}
                  <td className="py-2.5 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(emp.id)}
                      onChange={() => toggleSelectOne(emp.id)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </td>

                  {/* Cédula y Nombre */}
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-slate-900 font-sans flex items-center gap-1.5">
                      {emp.Nombre}
                      {emp.warnings && emp.warnings.length > 0 && (
                        <span title={emp.warnings.join(' | ')} className="text-amber-500 cursor-help">
                          <AlertTriangle className="w-3.5 h-3.5 inline" />
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400">{emp.Cedula}</div>
                  </td>

                  {/* Género */}
                  <td className="py-2.5 px-2 text-center">
                    <span className={`text-[10px] font-semibold ${
                      emp.Genero === 'F' ? 'text-pink-600' : 'text-blue-600'
                    }`}>
                      {emp.Genero}
                    </span>
                  </td>

                  {/* Edad / Antigüedad */}
                  <td className="py-2.5 px-2 text-center whitespace-nowrap">
                    <span className="font-medium text-slate-800">{emp.Edad}a</span>
                    <span className="text-slate-300 mx-1">/</span>
                    <span className="text-slate-500">{emp.Antiguedad}a</span>
                  </td>

                  {/* Años Faltantes */}
                  <td className="py-2.5 px-2 text-center text-slate-500">
                    {emp.anios_faltantes}
                  </td>

                  {/* Antigüedad al Retiro */}
                  <td className="py-2.5 px-2 text-center">
                    <span className={`font-semibold ${
                      emp.antiguedad_al_retiro >= 25 ? 'text-emerald-700' : 'text-slate-400'
                    }`}>
                      {emp.antiguedad_al_retiro}a
                    </span>
                  </td>

                  {/* Sueldo Actual */}
                  <td className="py-2.5 px-3 text-right text-slate-900">
                    {fmt(emp.Sueldo_Actual)}
                  </td>

                  {/* Sueldo Proyectado */}
                  <td className="py-2.5 px-3 text-right text-slate-500">
                    {fmt(emp.sueldo_proyectado)}
                  </td>

                  {/* VPO Desahucio */}
                  <td className="py-2.5 px-3 text-right text-blue-700 font-semibold bg-blue-50/30">
                    {fmt(emp.VPO_Desahucio)}
                  </td>

                  {/* Elegibilidad Jubilación */}
                  <td className="py-2.5 px-2 text-center">
                    {emp.elegible_jubilacion ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 font-sans">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        SÍ ({emp.antiguedad_al_retiro}a)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 font-sans">
                        NO
                      </span>
                    )}
                  </td>

                  {/* Pensión Mensual Acotada */}
                  <td className="py-2.5 px-3 text-right">
                    {emp.elegible_jubilacion ? (
                      <div>
                        <span className="text-purple-900 font-semibold">{fmt(emp.pension_mensual)}</span>
                        {emp.tope_aplicado !== 'NINGUNO' && (
                          <span className="block text-[9px] font-sans font-medium text-amber-600">
                            {emp.tope_aplicado === 'MINIMO_0.5_SBU' ? 'Tope 0.5 SBU' : 'Tope 1.0 SBU'}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>

                  {/* VPO Jubilación */}
                  <td className="py-2.5 px-3 text-right text-purple-900 font-semibold bg-purple-50/20">
                    {emp.elegible_jubilacion ? fmt(emp.VPO_Jubilacion) : <span className="text-slate-300">$0.00</span>}
                  </td>

                  {/* VPO Total */}
                  <td className="py-2.5 px-3 text-right text-slate-900 font-bold bg-emerald-50/30">
                    {fmt(emp.VPO_Total)}
                  </td>

                  {/* Acciones */}
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onSelectEmployee(emp)}
                        className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                        title="Ver detalle actuarial"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          generarFichaActuarialPDF(emp, variables);
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Descargar Ficha en PDF"
                      >
                        <FileDown className="w-4 h-4" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Card Footer */}
      <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <div>
          Mostrando <strong className="text-slate-900">{filteredData.length}</strong> de <strong className="text-slate-900">{resultados.length}</strong> colaboradores evaluados
        </div>
        <div className="flex items-center gap-4 text-[11px] text-slate-500">
          <span>Tasa i: <strong className="text-slate-700">{(variables.tasa_descuento * 100).toFixed(1)}%</strong></span>
          <span>Salario s: <strong className="text-slate-700">{(variables.tasa_incremento_sal * 100).toFixed(1)}%</strong></span>
          <span>Rotación r: <strong className="text-slate-700">{(variables.tasa_rotacion * 100).toFixed(1)}%</strong></span>
          <span>SBU: <strong className="text-slate-700">${variables.sbu_vigente}</strong></span>
        </div>
      </div>

    </div>
  );
};
