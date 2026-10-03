import React, { useMemo } from 'react';
import { 
  Calculator, 
  FileCode2, 
  Scale, 
  FileText,
  Database,
  Sliders,
  Activity,
  Building,
  Briefcase,
  Shield
} from 'lucide-react';
import { VariablesMacro, RolUsuario } from '../types/actuarial';

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
  nombreEmpresa
}) => {
  const menuItems = useMemo(() => {
    if (rolActual === 'cliente') {
      return [
        { id: 'dashboard', label: 'Cálculo y Resultados de Nómina', icon: Calculator, badge: numEmpleados > 0 ? `${numEmpleados}` : '0' },
      ];
    }
    if (rolActual === 'actuario') {
      return [
        { id: 'dashboard', label: 'Cálculo de Nómina', icon: Calculator, badge: numEmpleados > 0 ? `${numEmpleados}` : '0' },
        { id: 'niif', label: 'Reportería NIIF & Sensibilidad', icon: FileText, badge: 'NIC 19' },
        { id: 'mortality', label: 'Tablas Mortalidad IESS', icon: Activity, badge: 'RO 650' },
        { id: 'methodology', label: 'Marco Jurídico & Metodología', icon: Scale, badge: 'Ecuador' },
      ];
    }
    return [
      { id: 'dashboard', label: 'Cálculo de Nómina', icon: Calculator, badge: numEmpleados > 0 ? `${numEmpleados}` : '0' },
      { id: 'niif', label: 'Reportería NIIF & Sensibilidad', icon: FileText, badge: 'NIC 19' },
      { id: 'mortality', label: 'Tablas Mortalidad IESS', icon: Activity, badge: 'RO 650' },
      { id: 'methodology', label: 'Marco Jurídico & Metodología', icon: Scale, badge: 'Ecuador' },
      { id: 'database', label: 'Arquitectura & PostgreSQL', icon: Database, badge: 'SQL' },
      { id: 'python', label: 'Código Python (Pandas)', icon: FileCode2, badge: 'FastAPI' },
    ];
  }, [rolActual, numEmpleados]);

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        />
      )}

      {/* Corporate Executive Sidebar Container */}
      <aside className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col shadow-xl transition-transform duration-200 lg:static lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        
        {/* Brand Logo Header */}
        <div className="h-16 px-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-blue-700 flex items-center justify-center font-bold text-white text-xs shadow-xs tracking-tight">
              SCVS
            </div>
            <div>
              <div className="font-bold text-white text-xs tracking-wide">PORTAL ACTUARIAL</div>
              <div className="text-[10px] text-slate-400 font-mono">NIC 19 / Ecuador</div>
            </div>
          </div>
        </div>

        {/* Info Card de la Empresa Activa */}
        <div className="px-4 py-3 bg-slate-800/60 border-b border-slate-800/80">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Empresa Evaluada:
          </div>
          <div className="text-xs font-bold text-white truncate" title={nombreEmpresa}>
            {nombreEmpresa}
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
              rolActual === 'cliente' 
                ? 'bg-blue-900/60 text-blue-300 border border-blue-700/60' 
                : rolActual === 'actuario'
                ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/60'
                : 'bg-purple-900/60 text-purple-300 border border-purple-700/60'
            }`}>
              {rolActual === 'cliente' ? 'Rol: Empresa / RRHH' : rolActual === 'actuario' ? 'Rol: Perito Actuario' : 'Rol: Administrador'}
            </span>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-1 py-4 px-3 space-y-4 overflow-y-auto">
          
          <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider px-2">
            Módulos del Sistema
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
                  className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-medium transition cursor-pointer ${
                    active
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-gray-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                    active ? 'bg-blue-700 text-white' : 'bg-gray-700 text-gray-300'
                  }`}>
                    {item.badge}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Macro Variables Box in Sidebar */}
          <div className="pt-4 border-t border-gray-700">
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                Variables de Entrada
              </span>
              <button 
                onClick={onOpenVariables}
                className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
              >
                Editar
              </button>
            </div>

            <div className="bg-[#2a2f35] rounded p-2.5 space-y-1.5 text-[11px] font-mono border border-gray-700">
              <div className="flex justify-between text-gray-300">
                <span className="text-gray-400">Desc. (i):</span>
                <span className="text-emerald-400 font-bold">{(variables.tasa_descuento * 100).toFixed(2)}%</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span className="text-gray-400">Salario (s):</span>
                <span className="text-blue-400 font-bold">{(variables.tasa_incremento_sal * 100).toFixed(2)}%</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span className="text-gray-400">Rotación (r):</span>
                <span className="text-amber-400 font-bold">{(variables.tasa_rotacion * 100).toFixed(2)}%</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span className="text-gray-400">SBU:</span>
                <span className="text-white font-bold">${variables.sbu_vigente.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span className="text-gray-400">Retiro:</span>
                <span className="text-white">{variables.edad_retiro} años</span>
              </div>
            </div>
          </div>

        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-gray-700/80 bg-[#2a2f35] text-[10px] text-gray-400 text-center">
          AdminLTE 3 • NIC 19 Ecuador
        </div>

      </aside>
    </>
  );
};
