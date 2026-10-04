import React from 'react';
import { ResumenMotor, VariablesMacro } from '../types/actuarial';
import { 
  DollarSign, 
  Users, 
  Layers, 
  Award,
  TrendingUp,
  Percent,
  Activity
} from 'lucide-react';

interface KpiCardsProps {
  resumen: ResumenMotor;
  variables: VariablesMacro;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ resumen, variables }) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* 1. VPO Total / DBO Consolidado */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Obligación Total DBO (NIC 19)
            </span>
            <div className="text-2xl font-bold font-mono tracking-tight text-slate-900 mt-2">
              {formatCurrency(resumen.vpo_total)}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Pasivo de Balance General</span>
          <span className="font-semibold text-blue-600">Desahucio + Jubilación</span>
        </div>
      </div>

      {/* 2. VPO Desahucio (Art. 185) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              VPO Desahucio (Art. 185)
            </span>
            <div className="text-2xl font-bold font-mono tracking-tight text-slate-900 mt-2">
              {formatCurrency(resumen.vpo_desahucio_total)}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>25% sueldo por servicio</span>
          <span className="font-semibold text-emerald-600 font-mono">
            {((resumen.vpo_desahucio_total / (resumen.vpo_total || 1)) * 100).toFixed(1)}% del DBO
          </span>
        </div>
      </div>

      {/* 3. VPO Jubilación Patronal (Art. 216) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              VPO Jubilación (Art. 216)
            </span>
            <div className="text-2xl font-bold font-mono tracking-tight text-slate-900 mt-2">
              {formatCurrency(resumen.vpo_jubilacion_total)}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Topes SBU (${variables.sbu_vigente * 0.5} a ${variables.sbu_vigente})</span>
          <span className="font-semibold text-amber-600 font-mono">
            {((resumen.vpo_jubilacion_total / (resumen.vpo_total || 1)) * 100).toFixed(1)}% del DBO
          </span>
        </div>
      </div>

      {/* 4. Colaboradores y Censo */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Elegibles / Total Censo
            </span>
            <div className="text-2xl font-bold font-mono tracking-tight text-slate-900 mt-2">
              {resumen.empleados_elegibles} <span className="text-sm font-normal text-slate-400">/ {resumen.total_empleados}</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Edad Prom: <strong className="text-slate-700">{resumen.edad_promedio.toFixed(1)}a</strong></span>
          <span className="font-semibold text-indigo-600">
            {resumen.porcentaje_elegibles.toFixed(1)}% Jubilables
          </span>
        </div>
      </div>

    </div>
  );
};
