import React, { useState, useEffect } from 'react';
import { 
  validarCredenciales, 
  validarPinSeguridad, 
  guardarSesionActiva, 
  registrarEmpresa
} from '../services/authService';
import { getInitialTheme, applyTheme, ThemeMode } from '../services/themeService';
import { InfoUsuario } from '../types/actuarial';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Mail, 
  Phone, 
  Key, 
  Building, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  ChevronLeft,
  Fingerprint,
  Sun,
  Moon,
  Infinity as InfinityIcon,
  Award,
  Layers,
  FileCheck
} from 'lucide-react';
import { 
  obtenerLoginBrandConfig, 
  DEFAULT_LOGIN_BRAND_CONFIG,
  DEGRADADOS_PRESETS, 
  FONDOS_IMAGENES_PRESETS 
} from '../services/loginBrandService';

interface AuthPortalProps {
  onLoginSuccess: (usuario: InfoUsuario) => void;
}

export const AuthPortal: React.FC<AuthPortalProps> = ({ onLoginSuccess }) => {
  const [tab, setTab] = useState<'login' | 'registro'>('login');
  const [theme, setTheme] = useState<ThemeMode>(() => getInitialTheme());

  // Sincronizar tema al montar o cambiar
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme: ThemeMode = theme === 'claro' ? 'oscuro' : 'claro';
    setTheme(nextTheme);
    applyTheme(nextTheme);
  };

  // Configuración de Marca y Fondo de Login (personalizable por el Administrador)
  const [brandConfig, setBrandConfig] = useState(() => obtenerLoginBrandConfig());

  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail) {
        setBrandConfig(e.detail);
      } else {
        setBrandConfig(obtenerLoginBrandConfig());
      }
    };
    window.addEventListener('login-brand-config-updated', handleUpdate);
    return () => window.removeEventListener('login-brand-config-updated', handleUpdate);
  }, []);

  const preset = DEGRADADOS_PRESETS[brandConfig.estiloDegradado] || DEGRADADOS_PRESETS.rojo_infinity;
  const currentGradient = brandConfig.estiloDegradado === 'personalizado'
    ? `linear-gradient(135deg, ${brandConfig.colorInicioPersonalizado || '#4c0519'} 0%, ${brandConfig.colorFinPersonalizado || '#f43f5e'} 100%)`
    : preset.cssGradient;

  const bgImagenUrl = brandConfig.estiloImagen === 'personalizada'
    ? brandConfig.imagenUrlPersonalizada || ''
    : (brandConfig.imagenUrlPersonalizada || FONDOS_IMAGENES_PRESETS[brandConfig.estiloImagen]?.url || '');

  // Login State
  const [identificador, setIdentificador] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginStep, setLoginStep] = useState<1 | 2>(1);
  const [usuarioPendiente, setUsuarioPendiente] = useState<InfoUsuario | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Registro State
  const [regCorreo, setRegCorreo] = useState('');
  const [regUsuario, setRegUsuario] = useState('');
  const [regNombreEmpresa, setRegNombreEmpresa] = useState('');
  const [regRuc, setRegRuc] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRepetirPassword, setRegRepetirPassword] = useState('');
  const [regCelular, setRegCelular] = useState('');
  const [regPin, setRegPin] = useState('');
  const [regAceptaPin, setRegAceptaPin] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [registroError, setRegistroError] = useState<string | null>(null);
  const [registroSuccess, setRegistroSuccess] = useState<string | null>(null);

  // Manejo de Login Paso 1: Credenciales
  const handlePaso1Login = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!identificador.trim() || !password) {
      setLoginError('Por favor complete su usuario o correo y contraseña.');
      return;
    }

    setLoginLoading(true);
    setTimeout(() => {
      const res = validarCredenciales(identificador, password);
      setLoginLoading(false);

      if (!res.success || !res.usuario) {
        setLoginError(res.error || 'Credenciales inválidas.');
        return;
      }

      setUsuarioPendiente(res.usuario);
      setLoginStep(2);
      setPinInput('');
    }, 250);
  };

  // Manejo de Login Paso 2: Doble Factor (PIN)
  const handlePaso2Pin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!usuarioPendiente) return;

    if (!pinInput.trim()) {
      setLoginError('Ingrese su PIN de seguridad de doble factor (2FA).');
      return;
    }

    const res = validarPinSeguridad(usuarioPendiente.id, pinInput);
    if (!res.success) {
      setLoginError(res.error || 'PIN de seguridad incorrecto.');
      return;
    }

    guardarSesionActiva(usuarioPendiente);
    onLoginSuccess(usuarioPendiente);
  };

  // Manejo de Registro de Empresa
  const handleRegistroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegistroError(null);
    setRegistroSuccess(null);

    if (!regAceptaPin) {
      setRegistroError('Debe confirmar que ha guardado y recordará su PIN de seguridad.');
      return;
    }

    const res = registrarEmpresa({
      correo: regCorreo,
      usuario: regUsuario,
      password: regPassword,
      repetirPassword: regRepetirPassword,
      celular: regCelular,
      pin: regPin,
      nombreEmpresa: regNombreEmpresa,
      ruc: regRuc
    });

    if (!res.success) {
      setRegistroError(res.error || 'Error al registrar la empresa.');
      return;
    }

    setRegistroSuccess('¡Empresa registrada exitosamente! Ahora puede iniciar sesión con sus credenciales.');
    // Limpiar formulario y cambiar a pestaña de login
    setIdentificador(regUsuario);
    setTimeout(() => {
      setTab('login');
      setLoginStep(1);
    }, 1500);
  };

  const blurClass = 
    brandConfig.desenfoqueFondo === 'fuerte' ? 'backdrop-blur-md' :
    brandConfig.desenfoqueFondo === 'medio' ? 'backdrop-blur-sm' :
    brandConfig.desenfoqueFondo === 'suave' ? 'backdrop-blur-xs' : '';

  return (
    <div 
      className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans selection:bg-rose-500 selection:text-white"
    >
      {/* 1. Fondo de Pantalla Completa: Imagen o Color Degradado configurable desde el Dashboard */}
      {brandConfig.fondoPantallaCompleta && (
        <div className="absolute inset-0 pointer-events-none z-0">
          {/* Capa de Color Degradado de Base */}
          <div 
            className="absolute inset-0 transition-all duration-500"
            style={{ 
              background: currentGradient,
              opacity: (brandConfig.tipoFondo === 'imagen' && bgImagenUrl) ? 0.35 : 1
            }}
          />

          {/* Capa de Fotografía / Textura en Pantalla Completa */}
          {bgImagenUrl && (brandConfig.tipoFondo === 'imagen' || brandConfig.tipoFondo === 'ambos') && (
            <div 
              className="absolute inset-0 bg-cover bg-center transition-all duration-500"
              style={{ 
                backgroundImage: `url(${bgImagenUrl})`,
                opacity: brandConfig.opacidadFondo ?? 0.50,
                mixBlendMode: brandConfig.tipoFondo === 'ambos' ? 'overlay' : 'normal'
              }}
            />
          )}

          {/* Viñeta oscura radial y máscara para máximo contraste del formulario */}
          <div className={`absolute inset-0 bg-black/45 ${blurClass}`} />
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]" />
        </div>
      )}

      {/* Botón flotante para alternar Tema Claro / Oscuro */}
      <div className="fixed top-5 right-5 z-30">
        <button
          onClick={toggleTheme}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold shadow-lg border backdrop-blur-md transition-all cursor-pointer ${
            theme === 'oscuro' 
              ? 'bg-slate-900/90 border-slate-700 text-amber-400 hover:bg-slate-800' 
              : 'bg-white/90 border-slate-200 text-slate-700 hover:bg-white'
          }`}
          title="Cambiar tema de la interfaz"
        >
          {theme === 'oscuro' ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Tema Claro</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-slate-600" />
              <span>Tema Oscuro</span>
            </>
          )}
        </button>
      </div>

      {/* Contenedor Principal Split (Estilo login.jpg) */}
      <div className={`w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 border relative z-10 backdrop-blur-xs transition-colors duration-200 ${
        theme === 'oscuro' 
          ? 'bg-slate-900/95 border-slate-700/80 shadow-black/60' 
          : 'bg-white/95 border-white/60 shadow-2xl'
      }`}>
        
        {/* PANEL IZQUIERDO: FORMULARIO CORPORATIVO */}
        <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-center">
          
          {/* Encabezado del Formulario con Monograma */}
          <div className="text-center mb-8">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-400 block mb-2">
              {brandConfig.textoBienvenida || 'WELCOME TO'}
            </span>
            <div className="flex items-center justify-center gap-2.5 text-blue-700 dark:text-blue-400">
              {brandConfig.tipoLogo === 'imagen' && brandConfig.logoUrlPersonalizado ? (
                <img 
                  src={brandConfig.logoUrlPersonalizado} 
                  alt="Logo" 
                  className="w-8 h-8 object-contain rounded-md" 
                />
              ) : brandConfig.iconoSeleccionado === 'shield' ? (
                <ShieldCheck className="w-8 h-8" />
              ) : brandConfig.iconoSeleccionado === 'building' ? (
                <Building className="w-8 h-8" />
              ) : brandConfig.iconoSeleccionado === 'award' ? (
                <Award className="w-8 h-8" />
              ) : brandConfig.iconoSeleccionado === 'trending' ? (
                <Layers className="w-8 h-8" />
              ) : (
                <InfinityIcon className="w-8 h-8" />
              )}
              <span className="text-2xl font-black tracking-tight uppercase">
                {brandConfig.tituloFormulario || 'VALUADOR ACTUARIAL'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-xs mx-auto">
              {brandConfig.subtituloFormulario || 'Portal Institucional de Nómina y Provisiones Laborales Ecuador · NIC 19'}
            </p>
          </div>

          {/* Toggle de Pestañas: Iniciar Sesión / Registrar Empresa */}
          <div className="p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 mb-6 grid grid-cols-2 gap-1 border border-slate-200/60 dark:border-slate-700/60">
            <button
              onClick={() => { setTab('login'); setLoginStep(1); setLoginError(null); }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                tab === 'login'
                  ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {brandConfig.textoTabLogin || 'Iniciar Sesión'}
            </button>
            <button
              onClick={() => { setTab('registro'); setRegistroError(null); }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                tab === 'registro'
                  ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {brandConfig.textoTabRegistro || 'Registrar Empresa'}
            </button>
          </div>

          {/* Alert de Error */}
          {loginError && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          {/* TAB: INICIAR SESIÓN */}
          {tab === 'login' && (
            loginStep === 1 ? (
              // PASO 1: USUARIO Y CONTRASEÑA
              <form onSubmit={handlePaso1Login} className="space-y-4">
                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={identificador}
                      onChange={e => setIdentificador(e.target.value)}
                      placeholder="Username o Correo Electrónico"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Password"
                      required
                      className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Botón Principal SIGN IN */}
                <button
                  type="submit"
                  disabled={loginLoading}
                  className={`w-full py-3 px-4 rounded-xl ${
                    brandConfig.colorBotonFormulario === 'azul' ? 'bg-blue-600 hover:bg-blue-700' :
                    brandConfig.colorBotonFormulario === 'rojo' ? 'bg-rose-600 hover:bg-rose-700' :
                    brandConfig.colorBotonFormulario === 'purpura' ? 'bg-[#5b52f9] hover:bg-[#4f46e5]' :
                    brandConfig.colorBotonFormulario === 'esmeralda' ? 'bg-emerald-600 hover:bg-emerald-700' :
                    brandConfig.colorBotonFormulario === 'negro' ? 'bg-slate-900 hover:bg-black' :
                    preset.buttonColor
                  } text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2`}
                >
                  {loginLoading ? (
                    <span>Verificando...</span>
                  ) : (
                    <span>{brandConfig.textoBotonLogin || 'SIGN IN'}</span>
                  )}
                </button>

                <div className="text-center pt-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    ¿No tiene una cuenta?{' '}
                    <button
                      type="button"
                      onClick={() => setTab('registro')}
                      className="text-blue-700 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                    >
                      Sign Up Now
                    </button>
                  </p>
                </div>
              </form>
            ) : (
              // PASO 2: DOBLE FACTOR (PIN)
              <form onSubmit={handlePaso2Pin} className="space-y-5 animate-in fade-in">
                <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-blue-600 text-white mx-auto flex items-center justify-center shadow-md">
                    <Fingerprint className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Autenticación en Dos Pasos (2FA)
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Hola <strong>{usuarioPendiente?.nombre}</strong>. Por favor ingrese su PIN de seguridad de 4 dígitos para acceder al sistema.
                  </p>
                </div>

                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Key className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      maxLength={4}
                      value={pinInput}
                      onChange={e => setPinInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="PIN de Seguridad (4 dígitos)"
                      autoFocus
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-center font-mono tracking-widest text-lg font-bold focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 text-center mt-1.5">
                    PIN confidencial registrado en su cuenta
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setLoginStep(1); setPinInput(''); }}
                    className="w-1/3 py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Volver</span>
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 py-2.5 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-md transition cursor-pointer"
                  >
                    Confirmar e Ingresar
                  </button>
                </div>
              </form>
            )
          )}

          {/* TAB: REGISTRAR EMPRESA */}
          {tab === 'registro' && (
            <form onSubmit={handleRegistroSubmit} className="space-y-3.5">
              {registroSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{registroSuccess}</span>
                </div>
              )}

              {registroError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{registroError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Razón Social / Empresa:
                  </label>
                  <input
                    type="text"
                    value={regNombreEmpresa}
                    onChange={e => setRegNombreEmpresa(e.target.value)}
                    placeholder="Ej. Corporación Andina S.A."
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    RUC (13 dígitos Ecuador):
                  </label>
                  <input
                    type="text"
                    maxLength={13}
                    value={regRuc}
                    onChange={e => setRegRuc(e.target.value.replace(/\D/g, ''))}
                    placeholder="1790000000001"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-xs focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Usuario:
                  </label>
                  <input
                    type="text"
                    value={regUsuario}
                    onChange={e => setRegUsuario(e.target.value)}
                    placeholder="nombre_usuario"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Correo Institucional:
                  </label>
                  <input
                    type="email"
                    value={regCorreo}
                    onChange={e => setRegCorreo(e.target.value)}
                    placeholder="rrhh@empresa.com.ec"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Contraseña:
                  </label>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    placeholder="Contraseña segura"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    PIN 2FA (4 dígitos):
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={regPin}
                    onChange={e => setRegPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="Ej. 1234"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-center text-xs focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
              </div>

              <label className="flex items-start gap-2 pt-2 text-[11px] text-slate-600 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={regAceptaPin}
                  onChange={e => setRegAceptaPin(e.target.checked)}
                  className="mt-0.5 rounded border-slate-400 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span>Confirmo que he guardado mi PIN de seguridad de 4 dígitos para ingresar al portal.</span>
              </label>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer mt-2"
              >
                Completar Registro de Empresa
              </button>
            </form>
          )}

        </div>

        {/* PANEL DERECHO: BRANDING CORPORATIVO INSTITUCIONAL (Estilo login.jpg) */}
        <div 
          className="lg:col-span-6 text-white p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden transition-all duration-300"
          style={{ background: currentGradient }}
        >
          {/* Fotografía / Textura de fondo configurada por el Administrador */}
          {bgImagenUrl && (
            <div 
              className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-35 pointer-events-none"
              style={{ backgroundImage: `url(${bgImagenUrl})` }}
            />
          )}

          {/* Sombra de viñeta para máxima legibilidad */}
          <div className="absolute inset-0 bg-black/25 pointer-events-none"></div>
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

          {/* Header Superior del Banner */}
          <div className="relative z-10 flex items-center justify-between">
            <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${preset.badgeColor}`}>
              {brandConfig.badgeSuperior || 'Certificación Oficial NIC 19'}
            </span>
            <span className="text-xs text-white/80 font-mono">
              {brandConfig.etiquetaSuperiorDerecha || 'Ecuador 2026'}
            </span>
          </div>

          {/* Centro: Monograma y Título Grande */}
          <div className="relative z-10 my-10 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl text-white">
              {brandConfig.tipoLogo === 'imagen' && brandConfig.logoUrlPersonalizado ? (
                <img 
                  src={brandConfig.logoUrlPersonalizado} 
                  alt="Logo" 
                  className="w-12 h-12 object-contain" 
                />
              ) : brandConfig.iconoSeleccionado === 'shield' ? (
                <ShieldCheck className="w-12 h-12" />
              ) : brandConfig.iconoSeleccionado === 'building' ? (
                <Building className="w-12 h-12" />
              ) : brandConfig.iconoSeleccionado === 'award' ? (
                <Award className="w-12 h-12" />
              ) : brandConfig.iconoSeleccionado === 'trending' ? (
                <Layers className="w-12 h-12" />
              ) : (
                <InfinityIcon className="w-12 h-12" />
              )}
            </div>
            
            <h2 className="text-3xl font-black tracking-tight text-white uppercase drop-shadow-sm">
              {brandConfig.tituloMarca || 'INFINITY ACTUARIAL'}
            </h2>

            <p className="text-xs text-white/95 leading-relaxed max-w-md mx-auto drop-shadow-xs">
              {brandConfig.subtituloMarca || DEFAULT_LOGIN_BRAND_CONFIG.subtituloMarca}
            </p>
          </div>

          {/* Footer del Banner: Normativa y Puntos Clave */}
          <div className="relative z-10 pt-6 border-t border-white/20 grid grid-cols-3 gap-3 text-center">
            <div className="space-y-1">
              <div className="text-xs font-bold text-white">{brandConfig.pieCol1Titulo || 'Art. 185'}</div>
              <div className="text-[10px] text-white/80">{brandConfig.pieCol1Subtitulo || 'Desahucio'}</div>
            </div>
            <div className="space-y-1 border-x border-white/20">
              <div className="text-xs font-bold text-white">{brandConfig.pieCol2Titulo || 'Art. 216'}</div>
              <div className="text-[10px] text-white/80">{brandConfig.pieCol2Subtitulo || 'Jubilación'}</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs font-bold text-white">{brandConfig.pieCol3Titulo || 'NIIF / IFRS'}</div>
              <div className="text-[10px] text-white/80">{brandConfig.pieCol3Subtitulo || 'PUCM & DBO'}</div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
