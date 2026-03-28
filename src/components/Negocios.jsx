import React, { useState } from 'react';
import {
  PencilIcon, TrashIcon, PlusIcon, CheckIcon, XMarkIcon,
  BriefcaseIcon, ChevronDownIcon, ChevronUpIcon
} from '@heroicons/react/24/outline';

const TIPOS = [
  { value: 'propio',    label: 'Negocio propio' },
  { value: 'comision',  label: 'Comisión / Afiliado' },
  { value: 'servicio',  label: 'Servicios / Freelance' },
  { value: 'otro',      label: 'Otro' },
];

const MONEDAS = ['USD', 'ARS', 'USDT'];

const NEGOCIO_VACIO = {
  nombre: '', tipo: 'propio', porcentaje: 100,
  ingresoBase: 0, moneda: 'USD', notas: '', activo: true
};

export default function Negocios({ negocios, onNegociosChange }) {
  const [expandido, setExpandido]           = useState(null);
  const [editando, setEditando]             = useState(null);
  const [editTemp, setEditTemp]             = useState({});
  const [mostrarNuevo, setMostrarNuevo]     = useState(false);
  const [nuevo, setNuevo]                   = useState(NEGOCIO_VACIO);

  const fmtMoneda = (monto, moneda) =>
    `${moneda} ${Number(monto).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Comisión efectiva = ingresoBase * porcentaje/100
  const calcComision = (n) => (Number(n.ingresoBase) * Number(n.porcentaje)) / 100;

  const agregarNegocio = () => {
    if (!nuevo.nombre.trim()) return;
    const id = 'neg_' + Date.now();
    onNegociosChange([...negocios, {
      ...nuevo, id,
      ingresoBase: parseFloat(nuevo.ingresoBase) || 0,
      porcentaje:  parseFloat(nuevo.porcentaje)  || 100,
    }]);
    setNuevo(NEGOCIO_VACIO);
    setMostrarNuevo(false);
  };

  const iniciarEditar = (neg) => {
    setEditando(neg.id);
    setEditTemp({ ...neg });
    setExpandido(neg.id);
  };

  const guardarEdicion = () => {
    const updated = negocios.map(n =>
      n.id === editando
        ? { ...editTemp, ingresoBase: parseFloat(editTemp.ingresoBase) || 0, porcentaje: parseFloat(editTemp.porcentaje) || 0 }
        : n
    );
    onNegociosChange(updated);
    setEditando(null);
  };

  const eliminarNegocio = (id) => {
    onNegociosChange(negocios.filter(n => n.id !== id));
    if (expandido === id) setExpandido(null);
  };

  const toggleActivo = (id) => {
    onNegociosChange(negocios.map(n => n.id === id ? { ...n, activo: !n.activo } : n));
  };

  // Totales por moneda
  const totales = negocios.filter(n => n.activo).reduce((acc, n) => {
    const key = n.moneda;
    acc[key] = (acc[key] || 0) + calcComision(n);
    return acc;
  }, {});

  return (
    <div className="space-y-4 pb-24">

      {/* Resumen */}
      <div className="glass-card rounded-premium p-4 border border-silver/10 shadow-glow-silver">
        <div className="text-[10px] text-silver-dim tracking-widest mb-3 font-display">INGRESOS ESTIMADOS / MES</div>
        <div className="space-y-2">
          {Object.keys(totales).length === 0 ? (
            <div className="text-silver-dim text-sm">Sin negocios activos</div>
          ) : (
            Object.entries(totales).map(([moneda, total]) => (
              <div key={moneda} className="flex justify-between items-baseline">
                <span className="text-xs text-silver-dim font-mono">{moneda}</span>
                <span className="text-2xl font-bold font-display text-gradient-silver">
                  {total.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            ))
          )}
        </div>
        <div className="text-[10px] text-silver-dim/60 mt-2">
          {negocios.filter(n => n.activo).length} de {negocios.length} activos
        </div>
      </div>

      {/* Lista de negocios */}
      {negocios.map(neg => {
        const comision = calcComision(neg);
        const isExpanded = expandido === neg.id;
        const isEditing  = editando  === neg.id;

        return (
          <div key={neg.id}
            className={`glass-card rounded-premium border transition-premium ${
              neg.activo ? 'border-white/[0.06]' : 'border-white/[0.03] opacity-60'
            }`}
          >
            {/* Cabecera */}
            <div className="flex items-center gap-3 p-3 cursor-pointer"
              onClick={() => setExpandido(isExpanded ? null : neg.id)}>

              {/* Toggle activo */}
              <button
                onClick={e => { e.stopPropagation(); toggleActivo(neg.id); }}
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-premium ${
                  neg.activo
                    ? 'border-silver/60 bg-silver/10 text-silver'
                    : 'border-silver-dim/30 bg-transparent text-silver-dim'
                }`}
              >
                <BriefcaseIcon className="w-4 h-4" />
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-silver truncate">{neg.nombre}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] text-silver-dim flex-shrink-0">
                    {TIPOS.find(t => t.value === neg.tipo)?.label || neg.tipo}
                  </span>
                </div>
                <div className="text-[10px] text-silver-dim mt-0.5">
                  {neg.porcentaje}% de {fmtMoneda(neg.ingresoBase, neg.moneda)} = <span className="text-silver font-semibold">{fmtMoneda(comision, neg.moneda)}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={e => { e.stopPropagation(); iniciarEditar(neg); }} className="text-silver-dim hover:text-silver p-1">
                  <PencilIcon className="w-3.5 h-3.5" />
                </button>
                <button onClick={e => { e.stopPropagation(); eliminarNegocio(neg.id); }} className="text-silver-dim hover:text-silver p-1">
                  <TrashIcon className="w-3.5 h-3.5" />
                </button>
                {isExpanded
                  ? <ChevronUpIcon className="w-4 h-4 text-silver-dim" />
                  : <ChevronDownIcon className="w-4 h-4 text-silver-dim" />
                }
              </div>
            </div>

            {/* Panel expandido */}
            {isExpanded && (
              <div className="border-t border-white/[0.04] p-3">
                {isEditing ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input placeholder="Nombre del negocio" value={editTemp.nombre}
                        onChange={e => setEditTemp(p => ({...p, nombre: e.target.value}))}
                        className="input-premium col-span-2 text-sm" />
                      <select value={editTemp.tipo}
                        onChange={e => setEditTemp(p => ({...p, tipo: e.target.value}))}
                        className="input-premium text-sm">
                        {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                      <select value={editTemp.moneda}
                        onChange={e => setEditTemp(p => ({...p, moneda: e.target.value}))}
                        className="input-premium text-sm">
                        {MONEDAS.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                      <div className="relative">
                        <input placeholder="Ingreso base" type="number" value={editTemp.ingresoBase}
                          onChange={e => setEditTemp(p => ({...p, ingresoBase: e.target.value}))}
                          className="input-premium text-sm w-full" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-silver-dim text-[10px]">{editTemp.moneda}</span>
                      </div>
                      <div className="relative">
                        <input placeholder="Mi %" type="number" min="0" max="100" value={editTemp.porcentaje}
                          onChange={e => setEditTemp(p => ({...p, porcentaje: e.target.value}))}
                          className="input-premium text-sm w-full pr-7" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-silver-dim text-xs">%</span>
                      </div>
                      <textarea placeholder="Notas..." value={editTemp.notas}
                        onChange={e => setEditTemp(p => ({...p, notas: e.target.value}))}
                        rows={2}
                        className="input-premium text-sm col-span-2 resize-none" />
                    </div>
                    {/* Preview de comisión */}
                    <div className="bg-white/[0.03] rounded-button px-3 py-2 text-xs text-silver-dim">
                      Comisión estimada: <span className="text-silver font-bold">
                        {fmtMoneda((parseFloat(editTemp.ingresoBase)||0) * (parseFloat(editTemp.porcentaje)||0) / 100, editTemp.moneda)}
                      </span> / mes
                    </div>
                    <div className="flex gap-2">
                      <button onClick={guardarEdicion} className="btn-premium flex-1 py-2 text-xs tracking-widest">GUARDAR</button>
                      <button onClick={() => setEditando(null)}
                        className="flex-1 py-2 text-xs border border-white/10 rounded-button text-silver-dim hover:border-silver/30 transition-premium">
                        CANCELAR
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 text-xs">
                    {neg.notas && (
                      <div className="text-silver-dim bg-white/[0.03] rounded-button px-3 py-2">
                        {neg.notas}
                      </div>
                    )}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-white/[0.03] rounded-button px-2 py-1.5 text-center">
                        <div className="text-[10px] text-silver-dim mb-0.5">BASE</div>
                        <div className="font-mono font-bold text-silver">{fmtMoneda(neg.ingresoBase, neg.moneda)}</div>
                      </div>
                      <div className="bg-white/[0.03] rounded-button px-2 py-1.5 text-center">
                        <div className="text-[10px] text-silver-dim mb-0.5">MI %</div>
                        <div className="font-mono font-bold text-silver">{neg.porcentaje}%</div>
                      </div>
                      <div className="bg-white/[0.03] rounded-button px-2 py-1.5 text-center">
                        <div className="text-[10px] text-silver-dim mb-0.5">NETO</div>
                        <div className="font-mono font-bold text-silver-bright">{fmtMoneda(comision, neg.moneda)}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Formulario nuevo negocio */}
      {mostrarNuevo ? (
        <div className="glass-card rounded-premium p-4 border border-silver/20 space-y-3">
          <div className="text-[10px] text-silver-dim tracking-widest font-display">NUEVO NEGOCIO / FUENTE</div>
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Nombre (ej: SwissJust)" value={nuevo.nombre}
              onChange={e => setNuevo(p => ({...p, nombre: e.target.value}))}
              className="input-premium col-span-2 text-sm" />
            <select value={nuevo.tipo} onChange={e => setNuevo(p => ({...p, tipo: e.target.value}))}
              className="input-premium text-sm">
              {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <select value={nuevo.moneda} onChange={e => setNuevo(p => ({...p, moneda: e.target.value}))}
              className="input-premium text-sm">
              {MONEDAS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <div className="relative">
              <input placeholder="Ingreso total del negocio" type="number" value={nuevo.ingresoBase}
                onChange={e => setNuevo(p => ({...p, ingresoBase: e.target.value}))}
                className="input-premium text-sm w-full" />
            </div>
            <div className="relative">
              <input placeholder="Mi % sobre ese ingreso" type="number" min="0" max="100" value={nuevo.porcentaje}
                onChange={e => setNuevo(p => ({...p, porcentaje: e.target.value}))}
                className="input-premium text-sm w-full pr-7" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-silver-dim text-xs">%</span>
            </div>
            <textarea placeholder="Notas..." value={nuevo.notas}
              onChange={e => setNuevo(p => ({...p, notas: e.target.value}))}
              rows={2}
              className="input-premium text-sm col-span-2 resize-none" />
          </div>
          {(parseFloat(nuevo.ingresoBase) > 0) && (
            <div className="bg-white/[0.03] rounded-button px-3 py-2 text-xs text-silver-dim">
              Mi ingreso estimado: <span className="text-silver font-bold">
                {nuevo.moneda} {((parseFloat(nuevo.ingresoBase)||0) * (parseFloat(nuevo.porcentaje)||0) / 100).toLocaleString('es-AR', {minimumFractionDigits:2})}
              </span> / mes
            </div>
          )}
          <div className="flex gap-2">
            <button onClick={agregarNegocio} className="btn-premium flex-1 py-2 text-xs tracking-widest">AGREGAR</button>
            <button onClick={() => { setMostrarNuevo(false); setNuevo(NEGOCIO_VACIO); }}
              className="flex-1 py-2 text-xs border border-white/10 rounded-button text-silver-dim hover:border-silver/30 transition-premium">
              CANCELAR
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setMostrarNuevo(true)}
          className="w-full flex items-center justify-center gap-2 py-3 text-xs text-silver-dim border border-dashed border-white/10 rounded-button hover:border-silver/30 hover:text-silver transition-premium tracking-widest">
          <PlusIcon className="w-4 h-4" /> AGREGAR NEGOCIO / FUENTE DE INGRESO
        </button>
      )}
    </div>
  );
}
