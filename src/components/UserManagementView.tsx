import React, { useState, useRef, useEffect } from 'react';
import { RolUsuario, DatosEmpresaEstudio, InfoUsuario, PermisosRol, ConfiguracionPermisos } from '../types/actuarial';
import { 
  guardarPlantillaPersonalizada, 
  obtenerInfoPlantillaPersonalizada, 
  restablecerPlantillaPorDefecto, 
  descargarPlantillaOficial 
} from '../services/actuarialEngine';
import {
  obtenerUsuarios,
  guardarUsuarios,
  restablecerPinUsuario,
  eliminarUsuarioPorId,
  actualizarRolUsuario,
  obtenerPermisosRoles,
  guardarPermisosRoles,
  restablecerPermisosRoles,
  guardarPermisosPersonalizadosUsuario
} from '../services/authService';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Building, 
  Briefcase, 
  Check, 
  Upload, 
  Download, 
  Trash2, 
  RotateCcw, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  Key,
  Mail,
  User,
  Shield,
  Layers,
  Phone,
  Lock,
  Sliders,
  SlidersHorizontal,
  Save,
  ShieldAlert,
  ChevronRight,
  Settings,
  Palette
} from 'lucide-react';
import { obtenerLoginBrandConfig } from '../services/loginBrandService';

interface UserManagementViewProps {
  rolActual: RolUsuario;
  onCambiarRol: (nuevoRol: RolUsuario) => void;
  empresa: DatosEmpresaEstudio;
  onPermisosActualizados?: () => void;
  onOpenLoginBrandConfig?: () => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  rolActual,
  onCambiarRol,
  empresa,
  onPermisosActualizados,
  onOpenLoginBrandConfig
}) => {
  const [brandConfig, setBrandConfig] = useState(() => obtenerLoginBrandConfig());

  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail) setBrandConfig(e.detail);
      else setBrandConfig(obtenerLoginBrandConfig());
    };
    window.addEventListener('login-brand-config-updated', handleUpdate);
    return () => window.removeEventListener('login-brand-config-updated', handleUpdate);
  }, []);
  // SEGURIDAD: Solo el Super Administrador puede ver y operar este módulo
  if (rolActual !== 'admin') {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center max-w-lg mx-auto my-12 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">Acceso Exclusivo de Super Administrador</h3>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          El rol de <strong>{rolActual === 'actuario' ? 'Perito Actuario' : 'Empresa'}</strong> no tiene autorización para acceder a la gestión de usuarios, roles ni edición de permisos del sistema.
        </p>
        <button
          onClick={() => onCambiarRol('admin')}
          className="mt-5 px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-medium text-xs rounded-xl shadow-xs transition cursor-pointer"
        >
          Iniciar como Super Administrador
        </button>
      </div>
    );
  }

  // Lista de usuarios persistida en authService
  const [usuarios, setUsuarios] = useState<InfoUsuario[]>(() => obtenerUsuarios());

  // Configuración de permisos por rol
  const [permisosConfig, setPermisosConfig] = useState<ConfiguracionPermisos>(() => obtenerPermisosRoles());
  const [rolEditandoPermisos, setRolEditandoPermisos] = useState<RolUsuario>('actuario');
  const [permisosGuardadosMsg, setPermisosGuardadosMsg] = useState<string | null>(null);

  // Modal para nuevo usuario
  const [modalNuevoUsuarioOpen, setModalNuevoUsuarioOpen] = useState(false);
  const [nuevoUsuarioNombre, setNuevoUsuarioNombre] = useState('');
  const [nuevoUsuarioUsername, setNuevoUsuarioUsername] = useState('');
  const [nuevoRuc, setNuevoRuc] = useState('');
  const [nuevoEmail, setNuevoEmail] = useState('');
  const [nuevoCelular, setNuevoCelular] = useState('');
  const [nuevoPassword, setNuevoPassword] = useState('Empresa123*');
  const [nuevoPin, setNuevoPin] = useState('1234');
  const [nuevoRol, setNuevoRol] = useState<RolUsuario>('cliente');
  const [nuevaEmpresa, setNuevaEmpresa] = useState(empresa.nombre_empresa || 'Empresa Evaluada');
  const [formError, setFormError] = useState<string | null>(null);

  // Modal para restablecer PIN
  const [modalResetPinOpen, setModalResetPinOpen] = useState(false);
  const [usuarioResetPin, setUsuarioResetPin] = useState<InfoUsuario | null>(null);
  const [nuevoPinValor, setNuevoPinValor] = useState('');
  const [pinSuccessMsg, setPinSuccessMsg] = useState<string | null>(null);

  // Modal para personalizar permisos específicos de un usuario individual
  const [modalUsuarioPermisosOpen, setModalUsuarioPermisosOpen] = useState(false);
  const [usuarioPersonalizando, setUsuarioPersonalizando] = useState<InfoUsuario | null>(null);
  const [usuarioPermisosDraft, setUsuarioPermisosDraft] = useState<PermisosRol | null>(null);
  const [usaPermisosPersonalizados, setUsaPermisosPersonalizados] = useState(false);

  // Estado de la plantilla personalizada
  const [plantillaInfo, setPlantillaInfo] = useState<{ nombre: string; fecha: string; tamanioKb: number } | null>(
    () => obtenerInfoPlantillaPersonalizada()
  );
  const [plantillaSuccessMsg, setPlantillaSuccessMsg] = useState<string | null>(null);
  const fileTemplateRef = useRef<HTMLInputElement>(null);

  const recargarUsuarios = () => {
    setUsuarios([...obtenerUsuarios()]);
  };

  const handleCrearUsuario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoUsuarioNombre.trim()) {
      setFormError('El nombre completo o razón social es requerido.');
      return;
    }
    if (!nuevoUsuarioUsername.trim()) {
      setFormError('El identificador de usuario es requerido.');
      return;
    }
    if (!nuevoEmail.trim() || !nuevoEmail.includes('@')) {
      setFormError('Ingrese un correo electrónico válido.');
      return;
    }
    if (!nuevoPin.trim() || nuevoPin.length < 4 || !/^\d+$/.test(nuevoPin)) {
      setFormError('El PIN debe contener entre 4 y 6 dígitos numéricos.');
      return;
    }

    const nuevo: InfoUsuario = {
      id: `usr-${Date.now()}`,
      usuario: nuevoUsuarioUsername.trim().toLowerCase(),
      nombre: nuevoUsuarioNombre.trim(),
      razonSocial: nuevoUsuarioNombre.trim(),
      ruc: nuevoRuc.trim() || undefined,
      email: nuevoEmail.trim().toLowerCase(),
      celular: nuevoCelular.trim() || 'No registrado',
      password: nuevoPassword || 'Empresa123*',
      pin: nuevoPin.trim(),
      rol: nuevoRol,
      empresaAsignada: nuevaEmpresa.trim() || 'Empresa General',
      estado: 'activo',
      fechaCreacion: new Date().toLocaleDateString('es-EC')
    };

    const lista = obtenerUsuarios();
    lista.push(nuevo);
    guardarUsuarios(lista);
    recargarUsuarios();

    setModalNuevoUsuarioOpen(false);
    setNuevoUsuarioNombre('');
    setNuevoUsuarioUsername('');
    setNuevoRuc('');
    setNuevoEmail('');
    setNuevoCelular('');
    setFormError(null);
  };

  const handleCambiarRolUsuario = (id: string, nRol: RolUsuario) => {
    actualizarRolUsuario(id, nRol);
    recargarUsuarios();
    if (onPermisosActualizados) onPermisosActualizados();
  };

  const handleToggleEstado = (id: string) => {
    const lista = obtenerUsuarios().map(u => 
      u.id === id ? { ...u, estado: u.estado === 'activo' ? 'inactivo' as const : 'activo' as const } : u
    );
    guardarUsuarios(lista);
    recargarUsuarios();
  };

  const handleEliminarUsuario = (id: string) => {
    if (confirm('¿Está seguro de eliminar este usuario del portal?')) {
      eliminarUsuarioPorId(id);
      recargarUsuarios();
    }
  };

  const handleAbrirResetPin = (u: InfoUsuario) => {
    setUsuarioResetPin(u);
    setNuevoPinValor(u.pin || '1234');
    setPinSuccessMsg(null);
    setModalResetPinOpen(true);
  };

  const handleGuardarNuevoPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioResetPin) return;

    if (!nuevoPinValor.trim() || nuevoPinValor.length < 4 || !/^\d+$/.test(nuevoPinValor)) {
      alert('El nuevo PIN debe tener entre 4 y 6 dígitos numéricos.');
      return;
    }

    restablecerPinUsuario(usuarioResetPin.id, nuevoPinValor.trim());
    recargarUsuarios();
    setPinSuccessMsg(`¡PIN de ${usuarioResetPin.nombre} actualizado a "${nuevoPinValor.trim()}" con éxito! Notifique al cliente.`);
    setTimeout(() => {
      setModalResetPinOpen(false);
      setPinSuccessMsg(null);
    }, 1800);
  };

  // Manejo de edición de permisos por rol
  const handleToggleModuloRol = (rol: RolUsuario, moduloKey: keyof PermisosRol['modulos']) => {
    // Protección: users nunca puede ser activado para actuario ni cliente
    if (moduloKey === 'users' && rol !== 'admin') {
      alert('El módulo de Usuarios y Roles es exclusivo del Super Administrador.');
      return;
    }

    setPermisosConfig(prev => ({
      ...prev,
      [rol]: {
        ...prev[rol],
        modulos: {
          ...prev[rol].modulos,
          [moduloKey]: !prev[rol].modulos[moduloKey]
        }
      }
    }));
  };

  const handleToggleAccionRol = (rol: RolUsuario, accionKey: keyof PermisosRol['acciones']) => {
    if (accionKey === 'gestionarUsuarios' && rol !== 'admin') {
      alert('La gestión de usuarios es una potestad exclusiva del Super Administrador.');
      return;
    }

    setPermisosConfig(prev => ({
      ...prev,
      [rol]: {
        ...prev[rol],
        acciones: {
          ...prev[rol].acciones,
          [accionKey]: !prev[rol].acciones[accionKey]
        }
      }
    }));
  };

  const handleGuardarPermisosRoles = () => {
    guardarPermisosRoles(permisosConfig);
    setPermisosGuardadosMsg('¡Configuración de permisos por rol guardada exitosamente! Se aplica inmediatamente.');
    if (onPermisosActualizados) onPermisosActualizados();
    setTimeout(() => {
      setPermisosGuardadosMsg(null);
    }, 2500);
  };

  const handleRestablecerPermisosRoles = () => {
    if (confirm('¿Restablecer los permisos de todos los roles a sus valores predeterminados?')) {
      const def = restablecerPermisosRoles();
      setPermisosConfig(def);
      setPermisosGuardadosMsg('Se restablecieron los permisos recomendados del sistema.');
      if (onPermisosActualizados) onPermisosActualizados();
      setTimeout(() => setPermisosGuardadosMsg(null), 2500);
    }
  };

  // Manejo de edición de permisos específicos de un usuario individual
  const handleAbrirPermisosUsuario = (u: InfoUsuario) => {
    setUsuarioPersonalizando(u);
    const baseRol = permisosConfig[u.rol];
    const custom = u.permisosPersonalizados;

    setUsaPermisosPersonalizados(!!custom);
    setUsuarioPermisosDraft({
      modulos: {
        ...baseRol.modulos,
        ...(custom?.modulos || {})
      },
      acciones: {
        ...baseRol.acciones,
        ...(custom?.acciones || {})
      }
    });
    setModalUsuarioPermisosOpen(true);
  };

  const handleGuardarPermisosUsuario = () => {
    if (!usuarioPersonalizando) return;

    if (!usaPermisosPersonalizados) {
      // Revertir a permisos del rol
      guardarPermisosPersonalizadosUsuario(usuarioPersonalizando.id, undefined);
    } else if (usuarioPermisosDraft) {
      guardarPermisosPersonalizadosUsuario(usuarioPersonalizando.id, usuarioPermisosDraft);
    }

    recargarUsuarios();
    setModalUsuarioPermisosOpen(false);
    if (onPermisosActualizados) onPermisosActualizados();
  };

  // Subir plantilla personalizada del Super Administrador
  const handleUploadCustomTemplate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      alert('Por favor seleccione un archivo Excel válido (.xlsx o .xls).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result as ArrayBuffer;
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64 = window.btoa(binary);
        guardarPlantillaPersonalizada(base64, file.name, file.size);
        setPlantillaInfo(obtenerInfoPlantillaPersonalizada());
        setPlantillaSuccessMsg(`¡Plantilla "${file.name}" cargada como Formato Oficial con éxito! Ahora todos los clientes descargarán este formato.`);
      } catch (err: any) {
        alert('Error al guardar la plantilla: ' + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  const handleResetTemplate = () => {
    if (confirm('¿Restablecer la plantilla oficial a la versión estándar del sistema?')) {
      restablecerPlantillaPorDefecto();
      setPlantillaInfo(null);
      setPlantillaSuccessMsg('Se ha restablecido la plantilla oficial al formato predeterminado.');
    }
  };

  const totalAdmins = usuarios.filter(u => u.rol === 'admin').length;
  const totalActuarios = usuarios.filter(u => u.rol === 'actuario').length;
  const totalClientes = usuarios.filter(u => u.rol === 'cliente').length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-sans">
      
      {/* Encabezado del Módulo */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200/80 flex items-center justify-center text-purple-700 shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  Gestión de Roles, Permisos y Usuarios
                </h2>
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-purple-100 text-purple-800">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Configure qué módulos y acciones puede ver y realizar cada rol o usuario individual en la plataforma.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenLoginBrandConfig && (
              <button
                type="button"
                onClick={onOpenLoginBrandConfig}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold text-xs shadow-xs transition-all cursor-pointer"
                title="Personalizar imagen de fondo, degradado y títulos de la pantalla de Login"
              >
                <Palette className="w-4 h-4 text-purple-600" />
                <span>Personalizar Login</span>
              </button>
            )}

            <button
              onClick={() => setModalNuevoUsuarioOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-medium text-xs shadow-xs transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Añadir Nuevo Usuario</span>
            </button>
          </div>
        </div>

        {/* Tarjetas de Estadísticas de Usuarios */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-100">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Total Cuentas</span>
            <span className="text-xl font-bold font-mono text-slate-900 mt-1 block">{usuarios.length}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200/70">
            <span className="text-[11px] font-medium text-purple-700 uppercase tracking-wider block">Super Admins</span>
            <span className="text-xl font-bold font-mono text-purple-900 mt-1 block">{totalAdmins}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/70">
            <span className="text-[11px] font-medium text-emerald-700 uppercase tracking-wider block">Peritos Actuarios</span>
            <span className="text-xl font-bold font-mono text-emerald-900 mt-1 block">{totalActuarios}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/70">
            <span className="text-[11px] font-medium text-blue-700 uppercase tracking-wider block">Empresas / RRHH</span>
            <span className="text-xl font-bold font-mono text-blue-900 mt-1 block">{totalClientes}</span>
          </div>
        </div>
      </div>

      {/* SECCIÓN 1: EDITOR DE PERMISOS Y VISTAS POR ROL (SOLICITUD EXPLÍCITA) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-purple-700" />
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Editor de Roles y Vistas del Sistema
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Active o desactive qué módulos y funciones tiene permitido visualizar y ejecutar cada perfil de usuario.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRestablecerPermisosRoles}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Valores Recomendados</span>
            </button>
            <button
              onClick={handleGuardarPermisosRoles}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Guardar Permisos</span>
            </button>
          </div>
        </div>

        {permisosGuardadosMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{permisosGuardadosMsg}</span>
            </div>
            <button onClick={() => setPermisosGuardadosMsg(null)} className="text-emerald-700 font-bold ml-2">×</button>
          </div>
        )}

        {/* Selector de Rol a Editar */}
        <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-xl">
          <button
            onClick={() => setRolEditandoPermisos('actuario')}
            className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              rolEditandoPermisos === 'actuario'
                ? 'bg-white text-emerald-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
            <span>Perito Actuario</span>
          </button>

          <button
            onClick={() => setRolEditandoPermisos('cliente')}
            className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              rolEditandoPermisos === 'cliente'
                ? 'bg-white text-blue-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building className="w-3.5 h-3.5 text-blue-600" />
            <span>Empresa / RRHH</span>
          </button>

          <button
            onClick={() => setRolEditandoPermisos('admin')}
            className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              rolEditandoPermisos === 'admin'
                ? 'bg-white text-purple-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
            <span>Super Administrador</span>
          </button>
        </div>

        {/* Panel de Configuración del Rol Seleccionado */}
        {(() => {
          const cfg = permisosConfig[rolEditandoPermisos];
          return (
            <div className="space-y-6 pt-2">
              
              {/* Categoría A: Módulos / Vistas Visibles en el Menú */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-purple-600" />
                    <span>Módulos y Pantallas Visibles en el Menú</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Control de visibilidad en el menú lateral
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  
                  {/* Dashboard */}
                  <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cfg.modulos.dashboard}
                      onChange={() => handleToggleModuloRol(rolEditandoPermisos, 'dashboard')}
                      className="mt-0.5 rounded text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-slate-900">Cálculo y Valuación de Nómina</div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Tablero interactivo de provisiones NIC 19 (Desahucio Art. 185 y Jubilación Art. 216).
                      </p>
                    </div>
                  </label>

                  {/* Estudios Actuariales */}
                  <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cfg.modulos.estudios}
                      onChange={() => handleToggleModuloRol(rolEditandoPermisos, 'estudios')}
                      className="mt-0.5 rounded text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-slate-900">Estudios Actuariales Guardados</div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Historial de estudios formalizados, recepción de nóminas y control de descargas para clientes.
                      </p>
                    </div>
                  </label>

                  {/* NIIF */}
                  <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cfg.modulos.niif}
                      onChange={() => handleToggleModuloRol(rolEditandoPermisos, 'niif')}
                      className="mt-0.5 rounded text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-slate-900">Reportería Contable NIIF & Sensibilidad</div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Conciliación DBO, CSC, Costo de Interés y análisis de sensibilidad ±1% (NIC 19 § 145).
                      </p>
                    </div>
                  </label>

                  {/* Tablas Mortalidad */}
                  <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cfg.modulos.mortality}
                      onChange={() => handleToggleModuloRol(rolEditandoPermisos, 'mortality')}
                      className="mt-0.5 rounded text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-slate-900">Tablas de Mortalidad IESS (RO 650)</div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Modelos biométricos Makeham-Gompertz y coeficientes del Art. 218 del Código del Trabajo.
                      </p>
                    </div>
                  </label>

                  {/* Metodología */}
                  <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cfg.modulos.methodology}
                      onChange={() => handleToggleModuloRol(rolEditandoPermisos, 'methodology')}
                      className="mt-0.5 rounded text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-slate-900">Marco Jurídico & Metodología Actuarial</div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Normativa SCVS, Código del Trabajo, créditos por unidad proyectada y jurisprudencia.
                      </p>
                    </div>
                  </label>

                  {/* Base de Datos */}
                  <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cfg.modulos.database}
                      onChange={() => handleToggleModuloRol(rolEditandoPermisos, 'database')}
                      className="mt-0.5 rounded text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-slate-900">Modelo PostgreSQL & Arquitectura FastAPI</div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Esquema DDL relacional, tablas de auditoría y endpoints REST.
                      </p>
                    </div>
                  </label>

                  {/* Python */}
                  <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cfg.modulos.python}
                      onChange={() => handleToggleModuloRol(rolEditandoPermisos, 'python')}
                      className="mt-0.5 rounded text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-slate-900">Código Python (Pandas & Numpy)</div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Scripts actuariales independientes y vectorización matemática.
                      </p>
                    </div>
                  </label>

                  {/* Users (Bloqueado exclusivamente a Super Admin) */}
                  <div className={`flex items-start gap-3 p-3.5 rounded-xl border ${
                    rolEditandoPermisos === 'admin' 
                      ? 'border-purple-200 bg-purple-50/30' 
                      : 'border-slate-200 bg-slate-100 opacity-60 cursor-not-allowed'
                  }`}>
                    <input
                      type="checkbox"
                      disabled={rolEditandoPermisos !== 'admin'}
                      checked={cfg.modulos.users}
                      onChange={() => handleToggleModuloRol(rolEditandoPermisos, 'users')}
                      className="mt-0.5 rounded text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-slate-900 flex items-center justify-between">
                        <span>Gestión de Roles, Usuarios y Plantilla Oficial</span>
                        {rolEditandoPermisos !== 'admin' && (
                          <span className="text-[10px] text-rose-600 font-bold">Bloqueado (Solo Admin)</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {rolEditandoPermisos === 'admin' 
                          ? 'Control absoluto del directorio de usuarios, asignación de roles y subida de plantilla.'
                          : 'El Perito Actuario y la Empresa no pueden acceder bajo ninguna circunstancia a este módulo.'}
                      </p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Categoría B: Acciones y Capacidades Operativas */}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-purple-600" />
                    <span>Acciones y Capacidades Operativas</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Permisos funcionales dentro del sistema
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  
                  {/* Editar variables */}
                  <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cfg.acciones.editarVariables}
                      onChange={() => handleToggleAccionRol(rolEditandoPermisos, 'editarVariables')}
                      className="mt-0.5 rounded text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-slate-900">Editar Variables Macroeconómicas</div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Modificar tasa de descuento (i), incremento salarial (s), rotación (r) y SBU.
                      </p>
                    </div>
                  </label>

                  {/* Editar empresa */}
                  <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cfg.acciones.editarEmpresa}
                      onChange={() => handleToggleAccionRol(rolEditandoPermisos, 'editarEmpresa')}
                      className="mt-0.5 rounded text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-slate-900">Editar Parámetros de la Empresa</div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Ajustar RUC, razón social, fecha de constitución, objeto social y datos del perito.
                      </p>
                    </div>
                  </label>

                  {/* Subir nómina */}
                  <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cfg.acciones.subirNomina}
                      onChange={() => handleToggleAccionRol(rolEditandoPermisos, 'subirNomina')}
                      className="mt-0.5 rounded text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-slate-900">Cargar Nómina de Colaboradores</div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Permitir subir archivos Excel (.xlsx) con los datos del personal.
                      </p>
                    </div>
                  </label>

                  {/* Descargar Word */}
                  <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cfg.acciones.descargarWord}
                      onChange={() => handleToggleAccionRol(rolEditandoPermisos, 'descargarWord')}
                      className="mt-0.5 rounded text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-slate-900">Descargar Estudio Word (.docx)</div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Generar documento pericial formal editable con memoria de cálculo completa.
                      </p>
                    </div>
                  </label>

                  {/* Descargar PDF */}
                  <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cfg.acciones.descargarPdf}
                      onChange={() => handleToggleAccionRol(rolEditandoPermisos, 'descargarPdf')}
                      className="mt-0.5 rounded text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-slate-900">Descargar Estudio Actuarial en PDF</div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Generar informe foliado de 22 páginas para la SCVS y SRI.
                      </p>
                    </div>
                  </label>

                  {/* Exportar Excel */}
                  <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cfg.acciones.exportarExcel}
                      onChange={() => handleToggleAccionRol(rolEditandoPermisos, 'exportarExcel')}
                      className="mt-0.5 rounded text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-slate-900">Exportar Cálculos a Excel (.xlsx)</div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Descargar libro de trabajo con detalle de nómina, resumen NIIF y sensibilidad.
                      </p>
                    </div>
                  </label>

                </div>
              </div>

            </div>
          );
        })()}

      </div>

      {/* SECCIÓN 2: Configurar / Subir Plantilla Oficial de Nómina (Exclusivo Super Admin) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Formato Oficial de Información Actuarial (.xlsx)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Suba su propio archivo de plantilla Excel para que todas las empresas y clientes descarguen este formato.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fileTemplateRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs shadow-xs transition cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Subir Mi Propia Plantilla</span>
            </button>
            <input
              type="file"
              ref={fileTemplateRef}
              onChange={handleUploadCustomTemplate}
              accept=".xlsx,.xls"
              className="hidden"
            />

            <button
              onClick={descargarPlantillaOficial}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition cursor-pointer"
              title="Descargar la plantilla activa para verificarla"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              <span>Descargar Activa</span>
            </button>

            {plantillaInfo && (
              <button
                onClick={handleResetTemplate}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-medium transition cursor-pointer"
                title="Volver a la plantilla estándar predeterminada"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restablecer</span>
              </button>
            )}
          </div>
        </div>

        {plantillaSuccessMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{plantillaSuccessMsg}</span>
            </div>
            <button onClick={() => setPlantillaSuccessMsg(null)} className="text-emerald-700 font-bold ml-2">×</button>
          </div>
        )}

        {/* Estado actual de la plantilla */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Estado de la Plantilla:</span>
              {plantillaInfo ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                  <Check className="w-3 h-3" />
                  Personalizada por Super Administrador
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-200 text-slate-700">
                  Plantilla Estándar del Sistema
                </span>
              )}
            </div>
            {plantillaInfo ? (
              <p className="text-slate-600 text-[11px]">
                Archivo: <strong className="text-slate-900">{plantillaInfo.nombre}</strong> ({plantillaInfo.tamanioKb} KB) • Subida el {plantillaInfo.fecha}.
              </p>
            ) : (
              <p className="text-slate-500 text-[11px]">
                Formato predeterminado de nómina aplicable al cálculo actuarial en Ecuador (Art. 185 y 216).
              </p>
            )}
          </div>

          <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200 max-w-sm">
            💡 <strong>Compatibilidad inteligente:</strong> El motor lee automáticamente columnas de Cédula, Nombres, Sexo, Fechas o Edad/Antigüedad, y Sueldo Total.
          </div>
        </div>
      </div>

      {/* SECCIÓN: Personalización Institucional de Marca, Login y Dashboard (Exclusivo Administrador) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#5b52f9] to-[#7c3aed] text-white flex items-center justify-center shadow-xs shrink-0">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Personalización de Marca, Login y Dashboard
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">
                  Exclusivo Super Admin
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure la imagen de fondo, colores degradados, monograma institucional y todos los textos del portal de acceso.
              </p>
            </div>
          </div>

          {onOpenLoginBrandConfig && (
            <button
              type="button"
              onClick={onOpenLoginBrandConfig}
              className="px-4 py-2 rounded-xl bg-[#5b52f9] hover:bg-[#4f46e5] text-white font-bold text-xs shadow-md shadow-[#5b52f9]/20 transition cursor-pointer flex items-center gap-2 shrink-0"
            >
              <Palette className="w-4 h-4" />
              <span>Editar Fondo, Colores y Textos</span>
            </button>
          )}
        </div>

        {/* Resumen de la Configuración Activa */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Fondo de Login Activo</span>
            <span className="text-xs font-bold text-slate-900 mt-1 block capitalize">
              {brandConfig.tipoFondo === 'ambos' ? 'Híbrido (Degradado + Imagen)' : brandConfig.tipoFondo}
            </span>
            <span className="text-[10px] text-slate-500 block truncate mt-0.5">
              Degradado: {brandConfig.estiloDegradado}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Monograma / Marca Banner</span>
            <span className="text-xs font-bold text-slate-900 mt-1 block truncate">
              {brandConfig.tituloMarca || 'INFINITY ACTUARIAL'}
            </span>
            <span className="text-[10px] text-slate-500 block truncate mt-0.5">
              Badge: {brandConfig.badgeSuperior || 'Certificación NIC 19'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Título Formulario</span>
            <span className="text-xs font-bold text-slate-900 mt-1 block truncate">
              {brandConfig.textoBienvenida || 'WELCOME TO'} {brandConfig.tituloFormulario || 'VALUADOR ACTUARIAL'}
            </span>
            <span className="text-[10px] text-slate-500 block truncate mt-0.5">
              Botón: {brandConfig.textoBotonLogin || 'SIGN IN'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Título en Dashboard</span>
            <span className="text-xs font-bold text-slate-900 mt-1 block truncate">
              {brandConfig.tituloDashboard || 'Valuador Actuarial NIC 19'}
            </span>
            <span className="text-[10px] text-slate-500 block truncate mt-0.5">
              Subtítulo: Código del Trabajo
            </span>
          </div>
        </div>
      </div>

      {/* SECCIÓN 3: Directorio de Usuarios y Permisos Individuales */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-700" />
              Directorio de Cuentas y Permisos por Usuario
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Asigne roles, personalice permisos específicos por usuario y restablezca el PIN en caso de olvido.
            </p>
          </div>

          <div className="text-xs text-slate-500">
            {usuarios.length} cuentas registradas
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Usuario / Nombre</th>
                <th className="py-3 px-4">Contacto</th>
                <th className="py-3 px-4">Rol Asignado</th>
                <th className="py-3 px-4">Empresa</th>
                <th className="py-3 px-4 text-center">Permisos Vistas</th>
                <th className="py-3 px-4 text-center">PIN (2FA)</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usuarios.map(u => {
                const tieneCustom = !!u.permisosPersonalizados;
                return (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-[11px] ${
                          u.rol === 'admin' ? 'bg-purple-100 text-purple-800' :
                          u.rol === 'actuario' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {u.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{u.nombre}</div>
                          <div className="text-[10px] text-slate-400 font-mono">@{u.usuario}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                      <div className="font-mono">{u.email}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" />
                        <span>{u.celular || 'S/N'}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        value={u.rol}
                        onChange={e => handleCambiarRolUsuario(u.id, e.target.value as RolUsuario)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                          u.rol === 'admin' ? 'bg-purple-50 text-purple-900 border-purple-200' :
                          u.rol === 'actuario' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' :
                          'bg-blue-50 text-blue-900 border-blue-200'
                        }`}
                      >
                        <option value="admin">Super Administrador</option>
                        <option value="actuario">Perito Actuario</option>
                        <option value="cliente">Empresa / RRHH (Cliente)</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-4 text-slate-700">
                      {u.empresaAsignada}
                    </td>

                    {/* Permisos de vistas: Personalizado o Estándar */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleAbrirPermisosUsuario(u)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer ${
                          tieneCustom
                            ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                        title="Configurar qué módulos específicos ve este usuario"
                      >
                        <Settings className="w-3 h-3" />
                        <span>{tieneCustom ? 'Personalizado' : 'Estándar del Rol'}</span>
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleAbrirResetPin(u)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition cursor-pointer"
                        title="Restablecer PIN de seguridad si el usuario lo olvidó"
                      >
                        <Key className="w-3 h-3 text-amber-600" />
                        <span>Cambiar PIN</span>
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleEstado(u.id)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold cursor-pointer transition ${
                          u.estado === 'activo'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {u.estado === 'activo' ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onCambiarRol(u.rol)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition cursor-pointer"
                          title="Simular navegación con este rol"
                        >
                          Simular
                        </button>
                        {u.id !== 'usr-admin-1' && (
                          <button
                            onClick={() => handleEliminarUsuario(u.id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Eliminar usuario"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Personalizar Permisos de un Usuario Específico */}
      {modalUsuarioPermisosOpen && usuarioPersonalizando && usuarioPermisosDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  Personalizar Vistas y Permisos para @{usuarioPersonalizando.usuario}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {usuarioPersonalizando.nombre} ({usuarioPersonalizando.rol})
                </p>
              </div>
              <button 
                onClick={() => setModalUsuarioPermisosOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 text-base cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
              
              <div className="p-3 bg-purple-50 border border-purple-200/80 rounded-xl text-purple-950 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-xs">Modalidad de Permisos</div>
                  <div className="text-[11px] text-purple-800">
                    {usaPermisosPersonalizados 
                      ? 'Este usuario tiene permisos propios independientes del rol'
                      : 'Este usuario sigue los permisos predeterminados de su rol'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setUsaPermisosPersonalizados(!usaPermisosPersonalizados)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    usaPermisosPersonalizados 
                      ? 'bg-purple-700 text-white shadow-xs' 
                      : 'bg-white text-purple-900 border border-purple-300'
                  }`}
                >
                  {usaPermisosPersonalizados ? 'Modo Personalizado Activo' : 'Habilitar Personalizado'}
                </button>
              </div>

              {usaPermisosPersonalizados && (
                <div className="space-y-4 pt-2">
                  <div>
                    <h5 className="font-semibold text-slate-700 uppercase tracking-wider text-[10px] mb-2">
                      Módulos Visibles para este usuario
                    </h5>
                    <div className="space-y-2">
                      {Object.keys(usuarioPermisosDraft.modulos).map(modKey => {
                        const mKey = modKey as keyof PermisosRol['modulos'];
                        // Users solo si es admin
                        if (mKey === 'users' && usuarioPersonalizando.rol !== 'admin') return null;

                        return (
                          <label key={mKey} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                            <span className="font-medium text-slate-800">
                              {mKey === 'dashboard' && 'Cálculo de Nómina'}
                              {mKey === 'estudios' && 'Estudios Actuariales Guardados'}
                              {mKey === 'niif' && 'Reportería NIIF & Sensibilidad'}
                              {mKey === 'mortality' && 'Tablas Mortalidad IESS'}
                              {mKey === 'methodology' && 'Marco Jurídico & Metodología'}
                              {mKey === 'database' && 'PostgreSQL & Backend'}
                              {mKey === 'python' && 'Script Python Pandas'}
                              {mKey === 'users' && 'Gestión de Usuarios (Admin)'}
                            </span>
                            <input
                              type="checkbox"
                              checked={usuarioPermisosDraft.modulos[mKey]}
                              onChange={() => {
                                setUsuarioPermisosDraft(prev => prev ? ({
                                  ...prev,
                                  modulos: {
                                    ...prev.modulos,
                                    [mKey]: !prev.modulos[mKey]
                                  }
                                }) : null);
                              }}
                              className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                            />
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <h5 className="font-semibold text-slate-700 uppercase tracking-wider text-[10px] mb-2">
                      Acciones Operativas
                    </h5>
                    <div className="space-y-2">
                      {Object.keys(usuarioPermisosDraft.acciones).map(accKey => {
                        const aKey = accKey as keyof PermisosRol['acciones'];
                        if ((aKey === 'gestionarUsuarios' || aKey === 'personalizarPlantilla') && usuarioPersonalizando.rol !== 'admin') return null;

                        return (
                          <label key={aKey} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                            <span className="font-medium text-slate-800">
                              {aKey === 'editarVariables' && 'Editar Variables Macroeconómicas'}
                              {aKey === 'editarEmpresa' && 'Editar Parámetros de la Empresa'}
                              {aKey === 'subirNomina' && 'Subir Nómina de Empleados'}
                              {aKey === 'descargarWord' && 'Descargar Estudio en Word (.docx)'}
                              {aKey === 'descargarPdf' && 'Descargar Estudio en PDF'}
                              {aKey === 'exportarExcel' && 'Exportar Libro Excel (.xlsx)'}
                              {aKey === 'personalizarPlantilla' && 'Personalizar Plantilla Oficial'}
                              {aKey === 'gestionarUsuarios' && 'Gestionar Usuarios'}
                            </span>
                            <input
                              type="checkbox"
                              checked={usuarioPermisosDraft.acciones[aKey]}
                              onChange={() => {
                                setUsuarioPermisosDraft(prev => prev ? ({
                                  ...prev,
                                  acciones: {
                                    ...prev.acciones,
                                    [aKey]: !prev.acciones[aKey]
                                  }
                                }) : null);
                              }}
                              className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                            />
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

            </div>

            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalUsuarioPermisosOpen(false)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-medium cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleGuardarPermisosUsuario}
                className="px-4 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                Guardar Permisos de Usuario
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Añadir Nuevo Usuario */}
      {modalNuevoUsuarioOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-700" />
                <h4 className="font-bold text-sm text-slate-900">Añadir Nuevo Usuario</h4>
              </div>
              <button 
                onClick={() => setModalNuevoUsuarioOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCrearUsuario} className="p-6 space-y-3.5 text-xs text-slate-700">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-800 mb-1">Nombre Completo o Razón Social:</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Juan Pérez / Empresa Cliente S.A."
                  value={nuevoUsuarioNombre}
                  onChange={e => setNuevoUsuarioNombre(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-800 mb-1">Usuario (Login):</label>
                  <input
                    type="text"
                    required
                    placeholder="usuario123"
                    value={nuevoUsuarioUsername}
                    onChange={e => setNuevoUsuarioUsername(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-800 mb-1">Rol a Asignar:</label>
                  <select
                    value={nuevoRol}
                    onChange={e => setNuevoRol(e.target.value as RolUsuario)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 bg-white cursor-pointer"
                  >
                    <option value="cliente">Empresa / RRHH (Cliente)</option>
                    <option value="actuario">Perito Actuario</option>
                    <option value="admin">Super Administrador</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-800 mb-1">Correo Electrónico:</label>
                <input
                  type="email"
                  required
                  placeholder="correo@empresa.com"
                  value={nuevoEmail}
                  onChange={e => setNuevoEmail(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-800 mb-1">Número Celular:</label>
                  <input
                    type="tel"
                    placeholder="0991234567"
                    value={nuevoCelular}
                    onChange={e => setNuevoCelular(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-800 mb-1">PIN 2FA (4-6 dígitos):</label>
                  <input
                    type="password"
                    maxLength={6}
                    required
                    placeholder="1234"
                    value={nuevoPin}
                    onChange={e => setNuevoPin(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-mono font-bold tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-800 mb-1">Contraseña Inicial:</label>
                <input
                  type="text"
                  required
                  value={nuevoPassword}
                  onChange={e => setNuevoPassword(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-800 mb-1">Empresa / Razón Social:</label>
                  <input
                    type="text"
                    value={nuevaEmpresa}
                    onChange={e => setNuevaEmpresa(e.target.value)}
                    placeholder="Empresa Evaluada S.A."
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-800 mb-1">RUC de la Empresa:</label>
                  <input
                    type="text"
                    maxLength={13}
                    value={nuevoRuc}
                    onChange={e => setNuevoRuc(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="1790000000001"
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 bg-white"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalNuevoUsuarioOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Guardar Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Restablecer PIN del Usuario */}
      {modalResetPinOpen && usuarioResetPin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-600" />
                <h4 className="font-bold text-sm text-slate-900">Restablecer PIN de Doble Factor</h4>
              </div>
              <button 
                onClick={() => setModalResetPinOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGuardarNuevoPin} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="font-semibold text-slate-900">{usuarioResetPin.nombre}</div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">@{usuarioResetPin.usuario} • {usuarioResetPin.email}</div>
              </div>

              {pinSuccessMsg ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{pinSuccessMsg}</span>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-800 mb-1">
                      Nuevo PIN de Seguridad (4 a 6 dígitos numéricos):
                    </label>
                    <input
                      type="text"
                      autoFocus
                      maxLength={6}
                      required
                      placeholder="ej. 5678"
                      value={nuevoPinValor}
                      onChange={e => setNuevoPinValor(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full p-3 border border-slate-200 rounded-xl text-center text-lg font-mono font-bold tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 bg-white"
                    />
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Notifique a la empresa este nuevo PIN para que pueda completar su inicio de sesión en el portal.
                  </p>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setModalResetPinOpen(false)}
                      className="px-3.5 py-1.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-medium cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
                    >
                      Actualizar PIN
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
