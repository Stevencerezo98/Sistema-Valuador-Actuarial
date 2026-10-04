import { InfoUsuario, RolUsuario, PermisosRol, ConfiguracionPermisos } from '../types/actuarial';

const STORAGE_USERS_KEY = 'SISTEMA_ACTUARIAL_USUARIOS_V2';
const STORAGE_SESSION_KEY = 'SISTEMA_ACTUARIAL_SESION_ACTIVA_V2';
const STORAGE_PERMISSIONS_KEY = 'SISTEMA_ACTUARIAL_PERMISOS_ROLES_V2';

// Configuración predeterminada de permisos por rol
export const DEFAULT_PERMISOS_ROLES: ConfiguracionPermisos = {
  admin: {
    modulos: {
      dashboard: true,
      estudios: true,
      niif: true,
      mortality: true,
      methodology: true,
      database: true,
      python: true,
      users: true
    },
    acciones: {
      editarVariables: true,
      editarEmpresa: true,
      subirNomina: true,
      descargarWord: true,
      descargarPdf: true,
      exportarExcel: true,
      personalizarPlantilla: true,
      gestionarUsuarios: true
    }
  },
  actuario: {
    modulos: {
      dashboard: true,
      estudios: true,
      niif: true,
      mortality: true,
      methodology: true,
      database: true,
      python: true,
      users: false // PERITO ACTUARIO NO TIENE ACCESO A ROLES Y USUARIOS
    },
    acciones: {
      editarVariables: true,
      editarEmpresa: true,
      subirNomina: true,
      descargarWord: true,
      descargarPdf: true,
      exportarExcel: true,
      personalizarPlantilla: false,
      gestionarUsuarios: false
    }
  },
  cliente: {
    modulos: {
      dashboard: true,
      estudios: true, // Sección Estudios Actuariales para consultar historial
      niif: false,
      mortality: false,
      methodology: false,
      database: false,
      python: false,
      users: false
    },
    acciones: {
      editarVariables: false, // Cliente no edita variables técnicas
      editarEmpresa: false,
      subirNomina: true,
      descargarWord: false,   // Al cliente NO debe salirle ningún botón para descargar Word
      descargarPdf: false,    // Al cliente NO debe salirle ningún botón para descargar PDF
      exportarExcel: false,   // Al cliente NO debe salirle ningún botón para descargar Excel
      personalizarPlantilla: false,
      gestionarUsuarios: false
    }
  }
};

export function obtenerPermisosRoles(): ConfiguracionPermisos {
  try {
    const raw = localStorage.getItem(STORAGE_PERMISSIONS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Asegurarse de que perito actuario no tenga users
      if (parsed.actuario && parsed.actuario.modulos) {
        parsed.actuario.modulos.users = false;
        parsed.actuario.acciones.gestionarUsuarios = false;
      }
      return parsed;
    }
  } catch (e) {
    console.error('Error al cargar permisos de roles:', e);
  }
  return DEFAULT_PERMISOS_ROLES;
}

export function guardarPermisosRoles(config: ConfiguracionPermisos): void {
  try {
    // Proteger invariante: actuario nunca tiene users ni gestionarUsuarios
    config.actuario.modulos.users = false;
    config.actuario.acciones.gestionarUsuarios = false;
    config.cliente.modulos.users = false;
    config.cliente.acciones.gestionarUsuarios = false;
    // Super admin siempre tiene users y gestionarUsuarios
    config.admin.modulos.users = true;
    config.admin.acciones.gestionarUsuarios = true;

    localStorage.setItem(STORAGE_PERMISSIONS_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Error al guardar permisos de roles:', e);
  }
}

export function restablecerPermisosRoles(): ConfiguracionPermisos {
  try {
    localStorage.removeItem(STORAGE_PERMISSIONS_KEY);
  } catch (e) {
    console.error('Error al restablecer permisos:', e);
  }
  return DEFAULT_PERMISOS_ROLES;
}

export function obtenerPermisosEfectivos(usuario: InfoUsuario | null, rolFallback?: RolUsuario): PermisosRol {
  const rol = usuario?.rol || rolFallback || 'cliente';
  const rolesConfig = obtenerPermisosRoles();
  const basePermisos = rolesConfig[rol] || rolesConfig.cliente;

  // Si el usuario tiene overrides personalizados, fusionarlos
  if (usuario?.permisosPersonalizados) {
    const custom = usuario.permisosPersonalizados;
    const finalPermisos: PermisosRol = {
      modulos: {
        ...basePermisos.modulos,
        ...(custom.modulos || {})
      },
      acciones: {
        ...basePermisos.acciones,
        ...(custom.acciones || {})
      }
    };
    // Regla estricta: sólo 'admin' puede tener users y gestionarUsuarios
    if (rol !== 'admin') {
      finalPermisos.modulos.users = false;
      finalPermisos.acciones.gestionarUsuarios = false;
    }
    return finalPermisos;
  }

  return basePermisos;
}

export function guardarPermisosPersonalizadosUsuario(usuarioId: string, custom?: Partial<PermisosRol>): boolean {
  const usuarios = obtenerUsuarios();
  const index = usuarios.findIndex(u => u.id === usuarioId);
  if (index === -1) return false;

  usuarios[index].permisosPersonalizados = custom;
  guardarUsuarios(usuarios);
  return true;
}

// Cuentas iniciales predeterminadas
const USUARIOS_INICIALES: InfoUsuario[] = [
  {
    id: 'usr-admin-1',
    usuario: 'admin',
    nombre: 'Super Administrador del Sistema',
    email: 'admin@actuarial.ec',
    celular: '0991234567',
    password: 'Admin123*',
    pin: '1234',
    rol: 'admin',
    empresaAsignada: 'Administración General',
    estado: 'activo',
    fechaCreacion: '01/01/2025'
  },
  {
    id: 'usr-actuario-1',
    usuario: 'actuario',
    nombre: 'Perito Actuario Calificado',
    email: 'actuario@peritaje.ec',
    celular: '0987654321',
    password: 'Actuario123*',
    pin: '1234',
    rol: 'actuario',
    empresaAsignada: 'Servicios Actuariales',
    estado: 'activo',
    fechaCreacion: '15/01/2025'
  },
  {
    id: 'usr-empresa-1',
    usuario: 'empresa',
    nombre: 'Recursos Humanos (Empresa Cliente)',
    email: 'rrhh@empresa.com.ec',
    celular: '0998877665',
    password: 'Empresa123*',
    pin: '1234',
    rol: 'cliente',
    empresaAsignada: 'Empresa Evaluada S.A.',
    estado: 'activo',
    fechaCreacion: '10/02/2025'
  }
];

export function obtenerUsuarios(): InfoUsuario[] {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error al cargar usuarios:', e);
  }
  // Guardar iniciales si no existen
  guardarUsuarios(USUARIOS_INICIALES);
  return USUARIOS_INICIALES;
}

export function guardarUsuarios(usuarios: InfoUsuario[]): void {
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(usuarios));
  } catch (e) {
    console.error('Error al guardar usuarios:', e);
  }
}

export interface RegistroEmpresaInput {
  correo: string;
  usuario: string;
  password: string;
  repetirPassword: string;
  celular: string;
  pin: string;
  nombreEmpresa: string;
  ruc: string;
}

export function registrarEmpresa(input: RegistroEmpresaInput): { success: boolean; error?: string; usuario?: InfoUsuario } {
  // Validaciones
  const correo = input.correo.trim().toLowerCase();
  const usuario = input.usuario.trim().toLowerCase();
  const password = input.password;
  const repetirPassword = input.repetirPassword;
  const celular = input.celular.trim();
  const pin = input.pin.trim();
  const nombreEmpresa = input.nombreEmpresa.trim();
  const ruc = input.ruc.trim();

  if (!nombreEmpresa || nombreEmpresa.length < 3) {
    return { success: false, error: 'Ingrese el Nombre de la Empresa o Razón Social completa.' };
  }
  if (!ruc || !/^\d{13}$/.test(ruc)) {
    return { success: false, error: 'Ingrese un número de RUC válido de 13 dígitos numéricos.' };
  }
  if (!correo || !correo.includes('@') || !correo.includes('.')) {
    return { success: false, error: 'Ingrese una dirección de correo electrónico válida.' };
  }
  if (!usuario || usuario.length < 3) {
    return { success: false, error: 'El nombre de usuario debe tener al menos 3 caracteres.' };
  }
  if (!password || password.length < 6) {
    return { success: false, error: 'La contraseña debe tener al menos 6 caracteres.' };
  }
  if (password !== repetirPassword) {
    return { success: false, error: 'Las contraseñas no coinciden. Por favor verifique.' };
  }
  if (!celular || celular.length < 8) {
    return { success: false, error: 'Ingrese un número de celular válido para contacto y soporte.' };
  }
  if (!pin || pin.length < 4 || pin.length > 6 || !/^\d+$/.test(pin)) {
    return { success: false, error: 'El PIN de seguridad debe contener entre 4 y 6 dígitos numéricos.' };
  }

  const usuarios = obtenerUsuarios();

  // Verificar si ya existe usuario o correo o RUC
  const existeUser = usuarios.find(u => u.usuario.toLowerCase() === usuario);
  if (existeUser) {
    return { success: false, error: 'El nombre de usuario ya se encuentra registrado. Elija otro.' };
  }
  const existeEmail = usuarios.find(u => u.email.toLowerCase() === correo);
  if (existeEmail) {
    return { success: false, error: 'El correo electrónico ya está registrado en el portal.' };
  }
  const existeRuc = usuarios.find(u => u.ruc === ruc);
  if (existeRuc) {
    return { success: false, error: `Ya existe una cuenta registrada con el RUC ${ruc}. Inicie sesión o contacte a soporte.` };
  }

  const nuevoUsuario: InfoUsuario = {
    id: `usr-empresa-${Date.now()}`,
    usuario,
    nombre: nombreEmpresa,
    razonSocial: nombreEmpresa,
    ruc,
    email: correo,
    celular,
    password,
    pin,
    rol: 'cliente', // Estrictamente modo cliente / empresa
    empresaAsignada: nombreEmpresa,
    estado: 'activo',
    fechaCreacion: new Date().toLocaleDateString('es-EC')
  };

  usuarios.push(nuevoUsuario);
  guardarUsuarios(usuarios);

  return { success: true, usuario: nuevoUsuario };
}

export function validarCredenciales(identificador: string, passwordIngresada: string): { success: boolean; error?: string; usuario?: InfoUsuario } {
  const cleanId = identificador.trim().toLowerCase();
  const usuarios = obtenerUsuarios();

  const usuario = usuarios.find(u => 
    u.usuario.toLowerCase() === cleanId || u.email.toLowerCase() === cleanId
  );

  if (!usuario) {
    return { success: false, error: 'Usuario o correo electrónico no encontrado.' };
  }

  if (usuario.estado === 'inactivo') {
    return { success: false, error: 'Esta cuenta se encuentra inactiva. Contacte al Administrador.' };
  }

  if (usuario.password !== passwordIngresada) {
    return { success: false, error: 'Contraseña incorrecta. Por favor intente nuevamente.' };
  }

  return { success: true, usuario };
}

export function validarPinSeguridad(usuarioId: string, pinIngresado: string): { success: boolean; error?: string } {
  const usuarios = obtenerUsuarios();
  const usuario = usuarios.find(u => u.id === usuarioId);

  if (!usuario) {
    return { success: false, error: 'Usuario no identificado.' };
  }

  if (usuario.pin !== pinIngresado.trim()) {
    return { 
      success: false, 
      error: 'PIN de seguridad incorrecto. Si no lo recuerda, comuníquese con la administración para restablecerlo.' 
    };
  }

  return { success: true };
}

export function obtenerSesionActiva(): InfoUsuario | null {
  try {
    const raw = localStorage.getItem(STORAGE_SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error al obtener sesión activa:', e);
  }
  return null;
}

export function guardarSesionActiva(usuario: InfoUsuario): void {
  try {
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(usuario));
  } catch (e) {
    console.error('Error al guardar sesión:', e);
  }
}

export function cerrarSesionActiva(): void {
  try {
    localStorage.removeItem(STORAGE_SESSION_KEY);
  } catch (e) {
    console.error('Error al cerrar sesión:', e);
  }
}

export function restablecerPinUsuario(usuarioId: string, nuevoPin: string): boolean {
  if (!nuevoPin || nuevoPin.length < 4 || !/^\d+$/.test(nuevoPin)) return false;
  const usuarios = obtenerUsuarios();
  const index = usuarios.findIndex(u => u.id === usuarioId);
  if (index === -1) return false;

  usuarios[index].pin = nuevoPin.trim();
  guardarUsuarios(usuarios);
  return true;
}

export function actualizarRolUsuario(usuarioId: string, nuevoRol: RolUsuario): boolean {
  const usuarios = obtenerUsuarios();
  const index = usuarios.findIndex(u => u.id === usuarioId);
  if (index === -1) return false;

  usuarios[index].rol = nuevoRol;
  guardarUsuarios(usuarios);
  return true;
}

export function eliminarUsuarioPorId(usuarioId: string): boolean {
  const usuarios = obtenerUsuarios();
  const filtrados = usuarios.filter(u => u.id !== usuarioId);
  guardarUsuarios(filtrados);
  return true;
}
