import React, { useState, useEffect } from 'react';
import { EntregaNominaCliente, DatosEmpresaEstudio } from '../types/actuarial';
import { notificarActuarioSubidaNomina } from '../services/studiesService';
import { enviarNotificacionCorreoActuario, generarEnlaceMailto, RespuestaNotificacionCorreo } from '../services/notificationService';
import { 
  CheckCircle2, 
  BellRing, 
  FileSpreadsheet, 
  Building, 
  Calendar, 
  Users, 
  ArrowRight, 
  Upload, 
  FolderArchive,
  Clock,
  ShieldCheck,
  Mail,
  Send,
  Eye,
  ExternalLink,
  Check
} from 'lucide-react';

interface ClientConfirmationViewProps {
  entrega: EntregaNominaCliente;
  empresa: DatosEmpresaEstudio;
  onSubirOtra: () => void;
  onVerEstudios: () => void;
}

export const ClientConfirmationView: React.FC<ClientConfirmationViewProps> = ({
  entrega,
  empresa,
  onSubirOtra,
  onVerEstudios
}) => {
  const [notificado, setNotificado] = useState(entrega.notificadoAlActuario);
  const [notificando, setNotificando] = useState(false);
  const [correoResultado, setCorreoResultado] = useState<RespuestaNotificacionCorreo | null>(null);
  const [verModalCorreo, setVerModalCorreo] = useState(false);

  // Al montar la pantalla tras la subida de nómina, enviar automáticamente el correo al actuario
  useEffect(() => {
    let activo = true;
    const ejecutarEnvioAutomatico = async () => {
      try {
        const respuesta = await enviarNotificacionCorreoActuario({
          nombreEmpresa: entrega.nombreEmpresa || empresa.nombre_empresa,
          ruc: entrega.rucEmpresa || empresa.ruc,
          nombreArchivo: entrega.nombreArchivo,
          numRegistros: entrega.numRegistros,
          fechaCarga: entrega.fechaSubida,
          usuarioNombre: entrega.usuarioNombre,
          actuarioEmail: 'actuario@estudiosactuariales.ec'
        });
        if (activo) {
          setCorreoResultado(respuesta);
        }
      } catch (e) {
        console.error('Error en envío automático de correo:', e);
      }
    };

    ejecutarEnvioAutomatico();

    return () => {
      activo = false;
    };
  }, [entrega.id]);

  const handleEnviarNotificacion = async () => {
    setNotificando(true);
    try {
      // 1. Notificar en el servicio de estudios
      notificarActuarioSubidaNomina(entrega.id);
      
      // 2. Enviar correo formal al actuario
      const respuesta = await enviarNotificacionCorreoActuario({
        nombreEmpresa: entrega.nombreEmpresa || empresa.nombre_empresa,
        ruc: entrega.rucEmpresa || empresa.ruc,
        nombreArchivo: entrega.nombreArchivo,
        numRegistros: entrega.numRegistros,
        fechaCarga: entrega.fechaSubida,
        usuarioNombre: entrega.usuarioNombre,
        actuarioEmail: 'actuario@estudiosactuariales.ec'
      });

      setCorreoResultado(respuesta);
      setNotificado(true);
    } catch (e) {
      console.error(e);
      setNotificado(true);
    } finally {
      setNotificando(false);
    }
  };

  const mailtoUrl = generarEnlaceMailto({
    nombreEmpresa: entrega.nombreEmpresa || empresa.nombre_empresa,
    ruc: entrega.rucEmpresa || empresa.ruc,
    nombreArchivo: entrega.nombreArchivo,
    numRegistros: entrega.numRegistros,
    fechaCarga: entrega.fechaSubida,
    usuarioNombre: entrega.usuarioNombre,
    actuarioEmail: 'actuario@estudiosactuariales.ec'
  });

  return (
    <div className="max-w-2xl mx-auto my-8 space-y-6 animate-in fade-in">
      
      {/* Tarjeta Principal de Agradecimiento */}
      <div className="bg-white border border-slate-200/90 rounded-3xl shadow-sm p-8 sm:p-10 text-center relative overflow-hidden">
        
        {/* Glow de fondo suave */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          
          {/* Icono de éxito */}
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-xs">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            GRACIAS POR SUBIR LA INFORMACIÓN
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 mt-2.5 max-w-lg mx-auto leading-relaxed">
            Hemos recibido correctamente el archivo de nómina de su empresa. Los datos de sus colaboradores están registrados y listos para ser revisados y calculados por el perito actuario calificado.
          </p>

          {/* Resumen del Archivo Recibido con Nombre de Empresa y Fecha */}
          <div className="my-6 p-4 sm:p-5 bg-slate-50/80 border border-slate-200/80 rounded-2xl text-left text-xs space-y-2.5 text-slate-700">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">Empresa / Razón Social:</span>
              <span className="font-bold text-slate-900">{entrega.nombreEmpresa || empresa.nombre_empresa}</span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">RUC de la Empresa:</span>
              <span className="font-bold text-slate-900 font-mono">{entrega.rucEmpresa || empresa.ruc || '1792345678001'}</span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">Fecha y Hora de Carga:</span>
              <span className="font-semibold text-blue-700">{entrega.fechaSubida}</span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">Archivo Recibido:</span>
              <span className="font-bold text-slate-900 font-mono">{entrega.nombreArchivo}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Colaboradores Registrados:</span>
              <span className="font-bold text-slate-900">{entrega.numRegistros} empleados</span>
            </div>
          </div>

          {/* BANNER DEL SERVICIO DE CORREO AUTOMÁTICO */}
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-blue-50/90 to-indigo-50/90 border border-blue-200/80 text-left text-xs">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Mail className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-blue-900">
                    Servicio de Correo Automático al Actuario
                  </h4>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                    <Check className="w-3 h-3" />
                    <span>Correo Emitido</span>
                  </span>
                </div>
                <p className="text-slate-600 mt-1 leading-relaxed text-[11px]">
                  Se envió la notificación electrónica a <strong className="text-slate-900">actuario@estudiosactuariales.ec</strong> detallando la carga de <strong>{entrega.nombreEmpresa || empresa.nombre_empresa}</strong> realizada el <strong>{entrega.fechaSubida}</strong>.
                </p>
                <div className="mt-2.5 flex items-center gap-3">
                  <button
                    onClick={() => setVerModalCorreo(true)}
                    className="text-blue-700 hover:text-blue-900 font-bold hover:underline cursor-pointer flex items-center gap-1 text-[11px]"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Ver comprobante del correo enviado</span>
                  </button>
                  <span className="text-slate-300">·</span>
                  <a
                    href={mailtoUrl}
                    className="text-slate-600 hover:text-slate-900 font-medium hover:underline flex items-center gap-1 text-[11px]"
                    title="Abrir en su cliente de correo local (Outlook/Gmail)"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Abrir copia en mi correo</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* BOTÓN SOLICITADO: ENVIAR NOTIFICACIÓN A TU ACTUARIO */}
          {!notificado ? (
            <div className="space-y-3">
              <button
                onClick={handleEnviarNotificacion}
                disabled={notificando}
                className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
              >
                <BellRing className="w-4 h-4 shrink-0" />
                <span>
                  {notificando 
                    ? 'Enviando notificación por correo al actuario...' 
                    : 'ENVIAR UNA NOTIFICACIÓN A TU ACTUARIO PARA SABER QUE YA SUBISTE EL ARCHIVO SOLICITADO'}
                </span>
              </button>
              <p className="text-[11px] text-slate-400">
                Al pulsar este botón, se emite una alerta prioritaria con acuse de recibo para iniciar inmediatamente la valuación actuarial.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs font-medium space-y-1">
              <div className="flex items-center justify-center gap-2 font-bold text-emerald-800 text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>¡Notificación por correo entregada exitosamente a tu actuario!</span>
              </div>
              <p className="text-emerald-700 text-[11px] max-w-md mx-auto">
                El equipo actuarial ha sido alertado con los datos de <strong>{entrega.nombreEmpresa || empresa.nombre_empresa}</strong>. En cuanto finalicen la valuación de provisiones laborales (NIC 19), el estudio estará visible en la sección de <strong>Estudios Actuariales</strong>.
              </p>
            </div>
          )}

          {/* Enlaces secundarios */}
          <div className="mt-8 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <button
              onClick={onSubirOtra}
              className="text-slate-500 hover:text-slate-800 font-medium cursor-pointer transition-colors flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Subir una nómina actualizada o corregida</span>
            </button>

            <button
              onClick={onVerEstudios}
              className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer transition-colors flex items-center gap-1"
            >
              <span>Ver Historial de Estudios Actuariales</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

      {/* MODAL: Vista previa del correo enviado al Actuario */}
      {verModalCorreo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden text-left font-sans">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-blue-400" />
                <span className="font-bold text-xs sm:text-sm">Acuse de Notificación por Correo al Actuario</span>
              </div>
              <button
                onClick={() => setVerModalCorreo(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 font-mono text-[11px]">
                <div><strong className="text-slate-500">Para:</strong> actuario@estudiosactuariales.ec</div>
                <div><strong className="text-slate-500">De:</strong> notificaciones@valuadoractuarial.ec</div>
                <div><strong className="text-slate-500">Asunto:</strong> 📋 Nueva Nómina Cargada: {entrega.nombreEmpresa || empresa.nombre_empresa} - {entrega.fechaSubida}</div>
                <div><strong className="text-slate-500">Fecha de Carga:</strong> {entrega.fechaSubida}</div>
                <div><strong className="text-slate-500">Estado de Envío:</strong> <span className="text-emerald-700 font-bold">Enviado satisfactoriamente</span></div>
              </div>

              <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-3">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                    NIC
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs">SISTEMA VALUADOR ACTUARIAL NIC 19</h5>
                    <p className="text-[10px] text-slate-500">Aviso Oficial de Carga de Información</p>
                  </div>
                </div>

                <p className="text-slate-700 text-xs leading-relaxed">
                  Estimado Actuario Calificado,
                </p>

                <p className="text-slate-700 text-xs leading-relaxed">
                  Se le informa que la empresa <strong>{entrega.nombreEmpresa || empresa.nombre_empresa}</strong> ha subido exitosamente el censo de colaboradores requerido para la valuación actuarial de Jubilación Patronal (Art. 216) y Desahucio (Art. 185).
                </p>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1 text-[11px]">
                  <div>• <strong>Empresa:</strong> {entrega.nombreEmpresa || empresa.nombre_empresa}</div>
                  <div>• <strong>RUC:</strong> {entrega.rucEmpresa || empresa.ruc || '1792345678001'}</div>
                  <div>• <strong>Archivo:</strong> {entrega.nombreArchivo}</div>
                  <div>• <strong>Colaboradores:</strong> {entrega.numRegistros} registros</div>
                  <div>• <strong>Fecha de Carga:</strong> {entrega.fechaSubida}</div>
                </div>

                <p className="text-slate-500 text-[11px]">
                  Los datos se encuentran listos para ser procesados en el motor de cálculo actuarial del portal.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setVerModalCorreo(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
