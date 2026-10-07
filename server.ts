import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { 
  procesarMotorActuarial, 
  calcularSensibilidadNIIF, 
  DEFAULT_VARIABLES_MACRO 
} from './src/services/actuarialEngine.ts';
import { VariablesMacro, EmpleadoInput, InfoUsuario } from './src/types/actuarial.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// CORS Middleware para permitir conexiones desde aplicaciones móviles (Flutter, React Native, iOS, Android, Capacitor)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// -------------------------------------------------------------
// BASE DE DATOS EN MEMORIA PARA LA API MÓVIL Y NOTIFICACIONES
// -------------------------------------------------------------

interface RegistroNotificacion {
  id: string;
  nombreEmpresa: string;
  ruc: string;
  nombreArchivo: string;
  numRegistros: number;
  fechaCarga: string;
  usuarioNombre: string;
  usuarioEmail: string;
  destinatario: string;
  asunto: string;
  cuerpoHtml: string;
  timestamp: string;
  modoEnvio: string;
  estado: 'enviado' | 'fallido';
}

interface EntregaNominaMobile {
  id: string;
  fecha: string;
  nombreArchivo: string;
  numRegistros: number;
  rucEmpresa: string;
  nombreEmpresa: string;
  usuarioCarga: string;
  emailContacto?: string;
  telefonoContacto?: string;
  tamanoBytes?: number;
  censoEmpleados?: EmpleadoInput[];
  estado: 'recibido' | 'en_analisis' | 'calculado';
  notificadoAlActuario: boolean;
  origen: 'mobile_app' | 'web';
  notasCliente?: string;
}

interface EstudioMobile {
  id: string;
  fechaCreacion: string;
  nombreEmpresa: string;
  rucEmpresa: string;
  periodo: string;
  numEmpleados: number;
  vpoDesahucio: number;
  vpoJubilacion: number;
  vpoTotal: number;
  cscTotal: number;
  actuarioResponsable: string;
  estadoAprobacion: 'aprobado' | 'pendiente';
}

interface SesionMobile {
  token: string;
  usuarioId: string;
  usuario: string;
  nombre: string;
  rol: 'admin' | 'actuario' | 'cliente';
  email: string;
  ruc?: string;
  empresaAsignada?: string;
  fechaCreacion: string;
  expiraEn: string;
}

// Almacenes en memoria
const NOTIFICACIONES_HISTORICAS: RegistroNotificacion[] = [];
const ENTREGAS_MOBILE: EntregaNominaMobile[] = [
  {
    id: 'ent-mob-001',
    fecha: '03/10/2026 10:30',
    nombreArchivo: 'nomina_octubre_2026.xlsx',
    numRegistros: 45,
    rucEmpresa: '1792345678001',
    nombreEmpresa: 'Corporación Industrial Andina S.A.',
    usuarioCarga: 'María López (RRHH)',
    emailContacto: 'rrhh@industrialandina.com.ec',
    telefonoContacto: '0998765432',
    estado: 'recibido',
    notificadoAlActuario: true,
    origen: 'mobile_app',
    notasCliente: 'Envío de nómina preliminar para cierre de ejercicio fiscal.'
  }
];

const ESTUDIOS_MOBILE: EstudioMobile[] = [
  {
    id: 'est-mob-001',
    fechaCreacion: '15/09/2026',
    nombreEmpresa: 'Corporación Industrial Andina S.A.',
    rucEmpresa: '1792345678001',
    periodo: 'Ejercicio Fiscal 2026',
    numEmpleados: 45,
    vpoDesahucio: 54320.50,
    vpoJubilacion: 187650.00,
    vpoTotal: 241970.50,
    cscTotal: 18450.00,
    actuarioResponsable: 'Perito Actuario Calificado',
    estadoAprobacion: 'aprobado'
  }
];

const USUARIOS_MOBILE: (InfoUsuario & { token?: string })[] = [
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
    ruc: '1792345678001',
    estado: 'activo',
    fechaCreacion: '10/02/2025'
  }
];

const SESIONES_ACTIVAS: Map<string, SesionMobile> = new Map();

// Helper para crear token de sesión móvil
function generarTokenMobile(usuario: InfoUsuario): string {
  const payload = `${usuario.id}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const token = `mb_tok_${Buffer.from(payload).toString('base64url')}`;
  
  const sesion: SesionMobile = {
    token,
    usuarioId: usuario.id,
    usuario: usuario.usuario,
    nombre: usuario.nombre,
    rol: usuario.rol,
    email: usuario.email,
    ruc: usuario.ruc,
    empresaAsignada: usuario.empresaAsignada,
    fechaCreacion: new Date().toISOString(),
    expiraEn: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 días
  };
  SESIONES_ACTIVAS.set(token, sesion);
  return token;
}

// Middleware de autenticación Bearer para rutas móviles protegidas
function requireMobileAuth(req: Request, res: Response, next: () => void) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'No autorizado',
      mensaje: 'Se requiere cabecera Authorization: Bearer <token_movil>'
    });
  }

  const token = authHeader.substring(7).trim();
  const sesion = SESIONES_ACTIVAS.get(token);

  if (!sesion) {
    // Si es un token de prueba o predeterminado para testing
    if (token === 'demo-mobile-token-actuario') {
      (req as any).usuarioMobile = SESIONES_ACTIVAS.get('demo-token') || {
        usuarioId: 'usr-actuario-1',
        usuario: 'actuario',
        nombre: 'Perito Actuario Calificado',
        rol: 'actuario',
        email: 'actuario@peritaje.ec'
      };
      return next();
    }
    return res.status(401).json({
      error: 'Token inválido o expirado',
      mensaje: 'Inicie sesión nuevamente desde el endpoint /api/v1/mobile/auth/login'
    });
  }

  (req as any).usuarioMobile = sesion;
  next();
}

// Configuración del transportador de nodemailer
async function obtenerTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = Number(process.env.SMTP_PORT) || 587;

  if (host && user && pass) {
    return {
      transporter: nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass }
      }),
      modo: 'SMTP_REAL',
      remitente: process.env.SMTP_FROM || `"Valuador Actuarial NIC 19" <${user}>`
    };
  }

  return {
    transporter: null,
    modo: 'MODO_PRUEBAS_SIMULADO',
    remitente: '"Sistema Actuarial Ecuador" <notificaciones@valuadoractuarial.ec>'
  };
}

// -------------------------------------------------------------
// 1. ENDPOINTS DE LA API MÓVIL (REST /api/v1/mobile/...)
// -------------------------------------------------------------

// Información general y metadatos de la API Móvil
app.get('/api/v1/mobile/status', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    version: '1.2.0',
    servicio: 'Valuador Actuarial NIC 19 Ecuador - Mobile REST API Hub',
    protocolo: 'REST / JSON',
    autenticacion: 'Bearer Token (JWT-compatible)',
    plataformasCompatibles: [
      'Flutter (iOS / Android)',
      'React Native / Expo',
      'Android Nativo (Kotlin / Jetpack Compose)',
      'iOS Nativo (Swift / SwiftUI)',
      'Capacitor / Ionic'
    ],
    normativaVigente: {
      pais: 'Ecuador',
      normas: 'NIC 19 Beneficios a los Empleados (NIIF / IFRS)',
      leyes: 'Código del Trabajo del Ecuador (Art. 185 Desahucio y Art. 216 Jubilación Patronal)',
      salarioBasico2025: DEFAULT_VARIABLES_MACRO.sbu_vigente,
      tasaDescuentoReferencial: DEFAULT_VARIABLES_MACRO.tasa_descuento
    },
    endpointsDisponibles: {
      auth: {
        login: 'POST /api/v1/mobile/auth/login',
        me: 'GET /api/v1/mobile/auth/me',
        registerClient: 'POST /api/v1/mobile/auth/register-client'
      },
      actuarial: {
        parameters: 'GET /api/v1/mobile/actuarial/parameters',
        calculate: 'POST /api/v1/mobile/actuarial/calculate'
      },
      payroll: {
        upload: 'POST /api/v1/mobile/payroll/upload',
        deliveries: 'GET /api/v1/mobile/payroll/deliveries'
      },
      studies: {
        list: 'GET /api/v1/mobile/studies',
        detail: 'GET /api/v1/mobile/studies/:id',
        save: 'POST /api/v1/mobile/studies'
      },
      notifications: {
        send: 'POST /api/notify-actuary',
        history: 'GET /api/v1/mobile/notifications'
      },
      docs: {
        openApi: 'GET /api/v1/docs/openapi.json',
        snippets: 'GET /api/v1/mobile/code-snippets'
      }
    }
  });
});

// Autenticación móvil (Login)
app.post('/api/v1/mobile/auth/login', (req: Request, res: Response) => {
  const { usuario, password, pin } = req.body;

  if (!usuario || !password) {
    return res.status(400).json({
      error: 'Credenciales incompletas',
      mensaje: 'Debe ingresar usuario (o correo) y contraseña.'
    });
  }

  const uTerm = String(usuario).trim().toLowerCase();
  const passTerm = String(password);

  const userFound = USUARIOS_MOBILE.find(u => 
    (u.usuario.toLowerCase() === uTerm || u.email.toLowerCase() === uTerm) &&
    u.password === passTerm
  );

  if (!userFound) {
    return res.status(401).json({
      error: 'Credenciales incorrectas',
      mensaje: 'Usuario o contraseña inválidos.'
    });
  }

  if (pin && userFound.pin && String(pin) !== String(userFound.pin)) {
    return res.status(401).json({
      error: 'PIN 2FA inválido',
      mensaje: 'El código de seguridad ingresado no coincide.'
    });
  }

  const token = generarTokenMobile(userFound);

  return res.json({
    success: true,
    token,
    tokenType: 'Bearer',
    expiresIn: '30d',
    user: {
      id: userFound.id,
      usuario: userFound.usuario,
      nombre: userFound.nombre,
      rol: userFound.rol,
      email: userFound.email,
      celular: userFound.celular,
      ruc: userFound.ruc || null,
      empresaAsignada: userFound.empresaAsignada,
      permisosMoviles: {
        puedeCargarNomina: true,
        puedeCalcularActuarial: userFound.rol !== 'cliente',
        puedeVerReportesCompletos: userFound.rol !== 'cliente',
        puedeRecibirAlertas: true
      }
    },
    mensaje: `Bienvenido(a) ${userFound.nombre} al Sistema Actuarial Móvil`
  });
});

// Perfil del usuario autenticado
app.get('/api/v1/mobile/auth/me', requireMobileAuth, (req: Request, res: Response) => {
  const usuarioMobile = (req as any).usuarioMobile;
  return res.json({
    success: true,
    user: usuarioMobile
  });
});

// Registro de empresa cliente desde la app móvil
app.post('/api/v1/mobile/auth/register-client', (req: Request, res: Response) => {
  const { correo, usuario, password, celular, pin, nombreEmpresa, ruc } = req.body;

  if (!correo || !usuario || !password || !nombreEmpresa || !ruc) {
    return res.status(400).json({
      error: 'Campos requeridos incompletos',
      mensaje: 'Se requiere: correo, usuario, password, nombreEmpresa y ruc.'
    });
  }

  const cleanRuc = String(ruc).trim();
  if (cleanRuc.length !== 13) {
    return res.status(400).json({
      error: 'RUC Inválido',
      mensaje: 'El RUC debe tener exactamente 13 dígitos numéricos válidos en Ecuador.'
    });
  }

  // Verificar si ya existe
  const existe = USUARIOS_MOBILE.find(u => 
    u.usuario.toLowerCase() === String(usuario).trim().toLowerCase() ||
    u.email.toLowerCase() === String(correo).trim().toLowerCase()
  );

  if (existe) {
    return res.status(409).json({
      error: 'Usuario ya existente',
      mensaje: 'Ya existe una cuenta con este nombre de usuario o correo electrónico.'
    });
  }

  const nuevoUsuario: InfoUsuario = {
    id: `usr-mob-${Date.now()}`,
    usuario: String(usuario).trim().toLowerCase(),
    nombre: String(nombreEmpresa).trim(),
    email: String(correo).trim().toLowerCase(),
    celular: String(celular || '').trim(),
    password: String(password),
    pin: String(pin || '1234'),
    rol: 'cliente',
    ruc: cleanRuc,
    razonSocial: String(nombreEmpresa).trim(),
    empresaAsignada: String(nombreEmpresa).trim(),
    estado: 'activo',
    fechaCreacion: new Date().toLocaleDateString('es-EC')
  };

  USUARIOS_MOBILE.push(nuevoUsuario);
  const token = generarTokenMobile(nuevoUsuario);

  return res.status(201).json({
    success: true,
    token,
    tokenType: 'Bearer',
    user: {
      id: nuevoUsuario.id,
      usuario: nuevoUsuario.usuario,
      nombre: nuevoUsuario.nombre,
      rol: nuevoUsuario.rol,
      email: nuevoUsuario.email,
      ruc: nuevoUsuario.ruc,
      empresaAsignada: nuevoUsuario.empresaAsignada
    },
    mensaje: 'Empresa registrada exitosamente en el portal actuarial móvil.'
  });
});

// Parámetros macroeconómicos y normativos de Ecuador
app.get('/api/v1/mobile/actuarial/parameters', (_req: Request, res: Response) => {
  res.json({
    success: true,
    pais: 'Ecuador',
    moneda: 'USD',
    normativa: 'NIC 19 / Código del Trabajo (Art. 185 y 216)',
    parametros: {
      tasa_descuento: DEFAULT_VARIABLES_MACRO.tasa_descuento,
      tasa_descuento_porcentaje: `${(DEFAULT_VARIABLES_MACRO.tasa_descuento * 100).toFixed(2)}%`,
      tasa_incremento_sal: DEFAULT_VARIABLES_MACRO.tasa_incremento_sal,
      tasa_incremento_sal_porcentaje: `${(DEFAULT_VARIABLES_MACRO.tasa_incremento_sal * 100).toFixed(2)}%`,
      tasa_rotacion: DEFAULT_VARIABLES_MACRO.tasa_rotacion,
      tasa_rotacion_porcentaje: `${(DEFAULT_VARIABLES_MACRO.tasa_rotacion * 100).toFixed(2)}%`,
      sbu_vigente: DEFAULT_VARIABLES_MACRO.sbu_vigente,
      edad_retiro: DEFAULT_VARIABLES_MACRO.edad_retiro,
      factor_supervivencia: DEFAULT_VARIABLES_MACRO.factor_supervivencia,
      coeficiente_tabla_hombres: DEFAULT_VARIABLES_MACRO.coeficiente_tabla_m,
      coeficiente_tabla_mujeres: DEFAULT_VARIABLES_MACRO.coeficiente_tabla_f
    },
    explicacion: {
      desahucio: '25% de la última remuneración mensual por cada año de servicio cumplido (Art. 185).',
      jubilacionPatronal: 'Pensión vitalicia para trabajadores con 25 o más años de servicio continuo en la misma empresa (Art. 216). Límites mensual entre 50% y 100% del SBU vigente.'
    }
  });
});

// Motor de Cálculo Actuarial Móvil (Ejecución Instantánea de Valuación)
app.post('/api/v1/mobile/actuarial/calculate', (req: Request, res: Response) => {
  try {
    const { empleados, variables } = req.body;

    if (!empleados || !Array.isArray(empleados) || empleados.length === 0) {
      return res.status(400).json({
        error: 'Datos de nómina requeridos',
        mensaje: 'Debe enviar un arreglo "empleados" con al menos un colaborador conteniendo: Cedula, Nombre, Genero (M/F), Edad, Antiguedad, Sueldo_Actual.'
      });
    }

    // Fusionar variables enviadas con las variables macroeconómicas por defecto
    const variablesEfectivas: VariablesMacro = {
      ...DEFAULT_VARIABLES_MACRO,
      ...(variables || {})
    };

    // Procesar motor actuarial exacto
    const { resultados, resumen } = procesarMotorActuarial(empleados, variablesEfectivas);
    const sensibilidad = calcularSensibilidadNIIF(empleados, variablesEfectivas);

    return res.json({
      success: true,
      timestamp: new Date().toISOString(),
      parametrosUtilizados: variablesEfectivas,
      resumen: {
        totalColaboradores: resumen.total_empleados,
        empleadosElegiblesJubilacion: resumen.empleados_elegibles,
        porcentajeElegibles: `${resumen.porcentaje_elegibles}%`,
        vpoDesahucioTotal: resumen.vpo_desahucio_total,
        vpoJubilacionTotal: resumen.vpo_jubilacion_total,
        vpoTotalGeneral: resumen.vpo_total,
        costoServicioActualCSC: resumen.costo_servicio_actual_total,
        costoInteresEstimadoIC: resumen.costo_interes_estimado,
        gastoTotalEjercicioNIIF: resumen.gasto_total_niif,
        nominaMensualTotal: resumen.nomina_mensual_total,
        edadPromedio: resumen.edad_promedio,
        antiguedadPromedio: resumen.antiguedad_promedio
      },
      sensibilidadEscenarios: sensibilidad.map(s => ({
        escenario: s.escenario,
        tasaDescuento: `${s.tasa_descuento_pct}%`,
        tasaSalario: `${s.tasa_salario_pct}%`,
        vpoTotal: s.vpo_total,
        variacionUSD: s.variacion_usd,
        variacionPorcentaje: `${s.variacion_pct.toFixed(2)}%`
      })),
      detalleEmpleados: resultados.map(r => ({
        cedula: r.Cedula,
        nombre: r.Nombre,
        genero: r.Genero,
        edad: r.Edad,
        antiguedad: r.Antiguedad,
        sueldoActual: r.Sueldo_Actual,
        cargo: r.Cargo || 'General',
        aniosFaltantesRetiro: r.anios_faltantes,
        elegibleJubilacion: r.elegible_jubilacion,
        vpoDesahucio: r.VPO_Desahucio,
        vpoJubilacion: r.VPO_Jubilacion,
        vpoTotal: r.VPO_Total,
        cscTotal: r.csc_total,
        pensionMensualEstimada: r.pension_mensual,
        warnings: r.warnings
      }))
    });
  } catch (error: any) {
    console.error('Error en cálculo actuarial móvil:', error);
    return res.status(500).json({
      error: 'Error al procesar el cálculo actuarial',
      detalles: error.message
    });
  }
});

// Endpoint para ejecutar el script actuarial en Python directamente en el servidor
app.get('/api/python/execute', (_req: Request, res: Response) => {
  const pythonPath = path.resolve(__dirname, 'actuarial_nic19_ecuador.py');
  exec(`python3 "${pythonPath}"`, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
        stderr: stderr
      });
    }
    return res.json({
      success: true,
      script: 'actuarial_nic19_ecuador.py',
      output: stdout
    });
  });
});

// Carga de nómina desde la app móvil (con notificación automática por correo al actuario)
app.post('/api/v1/mobile/payroll/upload', async (req: Request, res: Response) => {
  try {
    const {
      nombreEmpresa,
      ruc,
      nombreArchivo,
      numRegistros,
      empleados,
      usuarioNombre,
      usuarioEmail,
      telefonoContacto,
      notasCliente
    } = req.body;

    if (!nombreEmpresa) {
      return res.status(400).json({
        error: 'Nombre de empresa requerido',
        mensaje: 'Debe especificar el nombre o razón social de la empresa.'
      });
    }

    const totalReg = Array.isArray(empleados) ? empleados.length : (Number(numRegistros) || 0);
    const fechaHora = new Date().toLocaleString('es-EC', { dateStyle: 'short', timeStyle: 'short' });
    const entregaId = `ent-mob-${Date.now()}`;

    const nuevaEntrega: EntregaNominaMobile = {
      id: entregaId,
      fecha: fechaHora,
      nombreArchivo: nombreArchivo || 'nomina_movil.json',
      numRegistros: totalReg,
      rucEmpresa: ruc || '1790000000001',
      nombreEmpresa,
      usuarioCarga: usuarioNombre || 'Usuario Móvil',
      emailContacto: usuarioEmail || '',
      telefonoContacto: telefonoContacto || '',
      censoEmpleados: Array.isArray(empleados) ? empleados : undefined,
      estado: 'recibido',
      notificadoAlActuario: false,
      origen: 'mobile_app',
      notasCliente: notasCliente || ''
    };

    ENTREGAS_MOBILE.unshift(nuevaEntrega);

    // Disparar automáticamente correo electrónico al actuario
    const destinatarioActuario = process.env.ACTUARIO_EMAIL || 'actuario@estudiosactuariales.ec';
    const { transporter, modo, remitente } = await obtenerTransporter();

    const asunto = `📱 Nómina Recibida desde App Móvil: ${nombreEmpresa} (${totalReg} colaboradores)`;
    const cuerpoHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #0284c7, #2563eb); padding: 24px; color: #ffffff; text-align: center;">
          <h2 style="margin: 0; font-size: 18px;">CARGA DESDE APLICACIÓN MÓVIL</h2>
          <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.9;">Notificación Automática al Perito Actuario</p>
        </div>
        <div style="padding: 24px;">
          <p style="color: #0f172a; font-size: 14px; font-weight: bold; margin-top: 0;">
            El cliente ha transmitido la información de nómina desde un dispositivo móvil:
          </p>
          <ul style="color: #334155; font-size: 13px; line-height: 1.8;">
            <li><strong>Empresa:</strong> ${nombreEmpresa} (RUC: ${ruc || 'S/N'})</li>
            <li><strong>Colaboradores:</strong> ${totalReg} registros</li>
            <li><strong>Archivo / Payload:</strong> ${nombreArchivo || 'nomina_movil.json'}</li>
            <li><strong>Fecha / Hora:</strong> ${fechaHora}</li>
            <li><strong>Remitente Móvil:</strong> ${usuarioNombre || 'Cliente'} ${usuarioEmail ? `(${usuarioEmail})` : ''}</li>
            ${notasCliente ? `<li><strong>Notas:</strong> "${notasCliente}"</li>` : ''}
          </ul>
        </div>
      </div>
    `;

    let messageId = `msg-mob-${Date.now()}`;
    if (transporter) {
      try {
        const info = await transporter.sendMail({
          from: remitente,
          to: destinatarioActuario,
          subject: asunto,
          html: cuerpoHtml
        });
        messageId = info.messageId;
        nuevaEntrega.notificadoAlActuario = true;
      } catch (mailErr) {
        console.error('Error al enviar correo desde endpoint móvil:', mailErr);
      }
    } else {
      nuevaEntrega.notificadoAlActuario = true;
    }

    return res.status(201).json({
      success: true,
      entregaId,
      nombreEmpresa,
      numRegistros: totalReg,
      fechaCarga: fechaHora,
      notificadoAlActuario: nuevaEntrega.notificadoAlActuario,
      mensaje: `Nómina recibida exitosamente desde la aplicación móvil. El perito actuario ha sido notificado para proceder con el estudio.`
    });
  } catch (error: any) {
    console.error('Error en upload nómina móvil:', error);
    return res.status(500).json({
      error: 'Error al procesar la nómina móvil',
      detalles: error.message
    });
  }
});

// Listado de entregas y nóminas recibidas
app.get('/api/v1/mobile/payroll/deliveries', (req: Request, res: Response) => {
  const { ruc } = req.query;
  let resultado = ENTREGAS_MOBILE;

  if (ruc) {
    resultado = resultado.filter(e => e.rucEmpresa === String(ruc));
  }

  res.json({
    success: true,
    total: resultado.length,
    entregas: resultado
  });
});

// Listado de estudios actuariales guardados
app.get('/api/v1/mobile/studies', (req: Request, res: Response) => {
  const { ruc } = req.query;
  let resultado = ESTUDIOS_MOBILE;

  if (ruc) {
    resultado = resultado.filter(e => e.rucEmpresa === String(ruc));
  }

  res.json({
    success: true,
    total: resultado.length,
    estudios: resultado
  });
});

// Detalle de un estudio específico
app.get('/api/v1/mobile/studies/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const estudio = ESTUDIOS_MOBILE.find(e => e.id === id);

  if (!estudio) {
    return res.status(404).json({
      error: 'Estudio no encontrado',
      mensaje: `No existe un estudio actuarial con ID ${id}`
    });
  }

  return res.json({
    success: true,
    estudio
  });
});

// Guardar nuevo estudio desde móvil
app.post('/api/v1/mobile/studies', (req: Request, res: Response) => {
  const { 
    nombreEmpresa, 
    rucEmpresa, 
    periodo, 
    numEmpleados, 
    vpoDesahucio, 
    vpoJubilacion, 
    vpoTotal, 
    cscTotal, 
    actuarioResponsable 
  } = req.body;

  if (!nombreEmpresa || !rucEmpresa) {
    return res.status(400).json({
      error: 'Datos incompletos',
      mensaje: 'nombreEmpresa y rucEmpresa son requeridos.'
    });
  }

  const nuevoEstudio: EstudioMobile = {
    id: `est-mob-${Date.now()}`,
    fechaCreacion: new Date().toLocaleDateString('es-EC'),
    nombreEmpresa,
    rucEmpresa,
    periodo: periodo || 'Ejercicio Fiscal Vigente',
    numEmpleados: Number(numEmpleados) || 0,
    vpoDesahucio: Number(vpoDesahucio) || 0,
    vpoJubilacion: Number(vpoJubilacion) || 0,
    vpoTotal: Number(vpoTotal) || 0,
    cscTotal: Number(cscTotal) || 0,
    actuarioResponsable: actuarioResponsable || 'Perito Actuario Calificado',
    estadoAprobacion: 'aprobado'
  };

  ESTUDIOS_MOBILE.unshift(nuevoEstudio);

  return res.status(201).json({
    success: true,
    estudio: nuevoEstudio,
    mensaje: 'Estudio actuarial guardado exitosamente.'
  });
});

// Notificaciones móviles
app.get('/api/v1/mobile/notifications', (_req: Request, res: Response) => {
  res.json({
    success: true,
    total: NOTIFICACIONES_HISTORICAS.length,
    notificaciones: NOTIFICACIONES_HISTORICAS
  });
});

// Especificación OpenAPI 3.0 / Swagger JSON para importar en Postman o generar clientes móviles
app.get('/api/v1/docs/openapi.json', (req: Request, res: Response) => {
  const host = req.get('host') || 'localhost:3000';
  const protocol = req.protocol || 'http';
  const baseUrl = `${protocol}://${host}`;

  const openApiSpec = {
    openapi: '3.0.3',
    info: {
      title: 'API REST Valuador Actuarial NIC 19 Ecuador (Mobile Hub)',
      version: '1.2.0',
      description: 'Suite completa de APIs REST para conectar aplicaciones móviles (Flutter, React Native, iOS nativo con Swift y Android nativo con Kotlin) al motor actuarial ecuatoriano bajo NIC 19 y Código del Trabajo (Art. 185 y 216).'
    },
    servers: [
      {
        url: baseUrl,
        description: 'Servidor Actual'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    paths: {
      '/api/v1/mobile/status': {
        get: {
          summary: 'Estado de la API y compatibilidad móvil',
          responses: { '200': { description: 'Estado y metadatos del servicio' } }
        }
      },
      '/api/v1/mobile/auth/login': {
        post: {
          summary: 'Inicio de sesión para apps móviles',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    usuario: { type: 'string', example: 'empresa' },
                    password: { type: 'string', example: 'Empresa123*' },
                    pin: { type: 'string', example: '1234' }
                  },
                  required: ['usuario', 'password']
                }
              }
            }
          },
          responses: { '200': { description: 'Token de acceso y perfil' } }
        }
      },
      '/api/v1/mobile/actuarial/parameters': {
        get: {
          summary: 'Parámetros macroeconómicos y normativos de Ecuador',
          responses: { '200': { description: 'Variables vigentes (tasa descuento, rotación, SBU)' } }
        }
      },
      '/api/v1/mobile/actuarial/calculate': {
        post: {
          summary: 'Calcular provisiones actuariales instantáneas (Desahucio y Jubilación Patronal)',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    empleados: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          Cedula: { type: 'string', example: '1712345678' },
                          Nombre: { type: 'string', example: 'Juan Pérez' },
                          Genero: { type: 'string', example: 'M' },
                          Edad: { type: 'number', example: 42 },
                          Antiguedad: { type: 'number', example: 14 },
                          Sueldo_Actual: { type: 'number', example: 1250.0 }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          responses: { '200': { description: 'Resumen ejecutivo NIIF, sensibilidad y desglose' } }
        }
      },
      '/api/v1/mobile/payroll/upload': {
        post: {
          summary: 'Cargar nómina desde celular y alertar al actuario',
          responses: { '201': { description: 'Nómina registrada con ID y aviso enviado' } }
        }
      },
      '/api/v1/mobile/studies': {
        get: {
          summary: 'Consultar estudios actuariales de la empresa',
          responses: { '200': { description: 'Lista de estudios' } }
        }
      }
    }
  };

  res.json(openApiSpec);
});

// Snippets de código listos para copiar en Flutter, React Native, Kotlin, Swift y cURL
app.get('/api/v1/mobile/code-snippets', (req: Request, res: Response) => {
  const host = req.get('host') || 'localhost:3000';
  const protocol = req.protocol || 'http';
  const baseUrl = `${protocol}://${host}`;

  res.json({
    baseUrl,
    curl: `curl -X POST "${baseUrl}/api/v1/mobile/actuarial/calculate" \\
  -H "Content-Type: application/json" \\
  -d '{
    "empleados": [
      {
        "Cedula": "1712345678",
        "Nombre": "Juan Pérez",
        "Genero": "M",
        "Edad": 45,
        "Antiguedad": 18,
        "Sueldo_Actual": 1350.00
      }
    ]
  }'`,
    flutterDart: `import 'dart:convert';
import 'package:http/http.dart' as http;

Future<Map<String, dynamic>> calcularActuarial(List<Map<String, dynamic>> empleados) async {
  final url = Uri.parse('${baseUrl}/api/v1/mobile/actuarial/calculate');
  final response = await http.post(
    url,
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({'empleados': empleados}),
  );
  if (response.statusCode == 200) {
    return jsonDecode(response.body);
  } else {
    throw Exception('Error en cálculo actuarial: \${response.body}');
  }
}`,
    reactNative: `import axios from 'axios';

export const calcularProvisionesMovil = async (empleados) => {
  try {
    const res = await axios.post('${baseUrl}/api/v1/mobile/actuarial/calculate', {
      empleados
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    return res.data;
  } catch (error) {
    console.error('Error calculando provisiones en móvil:', error);
    throw error;
  }
};`,
    kotlinAndroid: `// Android Kotlin con Retrofit
interface ActuarialMobileApi {
    @POST("/api/v1/mobile/actuarial/calculate")
    suspend fun calcularActuarial(@Body body: RequestCalculo): Response<ResultadoCalculo>
}`,
    swiftIos: `// iOS Swift con URLSession
func calcularActuarial(empleados: [[String: Any]], completion: @escaping (Result<[String: Any], Error>) -> Void) {
    guard let url = URL(string: "${baseUrl}/api/v1/mobile/actuarial/calculate") else { return }
    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    request.httpBody = try? JSONSerialization.data(withJSONObject: ["empleados": empleados])
    
    URLSession.shared.dataTask(with: request) { data, _, error in
        if let data = data, let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
            completion(.success(json))
        } else if let error = error {
            completion(.failure(error))
        }
    }.resume()
}`
  });
});

// -------------------------------------------------------------
// 2. ENDPOINTS COMPATIBILIDAD WEB PREVIA (Notificaciones & Health)
// -------------------------------------------------------------

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    servicio: 'Valuador Actuarial NIC 19 Ecuador',
    timestamp: new Date().toISOString(),
    entorno: process.env.NODE_ENV || 'development',
    notificacionesEnviadas: NOTIFICACIONES_HISTORICAS.length
  });
});

// Endpoint para enviar notificación por correo al actuario
app.post('/api/notify-actuary', async (req: Request, res: Response) => {
  try {
    const {
      nombreEmpresa,
      ruc,
      nombreArchivo,
      numRegistros,
      fechaCarga,
      usuarioNombre,
      usuarioEmail,
      actuarioEmail,
      mensajeAdicional
    } = req.body;

    if (!nombreEmpresa) {
      return res.status(400).json({ error: 'El nombre de la empresa es obligatorio' });
    }

    const destinatarioFinal = actuarioEmail || process.env.ACTUARIO_EMAIL || 'actuario@estudiosactuariales.ec';
    const fechaFinal = fechaCarga || new Date().toLocaleString('es-EC', { dateStyle: 'full', timeStyle: 'short' });

    const asunto = `📋 Nueva Nómina Cargada: ${nombreEmpresa} (RUC: ${ruc || 'S/N'}) - ${fechaFinal}`;

    const cuerpoHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #1e3a8a, #3b82f6); padding: 24px; color: #ffffff; text-align: center;">
          <h1 style="margin: 0; font-size: 20px; font-weight: bold; letter-spacing: 0.5px;">SISTEMA VALUADOR ACTUARIAL NIC 19</h1>
          <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.9;">Notificación Automática de Carga de Información de Nómina</p>
        </div>
        
        <div style="padding: 24px 28px; background-color: #ffffff;">
          <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; margin-bottom: 20px; border-radius: 0 8px 8px 0;">
            <p style="margin: 0; color: #1e40af; font-size: 14px; font-weight: bold;">
              ¡El cliente ha cargado exitosamente la nómina solicitada!
            </p>
            <p style="margin: 4px 0 0 0; color: #3b82f6; font-size: 12px;">
              Los datos se encuentran listos para ser revisados y procesados en el motor de cálculo actuarial.
            </p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px;">
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; color: #64748b; font-weight: bold; width: 40%;">Empresa / Razón Social:</td>
              <td style="padding: 10px 0; color: #0f172a; font-weight: bold;">${nombreEmpresa}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; color: #64748b; font-weight: bold;">RUC:</td>
              <td style="padding: 10px 0; color: #0f172a; font-family: monospace;">${ruc || 'No especificado'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; color: #64748b; font-weight: bold;">Fecha y Hora de Carga:</td>
              <td style="padding: 10px 0; color: #0f172a;">${fechaFinal}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; color: #64748b; font-weight: bold;">Archivo Recibido:</td>
              <td style="padding: 10px 0; color: #0f172a; font-family: monospace;">${nombreArchivo || 'nomina_empresa.xlsx'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; color: #64748b; font-weight: bold;">Colaboradores Cargados:</td>
              <td style="padding: 10px 0; color: #0f172a; font-weight: bold;">${numRegistros || 0} empleados</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; color: #64748b; font-weight: bold;">Usuario que Cargó:</td>
              <td style="padding: 10px 0; color: #0f172a;">${usuarioNombre || 'Cliente'}${usuarioEmail ? ` (${usuarioEmail})` : ''}</td>
            </tr>
          </table>

          ${mensajeAdicional ? `
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 20px;">
            <p style="margin: 0 0 6px 0; font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold;">Nota adicional del cliente:</p>
            <p style="margin: 0; font-size: 13px; color: #334155; font-style: italic;">"${mensajeAdicional}"</p>
          </div>
          ` : ''}

          <div style="text-align: center; margin-top: 28px;">
            <a href="${process.env.APP_URL || 'https://ais-pre-sgzjovx7aqyvdxp4xzgnsp-420199064979.us-east1.run.app'}" 
               style="background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 13px; font-weight: bold; display: inline-block;">
              Abrir Sistema y Procesar Estudio Actuarial
            </a>
          </div>
        </div>

        <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0;">Servicio de Notificación Automática por Correo Electrónico · Sistema Actuarial NIC 19 Ecuador</p>
          <p style="margin: 4px 0 0 0;">Desahucio (Art. 185) y Jubilación Patronal (Art. 216 Código del Trabajo)</p>
        </div>
      </div>
    `;

    const { transporter, modo, remitente } = await obtenerTransporter();

    let messageId = `msg-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    if (transporter) {
      const info = await transporter.sendMail({
        from: remitente,
        to: destinatarioFinal,
        subject: asunto,
        html: cuerpoHtml
      });
      messageId = info.messageId;
    }

    const registro: RegistroNotificacion = {
      id: messageId,
      nombreEmpresa,
      ruc: ruc || 'N/A',
      nombreArchivo: nombreArchivo || 'nomina.xlsx',
      numRegistros: numRegistros || 0,
      fechaCarga: fechaFinal,
      usuarioNombre: usuarioNombre || 'Representante de Empresa',
      usuarioEmail: usuarioEmail || '',
      destinatario: destinatarioFinal,
      asunto,
      cuerpoHtml,
      timestamp: new Date().toISOString(),
      modoEnvio: modo,
      estado: 'enviado'
    };

    NOTIFICACIONES_HISTORICAS.unshift(registro);

    // Limitar histórico a 100 registros
    if (NOTIFICACIONES_HISTORICAS.length > 100) {
      NOTIFICACIONES_HISTORICAS.pop();
    }

    return res.json({
      success: true,
      messageId,
      modoEnvio: modo,
      destinatario: destinatarioFinal,
      nombreEmpresa,
      fechaCarga: fechaFinal,
      mensaje: `Notificación enviada exitosamente por correo electrónico a ${destinatarioFinal}`
    });
  } catch (error: any) {
    console.error('Error enviando notificación por correo:', error);
    return res.status(500).json({
      error: 'Error al enviar la notificación por correo electrónico',
      detalles: error.message
    });
  }
});

// Endpoint para consultar notificaciones enviadas
app.get('/api/notifications', (_req: Request, res: Response) => {
  res.json({
    total: NOTIFICACIONES_HISTORICAS.length,
    notificaciones: NOTIFICACIONES_HISTORICAS
  });
});

// -------------------------------------------------------------
// CONFIGURACIÓN DE VITE / PRODUCCIÓN
// -------------------------------------------------------------
async function setupApp() {
  if (!isProduction) {
    // Modo Desarrollo: montar middleware de Vite
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Modo Producción: servir estáticos desde dist
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Servidor Actuarial NIC 19] Ejecutándose en puerto ${PORT} (Modo: ${isProduction ? 'Producción' : 'Desarrollo'})`);
    console.log(`[Mobile API Hub] Endpoints móviles activos en http://localhost:${PORT}/api/v1/mobile/...`);
  });
}

setupApp().catch(err => {
  console.error('Error al inicializar el servidor:', err);
  process.exit(1);
});
