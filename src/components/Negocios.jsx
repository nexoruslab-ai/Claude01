import React, { useState, useEffect } from 'react';
import {
  PencilIcon, TrashIcon, PlusIcon, CheckIcon, XMarkIcon,
  BriefcaseIcon, ChevronDownIcon, ChevronUpIcon,
  CurrencyDollarIcon, ClockIcon, CheckCircleIcon,
} from '@heroicons/react/24/outline';

const TIPOS = [
  { value: 'propio',   label: 'Negocio propio'      },
  { value: 'comision', label: 'Comisión / Afiliado'  },
  { value: 'servicio', label: 'Servicios / Freelance'},
  { value: 'otro',     label: 'Otro'                 },
];

const MONEDAS   = ['USD', 'ARS', 'USDT'];
const ESTADOS   = [
  { value: 'pendiente', label: 'Pendiente',  cls: 'text-yellow-400 bg-yellow-400/10'  },
  { value: 'cobrado',   label: 'Cobrado',    cls: 'text-emerald-400 bg-emerald-400/10'},
  { value: 'cancelado', label: 'Cancelado',  cls: 'text-red-400 bg-red-400/10'        },
];

const NEGOCIO_VACIO = {
  nombre: '', tipo: 'propio', moneda: 'USD',
  porcentaje: 100, notas: '', activo: true,
  pagos: [],
};

const PAGO_VACIO = {
  concepto: '', fechaPago: '', moneda: 'USD',
  facturacion: '', ganancia: '', porcentajePago: '',
  estado: 'pendiente', notas: '',
};

const fmt2 = (n) =>
  Number(n || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtFecha = (f) => {
  if (!f) return '';
  const [y, m, d] = f.split('-');
  return `${d}/${m}/${y}`;
};

const hoy = () => new Date().toISOString().split('T')[0];

// ── Cálculos por pago ──────────────────────────────────────────────────────
const calcGananciaPago = (pago, porcentajeNegocio) => {
  // Si el pago tiene ganancia manual, usarla
  if (pago.ganancia !== '' && pago.ganancia !== undefined) return Number(pago.ganancia) || 0;
  // Si tiene facturación, calcular
  const fact = Number(pago.facturacion) || 0;
  const pct  = Number(pago.porcentajePago ?? porcentajeNegocio ?? 100);
  return fact * pct / 100;
};

export default function Negocios({ negocios, onNegociosChange, addNewSignal = 0 }) {
  // Abrir formulario "nuevo negocio" cuando el FAB lo señala
  useEffect(() => {
    if (addNewSignal > 0) { setMostrarNuevo(true); window.scrollTo({ top: 99999, behavior: 'smooth' }); }
  }, [addNewSignal]);

  const [expandido,    setExpandido]    = useState(null);
  const [editando,     setEditando]     = useState(null);   // id negocio
  const [editTemp,     setEditTemp]     = useState({});
  const [mostrarNuevo, setMostrarNuevo] = useState(false);
  const [nuevo,        setNuevo]        = useState(NEGOCIO_VACIO);

  // Para añadir pago a un negocio
  const [pagandoEn,    setPagandoEn]    = useState(null);   // id negocio
  const [nuevoPago,    setNuevoPago]    = useState(PAGO_VACIO);
  const [editPagoKey,  setEditPagoKey]  = useState(null);   // `${negId}_${pagoIdx}`
  const [editPagoTemp, setEditPagoTemp] = useState({});

  // ── CRUD negocios ──────────────────────────────────────────────────────────
  const agregarNegocio = () => {
    if (!nuevo.nombre.trim()) return;
    onNegociosChange([...negocios, {
      ...nuevo,
      id:         'neg_' + Date.now(),
      porcentaje: parseFloat(nuevo.porcentaje) || 100,
      pagos:      [],
    }]);
    setNuevo(NEGOCIO_VACIO);
    setMostrarNuevo(false);
  };

  const iniciarEditar = (neg) => {
    setEditando(neg.id);
    setEditTemp({ ...neg });
    setExpandido(neg.id);
    setPagandoEn(null);
  };

  const guardarEdicion = () => {
    onNegociosChange(negocios.map(n =>
      n.id === editando
        ? { ...editTemp, porcentaje: parseFloat(editTemp.porcentaje) || 100 }
        : n
    ));
    setEditando(null);
  };

  const eliminarNegocio = (id) => {
    onNegociosChange(negocios.filter(n => n.id !== id));
    if (expandido === id) setExpandido(null);
  };

  const toggleActivo = (id) =>
    onNegociosChange(negocios.map(n => n.id === id ? { ...n, activo: !n.activo } : n));

  // ── CRUD pagos ─────────────────────────────────────────────────────────────
  const agregarPago = (negId) => {
    if (!nuevoPago.concepto.trim() && !nuevoPago.facturacion) return;
    const ganancia = calcGananciaPago(nuevoPago, negocios.find(n => n.id === negId)?.porcentaje);
    const pago = {
      ...nuevoPago,
      id:          'pago_' + Date.now(),
      fechaPago:   nuevoPago.fechaPago || hoy(),
      facturacion: parseFloat(nuevoPago.facturacion) || 0,
      ganancia:    parseFloat(nuevoPago.ganancia) !== '' ? parseFloat(nuevoPago.ganancia) : ganancia,
    };
    onNegociosChange(negocios.map(n =>
      n.id === negId ? { ...n, pagos: [...(n.pagos || []), pago] } : n
    ));
    setNuevoPago(PAGO_VACIO);
    setPagandoEn(null);
  };

  const eliminarPago = (negId, pagoId) =>
    onNegociosChange(negocios.map(n =>
      n.id === negId ? { ...n, pagos: (n.pagos || []).filter(p => p.id !== pagoId) } : n
    ));

  const cambiarEstadoPago = (negId, pagoId, estado) =>
    onNegociosChange(negocios.map(n =>
      n.id === negId
        ? { ...n, pagos: (n.pagos || []).map(p => p.id === pagoId ? { ...p, estado } : p) }
        : n
    ));

  const guardarEditPago = (negId) => {
    onNegociosChange(negocios.map(n =>
      n.id === negId
        ? {
            ...n,
            pagos: (n.pagos || []).map(p =>
              p.id === editPagoTemp.id
                ? {
                    ...editPagoTemp,
                    facturacion: parseFloat(editPagoTemp.facturacion) || 0,
                    ganancia:    parseFloat(editPagoTemp.ganancia)    || 0,
                  }
                : p
            )
          }
        : n
    ));
    setEditPagoKey(null);
  };

  // ── Resumen por negocio ────────────────────────────────────────────────────
  const resumenNegocio = (neg) => {
    const pagos = neg.pagos || [];
    const cobrados  = pagos.filter(p => p.estado === 'cobrado');
    const pendientes = pagos.filter(p => p.estado === 'pendiente');
    // Agrupar por moneda
    const totalCobrado = cobrados.reduce((acc, p) => {
      const m = p.moneda || neg.moneda || 'USD';
      acc[m] = (acc[m] || 0) + calcGananciaPago(p, neg.porcentaje);
      return acc;
    }, {});
    const totalPendiente = pendientes.reduce((acc, p) => {
      const m = p.moneda || neg.moneda || 'USD';
      acc[m] = (acc[m] || 0) + calcGananciaPago(p, neg.porcentaje);
      return acc;
    }, {});
    return { totalCobrado, totalPendiente, cobrados, pendientes, pagos };
  };

  // Totales globales por moneda (todos los negocios activos, solo cobrado)
  const totalesGlobales = negocios.filter(n => n.activo !== false).reduce((acc, neg) => {
    const { totalCobrado } = resumenNegocio(neg);
    Object.entries(totalCobrado).forEach(([m, v]) => { acc[m] = (acc[m] || 0) + v; });
    return acc;
  }, {});

  const totalesPendientes = negocios.filter(n => n.activo !== false).reduce((acc, neg) => {
    const { totalPendiente } = resumenNegocio(neg);
    Object.entries(totalPendiente).forEach(([m, v]) => { acc[m] = (acc[m] || 0) + v; });
    return acc;
  }, {});

  return (
    <div className="space-y-4 pb-24">

      {/* ── Resumen global ── */}
      <div className="glass-card rounded-premium p-4 border border-silver/10 shadow-glow-silver">
        <div className="grid grid-cols-2 gap-4">
          {/* Cobrado */}
          <div>
            <div className="text-[10px] text-silver-dim tracking-widest mb-2 font-display flex items-center gap-1">
              <CheckCircleIcon className="w-3 h-3 text-emerald-400" />
              COBRADO
            </div>
            {Object.keys(totalesGlobales).length === 0
              ? <div className="text-silver-dim text-sm">—</div>
              : Object.entries(totalesGlobales).map(([m, v]) => (
                  <div key={m} className="flex justify-between items-baseline">
                    <span className="text-[10px] text-silver-dim font-mono">{m}</span>
                    <span className="text-xl font-bold font-display text-silver-bright">{fmt2(v)}</span>
                  </div>
                ))
            }
          </div>
          {/* Pendiente */}
          <div>
            <div className="text-[10px] text-silver-dim tracking-widest mb-2 font-display flex items-center gap-1">
              <ClockIcon className="w-3 h-3 text-yellow-400" />
              PENDIENTE
            </div>
            {Object.keys(totalesPendientes).length === 0
              ? <div className="text-silver-dim text-sm">—</div>
              : Object.entries(totalesPendientes).map(([m, v]) => (
                  <div key={m} className="flex justify-between items-baseline">
                    <span className="text-[10px] text-silver-dim font-mono">{m}</span>
                    <span className="text-xl font-bold font-mono text-yellow-300/80">{fmt2(v)}</span>
                  </div>
                ))
            }
          </div>
        </div>
        <div className="text-[10px] text-silver-dim/60 mt-2">
          {negocios.filter(n => n.activo !== false).length} de {negocios.length} activos
        </div>
      </div>

      {/* ── Lista de negocios ── */}
      {negocios.map(neg => {
        const isExpanded = expandido === neg.id;
        const isEditing  = editando  === neg.id;
        const isAddingPago = pagandoEn === neg.id;
        const { totalCobrado, totalPendiente, pagos } = resumenNegocio(neg);

        return (
          <div key={neg.id}
            className={`glass-card rounded-premium border transition-premium ${
              neg.activo !== false ? 'border-white/[0.06]' : 'border-white/[0.03] opacity-60'
            }`}
          >
            {/* Cabecera */}
            <div className="flex items-center gap-3 p-3 cursor-pointer"
              onClick={() => setExpandido(isExpanded ? null : neg.id)}>

              <button
                onClick={e => { e.stopPropagation(); toggleActivo(neg.id); }}
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-premium ${
                  neg.activo !== false
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
                {/* Resumen rápido */}
                <div className="flex gap-3 mt-0.5">
                  {Object.entries(totalCobrado).map(([m, v]) => (
                    <span key={m} className="text-[10px] text-emerald-400/80 font-mono">✓ {m} {fmt2(v)}</span>
                  ))}
                  {Object.entries(totalPendiente).map(([m, v]) => (
                    <span key={m} className="text-[10px] text-yellow-400/70 font-mono">⏳ {m} {fmt2(v)}</span>
                  ))}
                  {pagos.length === 0 && (
                    <span className="text-[10px] text-silver-dim">Sin pagos registrados</span>
                  )}
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
              <div className="border-t border-white/[0.04]">

                {/* ── Modo edición del negocio ── */}
                {isEditing ? (
                  <div className="p-3 space-y-2">
                    <div className="text-[10px] text-silver-dim tracking-widest mb-1">EDITAR NEGOCIO</div>
                    <div className="grid grid-cols-2 gap-2">
                      <input placeholder="Nombre" value={editTemp.nombre}
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
                        <input placeholder="Mi % por defecto" type="number" min="0" max="100"
                          value={editTemp.porcentaje}
                          onChange={e => setEditTemp(p => ({...p, porcentaje: e.target.value}))}
                          className="input-premium text-sm w-full pr-7" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-silver-dim text-xs">%</span>
                      </div>
                      <textarea placeholder="Notas..." value={editTemp.notas}
                        onChange={e => setEditTemp(p => ({...p, notas: e.target.value}))}
                        rows={2}
                        className="input-premium text-sm col-span-2 resize-none" />
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
                  <div>
                    {/* ── Resumen del negocio ── */}
                    <div className="px-3 py-2 grid grid-cols-3 gap-2">
                      <div className="bg-white/[0.03] rounded-button px-2 py-1.5 text-center">
                        <div className="text-[9px] text-silver-dim mb-0.5">TIPO</div>
                        <div className="text-[10px] font-semibold text-silver truncate">
                          {TIPOS.find(t => t.value === neg.tipo)?.label}
                        </div>
                      </div>
                      <div className="bg-white/[0.03] rounded-button px-2 py-1.5 text-center">
                        <div className="text-[9px] text-silver-dim mb-0.5">MI %</div>
                        <div className="text-sm font-bold font-mono text-silver">{neg.porcentaje}%</div>
                      </div>
                      <div className="bg-white/[0.03] rounded-button px-2 py-1.5 text-center">
                        <div className="text-[9px] text-silver-dim mb-0.5">PAGOS</div>
                        <div className="text-sm font-bold font-mono text-silver">{pagos.length}</div>
                      </div>
                    </div>

                    {neg.notas && (
                      <div className="mx-3 mb-2 text-[11px] text-silver-dim bg-white/[0.03] rounded-button px-3 py-2">
                        {neg.notas}
                      </div>
                    )}

                    {/* ── Lista de pagos ── */}
                    {pagos.length > 0 && (
                      <div className="border-t border-white/[0.04]">
                        <div className="px-3 py-2 text-[9px] text-silver-dim tracking-widest flex items-center justify-between">
                          <span>HISTORIAL DE PAGOS</span>
                          <span className="font-mono">{pagos.length} registro{pagos.length !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="space-y-1 px-3 pb-2">
                          {[...pagos].sort((a,b)=> (b.fechaPago||'').localeCompare(a.fechaPago||'')).map(pago => {
                            const estado = ESTADOS.find(e => e.value === pago.estado) || ESTADOS[0];
                            const ganancia = calcGananciaPago(pago, neg.porcentaje);
                            const isEditingPago = editPagoKey === `${neg.id}_${pago.id}`;

                            if (isEditingPago) {
                              return (
                                <div key={pago.id} className="bg-white/[0.04] rounded-button p-2 space-y-1.5">
                                  <div className="grid grid-cols-2 gap-1.5">
                                    <input placeholder="Concepto" value={editPagoTemp.concepto}
                                      onChange={e => setEditPagoTemp(p => ({...p, concepto: e.target.value}))}
                                      className="input-premium text-xs col-span-2" />
                                    <input placeholder="Facturación" type="number"
                                      value={editPagoTemp.facturacion}
                                      onChange={e => setEditPagoTemp(p => ({...p, facturacion: e.target.value}))}
                                      className="input-premium text-xs" />
                                    <input placeholder="Mi ganancia" type="number"
                                      value={editPagoTemp.ganancia}
                                      onChange={e => setEditPagoTemp(p => ({...p, ganancia: e.target.value}))}
                                      className="input-premium text-xs" />
                                    <input type="date" value={editPagoTemp.fechaPago}
                                      onChange={e => setEditPagoTemp(p => ({...p, fechaPago: e.target.value}))}
                                      className="input-premium text-xs" />
                                    <select value={editPagoTemp.estado}
                                      onChange={e => setEditPagoTemp(p => ({...p, estado: e.target.value}))}
                                      className="input-premium text-xs">
                                      {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                                    </select>
                                  </div>
                                  <div className="flex gap-1.5">
                                    <button onClick={() => guardarEditPago(neg.id)} className="btn-premium flex-1 py-1 text-[10px]">GUARDAR</button>
                                    <button onClick={() => setEditPagoKey(null)}
                                      className="flex-1 py-1 text-[10px] border border-white/10 rounded-button text-silver-dim">CANCELAR</button>
                                  </div>
                                </div>
                              );
                            }

                            return (
                              <div key={pago.id} className="flex items-center gap-2 py-1.5 border-b border-white/[0.03] last:border-0">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${estado.cls}`}>
                                      {estado.label}
                                    </span>
                                    <span className="text-[11px] text-silver truncate">{pago.concepto || 'Sin concepto'}</span>
                                  </div>
                                  <div className="flex gap-3 mt-0.5">
                                    {Number(pago.facturacion) > 0 && (
                                      <span className="text-[10px] text-silver-dim font-mono">
                                        Fact: {pago.moneda || neg.moneda} {fmt2(pago.facturacion)}
                                      </span>
                                    )}
                                    <span className="text-[10px] text-silver font-mono font-semibold">
                                      Gan: {pago.moneda || neg.moneda} {fmt2(ganancia)}
                                    </span>
                                    {pago.fechaPago && (
                                      <span className="text-[10px] text-silver-dim">{fmtFecha(pago.fechaPago)}</span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-0.5 flex-shrink-0">
                                  {/* Ciclo de estado */}
                                  {pago.estado !== 'cobrado' && (
                                    <button
                                      onClick={() => cambiarEstadoPago(neg.id, pago.id, 'cobrado')}
                                      className="text-silver-dim hover:text-emerald-400 p-1" title="Marcar cobrado">
                                      <CheckCircleIcon className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => { setEditPagoKey(`${neg.id}_${pago.id}`); setEditPagoTemp({...pago}); }}
                                    className="text-silver-dim hover:text-silver p-1">
                                    <PencilIcon className="w-3 h-3" />
                                  </button>
                                  <button onClick={() => eliminarPago(neg.id, pago.id)} className="text-silver-dim hover:text-silver p-1">
                                    <TrashIcon className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* ── Formulario nuevo pago ── */}
                    {isAddingPago ? (
                      <div className="border-t border-white/[0.04] p-3 space-y-2">
                        <div className="text-[10px] text-silver-dim tracking-widest">REGISTRAR PAGO / COBRO</div>
                        <div className="grid grid-cols-2 gap-2">
                          <input placeholder="Concepto (ej: Nov 2025)" value={nuevoPago.concepto}
                            onChange={e => setNuevoPago(p => ({...p, concepto: e.target.value}))}
                            className="input-premium col-span-2 text-xs" />

                          <div className="col-span-2 grid grid-cols-3 gap-2">
                            <input placeholder="Facturación total" type="number"
                              value={nuevoPago.facturacion}
                              onChange={e => setNuevoPago(p => ({...p, facturacion: e.target.value}))}
                              className="input-premium text-xs" />
                            <div className="relative">
                              <input placeholder="Mi %" type="number" min="0" max="100"
                                value={nuevoPago.porcentajePago}
                                onChange={e => setNuevoPago(p => ({...p, porcentajePago: e.target.value}))}
                                className="input-premium text-xs w-full pr-6" />
                              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-silver-dim text-[10px]">%</span>
                            </div>
                            <input placeholder="O ganancia directa" type="number"
                              value={nuevoPago.ganancia}
                              onChange={e => setNuevoPago(p => ({...p, ganancia: e.target.value}))}
                              className="input-premium text-xs" />
                          </div>

                          <select value={nuevoPago.moneda}
                            onChange={e => setNuevoPago(p => ({...p, moneda: e.target.value}))}
                            className="input-premium text-xs">
                            {MONEDAS.map(m => <option key={m} value={m}>{m}</option>)}
                          </select>
                          <input type="date" value={nuevoPago.fechaPago}
                            onChange={e => setNuevoPago(p => ({...p, fechaPago: e.target.value}))}
                            className="input-premium text-xs" />

                          <select value={nuevoPago.estado}
                            onChange={e => setNuevoPago(p => ({...p, estado: e.target.value}))}
                            className="input-premium text-xs col-span-2">
                            {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                          </select>
                        </div>

                        {/* Preview ganancia */}
                        {(nuevoPago.facturacion || nuevoPago.ganancia) && (
                          <div className="bg-white/[0.03] rounded-button px-3 py-2 text-[11px] text-silver-dim">
                            Ganancia: <span className="text-silver font-bold">
                              {nuevoPago.moneda || neg.moneda} {fmt2(
                                nuevoPago.ganancia !== ''
                                  ? Number(nuevoPago.ganancia)
                                  : (Number(nuevoPago.facturacion||0) * Number(nuevoPago.porcentajePago||neg.porcentaje||100)) / 100
                              )}
                            </span>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <button onClick={() => agregarPago(neg.id)} className="btn-premium flex-1 py-1.5 text-[10px] tracking-widest">
                            AGREGAR PAGO
                          </button>
                          <button onClick={() => { setPagandoEn(null); setNuevoPago(PAGO_VACIO); }}
                            className="flex-1 py-1.5 text-[10px] border border-white/10 rounded-button text-silver-dim">
                            CANCELAR
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="px-3 pb-3">
                        <button
                          onClick={e => { e.stopPropagation(); setPagandoEn(neg.id); setNuevoPago({ ...PAGO_VACIO, moneda: neg.moneda || 'USD', porcentajePago: neg.porcentaje || 100 }); }}
                          className="w-full flex items-center justify-center gap-1.5 py-2 text-[10px] text-silver-dim border border-dashed border-white/10 rounded-button hover:border-silver/30 hover:text-silver transition-premium tracking-widest">
                          <CurrencyDollarIcon className="w-3.5 h-3.5" /> REGISTRAR PAGO / COBRO
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* ── Formulario nuevo negocio ── */}
      {mostrarNuevo ? (
        <div className="glass-card rounded-premium p-4 border border-silver/20 space-y-3">
          <div className="text-[10px] text-silver-dim tracking-widest font-display">NUEVA FUENTE DE INGRESOS</div>
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Nombre (ej: SwissJust, Cliente Freelance)" value={nuevo.nombre}
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
            <div className="relative col-span-2">
              <input placeholder="Mi % de comisión por defecto" type="number" min="0" max="100"
                value={nuevo.porcentaje}
                onChange={e => setNuevo(p => ({...p, porcentaje: e.target.value}))}
                className="input-premium text-sm w-full pr-7" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-silver-dim text-xs">%</span>
            </div>
            <textarea placeholder="Notas sobre este negocio..." value={nuevo.notas}
              onChange={e => setNuevo(p => ({...p, notas: e.target.value}))}
              rows={2}
              className="input-premium text-sm col-span-2 resize-none" />
          </div>
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
          <PlusIcon className="w-4 h-4" /> AGREGAR FUENTE DE INGRESOS
        </button>
      )}
    </div>
  );
}
