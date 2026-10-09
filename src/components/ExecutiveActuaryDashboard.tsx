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
  Layers,
  Award,
  Sparkles,
  UserCheck,
  ChevronRight,
  ShieldCheck,
  ArrowLeft,
  Sliders,
  Scale
} from 'lucide-react';

export interface ExecutiveActuaryDashboardProps {
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
  onOpenVariables?: () => void;
  onLimpiarDatos?: () => void;
  onCargarCensoEjemplo?: () => void;
  onNavigateTab?: (tab: string) => void;
  theme?: 'claro' | 'oscuro';
}

export const ExecutiveActuaryDashboard: React.FC<ExecutiveActuaryDashboardProps> = ({
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
  onOpenVariables,
  onLimpiarDatos,
  onCargarCensoEjemplo,
  onNavigateTab,
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

  // Sincronizar selección si cambia la lista
  useEffect(() => {
    if (resultados.length > 0 && (!selectedEmployeeId || !resultados.some(e => e.id === selectedEmployeeId))) {
      setSelectedEmployeeId(resultados[0].id);
    }
  }, [resultados, selectedEmployeeId]);

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
      
      {/* ENCABEZADO DE VALUACIÓN ACTUARIAL DIRECTO Y LIMPIO (Sin barras redundantes ni textos de prueba) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base font-black tracking-tight text-slate-900 dark:text-white uppercase">
              {brandConfig.tituloDashboard || 'Valuación Actuarial de Nómina'}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300">
              {tieneDatos ? `${resultados.length} Colaboradores` : 'Censo no cargado'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Valuación Actuarial de Provisiones NIC 19 · Jubilación Patronal (Art. 216) y Desahucio (Art. 185) en Ecuador.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {onOpenLoginBrandConfig && rolActual === 'admin' && (
            <button
              onClick={onOpenLoginBrandConfig}
              className="px-3.5 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
              title="Personalizar Fondo y Colores del Login (Super Admin)"
            >
              <Palette className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Diseño Login</span>
            </button>
          )}

          {onOpenCompanyConfig && (
            <button
              onClick={onOpenCompanyConfig}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 text-xs font-semibold shadow-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <Building className="w-3.5 h-3.5 text-slate-500" />
              <span>Empresa</span>
            </button>
          )}

          {onOpenVariables && (
            <button
              onClick={onOpenVariables}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 text-xs font-semibold shadow-xs transition cursor-pointer flex items-center gap-1.5"
              title="Ajustar tasas de descuento, rotación o conciliar con un estudio previo"
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Hipótesis & Conciliación</span>
            </button>
          )}

          <button
            onClick={descargarPlantillaOficial}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            title="Descargar plantilla oficial Excel para carga de nómina"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>Plantilla Excel</span>
          </button>

          {tieneDatos && (
            <button
              onClick={onExportExcel}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-1.5"
              title="Exportar Planilla a Excel"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Excel NIIF</span>
            </button>
          )}

          <button
            onClick={onOpenUpload}
            className="px-5 py-2 rounded-xl bg-[#5b52f9] hover:bg-[#4f46e5] text-white text-xs font-bold transition flex items-center gap-2 shadow-md shadow-[#5b52f9]/25 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>{tieneDatos ? 'Cargar Nueva Nómina' : '+ Subir Nómina Excel'}</span>
          </button>

          {tieneDatos && onLimpiarDatos && (
            <button
              onClick={onLimpiarDatos}
              className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
              title="Limpiar datos de nómina"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* AVISO DE CARGA DE NÓMINA (Sólo si aún no se ha subido archivo) */}
      {!tieneDatos && (
        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-blue-900 dark:text-blue-200">
          <div className="flex items-center gap-2.5">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>
              <strong>Nómina lista para el estudio:</strong> Suba el archivo Excel de nómina institucional de su empresa o descargue la <strong>Plantilla Excel</strong> con las columnas oficiales (Cédula, Nombre, Género, Edad, Antigüedad, Salario, Cargo).
            </span>
          </div>
          <button
            onClick={onOpenUpload}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shrink-0 transition cursor-pointer flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Subir Archivo Excel</span>
          </button>
        </div>
      )}

      {/* 3. LAS 4 TARJETAS MÉTRICAS EJECUTIVAS (Estilo idéntico a la imagen, pero con datos actuariales NIC 19) */}
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
              <span className="w-5 h-5 rounded-full border border-rose-300 text-rose-500 text-[10px] font-bold flex items-center justify-center">
                !
              </span>
            </div>

            <div className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mt-2">
              {formatCurrency(resumen.vpo_desahucio_total)}
            </div>

            <div className="text-[11px] text-rose-500 font-semibold mt-1 flex items-center gap-1">
              <span>25% Último Sueldo</span>
              <span className="text-slate-400">· Art. 185 Cod. Trabajo</span>
            </div>
          </div>

          {/* Gráfico sutil de distribución o fórmula */}
          <div className="mt-4 pt-2 flex items-center gap-3">
            <div className="w-16 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 shrink-0 font-mono text-xs font-bold">
              0.25 · S
            </div>
            <div className="text-[11px] text-slate-400 leading-tight">
              <span className="font-bold text-slate-700 dark:text-slate-300 block">Bonificación Legal</span>
              {tieneDatos ? `${resumen.total_empleados} colaboradores evaluados` : 'Esperando nómina'}
            </div>
          </div>
        </div>

        {/* CARD 2: RESERVA JUBILACIÓN PATRONAL (Art. 216 con gráfico de barras mensual/tramos) */}
        <div className={`p-5 rounded-3xl border transition-all flex flex-col justify-between shadow-xs ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/80'
        }`}>
          <div>
            <div className="flex items-start justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Reserva Jubilación (Art. 216)
              </span>
              <span className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
                <Calendar className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mt-2">
              {formatCurrency(resumen.vpo_jubilacion_total)}
            </div>

            <div className="text-[11px] text-blue-600 font-semibold mt-1 flex items-center gap-1">
              <span>{resumen.empleados_elegibles} Elegibles</span>
              <span className="text-slate-400">≥ 25 años de servicio</span>
            </div>
          </div>

          {/* Gráfico de barras minimalista (idéntico al de la imagen de referencia) */}
          <div className="mt-4 pt-2">
            <div className="flex items-end justify-between gap-1.5 h-12">
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className={`w-full rounded-t-md transition-all ${tieneDatos ? 'bg-[#c7d2fe] dark:bg-blue-950 h-4' : 'bg-slate-200 dark:bg-slate-800 h-2'}`}></div>
                <span className="text-[8px] text-slate-400 font-mono">&lt;5a</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className={`w-full rounded-t-md transition-all ${tieneDatos ? 'bg-[#c7d2fe] dark:bg-blue-950 h-6' : 'bg-slate-200 dark:bg-slate-800 h-2'}`}></div>
                <span className="text-[8px] text-slate-400 font-mono">10a</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className={`w-full rounded-t-md transition-all ${tieneDatos ? 'bg-[#818cf8] dark:bg-blue-800 h-8' : 'bg-slate-200 dark:bg-slate-800 h-2'}`}></div>
                <span className="text-[8px] text-slate-400 font-mono">15a</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className={`w-full rounded-t-md transition-all ${tieneDatos ? 'bg-[#6366f1] dark:bg-blue-700 h-12' : 'bg-slate-200 dark:bg-slate-800 h-2'}`}></div>
                <span className="text-[8px] text-slate-400 font-mono">20a</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className={`w-full rounded-t-md transition-all ${tieneDatos ? 'bg-[#4f46e5] dark:bg-blue-600 h-9' : 'bg-slate-200 dark:bg-slate-800 h-2'}`}></div>
                <span className="text-[8px] text-slate-400 font-mono">25a</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className={`w-full rounded-t-md transition-all ${tieneDatos ? 'bg-[#4338ca] dark:bg-blue-500 h-11' : 'bg-slate-200 dark:bg-slate-800 h-2'}`}></div>
                <span className="text-[8px] text-slate-400 font-mono">&gt;25a</span>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 3: ANTIGÜEDAD Y DEMOGRAFÍA DE NÓMINA (Curva con puntos idéntica a la imagen) */}
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
              {resumen.antiguedad_promedio ? `${resumen.antiguedad_promedio.toFixed(1)} años` : '0.0 años'}
            </div>

            <div className="text-[11px] text-teal-600 font-semibold mt-1 flex items-center gap-1">
              <span>Edad Media: {resumen.edad_promedio ? `${resumen.edad_promedio.toFixed(1)} años` : '0.0a'}</span>
              <span className="text-slate-400">· Retiro: 65a</span>
            </div>
          </div>

          {/* Curva actuarial con puntos */}
          <div className="mt-4 pt-2">
            <svg viewBox="0 0 160 40" className="w-full h-11 overflow-visible">
              <path
                d="M 5 35 Q 35 32 60 22 T 115 15 T 155 8"
                fill="none"
                stroke={tieneDatos ? "#6366f1" : "#cbd5e1"}
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="5" cy="35" r="3.5" fill={tieneDatos ? "#6366f1" : "#cbd5e1"} stroke="white" strokeWidth="1.5" />
              <circle cx="45" cy="28" r="3.5" fill={tieneDatos ? "#6366f1" : "#cbd5e1"} stroke="white" strokeWidth="1.5" />
              <circle cx="85" cy="18" r="3.5" fill={tieneDatos ? "#6366f1" : "#cbd5e1"} stroke="white" strokeWidth="1.5" />
              <circle cx="120" cy="14" r="3.5" fill={tieneDatos ? "#6366f1" : "#cbd5e1"} stroke="white" strokeWidth="1.5" />
              <circle cx="155" cy="8" r="3.5" fill={tieneDatos ? "#6366f1" : "#cbd5e1"} stroke="white" strokeWidth="1.5" />
            </svg>
          </div>
        </div>

        {/* CARD 4: PASIVO TOTAL CONSOLIDADO DBO (Selector de Sensibilidad y Detalle) */}
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
              {selectedScenario === 'base' && `Tasa de descuento: ${(variables.tasa_descuento * 100).toFixed(2)}%`}
              {selectedScenario === 'sens_mas' && `Escenario Tasa +100 pb`}
              {selectedScenario === 'sens_menos' && `Escenario Tasa -100 pb`}
            </div>
          </div>

          {/* Píldoras de selección de escenario de sensibilidad */}
          <div className="mt-4 pt-1 flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1 text-[10px]">
              <div 
                onClick={() => setSelectedScenario('base')}
                className={`px-2.5 py-1.5 rounded-lg border transition cursor-pointer text-center ${
                  selectedScenario === 'base'
                    ? 'bg-[#5b52f9] text-white font-bold border-transparent shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200'
                }`}
              >
                <span>Base (i)</span>
              </div>

              <div 
                onClick={() => setSelectedScenario('sens_mas')}
                className={`px-2 py-1.5 rounded-lg border transition cursor-pointer text-center ${
                  selectedScenario === 'sens_mas'
                    ? 'bg-[#5b52f9] text-white font-bold border-transparent shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200'
                }`}
              >
                <span>+100 pb</span>
              </div>

              <div 
                onClick={() => setSelectedScenario('sens_menos')}
                className={`px-2 py-1.5 rounded-lg border transition cursor-pointer text-center ${
                  selectedScenario === 'sens_menos'
                    ? 'bg-[#5b52f9] text-white font-bold border-transparent shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200'
                }`}
              >
                <span>-100 pb</span>
              </div>
            </div>

            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('niif')}
                className="px-3 py-2 rounded-xl bg-slate-900 text-white font-bold text-[10px] hover:bg-slate-800 transition cursor-pointer shadow-xs whitespace-nowrap"
              >
                Ver NIIF
              </button>
            )}
          </div>
        </div>

      </div>

      {/* 4. BARRA DE FILTROS ACTIVOS (Idéntica a la barra de filtros de la imagen) */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* Píldora de filtros activos */}
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs font-semibold text-slate-800 dark:text-slate-200">
            <span>Filtros activos</span>
            <span className="w-4 h-4 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center">
              {filtroEstado === 'todos' ? '1' : '2'}
            </span>
          </div>

          {/* Selector de Empresa */}
          <button
            type="button"
            onClick={onOpenCompanyConfig}
            title="Ver o editar datos y RUC de la empresa en valuación"
            className="px-3.5 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2 hover:border-blue-400 dark:hover:border-blue-500 transition cursor-pointer"
          >
            <span className="font-semibold text-slate-900 dark:text-white max-w-[240px] truncate">
              {empresa.nombre_empresa || 'Empresa en Valuación'}
            </span>
            <span className="text-slate-400 text-xs">✏️</span>
          </button>

          {/* Selector / Conciliador de Hipótesis Actuariales */}
          {onOpenVariables && (
            <button
              type="button"
              onClick={onOpenVariables}
              title="Ajustar o conciliar tasas con un estudio previo (i, s, r, SBU)"
              className="px-3.5 py-2 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 shadow-xs font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-2 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>i: {(variables.tasa_descuento * 100).toFixed(1)}% · r: {(variables.tasa_rotacion * 100).toFixed(1)}%</span>
              <span className="text-[10px] bg-indigo-200/80 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-1.5 py-0.5 rounded-full font-bold">Conciliar</span>
            </button>
          )}

          {/* Selector de Estado Actuarial */}
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
              Solo Desahucio ({resultados.length - resumen.empleados_elegibles})
            </button>
          </div>

          {/* Periodo de valuación */}
          <div className="px-3.5 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <span>Ejercicio Fiscal 2026</span>
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>

        {/* Buscador de Colaboradores */}
        <div className="relative w-full sm:w-64">
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

      {/* 5. SECCIÓN PRINCIPAL OSCURA SPLIT (Idéntica a la tarjeta inferior con pestaña curva y desglose individual) */}
      <div className="bg-[#181928] text-white rounded-[32px] p-6 shadow-2xl relative">
        
        {/* Cabecera con pestañas superiores */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span>Colaboradores Registrados</span>
            <span className="text-xs font-mono text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded-full border border-purple-800/50">
              {empleadosFiltrados.length} listados
            </span>
          </h2>

          {/* Pestañas centrales con diseño redondeado */}
          <div className="flex items-center justify-center">
            <div className="bg-[#24253a] rounded-full p-1 flex items-center gap-1 shadow-inner text-xs font-semibold">
              <button
                onClick={() => setFiltroEstado('todos')}
                className={`px-4 py-1.5 rounded-full transition cursor-pointer ${
                  filtroEstado === 'todos' 
                    ? 'bg-[#5b52f9] text-white font-bold shadow-xs' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Todos los Colaboradores
              </button>

              <button
                onClick={() => setFiltroEstado('desahucio')}
                className={`px-4 py-1.5 rounded-full transition cursor-pointer flex items-center gap-1.5 ${
                  filtroEstado === 'desahucio' 
                    ? 'bg-[#5b52f9] text-white font-bold shadow-xs' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Solo Desahucio</span>
                <span className="w-4 h-4 rounded-full bg-slate-700 text-slate-300 text-[10px] flex items-center justify-center">
                  {resultados.length - resumen.empleados_elegibles}
                </span>
              </button>

              <button
                onClick={() => setFiltroEstado('elegibles')}
                className={`px-4 py-1.5 rounded-full transition cursor-pointer flex items-center gap-1.5 ${
                  filtroEstado === 'elegibles' 
                    ? 'bg-[#5b52f9] text-white font-bold shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Elegibles Jubilación</span>
                <span className="w-4 h-4 rounded-full bg-[#7c3aed] text-white text-[10px] font-bold flex items-center justify-center">
                  {resumen.empleados_elegibles}
                </span>
              </button>
            </div>
          </div>

          <div className="text-xs text-slate-400 text-right">
            <span>Haga clic en un colaborador para ver su ficha</span>
          </div>
        </div>

        {/* Split Grid: Izquierda (Listado) | Derecha (Ficha Actuarial Individual con 3 tarjetas numéricas) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Columna Izquierda: Listado Desplazable de Colaboradores */}
          <div className="lg:col-span-5 space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
            {empleadosFiltrados.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                <p>No se encontraron colaboradores registrados o coincidentes.</p>
                <button
                  onClick={onOpenUpload}
                  className="px-4 py-2 rounded-xl bg-[#5b52f9] text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 mx-auto"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Subir Nómina Excel</span>
                </button>
              </div>
            ) : (
              empleadosFiltrados.map((emp, idx) => {
                const isSelected = emp.id === selectedEmployee?.id;

                return (
                  <div
                    key={emp.id}
                    onClick={() => setSelectedEmployeeId(emp.id)}
                    className={`p-3.5 rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-3 border ${
                      isSelected
                        ? 'bg-[#5b52f9] text-white border-transparent shadow-lg font-medium'
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
                      <span className={`text-[10px] px-2 py-0.5 rounded-full inline-block mb-1 ${
                        isSelected 
                          ? 'bg-white/20 text-white font-semibold' 
                          : emp.elegible_jubilacion ? 'bg-purple-950/80 text-purple-300' : 'bg-[#2b2c40] text-slate-400'
                      }`}>
                        {emp.elegible_jubilacion ? 'Jubilación' : 'Desahucio'}
                      </span>
                      <div className="text-xs font-mono font-bold">
                        {formatCurrency(emp.VPO_Total)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Columna Derecha: Tarjeta Detallada del Colaborador (Estructura idéntica a la tarjeta derecha de la imagen) */}
          <div className="lg:col-span-7">
            {selectedEmployee ? (
              <div className="bg-[#2d2c55] rounded-3xl p-6 sm:p-7 border border-white/10 space-y-6 h-full flex flex-col justify-between shadow-xl">
                
                {/* Cabecera del colaborador */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-white/10 pb-5">
                  <div>
                    <span className="text-xs text-slate-300 font-medium">Ficha Actuarial Individual</span>
                    <div className="flex items-center gap-2 mt-1">
                      <h3 className="text-2xl font-black text-white tracking-tight">
                        C.I. {selectedEmployee.Cedula}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        selectedEmployee.elegible_jubilacion ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-white/20 text-white'
                      }`}>
                        {selectedEmployee.elegible_jubilacion ? 'Elegible Jubilación Patronal' : 'En Periodo Acumulación'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Empresa */}
                    <div>
                      <span className="text-[10px] text-slate-300 uppercase block">Empresa</span>
                      <div className="flex items-center gap-1.5 font-bold text-sm text-white mt-0.5">
                        <span>{empresa.nombre_empresa || 'Empresa en Valuación'}</span>
                      </div>
                    </div>

                    {/* Avatar y Nombre del Colaborador */}
                    <div className="flex items-center gap-2 pl-3 border-l border-white/15">
                      <img 
                        src={getAvatarUrl(selectedIndex - 1)} 
                        alt={selectedEmployee.Nombre} 
                        className="w-10 h-10 rounded-full object-cover border border-white/30"
                      />
                      <div>
                        <span className="text-xs font-bold text-white block">{selectedEmployee.Nombre}</span>
                        <span className="text-[10px] text-slate-300">{selectedEmployee.Cargo || 'General'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3 Tarjetas de Métricas Numéricas Actuariales con flechas ↗ */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  
                  {/* Métrica 1: Desahucio Art. 185 */}
                  <div className="p-4 rounded-2xl bg-[#39386b] border border-white/10 space-y-1">
                    <div className="flex items-center justify-between text-base font-black text-white font-mono">
                      <span>{formatCurrency(selectedEmployee.VPO_Desahucio)}</span>
                      <ArrowUpRight className="w-4 h-4 text-blue-300" />
                    </div>
                    <span className="text-[11px] text-slate-300 block font-semibold">Reserva Desahucio</span>
                    <span className="text-[10px] text-slate-400 block">Art. 185 (25% último sueldo)</span>
                  </div>

                  {/* Métrica 2: Jubilación Art. 216 */}
                  <div className="p-4 rounded-2xl bg-[#39386b] border border-white/10 space-y-1">
                    <div className="flex items-center justify-between text-base font-black text-white font-mono">
                      <span>{formatCurrency(selectedEmployee.VPO_Jubilacion)}</span>
                      <ArrowUpRight className="w-4 h-4 text-purple-300" />
                    </div>
                    <span className="text-[11px] text-slate-300 block font-semibold">Reserva Jubilación</span>
                    <span className="text-[10px] text-slate-400 block">
                      {selectedEmployee.elegible_jubilacion ? `Pensión: ${formatCurrency(selectedEmployee.pension_mensual)}/m` : 'Art. 216 (<25 años serv.)'}
                    </span>
                  </div>

                  {/* Métrica 3: Costo de Servicio Presente CSC */}
                  <div className="p-4 rounded-2xl bg-[#39386b] border border-white/10 space-y-1">
                    <div className="flex items-center justify-between text-base font-black text-white font-mono">
                      <span>{formatCurrency(selectedEmployee.csc_total)}</span>
                      <ArrowUpRight className="w-4 h-4 text-emerald-300" />
                    </div>
                    <span className="text-[11px] text-slate-300 block font-semibold">Costo Servicio (CSC)</span>
                    <span className="text-[10px] text-slate-400 block">Gasto corriente ejercicio NIIF</span>
                  </div>

                </div>

                {/* Parámetros Técnicos Demográficos */}
                <div className="bg-[#1e1e38] rounded-2xl p-4 border border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Sueldo Actual</span>
                    <span className="font-bold text-white font-mono text-sm">{formatCurrency(selectedEmployee.Sueldo_Actual)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Antigüedad</span>
                    <span className="font-bold text-white text-sm">{selectedEmployee.Antiguedad} años</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Edad / Retiro</span>
                    <span className="font-bold text-white text-sm">{selectedEmployee.Edad} / {variables.edad_retiro} años</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Renta a_x Art. 218</span>
                    <span className="font-bold text-white font-mono text-sm">{selectedEmployee.coeficiente_tabla.toFixed(4)}</span>
                  </div>
                </div>

                {/* Resumen Financiero Inferior y Botones de Acción */}
                <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-6 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-sans block">Desahucio</span>
                      <span className="text-white font-bold text-sm">{formatCurrency(selectedEmployee.VPO_Desahucio)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-sans block">Jubilación</span>
                      <span className="text-white font-bold text-sm">{formatCurrency(selectedEmployee.VPO_Jubilacion)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#818cf8] uppercase font-sans block font-bold">Total DBO</span>
                      <span className="text-[#818cf8] font-black text-sm">{formatCurrency(selectedEmployee.VPO_Total)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => generarFichaActuarialPDF(selectedEmployee, variables)}
                      className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border border-white/15"
                      title="Descargar Ficha en PDF"
                    >
                      <FileDown className="w-3.5 h-3.5 text-rose-400" />
                      <span>Ficha PDF</span>
                    </button>
                    
                    <button
                      onClick={() => onOpenEmployeeDetail(selectedEmployee)}
                      className="px-6 py-2.5 rounded-full bg-white hover:bg-slate-100 text-[#181928] text-xs font-bold shadow-lg transition cursor-pointer"
                    >
                      Ver Detalle Actuarial
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full flex items-center justify-center p-12 text-slate-400 text-xs">
                Seleccione un colaborador del listado para inspeccionar sus cálculos.
              </div>
            )}
          </div>

        </div>

      </div>

      {/* 6. CURVAS ACTUARIALES Y DISTRIBUCIÓN RECHARTS (Al pie del dashboard) */}
      {tieneDatos && (
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
      )}

    </div>
  );
};

// Alias de retrocompatibilidad
export const FinnovaActuaryDashboard = ExecutiveActuaryDashboard;
export type FinnovaActuaryDashboardProps = ExecutiveActuaryDashboardProps;
