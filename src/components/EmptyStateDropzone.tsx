import React, { useState, useRef } from 'react';
import { EmpleadoInput, VariablesMacro, RolUsuario } from '../types/actuarial';
import { leerArchivoNomina, descargarPlantillaOficial, parsearTextoPegado, METADATOS_EMPRESA_DETECTADOS } from '../services/actuarialEngine';
import { 
  Upload, 
  FileSpreadsheet, 
  Download, 
  ClipboardPaste, 
  Layers,
  Award,
  Scale,
  ShieldCheck,
  FileCheck2,
  AlertCircle,
  Building
} from 'lucide-react';

interface EmptyStateDropzoneProps {
  onLoadData: (data: EmpleadoInput[], fileName?: string) => void;
  onOpenVariables: () => void;
  variables: VariablesMacro;
  rolActual?: RolUsuario;
  nombreEmpresa?: string;
}

export const EmptyStateDropzone: React.FC<EmptyStateDropzoneProps> = ({
  onLoadData,
  onOpenVariables,
  variables,
  rolActual,
  nombreEmpresa
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isCliente = rolActual === 'cliente';

  const processBuffer = (buffer: any, fileName?: string) => {
    try {
      setErrorMsg(null);
      const rows = leerArchivoNomina(buffer);
      if (rows.length === 0) {
        setErrorMsg('El archivo no contiene filas válidas de colaboradores.');
        return;
      }
      onLoadData(rows, fileName);
    } catch (err: any) {
      setErrorMsg(`Error procesando el archivo: ${err.message}`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileName = file.name;
    const reader = new FileReader();
    reader.onload = (evt) => {
      processBuffer(evt.target?.result, fileName);
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const fileName = file.name;
    const reader = new FileReader();
    reader.onload = (evt) => {
      processBuffer(evt.target?.result, fileName);
    };
    reader.readAsBinaryString(file);
  };

  const handleProcessPasted = () => {
    if (!pasteText.trim()) return;
    try {
      setErrorMsg(null);
      const rows = parsearTextoPegado(pasteText);
      if (rows.length === 0) {
        setErrorMsg('No se pudieron leer filas válidas.');
        return;
      }
      onLoadData(rows, 'nomina_pegada.xlsx');
    } catch (err: any) {
      setErrorMsg(`Error al procesar el texto pegado: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-2">
      
      {/* Tarjeta Principal de Carga - Estilo Corporativo Financiero */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Encabezado del Portal de Carga */}
        <div className="px-6 py-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                {isCliente 
                  ? `Portal de Carga de Información de Nómina${nombreEmpresa ? ` · ${nombreEmpresa}` : ''}`
                  : 'Carga de Información para Valuación Actuarial'}
              </h2>
              <p className="text-xs text-slate-300">
                {isCliente
                  ? 'Suba el archivo de colaboradores solicitado por su actuario calificado'
                  : 'Formatos compatibles: Libros Excel (.xlsx, .xls) o texto delimitado (.csv)'}
              </p>
            </div>
          </div>

          <button
            onClick={descargarPlantillaOficial}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer self-start sm:self-auto"
            title="Descargar el formato oficial con la cabecera institucional y las 13 columnas reglamentarias"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar Plantilla Oficial Excel</span>
          </button>
        </div>

        {/* Cuerpo del Dropzone */}
        <div className="p-6 sm:p-8 space-y-6">
          
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 transition-all text-center ${
              dragOver
                ? 'border-blue-600 bg-blue-50/70'
                : 'border-slate-300 bg-slate-50/60 hover:border-blue-500 hover:bg-white'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-3 shadow-2xs">
              <Upload className="w-7 h-7" />
            </div>

            <h3 className="text-base font-bold text-slate-900 mb-1">
              Arrastra aquí el archivo Excel de la empresa o haz clic para seleccionarlo
            </h3>
            
            <p className="text-xs text-slate-500 max-w-lg mx-auto mb-5 leading-relaxed">
              {isCliente
                ? 'El archivo cargado será recibido de forma segura y se enviará la notificación correspondiente a su actuario calificado para la elaboración del estudio.'
                : 'El motor procesará la información institucional, fechas de nacimiento, fechas de entrada, género (M/F) y remuneraciones computables para calcular las provisiones de Jubilación Patronal (Art. 216) y Bonificación por Desahucio (Art. 185).'}
            </p>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs max-w-md mx-auto flex items-center gap-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs transition shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Examinar Archivo en mi Computador</span>
              </button>

              <button
                onClick={() => setPasteOpen(!pasteOpen)}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <ClipboardPaste className="w-4 h-4 text-slate-600" />
                <span>{pasteOpen ? 'Ocultar Área de Pegado' : 'Pegar Celdas de Excel'}</span>
              </button>
            </div>
          </div>

          {/* Área para pegar texto de celdas */}
          {pasteOpen && (
            <div className="pt-4 border-t border-slate-200 text-left max-w-2xl mx-auto space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ClipboardPaste className="w-4 h-4 text-blue-600" />
                  <span>Pega directamente las filas copiadas desde tu Excel:</span>
                </label>
                <span className="text-[11px] text-slate-500">
                  Incluye la fila con los encabezados
                </span>
              </div>

              <textarea
                rows={6}
                value={pasteText}
                onChange={e => setPasteText(e.target.value)}
                placeholder="No. CÉDULA&#9;NOMBRES&#9;SEXO&#9;FECHA DE NACIMIENTO&#9;FECHA DE ENTRADA&#9;TOTAL&#10;0923456781&#9;PEREZ JUAN&#9;M&#9;15/04/1988&#9;01/06/2018&#9;750.00"
                className="w-full p-3 rounded-md bg-white border border-slate-300 text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />

              <div className="flex items-center justify-between">
                <button
                  onClick={() => { setPasteText(''); setPasteOpen(false); }}
                  className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  onClick={handleProcessPasted}
                  className="px-5 py-2 rounded-md bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>Procesar Celdas Pegadas</span>
                </button>
              </div>
            </div>
          )}

          {/* Indicación del Formato Oficial */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <strong className="text-slate-800 block">Formato Oficial de Información Actuarial:</strong>
                <span>El sistema lee automáticamente las 13 columnas oficiales (Cédula, Nombres, Sexo, F. Nacimiento, F. Entrada, Salida, Sueldo, Total).</span>
              </div>
            </div>

            <button
              onClick={descargarPlantillaOficial}
              className="text-blue-700 hover:text-blue-900 font-bold underline flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Bajar Plantilla (.xlsx)</span>
            </button>
          </div>

        </div>
      </div>

      {/* Bloque Informativo de Base Legal y Cumplimiento Normativo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-white border-l-4 border-l-blue-700 p-4 rounded-md shadow-2xs border border-slate-200">
          <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-blue-700" />
            1. Desahucio (Art. 185)
          </h4>
          <p className="text-slate-600 leading-relaxed text-[11px]">
            Bonificación del 25% del salario proyectado por año de servicio, ajustado por probabilidad de permanencia y factor de descuento financiero según NIC 19.
          </p>
        </div>

        <div className="bg-white border-l-4 border-l-purple-700 p-4 rounded-md shadow-2xs border border-slate-200">
          <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-purple-700" />
            2. Jubilación Patronal (Art. 216)
          </h4>
          <p className="text-slate-600 leading-relaxed text-[11px]">
            Aplica con antigüedad proyectada ≥ 25 años. Aplica coeficientes de renta vitalicia según género y los topes legales de SBU (Res. 07-2021 de la CNJ).
          </p>
        </div>

        <div className="bg-white border-l-4 border-l-emerald-600 p-4 rounded-md shadow-2xs border border-slate-200">
          <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-emerald-600" />
            3. Entregables NIIF / IAS 19
          </h4>
          <p className="text-slate-600 leading-relaxed text-[11px]">
            Emisión de informe pericial formal en Word (.docx editable) y PDF con anexos contables de conciliación de balance y nómina individualizada.
          </p>
        </div>
      </div>

    </div>
  );
};
