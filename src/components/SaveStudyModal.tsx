import React, { useState } from 'react';
import { 
  DatosEmpresaEstudio, 
  ResumenMotor, 
  VariablesMacro, 
  EmpleadoInput 
} from '../types/actuarial';
import { guardarEstudioActuarial } from '../services/studiesService';
import { 
  FolderPlus, 
  Building, 
  Calendar, 
  User, 
  DollarSign, 
  CheckCircle2, 
  Save, 
  X,
  ShieldCheck
} from 'lucide-react';

interface SaveStudyModalProps {
  isOpen: boolean;
  onClose: () => void;
  empresa: DatosEmpresaEstudio;
  resumen: ResumenMotor;
  variables: VariablesMacro;
  censoInput: EmpleadoInput[];
  onEstudioGuardado: (estudioId: string) => void;
}

export const SaveStudyModal: React.FC<SaveStudyModalProps> = ({
  isOpen,
  onClose,
  empresa,
  resumen,
  variables,
  censoInput,
  onEstudioGuardado
}) => {
  if (!isOpen) return null;

  const [titulo, setTitulo] = useState(
    `Estudio Actuarial NIC 19 - ${empresa.nombre_empresa} (${empresa.anio_evaluado || 2024})`
  );
  const [nombreEmpresa, setNombreEmpresa] = useState(empresa.nombre_empresa);
  const [rucEmpresa, setRucEmpresa] = useState(empresa.ruc || '');
  const [fechaCorte, setFechaCorte] = useState(empresa.fecha_corte_valuacion || '31 de diciembre de 2024');
  const [anioEvaluado, setAnioEvaluado] = useState<number>(empresa.anio_evaluado || 2024);
  const [actuarioNombre, setActuarioNombre] = useState(empresa.actuario_nombre || 'Perito Actuario Calificado');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) {
      setErrorMsg('El título del estudio es obligatorio.');
      return;
    }
    if (!nombreEmpresa.trim()) {
      setErrorMsg('La razón social de la empresa es obligatoria.');
      return;
    }
    if (!rucEmpresa.trim() || rucEmpresa.length < 10) {
      setErrorMsg('Ingrese un RUC válido para identificar la empresa.');
      return;
    }

    const nuevo = guardarEstudioActuarial({
      titulo,
      rucEmpresa,
      nombreEmpresa,
      fechaCorte,
      anioEvaluado,
      actuarioNombre,
      numEmpleados: censoInput.length,
      resumen,
      variables,
      empresaSnapshot: {
        ...empresa,
        nombre_empresa: nombreEmpresa,
        ruc: rucEmpresa,
        fecha_corte_valuacion: fechaCorte,
        anio_evaluado: anioEvaluado,
        actuario_nombre: actuarioNombre
      },
      censoData: censoInput
    });

    onEstudioGuardado(nuevo.id);
    onClose();
  };

  const fmtCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-100">
              <FolderPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Guardar y Publicar Estudio Actuarial
              </h3>
              <p className="text-[11px] text-slate-500">
                Este estudio quedará registrado y visible para la empresa en su portal.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
          
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-slate-800 mb-1">
              Título del Estudio Actuarial:
            </label>
            <input
              type="text"
              required
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-800 mb-1">
                Razón Social de la Empresa:
              </label>
              <input
                type="text"
                required
                value={nombreEmpresa}
                onChange={e => setNombreEmpresa(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-800 mb-1">
                RUC de la Empresa:
              </label>
              <input
                type="text"
                required
                maxLength={13}
                placeholder="1790000000001"
                value={rucEmpresa}
                onChange={e => setRucEmpresa(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-800 mb-1">
                Fecha de Corte de Valuación:
              </label>
              <input
                type="text"
                required
                value={fechaCorte}
                onChange={e => setFechaCorte(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-800 mb-1">
                Perito Actuario Responsable:
              </label>
              <input
                type="text"
                required
                value={actuarioNombre}
                onChange={e => setActuarioNombre(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>
          </div>

          {/* Resumen del Estudio */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-[11px]">
            <span className="font-semibold text-slate-700 uppercase tracking-wider text-[10px] block">
              Snapshot de Resultados Actuariales
            </span>
            <div className="flex justify-between text-slate-600">
              <span>Colaboradores Valuados:</span>
              <strong className="text-slate-900">{censoInput.length} empleados</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>VPO Desahucio (Art. 185):</span>
              <strong className="text-blue-700 font-mono">{fmtCurrency(resumen.vpo_desahucio_total)}</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>VPO Jubilación (Art. 216):</span>
              <strong className="text-purple-700 font-mono">{fmtCurrency(resumen.vpo_jubilacion_total)}</strong>
            </div>
            <div className="flex justify-between text-slate-800 font-semibold pt-1 border-t border-slate-200">
              <span>Obligación Total DBO (NIC 19):</span>
              <strong className="text-emerald-700 font-mono text-xs">{fmtCurrency(resumen.vpo_total)}</strong>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-medium cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Guardar Estudio para la Empresa</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
