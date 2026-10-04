import { 
  EstudioGuardado, 
  EntregaNominaCliente, 
  ResumenMotor, 
  VariablesMacro, 
  DatosEmpresaEstudio, 
  EmpleadoInput 
} from '../types/actuarial';

const STORAGE_STUDIES_KEY = 'SISTEMA_ACTUARIAL_ESTUDIOS_GUARDADOS_V1';
const STORAGE_SUBMISSIONS_KEY = 'SISTEMA_ACTUARIAL_ENTREGAS_NOMINA_V1';

// ESTUDIOS ACTUARIALES GUARDADOS

export function obtenerEstudiosGuardados(): EstudioGuardado[] {
  try {
    const raw = localStorage.getItem(STORAGE_STUDIES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error al cargar estudios guardados:', e);
  }
  return [];
}

export function guardarEstudioActuarial(params: {
  titulo: string;
  rucEmpresa: string;
  nombreEmpresa: string;
  fechaCorte: string;
  anioEvaluado: number;
  actuarioNombre: string;
  numEmpleados: number;
  resumen: ResumenMotor;
  variables: VariablesMacro;
  empresaSnapshot: DatosEmpresaEstudio;
  censoData: EmpleadoInput[];
}): EstudioGuardado {
  const estudios = obtenerEstudiosGuardados();

  const nuevoEstudio: EstudioGuardado = {
    id: `est-${Date.now()}`,
    titulo: params.titulo.trim() || `Estudio Actuarial NIC 19 - ${params.nombreEmpresa} (${params.anioEvaluado})`,
    rucEmpresa: params.rucEmpresa.trim(),
    nombreEmpresa: params.nombreEmpresa.trim(),
    fechaCorte: params.fechaCorte,
    anioEvaluado: params.anioEvaluado,
    fechaElaboracion: new Date().toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric' }),
    actuarioNombre: params.actuarioNombre || 'Perito Actuario Calificado',
    numEmpleados: params.numEmpleados,
    resumen: params.resumen,
    variables: params.variables,
    empresaSnapshot: params.empresaSnapshot,
    censoData: params.censoData,
    estadoDescargaCliente: 'bloqueado' // Por defecto bloqueado hasta que el cliente lo solicite y el actuario lo apruebe
  };

  estudios.unshift(nuevoEstudio);
  try {
    localStorage.setItem(STORAGE_STUDIES_KEY, JSON.stringify(estudios));
  } catch (e) {
    console.error('Error al guardar estudio actuarial:', e);
  }

  return nuevoEstudio;
}

export function obtenerEstudiosPorEmpresa(rucEmpresa?: string, nombreEmpresa?: string): EstudioGuardado[] {
  const todos = obtenerEstudiosGuardados();
  const cleanRuc = rucEmpresa?.trim();
  const cleanNombre = nombreEmpresa?.trim().toLowerCase();

  return todos.filter(est => {
    if (cleanRuc && est.rucEmpresa && est.rucEmpresa === cleanRuc) return true;
    if (cleanNombre && est.nombreEmpresa.toLowerCase().includes(cleanNombre)) return true;
    return false;
  });
}

export function solicitarDescargaEstudio(estudioId: string): boolean {
  const estudios = obtenerEstudiosGuardados();
  const index = estudios.findIndex(e => e.id === estudioId);
  if (index === -1) return false;

  estudios[index].estadoDescargaCliente = 'solicitado';
  estudios[index].fechaSolicitud = new Date().toLocaleDateString('es-EC');
  
  try {
    localStorage.setItem(STORAGE_STUDIES_KEY, JSON.stringify(estudios));
    return true;
  } catch (e) {
    console.error('Error al solicitar descarga:', e);
    return false;
  }
}

export function aprobarDescargaEstudio(estudioId: string, aprobadoPorNombre: string): boolean {
  const estudios = obtenerEstudiosGuardados();
  const index = estudios.findIndex(e => e.id === estudioId);
  if (index === -1) return false;

  estudios[index].estadoDescargaCliente = 'permitido';
  estudios[index].fechaAprobacion = new Date().toLocaleDateString('es-EC');
  estudios[index].aprobadoPor = aprobadoPorNombre;
  
  try {
    localStorage.setItem(STORAGE_STUDIES_KEY, JSON.stringify(estudios));
    return true;
  } catch (e) {
    console.error('Error al aprobar descarga:', e);
    return false;
  }
}

export function bloquearDescargaEstudio(estudioId: string): boolean {
  const estudios = obtenerEstudiosGuardados();
  const index = estudios.findIndex(e => e.id === estudioId);
  if (index === -1) return false;

  estudios[index].estadoDescargaCliente = 'bloqueado';
  
  try {
    localStorage.setItem(STORAGE_STUDIES_KEY, JSON.stringify(estudios));
    return true;
  } catch (e) {
    console.error('Error al bloquear descarga:', e);
    return false;
  }
}

export function eliminarEstudioGuardado(estudioId: string): boolean {
  const estudios = obtenerEstudiosGuardados();
  const filtrados = estudios.filter(e => e.id !== estudioId);
  try {
    localStorage.setItem(STORAGE_STUDIES_KEY, JSON.stringify(filtrados));
    return true;
  } catch (e) {
    console.error('Error al eliminar estudio:', e);
    return false;
  }
}

// ENTREGAS DE NÓMINA DE CLIENTES (SUBMISSION & NOTIFICATION)

export function obtenerEntregasNomina(): EntregaNominaCliente[] {
  try {
    const raw = localStorage.getItem(STORAGE_SUBMISSIONS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error al cargar entregas de nómina:', e);
  }
  return [];
}

export function registrarEntregaNomina(params: {
  rucEmpresa: string;
  nombreEmpresa: string;
  usuarioId: string;
  usuarioNombre: string;
  nombreArchivo: string;
  numRegistros: number;
  datosCenso: EmpleadoInput[];
}): EntregaNominaCliente {
  const entregas = obtenerEntregasNomina();

  const nueva: EntregaNominaCliente = {
    id: `ent-${Date.now()}`,
    rucEmpresa: params.rucEmpresa,
    nombreEmpresa: params.nombreEmpresa,
    usuarioId: params.usuarioId,
    usuarioNombre: params.usuarioNombre,
    nombreArchivo: params.nombreArchivo,
    numRegistros: params.numRegistros,
    fechaSubida: new Date().toLocaleString('es-EC'),
    notificadoAlActuario: false,
    datosCenso: params.datosCenso,
    estado: 'recibido'
  };

  entregas.unshift(nueva);
  try {
    localStorage.setItem(STORAGE_SUBMISSIONS_KEY, JSON.stringify(entregas));
  } catch (e) {
    console.error('Error al guardar entrega:', e);
  }

  return nueva;
}

export function notificarActuarioSubidaNomina(entregaId: string): boolean {
  const entregas = obtenerEntregasNomina();
  const index = entregas.findIndex(e => e.id === entregaId);
  if (index === -1) return false;

  entregas[index].notificadoAlActuario = true;
  entregas[index].fechaNotificacion = new Date().toLocaleString('es-EC');

  try {
    localStorage.setItem(STORAGE_SUBMISSIONS_KEY, JSON.stringify(entregas));
    return true;
  } catch (e) {
    console.error('Error al notificar al actuario:', e);
    return false;
  }
}

export function obtenerUltimaEntregaEmpresa(rucEmpresa?: string, nombreEmpresa?: string): EntregaNominaCliente | null {
  const entregas = obtenerEntregasNomina();
  const cleanRuc = rucEmpresa?.trim();
  const cleanNombre = nombreEmpresa?.trim().toLowerCase();

  const match = entregas.find(e => {
    if (cleanRuc && e.rucEmpresa && e.rucEmpresa === cleanRuc) return true;
    if (cleanNombre && e.nombreEmpresa.toLowerCase().includes(cleanNombre)) return true;
    return false;
  });

  return match || null;
}
