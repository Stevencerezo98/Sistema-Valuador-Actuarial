import React, { useState, useMemo, useEffect } from 'react';
import { 
  EmpleadoProcesado, 
  ResumenMotor, 
  VariablesMacro, 
  DatosEmpresaEstudio, 
  RolUsuario 
} from '../types/actuarial';
import { generarFichaActuarialPDF } from '../services/pdfReportGenerator';
import { descargarPlantillaOficial } from '../services/actuarialEngine';
import { obtenerLoginBrandConfig } from '../services/loginBrandService';
import { ActuarialCharts } from './ActuarialCharts';
import { 
  Calendar, 
  Clock, 
  Search, 
  Upload, 
  FileText, 
  ArrowUpRight, 
  Download, 
  Lock, 
  FileSpreadsheet, 
  FileDown, 
  Info, 
  Building, 
  Palette,
  FolderArchive,
  Trash2,
  Table,
  LayoutGrid,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';

interface FinnovaActuaryDashboardProps {
  resultados: EmpleadoProcesado[];
  resumen: ResumenMotor;
  variables: VariablesMacro;
  empresa: DatosEmpresaEstudio;
  rolActual: RolUsuario;
  onOpenUpload: () => void;
  onOpenSaveStudy?: () => void;
  onOpenEmployeeDetail: (empleado: EmpleadoProcesado) => void;
  onExportExcel: () => void;
  onOpenLoginBrandConfig?: () => void;
  onOpenCompanyConfig?: () => void;
  onLimpiarDatos?: () => void;
  theme?: 'claro' | 'oscuro';
}

export const FinnovaActuaryDashboard: React.FC<FinnovaActuaryDashboardProps> = ({
  resultados,
  resumen,
  variables,
  empresa,
  rolActual,
  onOpenUpload,
  onOpenSaveStudy,
  onOpenEmployeeDetail,
  onExportExcel,
  onOpenLoginBrandConfig,
  onOpenCompanyConfig,
  onLimpiarDatos,
  theme = 'claro'
}) => {
  // Configuración de Marca y Dashboard
  const [brandConfig, setBrandConfig] = useState(() => obtenerLoginBrandConfig());

  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail) setBrandConfig(e.detail);
      else setBrandConfig(obtenerLoginBrandConfig());
    };
    window.addEventListener('login-brand-config-updated', handleUpdate);
    return () => window.removeEventListener('login-brand-config-updated', handleUpdate);
  }, []);

  // Estado local para búsqueda, filtros y modo de vista
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'elegibles' | 'desahucio'>('todos');
  const [selectedScenario, setSelectedScenario] = useState<'base' | 'sens_mas' | 'sens_menos'>('base');
  const [vistaModo, setVistaModo] = useState<'fichas' | 'tabla'>('fichas');
  
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(() => {
    return resultados.length > 0 ? resultados[0].id : '';
  });

  // Empleados filtrados
  const empleadosFiltrados = useMemo(() => {
    return resultados.filter(emp => {
      const matchSearch = 
        emp.Nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.Cedula.includes(searchTerm) ||
        (emp.Cargo && emp.Cargo.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchSearch) return false;

      if (filtroEstado === 'elegibles') {
        return emp.elegible_jubilacion;
      }
      if (filtroEstado === 'desahucio') {
        return !emp.elegible_jubilacion;
      }
      return true;
    });
  }, [resultados, searchTerm, filtroEstado]);

  // Empleado seleccionado para la ficha técnica
  const selectedEmployee = useMemo(() => {
    return resultados.find(e => e.id === selectedEmployeeId) || resultados[0] || null;
  }, [resultados, selectedEmployeeId]);

  const selectedIndex = useMemo(() => {
    if (!selectedEmployee) return 1;
    const idx = resultados.findIndex(e => e.id === selectedEmployee.id);
    return idx >= 0 ? idx + 1 : 1;
  }, [resultados, selectedEmployee]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val || 0);
  };

  const isDark = theme === 'oscuro';

  // Fotos de avatar ejecutivas
  const getAvatarUrl = (index: number) => {
    const avatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=140&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=140&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=140&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=140&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=140&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=140&auto=format&fit=crop'
    ];
    return avatars[index % avatars.length];
  };

  // Cálculo de escenarios de sensibilidad para Card 4
  const vpoBase = resumen.vpo_total || 0;
  const vpoSensMas = vpoBase * 0.912;
  const vpoSensMenos = vpoBase * 1.104;

  const vpoDisplay = selectedScenario === 'base' 
    ? vpoBase 
    : selectedScenario === 'sens_mas' 
    ? vpoSensMas 
    : vpoSensMenos;

  const tieneDatos = resultados.length > 0;

  return (
    <div className={`p-4 sm:p-7 rounded-[32px] transition-colors duration-200 space-y-6 shadow-xl border ${
      isDark 
        ? 'bg-[#0e101c] text-slate-100 border-slate-800/80 shadow-black/60' 
        : 'bg-[#f4f6fc] text-slate-800 border-slate-200/90 shadow-slate-200/50'
    }`}>
      
      {/* 1. ENCABEZADO EJECUTIVO UNIFICADO (Sin duplicidades de barra de navegación) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#5b52f9] to-[#7c3aed] flex items-center justify-center text-white shadow-lg shadow-[#5b52f9]/20 shrink-0">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                {brandConfig.tituloDashboard || empresa.nombre_empresa || 'Valuador Actuarial NIC 19'}
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                tieneDatos 
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300' 
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}>
                {tieneDatos ? `${resultados.length} Colaboradores` : 'Sin Nómina'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              RUC: <strong className="font-mono text-slate-700 dark:text-slate-300">{empresa.ruc || '1790000000001'}</strong> · {brandConfig.subtituloDashboard || 'Valuación bajo Código del Trabajo (Art. 185 y 216) y NIIF / IFRS'}
            </p>
          </div>
        </div>

        {/* Acciones principales de la cabecera */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {onOpenLoginBrandConfig && rolActual === 'admin' && (
            <button
              onClick={onOpenLoginBrandConfig}
              className="px-3.5 py-2 rounded-2xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
              title="Personalizar Imagen o Degradado de Fondo del Login (Admin)"
            >
              <Palette className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Fondo Login</span>
            </button>
          )}

          {onOpenCompanyConfig && (
            <button
              onClick={onOpenCompanyConfig}
              className="px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold shadow-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <Building className="w-3.5 h-3.5 text-slate-500" />
              <span>Empresa</span>
            </button>
          )}

          {tieneDatos && onExportExcel && (
            <button
              onClick={onExportExcel}
              className="px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-1.5"
              title="Exportar a Excel NIIF"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Excel NIIF</span>
            </button>
          )}

          {tieneDatos && onOpenSaveStudy && (
            <button
              onClick={onOpenSaveStudy}
              className="px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#5b52f9] hover:bg-purple-50 dark:hover:bg-purple-950/30 text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-1.5"
              title="Guardar Estudio para la Empresa"
            >
              <FolderArchive className="w-3.5 h-3.5 text-[#5b52f9]" />
              <span>Guardar</span>
            </button>
          )}

          <button
            onClick={onOpenUpload}
            className="px-4 py-2 rounded-2xl bg-[#5b52f9] hover:bg-[#4f46e5] text-white text-xs font-bold transition flex items-center gap-2 shadow-md shadow-[#5b52f9]/25 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{tieneDatos ? 'Cambiar Nómina' : 'Subir Nómina Excel'}</span>
          </button>

          {tieneDatos && onLimpiarDatos && (
            <button
              onClick={onLimpiarDatos}
              className="p-2 rounded-2xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
              title="Limpiar datos cargados"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. LAS 4 TARJETAS MÉTRICAS EJECUTIVAS (Estilo Finnova, sin datos falsos forzados) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* CARD 1: RESERVA DESAHUCIO (Art. 185) */}
        <div className={`p-5 rounded-3xl border transition-all flex flex-col justify-between shadow-xs ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/80'
        }`}>
          <div>
            <div className="flex items-start justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Reserva Desahucio (Art. 185)
              </span>
              <span className="px-2 py-0.5 rounded-full border border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 text-[10px] font-bold">
                25% Sueldo
              </span>
            </div>

            <div className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mt-2">
              {formatCurrency(resumen.vpo_desahucio_total)}
            </div>

            <div className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-1">
              {tieneDatos ? `${resumen.total_empleados} Colaboradores Evaluados` : 'Esperando carga de nómina'}
            </div>
          </div>

          <div className="mt-4 pt-1 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 h-20 w-full relative bg-slate-950/5 dark:bg-slate-800/40 flex items-center justify-center p-3 text-center">
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              VPO Desahucio = ∑ (0.25 · S · n · vᵗ · p)
            </span>
          </div>
        </div>

        {/* CARD 2: RESERVA JUBILACIÓN PATRONAL (Art. 216) */}
        <div className={`p-5 rounded-3xl border transition-all flex flex-col justify-between shadow-xs ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/80'
        }`}>
          <div>
            <div className="flex items-start justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Reserva Jubilación (Art. 216)
              </span>
              <span className="px-2 py-0.5 rounded-full border border-purple-300 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 text-[10px] font-bold">
                {resumen.empleados_elegibles} Elegibles
              </span>
            </div>

            <div className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mt-2">
              {formatCurrency(resumen.vpo_jubilacion_total)}
            </div>

            <div className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold mt-1">
              {tieneDatos ? `≥ 20 años de servicio en la empresa` : 'Umbral legal: 20 y 25 años'}
            </div>
          </div>

          {/* Gráfico de barras por tramos de servicio */}
          <div className="mt-4 pt-2">
            <div className="flex items-end justify-between gap-1.5 h-16">
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className={`w-full rounded-t-md transition-all ${tieneDatos ? 'bg-[#c7d2fe] dark:bg-indigo-950 h-4' : 'bg-slate-200 dark:bg-slate-800 h-2'}`}></div>
                <span className="text-[8px] text-slate-400 font-mono">&lt;5a</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className={`w-full rounded-t-md transition-all ${tieneDatos ? 'bg-[#c7d2fe] dark:bg-indigo-950 h-7' : 'bg-slate-200 dark:bg-slate-800 h-2'}`}></div>
                <span className="text-[8px] text-slate-400 font-mono">5-10</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className={`w-full rounded-t-md transition-all ${tieneDatos ? 'bg-[#818cf8] dark:bg-indigo-800 h-10' : 'bg-slate-200 dark:bg-slate-800 h-2'}`}></div>
                <span className="text-[8px] text-slate-400 font-mono">10-15</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className={`w-full rounded-t-md transition-all ${tieneDatos ? 'bg-[#6366f1] dark:bg-indigo-700 h-13' : 'bg-slate-200 dark:bg-slate-800 h-2'}`}></div>
                <span className="text-[8px] text-slate-400 font-mono">15-20</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className={`w-full rounded-t-md transition-all ${tieneDatos ? 'bg-[#4f46e5] dark:bg-indigo-600 h-16' : 'bg-slate-200 dark:bg-slate-800 h-2'}`}></div>
                <span className="text-[8px] text-slate-400 font-mono">20-25</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className={`w-full rounded-t-md transition-all ${tieneDatos ? 'bg-[#4338ca] dark:bg-indigo-500 h-14' : 'bg-slate-200 dark:bg-slate-800 h-2'}`}></div>
                <span className="text-[8px] text-slate-400 font-mono">&gt;25a</span>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 3: ANTIGÜEDAD PROMEDIO & RETIRO */}
        <div className={`p-5 rounded-3xl border transition-all flex flex-col justify-between shadow-xs ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/80'
        }`}>
          <div>
            <div className="flex items-start justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Antigüedad Media Nómina
              </span>
              <span className="w-6 h-6 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 flex items-center justify-center">
                <Clock className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mt-2">
              {resumen.antiguedad_promedio ? `${resumen.antiguedad_promedio.toFixed(1)} Años` : '0.0 Años'}
            </div>

            <div className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold mt-1">
              {tieneDatos ? `Edad media: ${resumen.edad_promedio.toFixed(1)} años · Retiro: 65a` : 'Edad legal de jubilación: 65 años'}
            </div>
          </div>

          <div className="mt-4 pt-2">
            <svg viewBox="0 0 160 45" className="w-full h-14 overflow-visible">
              <path
                d="M 5 40 Q 35 36 60 25 T 115 15 T 155 6"
                fill="none"
                stroke={tieneDatos ? "#5b52f9" : "#cbd5e1"}
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="5" cy="40" r="3" fill={tieneDatos ? "#5b52f9" : "#cbd5e1"} />
              <circle cx="60" cy="25" r="3" fill={tieneDatos ? "#5b52f9" : "#cbd5e1"} />
              <circle cx="115" cy="15" r="3" fill={tieneDatos ? "#5b52f9" : "#cbd5e1"} />
              <circle cx="155" cy="6" r="3" fill={tieneDatos ? "#5b52f9" : "#cbd5e1"} />
            </svg>
            <div className="flex justify-between text-[8px] text-slate-400 font-mono mt-0.5">
              <span>Supervivencia Makeham-Gompertz (IESS)</span>
            </div>
          </div>
        </div>

        {/* CARD 4: PASIVO TOTAL DBO NIIF CON SELECTOR DE SENSIBILIDAD */}
        <div className={`p-5 rounded-3xl border transition-all flex flex-col justify-between shadow-xs ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/80'
        }`}>
          <div>
            <div className="flex items-start justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Pasivo Total Consolidado (DBO)
              </span>
              <div className="flex items-center gap-1 text-emerald-600">
                <span className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
                  <Lock className="w-3.5 h-3.5" />
                </span>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mt-2">
              {formatCurrency(vpoDisplay)}
            </div>

            <div className="text-[11px] text-slate-400 font-semibold mt-1">
              {selectedScenario === 'base' && `Tasa Base i = ${(variables.tasa_descuento * 100).toFixed(2)}%`}
              {selectedScenario === 'sens_mas' && `Tasa +100 pb i = ${((variables.tasa_descuento + 0.01) * 100).toFixed(2)}%`}
              {selectedScenario === 'sens_menos' && `Tasa -100 pb i = ${((variables.tasa_descuento - 0.01) * 100).toFixed(2)}%`}
            </div>
          </div>

          <div className="mt-4 pt-1 flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1 text-[10px]">
              <div 
                onClick={() => setSelectedScenario('base')}
                className={`px-2 py-1 rounded-lg border transition cursor-pointer text-center ${
                  selectedScenario === 'base'
                    ? 'bg-[#5b52f9] text-white font-bold border-transparent shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                }`}
              >
                <span>Base</span>
              </div>

              <div 
                onClick={() => setSelectedScenario('sens_mas')}
                className={`px-2 py-1 rounded-lg border transition cursor-pointer text-center ${
                  selectedScenario === 'sens_mas'
                    ? 'bg-[#5b52f9] text-white font-bold border-transparent shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                }`}
              >
                <span>+100 pb</span>
              </div>

              <div 
                onClick={() => setSelectedScenario('sens_menos')}
                className={`px-2 py-1 rounded-lg border transition cursor-pointer text-center ${
                  selectedScenario === 'sens_menos'
                    ? 'bg-[#5b52f9] text-white font-bold border-transparent shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                }`}
              >
                <span>-100 pb</span>
              </div>
            </div>

            <span className="text-[10px] text-slate-400 font-mono">
              NIC 19 § 145
            </span>
          </div>
        </div>

      </div>

      {/* 3. CONTENIDO PRINCIPAL: DROPZONE SI ESTÁ VACÍO / FICHAS O TABLA SI HAY DATOS */}
      {!tieneDatos ? (
        /* ÁREA LIMPIA DE CARGA (Sin datos de prueba, unificada y elegante) */
        <div className="p-8 sm:p-12 rounded-[28px] bg-white dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-800 text-center space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center shadow-inner">
            <FileSpreadsheet className="w-8 h-8" />
          </div>

          <div className="max-w-md mx-auto space-y-1.5">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Cargue la Nómina de la Empresa para Iniciar
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              No hay colaboradores registrados actualmente. Suba el archivo Excel oficial (.xlsx) de la empresa para calcular las provisiones de Jubilación Patronal y Desahucio.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={onOpenUpload}
              className="px-5 py-2.5 rounded-xl bg-[#5b52f9] hover:bg-[#4f46e5] text-white font-bold text-xs shadow-md shadow-[#5b52f9]/20 transition cursor-pointer flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>Subir Archivo Excel</span>
            </button>

            <button
              onClick={descargarPlantillaOficial}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition cursor-pointer flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Descargar Plantilla Oficial</span>
            </button>
          </div>
        </div>
      ) : (
        /* ÁREA DE VALUACIÓN ACTUARIAL (Cuando hay nómina cargada) */
        <div className="space-y-6">
          
          {/* Barra de herramientas y selector de vista */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Filtro estado */}
              <div className="flex items-center bg-white dark:bg-slate-800 rounded-full p-1 border border-slate-200 dark:border-slate-700 shadow-xs">
                <button
                  onClick={() => setFiltroEstado('todos')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                    filtroEstado === 'todos' ? 'bg-[#5b52f9] text-white' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Todos ({resultados.length})
                </button>
                <button
                  onClick={() => setFiltroEstado('elegibles')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                    filtroEstado === 'elegibles' ? 'bg-[#5b52f9] text-white' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Elegibles Jubilación ({resumen.empleados_elegibles})
                </button>
                <button
                  onClick={() => setFiltroEstado('desahucio')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                    filtroEstado === 'desahucio' ? 'bg-[#5b52f9] text-white' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  En Acumulación ({resultados.length - resumen.empleados_elegibles})
                </button>
              </div>

              {/* Selector de modo de vista (Fichas vs Tabla) para evitar duplicar componentes */}
              <div className="flex items-center bg-white dark:bg-slate-800 rounded-full p-1 border border-slate-200 dark:border-slate-700 shadow-xs">
                <button
                  onClick={() => setVistaModo('fichas')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    vistaModo === 'fichas' ? 'bg-[#5b52f9] text-white' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Fichas Individuales</span>
                </button>
                <button
                  onClick={() => setVistaModo('tabla')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    vistaModo === 'tabla' ? 'bg-[#5b52f9] text-white' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Table className="w-3.5 h-3.5" />
                  <span>Planilla Tabular</span>
                </button>
              </div>
            </div>

            {/* Buscador */}
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Buscar por colaborador o cédula..."
                className="w-full pl-4 pr-9 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white shadow-xs outline-none focus:ring-2 focus:ring-[#5b52f9]"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* VISTA 1: FICHAS INDIVIDUALES (Split Card Estilo Finnova) */}
          {vistaModo === 'fichas' && (
            <div className="bg-[#181928] text-white rounded-[32px] p-6 sm:p-7 shadow-2xl border border-white/5">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Columna Izquierda: Listado de Colaboradores */}
                <div className="lg:col-span-5 space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                  {empleadosFiltrados.map((emp, idx) => {
                    const isSelected = emp.id === selectedEmployee?.id;

                    return (
                      <div
                        key={emp.id}
                        onClick={() => setSelectedEmployeeId(emp.id)}
                        className={`p-3.5 rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-3 border ${
                          isSelected
                            ? 'bg-[#5b52f9] text-white border-transparent shadow-xl font-medium'
                            : 'bg-[#202133] hover:bg-[#28293d] border-transparent text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img 
                            src={getAvatarUrl(idx)} 
                            alt={emp.Nombre} 
                            className="w-10 h-10 rounded-full object-cover shrink-0 border border-white/20"
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-bold truncate flex items-center gap-1.5">
                              <span>{emp.Nombre}</span>
                              {emp.elegible_jubilacion && (
                                <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
                                  isSelected ? 'bg-white/20 text-white' : 'bg-purple-900/60 text-purple-300 border border-purple-700/50'
                                }`}>
                                  Jubilable
                                </span>
                              )}
                            </div>
                            <div className={`text-[11px] truncate ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                              C.I. {emp.Cedula} · {emp.Cargo || 'Colaborador'}
                            </div>
                            <div className={`text-[10px] ${isSelected ? 'text-white/70' : 'text-slate-500'}`}>
                              {emp.Antiguedad} años serv. · Edad: {emp.Edad}a
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-xs font-black">
                            {formatCurrency(emp.VPO_Total)}
                          </div>
                          <div className={`text-[9px] font-bold ${
                            isSelected ? 'text-white/90' : emp.elegible_jubilacion ? 'text-purple-400' : 'text-blue-400'
                          }`}>
                            {emp.elegible_jubilacion ? 'Jub. + Desahucio' : 'Solo Desahucio'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Columna Derecha: Expediente Actuarial Individual */}
                <div className="lg:col-span-7 bg-[#202133] rounded-3xl p-6 sm:p-7 flex flex-col justify-between border border-white/5">
                  {selectedEmployee && (
                    <div className="space-y-5">
                      {/* Cabecera del colaborador */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                        <div className="flex items-center gap-3.5">
                          <img 
                            src={getAvatarUrl(selectedIndex - 1)} 
                            alt={selectedEmployee.Nombre} 
                            className="w-13 h-13 rounded-2xl object-cover border-2 border-[#5b52f9] shadow-md shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-black text-white">
                                {selectedEmployee.Nombre}
                              </h3>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                selectedEmployee.elegible_jubilacion 
                                  ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40' 
                                  : 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                              }`}>
                                {selectedEmployee.elegible_jubilacion ? 'Elegible Art. 216' : 'Acumulando Años'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">
                              C.I. {selectedEmployee.Cedula} · {selectedEmployee.Cargo || 'General'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <button
                            onClick={() => generarFichaActuarialPDF(selectedEmployee, variables)}
                            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border border-white/10"
                            title="Descargar Ficha en PDF"
                          >
                            <FileDown className="w-3.5 h-3.5 text-rose-400" />
                            <span>PDF</span>
                          </button>
                          <button
                            onClick={() => onOpenEmployeeDetail(selectedEmployee)}
                            className="px-3 py-1.5 rounded-xl bg-[#5b52f9] hover:bg-[#4f46e5] text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <Info className="w-3.5 h-3.5" />
                            <span>Detalle</span>
                          </button>
                        </div>
                      </div>

                      {/* Cuatro parámetros demográficos */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        <div className="p-3 rounded-2xl bg-[#181928] border border-white/5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sueldo</span>
                          <span className="text-sm font-black text-white mt-0.5 block">{formatCurrency(selectedEmployee.Sueldo_Actual)}</span>
                        </div>
                        <div className="p-3 rounded-2xl bg-[#181928] border border-white/5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Antigüedad</span>
                          <span className="text-sm font-black text-white mt-0.5 block">{selectedEmployee.Antiguedad} Años</span>
                        </div>
                        <div className="p-3 rounded-2xl bg-[#181928] border border-white/5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Edad</span>
                          <span className="text-sm font-black text-white mt-0.5 block">{selectedEmployee.Edad} Años</span>
                        </div>
                        <div className="p-3 rounded-2xl bg-[#181928] border border-white/5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Horizonte</span>
                          <span className="text-sm font-black text-[#818cf8] mt-0.5 block">{Math.max(0, 65 - selectedEmployee.Edad)} Años</span>
                        </div>
                      </div>

                      {/* Desglose de Provisiones */}
                      <div className="p-4 rounded-2xl bg-[#181928] border border-white/5 space-y-2.5 text-xs">
                        <div className="flex items-center justify-between pb-2 border-b border-white/5">
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                              <span>Reserva Desahucio (Art. 185)</span>
                            </div>
                            <span className="text-[10px] text-slate-400">25% último sueldo por año de servicio</span>
                          </div>
                          <span className="font-mono font-bold text-blue-300">{formatCurrency(selectedEmployee.VPO_Desahucio)}</span>
                        </div>

                        <div className="flex items-center justify-between pb-2 border-b border-white/5">
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                              <span>Reserva Jubilación Patronal (Art. 216)</span>
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {selectedEmployee.elegible_jubilacion 
                                ? `Pensión est.: $${selectedEmployee.pension_mensual.toFixed(2)}/mes · Renta a_x: ${selectedEmployee.coeficiente_tabla.toFixed(4)}`
                                : 'No computa (menos de 20 años de servicio)'}
                            </span>
                          </div>
                          <span className="font-mono font-bold text-purple-300">{formatCurrency(selectedEmployee.VPO_Jubilacion)}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                              <span>Costo Servicio Corriente (CSC)</span>
                            </div>
                            <span className="text-[10px] text-slate-400">Devengamiento anual 2026</span>
                          </div>
                          <span className="font-mono font-bold text-emerald-300">{formatCurrency(selectedEmployee.csc_total)}</span>
                        </div>
                      </div>

                      {/* Total Pasivo Individual */}
                      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#5b52f9]/20 to-[#7c3aed]/20 border border-[#5b52f9]/40 flex items-center justify-between">
                        <span className="text-xs font-bold text-[#818cf8]">Total Pasivo Actuarial Individual (DBO):</span>
                        <span className="text-lg font-black text-white font-mono">{formatCurrency(selectedEmployee.VPO_Total)}</span>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* VISTA 2: PLANILLA TABULAR (Para ver la tabla completa sin duplicidades) */}
          {vistaModo === 'tabla' && (
            <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-4 py-3 font-bold">Cédula</th>
                      <th className="px-4 py-3 font-bold">Colaborador</th>
                      <th className="px-4 py-3 font-bold text-center">Edad</th>
                      <th className="px-4 py-3 font-bold text-center">Antigüedad</th>
                      <th className="px-4 py-3 font-bold text-right">Sueldo</th>
                      <th className="px-4 py-3 font-bold text-right">VPO Desahucio</th>
                      <th className="px-4 py-3 font-bold text-right">VPO Jubilación</th>
                      <th className="px-4 py-3 font-bold text-right">Pasivo Total DBO</th>
                      <th className="px-4 py-3 font-bold text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {empleadosFiltrados.map((emp) => (
                      <tr key={emp.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition">
                        <td className="px-4 py-3 font-mono">{emp.Cedula}</td>
                        <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{emp.Nombre}</td>
                        <td className="px-4 py-3 text-center">{emp.Edad}a</td>
                        <td className="px-4 py-3 text-center">{emp.Antiguedad}a</td>
                        <td className="px-4 py-3 text-right font-mono">{formatCurrency(emp.Sueldo_Actual)}</td>
                        <td className="px-4 py-3 text-right font-mono text-blue-600 dark:text-blue-400">{formatCurrency(emp.VPO_Desahucio)}</td>
                        <td className="px-4 py-3 text-right font-mono text-purple-600 dark:text-purple-400">{formatCurrency(emp.VPO_Jubilacion)}</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-white">{formatCurrency(emp.VPO_Total)}</td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => onOpenEmployeeDetail(emp)}
                              className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition cursor-pointer"
                              title="Ver detalle actuarial"
                            >
                              <Info className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => generarFichaActuarialPDF(emp, variables)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                              title="Descargar Ficha PDF"
                            >
                              <FileDown className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Curvas Actuariales Recharts */}
          <div className="p-6 rounded-[28px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Curvas Actuariales y Distribución Demográfica NIIF
                </h3>
                <p className="text-xs text-slate-400">
                  Visualización de pirámide demográfica, dispersión salarial y acumulación DBO
                </p>
              </div>
              <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1 rounded-full">
                NIC 19 · Makeham-Gompertz
              </span>
            </div>
            <ActuarialCharts resultados={resultados} variables={variables} />
          </div>

        </div>
      )}

    </div>
  );
};
