import React, { useState } from 'react';
import { VariablesMacro, ResumenMotor, DatosEmpresaEstudio } from '../types/actuarial';
import { 
  X, 
  Sliders, 
  RotateCcw, 
  Check, 
  Scale, 
  AlertTriangle, 
  ArrowRight, 
  Info, 
  CheckCircle2, 
  Calculator,
  HelpCircle,
  TrendingDown,
  Sparkles
} from 'lucide-react';
import { DEFAULT_VARIABLES_MACRO } from '../services/actuarialEngine';

interface MacroVariablesModalProps {
  isOpen: boolean;
  onClose: () => void;
  variables: VariablesMacro;
  onChangeVariables: (vars: VariablesMacro) => void;
  resumen?: ResumenMotor;
  empresa?: DatosEmpresaEstudio;
}

export const MacroVariablesModal: React.FC<MacroVariablesModalProps> = ({
  isOpen,
  onClose,
  variables,
  onChangeVariables,
  resumen,
  empresa
}) => {
  const [activeTab, setActiveTab] = useState<'variables' | 'conciliacion'>('variables');

  // Estado local para los datos del estudio previo que el cliente o actuario tiene en mano
  const [prevDesahucio, setPrevDesahucio] = useState<string>('');
  const [prevJubilacion, setPrevJubilacion] = useState<string>('');
  const [prevTasaDescuento, setPrevTasaDescuento] = useState<string>('7.5');
  const [prevTasaRotacion, setPrevTasaRotacion] = useState<string>('5.0');
  const [prevTasaSalarial, setPrevTasaSalarial] = useState<string>('3.0');
  const [prevSbu, setPrevSbu] = useState<string>('460');

  if (!isOpen) return null;

  // Presets de mercado ecuatoriano (SCVS / Práctica Actuarial NIC 19)
  const aplicarPreset = (preset: { i: number; s: number; r: number; sbu: number; desc: string }) => {
    onChangeVariables({
      ...variables,
      tasa_descuento: preset.i,
      tasa_incremento_sal: preset.s,
      tasa_rotacion: preset.r,
      sbu_vigente: preset.sbu
    });
  };

  // Valores numéricos del estudio previo para la conciliación
  const numPrevDes = parseFloat(prevDesahucio.replace(/[^0-9.]/g, '')) || 0;
  const numPrevJub = parseFloat(prevJubilacion.replace(/[^0-9.]/g, '')) || 0;
  const numPrevTotal = numPrevDes + numPrevJub;

  const currentDes = resumen?.vpo_desahucio_total || 0;
  const currentJub = resumen?.vpo_jubilacion_total || 0;
  const currentTotal = resumen?.vpo_total || 0;

  const difTotal = currentTotal - numPrevTotal;
  const difPct = numPrevTotal > 0 ? ((currentTotal - numPrevTotal) / numPrevTotal) * 100 : 0;

  const handleCalibrarConEstudioPrevio = () => {
    const parsedI = parseFloat(prevTasaDescuento);
    const i = !isNaN(parsedI) ? parsedI / 100 : variables.tasa_descuento;
    const parsedR = parseFloat(prevTasaRotacion);
    const r = !isNaN(parsedR) ? parsedR / 100 : variables.tasa_rotacion;
    const parsedS = parseFloat(prevTasaSalarial);
    const s = !isNaN(parsedS) ? parsedS / 100 : variables.tasa_incremento_sal;
    const parsedSbu = parseFloat(prevSbu);
    const sbu = !isNaN(parsedSbu) ? parsedSbu : variables.sbu_vigente;

    onChangeVariables({
      ...variables,
      tasa_descuento: Math.max(0.01, Math.min(0.25, i)),
      tasa_rotacion: Math.max(0, Math.min(0.35, r)),
      tasa_incremento_sal: Math.max(0, Math.min(0.20, s)),
      sbu_vigente: Math.max(300, Math.min(1000, sbu))
    });
    setActiveTab('variables');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header con Tabs */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Hipótesis Actuariales & Conciliador de Estudios
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              NIC 19 / IAS 19 Ecuador · Jubilación Patronal (Art. 216) y Desahucio (Art. 185)
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de pestañas */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-100/60 dark:bg-slate-900 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('variables')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'variables'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Variables & Presets de Mercado</span>
          </button>

          <button
            onClick={() => setActiveTab('conciliacion')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'conciliacion'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Scale className="w-4 h-4 text-amber-500" />
            <span>Conciliación vs Estudio Previo (¿Por qué difieren?)</span>
          </button>
        </div>

        {/* Content Area con scroll */}
        <div className="p-6 space-y-5 text-xs overflow-y-auto flex-1">
          
          {/* TAB 1: VARIABLES & PRESETS */}
          {activeTab === 'variables' && (
            <div className="space-y-5">
              
              {/* Presets Rápidos de Mercado */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-700 dark:text-slate-300 text-xs flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Estándares de Práctica Actuarial en Ecuador:
                  </span>
                  <span className="text-[11px] text-slate-500">Seleccione para aplicar</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => aplicarPreset({ i: 0.075, s: 0.03, r: 0.05, sbu: 460, desc: 'Bonos 2024' })}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 bg-white dark:bg-slate-800 text-left transition hover:shadow-xs group cursor-pointer"
                  >
                    <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                      <span>🇪🇨 SCVS / Bonos Soberanos 2024</span>
                      <span className="text-[10px] text-indigo-600 font-mono">i=7.5% · r=5%</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Curva de bonos USD 2024, incremento salarial 3.0%, SBU $460.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => aplicarPreset({ i: 0.0625, s: 0.02, r: 0.03, sbu: 450, desc: 'Bonos 2023' })}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 bg-white dark:bg-slate-800 text-left transition hover:shadow-xs group cursor-pointer"
                  >
                    <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                      <span>🇪🇨 SCVS / Bonos Soberanos 2023</span>
                      <span className="text-[10px] text-emerald-600 font-mono">i=6.25% · r=3%</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Valuación a corte 2023, incremento salarial 2.0%, SBU $450.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => aplicarPreset({ i: 0.055, s: 0.025, r: 0.01, sbu: 460, desc: 'Conservador' })}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 bg-white dark:bg-slate-800 text-left transition hover:shadow-xs group cursor-pointer"
                  >
                    <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                      <span>🛡️ Estudio Conservador (Baja Rotación)</span>
                      <span className="text-[10px] text-purple-600 font-mono">i=5.5% · r=1%</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Para empresas estables con personal de alta permanencia.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => aplicarPreset({ i: 0.070, s: 0.03, r: 0.00, sbu: 460, desc: 'Sin rotación' })}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 bg-white dark:bg-slate-800 text-left transition hover:shadow-xs group cursor-pointer"
                  >
                    <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                      <span>⚡ Rotación Nula (r = 0.0%)</span>
                      <span className="text-[10px] text-amber-600 font-mono">i=7.0% · r=0%</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Sin castigo por desvinculación: pasivo máximo acumulado.
                    </p>
                  </button>
                </div>
              </div>

              {/* Grid de Inputs Principales */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                
                {/* Tasa Descuento */}
                <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-slate-800 dark:text-slate-200">Tasa de Descuento (i)</label>
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                      {(variables.tasa_descuento * 100).toFixed(2)}%
                    </span>
                  </div>
                  <input
                    type="number"
                    step="0.001"
                    min="0.01"
                    max="0.25"
                    value={variables.tasa_descuento}
                    onChange={e => onChangeVariables({ ...variables, tasa_descuento: parseFloat(e.target.value) || 0.075 })}
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 block">
                    Bonos soberanos/corporativos USD (Cada ±1% cambia ~15% el pasivo).
                  </span>
                </div>

                {/* Tasa Incremento Salarial */}
                <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-slate-800 dark:text-slate-200">Incremento Salarial (s)</label>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      {(variables.tasa_incremento_sal * 100).toFixed(2)}%
                    </span>
                  </div>
                  <input
                    type="number"
                    step="0.001"
                    min="0.00"
                    max="0.20"
                    value={variables.tasa_incremento_sal}
                    onChange={e => onChangeVariables({ ...variables, tasa_incremento_sal: parseFloat(e.target.value) || 0.03 })}
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 block">
                    Inflación proyectada + mérito acumulativo al retiro.
                  </span>
                </div>

                {/* Tasa Rotación */}
                <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-slate-800 dark:text-slate-200">Tasa de Rotación (r)</label>
                    <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-sm">
                      {(variables.tasa_rotacion * 100).toFixed(2)}%
                    </span>
                  </div>
                  <input
                    type="number"
                    step="0.001"
                    min="0.00"
                    max="0.30"
                    value={variables.tasa_rotacion}
                    onChange={e => onChangeVariables({ ...variables, tasa_rotacion: parseFloat(e.target.value) || 0.05 })}
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 block">
                    Probabilidad anual de renuncia o desvinculación voluntaria.
                  </span>
                </div>

                {/* SBU Vigente */}
                <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-slate-800 dark:text-slate-200">SBU Vigente (Ecuador)</label>
                    <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                      $ {variables.sbu_vigente.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="number"
                    step="1"
                    min="300"
                    max="1000"
                    value={variables.sbu_vigente}
                    onChange={e => onChangeVariables({ ...variables, sbu_vigente: parseFloat(e.target.value) || 460.00 })}
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 block">
                    Topes pensión Art. 216: Mínimo $ {(variables.sbu_vigente * 0.5).toFixed(2)} / Máximo $ {variables.sbu_vigente.toFixed(2)}
                  </span>
                </div>

              </div>

              {/* Parámetros Demográficos Secundarios */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block text-[11px] mb-1">
                    Edad de Retiro Normal
                  </label>
                  <input
                    type="number"
                    value={variables.edad_retiro}
                    onChange={e => onChangeVariables({ ...variables, edad_retiro: parseInt(e.target.value) || 65 })}
                    className="w-full px-2.5 py-1.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white font-mono text-xs"
                  />
                  <span className="text-[10px] text-slate-400">Normal 60 ó 65 años</span>
                </div>

                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block text-[11px] mb-1">
                    Factor Supervivencia
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={variables.factor_supervivencia}
                    onChange={e => onChangeVariables({ ...variables, factor_supervivencia: parseFloat(e.target.value) || 0.85 })}
                    className="w-full px-2.5 py-1.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white font-mono text-xs"
                  />
                  <span className="text-[10px] text-slate-400">Población IESS activa</span>
                </div>

                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block text-[11px] mb-1">
                    Coeficiente Art. 218 (M / F)
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="number"
                      step="0.1"
                      value={variables.coeficiente_tabla_m}
                      onChange={e => onChangeVariables({ ...variables, coeficiente_tabla_m: parseFloat(e.target.value) || 11.5 })}
                      className="w-1/2 px-2 py-1.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white font-mono text-xs text-center"
                      title="Hombres"
                    />
                    <input
                      type="number"
                      step="0.1"
                      value={variables.coeficiente_tabla_f}
                      onChange={e => onChangeVariables({ ...variables, coeficiente_tabla_f: parseFloat(e.target.value) || 13.0 })}
                      className="w-1/2 px-2 py-1.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white font-mono text-xs text-center"
                      title="Mujeres"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 text-center block">H: 11.5 · M: 13.0</span>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: CONCILIADOR & AUDITORÍA VS ESTUDIO PREVIO */}
          {activeTab === 'conciliacion' && (
            <div className="space-y-5">
              
              {/* Explicación de Diagnóstico Principal */}
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-amber-800 dark:text-amber-300">
                      ¿Por qué difieren los datos de un estudio ya realizado con este motor?
                    </h4>
                    <p className="text-xs mt-1 text-amber-800 dark:text-amber-200/90 leading-relaxed">
                      Dos estudios actuariales para la misma empresa y la misma nómina dan resultados totalmente diferentes si no se usan <strong>las mismas hipótesis financieras</strong> (tasa de descuento, rotación, incremento) o si el estudio anterior usó <strong>bases salariales distintas</strong> (ej. promedio de 5 años vs último sueldo). Ingrese los datos de su informe previo a continuación para diagnosticar y calibrar las cifras.
                    </p>
                  </div>
                </div>
              </div>

              {/* Formulario de Entrada del Estudio Previo */}
              <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <span className="font-bold text-slate-800 dark:text-slate-200 text-xs block">
                  1. Ingrese los valores que figuran en el informe de su estudio previo:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      Pasivo / VPO Desahucio en su estudio ($)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. 12500.50"
                      value={prevDesahucio}
                      onChange={e => setPrevDesahucio(e.target.value)}
                      className="w-full px-3 py-1.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      Pasivo / VPO Jubilación Patronal en su estudio ($)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. 45800.00"
                      value={prevJubilacion}
                      onChange={e => setPrevJubilacion(e.target.value)}
                      className="w-full px-3 py-1.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      Tasa de Descuento declarada en su estudio (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Ej. 6.25"
                      value={prevTasaDescuento}
                      onChange={e => setPrevTasaDescuento(e.target.value)}
                      className="w-full px-3 py-1.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      Tasa de Rotación declarada en su estudio (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Ej. 0.00 ó 3.50"
                      value={prevTasaRotacion}
                      onChange={e => setPrevTasaRotacion(e.target.value)}
                      className="w-full px-3 py-1.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleCalibrarConEstudioPrevio}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Calculator className="w-4 h-4" />
                    <span>Calibrar Motor con las Tasas de mi Estudio Previo</span>
                  </button>
                </div>
              </div>

              {/* Tabla Comparativa Lado a Lado */}
              {numPrevTotal > 0 && (
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-xs">
                  <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2.5 font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                    <span>Comparativa: Cálculo Actual vs Su Estudio Previo</span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                      Math.abs(difPct) < 5 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      Brecha: {difPct > 0 ? `+${difPct.toFixed(1)}%` : `${difPct.toFixed(1)}%`}
                    </span>
                  </div>

                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-semibold">
                      <tr>
                        <th className="p-3">Concepto Actuarial</th>
                        <th className="p-3 text-right">Motor Actual</th>
                        <th className="p-3 text-right">Su Estudio Previo</th>
                        <th className="p-3 text-right">Diferencia ($)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                      <tr>
                        <td className="p-3 font-sans font-medium text-slate-700 dark:text-slate-300">
                          Desahucio (Art. 185)
                        </td>
                        <td className="p-3 text-right font-bold text-slate-900 dark:text-white">
                          ${currentDes.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="p-3 text-right text-slate-600 dark:text-slate-400">
                          ${numPrevDes.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className={`p-3 text-right font-bold ${currentDes >= numPrevDes ? 'text-amber-600' : 'text-blue-600'}`}>
                          ${(currentDes - numPrevDes).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-sans font-medium text-slate-700 dark:text-slate-300">
                          Jubilación Patronal (Art. 216)
                        </td>
                        <td className="p-3 text-right font-bold text-slate-900 dark:text-white">
                          ${currentJub.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="p-3 text-right text-slate-600 dark:text-slate-400">
                          ${numPrevJub.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className={`p-3 text-right font-bold ${currentJub >= numPrevJub ? 'text-amber-600' : 'text-blue-600'}`}>
                          ${(currentJub - numPrevJub).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                      <tr className="bg-slate-50 dark:bg-slate-800/60 font-bold">
                        <td className="p-3 font-sans text-slate-900 dark:text-white">
                          Pasivo Total DBO
                        </td>
                        <td className="p-3 text-right text-indigo-600 dark:text-indigo-400">
                          ${currentTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="p-3 text-right text-slate-700 dark:text-slate-300">
                          ${numPrevTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className={`p-3 text-right ${difTotal >= 0 ? 'text-amber-600' : 'text-blue-600'}`}>
                          ${difTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* Guía Diagnóstica de los 5 Factores de Discrepancia */}
              <div className="space-y-3">
                <span className="font-bold text-slate-800 dark:text-slate-200 text-xs block">
                  2. Diagnóstico Técnico de las 5 causas más comunes de discrepancia:
                </span>

                <div className="grid grid-cols-1 gap-2.5">
                  
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 space-y-1">
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">1</span>
                      Tasa de Descuento (i) diferente
                    </span>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 pl-6 leading-relaxed">
                      La tasa de descuento de la NIC 19 varía según la fecha de corte y el emisor (bonos soberanos de Ecuador o corporativos USD). Si su estudio anterior se hizo con una tasa menor (ej. 6.25% en vez de 7.50%), el pasivo de su estudio será entre <strong>15% y 25% más alto</strong> debido al descuento a valor presente.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 space-y-1">
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px]">2</span>
                      Tratamiento de la Tasa de Rotación (r)
                    </span>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 pl-6 leading-relaxed">
                      En el motor la rotación por defecto es 5.0%. Pero muchos actuarios aplican <strong>rotación nula (0.0%)</strong> o una escala decreciente donde los empleados con más de 10 ó 15 años de servicio tienen 0% de rotación. Si su estudio anterior no aplicó rotación a los empleados antiguos, la jubilación patronal en su estudio será <strong>significativamente mayor</strong>.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 space-y-1">
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">3</span>
                      Base Salarial Utilizada (Sueldo Nominal vs Promedio 5 Años)
                    </span>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 pl-6 leading-relaxed">
                      El Art. 216 del Código de Trabajo exige calcular la jubilación patronal sobre el <em>"promedio de las remuneraciones de los últimos cinco años"</em>. Si su archivo tiene varias columnas (ej. "Sueldo Básico", "Total Ingresos", "Promedio Remuneración"), y el sistema tomó una columna distinta a la que utilizó el actuario anterior, la base de cálculo difiere de origen.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 space-y-1">
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[10px]">4</span>
                      Elegibilidad y Provisión de Jubilación (Filtro de Antigüedad)
                    </span>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 pl-6 leading-relaxed">
                      En Ecuador algunos actuarios <strong>no provisionan jubilación patronal a empleados con menos de 10 años de servicio</strong> por considerarla contingencia remota, mientras que otros provisionan proporcionalmente para todos los que proyectan cumplir 25 años.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 space-y-1">
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-[10px]">5</span>
                      ¿Pasivo DBO vs Saldo Contable en Balance vs Gasto Anual?
                    </span>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 pl-6 leading-relaxed">
                      Verifique qué cifra está comparando: el <strong>DBO (Valor Presente de la Obligación Acumulada)</strong> es diferente de la <strong>Provisión Contable en Libros</strong> (saldo histórico ajustado con pagos y ORI) y diferente del <strong>Gasto del Periodo</strong> (CSC + Costo Financiero).
                    </p>
                  </div>

                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={() => onChangeVariables(DEFAULT_VARIABLES_MACRO)}
            className="text-xs text-slate-600 dark:text-slate-400 hover:text-indigo-600 flex items-center gap-1.5 font-medium cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Valores Sugeridos</span>
          </button>
          
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition cursor-pointer"
          >
            Aplicar y Recalcular Motor
          </button>
        </div>

      </div>
    </div>
  );
};
