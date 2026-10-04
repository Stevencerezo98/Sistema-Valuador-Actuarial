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
  Sliders,
  Maximize2,
  LogOut
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
  const [guardadoExito, setGuardadoExito] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (confirm('¿Desea restablecer el diseño del login a los valores corporativos predeterminados?')) {
      setConfig(DEFAULT_LOGIN_BRAND_CONFIG);
      guardarLoginBrandConfig(DEFAULT_LOGIN_BRAND_CONFIG);
    }
  };

  // Subir imagen local desde la máquina del usuario
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

  const presetActual = DEGRADADOS_PRESETS[config.estiloDegradado] || DEGRADADOS_PRESETS.rojo_infinity;
  const currentGradient = config.estiloDegradado === 'personalizado'
    ? `linear-gradient(135deg, ${config.colorInicioPersonalizado || '#4c0519'} 0%, ${config.colorFinPersonalizado || '#f43f5e'} 100%)`
    : presetActual.cssGradient;

  const imagenActual = config.estiloImagen === 'personalizada'
    ? config.imagenUrlPersonalizada || ''
    : (config.imagenUrlPersonalizada || FONDOS_IMAGENES_PRESETS[config.estiloImagen]?.url || '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-[28px] shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        
        {/* Header Modal */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#5b52f9] to-[#7c3aed] text-white flex items-center justify-center shadow-md">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Configuración de Fondo y Marca del Login
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold border border-purple-500/30">
                  Panel Administrador
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Seleccione el fondo (imagen o color degradado), opacidad y textos que verán los usuarios al ingresar
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

        {/* Cuerpo del Formulario con Scroll */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          
          {guardadoExito && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>¡Diseño guardado exitosamente! El portal de login se ha actualizado con su selección.</span>
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

          {/* VISTA PREVIA EN VIVO DEL LOGIN */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-[#5b52f9]" />
                <span>Vista Previa en Vivo de la Pantalla de Acceso:</span>
              </label>
              <span className="text-[11px] text-slate-400">
                Modo: <strong className="text-slate-700 dark:text-slate-200 uppercase">{config.tipoFondo}</strong>
              </span>
            </div>

            {/* Simulación del Split de Login */}
            <div 
              className="rounded-3xl p-5 sm:p-7 text-white min-h-[220px] flex flex-col justify-between relative overflow-hidden shadow-2xl border border-slate-300 dark:border-slate-700 transition-all duration-300"
              style={{
                background: currentGradient
              }}
            >
              {/* Capa de Imagen / Textura */}
              {imagenActual && (config.tipoFondo === 'imagen' || config.tipoFondo === 'ambos') && (
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-all duration-300"
                  style={{ 
                    backgroundImage: `url(${imagenActual})`,
                    opacity: config.opacidadFondo ?? 0.50,
                    mixBlendMode: config.tipoFondo === 'ambos' ? 'overlay' : 'normal'
                  }}
                />
              )}

              {/* Viñeta para contraste */}
              <div className="absolute inset-0 bg-black/35 pointer-events-none" />
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:18px_18px] pointer-events-none" />
              
              {/* Header de la vista previa */}
              <div className="relative z-10 flex items-center justify-between">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${presetActual.badgeColor} backdrop-blur-md`}>
                  Certificación Oficial NIC 19
                </span>
                <span className="text-xs opacity-90 font-mono">Ecuador 2026</span>
              </div>

              {/* Centro de la vista previa */}
              <div className="relative z-10 text-center my-4 space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 mx-auto flex items-center justify-center shadow-lg text-white">
                  <InfinityIcon className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight text-white drop-shadow-md">
                  {config.tituloMarca || 'INFINITY ACTUARIAL'}
                </h3>
                <p className="text-xs text-white/90 max-w-xl mx-auto line-clamp-2 drop-shadow-sm font-medium">
                  {config.subtituloMarca || DEFAULT_LOGIN_BRAND_CONFIG.subtituloMarca}
                </p>
              </div>

              {/* Footer de la vista previa */}
              <div className="relative z-10 pt-3 border-t border-white/20 flex items-center justify-around text-xs font-semibold">
                <span className="text-white/90">Art. 185 Desahucio</span>
                <span className="text-white/40">·</span>
                <span className="text-white/90">Art. 216 Jubilación</span>
                <span className="text-white/40">·</span>
                <span className="text-white/90">NIIF / DBO</span>
              </div>
            </div>
          </div>

          {/* 1. SELECTOR DEL MODO DE FONDO */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#5b52f9]" />
                <span>¿Qué tipo de fondo prefiere para la pantalla de Login?</span>
              </label>
              <span className="text-[11px] text-slate-500">Seleccione su estilo</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setConfig({ ...config, tipoFondo: 'degradado' })}
                className={`p-3 rounded-2xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1.5 border text-center ${
                  config.tipoFondo === 'degradado'
                    ? 'bg-[#5b52f9] text-white border-transparent shadow-md'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-[#5b52f9]'
                }`}
              >
                <Palette className="w-5 h-5" />
                <span>Solo Color Degradado</span>
                <span className={`text-[10px] font-normal ${config.tipoFondo === 'degradado' ? 'text-white/80' : 'text-slate-400'}`}>
                  Tonos corporativos modernos
                </span>
              </button>

              <button
                type="button"
                onClick={() => setConfig({ ...config, tipoFondo: 'imagen' })}
                className={`p-3 rounded-2xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1.5 border text-center ${
                  config.tipoFondo === 'imagen'
                    ? 'bg-[#5b52f9] text-white border-transparent shadow-md'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-[#5b52f9]'
                }`}
              >
                <ImageIcon className="w-5 h-5" />
                <span>Solo Imagen de Fondo</span>
                <span className={`text-[10px] font-normal ${config.tipoFondo === 'imagen' ? 'text-white/80' : 'text-slate-400'}`}>
                  Fotografía de alta resolución
                </span>
              </button>

              <button
                type="button"
                onClick={() => setConfig({ ...config, tipoFondo: 'ambos' })}
                className={`p-3 rounded-2xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1.5 border text-center ${
                  config.tipoFondo === 'ambos'
                    ? 'bg-[#5b52f9] text-white border-transparent shadow-md'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-[#5b52f9]'
                }`}
              >
                <Sparkles className="w-5 h-5" />
                <span>Ambos (Híbrido Recomendado)</span>
                <span className={`text-[10px] font-normal ${config.tipoFondo === 'ambos' ? 'text-white/80' : 'text-slate-400'}`}>
                  Degradado con textura fotográfica
                </span>
              </button>
            </div>

            {/* Controles de Opacidad y Desenfoque */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-200/80 dark:border-slate-700 text-xs">
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-600 dark:text-slate-400 font-semibold">Opacidad de la Imagen:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0.10"
                    max="1.0"
                    step="0.05"
                    value={config.opacidadFondo ?? 0.50}
                    onChange={e => setConfig({ ...config, opacidadFondo: parseFloat(e.target.value) })}
                    className="w-28 accent-[#5b52f9] cursor-pointer"
                  />
                  <span className="font-mono text-slate-800 dark:text-slate-200 font-bold w-10 text-right">
                    {Math.round((config.opacidadFondo ?? 0.50) * 100)}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-600 dark:text-slate-400 font-semibold">Desenfoque (Blur de Fondo):</span>
                <select
                  value={config.desenfoqueFondo || 'suave'}
                  onChange={e => setConfig({ ...config, desenfoqueFondo: e.target.value as any })}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer outline-none focus:ring-2 focus:ring-[#5b52f9]"
                >
                  <option value="ninguno">Ninguno (Total nitidez)</option>
                  <option value="suave">Suave (Elegante y sutil)</option>
                  <option value="medio">Medio (Foco en el formulario)</option>
                  <option value="fuerte">Fuerte (Efecto difuso moderno)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 2. SELECCIÓN DE PALETAS DE DEGRADADO & FONDOS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* COLUMNA A: PALETAS DE COLOR DEGRADADO */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-[#5b52f9]" />
                  <span>Paleta de Color Degradado:</span>
                </label>
                <span className="text-[10px] text-slate-400">Haga clic para aplicar</span>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {Object.entries(DEGRADADOS_PRESETS).map(([key, item]) => {
                  const isSelected = config.estiloDegradado === key;
                  return (
                    <div
                      key={key}
                      onClick={() => setConfig({ ...config, estiloDegradado: key as any })}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected 
                          ? 'border-[#5b52f9] bg-purple-50/60 dark:bg-purple-950/30 shadow-xs ring-2 ring-[#5b52f9]/30' 
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-xl shadow-xs border border-white/30 shrink-0" 
                          style={{ background: item.cssGradient }}
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.nombre}</div>
                          <div className="flex items-center gap-1.5 mt-0.5">
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

                {/* Opción Gradiente Personalizado con color pickers */}
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
                      🎨 Personalizar Colores Propios
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
                        Inicio
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
                        Fin
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* COLUMNA B: FOTOGRAFÍAS / TEXTURAS ARQUITECTÓNICAS */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-[#5b52f9]" />
                  <span>Galería de Imágenes de Fondo:</span>
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

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
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
                      <div className="flex items-center gap-3 min-w-0">
                        {item.url ? (
                          <img 
                            src={item.url} 
                            alt={item.nombre} 
                            className="w-12 h-9 rounded-xl object-cover shrink-0 border border-slate-200 shadow-xs" 
                          />
                        ) : (
                          <div className="w-12 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center shrink-0 text-slate-400">
                            <Sparkles className="w-4 h-4" />
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

              {/* URL o Imagen Personalizada subida */}
              <div className="pt-2">
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  O pegue una URL directa de imagen web (HTTPS):
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

          {/* 3. TÍTULOS CORPORATIVOS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200/80 dark:border-slate-700">
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Título del Monograma / Marca:
              </label>
              <input
                type="text"
                value={config.tituloMarca}
                onChange={e => setConfig({ ...config, tituloMarca: e.target.value })}
                placeholder="INFINITY ACTUARIAL"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs uppercase bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#5b52f9]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Subtítulo / Misión Institucional:
              </label>
              <input
                type="text"
                value={config.subtituloMarca}
                onChange={e => setConfig({ ...config, subtituloMarca: e.target.value })}
                placeholder="Plataforma actuarial certificada..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#5b52f9]"
              />
            </div>
          </div>

        </div>

        {/* Footer de Acciones */}
        <div className="p-4 sm:px-6 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleRestablecer}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restablecer Predeterminado</span>
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
