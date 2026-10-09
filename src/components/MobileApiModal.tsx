import React, { useState } from 'react';
import { 
  Smartphone, 
  X, 
  Terminal, 
  Code2, 
  Check, 
  Copy, 
  ExternalLink, 
  Play, 
  Download, 
  Layers, 
  ShieldCheck, 
  Cpu, 
  FileSpreadsheet, 
  Zap, 
  ChevronRight,
  Server,
  Activity,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface MobileApiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileApiModal: React.FC<MobileApiModalProps> = ({ isOpen, onClose }) => {
  const [tab, setTab] = useState<'catalogo' | 'tester' | 'codigo' | 'arquitectura'>('catalogo');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [testerEndpoint, setTesterEndpoint] = useState<string>('/api/v1/mobile/status');
  const [testerMethod, setTesterMethod] = useState<'GET' | 'POST'>('GET');
  const [testerBody, setTesterBody] = useState<string>(
    JSON.stringify(
      {
        empleados: [
          {
            Cedula: '1712345678',
            Nombre: 'Carlos Morales',
            Genero: 'M',
            Edad: 45,
            Antiguedad: 18,
            Sueldo_Actual: 1350.0,
            Cargo: 'Supervisor de Planta'
          },
          {
            Cedula: '1723456789',
            Nombre: 'Elena Salazar',
            Genero: 'F',
            Edad: 52,
            Antiguedad: 26,
            Sueldo_Actual: 1800.0,
            Cargo: 'Coordinadora de Calidad'
          }
        ],
        variables: {
          tasa_descuento: 0.075,
          tasa_incremento_sal: 0.03,
          tasa_rotacion: 0.05,
          sbu_vigente: 460.0
        }
      },
      null,
      2
    )
  );
  const [testerResponse, setTesterResponse] = useState<any>(null);
  const [testerLoading, setTesterLoading] = useState<boolean>(false);
  const [testerLatency, setTesterLatency] = useState<number | null>(null);
  const [codePlatform, setCodePlatform] = useState<'flutter' | 'reactNative' | 'kotlin' | 'swift' | 'curl'>('flutter');

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const ejecutarTest = async () => {
    setTesterLoading(true);
    setTesterResponse(null);
    const start = performance.now();

    try {
      const options: RequestInit = {
        method: testerMethod,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      if (testerMethod === 'POST') {
        options.body = testerBody;
      }

      const res = await fetch(testerEndpoint, options);
      const data = await res.json();
      const end = performance.now();
      setTesterLatency(Math.round(end - start));
      setTesterResponse(data);
    } catch (err: any) {
      const end = performance.now();
      setTesterLatency(Math.round(end - start));
      setTesterResponse({
        error: 'Error de conexión',
        detalles: err.message
      });
    } finally {
      setTesterLoading(false);
    }
  };

  const seleccionarPresetEndpoint = (endpoint: string, method: 'GET' | 'POST', bodyPreset?: string) => {
    setTesterEndpoint(endpoint);
    setTesterMethod(method);
    if (bodyPreset) {
      setTesterBody(bodyPreset);
    }
    setTab('tester');
    setTesterResponse(null);
  };

  const endpoints = [
    {
      metodo: 'POST',
      ruta: '/api/v1/mobile/actuarial/calculate',
      titulo: 'Motor Actuarial Instantáneo para Móvil',
      descripcion: 'Envía un lote de empleados y devuelve inmediatamente el VPO de Desahucio (Art. 185), Jubilación Patronal (Art. 216), Costo del Servicio Actual (CSC), Costo de Interés y análisis de sensibilidad.',
      badge: 'Cálculo Real-Time',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200'
    },
    {
      metodo: 'POST',
      ruta: '/api/v1/mobile/auth/login',
      titulo: 'Autenticación & Sesión Móvil (Bearer Token)',
      descripcion: 'Valida credenciales de usuario (Empresa, Actuario o Super Admin) y emite un token de sesión Bearer con perfil de usuario y permisos móviles.',
      badge: 'Seguridad 2FA',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    {
      metodo: 'GET',
      ruta: '/api/v1/mobile/actuarial/parameters',
      titulo: 'Variables Macroeconómicas Ecuador (NIC 19)',
      descripcion: 'Consulta las tasas financieras oficiales (tasa de descuento, inflación proyectada, SBU $460.00, factores biométricos y tablas de mortalidad).',
      badge: 'Normativa Oficial',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200'
    },
    {
      metodo: 'POST',
      ruta: '/api/v1/mobile/payroll/upload',
      titulo: 'Carga de Nómina desde Dispositivo Móvil',
      descripcion: 'Permite al cliente subir o transmitir nóminas de colaboradores desde el teléfono. Dispara automáticamente un correo electrónico al actuario.',
      badge: 'Disparo Mail Automático',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200'
    },
    {
      metodo: 'GET',
      ruta: '/api/v1/mobile/payroll/deliveries',
      titulo: 'Historial de Nóminas Transmitidas',
      descripcion: 'Lista todas las nóminas recibidas con estado de revisión, fecha y número de colaboradores registrados.',
      badge: 'Auditoría',
      badgeColor: 'bg-slate-100 text-slate-800 border-slate-200'
    },
    {
      metodo: 'GET',
      ruta: '/api/v1/mobile/studies',
      titulo: 'Estudios Actuariales de la Empresa',
      descripcion: 'Recupera los estudios valorados por el actuario, reservas aprobadas y estado de auditoría contable.',
      badge: 'Informes NIIF',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200'
    },
    {
      metodo: 'GET',
      ruta: '/api/v1/docs/openapi.json',
      titulo: 'Especificación OpenAPI 3.0 / Postman',
      descripcion: 'Documento estándar OpenAPI 3.0 para importar en Postman, Insomnia o generar clientes con OpenAPI Generator para Flutter, Swift o Kotlin.',
      badge: 'OpenAPI 3.0',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 px-6 py-5 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300 shadow-inner">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-white">
                  Hub de Conexión para Aplicación Móvil
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  APIs REST v1.2 ONLINE
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Endpoints listos para conectar Flutter, React Native, iOS (Swift) y Android (Kotlin)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/api/v1/docs/openapi.json"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 border border-blue-400/30 text-blue-200 text-xs font-medium transition cursor-pointer"
              title="Abrir especificación OpenAPI / Swagger JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>OpenAPI JSON</span>
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Barra de Navegación de Pestañas */}
        <div className="px-6 bg-slate-50 border-b border-slate-200 flex gap-2">
          <button
            onClick={() => setTab('catalogo')}
            className={`px-4 py-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition cursor-pointer ${
              tab === 'catalogo'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Catálogo de Endpoints REST</span>
          </button>
          <button
            onClick={() => setTab('tester')}
            className={`px-4 py-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition cursor-pointer ${
              tab === 'tester'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Play className="w-4 h-4 text-emerald-600" />
            <span>Consola de Pruebas en Vivo (Live Tester)</span>
          </button>
          <button
            onClick={() => setTab('codigo')}
            className={`px-4 py-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition cursor-pointer ${
              tab === 'codigo'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code2 className="w-4 h-4 text-purple-600" />
            <span>Código de Integración Móvil</span>
          </button>
          <button
            onClick={() => setTab('arquitectura')}
            className={`px-4 py-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition cursor-pointer ${
              tab === 'arquitectura'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Cpu className="w-4 h-4 text-amber-600" />
            <span>Arquitectura y Flujo Móvil</span>
          </button>
        </div>

        {/* Contenido según pestaña */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-slate-50/50">

          {/* TAB 1: CATÁLOGO DE ENDPOINTS */}
          {tab === 'catalogo' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                <Zap className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-900 space-y-1">
                  <p className="font-bold">
                    ¿Cómo conectar una aplicación móvil a este backend?
                  </p>
                  <p>
                    El servidor expone una API REST moderna con soporte CORS universal y respuestas JSON estandarizadas. Cualquier aplicación móvil (desarrollada en Flutter, React Native, Swift o Kotlin) puede invocar estos endpoints directamente para autenticar usuarios, calcular pasivos laborales en tiempo real o enviar la nómina de colaboradores.
                  </p>
                </div>
              </div>

              <div className="grid gap-3">
                {endpoints.map((ep, idx) => (
                  <div 
                    key={idx}
                    className="p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-xs transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded font-mono ${
                          ep.metodo === 'POST' ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'
                        }`}>
                          {ep.metodo}
                        </span>
                        <code className="text-xs font-bold font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                          {ep.ruta}
                        </code>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${ep.badgeColor}`}>
                          {ep.badge}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800">{ep.titulo}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">{ep.descripcion}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleCopy(window.location.origin + ep.ruta, `url-${idx}`)}
                        className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition cursor-pointer flex items-center gap-1"
                        title="Copiar URL completa"
                      >
                        {copiedKey === `url-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span className="hidden sm:inline">Copiar URL</span>
                      </button>

                      <button
                        onClick={() => seleccionarPresetEndpoint(ep.ruta, ep.metodo as any)}
                        className="px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200 transition cursor-pointer flex items-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5 text-blue-600" />
                        <span>Probar API</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: LIVE TESTER */}
          {tab === 'tester' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={testerMethod}
                    onChange={e => setTesterMethod(e.target.value as any)}
                    className="px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold text-xs bg-slate-50"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                  </select>

                  <input
                    type="text"
                    value={testerEndpoint}
                    onChange={e => setTesterEndpoint(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="/api/v1/mobile/actuarial/calculate"
                  />

                  <button
                    onClick={ejecutarTest}
                    disabled={testerLoading}
                    className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {testerLoading ? (
                      <>
                        <Activity className="w-4 h-4 animate-spin" />
                        <span>Ejecutando...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-white" />
                        <span>Enviar Petición</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Preset rápidos */}
                <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-500">
                  <span className="font-semibold">Cargar ejemplo rápido:</span>
                  <button
                    onClick={() => {
                      setTesterEndpoint('/api/v1/mobile/status');
                      setTesterMethod('GET');
                    }}
                    className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono cursor-pointer"
                  >
                    GET /status
                  </button>
                  <button
                    onClick={() => {
                      setTesterEndpoint('/api/v1/mobile/actuarial/parameters');
                      setTesterMethod('GET');
                    }}
                    className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono cursor-pointer"
                  >
                    GET /parameters
                  </button>
                  <button
                    onClick={() => {
                      setTesterEndpoint('/api/v1/mobile/actuarial/calculate');
                      setTesterMethod('POST');
                    }}
                    className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono cursor-pointer"
                  >
                    POST /calculate
                  </button>
                  <button
                    onClick={() => {
                      setTesterEndpoint('/api/v1/mobile/auth/login');
                      setTesterMethod('POST');
                      setTesterBody(JSON.stringify({ usuario: 'empresa', password: 'Empresa123*', pin: '1234' }, null, 2));
                    }}
                    className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono cursor-pointer"
                  >
                    POST /login
                  </button>
                </div>

                {/* Body editor si es POST */}
                {testerMethod === 'POST' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Cuerpo de la Petición JSON (Payload):
                    </label>
                    <textarea
                      rows={8}
                      value={testerBody}
                      onChange={e => setTesterBody(e.target.value)}
                      className="w-full font-mono text-xs p-3 rounded-lg border border-slate-300 bg-slate-900 text-emerald-400 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Resultado de la Petición */}
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 text-slate-200 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-slate-200">Respuesta del Servidor (JSON)</span>
                  </div>
                  {testerLatency !== null && (
                    <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                      Latencia: {testerLatency} ms
                    </span>
                  )}
                </div>

                <pre className="font-mono text-xs max-h-80 overflow-y-auto text-emerald-300 bg-slate-950 p-3 rounded-lg">
                  {testerResponse ? JSON.stringify(testerResponse, null, 2) : '// Presione "Enviar Petición" para probar la respuesta en tiempo real.'}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: CÓDIGO DE INTEGRACIÓN */}
          {tab === 'codigo' && (
            <div className="space-y-4">
              <div className="flex gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
                <button
                  onClick={() => setCodePlatform('flutter')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    codePlatform === 'flutter' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Flutter / Dart
                </button>
                <button
                  onClick={() => setCodePlatform('reactNative')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    codePlatform === 'reactNative' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  React Native / Expo
                </button>
                <button
                  onClick={() => setCodePlatform('kotlin')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    codePlatform === 'kotlin' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Android (Kotlin / Retrofit)
                </button>
                <button
                  onClick={() => setCodePlatform('swift')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    codePlatform === 'swift' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  iOS (Swift / SwiftUI)
                </button>
                <button
                  onClick={() => setCodePlatform('curl')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    codePlatform === 'curl' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  cURL / Postman
                </button>
              </div>

              {/* Snippet Card */}
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                  <span className="font-mono font-bold text-slate-300">
                    {codePlatform === 'flutter' && 'actuarial_service.dart'}
                    {codePlatform === 'reactNative' && 'actuarialApi.ts'}
                    {codePlatform === 'kotlin' && 'ActuarialRepository.kt'}
                    {codePlatform === 'swift' && 'ActuarialService.swift'}
                    {codePlatform === 'curl' && 'terminal.sh'}
                  </span>
                  <button
                    onClick={() => {
                      const text = document.getElementById('code-display-block')?.innerText || '';
                      handleCopy(text, 'code-snippet');
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer"
                  >
                    {copiedKey === 'code-snippet' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copiar Código</span>
                  </button>
                </div>

                <pre id="code-display-block" className="font-mono text-xs text-blue-200 overflow-x-auto p-2 leading-relaxed">
                  {codePlatform === 'flutter' && `import 'dart:convert';
import 'package:http/http.dart' as http;

class ActuarialMobileClient {
  final String baseUrl = '${window.location.origin}';

  /// Autentica al usuario en el portal móvil
  Future<String> login(String usuario, String password) async {
    final response = await http.post(
      Uri.parse('\$baseUrl/api/v1/mobile/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'usuario': usuario, 'password': password}),
    );
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['token']; // Bearer Token para subsecuentes llamadas
    }
    throw Exception('Error al iniciar sesión: \${response.body}');
  }

  /// Calcula provisiones actuariales instantáneas en el móvil
  Future<Map<String, dynamic>> calcularProvisiones(List<Map<String, dynamic>> empleados) async {
    final response = await http.post(
      Uri.parse('\$baseUrl/api/v1/mobile/actuarial/calculate'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'empleados': empleados}),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    throw Exception('Error en cálculo actuarial: \${response.body}');
  }

  /// Sube la nómina desde el móvil y notifica al perito actuario por correo
  Future<bool> subirNominaYNotificar({
    required String nombreEmpresa,
    required String ruc,
    required List<Map<String, dynamic>> empleados,
    String? emailContacto,
  }) async {
    final response = await http.post(
      Uri.parse('\$baseUrl/api/v1/mobile/payroll/upload'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'nombreEmpresa': nombreEmpresa,
        'ruc': ruc,
        'numRegistros': empleados.length,
        'empleados': empleados,
        'usuarioEmail': emailContacto,
      }),
    );
    return response.statusCode == 201;
  }
}`}

                  {codePlatform === 'reactNative' && `import axios from 'axios';

const BASE_URL = '${window.location.origin}';

export const actuarialApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Función para calcular provisiones actuariales desde React Native
export const calcularProvisiones = async (empleados: any[]) => {
  const response = await actuarialApi.post('/api/v1/mobile/actuarial/calculate', {
    empleados,
  });
  return response.data;
};

// Carga de nómina y alerta inmediata al actuario
export const transmitirNominaMovil = async (empresaData: {
  nombreEmpresa: string;
  ruc: string;
  empleados: any[];
  usuarioNombre: string;
}) => {
  const response = await actuarialApi.post('/api/v1/mobile/payroll/upload', empresaData);
  return response.data;
};`}

                  {codePlatform === 'kotlin' && `// Retrofit Interface para Android Kotlin
package ec.actuarial.mobile.network

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST
import retrofit2.http.GET

interface ActuarialMobileApi {
    @POST("/api/v1/mobile/auth/login")
    suspend fun login(@Body credenciales: LoginRequest): Response<LoginResponse>

    @POST("/api/v1/mobile/actuarial/calculate")
    suspend fun calcularActuarial(@Body request: CalculoRequest): Response<CalculoResponse>

    @GET("/api/v1/mobile/actuarial/parameters")
    suspend fun obtenerParametros(): Response<ParametrosResponse>
}`}

                  {codePlatform === 'swift' && `// Swift 5 / iOS URLSession Client
import Foundation

class ActuarialAPIClient {
    static let shared = ActuarialAPIClient()
    let baseURL = "${window.location.origin}"

    func calcularProvisiones(empleados: [[String: Any]], completion: @escaping (Result<[String: Any], Error>) -> Void) {
        guard let url = URL(string: "\\(baseURL)/api/v1/mobile/actuarial/calculate") else { return }
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
    }
}`}

                  {codePlatform === 'curl' && `# 1. Obtener estado de la API Móvil
curl -X GET "${window.location.origin}/api/v1/mobile/status"

# 2. Calcular provisiones actuariales en el motor oficial
curl -X POST "${window.location.origin}/api/v1/mobile/actuarial/calculate" \\
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
  }'

# 3. Transmitir nómina desde el móvil y notificar al actuario por correo
curl -X POST "${window.location.origin}/api/v1/mobile/payroll/upload" \\
  -H "Content-Type: application/json" \\
  -d '{
    "nombreEmpresa": "Corporación Industrial C.A.",
    "ruc": "1792345678001",
    "nombreArchivo": "nomina_movil.xlsx",
    "numRegistros": 50,
    "usuarioEmail": "rrhh@empresa.com.ec"
  }'`}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 4: ARQUITECTURA */}
          {tab === 'arquitectura' && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <h4 className="text-xs font-bold text-slate-800">Autenticación & Seguridad</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Las aplicaciones móviles inician sesión en <code>/api/v1/mobile/auth/login</code> obteniendo un token Bearer con caducidad de 30 días y control de roles (Empresa vs. Perito Actuario).
                  </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <h4 className="text-xs font-bold text-slate-800">Cálculo en la Nube</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    El motor actuarial corre del lado del servidor en Node.js, garantizando que las fórmulas NIC 19, Art. 185 y Art. 216 apliquen con precisión milimétrica sin saturar la batería ni la memoria del teléfono.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <h4 className="text-xs font-bold text-slate-800">Notificación Push & Correo</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Cuando un cliente sube su censo desde la app móvil, el servidor despacha un correo HTML formal al perito actuario indicando el RUC, la empresa y el número de colaboradores.
                  </p>
                </div>
              </div>

              <div className="bg-slate-900 text-white rounded-xl p-5 space-y-3">
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <Server className="w-4 h-4 text-blue-400" />
                  <span>URL Base del Servidor para la Aplicación Móvil</span>
                </h4>
                <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-xs text-emerald-400">
                  <span className="flex-1 truncate">{window.location.origin}/api/v1/mobile</span>
                  <button
                    onClick={() => handleCopy(`${window.location.origin}/api/v1/mobile`, 'base-url')}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-sans text-xs cursor-pointer flex items-center gap-1"
                  >
                    {copiedKey === 'base-url' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>Copiar</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Modal */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>API REST compatible con Flutter, React Native, Swift y Kotlin</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
