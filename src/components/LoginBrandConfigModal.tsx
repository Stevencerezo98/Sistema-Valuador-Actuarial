import React, { useState, useRef } from 'react';
import { 
  X, 
  Check, 
  Palette, 
  Image as ImageIcon, 
  Sparkles, 
  Save, 
  Eye, 
  RotateCcw,
  CheckCircle2,
  Upload,
  Layers,
  Infinity as InfinityIcon,
  ShieldCheck,
  Building,
  Award,
  Sliders,
  Type,
  LayoutDashboard,
  Lock,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { 
  LoginBrandConfig, 
  obtenerLoginBrandConfig, 
  guardarLoginBrandConfig, 
  DEFAULT_LOGIN_BRAND_CONFIG,
  DEGRADADOS_PRESETS,
  FONDOS_IMAGENES_PRESETS
} from '../services/loginBrandService';

interface LoginBrandConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved?: () => void;
  onCerrarSesion?: () => void;
}

export const LoginBrandConfigModal: React.FC<LoginBrandConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved,
  onCerrarSesion
}) => {
  const [config, setConfig] = useState<LoginBrandConfig>(() => obtenerLoginBrandConfig());
  const [activeSubTab, setActiveSubTab] = useState<'fondo' | 'formulario' | 'banner' | 'dashboard'>('fondo');
  const [guardadoExito, setGuardadoExito] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileLogoRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleGuardar = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    guardarLoginBrandConfig(config);
    setGuardadoExito(true);
    if (onConfigSaved) onConfigSaved();
    setTimeout(() => {
      setGuardadoExito(false);
      onClose();
    }, 1200);
  };

  const handleRestablecer = () => {
    if (confirm('¿Desea restablecer toda la configuración visual y de textos a los valores originales predeterminados?')) {
      setConfig(DEFAULT_LOGIN_BRAND_CONFIG);
      guardarLoginBrandConfig(DEFAULT_LOGIN_BRAND_CONFIG);
      if (onConfigSaved) onConfigSaved();
    }
  };

  // Subir imagen de fondo local
  const handleSubirImagenLocal = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor seleccione un archivo de imagen válido (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setConfig(prev => ({
          ...prev,
          tipoFondo: prev.tipoFondo === 'degradado' ? 'ambos' : prev.tipoFondo,
          estiloImagen: 'personalizada',
          imagenUrlPersonalizada: dataUrl
        }));
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Subir imagen de logotipo institucional
  const handleSubirLogoLocal = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setConfig(prev => ({
          ...prev,
          tipoLogo: 'imagen',
          logoUrlPersonalizado: dataUrl
        }));
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const presetActual = DEGRADADOS_PRESETS[config.estiloDegradado] || DEGRADADOS_PRESETS.rojo_infinity;
  const currentGradient = config.estiloDegradado === 'personalizado'
    ? `linear-gradient(135deg, ${config.colorInicioPersonalizado || '#4c0519'} 0%, ${config.colorFinPersonalizado || '#f43f5e'} 100%)`
    : presetActual.cssGradient;

  const imagenActual = config.estiloImagen === 'personalizada'
    ? config.imagenUrlPersonalizada || ''
    : (config.imagenUrlPersonalizada || FONDOS_IMAGENES_PRESETS[config.estiloImagen]?.url || '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-[28px] shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-5xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[94vh]">
        
        {/* Header Modal */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#5b52f9] to-[#7c3aed] text-white flex items-center justify-center shadow-md">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Personalización Total de Login & Dashboard
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold border border-purple-500/30">
                  Exclusivo Super Administrador
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Edite fondos, colores degradados, logotipo y todos los textos del formulario y banner institucional
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notificación de Éxito */}
        {guardadoExito && (
          <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between gap-3 shadow-xs shrink-0">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>¡Diseño y textos guardados exitosamente! Se han aplicado inmediatamente al sistema.</span>
            </div>
            {onCerrarSesion && (
              <button
                type="button"
                onClick={onCerrarSesion}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 transition cursor-pointer shrink-0"
              >
                Ver Login Ahora
              </button>
            )}
          </div>
        )}

        {/* Pestañas de Navegación del Panel de Configuración */}
        <div className="px-6 pt-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 flex items-center gap-1 shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab('fondo')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-2 border-b-2 ${
              activeSubTab === 'fondo'
                ? 'border-[#5b52f9] text-[#5b52f9] bg-white dark:bg-slate-900 shadow-xs'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>1. Fondo & Estilo Visual</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('formulario')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-2 border-b-2 ${
              activeSubTab === 'formulario'
                ? 'border-[#5b52f9] text-[#5b52f9] bg-white dark:bg-slate-900 shadow-xs'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Type className="w-4 h-4" />
            <span>2. Textos Formulario (Welcome to)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('banner')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-2 border-b-2 ${
              activeSubTab === 'banner'
                ? 'border-[#5b52f9] text-[#5b52f9] bg-white dark:bg-slate-900 shadow-xs'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>3. Banner & Marca (Infinity Actuarial)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('dashboard')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-2 border-b-2 ${
              activeSubTab === 'dashboard'
                ? 'border-[#5b52f9] text-[#5b52f9] bg-white dark:bg-slate-900 shadow-xs'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>4. Marca en Dashboard</span>
          </button>
        </div>

        {/* Cuerpo del Formulario con Scroll */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          
          {/* VISTA PREVIA EN VIVO DINÁMICA DE LA PANTALLA DE ACCESO */}
          <div className="space-y-2 pb-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-[#5b52f9]" />
                <span>Vista Previa en Vivo (Refleja sus cambios en tiempo real):</span>
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                Modo: {config.tipoFondo.toUpperCase()} · {config.estiloDegradado}
              </span>
            </div>

            <div 
              className="w-full rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700 relative p-4 flex items-center justify-center transition-all min-h-[190px]"
              style={{
                background: currentGradient,
                backgroundImage: imagenActual && (config.tipoFondo === 'imagen' || config.tipoFondo === 'ambos')
                  ? `url(${imagenActual})`
                  : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundBlendMode: config.tipoFondo === 'ambos' ? 'overlay' : 'normal'
              }}
            >
              <div className="absolute inset-0 bg-black/35 pointer-events-none" />

              {/* Simulación del Card Split de Login */}
              <div className="relative z-10 w-full max-w-xl bg-slate-900/90 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-4 text-white grid grid-cols-12 gap-3 items-center">
                {/* Panel Izquierdo Simulado */}
                <div className="col-span-6 border-r border-white/10 pr-3 space-y-2">
                  <div className="text-center">
                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest block">
                      {config.textoBienvenida || 'WELCOME TO'}
                    </span>
                    <div className="text-xs font-black tracking-tight text-blue-400 uppercase mt-0.5 flex items-center justify-center gap-1">
                      {config.tipoLogo === 'imagen' && config.logoUrlPersonalizado ? (
                        <img src={config.logoUrlPersonalizado} alt="Logo" className="w-4 h-4 object-contain rounded" />
                      ) : config.iconoSeleccionado === 'shield' ? (
                        <ShieldCheck className="w-3.5 h-3.5" />
                      ) : (
                        <InfinityIcon className="w-3.5 h-3.5" />
                      )}
                      <span>{config.tituloFormulario || 'VALUADOR ACTUARIAL'}</span>
                    </div>
                  </div>

                  <div className="p-1 rounded-lg bg-black/30 grid grid-cols-2 gap-1 text-[9px] font-bold text-center">
                    <div className="bg-white/20 rounded py-0.5 text-white">{config.textoTabLogin || 'Iniciar Sesión'}</div>
                    <div className="text-slate-400 py-0.5">{config.textoTabRegistro || 'Registrar'}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="h-4 rounded bg-white/10 text-[8px] text-slate-400 flex items-center px-1.5 font-mono">usuario@empresa.ec</div>
                    <div className="h-4 rounded bg-white/10 text-[8px] text-slate-400 flex items-center px-1.5 font-mono">••••••••</div>
                    <div className="h-4.5 rounded bg-blue-600 text-[8px] font-bold flex items-center justify-center text-white uppercase">
                      {config.textoBotonLogin || 'SIGN IN'}
                    </div>
                  </div>
                </div>

                {/* Panel Derecho Simulado */}
                <div 
                  className="col-span-6 rounded-xl p-2.5 text-center space-y-1.5 relative overflow-hidden text-white"
                  style={{ background: currentGradient }}
                >
                  <div className="flex items-center justify-between text-[7px] text-white/80">
                    <span className="bg-white/20 px-1 py-0.2 rounded font-bold">{config.badgeSuperior || 'Certificación Oficial'}</span>
                    <span className="font-mono">{config.etiquetaSuperiorDerecha || 'Ecuador 2026'}</span>
                  </div>

                  <div className="py-1">
                    <div className="text-xs font-black uppercase tracking-tight">{config.tituloMarca || 'INFINITY ACTUARIAL'}</div>
                    <div className="text-[8px] text-white/80 line-clamp-1">{config.subtituloMarca}</div>
                  </div>

                  <div className="pt-1 border-t border-white/20 grid grid-cols-3 gap-1 text-[7px]">
                    <div>
                      <div className="font-bold">{config.pieCol1Titulo || 'Art. 185'}</div>
                      <div className="text-white/70">{config.pieCol1Subtitulo || 'Desahucio'}</div>
                    </div>
                    <div className="border-x border-white/20">
                      <div className="font-bold">{config.pieCol2Titulo || 'Art. 216'}</div>
                      <div className="text-white/70">{config.pieCol2Subtitulo || 'Jubilación'}</div>
                    </div>
                    <div>
                      <div className="font-bold">{config.pieCol3Titulo || 'NIIF'}</div>
                      <div className="text-white/70">{config.pieCol3Subtitulo || 'PUCM'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TAB 1: FONDO & ESTILO VISUAL */}
          {activeSubTab === 'fondo' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Selector de Tipo de Fondo */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#5b52f9]" />
                  <span>Tipo de Fondo para la Pantalla de Login:</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <div
                    onClick={() => setConfig({ ...config, tipoFondo: 'degradado' })}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      config.tipoFondo === 'degradado'
                        ? 'border-[#5b52f9] bg-purple-50/70 dark:bg-purple-950/40 ring-2 ring-[#5b52f9]/30'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-800'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#5b52f9] to-[#ec4899] mx-auto mb-1.5 shadow-xs" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">Degradado de Color</span>
                    <span className="text-[10px] text-slate-400">Gradiente puro y estilizado</span>
                  </div>

                  <div
                    onClick={() => setConfig({ ...config, tipoFondo: 'imagen' })}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      config.tipoFondo === 'imagen'
                        ? 'border-[#5b52f9] bg-purple-50/70 dark:bg-purple-950/40 ring-2 ring-[#5b52f9]/30'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-800'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700 mx-auto mb-1.5 flex items-center justify-center text-slate-300">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">Fotografía / Textura</span>
                    <span className="text-[10px] text-slate-400">Rascacielos o foto propia</span>
                  </div>

                  <div
                    onClick={() => setConfig({ ...config, tipoFondo: 'ambos' })}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      config.tipoFondo === 'ambos'
                        ? 'border-[#5b52f9] bg-purple-50/70 dark:bg-purple-950/40 ring-2 ring-[#5b52f9]/30'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-800'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#5b52f9] via-slate-900 to-[#ec4899] mx-auto mb-1.5 shadow-xs flex items-center justify-center text-white">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">Ambos (Híbrido)</span>
                    <span className="text-[10px] text-slate-400">Foto con degradado overlay</span>
                  </div>
                </div>
              </div>

              {/* Selector de Degradados y Fotografías en 2 Columnas */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                
                {/* COLUMNA 1: PALETA DE DEGRADADOS */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Palette className="w-4 h-4 text-[#5b52f9]" />
                    <span>Gradientes y Colores:</span>
                  </label>

                  <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1">
                    {Object.entries(DEGRADADOS_PRESETS).map(([key, item]) => {
                      const isSelected = config.estiloDegradado === key;
                      return (
                        <div
                          key={key}
                          onClick={() => setConfig({ ...config, estiloDegradado: key as any })}
                          className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected 
                              ? 'border-[#5b52f9] bg-purple-50/60 dark:bg-purple-950/30 shadow-xs ring-2 ring-[#5b52f9]/30' 
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-800/80'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div 
                              className="w-9 h-9 rounded-xl shadow-xs shrink-0 border border-black/10" 
                              style={{ background: item.cssGradient }} 
                            />
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">
                                {item.nombre}
                              </span>
                              <div className="flex items-center gap-1 mt-0.5">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.previewColors[0] }} />
                                <span className="text-[10px] text-slate-400">a</span>
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.previewColors[1] }} />
                              </div>
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-[#5b52f9] shrink-0" />}
                        </div>
                      );
                    })}

                    {/* Gradiente Personalizado */}
                    <div 
                      onClick={() => setConfig({ ...config, estiloDegradado: 'personalizado' })}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                        config.estiloDegradado === 'personalizado'
                          ? 'border-[#5b52f9] bg-purple-50/60 dark:bg-purple-950/30 shadow-xs ring-2 ring-[#5b52f9]/30'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          🎨 Color Personalizado (Pickers)
                        </span>
                        {config.estiloDegradado === 'personalizado' && <Check className="w-4 h-4 text-[#5b52f9]" />}
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={config.colorInicioPersonalizado || '#4c0519'}
                            onChange={e => setConfig({ 
                              ...config, 
                              estiloDegradado: 'personalizado', 
                              colorInicioPersonalizado: e.target.value 
                            })}
                            className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200"
                          />
                          <span className="text-[11px] text-slate-600 dark:text-slate-400 font-mono">
                            Color 1
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={config.colorFinPersonalizado || '#f43f5e'}
                            onChange={e => setConfig({ 
                              ...config, 
                              estiloDegradado: 'personalizado', 
                              colorFinPersonalizado: e.target.value 
                            })}
                            className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200"
                          />
                          <span className="text-[11px] text-slate-600 dark:text-slate-400 font-mono">
                            Color 2
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* COLUMNA 2: FOTOGRAFÍAS / TEXTURAS */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-[#5b52f9]" />
                      <span>Galería de Imágenes & Subida:</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#5b52f9] hover:underline cursor-pointer"
                    >
                      <Upload className="w-3 h-3" />
                      <span>Subir Foto Propia</span>
                    </button>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleSubirImagenLocal}
                    className="hidden"
                  />

                  <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1">
                    {Object.entries(FONDOS_IMAGENES_PRESETS).map(([key, item]) => {
                      const isSelected = config.estiloImagen === key && !config.imagenUrlPersonalizada;
                      return (
                        <div
                          key={key}
                          onClick={() => setConfig({ 
                            ...config, 
                            estiloImagen: key as any, 
                            imagenUrlPersonalizada: '' 
                          })}
                          className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected 
                              ? 'border-[#5b52f9] bg-purple-50/60 dark:bg-purple-950/30 shadow-xs ring-2 ring-[#5b52f9]/30' 
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-800/80'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {item.url ? (
                              <img 
                                src={item.url} 
                                alt={item.nombre} 
                                className="w-11 h-8 rounded-xl object-cover shrink-0 border border-slate-200 shadow-xs" 
                              />
                            ) : (
                              <div className="w-11 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center shrink-0 text-slate-400">
                                <Sparkles className="w-3.5 h-3.5" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block">
                                {item.nombre}
                              </span>
                              <span className="text-[10px] text-slate-400 truncate block">
                                {item.descripcion}
                              </span>
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-[#5b52f9] shrink-0" />}
                        </div>
                      );
                    })}
                  </div>

                  {/* URL Web directa */}
                  <div className="pt-2">
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      O ingrese URL de imagen web (HTTPS):
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={config.imagenUrlPersonalizada || ''}
                        onChange={e => setConfig({ 
                          ...config, 
                          estiloImagen: 'personalizada',
                          imagenUrlPersonalizada: e.target.value 
                        })}
                        placeholder="https://images.unsplash.com/..."
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#5b52f9]"
                      />
                      {config.imagenUrlPersonalizada && (
                        <button
                          type="button"
                          onClick={() => setConfig({ ...config, imagenUrlPersonalizada: '', estiloImagen: 'ciudad_nocturna' })}
                          className="px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                        >
                          Quitar
                        </button>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {/* Controles de Opacidad, Desenfoque y Pantalla Completa */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Opacidad de la Fotografía: {Math.round((config.opacidadFondo ?? 0.5) * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.10"
                    max="1.0"
                    step="0.05"
                    value={config.opacidadFondo ?? 0.5}
                    onChange={e => setConfig({ ...config, opacidadFondo: parseFloat(e.target.value) })}
                    className="w-full cursor-pointer accent-[#5b52f9]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Desenfoque (Blur):
                  </label>
                  <select
                    value={config.desenfoqueFondo || 'suave'}
                    onChange={e => setConfig({ ...config, desenfoqueFondo: e.target.value as any })}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-white"
                  >
                    <option value="ninguno">Ninguno</option>
                    <option value="suave">Suave (Recomendado)</option>
                    <option value="medio">Medio</option>
                    <option value="fuerte">Fuerte</option>
                  </select>
                </div>

                <div className="flex items-center justify-between sm:justify-start sm:gap-3 pt-2 sm:pt-0">
                  <div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Fondo Pantalla Completa
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Cubrir todo el viewport
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.fondoPantallaCompleta}
                    onChange={e => setConfig({ ...config, fondoPantallaCompleta: e.target.checked })}
                    className="w-5 h-5 rounded border-slate-300 text-[#5b52f9] focus:ring-[#5b52f9] cursor-pointer"
                  />
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: TEXTOS DEL FORMULARIO DE ACCESO (WELCOME TO, VALUADOR, TABS, BOTÓN) */}
          {activeSubTab === 'formulario' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="bg-purple-50 dark:bg-purple-950/30 p-3.5 rounded-2xl border border-purple-200 dark:border-purple-800 text-xs text-purple-800 dark:text-purple-300 flex items-center gap-2">
                <Sliders className="w-4 h-4 shrink-0 text-[#5b52f9]" />
                <span>Aquí puede editar todos los títulos y textos visibles en el panel del formulario izquierdo del login.</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Texto Superior de Bienvenida (ej. "WELCOME TO"):
                  </label>
                  <input
                    type="text"
                    value={config.textoBienvenida || ''}
                    onChange={e => setConfig({ ...config, textoBienvenida: e.target.value })}
                    placeholder="WELCOME TO"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs uppercase bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#5b52f9]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Título Principal del Formulario (ej. "VALUADOR ACTUARIAL"):
                  </label>
                  <input
                    type="text"
                    value={config.tituloFormulario || ''}
                    onChange={e => setConfig({ ...config, tituloFormulario: e.target.value })}
                    placeholder="VALUADOR ACTUARIAL"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-black text-xs uppercase bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#5b52f9]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Subtítulo Explicativo del Formulario:
                </label>
                <input
                  type="text"
                  value={config.subtituloFormulario || ''}
                  onChange={e => setConfig({ ...config, subtituloFormulario: e.target.value })}
                  placeholder="Portal Institucional de Nómina y Provisiones Laborales Ecuador · NIC 19"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#5b52f9]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Pestaña 1 (Login):
                  </label>
                  <input
                    type="text"
                    value={config.textoTabLogin || ''}
                    onChange={e => setConfig({ ...config, textoTabLogin: e.target.value })}
                    placeholder="Iniciar Sesión"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Pestaña 2 (Registro):
                  </label>
                  <input
                    type="text"
                    value={config.textoTabRegistro || ''}
                    onChange={e => setConfig({ ...config, textoTabRegistro: e.target.value })}
                    placeholder="Registrar Empresa"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Texto Botón Ingreso:
                  </label>
                  <input
                    type="text"
                    value={config.textoBotonLogin || ''}
                    onChange={e => setConfig({ ...config, textoBotonLogin: e.target.value })}
                    placeholder="SIGN IN"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs uppercase bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Color del Botón de Ingreso:
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    { id: 'auto', label: 'Automático (sigue degradado)' },
                    { id: 'azul', label: 'Azul Marino' },
                    { id: 'rojo', label: 'Rojo Infinity' },
                    { id: 'purpura', label: 'Púrpura' },
                    { id: 'esmeralda', label: 'Esmeralda' },
                    { id: 'negro', label: 'Negro Elegante' }
                  ].map(btn => (
                    <button
                      key={btn.id}
                      type="button"
                      onClick={() => setConfig({ ...config, colorBotonFormulario: btn.id as any })}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                        config.colorBotonFormulario === btn.id
                          ? 'bg-[#5b52f9] text-white border-transparent shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: BANNER INSTITUCIONAL & MARCA (INFINITY ACTUARIAL, LOGOTIPO, PIE 3 COLUMNAS) */}
          {activeSubTab === 'banner' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              
              {/* Selección de Logotipo / Ícono */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#5b52f9]" />
                    <span>Logotipo e Icono del Monograma:</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => fileLogoRef.current?.click()}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#5b52f9] hover:underline cursor-pointer"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Subir Logo Propio (PNG/SVG)</span>
                  </button>
                </div>

                <input
                  ref={fileLogoRef}
                  type="file"
                  accept="image/*"
                  onChange={handleSubirLogoLocal}
                  className="hidden"
                />

                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                  {[
                    { id: 'infinity', label: 'Infinito ∞', icon: InfinityIcon },
                    { id: 'shield', label: 'Escudo', icon: ShieldCheck },
                    { id: 'building', label: 'Edificio', icon: Building },
                    { id: 'award', label: 'Medalla', icon: Award },
                    { id: 'trending', label: 'Capas NIIF', icon: Layers }
                  ].map(ico => {
                    const IconComponent = ico.icon;
                    const isSelected = config.tipoLogo === 'icono' && config.iconoSeleccionado === ico.id;
                    return (
                      <div
                        key={ico.id}
                        onClick={() => setConfig({ ...config, tipoLogo: 'icono', iconoSeleccionado: ico.id as any })}
                        className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1 ${
                          isSelected
                            ? 'bg-purple-50 dark:bg-purple-950/40 border-[#5b52f9] ring-2 ring-[#5b52f9]/30 text-[#5b52f9]'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <IconComponent className="w-5 h-5" />
                        <span className="text-[10px] font-bold">{ico.label}</span>
                      </div>
                    );
                  })}

                  {/* Logo Subido */}
                  <div
                    onClick={() => {
                      if (config.logoUrlPersonalizado) {
                        setConfig({ ...config, tipoLogo: 'imagen' });
                      } else {
                        fileLogoRef.current?.click();
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1 ${
                      config.tipoLogo === 'imagen'
                        ? 'bg-purple-50 dark:bg-purple-950/40 border-[#5b52f9] ring-2 ring-[#5b52f9]/30 text-[#5b52f9]'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {config.logoUrlPersonalizado ? (
                      <img src={config.logoUrlPersonalizado} alt="Logo Propio" className="w-5 h-5 object-contain" />
                    ) : (
                      <Upload className="w-5 h-5" />
                    )}
                    <span className="text-[10px] font-bold truncate">Logo Propio</span>
                  </div>
                </div>
              </div>

              {/* Título y Subtítulo de Marca */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Título de la Marca / Plataforma (ej. "INFINITY ACTUARIAL"):
                  </label>
                  <input
                    type="text"
                    value={config.tituloMarca || ''}
                    onChange={e => setConfig({ ...config, tituloMarca: e.target.value })}
                    placeholder="INFINITY ACTUARIAL"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-black text-xs uppercase bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#5b52f9]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Badge Superior Izquierdo:
                  </label>
                  <input
                    type="text"
                    value={config.badgeSuperior || ''}
                    onChange={e => setConfig({ ...config, badgeSuperior: e.target.value })}
                    placeholder="Certificación Oficial NIC 19"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#5b52f9]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Etiqueta Superior Derecha (ej. "Ecuador 2026"):
                  </label>
                  <input
                    type="text"
                    value={config.etiquetaSuperiorDerecha || ''}
                    onChange={e => setConfig({ ...config, etiquetaSuperiorDerecha: e.target.value })}
                    placeholder="Ecuador 2026"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#5b52f9]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Misión / Subtítulo Institucional del Banner:
                  </label>
                  <input
                    type="text"
                    value={config.subtituloMarca || ''}
                    onChange={e => setConfig({ ...config, subtituloMarca: e.target.value })}
                    placeholder="Plataforma actuarial certificada para pasivos laborales..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#5b52f9]"
                  />
                </div>
              </div>

              {/* Las 3 Columnas Normativas del Pie del Banner */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                  Las 3 Columnas del Pie del Banner (Normativas y Artículos):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Columna 1</span>
                    <input
                      type="text"
                      value={config.pieCol1Titulo || ''}
                      onChange={e => setConfig({ ...config, pieCol1Titulo: e.target.value })}
                      placeholder="Art. 185"
                      className="w-full px-2 py-1 text-xs font-bold border rounded"
                    />
                    <input
                      type="text"
                      value={config.pieCol1Subtitulo || ''}
                      onChange={e => setConfig({ ...config, pieCol1Subtitulo: e.target.value })}
                      placeholder="Desahucio"
                      className="w-full px-2 py-1 text-xs border rounded"
                    />
                  </div>

                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Columna 2</span>
                    <input
                      type="text"
                      value={config.pieCol2Titulo || ''}
                      onChange={e => setConfig({ ...config, pieCol2Titulo: e.target.value })}
                      placeholder="Art. 216"
                      className="w-full px-2 py-1 text-xs font-bold border rounded"
                    />
                    <input
                      type="text"
                      value={config.pieCol2Subtitulo || ''}
                      onChange={e => setConfig({ ...config, pieCol2Subtitulo: e.target.value })}
                      placeholder="Jubilación"
                      className="w-full px-2 py-1 text-xs border rounded"
                    />
                  </div>

                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Columna 3</span>
                    <input
                      type="text"
                      value={config.pieCol3Titulo || ''}
                      onChange={e => setConfig({ ...config, pieCol3Titulo: e.target.value })}
                      placeholder="NIIF / IFRS"
                      className="w-full px-2 py-1 text-xs font-bold border rounded"
                    />
                    <input
                      type="text"
                      value={config.pieCol3Subtitulo || ''}
                      onChange={e => setConfig({ ...config, pieCol3Subtitulo: e.target.value })}
                      placeholder="PUCM & DBO"
                      className="w-full px-2 py-1 text-xs border rounded"
                    />
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: MARCA EN EL DASHBOARD */}
          {activeSubTab === 'dashboard' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="bg-blue-50 dark:bg-blue-950/30 p-3.5 rounded-2xl border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-300 flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4 shrink-0 text-blue-600" />
                <span>Personalice la denominación que aparecerá en la cabecera ejecutiva del Dashboard para los actuarios y administradores.</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Título Principal del Dashboard:
                </label>
                <input
                  type="text"
                  value={config.tituloDashboard || ''}
                  onChange={e => setConfig({ ...config, tituloDashboard: e.target.value })}
                  placeholder="Valuador Actuarial NIC 19"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#5b52f9]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Subtítulo / Régimen Legal del Dashboard:
                </label>
                <input
                  type="text"
                  value={config.subtituloDashboard || ''}
                  onChange={e => setConfig({ ...config, subtituloDashboard: e.target.value })}
                  placeholder="Valuación bajo Código del Trabajo (Art. 185 y 216) y NIIF / IFRS"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#5b52f9]"
                />
              </div>
            </div>
          )}

        </div>

        {/* Footer de Acciones del Modal */}
        <div className="p-4 sm:px-6 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleRestablecer}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restablecer Todo</span>
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => handleGuardar()}
              className="px-5 py-2.5 rounded-xl bg-[#5b52f9] hover:bg-[#4f46e5] text-white text-xs font-bold shadow-md transition cursor-pointer flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Configuración</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
