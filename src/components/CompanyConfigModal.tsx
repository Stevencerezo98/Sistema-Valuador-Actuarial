import React, { useState, useRef } from 'react';
import { DatosEmpresaEstudio, DEFAULT_DATOS_EMPRESA } from '../types/actuarial';
import { extraerParametrosEmpresaDesdeArchivo, METADATOS_EMPRESA_DETECTADOS } from '../services/actuarialEngine';
import { 
  X, 
  Building, 
  Check, 
  RotateCcw, 
  FileText, 
  Award, 
  Calendar, 
  DollarSign, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Briefcase
} from 'lucide-react';

interface CompanyConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  empresa: DatosEmpresaEstudio;
  onChangeEmpresa: (nueva: DatosEmpresaEstudio) => void;
}

export const CompanyConfigModal: React.FC<CompanyConfigModalProps> = ({
  isOpen,
  onClose,
  empresa,
  onChangeEmpresa
}) => {
  const [formData, setFormData] = useState<DatosEmpresaEstudio>(empresa);
  const [autoExtractedMsg, setAutoExtractedMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'empresa' | 'actuario'>('empresa');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleChange = (field: keyof DatosEmpresaEstudio, val: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: val
    }));
  };

  const handleSave = () => {
    onChangeEmpresa(formData);
    try {
      localStorage.setItem('PARAMETROS_EMPRESA_ACTUARIAL', JSON.stringify(formData));
    } catch (e) {
      console.error('Error saving company params to storage:', e);
    }
    onClose();
  };

  const handleResetDefaults = () => {
    setFormData(DEFAULT_DATOS_EMPRESA);
    setAutoExtractedMsg(null);
  };

  // Autollenar desde el archivo de nómina cargado en sesión
  const handleSyncFromDetected = () => {
    const meta = METADATOS_EMPRESA_DETECTADOS;
    const hasData = meta.nombre_empresa || meta.ruc || meta.canton || meta.ciudad;
    if (!hasData) {
      setAutoExtractedMsg('No se encontraron metadatos en la nómina cargada o no hay archivo activo.');
      return;
    }

    setFormData(prev => ({
      ...prev,
      nombre_empresa: meta.nombre_empresa || prev.nombre_empresa,
      nombre_comercial: meta.nombre_comercial || prev.nombre_comercial,
      ruc: meta.ruc || prev.ruc,
      ciudad: meta.canton ? `${meta.canton}, ${meta.provincia || 'Ecuador'}` : (meta.ciudad || prev.ciudad),
      objeto_social: meta.objeto_social || prev.objeto_social,
      fecha_corte_valuacion: meta.fecha_corte_valuacion || prev.fecha_corte_valuacion,
      anio_evaluado: meta.anio_evaluado || prev.anio_evaluado,
      anio_anterior: meta.anio_evaluado ? meta.anio_evaluado - 1 : prev.anio_anterior,
      provision_anterior_jubilacion: meta.provision_anterior_jubilacion || prev.provision_anterior_jubilacion,
      provision_anterior_desahucio: meta.provision_anterior_desahucio || prev.provision_anterior_desahucio,
    }));
    setAutoExtractedMsg(`¡Parámetros sincronizados exitosamente desde la nómina cargada!`);
  };

  // Subir un archivo de la empresa directamente en este modal para autollenar
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result;
        const extraidos = extraerParametrosEmpresaDesdeArchivo(buffer);
        const camposEncontrados: string[] = [];

        setFormData(prev => {
          const next = { ...prev };
          if (extraidos.nombre_empresa) { next.nombre_empresa = extraidos.nombre_empresa; camposEncontrados.push('Razón Social'); }
          if (extraidos.nombre_comercial) { next.nombre_comercial = extraidos.nombre_comercial; camposEncontrados.push('Nombre Comercial'); }
          if (extraidos.ruc) { next.ruc = extraidos.ruc; camposEncontrados.push('RUC'); }
          if (extraidos.ciudad) { next.ciudad = extraidos.ciudad; camposEncontrados.push('Ciudad/Cantón'); }
          if (extraidos.objeto_social) { next.objeto_social = extraidos.objeto_social; camposEncontrados.push('Objeto Social'); }
          if (extraidos.mision) { next.mision = extraidos.mision; camposEncontrados.push('Misión'); }
          if (extraidos.vision) { next.vision = extraidos.vision; camposEncontrados.push('Visión'); }
          if (extraidos.fecha_corte_valuacion) { next.fecha_corte_valuacion = extraidos.fecha_corte_valuacion; camposEncontrados.push('Fecha de Corte'); }
          if (extraidos.anio_evaluado) {
            next.anio_evaluado = extraidos.anio_evaluado;
            next.anio_anterior = extraidos.anio_evaluado - 1;
            camposEncontrados.push('Año Evaluado');
          }
          if (extraidos.provision_anterior_jubilacion) { next.provision_anterior_jubilacion = extraidos.provision_anterior_jubilacion; camposEncontrados.push('Provisión Ant. Jubilación'); }
          if (extraidos.provision_anterior_desahucio) { next.provision_anterior_desahucio = extraidos.provision_anterior_desahucio; camposEncontrados.push('Provisión Ant. Desahucio'); }
          return next;
        });

        if (camposEncontrados.length > 0) {
          setAutoExtractedMsg(`Se extrajeron automáticamente: ${camposEncontrados.join(', ')}.`);
        } else {
          setAutoExtractedMsg(`Archivo leído, pero no se reconocieron etiquetas de empresa en las cabeceras.`);
        }
      } catch (err: any) {
        setAutoExtractedMsg(`Error al leer archivo: ${err.message}`);
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs animate-in fade-in">
      <div className="bg-white border border-gray-300 rounded-lg shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Parámetros del Estudio Actuarial y Empresa
              </h3>
              <p className="text-xs text-gray-500">
                Datos institucionales de la empresa evaluada y parámetros técnicos para informes Word (.docx) y PDF.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Autollenado Inteligente */}
        <div className="px-6 py-3 bg-blue-50/70 border-b border-blue-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-blue-950 font-medium">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Autollenado: Puede importar los datos de la empresa automáticamente desde un archivo Excel o sincronizar con la nómina.</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-2xs transition cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              Subir Excel Empresa
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx,.xls,.csv"
              className="hidden"
            />
            <button
              onClick={handleSyncFromDetected}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-white hover:bg-blue-100 text-blue-800 border border-blue-300 font-semibold text-xs transition cursor-pointer"
            >
              Sincronizar Nómina
            </button>
          </div>
        </div>

        {autoExtractedMsg && (
          <div className="px-6 py-2 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{autoExtractedMsg}</span>
            </div>
            <button onClick={() => setAutoExtractedMsg(null)} className="text-emerald-700 hover:text-emerald-900 font-bold ml-2">×</button>
          </div>
        )}

        {/* Tabs de Configuración */}
        <div className="flex border-b border-gray-200 px-6 bg-white gap-6">
          <button
            onClick={() => setActiveTab('empresa')}
            className={`py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'empresa'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>1. Datos de la Empresa (Extraídos / Provistos por Cliente)</span>
            <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-semibold">Auto</span>
          </button>
          <button
            onClick={() => setActiveTab('actuario')}
            className={`py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'actuario'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>2. Datos del Actuario & Provisiones Anteriores</span>
            <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-semibold">Requerido</span>
          </button>
        </div>

        {/* Body Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-gray-700">

          {activeTab === 'empresa' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              
              <div className="bg-gray-50 border border-gray-200 rounded-md p-3 text-gray-600 text-[11px] flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <p>
                  Estos campos corresponden a la identificación legal y comercial de la empresa cliente. Se completan automáticamente si el archivo Excel contenía una cabecera con el formato oficial o la hoja de datos, pero también pueden editarse manualmente.
                </p>
              </div>

              {/* Razón Social, Nombre Comercial y RUC */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-gray-800 mb-1 flex items-center gap-1.5">
                    <span>Razón Social (Nombre Legal Completo):</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nombre_empresa}
                    onChange={e => handleChange('nombre_empresa', e.target.value)}
                    placeholder="Ej. ACME INDUSTRIAL CÍA. LTDA."
                    className="w-full p-2.5 border border-gray-300 rounded text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-800 mb-1">Nombre Comercial (opcional):</label>
                  <input
                    type="text"
                    value={formData.nombre_comercial}
                    onChange={e => handleChange('nombre_comercial', e.target.value)}
                    placeholder="Ej. ACME"
                    className="w-full p-2.5 border border-gray-300 rounded text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  />
                </div>
              </div>

              {/* RUC, Ciudad, Fechas de Corte */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-800 mb-1 flex items-center gap-1.5">
                    <span>RUC (13 dígitos):</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.ruc}
                    onChange={e => handleChange('ruc', e.target.value)}
                    placeholder="Ej. 1790000000001"
                    maxLength={13}
                    className="w-full p-2.5 border border-gray-300 rounded text-xs text-gray-900 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-800 mb-1">Ciudad / Cantón Domicilio:</label>
                  <input
                    type="text"
                    value={formData.ciudad}
                    onChange={e => handleChange('ciudad', e.target.value)}
                    placeholder="Ej. Quito / Guayaquil / Cuenca"
                    className="w-full p-2.5 border border-gray-300 rounded text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-800 mb-1">Fecha Corte de Valuación:</label>
                  <input
                    type="text"
                    value={formData.fecha_corte_valuacion}
                    onChange={e => handleChange('fecha_corte_valuacion', e.target.value)}
                    placeholder="Ej. 31 de diciembre de 2024"
                    className="w-full p-2.5 border border-gray-300 rounded text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  />
                </div>
              </div>

              {/* Años evaluados */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-800 mb-1">Año Evaluado (Ejercicio Actuarial):</label>
                  <input
                    type="number"
                    value={formData.anio_evaluado}
                    onChange={e => {
                      const anio = parseInt(e.target.value) || 2024;
                      setFormData(prev => ({ ...prev, anio_evaluado: anio, anio_anterior: anio - 1 }));
                    }}
                    className="w-full p-2.5 border border-gray-300 rounded text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-800 mb-1">Año Comparativo Anterior:</label>
                  <input
                    type="number"
                    value={formData.anio_anterior}
                    onChange={e => handleChange('anio_anterior', parseInt(e.target.value) || (formData.anio_evaluado - 1))}
                    className="w-full p-2.5 border border-gray-300 rounded text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-800 mb-1">Fecha de Constitución:</label>
                  <input
                    type="text"
                    value={formData.fecha_constitucion}
                    onChange={e => handleChange('fecha_constitucion', e.target.value)}
                    placeholder="Ej. 15 de marzo de 2010"
                    className="w-full p-2.5 border border-gray-300 rounded text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  />
                </div>
              </div>

              {/* Objeto Social */}
              <div>
                <label className="block text-[11px] font-bold text-gray-800 mb-1">Objeto Social (Actividad Económica Principal):</label>
                <textarea
                  rows={2}
                  value={formData.objeto_social}
                  onChange={e => handleChange('objeto_social', e.target.value)}
                  placeholder="Descripción de actividades comerciales y de servicios conforme a estatutos..."
                  className="w-full p-2.5 border border-gray-300 rounded text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
              </div>

              {/* Misión y Visión */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-800 mb-1">Misión Institucional:</label>
                  <textarea
                    rows={2}
                    value={formData.mision}
                    onChange={e => handleChange('mision', e.target.value)}
                    placeholder="Misión de la organización..."
                    className="w-full p-2.5 border border-gray-300 rounded text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-800 mb-1">Visión Institucional:</label>
                  <textarea
                    rows={2}
                    value={formData.vision}
                    onChange={e => handleChange('vision', e.target.value)}
                    placeholder="Visión de la organización..."
                    className="w-full p-2.5 border border-gray-300 rounded text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  />
                </div>
              </div>

            </div>
          )}

          {activeTab === 'actuario' && (
            <div className="space-y-5 animate-in fade-in duration-150">

              <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-amber-900 text-[11px] flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Datos que debe ingresar y certificar el Perito Actuario:</strong> Estos valores son responsabilidad del profesional actuario calificado y comprenden sus credenciales ante los organismos de control (SCVS y SB), así como los saldos contables de provisiones y pagos del ejercicio.
                </p>
              </div>

              {/* Datos del Actuario */}
              <div className="space-y-3">
                <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider border-b border-gray-200 pb-1 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-blue-600" />
                  Identificación y Calificación del Perito Actuario
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-800 mb-1">Nombre Completo del Perito Actuario:</label>
                    <input
                      type="text"
                      value={formData.actuario_nombre}
                      onChange={e => handleChange('actuario_nombre', e.target.value)}
                      placeholder="Ej. Econ. Juan Pérez / Perito Actuario"
                      className="w-full p-2.5 border border-gray-300 rounded text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-800 mb-1">Título Profesional / Especialidad:</label>
                    <input
                      type="text"
                      value={formData.actuario_titulo}
                      onChange={e => handleChange('actuario_titulo', e.target.value)}
                      placeholder="Ej. Consultoría Actuarial & Auditoría NIC 19"
                      className="w-full p-2.5 border border-gray-300 rounded text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-800 mb-1">Registro Superintendencia de Compañías (SCVS):</label>
                    <input
                      type="text"
                      value={formData.actuario_registro_scvs}
                      onChange={e => handleChange('actuario_registro_scvs', e.target.value)}
                      placeholder="Ej. Registro No. 1-014 SCVS"
                      className="w-full p-2.5 border border-gray-300 rounded text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-800 mb-1">Registro Superintendencia de Bancos (SB):</label>
                    <input
                      type="text"
                      value={formData.actuario_registro_sb}
                      onChange={e => handleChange('actuario_registro_sb', e.target.value)}
                      placeholder="Ej. Registro No. PEA-2020-001 SB"
                      className="w-full p-2.5 border border-gray-300 rounded text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-800 mb-1">Fecha de Emisión del Informe:</label>
                    <input
                      type="text"
                      value={formData.fecha_emision_informe}
                      onChange={e => handleChange('fecha_emision_informe', e.target.value)}
                      placeholder="Ej. Quito, enero de 2025"
                      className="w-full p-2.5 border border-gray-300 rounded text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Provisiones Históricas y Conciliación Contable */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider border-b border-gray-200 pb-1 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  Saldos Contables Históricos del Año Anterior ({formData.anio_anterior})
                </h4>
                <p className="text-[11px] text-gray-500">
                  Valores indispensables para calcular la variación del pasivo, el gasto por servicio corriente y el ORI en la conciliación NIIF.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded border border-gray-200 space-y-2">
                    <span className="font-bold text-gray-800 text-xs block">Jubilación Patronal (Art. 216):</span>
                    <div>
                      <label className="block text-[11px] text-gray-600 mb-1">Provisión Acumulada año {formData.anio_anterior} ($):</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.provision_anterior_jubilacion}
                        onChange={e => handleChange('provision_anterior_jubilacion', parseFloat(e.target.value) || 0)}
                        className="w-full p-2 border border-gray-300 rounded text-xs text-gray-900 font-mono bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-600 mb-1">Pagos Jubilación efectuados en {formData.anio_evaluado} ($):</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.pagos_realizados_jubilacion}
                        onChange={e => handleChange('pagos_realizados_jubilacion', parseFloat(e.target.value) || 0)}
                        className="w-full p-2 border border-gray-300 rounded text-xs text-gray-900 font-mono bg-white"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded border border-gray-200 space-y-2">
                    <span className="font-bold text-gray-800 text-xs block">Bonificación por Desahucio (Art. 185):</span>
                    <div>
                      <label className="block text-[11px] text-gray-600 mb-1">Provisión Acumulada año {formData.anio_anterior} ($):</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.provision_anterior_desahucio}
                        onChange={e => handleChange('provision_anterior_desahucio', parseFloat(e.target.value) || 0)}
                        className="w-full p-2 border border-gray-300 rounded text-xs text-gray-900 font-mono bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-600 mb-1">Liquidaciones Desahucio pagadas en {formData.anio_evaluado} ($):</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.pagos_realizados_desahucio}
                        onChange={e => handleChange('pagos_realizados_desahucio', parseFloat(e.target.value) || 0)}
                        className="w-full p-2 border border-gray-300 rounded text-xs text-gray-900 font-mono bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tasas del Informe Pericial */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-[11px] font-bold text-gray-800 mb-1">Tasa de Interés Técnico Legal (Art. 218):</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.001"
                      value={formData.tasa_interes_tecnico}
                      onChange={e => handleChange('tasa_interes_tecnico', parseFloat(e.target.value) || 0.04)}
                      className="w-32 p-2 border border-gray-300 rounded text-xs text-gray-900 font-mono bg-white"
                    />
                    <span className="text-gray-500 font-semibold">({(formData.tasa_interes_tecnico * 100).toFixed(1)}% anual)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-800 mb-1">Inflación Promedio Estimada:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.001"
                      value={formData.inflacion}
                      onChange={e => handleChange('inflacion', parseFloat(e.target.value) || 0.022)}
                      className="w-32 p-2 border border-gray-300 rounded text-xs text-gray-900 font-mono bg-white"
                    />
                    <span className="text-gray-500 font-semibold">({(formData.inflacion * 100).toFixed(1)}% anual)</span>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-gray-600 hover:text-gray-900 hover:bg-gray-200 text-xs font-medium transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Limpiar / Valores por Defecto
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 text-xs font-semibold transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <Check className="w-4 h-4" />
              Guardar Parámetros
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
