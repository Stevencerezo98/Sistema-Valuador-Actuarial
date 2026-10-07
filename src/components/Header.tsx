import React from 'react';
import { 
  FileCode2, 
  Download, 
  Upload, 
  Sliders, 
  Trash2, 
  Building, 
  FileText,
  FileDown,
  LogOut,
  Menu,
  FolderPlus,
  Smartphone,
  Sun,
  Moon,
  Palette
} from 'lucide-react';
import { exportarResultadosAExcel } from '../services/actuarialEngine';
import { EmpleadoProcesado, ResumenMotor, VariablesMacro, ItemSensibilidad, RolUsuario, DatosEmpresaEstudio, InfoUsuario, PermisosRol } from '../types/actuarial';
import { PYTHON_SCRIPT_CODE } from '../data/pythonCode';
import { UserRoleBar } from './UserRoleBar';

interface HeaderProps {
  resultados: EmpleadoProcesado[];
  resumen: ResumenMotor;
  variables: VariablesMacro;
  sensibilidad?: ItemSensibilidad[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenUpload: () => void;
  onOpenVariables: () => void;
  onOpenCompanyConfig: () => void;
  onOpenSaveStudy?: () => void;
  onDownloadWord: () => void;
  onDownloadStudyPdf: () => void;
  onClearData: () => void;
  onOpenMobileApi?: () => void;
  hasData: boolean;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  rolActual: RolUsuario;
  onCambiarRol: (rol: RolUsuario) => void;
  empresa: DatosEmpresaEstudio;
  usuarioActivo?: InfoUsuario | null;
  onCerrarSesion?: () => void;
  permisos?: PermisosRol;
  theme?: 'claro' | 'oscuro';
  onToggleTheme?: () => void;
  onOpenLoginBrandConfig?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  resultados,
  resumen,
  variables,
  sensibilidad,
  activeTab,
  setActiveTab,
  onOpenUpload,
  onOpenVariables,
  onOpenCompanyConfig,
  onOpenSaveStudy,
  onDownloadWord,
  onDownloadStudyPdf,
  onClearData,
  onOpenMobileApi,
  hasData,
  sidebarOpen,
  setSidebarOpen,
  rolActual,
  onCambiarRol,
  empresa,
  usuarioActivo,
  onCerrarSesion,
  permisos,
  theme = 'claro',
  onToggleTheme,
  onOpenLoginBrandConfig
}) => {

  const handleDownloadPython = () => {
    const blob = new Blob([PYTHON_SCRIPT_CODE], { type: 'text/x-python;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'actuarial_nic19_ecuador.py');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Permisos efectivos de acciones:
  // Al cliente NO DEBE SALIRLE NINGÚN BOTÓN PARA DESCARGAR WORD, PDF O EXCEL DEL ESTUDIO
  const canEditCompany = permisos ? permisos.acciones.editarEmpresa : rolActual !== 'cliente';
  const canEditVariables = permisos ? permisos.acciones.editarVariables : rolActual !== 'cliente';
  const canUpload = permisos ? permisos.acciones.subirNomina : true;
  const canWord = rolActual !== 'cliente' && (permisos ? permisos.acciones.descargarWord : true);
  const canPdf = rolActual !== 'cliente' && (permisos ? permisos.acciones.descargarPdf : true);
  const canExcel = rolActual !== 'cliente' && (permisos ? permisos.acciones.exportarExcel : true);
  const canSaveStudy = rolActual !== 'cliente';

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 shadow-2xs">
      <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between">
        
        {/* Left: Sidebar toggle & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(prev => !prev)}
            className="p-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer"
            title="Alternar menú lateral"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-sm sm:text-base tracking-tight hidden sm:inline">
              Valuador NIC 19
            </span>
            <span className="text-xs text-slate-500 font-medium hidden md:inline">
              · Art. 185 y 216 Ecuador
            </span>
          </div>
        </div>

        {/* Center / Right: Executive Action Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          
          {activeTab !== 'dashboard' && canEditCompany && (
            <button
              onClick={onOpenCompanyConfig}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition cursor-pointer"
              title="Configurar datos de la empresa para la portada y el estudio"
            >
              <Building className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Empresa</span>
            </button>
          )}

          {canEditVariables && (
            <button
              onClick={onOpenVariables}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition cursor-pointer"
              title="Variables macroeconómicas (i, s, r, SBU)"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Variables</span>
            </button>
          )}

          {activeTab !== 'dashboard' && canUpload && (
            <button
              onClick={onOpenUpload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Subir Nómina</span>
            </button>
          )}

          {hasData && (
            <>
              {/* Botón Guardar Estudio para Actuario / Admin cuando está en otros módulos */}
              {canSaveStudy && onOpenSaveStudy && activeTab !== 'dashboard' && (
                <button
                  onClick={onOpenSaveStudy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                  title="Guardar y registrar este estudio actuarial para la empresa"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>Guardar Estudio</span>
                </button>
              )}

              {/* Descargar Estudio Word Oficial */}
              {canWord && (
                <button
                  onClick={onDownloadWord}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                  title="Generar y descargar Estudio Actuarial formal en Word (.docx) editable"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-300" />
                  <span className="hidden md:inline">Word (.docx)</span>
                </button>
              )}

              {/* Descargar Estudio PDF Oficial */}
              {canPdf && (
                <button
                  onClick={onDownloadStudyPdf}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                  title="Generar y descargar Estudio Actuarial formal en PDF"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Estudio PDF</span>
                </button>
              )}

              {canExcel && activeTab !== 'dashboard' && (
                <button
                  onClick={() => exportarResultadosAExcel(resultados, resumen, variables, sensibilidad)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                  title="Exportar libro de trabajo Excel (.xlsx) con 3 hojas NIIF"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Excel</span>
                </button>
              )}

              {activeTab !== 'dashboard' && (
                <button
                  onClick={onClearData}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 text-xs font-medium transition cursor-pointer"
                  title="Limpiar datos cargados"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Limpiar</span>
                </button>
              )}
            </>
          )}

          {rolActual !== 'cliente' && (
            <button
              onClick={handleDownloadPython}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition cursor-pointer"
              title="Descargar script en Python"
            >
              <FileCode2 className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden lg:inline">Script .py</span>
            </button>
          )}

          {onOpenMobileApi && rolActual === 'admin' && (
            <button
              onClick={onOpenMobileApi}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-semibold transition cursor-pointer shadow-2xs"
              title="Conectar aplicación móvil (Exclusivo Administrador)"
            >
              <Smartphone className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="hidden sm:inline">API Móvil (Admin)</span>
            </button>
          )}

          {onOpenLoginBrandConfig && rolActual === 'admin' && (
            <button
              onClick={onOpenLoginBrandConfig}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-semibold transition cursor-pointer shadow-2xs"
              title="Personalizar imagen de fondo, degradado y títulos de la pantalla de Login"
            >
              <Palette className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span className="hidden lg:inline">Diseño Login (Admin)</span>
            </button>
          )}

          {/* Selector de Rol y Acceso a Gestión de Usuarios */}
          <div className="ml-1 pl-1 border-l border-slate-200 flex items-center gap-1.5">
            <UserRoleBar
              rolActual={rolActual}
              onCambiarRol={onCambiarRol}
              nombreEmpresa={empresa.nombre_empresa}
              onNavigateUsers={() => setActiveTab('users')}
            />

            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                title={theme === 'oscuro' ? 'Cambiar a Tema Claro (Por Defecto)' : 'Cambiar a Modo Oscuro'}
              >
                {theme === 'oscuro' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-600" />}
              </button>
            )}

            {onCerrarSesion && (
              <button
                onClick={onCerrarSesion}
                className="p-1.5 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                title="Cerrar sesión del portal"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};
