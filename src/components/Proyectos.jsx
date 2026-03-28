import React, { useState } from 'react';
import {
  PlusIcon, TrashIcon, PencilIcon, CheckIcon, XMarkIcon,
  ChevronDownIcon, ChevronUpIcon, ArrowTopRightOnSquareIcon,
  FolderOpenIcon
} from '@heroicons/react/24/outline';

const MONEDAS = ['USD', 'ARS', 'USDT'];

const PROYECTO_VACIO  = { nombre: '', descripcion: '', presupuesto: '', monedaPresupuesto: 'USD' };
const ITEM_VACIO      = { nombre: '', url: '', precio: '', moneda: 'USD', notas: '', comprado: false };

export default function Proyectos({ proyectos, onProyectosChange, tasas = { usdToArs: 1453.73, usdtToUsd: 0.999 } }) {
  const [expandido, setExpandido]         = useState(null);
  const [editandoProyecto, setEditandoP]  = useState(null);
  const [editPTemp, setEditPTemp]         = useState({});
  const [mostrarNuevoP, setMostrarNuevoP] = useState(false);
  const [nuevoP, setNuevoP]               = useState(PROYECTO_VACIO);

  const [mostrarNuevoItem, setMostrarNI]  = useState(null); // proyectoId
  const [nuevoItem, setNuevoItem]         = useState(ITEM_VACIO);
  const [editandoItem, setEditandoItem]   = useState(null); // { proyId, itemId }
  const [editItemTemp, setEditItemTemp]   = useState({});

  // ── Conversión a USD ─────────────────────────────────────────────────────
  const toUSD = (precio, moneda) => {
    if (moneda === 'USD')  return Number(precio);
    if (moneda === 'USDT') return Number(precio) * tasas.usdtToUsd;
    if (moneda === 'ARS')  return Number(precio) / tasas.usdToArs;
    return Number(precio);
  };

  const fmtMonto = (precio, moneda) => {
    const n = Number(precio);
    if (moneda === 'ARS') return `ARS ${n.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    return `${moneda} ${n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // ── Stats de proyecto ──────────────────────────────────────────────────
  const calcStats = (proyecto) => {
    const items = proyecto.items || [];
    const totalItems = items.length;
    const comprados  = items.filter(i => i.comprado).length;
    const gastoUSD   = items.filter(i => i.comprado).reduce((a, i) => a + toUSD(i.precio, i.moneda), 0);
    const totalUSD   = items.reduce((a, i) => a + toUSD(i.precio, i.moneda), 0);
    const presupUSD  = toUSD(proyecto.presupuesto || 0, proyecto.monedaPresupuesto || 'USD');
    const pct = totalItems > 0 ? Math.round((comprados / totalItems) * 100) : 0;
    return { totalItems, comprados, gastoUSD, totalUSD, presupUSD, pct };
  };

  // ── CRUD Proyectos ─────────────────────────────────────────────────────
  const agregarProyecto = () => {
    if (!nuevoP.nombre.trim()) return;
    const id = 'proy_' + Date.now();
    onProyectosChange([...proyectos, { ...nuevoP, id, presupuesto: parseFloat(nuevoP.presupuesto) || 0, items: [] }]);
    setNuevoP(PROYECTO_VACIO);
    setMostrarNuevoP(false);
    setExpandido(id);
  };

  const eliminarProyecto = (id) => {
    onProyectosChange(proyectos.filter(p => p.id !== id));
    if (expandido === id) setExpandido(null);
  };

  const iniciarEditProyecto = (proy) => {
    setEditandoP(proy.id);
    setEditPTemp({ ...proy });
  };

  const guardarProyecto = () => {
    onProyectosChange(proyectos.map(p =>
      p.id === editandoProyecto
        ? { ...editPTemp, presupuesto: parseFloat(editPTemp.presupuesto) || 0 }
        : p
    ));
    setEditandoP(null);
  };

  // ── CRUD Items ─────────────────────────────────────────────────────────
  const agregarItem = (proyId) => {
    if (!nuevoItem.nombre.trim()) return;
    const itemId = 'item_' + Date.now();
    onProyectosChange(proyectos.map(p =>
      p.id === proyId
        ? { ...p, items: [...(p.items || []), { ...nuevoItem, id: itemId, precio: parseFloat(nuevoItem.precio) || 0 }] }
        : p
    ));
    setNuevoItem(ITEM_VACIO);
    setMostrarNI(null);
  };

  const toggleComprado = (proyId, itemId) => {
    onProyectosChange(proyectos.map(p =>
      p.id === proyId
        ? { ...p, items: p.items.map(i => i.id === itemId ? { ...i, comprado: !i.comprado } : i) }
        : p
    ));
  };

  const eliminarItem = (proyId, itemId) => {
    onProyectosChange(proyectos.map(p =>
      p.id === proyId ? { ...p, items: p.items.filter(i => i.id !== itemId) } : p
    ));
  };

  const iniciarEditItem = (proyId, item) => {
    setEditandoItem({ proyId, itemId: item.id });
    setEditItemTemp({ ...item });
  };

  const guardarItem = () => {
    const { proyId, itemId } = editandoItem;
    onProyectosChange(proyectos.map(p =>
      p.id === proyId
        ? { ...p, items: p.items.map(i => i.id === itemId ? { ...editItemTemp, precio: parseFloat(editItemTemp.precio) || 0 } : i) }
        : p
    ));
    setEditandoItem(null);
  };

  // ── Totales globales ───────────────────────────────────────────────────
  const totalGastoUSD = proyectos.reduce((a, p) => {
    const items = p.items || [];
    return a + items.filter(i => i.comprado).reduce((b, i) => b + toUSD(i.precio, i.moneda), 0);
  }, 0);

  return (
    <div className="space-y-4 pb-24">

      {/* Resumen global */}
      <div className="glass-card rounded-premium p-4 border border-silver/10 shadow-glow-silver">
        <div className="text-[10px] text-silver-dim tracking-widest mb-2 font-display">PROYECTOS</div>
        <div className="flex justify-between items-center">
          <div>
            <div className="text-2xl font-bold font-display text-gradient-silver">{proyectos.length}</div>
            <div className="text-[10px] text-silver-dim">proyectos activos</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold font-display text-silver-bright">
              USD {totalGastoUSD.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-silver-dim">invertido en total</div>
          </div>
        </div>
      </div>

      {/* Lista de proyectos */}
      {proyectos.map(proy => {
        const stats = calcStats(proy);
        const isOpen    = expandido === proy.id;
        const isEditing = editandoProyecto === proy.id;
        const items     = proy.items || [];

        return (
          <div key={proy.id} className="glass-card rounded-premium border border-white/[0.06]">

            {/* Cabecera del proyecto */}
            <div className="flex items-center gap-3 p-4 cursor-pointer"
              onClick={() => setExpandido(isOpen ? null : proy.id)}>
              <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                stats.pct === 100 ? 'border-silver-bright bg-silver/20 text-silver-bright' : 'border-silver/30 text-silver-dim'
              }`}>
                <FolderOpenIcon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <div className="space-y-2" onClick={e => e.stopPropagation()}>
                    <input value={editPTemp.nombre}
                      onChange={e => setEditPTemp(p => ({...p, nombre: e.target.value}))}
                      className="input-premium w-full text-sm" />
                    <input value={editPTemp.descripcion} placeholder="Descripción..."
                      onChange={e => setEditPTemp(p => ({...p, descripcion: e.target.value}))}
                      className="input-premium w-full text-sm" />
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input type="number" value={editPTemp.presupuesto} placeholder="Presupuesto"
                          onChange={e => setEditPTemp(p => ({...p, presupuesto: e.target.value}))}
                          className="input-premium w-full text-sm" />
                      </div>
                      <select value={editPTemp.monedaPresupuesto}
                        onChange={e => setEditPTemp(p => ({...p, monedaPresupuesto: e.target.value}))}
                        className="input-premium w-24 text-sm">
                        {MONEDAS.map(m => <option key={m}>{m}</option>)}
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={guardarProyecto} className="btn-premium flex-1 py-1.5 text-xs tracking-widest">GUARDAR</button>
                      <button onClick={() => setEditandoP(null)}
                        className="flex-1 py-1.5 text-xs border border-white/10 rounded-button text-silver-dim">CANCELAR</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="text-sm font-semibold text-silver truncate">{proy.nombre}</div>
                    {proy.descripcion && <div className="text-[10px] text-silver-dim truncate">{proy.descripcion}</div>}
                    <div className="flex items-center gap-2 mt-1">
                      {/* Barra de progreso */}
                      <div className="flex-1 h-1 bg-white/[0.06] rounded-full overflow-hidden max-w-[100px]">
                        <div className="h-full bg-gradient-silver rounded-full transition-all"
                          style={{ width: `${stats.pct}%` }} />
                      </div>
                      <span className="text-[10px] text-silver-dim font-mono">
                        {stats.comprados}/{stats.totalItems} items · USD {stats.gastoUSD.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        {stats.presupUSD > 0 && ` / ${stats.presupUSD.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {!isEditing && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={e => { e.stopPropagation(); iniciarEditProyecto(proy); }} className="text-silver-dim hover:text-silver p-1">
                    <PencilIcon className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={e => { e.stopPropagation(); eliminarProyecto(proy.id); }} className="text-silver-dim hover:text-silver p-1">
                    <TrashIcon className="w-3.5 h-3.5" />
                  </button>
                  {isOpen ? <ChevronUpIcon className="w-4 h-4 text-silver-dim" /> : <ChevronDownIcon className="w-4 h-4 text-silver-dim" />}
                </div>
              )}
            </div>

            {/* Lista de items */}
            {isOpen && !isEditing && (
              <div className="border-t border-white/[0.04]">
                {items.map(item => {
                  const isEditingItem = editandoItem?.proyId === proy.id && editandoItem?.itemId === item.id;

                  return (
                    <div key={item.id}
                      className={`flex items-start gap-3 px-4 py-3 border-b border-white/[0.03] last:border-0 transition-premium ${
                        item.comprado ? 'opacity-60' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleComprado(proy.id, item.id)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-premium ${
                          item.comprado
                            ? 'border-silver-bright bg-silver/20 text-silver-bright'
                            : 'border-silver-dim/40 hover:border-silver/60'
                        }`}
                      >
                        {item.comprado && <CheckIcon className="w-3 h-3" />}
                      </button>

                      {isEditingItem ? (
                        <div className="flex-1 space-y-2">
                          <input placeholder="Nombre del item" value={editItemTemp.nombre}
                            onChange={e => setEditItemTemp(p => ({...p, nombre: e.target.value}))}
                            className="input-premium w-full text-sm" />
                          <input placeholder="URL (tienda, link, etc.)" value={editItemTemp.url}
                            onChange={e => setEditItemTemp(p => ({...p, url: e.target.value}))}
                            className="input-premium w-full text-sm" />
                          <div className="flex gap-2">
                            <input type="number" placeholder="Precio" value={editItemTemp.precio}
                              onChange={e => setEditItemTemp(p => ({...p, precio: e.target.value}))}
                              className="input-premium flex-1 text-sm" />
                            <select value={editItemTemp.moneda}
                              onChange={e => setEditItemTemp(p => ({...p, moneda: e.target.value}))}
                              className="input-premium w-24 text-sm">
                              {MONEDAS.map(m => <option key={m}>{m}</option>)}
                            </select>
                          </div>
                          <input placeholder="Notas (talla, color, etc.)" value={editItemTemp.notas}
                            onChange={e => setEditItemTemp(p => ({...p, notas: e.target.value}))}
                            className="input-premium w-full text-sm" />
                          <div className="flex gap-2">
                            <button onClick={guardarItem} className="btn-premium flex-1 py-1.5 text-xs tracking-widest">GUARDAR</button>
                            <button onClick={() => setEditandoItem(null)}
                              className="flex-1 py-1.5 text-xs border border-white/10 rounded-button text-silver-dim">CANCELAR</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className={`text-sm font-medium text-silver truncate ${item.comprado ? 'line-through text-silver-dim' : ''}`}>
                                {item.nombre}
                              </div>
                              {item.notas && <div className="text-[10px] text-silver-dim mt-0.5">{item.notas}</div>}
                              {item.url && (
                                <a href={item.url} target="_blank" rel="noopener noreferrer"
                                  onClick={e => e.stopPropagation()}
                                  className="text-[10px] text-silver-dim/60 hover:text-silver transition-colors flex items-center gap-1 mt-0.5 truncate max-w-[180px]">
                                  <ArrowTopRightOnSquareIcon className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate">{item.url.replace(/^https?:\/\//, '').split('/')[0]}</span>
                                </a>
                              )}
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <span className={`text-xs font-bold font-mono ${item.comprado ? 'text-silver-dim' : 'text-silver-bright'}`}>
                                {fmtMonto(item.precio, item.moneda)}
                              </span>
                              <button onClick={() => iniciarEditItem(proy.id, item)} className="text-silver-dim hover:text-silver p-0.5">
                                <PencilIcon className="w-3 h-3" />
                              </button>
                              <button onClick={() => eliminarItem(proy.id, item.id)} className="text-silver-dim hover:text-silver p-0.5">
                                <TrashIcon className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          {/* Equivalencia en USD si no es USD */}
                          {item.moneda !== 'USD' && (
                            <div className="text-[10px] text-silver-dim/50 mt-0.5 font-mono">
                              ≈ USD {toUSD(item.precio, item.moneda).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Form nuevo item */}
                {mostrarNuevoItem === proy.id ? (
                  <div className="px-4 py-3 bg-white/[0.02] space-y-2">
                    <input placeholder="¿Qué querés comprar?" value={nuevoItem.nombre}
                      onChange={e => setNuevoItem(p => ({...p, nombre: e.target.value}))}
                      className="input-premium w-full text-sm" />
                    <input placeholder="URL (link de tienda, MercadoLibre, Amazon...)" value={nuevoItem.url}
                      onChange={e => setNuevoItem(p => ({...p, url: e.target.value}))}
                      className="input-premium w-full text-sm" />
                    <div className="flex gap-2">
                      <input type="number" placeholder="Precio" value={nuevoItem.precio}
                        onChange={e => setNuevoItem(p => ({...p, precio: e.target.value}))}
                        className="input-premium flex-1 text-sm" />
                      <select value={nuevoItem.moneda}
                        onChange={e => setNuevoItem(p => ({...p, moneda: e.target.value}))}
                        className="input-premium w-24 text-sm">
                        {MONEDAS.map(m => <option key={m}>{m}</option>)}
                      </select>
                    </div>
                    <input placeholder="Notas (talla, color, specs...)" value={nuevoItem.notas}
                      onChange={e => setNuevoItem(p => ({...p, notas: e.target.value}))}
                      className="input-premium w-full text-sm" />
                    <div className="flex gap-2">
                      <button onClick={() => agregarItem(proy.id)} className="btn-premium flex-1 py-2 text-xs tracking-widest">AGREGAR</button>
                      <button onClick={() => { setMostrarNI(null); setNuevoItem(ITEM_VACIO); }}
                        className="flex-1 py-2 text-xs border border-white/10 rounded-button text-silver-dim hover:border-silver/30 transition-premium">
                        CANCELAR
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => { setMostrarNI(proy.id); setNuevoItem(ITEM_VACIO); }}
                    className="w-full flex items-center justify-center gap-2 py-3 text-xs text-silver-dim hover:text-silver transition-premium tracking-widest border-t border-white/[0.03]">
                    <PlusIcon className="w-3.5 h-3.5" /> AGREGAR ITEM AL PROYECTO
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Nuevo proyecto */}
      {mostrarNuevoP ? (
        <div className="glass-card rounded-premium p-4 border border-silver/20 space-y-3">
          <div className="text-[10px] text-silver-dim tracking-widest font-display">NUEVO PROYECTO</div>
          <input placeholder="Nombre (ej: Gym en Casa)" value={nuevoP.nombre}
            onChange={e => setNuevoP(p => ({...p, nombre: e.target.value}))}
            className="input-premium w-full text-sm" />
          <input placeholder="Descripción..." value={nuevoP.descripcion}
            onChange={e => setNuevoP(p => ({...p, descripcion: e.target.value}))}
            className="input-premium w-full text-sm" />
          <div className="flex gap-2">
            <input type="number" placeholder="Presupuesto total (opcional)" value={nuevoP.presupuesto}
              onChange={e => setNuevoP(p => ({...p, presupuesto: e.target.value}))}
              className="input-premium flex-1 text-sm" />
            <select value={nuevoP.monedaPresupuesto}
              onChange={e => setNuevoP(p => ({...p, monedaPresupuesto: e.target.value}))}
              className="input-premium w-24 text-sm">
              {MONEDAS.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={agregarProyecto} className="btn-premium flex-1 py-2 text-xs tracking-widest">CREAR PROYECTO</button>
            <button onClick={() => { setMostrarNuevoP(false); setNuevoP(PROYECTO_VACIO); }}
              className="flex-1 py-2 text-xs border border-white/10 rounded-button text-silver-dim hover:border-silver/30 transition-premium">
              CANCELAR
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setMostrarNuevoP(true)}
          className="w-full flex items-center justify-center gap-2 py-3 text-xs text-silver-dim border border-dashed border-white/10 rounded-button hover:border-silver/30 hover:text-silver transition-premium tracking-widest">
          <PlusIcon className="w-4 h-4" /> CREAR NUEVO PROYECTO
        </button>
      )}
    </div>
  );
}
