export interface LoginBrandConfig {
  tituloMarca: string;
  subtituloMarca: string;
  estiloDegradado: 'azul_corporativo' | 'rojo_infinity' | 'purpura_finnova' | 'esmeralda_financiero' | 'oscuro_minimalista';
  estiloImagen: 'ciudad_nocturna' | 'rascacielos' | 'arquitectura_cristal' | 'geometrico' | 'degradado_puro';
  imagenUrlPersonalizada?: string;
  mostrarInsignias: boolean;
}

const STORAGE_LOGIN_BRAND_KEY = 'SISTEMA_ACTUARIAL_LOGIN_BRAND_CONFIG_V1';

export const DEGRADADOS_PRESETS: Record<string, { nombre: string; cssGradient: string; badgeColor: string; buttonColor: string }> = {
  azul_corporativo: {
    nombre: 'Azul Corporativo / Navy (Predeterminado)',
    cssGradient: 'linear-gradient(135deg, #0a192f 0%, #1e3a8a 50%, #0284c7 100%)',
    badgeColor: 'bg-blue-500/20 text-blue-200 border-blue-400/30',
    buttonColor: 'bg-blue-700 hover:bg-blue-800'
  },
  rojo_infinity: {
    nombre: 'Rojo Corporativo Infinity (Estilo login.jpg)',
    cssGradient: 'linear-gradient(135deg, #4c0519 0%, #9f1239 40%, #e11d48 75%, #f43f5e 100%)',
    badgeColor: 'bg-rose-500/20 text-rose-200 border-rose-400/30',
    buttonColor: 'bg-rose-600 hover:bg-rose-700'
  },
  purpura_finnova: {
    nombre: 'Púrpura Finnova / Royal Indigo (Estilo Dashboard Finnova)',
    cssGradient: 'linear-gradient(135deg, #181928 0%, #312e81 40%, #4f46e5 80%, #6366f1 100%)',
    badgeColor: 'bg-indigo-500/20 text-indigo-200 border-indigo-400/30',
    buttonColor: 'bg-indigo-600 hover:bg-indigo-700'
  },
  esmeralda_financiero: {
    nombre: 'Verde Esmeralda Financiero',
    cssGradient: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #10b981 100%)',
    badgeColor: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30',
    buttonColor: 'bg-emerald-700 hover:bg-emerald-800'
  },
  oscuro_minimalista: {
    nombre: 'Dark Slate Minimalista',
    cssGradient: 'linear-gradient(135deg, #090d16 0%, #1e293b 50%, #334155 100%)',
    badgeColor: 'bg-slate-500/20 text-slate-200 border-slate-400/30',
    buttonColor: 'bg-slate-800 hover:bg-slate-700'
  }
};

export const FONDOS_IMAGENES_PRESETS: Record<string, { nombre: string; url: string }> = {
  ciudad_nocturna: {
    nombre: 'Ciudad & Metrópolis Nocturna (login.jpg)',
    url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=1200&auto=format&fit=crop'
  },
  rascacielos: {
    nombre: 'Torres Corporativas & Rascacielos',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop'
  },
  arquitectura_cristal: {
    nombre: 'Arquitectura Financiera de Cristal',
    url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop'
  },
  geometrico: {
    nombre: 'Textura Geométrica Abstracta',
    url: ''
  },
  degradado_puro: {
    nombre: 'Degradado Puro (Sin fotografía)',
    url: ''
  }
};

export const DEFAULT_LOGIN_BRAND_CONFIG: LoginBrandConfig = {
  tituloMarca: 'INFINITY ACTUARIAL',
  subtituloMarca: 'Plataforma actuarial certificada para la valoración de pasivos laborales bajo la Norma Internacional de Contabilidad NIC 19 y el Código del Trabajo del Ecuador.',
  estiloDegradado: 'rojo_infinity', // Coincide con la imagen login.jpg enviada por el usuario
  estiloImagen: 'ciudad_nocturna',  // Coincide con la imagen login.jpg
  mostrarInsignias: true
};

export function obtenerLoginBrandConfig(): LoginBrandConfig {
  try {
    const raw = localStorage.getItem(STORAGE_LOGIN_BRAND_KEY);
    if (raw) {
      return { ...DEFAULT_LOGIN_BRAND_CONFIG, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Error al obtener configuración de marca login:', e);
  }
  return DEFAULT_LOGIN_BRAND_CONFIG;
}

export function guardarLoginBrandConfig(config: LoginBrandConfig): void {
  try {
    localStorage.setItem(STORAGE_LOGIN_BRAND_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Error al guardar configuración de marca login:', e);
  }
}
