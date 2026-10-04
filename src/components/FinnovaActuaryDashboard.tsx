import React, { useState, useMemo } from 'react';
import { 
  EmpleadoInput, 
  EmpleadoProcesado, 
  ResumenMotor, 
  VariablesMacro, 
  DatosEmpresaEstudio, 
  RolUsuario 
} from '../types/actuarial';
import { 
  DollarSign, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Search, 
  SlidersHorizontal, 
  Plus, 
  ChevronRight, 
  User, 
  FileText, 
  TrendingUp, 
  Award, 
  ArrowUpRight, 
  Layers, 
  Building,
  CheckCircle2,
  ExternalLink,
  Percent,
  Download,
  Lock,
  ArrowLeft,
  MoreVertical,
  Layers as LayersIcon,
  CreditCard,
  Link as LinkIcon
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
  onNavigateTab: (tab: string) => void;
  onExportExcel: () => void;
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
  onNavigateTab,
  onExportExcel,
  theme = 'claro'
}) => {
  // Filtros interactivos de la barra de herramientas (Estilo Finnova)
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'elegibles' | 'desahucio'>('elegibles');
  const [selectedCardPayment, setSelectedCardPayment] = useState<'4242' | '6789' | '1234'>('6789');
  
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

  // Empleado seleccionado para el panel derecho de Finnova
  const selectedEmployee = useMemo(() => {
    return resultados.find(e => e.id === selectedEmployeeId) || resultados[0] || null;
  }, [resultados, selectedEmployeeId]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val || 0);
  };

  const isDark = theme === 'oscuro';

  // Fotos de avatar diversas y elegantes estilo Finnova
  const getAvatarUrl = (index: number) => {
    const avatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=120&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=120&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=120&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=120&auto=format&fit=crop'
    ];
    return avatars[index % avatars.length];
  };

  return (
    <div className={`p-4 sm:p-7 rounded-[36px] transition-colors duration-200 space-y-6 ${
      isDark ? 'bg-[#10111a] text-slate-100' : 'bg-[#f0f2f9] text-slate-800'
    }`}>
      
      {/* 1. FINNOVA TOP NAVIGATION CAPSULE BAR */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        
        {/* Brand Icon & Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#4f46e5] to-[#7c3aed] flex items-center justify-center text-white shadow-md">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-tight text-slate-900 dark:text-white uppercase">
                FINNOVA
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                {resumen.total_empleados || 80}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Smart Actuarial & Labor Valuations
            </p>
          </div>
        </div>

        {/* Center: Finnova Dark Capsule Navigation Pills */}
        <div className="bg-[#1c1d2e] text-white rounded-full p-1.5 flex items-center gap-1 shadow-lg text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => onNavigateTab('dashboard')}
            className="px-4 py-2 rounded-full text-slate-300 hover:text-white transition cursor-pointer"
          >
            + Overview
          </button>
          <button
            onClick={() => onNavigateTab('variables')}
            className="px-4 py-2 rounded-full text-slate-300 hover:text-white transition cursor-pointer"
          >
            Estimates
          </button>
          {/* Active Highlighted Capsule (Finnova Blue/Purple) */}
          <button
            onClick={() => onNavigateTab('dashboard')}
            className="px-5 py-2 rounded-full bg-[#5b52f9] text-white font-bold transition shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
            <span>Invoices</span>
          </button>
          <button
            onClick={() => onNavigateTab('estudios')}
            className="px-4 py-2 rounded-full text-slate-300 hover:text-white transition cursor-pointer"
          >
            Payments
          </button>
          <button
            onClick={() => onNavigateTab('niif')}
            className="px-4 py-2 rounded-full text-slate-300 hover:text-white transition cursor-pointer"
          >
            Recurring
          </button>
          <button
            onClick={() => onNavigateTab('mortality')}
            className="px-4 py-2 rounded-full text-slate-300 hover:text-white transition cursor-pointer"
          >
            Checkouts
          </button>
          {rolActual === 'admin' && (
            <button
              onClick={() => onNavigateTab('users')}
              className="px-4 py-2 rounded-full text-amber-300 hover:text-white transition cursor-pointer"
            >
              Usuarios
            </button>
          )}
        </div>

        {/* Right utility icons in capsules */}
        <div className="flex items-center gap-2">
          <button 
            onClick={onExportExcel}
            className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 flex items-center justify-center shadow-xs transition cursor-pointer" 
            title="Exportar Reporte"
          >
            <Download className="w-4 h-4 text-emerald-600" />
          </button>
          <button 
            onClick={onOpenSaveStudy}
            className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 flex items-center justify-center shadow-xs transition cursor-pointer" 
            title="Guardar Estudio"
          >
            <FileText className="w-4 h-4 text-blue-600" />
          </button>
          <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-xs text-xs font-bold text-slate-700 dark:text-slate-300">
            {empresa.nombre_empresa.substring(0, 2).toUpperCase()}
          </div>
          <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white shadow-xs">
            <img 
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=120&auto=format&fit=crop" 
              alt="Avatar" 
              className="w-full h-full object-cover" 
            />
          </div>
        </div>

      </div>

      {/* 2. SUB-HEADER: TITLE ROW WITH ACTION BUTTON */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigateTab('dashboard')}
            className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Invoices
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage and track all your actuarial invoices in one place.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenUpload}
            className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 shadow-xs cursor-pointer"
            title="Filtros avanzados"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenUpload}
            className="px-5 py-2.5 rounded-2xl bg-[#5b52f9] hover:bg-[#4f46e5] text-white text-xs font-bold transition flex items-center gap-2 shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create an invoice</span>
          </button>
        </div>
      </div>

      {/* 3. FINNOVA 4 METRIC CARDS (Exact match to screenshot 66f929125acd698c229c5938c0b9724e.jpg) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* CARD 1: OVERDUE (Provisión Desahucio) */}
        <div className={`p-5 rounded-3xl border transition-all flex flex-col justify-between shadow-xs ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/80'
        }`}>
          <div>
            <div className="flex items-start justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Overdue
              </span>
              <span className="w-5 h-5 rounded-full border border-rose-300 text-rose-500 text-[10px] font-bold flex items-center justify-center">
                !
              </span>
            </div>

            <div className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mt-2">
              {formatCurrency(resumen.vpo_desahucio_total || 24850.00)}
            </div>

            <div className="text-[11px] text-rose-500 font-semibold mt-1 flex items-center gap-1">
              <span>↑ 12.5%</span>
              <span className="text-slate-400">from last month</span>
            </div>
          </div>

          {/* Desk visual (Finnova style setup) */}
          <div className="mt-4 pt-2 flex items-center gap-3">
            <div className="w-16 h-12 rounded-xl overflow-hidden shadow-xs border border-slate-200 dark:border-slate-700 shrink-0">
              <img 
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=200&auto=format&fit=crop" 
                alt="Workspace" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-[11px] text-slate-400 leading-tight">
              <span className="font-bold text-slate-700 dark:text-slate-300 block">Art. 185</span>
              25% última remuneración
            </div>
          </div>
        </div>

        {/* CARD 2: DUE WITHIN NEXT MONTH (Jubilación Patronal con gráfico de barras Finnova) */}
        <div className={`p-5 rounded-3xl border transition-all flex flex-col justify-between shadow-xs ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/80'
        }`}>
          <div>
            <div className="flex items-start justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Due within next month
              </span>
              <span className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
                <Calendar className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mt-2">
              {formatCurrency(resumen.vpo_jubilacion_total || 142560.00)}
            </div>

            <div className="text-[11px] text-blue-600 font-semibold mt-1 flex items-center gap-1">
              <span>↑ 8.2%</span>
              <span className="text-slate-400">from last month</span>
            </div>
          </div>

          {/* Minimalist vertical bar chart (Exact match to Finnova screenshot) */}
          <div className="mt-4 pt-2">
            <div className="flex items-end justify-between gap-1.5 h-12">
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-[#c7d2fe] dark:bg-blue-950 rounded-t-md h-4"></div>
                <span className="text-[8px] text-slate-400">Jul</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-[#c7d2fe] dark:bg-blue-950 rounded-t-md h-6"></div>
                <span className="text-[8px] text-slate-400">Aug</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-[#818cf8] dark:bg-blue-800 rounded-t-md h-8"></div>
                <span className="text-[8px] text-slate-400">Sep</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-[#6366f1] dark:bg-blue-700 rounded-t-md h-12"></div>
                <span className="text-[8px] text-slate-400">Oct</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-[#4f46e5] dark:bg-blue-600 rounded-t-md h-9"></div>
                <span className="text-[8px] text-slate-400">Nov</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-[#4338ca] dark:bg-blue-500 rounded-t-md h-11"></div>
                <span className="text-[8px] text-slate-400">Dec</span>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 3: AVERAGE TIME TO GET PAID (Curva de línea con puntos Finnova) */}
        <div className={`p-5 rounded-3xl border transition-all flex flex-col justify-between shadow-xs ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/80'
        }`}>
          <div>
            <div className="flex items-start justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Average time to get paid
              </span>
              <span className="w-6 h-6 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 flex items-center justify-center">
                <Clock className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mt-2">
              16 days
            </div>

            <div className="text-[11px] text-teal-600 font-semibold mt-1 flex items-center gap-1">
              <span>↓ 2 days</span>
              <span className="text-slate-400">from last month</span>
            </div>
          </div>

          {/* Sparkline curve with dots (Exact match to Finnova screenshot) */}
          <div className="mt-4 pt-2">
            <svg viewBox="0 0 160 40" className="w-full h-11 overflow-visible">
              <path
                d="M 5 35 Q 35 32 60 22 T 115 15 T 155 8"
                fill="none"
                stroke="#6366f1"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="5" cy="35" r="3.5" fill="#6366f1" stroke="white" strokeWidth="1.5" />
              <circle cx="45" cy="28" r="3.5" fill="#6366f1" stroke="white" strokeWidth="1.5" />
              <circle cx="85" cy="18" r="3.5" fill="#6366f1" stroke="white" strokeWidth="1.5" />
              <circle cx="120" cy="14" r="3.5" fill="#6366f1" stroke="white" strokeWidth="1.5" />
              <circle cx="155" cy="8" r="3.5" fill="#6366f1" stroke="white" strokeWidth="1.5" />
            </svg>
          </div>
        </div>

        {/* CARD 4: AVAILABLE FOR INSTANT PAYOUT (Tarjetas de pago y Payout now) */}
        <div className={`p-5 rounded-3xl border transition-all flex flex-col justify-between shadow-xs ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/80'
        }`}>
          <div>
            <div className="flex items-start justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Available for Instant Payout
              </span>
              <div className="flex items-center gap-1 text-emerald-600">
                <span className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
                  <Lock className="w-3.5 h-3.5" />
                </span>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mt-2">
              {formatCurrency(resumen.vpo_total || 186540.00)}
            </div>

            <div className="text-[11px] text-slate-400 font-semibold mt-1">
              Expects
            </div>
          </div>

          {/* Cards selector row & Payout now button (Exact match to Finnova screenshot) */}
          <div className="mt-4 pt-1 flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1 text-[10px]">
              <div 
                onClick={() => setSelectedCardPayment('4242')}
                className={`px-2 py-1.5 rounded-lg border transition cursor-pointer text-center ${
                  selectedCardPayment === '4242'
                    ? 'bg-[#5b52f9] text-white font-bold border-transparent'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200'
                }`}
              >
                <span>•••• 4242</span>
                <span className="text-[8px] block opacity-75">Visa</span>
              </div>

              <div 
                onClick={() => setSelectedCardPayment('6789')}
                className={`px-2.5 py-1.5 rounded-lg border transition cursor-pointer text-center ${
                  selectedCardPayment === '6789'
                    ? 'bg-[#5b52f9] text-white font-bold border-transparent shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200'
                }`}
              >
                <span>•••• 6789</span>
                <span className="text-[8px] block opacity-75">Stripe</span>
              </div>

              <div 
                onClick={() => setSelectedCardPayment('1234')}
                className={`px-2 py-1.5 rounded-lg border transition cursor-pointer text-center ${
                  selectedCardPayment === '1234'
                    ? 'bg-[#5b52f9] text-white font-bold border-transparent'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200'
                }`}
              >
                <span>•••• 1234</span>
                <span className="text-[8px] block opacity-75">PayPal</span>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('niif')}
              className="px-3 py-2 rounded-xl bg-slate-900 text-white font-bold text-[10px] hover:bg-slate-800 transition cursor-pointer shadow-xs whitespace-nowrap"
            >
              Payout now
            </button>
          </div>
        </div>

      </div>

      {/* 4. FINNOVA ACTIVE FILTERS ROW */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* Active filters pill badge */}
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs font-semibold text-slate-800 dark:text-slate-200">
            <span>Active filters</span>
            <span className="w-4 h-4 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center">
              2
            </span>
          </div>

          {/* All customers dropdown */}
          <div className="px-3.5 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <span>{empresa.nombre_empresa || 'All customers'}</span>
            <span className="text-slate-400">▾</span>
          </div>

          {/* All statuses dropdown */}
          <div className="px-3.5 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <span>All statuses</span>
            <span className="text-slate-400">▾</span>
          </div>

          {/* Dates pills */}
          <div className="px-3.5 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <span>November 2026</span>
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <div className="px-3.5 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <span>December 2026</span>
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>

        {/* Right Search Input pill */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Enter invoice #"
            className="w-full pl-4 pr-9 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white shadow-xs outline-none focus:ring-2 focus:ring-[#5b52f9]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* 5. FINNOVA BIG DARK SECTION (Bottom Split Card with curved tab shape) */}
      <div className="bg-[#181928] text-white rounded-[32px] p-6 shadow-2xl relative">
        
        {/* Top Header of the Dark Card with Tab Pills */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          
          <h2 className="text-base font-bold text-white tracking-tight">
            Unpaid Invoices
          </h2>

          {/* Curved Center Tabs (Finnova screenshot replica) */}
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
                All Invoices
              </button>

              <button
                onClick={() => setFiltroEstado('desahucio')}
                className={`px-4 py-1.5 rounded-full transition cursor-pointer flex items-center gap-1.5 ${
                  filtroEstado === 'desahucio' 
                    ? 'bg-[#5b52f9] text-white font-bold shadow-xs' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Draft</span>
                <span className="w-4 h-4 rounded-full bg-slate-700 text-slate-300 text-[10px] flex items-center justify-center">
                  3
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
                <span>Unpaid</span>
                <span className="w-4 h-4 rounded-full bg-[#7c3aed] text-white text-[10px] font-bold flex items-center justify-center">
                  5
                </span>
              </button>
            </div>
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-3 text-slate-400 justify-end">
            <button className="hover:text-white transition">
              <LayersIcon className="w-4 h-4" />
            </button>
            <button className="hover:text-white transition">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Split Grid: Left (Invoice / Employee List) | Right (Detailed Finnova Card) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: List of Invoices / Employees */}
          <div className="lg:col-span-5 space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
            {empleadosFiltrados.slice(0, 10).map((emp, idx) => {
              const isSelected = emp.id === selectedEmployeeId;
              const invNum = `INV-${1001 + idx}`;

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
                      <div className="text-xs font-bold truncate">
                        # {invNum}
                      </div>
                      <div className={`text-[11px] truncate ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                        {emp.Nombre}
                      </div>
                      <div className={`text-[10px] ${isSelected ? 'text-white/70' : 'text-slate-500'}`}>
                        In {idx + 2} days
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full inline-block mb-1 ${
                      isSelected 
                        ? 'bg-white/20 text-white font-semibold' 
                        : 'bg-[#2b2c40] text-slate-400'
                    }`}>
                      {idx % 2 === 0 ? 'Unsent' : 'Viewed'}
                    </span>
                    <div className="text-xs font-mono font-bold">
                      {formatCurrency(emp.VPO_Total)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Detailed Finnova Card (Exact Replica of screenshot) */}
          <div className="lg:col-span-7">
            {selectedEmployee ? (
              <div className="bg-[#2d2c55] rounded-3xl p-6 sm:p-7 border border-white/10 space-y-6 h-full flex flex-col justify-between shadow-xl">
                
                {/* Header of Detail Card */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-white/10 pb-5">
                  <div>
                    <span className="text-xs text-slate-300 font-medium">Invoice details</span>
                    <div className="flex items-center gap-2 mt-1">
                      <h3 className="text-2xl font-black text-white tracking-tight">
                        # INV-1003
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] text-white font-semibold">
                        Unsent
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Company */}
                    <div>
                      <span className="text-[10px] text-slate-300 uppercase block">Company</span>
                      <div className="flex items-center gap-1.5 font-bold text-sm text-white mt-0.5">
                        <span>BrightWave</span>
                        <svg className="w-4 h-4 text-cyan-400 fill-current" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/>
                        </svg>
                      </div>
                    </div>

                    {/* Customer Avatar & Name */}
                    <div className="flex items-center gap-2 pl-3 border-l border-white/15">
                      <img 
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=120&auto=format&fit=crop" 
                        alt="James Carter" 
                        className="w-9 h-9 rounded-full object-cover border border-white/30"
                      />
                      <div>
                        <span className="text-xs font-bold text-white block">James Carter</span>
                        <span className="text-[10px] text-slate-300">Marketing Director</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3 Large Stat Cards + Add Item Box (Finnova screenshot replica) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  
                  <div className="p-4 rounded-2xl bg-[#39386b] border border-white/10 space-y-1">
                    <div className="flex items-center justify-between text-base font-black text-white font-mono">
                      <span>$ 15,990.00</span>
                      <ArrowUpRight className="w-4 h-4 text-slate-300" />
                    </div>
                    <span className="text-[11px] text-slate-300 block">UI/UX Design</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#39386b] border border-white/10 space-y-1">
                    <div className="flex items-center justify-between text-base font-black text-white font-mono">
                      <span>$ 21,250.00</span>
                      <ArrowUpRight className="w-4 h-4 text-slate-300" />
                    </div>
                    <span className="text-[11px] text-slate-300 block">Development</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#39386b] border border-white/10 space-y-1">
                    <div className="flex items-center justify-between text-base font-black text-white font-mono">
                      <span>$ 10,740.00</span>
                      <ArrowUpRight className="w-4 h-4 text-slate-300" />
                    </div>
                    <span className="text-[11px] text-slate-300 block">QA & Testing</span>
                  </div>

                  <button 
                    onClick={() => onOpenEmployeeDetail(selectedEmployee)}
                    className="p-4 rounded-2xl border-2 border-dashed border-white/20 hover:border-white/50 text-slate-300 hover:text-white transition flex flex-col items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-[11px] font-semibold">Add item</span>
                  </button>

                </div>

                {/* Bottom Financial Summary Row & Payout Now Button */}
                <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-6 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-sans block">Sub Total</span>
                      <span className="text-white font-bold text-sm">$ 47,980.00</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-sans block">Total</span>
                      <span className="text-white font-bold text-sm">$ 47,980.00</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-sans block">Balance Due</span>
                      <span className="text-white font-bold text-sm">$ 47,980.00</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer">
                      <LinkIcon className="w-4 h-4" />
                    </button>
                    <button className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer">
                      <Calendar className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onOpenEmployeeDetail(selectedEmployee)}
                      className="px-6 py-2.5 rounded-full bg-white hover:bg-slate-100 text-[#181928] text-xs font-bold shadow-lg transition cursor-pointer"
                    >
                      Payout now
                    </button>
                  </div>
                </div>

              </div>
            ) : null}
          </div>

        </div>

      </div>

    </div>
  );
};
