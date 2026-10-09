import React, { useMemo } from 'react';
import { 
  Calculator, 
  FileCode2, 
  Scale, 
  FileText,
  Database,
  Sliders,
  Activity,
  Shield,
  Users,
  FolderArchive
} from 'lucide-react';
import { VariablesMacro, RolUsuario, PermisosRol } from '../types/actuarial';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  variables: VariablesMacro;
  onOpenVariables: () => void;
  isOpen: boolean;
  onCloseMobile: () => void;
  numEmpleados: number;
  rolActual: RolUsuario;
  nombreEmpresa: string;
  permisos?: PermisosRol;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  variables,
  onOpenVariables,
  isOpen,
  onCloseMobile,
  numEmpleados,
  rolActual,
  nombreEmpresa,
  permisos
}) => {
  const menuItems = useMemo(() => {
    // Definición de todos los ítems posibles
    const allItems = [
      { 
        id: 'dashboard', 
        label: rolActual === 'cliente' ? 'Carga de Nómina' : 'Cálculo y Valuación', 
        icon: Calculator, 
        badge: numEmpleados > 0 && rolActual !== 'cliente' ? `${numEmpleados} reg.` : undefined 
      },
      { 
        id: 'estudios', 
        label: 'Estudios Actuariales', 
        icon: FolderArchive, 
        badge: undefined 
      },
      { 
        id: 'niif', 
        label: 'Reportería NIIF & Sensibilidad', 
        icon: FileText, 
        badge: 'NIC 19' 
      },
      { 
        id: 'mortality', 
        label: 'Tablas de Mortalidad IESS', 
        icon: Activity, 
        badge: 'RO 650' 
      },
      { 
        id: 'methodology', 
        label: 'Marco Jurídico & Metodología', 
        icon: Scale, 
        badge: undefined 
      },
      { 
        id: 'users', 
        label: 'Usuarios y Permisos', 
        icon: Users, 
        badge: 'Admin' 
      },
      { 
        id: 'database', 
        label: 'PostgreSQL & Backend', 
        icon: Database, 
        badge: 'FastAPI' 
      },
      { 
        id: 'python', 
        label: 'Script Python (Pandas)', 
        icon: FileCode2, 
        badge: 'Python' 
      },
    ];

    return allItems.filter(item => {
      // REGLA FUNDAMENTAL: PERITO ACTUARIO Y EMPRESA NUNCA TIENEN ACCESO A USERS
      if (item.id === 'users') {
        if (rolActual !== 'admin') return false;
        if (permisos && !permisos.modulos.users) return false;
        return true;
      }

      // Si hay permisos configurados, respetar la configuración de módulos
      if (permisos) {
        return permisos.modulos[item.id as keyof typeof permisos.modulos];
      }

      // Fallback predeterminado según el rol si no se han cargado permisos
      if (rolActual === 'cliente') {
        return item.id === 'dashboard' || item.id === 'estudios';
      }
      if (rolActual === 'actuario') {
        return ['dashboard', 'estudios', 'niif', 'mortality', 'methodology', 'database', 'python'].includes(item.id);
      }
      return true;
    });
  }, [rolActual, numEmpleados, permisos]);

  const canEditVariables = permisos ? permisos.acciones.editarVariables : rolActual !== 'cliente';

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Modern Executive Sidebar Container */}
      <aside className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0B1120] text-slate-300 flex flex-col border-r border-slate-800/80 shadow-2xl transition-transform duration-200 lg:static lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        
        {/* Brand Logo Header */}
        <div className="h-16 px-4 border-b border-slate-800/80 flex items-center justify-between bg-[#070b14]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow-md shadow-blue-600/30 border border-white/10 tracking-tight">
              SC
            </div>
            <div>
              <div className="font-bold text-white text-xs tracking-wide">PORTAL ACTUARIAL</div>
              <div className="text-[10px] text-slate-400 font-mono">NIC 19 · Ecuador</div>
            </div>
          </div>
        </div>

        {/* Info Card de la Empresa Activa */}
        <div className="px-4 py-3 bg-slate-900/60 border-b border-slate-800/70">
          <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
            Razón Social / Empresa
          </div>
          <div className="text-xs font-semibold text-white truncate mt-0.5" title={nombreEmpresa || 'Pendiente de cargar nómina'}>
            {nombreEmpresa || 'Empresa en Valuación'}
          </div>
          <div className="mt-1.5 flex items-center gap-1.5 text-[10px]">
            <span className={`px-2 py-0.5 rounded-md font-medium ${
              rolActual === 'cliente' 
                ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30' 
                : rolActual === 'actuario'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
            }`}>
              {rolActual === 'cliente' ? 'Empresa / RRHH' : rolActual === 'actuario' ? 'Perito Actuario' : 'Super Admin'}
            </span>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-1 py-4 px-3 space-y-4 overflow-y-auto">
          
          <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider px-2">
            Navegación
          </div>

          <nav className="space-y-1">
            {menuItems.map(item => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    active
                      ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/25'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                      active ? 'bg-blue-700/80 text-white' : 'text-slate-400'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Macro Variables Box in Sidebar - Solo si tiene permiso de editar o ver variables */}
          {canEditVariables && (
            <div className="pt-3 border-t border-slate-800/80">
              <div className="flex items-center justify-between px-2 mb-2">
                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                  Variables de Entrada
                </span>
                <button 
                  onClick={onOpenVariables}
                  className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold cursor-pointer transition-colors"
                >
                  Editar
                </button>
              </div>

              <div className="bg-slate-900/80 rounded-xl p-2.5 space-y-1.5 text-[11px] font-mono border border-slate-800">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400 font-sans">Desc. (i):</span>
                  <span className="text-emerald-400 font-semibold">{(variables.tasa_descuento * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400 font-sans">Salario (s):</span>
                  <span className="text-blue-400 font-semibold">{(variables.tasa_incremento_sal * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400 font-sans">Rotación (r):</span>
                  <span className="text-amber-400 font-semibold">{(variables.tasa_rotacion * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400 font-sans">SBU:</span>
                  <span className="text-white font-semibold">${variables.sbu_vigente.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400 font-sans">Retiro:</span>
                  <span className="text-slate-200">{variables.edad_retiro} años</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-[#070b14] text-[10px] text-slate-400 text-center">
          Valuación Actuarial · NIC 19 Ecuador
        </div>

      </aside>
    </>
  );
};
