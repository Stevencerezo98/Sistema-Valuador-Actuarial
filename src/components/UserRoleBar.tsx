import React, { useState } from 'react';
import { RolUsuario } from '../types/actuarial';
import { Shield, Building, Briefcase, ChevronDown, Check, Info, Users } from 'lucide-react';

interface UserRoleBarProps {
  rolActual: RolUsuario;
  onCambiarRol: (nuevoRol: RolUsuario) => void;
  nombreEmpresa: string;
  onNavigateUsers?: () => void;
}

export const UserRoleBar: React.FC<UserRoleBarProps> = ({
  rolActual,
  onCambiarRol,
  nombreEmpresa,
  onNavigateUsers
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const rolesConfig: Record<RolUsuario, { titulo: string; descripcion: string; tag: string; icon: any }> = {
    cliente: {
      titulo: 'Empresa / Recursos Humanos',
      descripcion: 'Acceso corporativo exclusivo para cargar nómina y descargar el Estudio Actuarial oficial. Módulos técnicos ocultos.',
      tag: 'Empresa',
      icon: Building
    },
    actuario: {
      titulo: 'Perito Actuario / Auditor NIIF',
      descripcion: 'Acceso técnico completo a hipótesis macro, tablas de mortalidad IESS 2000, matriz de sensibilidad NIC 19 y memoria actuarial.',
      tag: 'Actuario',
      icon: Briefcase
    },
    admin: {
      titulo: 'Super Administrador',
      descripcion: 'Control total de la plataforma: gestión de usuarios, edición de permisos por rol, configuración de plantilla y modelos.',
      tag: 'Super Admin',
      icon: Shield
    }
  };

  const actual = rolesConfig[rolActual];
  const IconComponent = actual.icon;

  return (
    <div className="relative">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-xs border border-slate-700/60 shadow-xs transition-all cursor-pointer"
        title="Ver información del perfil activo"
      >
        <div className="w-5 h-5 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
          <IconComponent className="w-3.5 h-3.5" />
        </div>
        <div className="text-left hidden sm:block">
          <div className="text-[10px] text-slate-400 leading-tight">Perfil Activo:</div>
          <div className="font-medium text-white leading-tight flex items-center gap-1.5">
            <span>{actual.tag}</span>
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
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200/90 z-50 overflow-hidden text-slate-800">
            <div className="px-4 py-3.5 bg-slate-900 text-white">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                  Control de Roles y Permisos
                </span>
                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded-md text-blue-400 font-mono">
                  {rolActual === 'admin' ? 'Super Admin' : rolActual === 'actuario' ? 'Perito' : 'Empresa'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {rolActual === 'admin' 
                  ? 'Simule otros roles o acceda a la configuración de usuarios y permisos:' 
                  : `Navegando como ${actual.titulo}.`}
              </p>
            </div>

            <div className="p-2 space-y-1">
              {(Object.keys(rolesConfig) as RolUsuario[]).map(r => {
                const config = rolesConfig[r];
                const ItemIcon = config.icon;
                const isSelected = rolActual === r;

                // Solo el Super Administrador puede alternar roles libremente en el simulador
                // Si el usuario actual es cliente o actuario, solo muestra su información
                if (rolActual !== 'admin' && !isSelected) {
                  return null;
                }

                return (
                  <button
                    key={r}
                    onClick={() => {
                      if (rolActual === 'admin') {
                        onCambiarRol(r);
                      }
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl transition flex items-start gap-2.5 ${
                      isSelected 
                        ? 'bg-blue-50/80 border border-blue-200/80' 
                        : 'hover:bg-slate-50 border border-transparent cursor-pointer'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <ItemIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-semibold ${isSelected ? 'text-blue-950' : 'text-slate-800'}`}>
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

            {/* Acceso a Usuarios: ESTRICTAMENTE SOLO PARA SUPER ADMINISTRADOR */}
            {rolActual === 'admin' && onNavigateUsers && (
              <div className="p-2 border-t border-slate-100 bg-slate-50/60">
                <button
                  onClick={() => {
                    onNavigateUsers();
                    setDropdownOpen(false);
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Gestionar Usuarios y Matriz de Permisos</span>
                </button>
              </div>
            )}

            <div className="px-3.5 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
              <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>
                {rolActual === 'admin'
                  ? 'Como Super Administrador puede configurar qué ve cada usuario.'
                  : 'Para modificaciones de permisos, contacte a la administración.'}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
