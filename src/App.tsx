import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { EmptyStateDropzone } from './components/EmptyStateDropzone';
import { NiifReportView } from './components/NiifReportView';
import { DatabaseSchemaView } from './components/DatabaseSchemaView';
import { PythonScriptView } from './components/PythonScriptView';
import { LegalMethodology } from './components/LegalMethodology';
import { MortalityTablesView } from './components/MortalityTablesView';
import { EmployeeDetailModal } from './components/EmployeeDetailModal';
import { UploadModal } from './components/UploadModal';
import { MacroVariablesModal } from './components/MacroVariablesModal';
import { CompanyConfigModal } from './components/CompanyConfigModal';
import { UserManagementView } from './components/UserManagementView';
import { AuthPortal } from './components/AuthPortal';
import { SaveStudyModal } from './components/SaveStudyModal';
import { ActuarialStudiesView } from './components/ActuarialStudiesView';
import { ClientConfirmationView } from './components/ClientConfirmationView';
import { MobileApiModal } from './components/MobileApiModal';
import { LoginBrandConfigModal } from './components/LoginBrandConfigModal';
import { FinnovaActuaryDashboard } from './components/FinnovaActuaryDashboard';
import { getInitialTheme, applyTheme, ThemeMode } from './services/themeService';
import { enviarNotificacionCorreoActuario } from './services/notificationService';

import { 
  EmpleadoInput, 
  EmpleadoProcesado, 
  VariablesMacro, 
  DatosEmpresaEstudio, 
  DEFAULT_DATOS_EMPRESA, 
  RolUsuario, 
  InfoUsuario,
  EntregaNominaCliente 
} from './types/actuarial';
import { 
  DEFAULT_VARIABLES_MACRO, 
  procesarMotorActuarial, 
  calcularSensibilidadNIIF, 
  METADATOS_EMPRESA_DETECTADOS,
  exportarResultadosAExcel 
} from './services/actuarialEngine';
import { generarEstudioWord } from './services/wordReportGenerator';
import { generarEstudioCompletoPDF } from './services/estudioPdfReportGenerator';
import { 
  obtenerSesionActiva, 
  cerrarSesionActiva, 
  obtenerPermisosEfectivos 
} from './services/authService';
import { 
  registrarEntregaNomina, 
  obtenerUltimaEntregaEmpresa 
} from './services/studiesService';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  
  // Sesión de usuario autenticado
  const [usuarioActivo, setUsuarioActivo] = useState<InfoUsuario | null>(() => obtenerSesionActiva());
  const [rolActual, setRolActual] = useState<RolUsuario>(() => usuarioActivo?.rol || 'admin');
  const [permisosVersion, setPermisosVersion] = useState<number>(0);

  // Tema Claro / Oscuro (Por defecto TEMA CLARO según preferencia del usuario)
  const [theme, setTheme] = useState<ThemeMode>(() => getInitialTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const handleToggleTheme = () => {
    const next: ThemeMode = theme === 'claro' ? 'oscuro' : 'claro';
    setTheme(next);
    applyTheme(next);
  };

  // Permisos efectivos (del rol o personalizados por usuario)
  const permisos = useMemo(() => {
    return obtenerPermisosEfectivos(usuarioActivo, rolActual);
  }, [usuarioActivo, rolActual, permisosVersion]);

  // Protección de rutas y módulos:
  // Si la pestaña activa no está permitida para este rol/usuario, redirigir a 'dashboard'
  useEffect(() => {
    if (activeTab === 'users' && rolActual !== 'admin') {
      setActiveTab('dashboard');
      return;
    }
    const moduloPermitido = permisos.modulos[activeTab as keyof typeof permisos.modulos];
    if (moduloPermitido === false) {
      setActiveTab('dashboard');
    }
  }, [activeTab, rolActual, permisos]);

  // Censo Actuarial de Nómina (Inicia vacío: sin datos de prueba ni datos falsos)
  const [censusInput, setCensusInput] = useState<EmpleadoInput[]>([]);
  const [variables, setVariables] = useState<VariablesMacro>(DEFAULT_VARIABLES_MACRO);

  // Modales
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isVariablesOpen, setIsVariablesOpen] = useState<boolean>(false);
  const [isCompanyConfigOpen, setIsCompanyConfigOpen] = useState<boolean>(false);
  const [isSaveStudyOpen, setIsSaveStudyOpen] = useState<boolean>(false);
  const [isMobileApiOpen, setIsMobileApiOpen] = useState<boolean>(false);
  const [isLoginBrandOpen, setIsLoginBrandOpen] = useState<boolean>(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmpleadoProcesado | null>(null);

  // Estado de entrega de nómina para el cliente
  const [ultimaEntregaCliente, setUltimaEntregaCliente] = useState<EntregaNominaCliente | null>(() => {
    if (usuarioActivo?.rol === 'cliente') {
      return obtenerUltimaEntregaEmpresa(usuarioActivo.ruc, usuarioActivo.empresa || usuarioActivo.razonSocial);
    }
    return null;
  });

  // Cerrar Sesión
  const handleCerrarSesion = () => {
    cerrarSesionActiva();
    setUsuarioActivo(null);
    setCensusInput([]);
    setUltimaEntregaCliente(null);
  };

  // Sincronizar rol si cambia el usuario activo
  const handleCambiarRolActivo = (nuevoRol: RolUsuario) => {
    setRolActual(nuevoRol);
    if (usuarioActivo) {
      setUsuarioActivo(prev => prev ? { ...prev, rol: nuevoRol } : null);
    }
    // Si cambia de rol y estaba en una vista no autorizada (como 'users'), volver a dashboard
    if (nuevoRol !== 'admin' && activeTab === 'users') {
      setActiveTab('dashboard');
    }
  };

  // Datos y parámetros de la empresa para la generación del estudio
  const [empresa, setEmpresa] = useState<DatosEmpresaEstudio>(() => {
    try {
      const saved = localStorage.getItem('PARAMETROS_EMPRESA_ACTUARIAL');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_DATOS_EMPRESA;
  });

  // Sincronizar datos de empresa con el usuario logueado si es cliente
  useEffect(() => {
    if (usuarioActivo && usuarioActivo.rol === 'cliente') {
      setEmpresa(prev => ({
        ...prev,
        nombre_empresa: usuarioActivo.razonSocial || usuarioActivo.empresa || prev.nombre_empresa,
        ruc: usuarioActivo.ruc || prev.ruc
      }));
      setUltimaEntregaCliente(obtenerUltimaEntregaEmpresa(usuarioActivo.ruc, usuarioActivo.empresa || usuarioActivo.razonSocial));
    }
  }, [usuarioActivo]);

  // Procesamiento del motor actuarial: Exclusivamente sobre los datos de nómina cargados
  const { resultados, resumen } = useMemo(() => {
    return procesarMotorActuarial(censusInput, variables);
  }, [censusInput, variables]);

  // Análisis de sensibilidad NIIF
  const sensibilidad = useMemo(() => {
    return calcularSensibilidadNIIF(censusInput, variables);
  }, [censusInput, variables]);

  // Manejo de carga de datos según el rol
  const handleLoadData = (newData: EmpleadoInput[], fileName?: string) => {
    // REGLA CRÍTICA PARA EL CLIENTE:
    // Al cliente NO tiene que salirle nada del estudio, valuación o descarga.
    // Solo debe registrarse la entrega y mostrar el agradecimiento + botón de notificación.
    if (rolActual === 'cliente') {
      const nomArchivo = fileName || 'nomina_empresa.xlsx';
      const entrega = registrarEntregaNomina({
        rucEmpresa: usuarioActivo?.ruc || empresa.ruc || '1790000000001',
        nombreEmpresa: usuarioActivo?.razonSocial || usuarioActivo?.empresa || empresa.nombre_empresa || 'Empresa',
        usuarioId: usuarioActivo?.id || 'usr-cli',
        usuarioNombre: usuarioActivo?.nombre || 'Representante Empresa',
        nombreArchivo: nomArchivo,
        numRegistros: newData.length,
        datosCenso: newData
      });
      setUltimaEntregaCliente(entrega);

      // SERVICIO DE CORREO AUTOMÁTICO: Enviar correo al actuario con nombre de empresa y fecha de carga
      enviarNotificacionCorreoActuario({
        nombreEmpresa: entrega.nombreEmpresa,
        ruc: entrega.rucEmpresa,
        nombreArchivo: entrega.nombreArchivo,
        numRegistros: entrega.numRegistros,
        fechaCarga: entrega.fechaSubida,
        usuarioNombre: entrega.usuarioNombre,
        actuarioEmail: 'actuario@estudiosactuariales.ec'
      }).catch(err => console.error('Error enviando notificación por correo:', err));

      setActiveTab('dashboard');
      return;
    }

    // Para el actuario o administrador:
    // Carga de nómina al motor para cálculo completo
    setCensusInput(newData);
    // Autollenar parámetros de la empresa si fueron detectados en el archivo
    const meta = METADATOS_EMPRESA_DETECTADOS;
    if (meta.nombre_empresa || meta.ruc || meta.canton || meta.ciudad) {
      setEmpresa(prev => {
        const updated: DatosEmpresaEstudio = {
          ...prev,
          nombre_empresa: meta.nombre_empresa || prev.nombre_empresa,
          nombre_comercial: meta.nombre_comercial || prev.nombre_comercial,
          ruc: meta.ruc || prev.ruc,
          ciudad: meta.canton ? `${meta.canton}, ${meta.provincia || 'Ecuador'}` : (meta.ciudad || prev.ciudad),
          objeto_social: meta.objeto_social || prev.objeto_social,
          fecha_corte_valuacion: meta.fecha_corte_valuacion || prev.fecha_corte_valuacion,
          anio_evaluado: meta.anio_evaluado || prev.anio_evaluado,
          anio_anterior: meta.anio_evaluado ? meta.anio_evaluado - 1 : prev.anio_anterior,
          provision_anterior_jubilacion: meta.provision_anterior_jubilacion || prev.provision_anterior_jubilacion,
          provision_anterior_desahucio: meta.provision_anterior_desahucio || prev.provision_anterior_desahucio,
        };
        try {
          localStorage.setItem('PARAMETROS_EMPRESA_ACTUARIAL', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
    }
    setActiveTab('dashboard');
  };

  const handleClearData = () => {
    setCensusInput([]);
  };

  const handleDownloadWord = async () => {
    try {
      await generarEstudioWord(resultados, resumen, variables, empresa);
    } catch (err: any) {
      console.error("Error generando archivo Word:", err);
    }
  };

  const handleDownloadStudyPdf = () => {
    try {
      generarEstudioCompletoPDF(resultados, resumen, variables, empresa);
    } catch (err: any) {
      console.error("Error generando PDF formal:", err);
    }
  };

  // Si no hay sesión activa, mostrar portal de acceso seguro con 2FA (PIN)
  if (!usuarioActivo) {
    return (
      <AuthPortal
        onLoginSuccess={(usuario) => {
          setUsuarioActivo(usuario);
          setRolActual(usuario.rol);
        }}
      />
    );
  }

  return (
    <div className={`min-h-screen flex font-sans antialiased selection:bg-blue-100 selection:text-blue-900 transition-colors duration-200 ${
      theme === 'oscuro' ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
    }`}>
      
      {/* Modern Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        variables={variables}
        onOpenVariables={() => setIsVariablesOpen(true)}
        isOpen={sidebarOpen}
        onCloseMobile={() => setSidebarOpen(false)}
        numEmpleados={censusInput.length}
        rolActual={rolActual}
        nombreEmpresa={empresa.nombre_empresa}
        permisos={permisos}
      />

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Executive Header */}
        <Header
          resultados={resultados}
          resumen={resumen}
          variables={variables}
          sensibilidad={sensibilidad}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenUpload={() => setIsUploadOpen(true)}
          onOpenVariables={() => setIsVariablesOpen(true)}
          onOpenCompanyConfig={() => setIsCompanyConfigOpen(true)}
          onOpenSaveStudy={() => setIsSaveStudyOpen(true)}
          onDownloadWord={handleDownloadWord}
          onDownloadStudyPdf={handleDownloadStudyPdf}
          onClearData={handleClearData}
          onOpenMobileApi={() => setIsMobileApiOpen(true)}
          onOpenLoginBrandConfig={() => setIsLoginBrandOpen(true)}
          hasData={censusInput.length > 0}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          rolActual={rolActual}
          onCambiarRol={handleCambiarRolActivo}
          empresa={empresa}
          usuarioActivo={usuarioActivo}
          onCerrarSesion={handleCerrarSesion}
          permisos={permisos}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />

        {/* Content Header (Breadcrumbs & Page Title) */}
        <div className={`px-6 pt-5 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b transition-colors duration-200 ${
          theme === 'oscuro' 
            ? 'border-slate-800 bg-slate-900/90 text-white' 
            : 'border-slate-200/80 bg-white/70 text-slate-900'
        } backdrop-blur-md`}>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              {activeTab === 'dashboard' && (rolActual === 'cliente' ? 'Portal de Carga de Información de Nómina' : 'Cálculo y Valuación Actuarial de Nómina (NIC 19)')}
              {activeTab === 'estudios' && 'Estudios Actuariales Realizados'}
              {activeTab === 'niif' && 'Reportería Contable NIIF & Sensibilidad (NIC 19 § 145)'}
              {activeTab === 'mortality' && 'Tablas de Mortalidad General IESS (Registro Oficial No. 650)'}
              {activeTab === 'users' && 'Gestión de Roles, Permisos y Usuarios del Sistema'}
              {activeTab === 'database' && 'Modelo de Datos PostgreSQL & Backend FastAPI'}
              {activeTab === 'python' && 'Módulo de Funciones en Python (pandas & numpy)'}
              {activeTab === 'methodology' && 'Marco Jurídico & Metodología Actuarial'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeTab === 'estudios'
                ? (rolActual === 'cliente' 
                    ? `Estudios elaborados para ${empresa.nombre_empresa}. Solicite autorización a su actuario para descargar los informes.`
                    : 'Archivo formal de estudios actuariales y bandeja de solicitudes de descarga de clientes.')
                : activeTab === 'mortality' 
                ? 'Modelos Makeham-Gompertz, vigencia jurídica y coeficientes del Art. 218 del Código del Trabajo'
                : activeTab === 'users'
                ? 'Matriz de permisos de vistas y acciones por rol, directorio de usuarios y plantilla oficial Excel'
                : (rolActual === 'cliente'
                    ? 'Suba el archivo de colaboradores solicitado para la realización del estudio actuarial.'
                    : 'Desahucio (Art. 185) y Jubilación Patronal (Art. 216 con límites de SBU en Ecuador)')}
            </p>
          </div>

          <nav className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
            <span className="text-blue-600">Portal</span>
            <span>/</span>
            <span className="text-slate-800 font-semibold">
              {activeTab === 'dashboard' && (rolActual === 'cliente' ? 'Carga Nómina' : 'Nómina')}
              {activeTab === 'estudios' && 'Estudios Actuariales'}
              {activeTab === 'niif' && 'Reportes NIIF'}
              {activeTab === 'mortality' && 'Mortalidad IESS'}
              {activeTab === 'users' && 'Roles & Permisos'}
              {activeTab === 'database' && 'PostgreSQL'}
              {activeTab === 'python' && 'Python'}
              {activeTab === 'methodology' && 'Metodología'}
            </span>
          </nav>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 space-y-5">
          
          {/* TAB 1: DASHBOARD / CARGA DE NÓMINA O VALUACIÓN */}
          {activeTab === 'dashboard' && (
            rolActual === 'cliente' ? (
              // VISTA EXCLUSIVA PARA EL CLIENTE:
              // Si ya subió un archivo, mostrar únicamente el mensaje de agradecimiento y el botón de notificar al actuario.
              // NO sale ningún botón para descargar Word, PDF o Excel del estudio ni la valuación.
              ultimaEntregaCliente ? (
                <ClientConfirmationView
                  entrega={ultimaEntregaCliente}
                  empresa={empresa}
                  onSubirOtra={() => setUltimaEntregaCliente(null)}
                  onVerEstudios={() => setActiveTab('estudios')}
                />
              ) : (
                <EmptyStateDropzone
                  onLoadData={handleLoadData}
                  onOpenVariables={() => setIsVariablesOpen(true)}
                  variables={variables}
                  rolActual={rolActual}
                  nombreEmpresa={empresa.nombre_empresa}
                />
              )
            ) : (
              // VISTA PARA ACTUARIO / ADMINISTRADOR (Dashboard Ejecutivo Moderno Estilo Finnova)
              <FinnovaActuaryDashboard
                resultados={resultados}
                resumen={resumen}
                variables={variables}
                empresa={empresa}
                rolActual={rolActual}
                onOpenUpload={() => setIsUploadOpen(true)}
                onOpenSaveStudy={() => setIsSaveStudyOpen(true)}
                onOpenEmployeeDetail={(emp) => setSelectedEmployee(emp)}
                onExportExcel={() => exportarResultadosAExcel(resultados, resumen, variables, sensibilidad)}
                onOpenLoginBrandConfig={() => setIsLoginBrandOpen(true)}
                onOpenCompanyConfig={() => setIsCompanyConfigOpen(true)}
                onLimpiarDatos={handleClearData}
                theme={theme}
              />
            )
          )}

          {/* TAB: ESTUDIOS ACTUARIALES (SECCIÓN NUEVA SOLICITADA) */}
          {activeTab === 'estudios' && (
            <ActuarialStudiesView
              rolActual={rolActual}
              empresa={empresa}
              usuarioActivo={usuarioActivo}
              onCargarCensoAlMotor={(censo, empresaData) => {
                setCensusInput(censo);
                if (empresaData) {
                  setEmpresa(prev => ({ ...prev, ...empresaData }));
                }
                setActiveTab('dashboard');
              }}
            />
          )}

          {/* Tab 2: Reportería NIIF y Sensibilidad */}
          {activeTab === 'niif' && (
            <NiifReportView
              resultados={resultados}
              resumen={resumen}
              variables={variables}
              sensibilidad={sensibilidad}
            />
          )}

          {/* Tab: Tablas de Mortalidad IESS (Registro Oficial No. 650) */}
          {activeTab === 'mortality' && (
            <MortalityTablesView />
          )}

          {/* Tab: Gestión de Usuarios, Roles y Plantilla Oficial (EXCLUSIVO SUPER ADMIN) */}
          {activeTab === 'users' && (
            <UserManagementView
              rolActual={rolActual}
              onCambiarRol={handleCambiarRolActivo}
              empresa={empresa}
              onPermisosActualizados={() => setPermisosVersion(v => v + 1)}
              onOpenLoginBrandConfig={() => setIsLoginBrandOpen(true)}
            />
          )}

          {/* Tab 3: Base de Datos PostgreSQL y Arquitectura */}
          {activeTab === 'database' && (
            <DatabaseSchemaView />
          )}

          {/* Tab 4: Python Script View */}
          {activeTab === 'python' && (
            <PythonScriptView />
          )}

          {/* Tab 5: Legal & Methodology */}
          {activeTab === 'methodology' && (
            <LegalMethodology />
          )}

        </main>

        {/* Executive Footer */}
        <footer className="bg-white border-t border-slate-200/80 px-6 py-3.5 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>Sistema Valuador Actuarial NIC 19 Ecuador</strong> &copy; 2026 · Código del Trabajo (Art. 185 y 216).
          </div>
          {rolActual !== 'cliente' && (
            <div className="flex items-center gap-3 font-mono text-[11px] text-slate-500">
              <span>i = {(variables.tasa_descuento * 100).toFixed(1)}%</span>
              <span>·</span>
              <span>s = {(variables.tasa_incremento_sal * 100).toFixed(1)}%</span>
              <span>·</span>
              <span>r = {(variables.tasa_rotacion * 100).toFixed(1)}%</span>
              <span>·</span>
              <span>SBU = ${variables.sbu_vigente}</span>
            </div>
          )}
        </footer>

      </div>

      {/* Modales */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onLoadData={handleLoadData}
      />

      <MacroVariablesModal
        isOpen={isVariablesOpen}
        onClose={() => setIsVariablesOpen(false)}
        variables={variables}
        onChangeVariables={setVariables}
      />

      <CompanyConfigModal
        isOpen={isCompanyConfigOpen}
        onClose={() => setIsCompanyConfigOpen(false)}
        empresa={empresa}
        onChangeEmpresa={setEmpresa}
      />

      <EmployeeDetailModal
        empleado={selectedEmployee}
        variables={variables}
        onClose={() => setSelectedEmployee(null)}
      />

      {/* Modal Guardar Estudio Actuarial */}
      <SaveStudyModal
        isOpen={isSaveStudyOpen}
        onClose={() => setIsSaveStudyOpen(false)}
        empresa={empresa}
        resumen={resumen}
        variables={variables}
        censoInput={censusInput}
        onEstudioGuardado={(estudioId) => {
          setActiveTab('estudios');
        }}
      />

      {/* Hub de Conexión Móvil y APIs REST */}
      <MobileApiModal
        isOpen={isMobileApiOpen}
        onClose={() => setIsMobileApiOpen(false)}
      />

      {/* Modal de Personalización de Marca y Login para Administrador */}
      <LoginBrandConfigModal
        isOpen={isLoginBrandOpen}
        onClose={() => setIsLoginBrandOpen(false)}
        onConfigSaved={() => {}}
        onCerrarSesion={handleCerrarSesion}
      />

    </div>
  );
}
