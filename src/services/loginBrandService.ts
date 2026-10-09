export interface LoginBrandConfig {
  // --- Textos del Panel Izquierdo (Formulario) ---
  textoBienvenida: string; // ej. "WELCOME TO"
  tituloFormulario: string; // ej. "VALUADOR ACTUARIAL"
  subtituloFormulario: string; // ej. "Portal Institucional de Nómina y Provisiones Laborales Ecuador · NIC 19"
  textoTabLogin: string; // ej. "Iniciar Sesión"
  textoTabRegistro: string; // ej. "Registrar Empresa"
  textoBotonLogin: string; // ej. "Ingresar al Portal"

  // --- Textos del Panel Derecho (Banner Institucional) ---
  badgeSuperior: string; // ej. "Certificación Oficial NIC 19"
  etiquetaSuperiorDerecha: string; // ej. "Ecuador 2026"
  tituloMarca: string; // ej. "INFINITY ACTUARIAL"
  subtituloMarca: string; // ej. "Plataforma actuarial certificada..."
  
  // --- Pie de 3 columnas del Banner ---
  pieCol1Titulo: string; // ej. "Art. 185"
  pieCol1Subtitulo: string; // ej. "Desahucio"
  pieCol2Titulo: string; // ej. "Art. 216"
  pieCol2Subtitulo: string; // ej. "Jubilación"
  pieCol3Titulo: string; // ej. "NIIF / IFRS"
  pieCol3Subtitulo: string; // ej. "PUCM & DBO"

  // --- Logotipo e Íconos ---
  tipoLogo: 'icono' | 'imagen';
  iconoSeleccionado: 'infinity' | 'shield' | 'building' | 'award' | 'calculator' | 'trending';
  logoUrlPersonalizado?: string; // Data URL o URL web

  // --- Fondo & Estilo Visual ---
  tipoFondo: 'degradado' | 'imagen' | 'ambos';
  estiloDegradado: 'rojo_infinity' | 'azul_corporativo' | 'purpura_indigo' | 'esmeralda_financiero' | 'oscuro_minimalista' | 'borgona_oro' | 'personalizado';
  colorInicioPersonalizado?: string;
  colorFinPersonalizado?: string;
  estiloImagen: 'ciudad_nocturna' | 'rascacielos' | 'arquitectura_cristal' | 'geometrico' | 'sala_directorio' | 'abstracto_financiero' | 'degradado_puro' | 'personalizada';
  imagenUrlPersonalizada?: string;
  fondoPantallaCompleta: boolean;
  opacidadFondo: number;
  desenfoqueFondo: 'ninguno' | 'suave' | 'medio' | 'fuerte';
  colorBotonFormulario: 'auto' | 'azul' | 'rojo' | 'purpura' | 'esmeralda' | 'negro';

  // --- Marca en Dashboard ---
  tituloDashboard: string; // ej. "VALUADOR ACTUARIAL"
  subtituloDashboard: string; // ej. "Ecuador · NIC 19 & Código del Trabajo"
}

const STORAGE_LOGIN_BRAND_KEY = 'SISTEMA_ACTUARIAL_LOGIN_BRAND_CONFIG_V2';

export const DEGRADADOS_PRESETS: Record<string, { 
  nombre: string; 
  cssGradient: string; 
  badgeColor: string; 
  buttonColor: string; 
  accentColor: string;
  previewColors: [string, string];
}> = {
  rojo_infinity: {
    nombre: 'Rojo Corporativo Infinity (Elegante & Institucional)',
    cssGradient: 'linear-gradient(135deg, #4c0519 0%, #9f1239 40%, #e11d48 75%, #f43f5e 100%)',
    badgeColor: 'bg-rose-500/20 text-rose-200 border-rose-400/30',
    buttonColor: 'bg-rose-600 hover:bg-rose-700',
    accentColor: '#e11d48',
    previewColors: ['#4c0519', '#f43f5e']
  },
  azul_corporativo: {
    nombre: 'Azul Marino Corporativo / Navy Clásico',
    cssGradient: 'linear-gradient(135deg, #0a192f 0%, #1e3a8a 50%, #0284c7 100%)',
    badgeColor: 'bg-blue-500/20 text-blue-200 border-blue-400/30',
    buttonColor: 'bg-blue-700 hover:bg-blue-800',
    accentColor: '#2563eb',
    previewColors: ['#0a192f', '#0284c7']
  },
  purpura_indigo: {
    nombre: 'Púrpura Imperial & Royal Indigo Ejecutivo',
    cssGradient: 'linear-gradient(135deg, #181928 0%, #312e81 40%, #4f46e5 80%, #6366f1 100%)',
    badgeColor: 'bg-indigo-500/20 text-indigo-200 border-indigo-400/30',
    buttonColor: 'bg-[#5b52f9] hover:bg-[#4f46e5]',
    accentColor: '#5b52f9',
    previewColors: ['#181928', '#6366f1']
  },
  esmeralda_financiero: {
    nombre: 'Verde Esmeralda Financiero & Auditoría',
    cssGradient: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #10b981 100%)',
    badgeColor: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30',
    buttonColor: 'bg-emerald-700 hover:bg-emerald-800',
    accentColor: '#059669',
    previewColors: ['#064e3b', '#10b981']
  },
  oscuro_minimalista: {
    nombre: 'Dark Slate Minimalista / Medianoche Deep',
    cssGradient: 'linear-gradient(135deg, #090d16 0%, #1e293b 50%, #334155 100%)',
    badgeColor: 'bg-slate-500/20 text-slate-200 border-slate-400/30',
    buttonColor: 'bg-slate-800 hover:bg-slate-700',
    accentColor: '#334155',
    previewColors: ['#090d16', '#334155']
  },
  borgona_oro: {
    nombre: 'Borgoña & Oro Presidencial',
    cssGradient: 'linear-gradient(135deg, #3b0764 0%, #701a75 50%, #b45309 100%)',
    badgeColor: 'bg-amber-500/20 text-amber-200 border-amber-400/30',
    buttonColor: 'bg-purple-800 hover:bg-purple-900',
    accentColor: '#d97706',
    previewColors: ['#3b0764', '#b45309']
  }
};

export const FONDOS_IMAGENES_PRESETS: Record<string, { nombre: string; url: string; descripcion: string }> = {
  ciudad_nocturna: {
    nombre: 'Metrópolis Nocturna & Luces Financieras',
    url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=1600&auto=format&fit=crop',
    descripcion: 'Vista aérea de rascacielos con iluminación nocturna dorada y azul'
  },
  rascacielos: {
    nombre: 'Torres Corporativas & Rascacielos al Atardecer',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1600&auto=format&fit=crop',
    descripcion: 'Fachada vertical de arquitectura financiera moderna'
  },
  arquitectura_cristal: {
    nombre: 'Edificio Financiero de Cristal & Estructura',
    url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1600&auto=format&fit=crop',
    descripcion: 'Vidrio templado e ingeniería corporativa de vanguardia'
  },
  geometrico: {
    nombre: 'Espacio Ejecutivo & Modernidad',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1600&auto=format&fit=crop',
    descripcion: 'Espacio de trabajo sobrio y contemporáneo'
  },
  sala_directorio: {
    nombre: 'Directorio Ejecutivo & Salón Corporativo',
    url: 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?q=80&w=1600&auto=format&fit=crop',
    descripcion: 'Sala de juntas de alta dirección y toma de decisiones'
  },
  abstracto_financiero: {
    nombre: 'Textura Futurista de Datos & Luces',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1600&auto=format&fit=crop',
    descripcion: 'Líneas de conexión global y tecnología'
  },
  degradado_puro: {
    nombre: 'Degradado Puro (Sin fotografía)',
    url: '',
    descripcion: 'Fondo limpio con color de degradado sólido'
  }
};

export const DEFAULT_LOGIN_BRAND_CONFIG: LoginBrandConfig = {
  // Panel Izquierdo (Formulario)
  textoBienvenida: 'WELCOME TO',
  tituloFormulario: 'VALUADOR ACTUARIAL',
  subtituloFormulario: 'Portal Institucional de Nómina y Provisiones Laborales Ecuador · NIC 19',
  textoTabLogin: 'Iniciar Sesión',
  textoTabRegistro: 'Registrar Empresa',
  textoBotonLogin: 'Ingresar al Portal',

  // Panel Derecho (Banner)
  badgeSuperior: 'Certificación Oficial NIC 19',
  etiquetaSuperiorDerecha: 'Ecuador 2026',
  tituloMarca: 'INFINITY ACTUARIAL',
  subtituloMarca: 'Plataforma actuarial certificada para la valoración de pasivos laborales bajo la Norma Internacional de Contabilidad NIC 19 y el Código del Trabajo del Ecuador.',
  
  // Pie de 3 columnas del Banner
  pieCol1Titulo: 'Art. 185',
  pieCol1Subtitulo: 'Desahucio',
  pieCol2Titulo: 'Art. 216',
  pieCol2Subtitulo: 'Jubilación',
  pieCol3Titulo: 'NIIF / IFRS',
  pieCol3Subtitulo: 'PUCM & DBO',

  // Logotipo
  tipoLogo: 'icono',
  iconoSeleccionado: 'infinity',
  logoUrlPersonalizado: '',

  // Fondo & Colores
  tipoFondo: 'ambos',
  estiloDegradado: 'rojo_infinity',
  colorInicioPersonalizado: '#4c0519',
  colorFinPersonalizado: '#f43f5e',
  estiloImagen: 'ciudad_nocturna',
  imagenUrlPersonalizada: '',
  fondoPantallaCompleta: true,
  opacidadFondo: 0.50,
  desenfoqueFondo: 'suave',
  colorBotonFormulario: 'auto',

  // Dashboard
  tituloDashboard: 'VALUADOR ACTUARIAL',
  subtituloDashboard: 'Ecuador · NIC 19 & Código del Trabajo'
};

export function obtenerLoginBrandConfig(): LoginBrandConfig {
  try {
    const raw = localStorage.getItem(STORAGE_LOGIN_BRAND_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.estiloDegradado === 'purpura_finnova') {
        parsed.estiloDegradado = 'purpura_indigo';
      }
      return { ...DEFAULT_LOGIN_BRAND_CONFIG, ...parsed };
    }
    // Fallback retrocompatible con V1 si existía
    const rawV1 = localStorage.getItem('SISTEMA_ACTUARIAL_LOGIN_BRAND_CONFIG_V1');
    if (rawV1) {
      const parsedV1 = JSON.parse(rawV1);
      if (parsedV1.estiloDegradado === 'purpura_finnova') {
        parsedV1.estiloDegradado = 'purpura_indigo';
      }
      return { ...DEFAULT_LOGIN_BRAND_CONFIG, ...parsedV1 };
    }
  } catch (e) {
    console.error('Error al obtener configuración de marca login:', e);
  }
  return DEFAULT_LOGIN_BRAND_CONFIG;
}

export function guardarLoginBrandConfig(config: LoginBrandConfig): void {
  try {
    localStorage.setItem(STORAGE_LOGIN_BRAND_KEY, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent('login-brand-config-updated', { detail: config }));
  } catch (e) {
    console.error('Error al guardar configuración de marca login:', e);
  }
}
