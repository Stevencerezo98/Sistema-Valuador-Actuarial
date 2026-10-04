import React, { useState } from 'react';
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
  Building,
  Infinity as InfinityIcon
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
}

export const LoginBrandConfigModal: React.FC<LoginBrandConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved
}) => {
  const [config, setConfig] = useState<LoginBrandConfig>(() => obtenerLoginBrandConfig());
  const [guardadoExito, setGuardadoExito] = useState(false);

  if (!isOpen) return null;

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    guardarLoginBrandConfig(config);
    setGuardadoExito(true);
    if (onConfigSaved) onConfigSaved();
    setTimeout(() => {
      setGuardadoExito(false);
      onClose();
    }, 1200);
  };

  const handleRestablecer = () => {
    setConfig(DEFAULT_LOGIN_BRAND_CONFIG);
  };

  const presetActual = DEGRADADOS_PRESETS[config.estiloDegradado] || DEGRADADOS_PRESETS.rojo_infinity;
  const imagenActual = config.imagenUrlPersonalizada || FONDOS_IMAGENES_PRESETS[config.estiloImagen]?.url || '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header Modal */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 text-blue-300 flex items-center justify-center">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Personalización Visual del Login & Marca Corporativa
              </h2>
              <p className="text-xs text-slate-400">
                Configure el color de degradado, imagen de fondo y títulos de la pantalla de inicio
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario & Vista Previa */}
        <form onSubmit={handleGuardar} className="p-6 space-y-6">
          
          {guardadoExito && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>¡Configuración de diseño guardada exitosamente! Se aplicará en el portal de acceso.</span>
            </div>
          )}

          {/* VISTA PREVIA EN VIVO */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-blue-600" />
              <span>Vista Previa en Tiempo Real del Banner de Login:</span>
            </label>

            <div 
              className="rounded-2xl p-6 text-white min-h-[180px] flex flex-col justify-between relative overflow-hidden shadow-lg border border-slate-300 transition-all duration-300"
              style={{
                background: presetActual.cssGradient
              }}
            >
              {imagenActual && (
                <div 
                  className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-40 pointer-events-none"
                  style={{ backgroundImage: `url(${imagenActual})` }}
                />
              )}
              
              <div className="relative z-10 flex items-center justify-between">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${presetActual.badgeColor}`}>
                  Certificación Oficial NIC 19
                </span>
                <span className="text-[10px] opacity-80 font-mono">Ecuador 2026</span>
              </div>

              <div className="relative z-10 text-center my-3 space-y-1">
                <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 mx-auto flex items-center justify-center">
                  <InfinityIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight text-white">
                  {config.tituloMarca || 'INFINITY ACTUARIAL'}
                </h3>
                <p className="text-xs text-white/90 max-w-lg mx-auto line-clamp-2">
                  {config.subtituloMarca || DEFAULT_LOGIN_BRAND_CONFIG.subtituloMarca}
                </p>
              </div>

              <div className="relative z-10 pt-3 border-t border-white/15 flex items-center justify-around text-[10px]">
                <span>Art. 185 Desahucio</span>
                <span>·</span>
                <span>Art. 216 Jubilación</span>
                <span>·</span>
                <span>NIIF / IFRS</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 1. SELECCIÓN DE DEGRADADO CORPORATIVO */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-800">
                1. Paleta de Color y Degradado Corporativo:
              </label>

              <div className="space-y-2">
                {Object.entries(DEGRADADOS_PRESETS).map(([key, item]) => {
                  const isSelected = config.estiloDegradado === key;
                  return (
                    <div
                      key={key}
                      onClick={() => setConfig({ ...config, estiloDegradado: key as any })}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected 
                          ? 'border-blue-600 bg-blue-50/50 shadow-xs ring-2 ring-blue-500/20' 
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-xl shadow-xs border border-white/30 shrink-0" 
                          style={{ background: item.cssGradient }}
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-800">{item.nombre}</div>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. SELECCIÓN DE IMAGEN DE FONDO */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-800">
                2. Fotografía / Textura Arquitectónica de Fondo:
              </label>

              <div className="space-y-2">
                {Object.entries(FONDOS_IMAGENES_PRESETS).map(([key, item]) => {
                  const isSelected = config.estiloImagen === key;
                  return (
                    <div
                      key={key}
                      onClick={() => setConfig({ ...config, estiloImagen: key as any, imagenUrlPersonalizada: '' })}
                      className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected 
                          ? 'border-blue-600 bg-blue-50/50 shadow-xs ring-2 ring-blue-500/20' 
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {item.url ? (
                          <img 
                            src={item.url} 
                            alt={item.nombre} 
                            className="w-10 h-8 rounded-lg object-cover shrink-0 border border-slate-200" 
                          />
                        ) : (
                          <div className="w-10 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-400">
                            <Sparkles className="w-4 h-4" />
                          </div>
                        )}
                        <span className="text-xs font-medium text-slate-700 truncate">{item.nombre}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                    </div>
                  );
                })}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  O ingrese una URL personalizada de imagen:
                </label>
                <input
                  type="url"
                  value={config.imagenUrlPersonalizada || ''}
                  onChange={e => setConfig({ ...config, imagenUrlPersonalizada: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>
            </div>

          </div>

          {/* 3. TÍTULOS Y DESCRIPCIÓN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Título de la Marca / Monograma:
              </label>
              <input
                type="text"
                value={config.tituloMarca}
                onChange={e => setConfig({ ...config, tituloMarca: e.target.value })}
                placeholder="INFINITY ACTUARIAL"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-xs uppercase focus:ring-2 focus:ring-blue-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Subtítulo / Misión Institucional:
              </label>
              <input
                type="text"
                value={config.subtituloMarca}
                onChange={e => setConfig({ ...config, subtituloMarca: e.target.value })}
                placeholder="Plataforma actuarial certificada..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 outline-none"
              />
            </div>
          </div>

          {/* Footer de Acciones */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={handleRestablecer}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer Valores Predeterminados</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition cursor-pointer flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Guardar y Aplicar al Login</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
