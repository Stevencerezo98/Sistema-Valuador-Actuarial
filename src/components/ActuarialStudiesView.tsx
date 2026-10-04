import React, { useState, useEffect } from 'react';
import { 
  RolUsuario, 
  DatosEmpresaEstudio, 
  InfoUsuario, 
  EstudioGuardado, 
  EntregaNominaCliente,
  EmpleadoInput 
} from '../types/actuarial';
import { 
  obtenerEstudiosGuardados, 
  obtenerEstudiosPorEmpresa, 
  solicitarDescargaEstudio, 
  aprobarDescargaEstudio, 
  bloquearDescargaEstudio, 
  eliminarEstudioGuardado,
  obtenerEntregasNomina
} from '../services/studiesService';
import { generarEstudioCompletoPDF } from '../services/estudioPdfReportGenerator';
import { generarEstudioWord } from '../services/wordReportGenerator';
import { exportarResultadosAExcel, procesarMotorActuarial, calcularSensibilidadNIIF } from '../services/actuarialEngine';
import { 
  FolderArchive, 
  Building, 
  Calendar, 
  User, 
  Lock, 
  Unlock, 
  Download, 
  FileText, 
  FileDown, 
  FileSpreadsheet, 
  CheckCircle2, 
  Clock, 
  Send, 
  AlertCircle, 
  Trash2, 
  ArrowRight, 
  Layers, 
  Play, 
  ShieldCheck, 
  BellRing,
  Inbox,
  Mail
} from 'lucide-react';

interface ActuarialStudiesViewProps {
  rolActual: RolUsuario;
  empresa: DatosEmpresaEstudio;
  usuarioActivo: InfoUsuario;
  onCargarCensoAlMotor: (censo: EmpleadoInput[], empresaData?: Partial<DatosEmpresaEstudio>) => void;
}

export const ActuarialStudiesView: React.FC<ActuarialStudiesViewProps> = ({
  rolActual,
  empresa,
  usuarioActivo,
  onCargarCensoAlMotor
}) => {
  const [estudios, setEstudios] = useState<EstudioGuardado[]>([]);
  const [entregas, setEntregas] = useState<EntregaNominaCliente[]>([]);
  const [tabActuario, setTabActuario] = useState<'estudios' | 'entregas' | 'solicitudes'>('estudios');
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const recargarDatos = () => {
    if (rolActual === 'cliente') {
      const ruc = usuarioActivo.ruc || empresa.ruc;
      const nom = usuarioActivo.razonSocial || empresa.nombre_empresa;
      setEstudios(obtenerEstudiosPorEmpresa(ruc, nom));
    } else {
      setEstudios(obtenerEstudiosGuardados());
    }
    setEntregas(obtenerEntregasNomina());
  };

  useEffect(() => {
    recargarDatos();
  }, [rolActual, empresa.ruc, empresa.nombre_empresa, usuarioActivo.ruc]);

  const handleSolicitarDescarga = (estudioId: string) => {
    const ok = solicitarDescargaEstudio(estudioId);
    if (ok) {
      setMensajeExito('¡Solicitud de acceso enviada al actuario! Una vez aprobada, se habilitarán los botones de descarga.');
      recargarDatos();
      setTimeout(() => setMensajeExito(null), 4000);
    }
  };

  const handleAprobarDescarga = (estudioId: string) => {
    const ok = aprobarDescargaEstudio(estudioId, usuarioActivo.nombre);
    if (ok) {
      setMensajeExito('Acceso autorizado a la empresa. Ahora pueden descargar el estudio.');
      recargarDatos();
      setTimeout(() => setMensajeExito(null), 3000);
    }
  };

  const handleBloquearDescarga = (estudioId: string) => {
    bloquearDescargaEstudio(estudioId);
    setMensajeExito('Acceso revocado para la empresa.');
    recargarDatos();
    setTimeout(() => setMensajeExito(null), 3000);
  };

  const handleEliminarEstudio = (estudioId: string) => {
    if (confirm('¿Está seguro de eliminar este estudio actuarial guardado?')) {
      eliminarEstudioGuardado(estudioId);
      recargarDatos();
    }
  };

  // Descargas de un estudio guardado
  const handleDownloadPdf = (estudio: EstudioGuardado) => {
    const { resultados } = procesarMotorActuarial(estudio.censoData, estudio.variables);
    generarEstudioCompletoPDF(resultados, estudio.resumen, estudio.variables, estudio.empresaSnapshot);
  };

  const handleDownloadWord = async (estudio: EstudioGuardado) => {
    const { resultados } = procesarMotorActuarial(estudio.censoData, estudio.variables);
    await generarEstudioWord(resultados, estudio.resumen, estudio.variables, estudio.empresaSnapshot);
  };

  const handleDownloadExcel = (estudio: EstudioGuardado) => {
    const { resultados } = procesarMotorActuarial(estudio.censoData, estudio.variables);
    const sensibilidad = calcularSensibilidadNIIF(estudio.censoData, estudio.variables);
    exportarResultadosAExcel(resultados, estudio.resumen, estudio.variables, sensibilidad);
  };

  const handleCargarAlMotor = (estudio: EstudioGuardado) => {
    onCargarCensoAlMotor(estudio.censoData, estudio.empresaSnapshot);
  };

  const solicitudesPendientes = estudios.filter(e => e.estadoDescargaCliente === 'solicitado');
  const entregasSinEvaluar = entregas.filter(e => e.estado === 'recibido');

  const fmtCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(val);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-sans">
      
      {/* Encabezado del Módulo */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-700 shrink-0">
              <FolderArchive className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  Estudios Actuariales Realizados
                </h2>
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-blue-100 text-blue-800">
                  {rolActual === 'cliente' ? 'Portal Empresa' : 'Gestión Actuarial'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {rolActual === 'cliente'
                  ? `Historial de estudios actuariales elaborados para ${empresa.nombre_empresa} (RUC: ${empresa.ruc || 'N/A'}).`
                  : 'Archivo histórico de estudios formalizados y control de solicitudes de descarga de clientes.'}
              </p>
            </div>
          </div>

          {rolActual === 'cliente' && (
            <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
              <span>Empresa: <strong className="text-slate-800">{empresa.nombre_empresa}</strong></span>
              <span className="block text-[11px] text-slate-400">RUC: {empresa.ruc || 'Registrado'}</span>
            </div>
          )}
        </div>

        {/* Notificaciones y Tabs para Actuario/Admin */}
        {rolActual !== 'cliente' && (
          <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-slate-100">
            <button
              onClick={() => setTabActuario('estudios')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                tabActuario === 'estudios'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              <FolderArchive className="w-3.5 h-3.5" />
              <span>Estudios Guardados ({estudios.length})</span>
            </button>

            <button
              onClick={() => setTabActuario('entregas')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 relative ${
                tabActuario === 'entregas'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              <Inbox className="w-3.5 h-3.5" />
              <span>Nóminas Recibidas de Clientes ({entregas.length})</span>
              {entregasSinEvaluar.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
              )}
            </button>

            <button
              onClick={() => setTabActuario('solicitudes')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 relative ${
                tabActuario === 'solicitudes'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              <BellRing className="w-3.5 h-3.5" />
              <span>Solicitudes de Descarga ({solicitudesPendientes.length})</span>
              {solicitudesPendientes.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
              )}
            </button>
          </div>
        )}
      </div>

      {mensajeExito && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-medium">{mensajeExito}</span>
          </div>
          <button onClick={() => setMensajeExito(null)} className="text-emerald-700 font-bold ml-2">✕</button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA PARA EL CLIENTE / EMPRESA                                          */}
      {/* ========================================================================= */}
      {rolActual === 'cliente' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-900">
              Historial de Estudios Actuariales de su Empresa
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              A continuación se listan los estudios realizados. Para descargar los informes formales, envíe una solicitud de autorización a su actuario asignado.
            </p>
          </div>

          {estudios.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <FolderArchive className="w-6 h-6" />
              </div>
              <div className="font-semibold text-slate-700">No hay estudios actuariales formalizados todavía</div>
              <p className="max-w-md mx-auto text-slate-400">
                Una vez que suba el archivo de nómina de su empresa y el actuario calificado elabore la valuación, el estudio aparecerá guardado en esta sección.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {estudios.map((est) => {
                const isBloqueado = est.estadoDescargaCliente === 'bloqueado';
                const isSolicitado = est.estadoDescargaCliente === 'solicitado';
                const isPermitido = est.estadoDescargaCliente === 'permitido';

                return (
                  <div key={est.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{est.titulo}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                          Año {est.anioEvaluado}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                        <span className="flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          <span>{est.nombreEmpresa}</span>
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Corte: {est.fechaCorte}</span>
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>Actuario: {est.actuarioNombre}</span>
                        </span>
                        <span>·</span>
                        <span>{est.numEmpleados} colaboradores evaluados</span>
                      </div>
                    </div>

                    {/* Estado de acceso y acciones para cliente */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
                      
                      {isBloqueado && (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
                            <Lock className="w-3.5 h-3.5 text-slate-400" />
                            <span>Acceso Restringido</span>
                          </div>
                          <button
                            onClick={() => handleSolicitarDescarga(est.id)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-xs transition cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Solicitar Acceso al Actuario</span>
                          </button>
                        </div>
                      )}

                      {isSolicitado && (
                        <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200/80 px-3 py-1.5 rounded-xl">
                          <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Solicitud enviada al actuario (Pendiente de aprobación)</span>
                        </div>
                      )}

                      {isPermitido && (
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="flex items-center gap-1 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl font-medium">
                            <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Autorizado</span>
                          </div>
                          <button
                            onClick={() => handleDownloadPdf(est)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                            title="Descargar informe completo en PDF"
                          >
                            <FileDown className="w-3.5 h-3.5" />
                            <span>PDF</span>
                          </button>
                          <button
                            onClick={() => handleDownloadWord(est)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                            title="Descargar estudio formal en Word"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Word</span>
                          </button>
                          <button
                            onClick={() => handleDownloadExcel(est)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                            title="Descargar libro de cálculo en Excel"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Excel</span>
                          </button>
                        </div>
                      )}

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA PARA ACTUARIO / SUPER ADMINISTRADOR                                 */}
      {/* ========================================================================= */}
      {rolActual !== 'cliente' && tabActuario === 'estudios' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Archivo de Estudios Actuariales Guardados
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Estudios generados y guardados en el sistema con su memoria de cálculo y control de acceso.
              </p>
            </div>
            <div className="text-xs text-slate-500">
              {estudios.length} estudios registrados
            </div>
          </div>

          {estudios.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <FolderArchive className="w-6 h-6" />
              </div>
              <div className="font-semibold text-slate-700">No hay estudios guardados todavía</div>
              <p className="max-w-md mx-auto text-slate-400">
                Al realizar una valuación actuarial en la pestaña "Cálculo y Valuación", pulse el botón <strong>"Guardar Estudio para la Empresa"</strong> para formalizar y publicar el estudio.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {estudios.map((est) => {
                const isPermitido = est.estadoDescargaCliente === 'permitido';
                const isSolicitado = est.estadoDescargaCliente === 'solicitado';

                return (
                  <div key={est.id} className="p-5 hover:bg-slate-50/60 transition-colors space-y-3">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">{est.titulo}</h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 font-semibold border border-purple-200">
                            RUC: {est.rucEmpresa || 'No especificado'}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                          <span>Empresa: <strong className="text-slate-800">{est.nombreEmpresa}</strong></span>
                          <span>·</span>
                          <span>Corte: {est.fechaCorte}</span>
                          <span>·</span>
                          <span>Fecha Guardado: {est.fechaElaboracion}</span>
                          <span>·</span>
                          <span>{est.numEmpleados} colaboradores</span>
                          <span>·</span>
                          <span>DBO Total: <strong className="text-slate-900 font-mono">{fmtCurrency(est.resumen.vpo_total)}</strong></span>
                        </div>
                      </div>

                      {/* Estado de acceso del cliente y toggle */}
                      <div className="flex items-center gap-2">
                        {isSolicitado && (
                          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                            ¡Cliente solicitó descarga!
                          </span>
                        )}

                        {isPermitido ? (
                          <button
                            onClick={() => handleBloquearDescarga(est.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-medium cursor-pointer transition"
                            title="Revocar permiso de descarga a la empresa"
                          >
                            <Lock className="w-3.5 h-3.5" />
                            <span>Revocar Acceso a Empresa</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAprobarDescarga(est.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs cursor-pointer transition"
                            title="Autorizar para que la empresa pueda descargar el estudio"
                          >
                            <Unlock className="w-3.5 h-3.5" />
                            <span>Permitir Descarga a Empresa</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Acciones del Actuario */}
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCargarAlMotor(est)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-semibold transition cursor-pointer"
                          title="Cargar los datos de este estudio en la pantalla principal de cálculo"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Cargar al Motor Actuarial</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDownloadPdf(est)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                        >
                          <FileDown className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </button>
                        <button
                          onClick={() => handleDownloadWord(est)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Word</span>
                        </button>
                        <button
                          onClick={() => handleDownloadExcel(est)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Excel</span>
                        </button>
                        <button
                          onClick={() => handleEliminarEstudio(est.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Eliminar este estudio guardado"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA: NÓMINAS RECIBIDAS DE EMPRESAS (ENTREGAS SUBIDAS POR CLIENTES)       */}
      {/* ========================================================================= */}
      {rolActual !== 'cliente' && tabActuario === 'entregas' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Nóminas Recibidas de Empresas / Clientes
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Archivos cargados directamente por los clientes en su portal esperando ser valuados por el actuario.
              </p>
            </div>
            <div className="text-xs text-slate-500">
              {entregas.length} entregas registradas
            </div>
          </div>

          {entregas.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 space-y-2">
              <Inbox className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="font-semibold text-slate-700">No hay nóminas pendientes recibidas</div>
              <p className="text-slate-400">Cuando una empresa suba su nómina, se listará aquí para procesarla.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {entregas.map((ent) => (
                <div key={ent.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{ent.nombreEmpresa}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                        RUC: {ent.rucEmpresa || 'No especificado'}
                      </span>
                      {ent.notificadoAlActuario && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-blue-600" />
                          Notificación Recibida
                        </span>
                      )}
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold flex items-center gap-1 border border-emerald-200">
                        <Mail className="w-3 h-3 text-emerald-600" />
                        Aviso por Correo
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3 pt-0.5">
                      <span>Archivo: <strong className="text-slate-800">{ent.nombreArchivo}</strong></span>
                      <span>·</span>
                      <span>{ent.numRegistros} colaboradores</span>
                      <span>·</span>
                      <span>Subido el: {ent.fechaSubida}</span>
                      {ent.fechaNotificacion && (
                        <>
                          <span>·</span>
                          <span className="text-blue-700 font-medium">Notificado: {ent.fechaNotificacion}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => onCargarCensoAlMotor(ent.datosCenso, {
                      nombre_empresa: ent.nombreEmpresa,
                      ruc: ent.rucEmpresa
                    })}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-xs transition cursor-pointer shrink-0"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Cargar Nómina al Motor Actuarial</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA: SOLICITUDES DE DESCARGA PENDIENTES                                */}
      {/* ========================================================================= */}
      {rolActual !== 'cliente' && tabActuario === 'solicitudes' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-900">
              Solicitudes de Descarga de Clientes Pendientes
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Empresas que han solicitado formalmente acceso para descargar su informe actuarial.
            </p>
          </div>

          {solicitudesPendientes.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <div className="font-semibold text-slate-700">No hay solicitudes de descarga pendientes</div>
              <p className="text-slate-400">Todas las solicitudes de empresas han sido atendidas.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {solicitudesPendientes.map((est) => (
                <div key={est.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-amber-50/40">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{est.nombreEmpresa}</div>
                    <div className="text-xs text-slate-600 mt-0.5">
                      Estudio solicitado: <strong>{est.titulo}</strong> (Corte {est.fechaCorte})
                    </div>
                    <div className="text-[11px] text-amber-800 mt-1 font-medium">
                      Solicitud recibida el: {est.fechaSolicitud || 'Reciente'}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAprobarDescarga(est.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-xs transition cursor-pointer"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Aprobar y Permitir Descarga</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
