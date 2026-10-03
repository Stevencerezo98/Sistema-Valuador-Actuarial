import React, { useState } from 'react';
import { RolUsuario } from '../types/actuarial';
import { Shield, User, Building, Briefcase, ChevronDown, Check, Info } from 'lucide-react';

interface UserRoleBarProps {
  rolActual: RolUsuario;
  onCambiarRol: (nuevoRol: RolUsuario) => void;
  nombreEmpresa: string;
}

export const UserRoleBar: React.FC<UserRoleBarProps> = ({
  rolActual,
  onCambiarRol,
  nombreEmpresa
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const rolesConfig: Record<RolUsuario, { titulo: string; descripcion: string; badgeColor: string; icon: any }> = {
    cliente: {
      titulo: 'Empresa / Recursos Humanos',
      descripcion: 'Acceso exclusivo para subir nómina, consultar el cálculo y descargar el Estudio Actuarial (Word / PDF / Excel). Sin pantallas técnicas.',
      badgeColor: 'bg-blue-700 text-white',
      icon: Building
    },
    actuario: {
      titulo: 'Perito Actuario / Auditor NIIF',
      descripcion: 'Acceso técnico completo a hipótesis macro, tablas de mortalidad IESS 2000, matriz de sensibilidad NIC 19 y memoria de cálculo.',
      badgeColor: 'bg-emerald-700 text-white',
      icon: Briefcase
    },
    admin: {
      titulo: 'Administrador de Sistemas',
      descripcion: 'Acceso total a la infraestructura técnica, modelos relacionales PostgreSQL y funciones en Python.',
      badgeColor: 'bg-purple-800 text-white',
      icon: Shield
    }
  };

  const actual = rolesConfig[rolActual];
  const IconComponent = actual.icon;

  return (
    <div className="relative">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs transition cursor-pointer shadow-xs"
        title="Cambiar perfil de usuario"
      >
        <div className="w-5 h-5 rounded bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300">
          <IconComponent className="w-3.5 h-3.5" />
        </div>
        <div className="text-left hidden sm:block">
          <div className="text-[10px] text-slate-400 leading-tight">Usuario Activo:</div>
          <div className="font-semibold text-white leading-tight flex items-center gap-1.5">
            <span>{actual.titulo}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </div>
        </div>
        <ChevronDown className="w-3 h-3 text-slate-400 sm:hidden" />
      </button>

      {dropdownOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setDropdownOpen(false)} 
          />
          <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden text-slate-800 animate-in fade-in">
            <div className="px-4 py-3 bg-slate-900 text-white border-b border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Control de Roles y Permisos
                </span>
                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-blue-300 font-mono">
                  stevencerezo42@gmail.com
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Selecciona el rol para verificar los permisos y vistas del sistema:
              </p>
            </div>

            <div className="p-2 space-y-1">
              {(Object.keys(rolesConfig) as RolUsuario[]).map(r => {
                const config = rolesConfig[r];
                const ItemIcon = config.icon;
                const isSelected = rolActual === r;

                return (
                  <button
                    key={r}
                    onClick={() => {
                      onCambiarRol(r);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-md transition flex items-start gap-2.5 cursor-pointer ${
                      isSelected 
                        ? 'bg-blue-50 border border-blue-200' 
                        : 'hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div className={`p-1.5 rounded ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <ItemIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                          {config.titulo}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                        {config.descripcion}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 flex items-center gap-1.5 text-[10px] text-slate-500">
              <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span>El rol <strong>Empresa</strong> oculta scripts y módulos técnicos para entrega a clientes.</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
