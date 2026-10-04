import { VariablesMacro, EmpleadoInput, EmpleadoProcesado, ResumenMotor, ItemSensibilidad, DatosEmpresaEstudio } from '../types/actuarial';
import * as XLSX from 'xlsx';

export const DEFAULT_VARIABLES_MACRO: VariablesMacro = {
  tasa_descuento: 0.075,      // 7.5% según mercado de bonos USD
  tasa_incremento_sal: 0.030,  // 3.0% inflación/incremento estimado
  tasa_rotacion: 0.050,        // 5.0% rotación histórica de la empresa
  sbu_vigente: 460.00,         // Salario Básico Unificado en Ecuador
  edad_retiro: 65,             // 65 años ordinaria
  factor_supervivencia: 0.85,  // Factor de supervivencia promedio
  coeficiente_tabla_m: 11.5,   // Coeficiente tabla Art. 218 Hombre
  coeficiente_tabla_f: 13.0,   // Coeficiente tabla Art. 218 Mujer
};

/**
 * Motor de Cálculo Actuarial que implementa estrictamente las fórmulas especificadas
 * e incluye las métricas contables NIIF (NIC 19): DBO, CSC (Current Service Cost) e IC (Interest Cost).
 */
export function procesarMotorActuarial(
  empleados: EmpleadoInput[],
  variables: VariablesMacro
): { resultados: EmpleadoProcesado[]; resumen: ResumenMotor } {
  const i = variables.tasa_descuento;
  const s = variables.tasa_incremento_sal;
  const r = variables.tasa_rotacion;
  const sbu = variables.sbu_vigente;
  const edadRetiro = variables.edad_retiro;
  const factorSupervivencia = variables.factor_supervivencia;

  const resultados: EmpleadoProcesado[] = [];

  empleados.forEach((empleado, index) => {
    const fila = index + 2;
    const warnings: string[] = [];
    
    // Normalizar Cédula (zfill 10)
    let rawCed = String(empleado.Cedula ?? '').trim().split('.')[0];
    const cedula = rawCed.length <= 10 && rawCed.length > 0 ? rawCed.padStart(10, '0') : rawCed || '0000000000';
    const nombre = String(empleado.Nombre ?? `Colaborador ${index + 1}`).trim();

    try {
      // Normalizar Género con soporte completo para F, FEM, FEMENINO, MUJER, H/M y nombres
      const genero = normalizarGeneroValor(empleado.Genero, nombre);

      // Normalizar Edad
      let rawEdad = typeof empleado.Edad === 'number' 
        ? empleado.Edad 
        : parseFloat(String(empleado.Edad || '30').replace(',', '.'));
      if (isNaN(rawEdad) || rawEdad < 18 || rawEdad > 85) {
        warnings.push(`Edad (${rawEdad}) normalizada a rango laboral.`);
        rawEdad = isNaN(rawEdad) ? 35 : Math.max(18, Math.min(80, rawEdad));
      }
      const edad = Math.round(rawEdad);

      // Normalizar Antigüedad
      let rawAntig = typeof empleado.Antiguedad === 'number'
        ? empleado.Antiguedad
        : parseFloat(String(empleado.Antiguedad || '1').replace(',', '.'));
      if (isNaN(rawAntig) || rawAntig < 0 || rawAntig > 60) {
        warnings.push(`Antigüedad (${rawAntig}) ajustada.`);
        rawAntig = isNaN(rawAntig) ? 1 : Math.max(0, Math.min(50, rawAntig));
      }
      const antiguedad = Math.round(rawAntig);

      // Normalizar Sueldo
      let rawSueldo = String(empleado.Sueldo_Actual ?? sbu)
        .replace('$', '')
        .replace('USD', '')
        .trim();
      if (rawSueldo.includes(',') && rawSueldo.includes('.')) {
        rawSueldo = rawSueldo.replace(/,/g, '');
      } else if (rawSueldo.includes(',')) {
        rawSueldo = rawSueldo.replace(',', '.');
      }
      let sueldo = parseFloat(rawSueldo);
      if (isNaN(sueldo) || sueldo <= 0) {
        sueldo = sbu;
        warnings.push(`Sueldo no numérico. Se asignó SBU vigente ($${sbu}).`);
      }

      // --- CÁLCULO EXACTO SEGÚN EL MOTOR ACTUARIAL ---
      const aniosFaltantes = Math.max(0, edadRetiro - edad);
      const antiguedadAlRetiro = antiguedad + aniosFaltantes;

      // 1. CÁLCULO DE DESAHUCIO
      const factorCrecimiento = Math.pow(1 + s, aniosFaltantes);
      const sueldoProyectado = sueldo * factorCrecimiento;
      const beneficioDesahucio = 0.25 * sueldoProyectado * antiguedadAlRetiro;
      const probPermanencia = Math.pow(1 - r, aniosFaltantes);
      const factorDescuento = Math.pow(1 + i, aniosFaltantes);

      const vpoDesahucio = factorDescuento > 0 
        ? (beneficioDesahucio * probPermanencia) / factorDescuento
        : 0;

      // Costo del Servicio Actual (CSC) para Desahucio bajo PUCM:
      // Beneficio atribuible a 1 año de servicio actual
      const cscDesahucio = antiguedadAlRetiro > 0 
        ? (vpoDesahucio / antiguedadAlRetiro) 
        : 0;

      // 2. CÁLCULO DE JUBILACIÓN PATRONAL
      let vpoJubilacion = 0.0;
      let cscJubilacion = 0.0;
      let elegible = false;
      let coefTabla = genero === 'M' ? variables.coeficiente_tabla_m : variables.coeficiente_tabla_f;
      let pensionAnualTeorica = 0.0;
      let pensionMensualTeorica = 0.0;
      let pensionMensual = 0.0;
      let pensionAnualLimite = 0.0;
      let topeAplicado: 'NINGUNO' | 'MINIMO_0.5_SBU' | 'MAXIMO_1.0_SBU' = 'NINGUNO';

      if (antiguedadAlRetiro >= 25) {
        elegible = true;
        coefTabla = genero === 'M' ? variables.coeficiente_tabla_m : variables.coeficiente_tabla_f;
        
        pensionAnualTeorica = (sueldoProyectado * 12 * 0.05) / coefTabla;
        pensionMensualTeorica = pensionAnualTeorica / 12;
        pensionMensual = pensionMensualTeorica;

        const topeMin = sbu * 0.5;
        const topeMax = sbu;

        if (pensionMensual < topeMin) {
          pensionMensual = topeMin;
          topeAplicado = 'MINIMO_0.5_SBU';
        } else if (pensionMensual > topeMax) {
          pensionMensual = topeMax;
          topeAplicado = 'MAXIMO_1.0_SBU';
        } else {
          topeAplicado = 'NINGUNO';
        }

        pensionAnualLimite = pensionMensual * 12;

        vpoJubilacion = factorDescuento > 0
          ? ((pensionAnualLimite * coefTabla) * factorSupervivencia * probPermanencia) / factorDescuento
          : 0;

        // Costo del Servicio Actual (CSC) para Jubilación bajo PUCM:
        cscJubilacion = antiguedadAlRetiro > 0 
          ? (vpoJubilacion / antiguedadAlRetiro) 
          : 0;
      }

      const vpoDesahucioRound = Math.round(vpoDesahucio * 100) / 100;
      const vpoJubilacionRound = Math.round(vpoJubilacion * 100) / 100;
      const vpoTotalRound = Math.round((vpoDesahucioRound + vpoJubilacionRound) * 100) / 100;
      const cscDesahucioRound = Math.round(cscDesahucio * 100) / 100;
      const cscJubilacionRound = Math.round(cscJubilacion * 100) / 100;
      const cscTotalRound = Math.round((cscDesahucioRound + cscJubilacionRound) * 100) / 100;
      const costoInteresInd = Math.round(vpoTotalRound * i * 100) / 100;

      resultados.push({
        id: `${cedula}_${index}`,
        filaOriginal: fila,
        Cedula: cedula,
        Nombre: nombre,
        Genero: genero,
        Edad: edad,
        Antiguedad: antiguedad,
        Sueldo_Actual: Math.round(sueldo * 100) / 100,
        Cargo: empleado.Cargo || 'General',
        anios_faltantes: aniosFaltantes,
        antiguedad_al_retiro: antiguedadAlRetiro,
        sueldo_proyectado: Math.round(sueldoProyectado * 100) / 100,
        beneficio_desahucio: Math.round(beneficioDesahucio * 100) / 100,
        prob_permanencia: Math.round(probPermanencia * 10000) / 10000,
        factor_descuento: Math.round(factorDescuento * 10000) / 10000,
        VPO_Desahucio: vpoDesahucioRound,
        csc_desahucio: cscDesahucioRound,
        elegible_jubilacion: elegible,
        coeficiente_tabla: coefTabla,
        pension_anual_teorica: Math.round(pensionAnualTeorica * 100) / 100,
        pension_mensual_teorica: Math.round(pensionMensualTeorica * 100) / 100,
        pension_mensual: Math.round(pensionMensual * 100) / 100,
        tope_aplicado: topeAplicado,
        pension_anual_limite: Math.round(pensionAnualLimite * 100) / 100,
        VPO_Jubilacion: vpoJubilacionRound,
        csc_jubilacion: cscJubilacionRound,
        VPO_Total: vpoTotalRound,
        csc_total: cscTotalRound,
        costo_interes_individual: costoInteresInd,
        warnings
      });

    } catch (err: any) {
      resultados.push({
        id: `${cedula}_${index}`,
        filaOriginal: fila,
        Cedula: cedula,
        Nombre: nombre,
        Genero: 'M',
        Edad: 30,
        Antiguedad: 0,
        Sueldo_Actual: 0,
        Cargo: 'Error',
        anios_faltantes: 0,
        antiguedad_al_retiro: 0,
        sueldo_proyectado: 0,
        beneficio_desahucio: 0,
        prob_permanencia: 0,
        factor_descuento: 1,
        VPO_Desahucio: 0.0,
        csc_desahucio: 0.0,
        elegible_jubilacion: false,
        coeficiente_tabla: 11.5,
        pension_anual_teorica: 0,
        pension_mensual_teorica: 0,
        pension_mensual: 0,
        tope_aplicado: 'NINGUNO',
        pension_anual_limite: 0,
        VPO_Jubilacion: 0.0,
        csc_jubilacion: 0.0,
        VPO_Total: 0.0,
        csc_total: 0.0,
        costo_interes_individual: 0.0,
        error: String(err.message || err),
        warnings: [`Error en procesamiento: ${err.message}`]
      });
    }
  });

  const totalEmpleados = resultados.length;
  const elegibles = resultados.filter(r => r.elegible_jubilacion);
  const totalDesahucio = resultados.reduce((acc, r) => acc + r.VPO_Desahucio, 0);
  const totalJubilacion = resultados.reduce((acc, r) => acc + r.VPO_Jubilacion, 0);
  const totalVPO = Math.round((totalDesahucio + totalJubilacion) * 100) / 100;
  const totalCSC = Math.round(resultados.reduce((acc, r) => acc + r.csc_total, 0) * 100) / 100;
  const costoInteresEstimado = Math.round(totalVPO * i * 100) / 100;
  const gastoTotalPeriodo = Math.round((totalCSC + costoInteresEstimado) * 100) / 100;
  const totalNomina = resultados.reduce((acc, r) => acc + r.Sueldo_Actual, 0);
  const sumaEdad = resultados.reduce((acc, r) => acc + r.Edad, 0);
  const sumaAntig = resultados.reduce((acc, r) => acc + r.Antiguedad, 0);

  const resumen: ResumenMotor = {
    total_empleados: totalEmpleados,
    empleados_elegibles: elegibles.length,
    porcentaje_elegibles: totalEmpleados > 0 ? Math.round((elegibles.length / totalEmpleados) * 1000) / 10 : 0,
    vpo_desahucio_total: Math.round(totalDesahucio * 100) / 100,
    vpo_jubilacion_total: Math.round(totalJubilacion * 100) / 100,
    vpo_total: totalVPO,
    costo_servicio_actual_total: totalCSC,
    costo_interes_estimado: costoInteresEstimado,
    gasto_total_niif: gastoTotalPeriodo,
    nomina_mensual_total: Math.round(totalNomina * 100) / 100,
    nomina_anual_total: Math.round(totalNomina * 12 * 100) / 100,
    edad_promedio: totalEmpleados > 0 ? Math.round((sumaEdad / totalEmpleados) * 10) / 10 : 0,
    antiguedad_promedio: totalEmpleados > 0 ? Math.round((sumaAntig / totalEmpleados) * 10) / 10 : 0
  };

  return { resultados, resumen };
}

/**
 * Análisis de Sensibilidad Actuarial (Exigencia NIC 19 § 145 / Módulo 3)
 * Variaciones en tasa de descuento (±1%, ±0.5%) y tasa salarial (±1%, ±0.5%)
 */
export function calcularSensibilidadNIIF(
  empleados: EmpleadoInput[],
  variablesBase: VariablesMacro
): ItemSensibilidad[] {
  if (!empleados || empleados.length === 0) return [];

  const { resumen: baseRes } = procesarMotorActuarial(empleados, variablesBase);
  const vpoBase = baseRes.vpo_total;

  const escenarios = [
    { nombre: 'Escenario Base Actual', dI: 0.0, dS: 0.0 },
    { nombre: 'Tasa de Descuento (+1.0%)', dI: 0.010, dS: 0.0 },
    { nombre: 'Tasa de Descuento (-1.0%)', dI: -0.010, dS: 0.0 },
    { nombre: 'Tasa de Incremento Salarial (+1.0%)', dI: 0.0, dS: 0.010 },
    { nombre: 'Tasa de Incremento Salarial (-1.0%)', dI: 0.0, dS: -0.010 },
    { nombre: 'Tasa de Descuento (+0.5%)', dI: 0.005, dS: 0.0 },
    { nombre: 'Tasa de Descuento (-0.5%)', dI: -0.005, dS: 0.0 },
    { nombre: 'Tasa de Incremento Salarial (+0.5%)', dI: 0.0, dS: 0.005 },
    { nombre: 'Tasa de Incremento Salarial (-0.5%)', dI: 0.0, dS: -0.005 },
  ];

  return escenarios.map(esc => {
    const varsEscenario: VariablesMacro = {
      ...variablesBase,
      tasa_descuento: Math.max(0.01, variablesBase.tasa_descuento + esc.dI),
      tasa_incremento_sal: Math.max(0.00, variablesBase.tasa_incremento_sal + esc.dS)
    };

    const { resumen } = procesarMotorActuarial(empleados, varsEscenario);
    const diff = resumen.vpo_total - vpoBase;
    const pct = vpoBase > 0 ? (diff / vpoBase) * 100 : 0;

    return {
      escenario: esc.nombre,
      delta_i: esc.dI,
      delta_s: esc.dS,
      tasa_descuento_pct: Math.round(varsEscenario.tasa_descuento * 10000) / 100,
      tasa_salario_pct: Math.round(varsEscenario.tasa_incremento_sal * 10000) / 100,
      vpo_desahucio: resumen.vpo_desahucio_total,
      vpo_jubilacion: resumen.vpo_jubilacion_total,
      vpo_total: resumen.vpo_total,
      variacion_usd: Math.round(diff * 100) / 100,
      variacion_pct: Math.round(pct * 100) / 100
    };
  });
}

/**
 * Normaliza el género reconociendo todas las variantes del español y sistemas de nómina ecuatorianos:
 * 'F', 'FEM', 'FEMENINO', 'MUJER', 'MUJERES', '2', 'FEMALE', y detección de 'M' como Mujer cuando 'H' es Hombre.
 * Incluye inferencia por nombres si el dato viene en blanco en el Excel.
 */
export function normalizarGeneroValor(val: any, nombreReferencia?: string, usesHforHombre: boolean = false): 'M' | 'F' {
  if (val !== undefined && val !== null) {
    const s = String(val).trim().toUpperCase();
    
    // Variantes inequívocas de Femenino
    if (
      s === 'F' ||
      s === 'FEM' ||
      s === 'FEMENINO' ||
      s === 'FEMENINA' ||
      s === 'MUJER' ||
      s === 'MUJERES' ||
      s === 'FEMALE' ||
      s === '2' || // Código 2 = Femenino según codificación INEC / IESS
      s.startsWith('FEM') ||
      s.startsWith('MUJ')
    ) {
      return 'F';
    }

    // Si la nómina usa 'H' para Hombre, entonces 'M' significa Mujer
    if (usesHforHombre && (s === 'M' || s.startsWith('MUJ'))) {
      return 'F';
    }

    // Variantes inequívocas de Masculino
    if (
      s === 'M' ||
      s === 'MAS' ||
      s === 'MASC' ||
      s === 'MASCULINO' ||
      s === 'H' ||
      s === 'HOMBRE' ||
      s === 'VARON' ||
      s === 'VARONES' ||
      s === '1' || // Código 1 = Masculino
      s.startsWith('MAS') ||
      s.startsWith('HOM') ||
      s.startsWith('VAR')
    ) {
      return 'M';
    }
  }

  // Heurística de respaldo por nombre común en Ecuador si la celda de género venía vacía
  if (nombreReferencia) {
    const n = nombreReferencia.trim().toUpperCase();
    const primerosNombres = n.split(/\s+/);
    const primerNombre = primerosNombres[0] || '';
    const segundoNombre = primerosNombres[1] || '';

    const nombresFemeninosComunes = [
      'MARIA', 'MARTHA', 'DIANA', 'JESSICA', 'JENNIFFER', 'JENNY', 'ANDREA', 'GABRIELA',
      'VALENTINA', 'CAROLINA', 'STEPHANY', 'MELISSA', 'MARIUXI', 'INGRID', 'VANESSA',
      'KARLA', 'GENESIS', 'ISABEL', 'ANNABELL', 'EVELYN', 'SHIRLEY', 'FRANCISCA', 'LISSETH',
      'LADY', 'DENISSE', 'NICOLE', 'CRISTINA', 'PATRICIA', 'CARMEN', 'ROSA', 'ANA', 'TERESA',
      'BLANCA', 'ELIZABETH', 'SANDRA', 'VERONICA', 'MONICA', 'LUCIA', 'LAURA', 'DANIELA',
      'PAOLA', 'TATIANA', 'ERUNDINA', 'LOURDES', 'DAYANA', 'CLAUDINA', 'PAMELA', 'GABRIELA',
      'VICTORIA', 'MARIANA', 'ADRIANA', 'ARIANA', 'ALEXANDRA', 'IVETTE', 'NARCISA', 'MARCELA',
      'SILVIA', 'BRIGITTE', 'GISSELA', 'GLORIA', 'OLGA', 'VERONICA', 'STEFFANY'
    ];

    if (
      nombresFemeninosComunes.includes(primerNombre) || 
      nombresFemeninosComunes.includes(segundoNombre) ||
      (primerNombre.endsWith('A') && !['GARCIA', 'SILVA', 'ZURITA', 'CORDOVA', 'OCHOA', 'TAPIA', 'LUCA', 'JOSHUA'].includes(primerNombre))
    ) {
      return 'F';
    }
  }

  return 'M';
}

/**
 * Parsea fechas en formatos variados de Excel (serial numérico, Date, DD/MM/YYYY, YYYY-MM-DD)
 */
export function parsearFechaExcelADate(val: any): Date | null {
  if (val === undefined || val === null || val === '') return null;
  if (val instanceof Date && !isNaN(val.getTime())) return val;
  
  if (typeof val === 'number') {
    // Serial de fecha Excel (días transcurridos desde 1899-12-30)
    if (val > 1000 && val < 100000) {
      const ms = Math.round((val - 25569) * 86400 * 1000);
      const d = new Date(ms);
      if (!isNaN(d.getTime())) return d;
    }
  }

  const s = String(val).trim();
  // Formatos comunes en Ecuador: DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD
  const parts = s.split(/[\/\-\.]/);
  if (parts.length === 3) {
    let dia = parseInt(parts[0], 10);
    let mes = parseInt(parts[1], 10) - 1;
    let anio = parseInt(parts[2], 10);

    // Si viene YYYY-MM-DD
    if (parts[0].length === 4) {
      anio = parseInt(parts[0], 10);
      mes = parseInt(parts[1], 10) - 1;
      dia = parseInt(parts[2], 10);
    } else if (parts[2].length === 2) {
      anio = anio < 40 ? 2000 + anio : 1900 + anio;
    }

    if (!isNaN(anio) && !isNaN(mes) && !isNaN(dia)) {
      const d = new Date(anio, mes, dia);
      if (!isNaN(d.getTime())) return d;
    }
  }

  return null;
}

// Almacena metadatos de empresa detectados en el último archivo cargado
export interface MetadatosEmpresaDetectados {
  nombre_empresa?: string;
  nombre_comercial?: string;
  ruc?: string;
  direccion?: string;
  encargado?: string;
  provincia?: string;
  canton?: string;
  ciudad?: string;
  objeto_social?: string;
  mision?: string;
  vision?: string;
  fecha_corte_valuacion?: string;
  anio_evaluado?: number;
  provision_anterior_jubilacion?: number;
  provision_anterior_desahucio?: number;
  pagos_realizados_jubilacion?: number;
  pagos_realizados_desahucio?: number;
}

export let METADATOS_EMPRESA_DETECTADOS: MetadatosEmpresaDetectados = {};

/**
 * Escanea de forma exhaustiva todas las hojas y filas de un archivo Excel de la empresa
 * para extraer automáticamente parámetros del estudio y datos institucionales.
 */
export function extraerParametrosEmpresaDesdeArchivo(archivoBuffer: any): Partial<DatosEmpresaEstudio> {
  const wb = XLSX.read(archivoBuffer, { type: 'binary', cellDates: true });
  const metadatos: Partial<DatosEmpresaEstudio> = {};

  const cleanStr = (s: any) => 
    String(s ?? '')
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName];
    const data2D: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
    if (!data2D || data2D.length === 0) continue;

    for (let r = 0; r < Math.min(30, data2D.length); r++) {
      const row = data2D[r];
      if (!Array.isArray(row)) continue;
      for (let c = 0; c < row.length; c++) {
        const text = cleanStr(row[c]);
        const val1 = String(row[c + 1] ?? '').trim();
        const val2 = String(row[c + 2] ?? '').trim();
        const val = val1 || val2;

        if (text.includes('nombredelaempresa') || text.includes('razonsocial') || (text === 'empresa' && val)) {
          if (val && !metadatos.nombre_empresa) metadatos.nombre_empresa = val;
        }
        if (text.includes('nombrecomercial') || text.includes('marcacomer')) {
          if (val && !metadatos.nombre_comercial) metadatos.nombre_comercial = val;
        }
        if (text.includes('ruc') || text.includes('registrounicodecontribuyente')) {
          const rawDigits = val.replace(/[^0-9]/g, '');
          if (rawDigits.length >= 10 && !metadatos.ruc) metadatos.ruc = rawDigits;
        }
        if (text.includes('canton') || text.includes('ciudad') || text.includes('provincia')) {
          if (val && !metadatos.ciudad) metadatos.ciudad = val;
        }
        if (text.includes('objetosocial') || text.includes('actividadeconomica')) {
          if (val && !metadatos.objeto_social) metadatos.objeto_social = val;
        }
        if (text.includes('mision')) {
          if (val && !metadatos.mision) metadatos.mision = val;
        }
        if (text.includes('vision')) {
          if (val && !metadatos.vision) metadatos.vision = val;
        }
        if (text.includes('fechacorte') || text.includes('fechadevaluacion')) {
          if (val && !metadatos.fecha_corte_valuacion) metadatos.fecha_corte_valuacion = val;
        }
        if (text.includes('anio') || text.includes('ejercicio')) {
          const num = parseInt(val, 10);
          if (!isNaN(num) && num >= 2000 && num <= 2100 && !metadatos.anio_evaluado) {
            metadatos.anio_evaluado = num;
            metadatos.anio_anterior = num - 1;
          }
        }
        if ((text.includes('reserva') || text.includes('provision')) && text.includes('jubilacion')) {
          const num = parseFloat(String(val).replace(/[^0-9.-]/g, ''));
          if (!isNaN(num) && num > 0) metadatos.provision_anterior_jubilacion = num;
        }
        if ((text.includes('reserva') || text.includes('provision')) && text.includes('desahucio')) {
          const num = parseFloat(String(val).replace(/[^0-9.-]/g, ''));
          if (!isNaN(num) && num > 0) metadatos.provision_anterior_desahucio = num;
        }
      }
    }
  }

  return metadatos;
}

/**
 * Lector flexible de archivos Excel (.xlsx, .xls) y CSV con soporte exacto para:
 * 1. Formato oficial ecuatoriano con cabecera institucional (Nombre empresa, RUC, Dirección, etc.)
 * 2. Columnas: No. CÉDULA, NOMBRES, SEXO, FECHA DE NACIMIENTO, FECHA DE ENTRADA, SALIDA, REINGRESO, SUELDO DICIEMBRE, BONIFICACIONES, TOTAL
 * 3. Cálculo de Edad a partir de FECHA DE NACIMIENTO
 * 4. Cálculo de Antigüedad a partir de FECHA DE ENTRADA y SALIDA
 * 5. Determinación precisa del Sueldo_Actual a partir de la columna TOTAL (casillero 3)
 */
export function leerArchivoNomina(archivoBuffer: any): EmpleadoInput[] {
  const wb = XLSX.read(archivoBuffer, { type: 'binary', cellDates: true });
  const primerHoja = wb.SheetNames[0];
  const ws = wb.Sheets[primerHoja];

  // Extraer como matriz 2D para escanear cabeceras institucionales y títulos
  const data2D: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

  if (!data2D || data2D.length === 0) {
    throw new Error('El archivo no contiene filas de datos en su primera hoja.');
  }

  const cleanStr = (s: any) => 
    String(s ?? '')
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

  // Extraer metadatos de empresa de las primeras filas si existen
  METADATOS_EMPRESA_DETECTADOS = {};
  for (let r = 0; r < Math.min(10, data2D.length); r++) {
    const row = data2D[r];
    if (!Array.isArray(row)) continue;
    for (let c = 0; c < row.length; c++) {
      const cellText = cleanStr(row[c]);
      if (cellText.includes('nombredelaempresa') || cellText.includes('razonsocial')) {
        const val = String(row[c + 1] || row[c + 2] || '').trim();
        if (val) METADATOS_EMPRESA_DETECTADOS.nombre_empresa = val;
      }
      if (cellText.includes('ruc') || cellText.includes('registrounicodecontribuyente')) {
        const val = String(row[c + 1] || row[c + 2] || '').trim();
        if (val) METADATOS_EMPRESA_DETECTADOS.ruc = val;
      }
      if (cellText.includes('direccion')) {
        const val = String(row[c + 1] || row[c + 2] || '').trim();
        if (val) METADATOS_EMPRESA_DETECTADOS.direccion = val;
      }
      if (cellText.includes('encargado')) {
        const val = String(row[c + 1] || row[c + 2] || '').trim();
        if (val) METADATOS_EMPRESA_DETECTADOS.encargado = val;
      }
      if (cellText.includes('provincia')) {
        const val = String(row[c + 1] || '').trim();
        if (val) METADATOS_EMPRESA_DETECTADOS.provincia = val;
      }
      if (cellText.includes('canton')) {
        const val = String(row[c + 1] || '').trim();
        if (val) METADATOS_EMPRESA_DETECTADOS.canton = val;
      }
    }
  }

  // 1. Detectar en qué fila se encuentran los encabezados reales de la tabla de empleados
  let headerRowIdx = 0;
  let maxScore = -1;

  for (let r = 0; r < Math.min(25, data2D.length); r++) {
    const row = data2D[r];
    if (!Array.isArray(row)) continue;

    let score = 0;
    row.forEach(cell => {
      const c = cleanStr(cell);
      if (c.includes('cedula') || c.includes('identif') || c.includes('dni')) score += 4;
      if (c.includes('nombre') || c.includes('apellido') || c.includes('empleado') || c.includes('colaborador')) score += 4;
      if (c.includes('sexo') || c.includes('genero') || c === 'gen' || c === 'sex') score += 4;
      if (c.includes('nacim') || c.includes('edad')) score += 3;
      if (c.includes('entrada') || c.includes('ingreso') || c.includes('antigue') || c.includes('servicio')) score += 3;
      if (c.includes('sueldo') || c.includes('total') || c.includes('remunera') || c.includes('salario')) score += 3;
    });

    if (score > maxScore && score >= 4) {
      maxScore = score;
      headerRowIdx = r;
    }
  }

  const headerRow = data2D[headerRowIdx] || [];
  const headers = headerRow.map(h => cleanStr(h));

  // 2. Mapear índices de columnas
  let colCedula = -1;
  let colNombre = -1;
  let colApellidos = -1;
  let colSexo = -1;
  let colFechaNac = -1;
  let colEdad = -1;
  let colFechaEntrada = -1;
  let colFechaSalida = -1;
  let colFechaReingreso = -1;
  let colAntiguedad = -1;
  let colSueldoDic = -1;
  let colBonificaciones = -1;
  let colTotalSueldo = -1;
  let colSueldoGenerico = -1;
  let colReservaJub = -1;
  let colReservaDes = -1;
  let colCargo = -1;

  headers.forEach((h, colIdx) => {
    // Cédula
    if (colCedula === -1 && (h.includes('cedula') || h.includes('identif') || h.includes('dni') || h.includes('documento') || h === 'id' || h === 'ruc')) {
      colCedula = colIdx;
    }
    // Apellidos separados
    if (h.includes('apellido') && colApellidos === -1) {
      colApellidos = colIdx;
    }
    // Nombres
    if ((h.includes('nombre') || h.includes('colaborador') || h.includes('empleado') || h.includes('trabajador') || h.includes('personal') || h.includes('funcionario') || h.includes('beneficiario')) && colNombre === -1) {
      colNombre = colIdx;
    }
    // Sexo / Género
    if (colSexo === -1 && (h.includes('sexo') || h.includes('genero') || h === 'gen' || h === 'sex' || h === 'mf' || h === 'hm')) {
      colSexo = colIdx;
    }
    // Fecha de Nacimiento vs Edad
    if (colFechaNac === -1 && (h.includes('fechadenacimiento') || h.includes('fecnac') || h.includes('fechanac') || h.includes('nacimiento'))) {
      colFechaNac = colIdx;
    } else if (colEdad === -1 && (h === 'edad' || h.includes('edadactual') || h === 'age')) {
      colEdad = colIdx;
    }
    // Fecha de Entrada vs Antigüedad
    if (colFechaEntrada === -1 && (h.includes('fechadeentrada') || h.includes('fecing') || h.includes('fechaingreso') || h.includes('fechadeingreso') || h === 'entrada')) {
      colFechaEntrada = colIdx;
    } else if (colAntiguedad === -1 && (h.includes('antigue') || h.includes('tiemposerv') || h.includes('aniosdeservicio') || h.includes('servicio'))) {
      colAntiguedad = colIdx;
    }
    // Salida y Reingreso
    if (colFechaSalida === -1 && (h.includes('fechadesalida') || h.includes('fecsal') || h.includes('salida'))) {
      colFechaSalida = colIdx;
    }
    if (colFechaReingreso === -1 && (h.includes('fechadereingreso') || h.includes('fechareingreso') || h.includes('reingreso'))) {
      colFechaReingreso = colIdx;
    }
    // Sueldo a Diciembre (casillero 1) y Bonificaciones (casillero 2)
    if (colSueldoDic === -1 && (h.includes('sueldoadiciembre') || h.includes('sueldodiciembre') || (h.includes('sueldo') && h.includes('diciembre')))) {
      colSueldoDic = colIdx;
    }
    if (colBonificaciones === -1 && (h.includes('doceavaparte') || h.includes('bonificaciones') || h.includes('promediomensualbonificaciones'))) {
      colBonificaciones = colIdx;
    }
    // TOTAL (casillero 3)
    if (colTotalSueldo === -1 && (h === 'total' || h.includes('sueldototal') || h.includes('remuneraciontotal') || h.includes('totalremuneracion'))) {
      colTotalSueldo = colIdx;
    } else if (colSueldoGenerico === -1 && (h.includes('sueldo') || h.includes('salario') || h.includes('remunera') || h.includes('haber') || h.includes('ganado') || h.includes('basico'))) {
      colSueldoGenerico = colIdx;
    }
    // Reservas anteriores (casilleros 4 y 5)
    if (colReservaJub === -1 && (h.includes('jubilacion') && (h.includes('reserva') || h.includes('acumulada')))) {
      colReservaJub = colIdx;
    }
    if (colReservaDes === -1 && (h.includes('desahucio') && (h.includes('reserva') || h.includes('acumulada')))) {
      colReservaDes = colIdx;
    }
    // Cargo
    if (colCargo === -1 && (h.includes('cargo') || h.includes('puesto') || h.includes('ocupac') || h.includes('funcion'))) {
      colCargo = colIdx;
    }
  });

  // Fallback por posición si es la plantilla estándar del formato de la foto
  // (0: Cédula, 1: Nombres, 2: Sexo, 3: F. Nacimiento, 4: F. Entrada, 5: F. Salida, 6: F. Reingreso, 7: Sueldo Dic, 8: Bonif, 9: Total)
  if (colCedula === -1) colCedula = 0;
  if (colNombre === -1) colNombre = 1;
  if (colSexo === -1 && headerRow.length > 2) colSexo = 2;
  if (colFechaNac === -1 && colEdad === -1 && headerRow.length > 3) colFechaNac = 3;
  if (colFechaEntrada === -1 && colAntiguedad === -1 && headerRow.length > 4) colFechaEntrada = 4;
  if (colTotalSueldo === -1 && colSueldoDic === -1 && colSueldoGenerico === -1) {
    if (headerRow.length > 9) colTotalSueldo = 9;
    else if (headerRow.length > 7) colSueldoDic = 7;
    else if (headerRow.length > 5) colSueldoGenerico = 5;
  }

  // 3. Revisar si la columna de género usa 'H' para Hombre
  const filasDatos = data2D.slice(headerRowIdx + 1).filter(r => r && r.length > 0 && r.some((c: any) => String(c).trim() !== ''));
  const usesHforHombre = colSexo !== -1 && filasDatos.some(r => {
    const val = String(r[colSexo] ?? '').trim().toUpperCase();
    return val === 'H' || val === 'HOMBRE';
  });

  const fechaCorte = new Date(2023, 11, 31); // 31 de diciembre de 2023 por defecto

  // 4. Transformar filas de la nómina
  return filasDatos.map((r, idx) => {
    // Nombre
    let nombreFinal = '';
    if (colApellidos !== -1 && colNombre !== -1 && colApellidos !== colNombre) {
      const ape = String(r[colApellidos] ?? '').trim();
      const nom = String(r[colNombre] ?? '').trim();
      nombreFinal = `${ape} ${nom}`.trim();
    } else if (colNombre !== -1) {
      nombreFinal = String(r[colNombre] ?? '').trim();
    }
    if (!nombreFinal) {
      nombreFinal = `Colaborador ${idx + 1}`;
    }

    // Género (Sexo)
    const rawGen = colSexo !== -1 ? r[colSexo] : undefined;
    const generoFinal = normalizarGeneroValor(rawGen, nombreFinal, usesHforHombre);

    // Cédula
    let rawCed = String(colCedula !== -1 ? r[colCedula] : '').trim().replace(/['"]/g, '');
    if (rawCed.includes('.')) rawCed = rawCed.split('.')[0];

    // Edad (a partir de Fecha de Nacimiento o valor directo)
    let edadVal = 30;
    if (colFechaNac !== -1 && r[colFechaNac] !== undefined && r[colFechaNac] !== '') {
      const dNac = parsearFechaExcelADate(r[colFechaNac]);
      if (dNac) {
        const edadAnios = (fechaCorte.getTime() - dNac.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
        if (edadAnios >= 15 && edadAnios <= 90) {
          edadVal = Math.floor(edadAnios);
        }
      }
    }
    if (edadVal === 30 && colEdad !== -1 && r[colEdad] !== undefined && r[colEdad] !== '') {
      const num = parseFloat(String(r[colEdad]).replace(',', '.'));
      if (!isNaN(num) && num > 0) edadVal = num;
    }

    // Antigüedad (a partir de Fecha de Entrada o valor directo)
    let antigVal = 1;
    if (colFechaEntrada !== -1 && r[colFechaEntrada] !== undefined && r[colFechaEntrada] !== '') {
      const dEnt = parsearFechaExcelADate(r[colFechaEntrada]);
      if (dEnt) {
        let dFin = fechaCorte;
        if (colFechaSalida !== -1 && r[colFechaSalida]) {
          const dSal = parsearFechaExcelADate(r[colFechaSalida]);
          if (dSal && dSal < fechaCorte) {
            dFin = dSal;
          }
        }
        const antigAnios = (dFin.getTime() - dEnt.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
        if (antigAnios >= 0 && antigAnios <= 55) {
          antigVal = Math.round(antigAnios * 10) / 10;
        }
      }
    }
    if (antigVal === 1 && colAntiguedad !== -1 && r[colAntiguedad] !== undefined && r[colAntiguedad] !== '') {
      const num = parseFloat(String(r[colAntiguedad]).replace(',', '.'));
      if (!isNaN(num) && num >= 0) antigVal = num;
    }

    // Sueldo: prioridad Columna TOTAL (casillero 3), luego Sueldo Diciembre + Bonif, luego Sueldo genérico
    let sueldoVal = 460.00;
    const cleanNum = (val: any) => {
      if (val === undefined || val === null || val === '') return 0;
      let s = String(val).replace(/[^\d.,]/g, '').trim();
      if (s.includes(',') && s.includes('.')) s = s.replace(/,/g, '');
      else if (s.includes(',')) s = s.replace(',', '.');
      const n = parseFloat(s);
      return isNaN(n) ? 0 : n;
    };

    const valTotal = colTotalSueldo !== -1 ? cleanNum(r[colTotalSueldo]) : 0;
    const valSueldoDic = colSueldoDic !== -1 ? cleanNum(r[colSueldoDic]) : 0;
    const valBonif = colBonificaciones !== -1 ? cleanNum(r[colBonificaciones]) : 0;
    const valGenerico = colSueldoGenerico !== -1 ? cleanNum(r[colSueldoGenerico]) : 0;

    if (valTotal > 0) {
      sueldoVal = valTotal;
    } else if (valSueldoDic > 0) {
      sueldoVal = valSueldoDic + valBonif;
    } else if (valGenerico > 0) {
      sueldoVal = valGenerico;
    }

    // Reservas anteriores
    const resJub = colReservaJub !== -1 ? cleanNum(r[colReservaJub]) : 0;
    const resDes = colReservaDes !== -1 ? cleanNum(r[colReservaDes]) : 0;

    // Cargo
    const cargoVal = colCargo !== -1 && r[colCargo] ? String(r[colCargo]).trim() : 'Colaborador';

    return {
      Cedula: rawCed || `999${String(idx).padStart(7, '0')}`,
      Nombre: nombreFinal,
      Genero: generoFinal,
      Edad: Math.round(edadVal),
      Antiguedad: Math.round(antigVal),
      Sueldo_Actual: Math.round(sueldoVal * 100) / 100,
      Cargo: cargoVal,
      Reserva_Jubilacion_Ant: resJub,
      Reserva_Desahucio_Ant: resDes
    };
  });
}

/**
 * Exportar censo calculado con libro multi-hoja completo (NIIF / NIC 19)
 */
export function exportarResultadosAExcel(
  resultados: EmpleadoProcesado[],
  resumen: ResumenMotor,
  variables: VariablesMacro,
  sensibilidad?: ItemSensibilidad[]
) {
  // Hoja 1: Valuacion Detallada por Empleado
  const filasExcel = resultados.map(r => ({
    'Cedula': r.Cedula,
    'Nombre': r.Nombre,
    'Genero': r.Genero,
    'Edad': r.Edad,
    'Antiguedad': r.Antiguedad,
    'Sueldo_Actual': r.Sueldo_Actual,
    'Anios_Faltantes': r.anios_faltantes,
    'Antiguedad_Al_Retiro': r.antiguedad_al_retiro,
    'Sueldo_Proyectado': r.sueldo_proyectado,
    'VPO_Desahucio': r.VPO_Desahucio,
    'CSC_Desahucio': r.csc_desahucio,
    'Elegible_Jubilacion': r.elegible_jubilacion ? 'SI' : 'NO',
    'Pension_Mensual': r.pension_mensual,
    'Tope_Aplicado': r.tope_aplicado,
    'VPO_Jubilacion': r.VPO_Jubilacion,
    'CSC_Jubilacion': r.csc_jubilacion,
    'VPO_Total_DBO': r.VPO_Total,
    'CSC_Total': r.csc_total,
    'Costo_Interes': r.costo_interes_individual
  }));
  const ws1 = XLSX.utils.json_to_sheet(filasExcel);
  
  // Hoja 2: Resumen NIIF y Conciliación de Balance
  const resumenInfo = [
    { Concepto_Contable: 'NORMATIVA APLICABLE', Valor: 'NIC 19 / IAS 19 - Beneficios por Retiro (Ecuador)' },
    { Concepto_Contable: 'Tasa de Descuento Financiero (i)', Valor: `${(variables.tasa_descuento * 100).toFixed(2)}%` },
    { Concepto_Contable: 'Tasa de Incremento Salarial (s)', Valor: `${(variables.tasa_incremento_sal * 100).toFixed(2)}%` },
    { Concepto_Contable: 'Tasa de Rotacion Anual (r)', Valor: `${(variables.tasa_rotacion * 100).toFixed(2)}%` },
    { Concepto_Contable: 'Salario Basico Unificado (SBU)', Valor: `$ ${variables.sbu_vigente.toFixed(2)}` },
    { Concepto_Contable: 'Edad Ordinaria de Retiro', Valor: `${variables.edad_retiro} años` },
    { Concepto_Contable: 'Total Colaboradores Valuados', Valor: resumen.total_empleados },
    { Concepto_Contable: 'Colaboradores Elegibles Jubilacion Patronal', Valor: resumen.empleados_elegibles },
    { Concepto_Contable: 'Nomina Mensual Evaluada (USD)', Valor: `$ ${resumen.nomina_mensual_total.toLocaleString()}` },
    { Concepto_Contable: 'VPO Desahucio Total (Art. 185) (USD)', Valor: `$ ${resumen.vpo_desahucio_total.toLocaleString()}` },
    { Concepto_Contable: 'VPO Jubilacion Patronal Total (Art. 216) (USD)', Valor: `$ ${resumen.vpo_jubilacion_total.toLocaleString()}` },
    { Concepto_Contable: 'OBLIGACION POR BENEFICIOS DEFINIDOS (DBO TOTAL) (USD)', Valor: `$ ${resumen.vpo_total.toLocaleString()}` },
    { Concepto_Contable: 'Costo del Servicio Actual / Corriente (CSC) (USD)', Valor: `$ ${resumen.costo_servicio_actual_total.toLocaleString()}` },
    { Concepto_Contable: 'Costo por Interes Estimado (Interest Cost) (USD)', Valor: `$ ${resumen.costo_interes_estimado.toLocaleString()}` },
    { Concepto_Contable: 'GASTO TOTAL RECONOCIDO EN RESULTADOS DEL PERIODO (CSC + IC) (USD)', Valor: `$ ${resumen.gasto_total_niif.toLocaleString()}` }
  ];
  const ws2 = XLSX.utils.json_to_sheet(resumenInfo);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws1, 'Valuacion_Detallada');
  XLSX.utils.book_append_sheet(wb, ws2, 'Resumen_NIIF_Contable');

  // Hoja 3: Matriz de Sensibilidad si está disponible
  if (sensibilidad && sensibilidad.length > 0) {
    const ws3 = XLSX.utils.json_to_sheet(sensibilidad.map(s => ({
      'Escenario': s.escenario,
      'Tasa_Descuento_%': s.tasa_descuento_pct,
      'Tasa_Salarial_%': s.tasa_salario_pct,
      'VPO_Desahucio_USD': s.vpo_desahucio,
      'VPO_Jubilacion_USD': s.vpo_jubilacion,
      'DBO_Total_USD': s.vpo_total,
      'Variacion_USD': s.variacion_usd,
      'Variacion_%': s.variacion_pct
    })));
    XLSX.utils.book_append_sheet(wb, ws3, 'Matriz_Sensibilidad_NIC19');
  }

  XLSX.writeFile(wb, 'Valuacion_Actuarial_NIC19_Ecuador.xlsx');
}

export const STORAGE_KEY_CUSTOM_TEMPLATE = 'CUSTOM_PLANTILLA_ACTUARIAL_XLSX';
export const STORAGE_KEY_TEMPLATE_INFO = 'CUSTOM_PLANTILLA_ACTUARIAL_INFO';

export function guardarPlantillaPersonalizada(base64Data: string, fileName: string, sizeBytes: number) {
  localStorage.setItem(STORAGE_KEY_CUSTOM_TEMPLATE, base64Data);
  localStorage.setItem(STORAGE_KEY_TEMPLATE_INFO, JSON.stringify({
    nombre: fileName,
    fecha: new Date().toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    tamanioKb: Math.max(1, Math.round(sizeBytes / 1024))
  }));
}

export function obtenerInfoPlantillaPersonalizada(): { nombre: string; fecha: string; tamanioKb: number } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TEMPLATE_INFO);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function restablecerPlantillaPorDefecto() {
  localStorage.removeItem(STORAGE_KEY_CUSTOM_TEMPLATE);
  localStorage.removeItem(STORAGE_KEY_TEMPLATE_INFO);
}

/**
 * Genera y descarga la Plantilla Oficial idéntica al Formato de Información
 * aplicable al cálculo actuarial en Ecuador.
 * Si el Super Administrador subió una plantilla personalizada (.xlsx), se descarga esa.
 */
export function descargarPlantillaOficial() {
  try {
    const customB64 = localStorage.getItem(STORAGE_KEY_CUSTOM_TEMPLATE);
    const info = obtenerInfoPlantillaPersonalizada();
    if (customB64) {
      const binaryString = window.atob(customB64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = info?.nombre || 'Formato_Oficial_Informacion_Actuarial.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return;
    }
  } catch (e) {
    console.error('Error al descargar plantilla personalizada, usando predeterminada:', e);
  }

  const anioCorte = new Date().getFullYear();
  const matrizPlantilla: (string | number)[][] = [
    // Fila 0: Título Principal
    [
      'FORMATO DE INFORMACIÓN, APLICABLE AL CÁLCULO ACTUARIAL PARA LA PROVISIÓN CONTABLE DE',
      '', '', '', '', '', '', '',
      'Nota: Se suman todas las bonificaciones y adicionales mensuales'
    ],
    // Fila 1: Subtítulo
    [
      'JUBILACIÓN PATRONAL Y BONIFICACIÓN POR DESAHUCIO',
      '', '', '', '', '', '', '',
      '       durante el año y el total se divide para 12 meses'
    ],
    // Fila 2: Sección
    [
      'PERSONAL ACTIVO',
      '', '', '', '', '', '', '',
      '       se suma 1 más el promedio de 2 y se anota en el 3'
    ],
    // Fila 3: Empresa y Reserva Jubilación
    [
      'NOMBRE DE LA EMPRESA:', '', '', '', '', '', 'PROVINCIA:', '',
      'En Caso de haber reservas acumuladas del año anterior de JUBILACIÓN PATRONAL, ponerlas en el casillero 4'
    ],
    // Fila 4: Encargado y Reserva Desahucio
    [
      'ENCARGADO /A):', '', '', '', '', '', '', '',
      'En Caso de haber reservas acumuladas del año anterior de DESAHUCIOS,  ponerlas en el casillero 5'
    ],
    // Fila 5: RUC y Cantón
    [
      'No. Registro Unico de Contribuyente (RUC):', '', '', '', '', '', 'CANTON:', '', ''
    ],
    // Fila 6: Dirección
    [
      'DIRECCIÓN:', '', '', '', '', '', '', '', ''
    ],
    // Fila 7: Teléfonos
    [
      'TELÉFONO CEL.', '', '', 'TEL. CONVENCIONAL', '', '', '', '', ''
    ],
    // Fila 8: Correo y Números de Casillero [1, 2, 3, 4, 5]
    [
      'CORREO:', '', '', '', 'FECHA:', '', '', '1', '2', '3', '4', '5', ''
    ],
    // Fila 9: Encabezados exactos del formato oficial
    [
      'No. CÉDULA',
      'NOMBRES',
      'SEXO',
      'FECHA DE NACIMIENTO',
      'FECHA DE ENTRADA',
      'FECHA DE SALIDA',
      'FECHA DE REINGRESO',
      `SUELDO A DICIEMBRE ${anioCorte}`,
      `doceava parte proMEDIO MENSUAL BONIFICACIONES Y ADICIONALES DURANTE EL AÑO ${anioCorte}`,
      'TOTAL',
      'RESERVA ACTUARIAL ACUMLADA INDIVIDUALIZADA (SI LA HUBIERE) JUBILACION PATRONAL',
      'RESEVA ACTUARIAL ACUMULADA INDIVIDUALIZADA AÑOS ANTERIORES (SI LAS HUBIERE) BONIF. DESAHUCIO',
      'OBSERVACIONES'
    ],
    // Filas 10 a 14: Filas en blanco preparadas para que la empresa llene
    [
      '', '', '', '', '', '', '', '', '', '', '', '', ''
    ],
    [
      '', '', '', '', '', '', '', '', '', '', '', '', ''
    ],
    [
      '', '', '', '', '', '', '', '', '', '', '', '', ''
    ],
    [
      '', '', '', '', '', '', '', '', '', '', '', '', ''
    ],
    [
      '', '', '', '', '', '', '', '', '', '', '', '', ''
    ]
  ];

  const ws = XLSX.utils.aoa_to_sheet(matrizPlantilla);

  // Definir anchos de columna óptimos para cada campo
  ws['!cols'] = [
    { wch: 15 }, // No. CÉDULA
    { wch: 38 }, // NOMBRES
    { wch: 8 },  // SEXO
    { wch: 22 }, // FECHA DE NACIMIENTO
    { wch: 18 }, // FECHA DE ENTRADA
    { wch: 18 }, // FECHA DE SALIDA
    { wch: 18 }, // FECHA DE REINGRESO
    { wch: 24 }, // SUELDO A DICIEMBRE
    { wch: 38 }, // doceava parte bonificaciones
    { wch: 15 }, // TOTAL
    { wch: 34 }, // RESERVA JUBILACION
    { wch: 34 }, // RESERVA DESAHUCIO
    { wch: 25 }, // OBSERVACIONES
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Formato_Calculo_Actuarial');
  XLSX.writeFile(wb, 'Formato_Informacion_Calculo_Actuarial_Ecuador.xlsx');
}

/**
 * Parsea texto tabulado o delimitado pegado directamente desde Excel o Google Sheets,
 * utilizando la misma heurística de detección de cabeceras, nombres y género.
 */
export function parsearTextoPegado(pasteText: string): EmpleadoInput[] {
  const lines = pasteText.trim().split('\n').filter(l => l.trim().length > 0);
  if (lines.length < 2) {
    throw new Error('Pegue al menos una fila de encabezados y una fila con datos.');
  }

  const sep = lines[0].includes('\t') ? '\t' : lines[0].includes(';') ? ';' : ',';
  const data2D = lines.map(l => l.split(sep).map(p => p.trim().replace(/^["']|["']$/g, '')));
  
  const ws = XLSX.utils.aoa_to_sheet(data2D);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'PastedData');
  const buffer = XLSX.write(wb, { type: 'binary', bookType: 'xlsx' });
  return leerArchivoNomina(buffer);
}
