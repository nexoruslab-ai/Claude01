import React, { useState, useRef } from 'react';
import {
  Cog6ToothIcon, PlusIcon, XMarkIcon, CheckIcon,
  BanknotesIcon, TagIcon, BuildingOffice2Icon,
  ArrowPathIcon, CurrencyDollarIcon, ChevronUpDownIcon,
  SparklesIcon, GlobeAltIcon,
} from '@heroicons/react/24/outline';

/* ── Lista editable reutilizable ─────────────────────────────────────────── */
function ListEditor({ title, items, onAdd, onRemove, placeholder, icon: Icon }) {
  const [draft, setDraft] = useState('');
  const inputRef = useRef(null);

  const handleAdd = () => {
    const val = draft.trim();
    if (!val || items.includes(val)) return;
    onAdd(val);
    setDraft('');
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        {Icon && <Icon className="w-4 h-4 text-silver-dim" />}
        <span className="text-[10px] text-silver-dim tracking-widest font-semibold uppercase">{title}</span>
        <span className="ml-auto text-[9px] text-silver-dim/50 bg-white/5 px-2 py-0.5 rounded-full">{items.length}</span>
      </div>

      {/* Items existentes */}
      <div className="flex flex-wrap gap-2">
        {items.map(item => (
          <div key={item}
            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-xs text-silver hover:border-silver/30 hover:bg-white/[0.07] transition-premium">
            <span>{item}</span>
            <button onClick={() => onRemove(item)}
              className="opacity-0 group-hover:opacity-100 transition-opacity w-3.5 h-3.5 rounded-full flex items-center justify-center hover:bg-white/20">
              <XMarkIcon className="w-2.5 h-2.5 text-silver-dim" />
            </button>
          </div>
        ))}
      </div>

      {/* Agregar nuevo */}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder={placeholder}
          className="input-premium flex-1 text-sm py-2"
        />
        <button onClick={handleAdd}
          disabled={!draft.trim()}
          className="btn-premium px-3 py-2 text-xs disabled:opacity-30 flex items-center gap-1">
          <PlusIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* ── Toggle de moneda activa ─────────────────────────────────────────────── */
function CurrencyToggle({ moneda, activa, onToggle, children }) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-3 w-full p-3 rounded-xl border transition-premium text-left ${
        activa
          ? 'border-silver/40 bg-silver/10 shadow-glow-silver'
          : 'border-white/[0.06] bg-white/[0.02] hover:border-white/20'
      }`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-mono font-bold text-xs ${
        activa ? 'bg-gradient-silver text-dark-bg' : 'bg-white/10 text-silver-dim'
      }`}>
        {moneda.simbolo}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-silver truncate">{moneda.nombre}</div>
        <div className="text-[10px] text-silver-dim font-mono">{moneda.code}</div>
      </div>
      <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-premium ${
        activa ? 'bg-gradient-silver border-silver' : 'border-white/20'
      }`}>
        {activa && <CheckIcon className="w-3 h-3 text-dark-bg" />}
      </div>
    </button>
  );
}

/* ── Configuracion principal ─────────────────────────────────────────────── */
const Configuracion = ({ config, onConfigChange, displayCurrency, onDisplayCurrencyChange, language, onLanguageChange }) => {
  const [tab, setTab] = useState('general');
  const [local, setLocal] = useState({ ...config });
  const [saved, setSaved] = useState(false);

  const update = (key, val) => setLocal(prev => ({ ...prev, [key]: val }));

  const updateTasa = (key, val) => {
    const n = parseFloat(val);
    if (!isNaN(n) && n > 0) {
      setLocal(prev => ({ ...prev, tasas: { ...prev.tasas, [key]: n } }));
    }
  };

  const addToList = (key, val) => update(key, [...(local[key] || []), val]);
  const removeFromList = (key, val) => update(key, (local[key] || []).filter(x => x !== val));

  const toggleMoneda = (code) => {
    const activas = local.monedasActivas || [];
    if (activas.includes(code)) {
      if (activas.length <= 1) return; // al menos 1 activa
      update('monedasActivas', activas.filter(c => c !== code));
    } else {
      update('monedasActivas', [...activas, code]);
    }
  };

  const handleSave = () => {
    onConfigChange(local);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const TABS = [
    { id: 'general',  label: 'GENERAL',   Icon: Cog6ToothIcon },
    { id: 'listas',   label: 'LISTAS',    Icon: TagIcon },
    { id: 'monedas',  label: 'MONEDAS',   Icon: CurrencyDollarIcon },
  ];

  return (
    <div className="min-h-screen bg-dark-bg pb-24 animate-fadeIn">

      {/* ── Hero Header ── */}
      <div className="glass-card border-b border-white/[0.06] px-5 pt-6 pb-0 mb-0">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-silver flex items-center justify-center shadow-glow-silver flex-shrink-0">
            <Cog6ToothIcon className="w-5 h-5 text-dark-bg" />
          </div>
          <div>
            <h1 className="font-display text-lg font-semibold text-silver tracking-widest">CONFIGURACIÓN</h1>
            <p className="text-dark-textSecondary text-[10px] tracking-wider">Personaliza DENARIUM para tu flujo</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-white/[0.06]">
          {TABS.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-[10px] font-semibold tracking-widest border-b-2 transition-premium ${
                tab === id
                  ? 'border-silver text-silver'
                  : 'border-transparent text-silver-dim hover:text-silver-dark'
              }`}>
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Contenido ── */}
      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">

        {/* ══ GENERAL ══════════════════════════════════════════════════════════ */}
        {tab === 'general' && (
          <>
            {/* % Ahorro Sagrado */}
            <div className="glass-card rounded-premium p-5 border border-silver/10">
              <div className="flex items-center gap-2 mb-4">
                <SparklesIcon className="w-4 h-4 text-silver" />
                <span className="text-[10px] text-silver tracking-widest font-semibold uppercase">Ahorro Sagrado</span>
              </div>
              <p className="text-dark-textSecondary text-xs mb-4 leading-relaxed">
                Porcentaje que se aparta automáticamente de cada ingreso. El resto fluye en cascada por prioridades.
              </p>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <input
                    type="number" min="0" max="100"
                    value={local.porcentajeAhorro}
                    onChange={e => update('porcentajeAhorro', Math.min(100, Math.max(0, Number(e.target.value))))}
                    className="input-premium w-full text-2xl font-display font-bold text-center pr-10"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-silver-dim text-xl font-bold">%</span>
                </div>
                {/* Presets rápidos */}
                <div className="flex flex-col gap-1.5">
                  {[20, 30, 40, 50].map(p => (
                    <button key={p} onClick={() => update('porcentajeAhorro', p)}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-premium border ${
                        local.porcentajeAhorro === p
                          ? 'bg-gradient-silver text-dark-bg border-silver/50'
                          : 'border-white/10 text-silver-dim hover:border-silver/30'
                      }`}>
                      {p}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Idioma */}
            <div className="glass-card rounded-premium p-5 border border-white/[0.06]">
              <div className="flex items-center gap-2 mb-4">
                <GlobeAltIcon className="w-4 h-4 text-silver-dim" />
                <span className="text-[10px] text-silver-dim tracking-widest font-semibold uppercase">Idioma de interfaz</span>
              </div>
              <div className="flex gap-3">
                {[['es', 'Español 🇦🇷'], ['en', 'English 🇺🇸']].map(([code, label]) => (
                  <button key={code} onClick={() => onLanguageChange(code)}
                    className={`flex-1 py-3 rounded-xl border text-xs font-semibold tracking-wider transition-premium ${
                      language === code
                        ? 'border-silver/40 bg-silver/10 text-silver shadow-glow-silver'
                        : 'border-white/[0.06] text-silver-dim hover:border-white/20'
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Moneda de visualización */}
            <div className="glass-card rounded-premium p-5 border border-white/[0.06]">
              <div className="flex items-center gap-2 mb-4">
                <BanknotesIcon className="w-4 h-4 text-silver-dim" />
                <span className="text-[10px] text-silver-dim tracking-widest font-semibold uppercase">Moneda de visualización</span>
              </div>
              <div className="flex gap-3">
                {(local.monedasActivas || ['USD', 'ARS']).map(code => (
                  <button key={code} onClick={() => onDisplayCurrencyChange(code)}
                    className={`flex-1 py-3 rounded-xl border text-sm font-mono font-bold tracking-wider transition-premium ${
                      displayCurrency === code
                        ? 'border-silver/40 bg-silver/10 text-silver shadow-glow-silver'
                        : 'border-white/[0.06] text-silver-dim hover:border-white/20'
                    }`}>
                    {code}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ══ LISTAS ═══════════════════════════════════════════════════════════ */}
        {tab === 'listas' && (
          <>
            <div className="glass-card rounded-premium p-5 border border-white/[0.06] space-y-6">
              <ListEditor
                title="Fuentes de Ingreso"
                items={local.empresas || []}
                onAdd={v => addToList('empresas', v)}
                onRemove={v => removeFromList('empresas', v)}
                placeholder="Nueva fuente..."
                icon={BuildingOffice2Icon}
              />
            </div>

            <div className="glass-card rounded-premium p-5 border border-white/[0.06]">
              <ListEditor
                title="Métodos de Cobro / Pago"
                items={local.metodosCobro || []}
                onAdd={v => addToList('metodosCobro', v)}
                onRemove={v => removeFromList('metodosCobro', v)}
                placeholder="Nuevo método..."
                icon={BanknotesIcon}
              />
            </div>

            <div className="glass-card rounded-premium p-5 border border-white/[0.06]">
              <ListEditor
                title="Tipos de Pago"
                items={local.tiposPago || []}
                onAdd={v => addToList('tiposPago', v)}
                onRemove={v => removeFromList('tiposPago', v)}
                placeholder="Nuevo tipo..."
                icon={TagIcon}
              />
            </div>

            <div className="glass-card rounded-premium p-5 border border-white/[0.06]">
              <ListEditor
                title="Categorías de Gastos"
                items={local.categoriasGastos || []}
                onAdd={v => addToList('categoriasGastos', v)}
                onRemove={v => removeFromList('categoriasGastos', v)}
                placeholder="Nueva categoría..."
                icon={TagIcon}
              />
            </div>
          </>
        )}

        {/* ══ MONEDAS ══════════════════════════════════════════════════════════ */}
        {tab === 'monedas' && (
          <>
            {/* Tasas principales */}
            <div className="glass-card rounded-premium p-5 border border-silver/10">
              <div className="flex items-center gap-2 mb-4">
                <ArrowPathIcon className="w-4 h-4 text-silver" />
                <span className="text-[10px] text-silver tracking-widest font-semibold uppercase">Tasas de Conversión</span>
                <span className="text-[9px] text-silver-dim ml-auto">Base: USD = 1</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-silver-dim font-mono w-20 flex-shrink-0">USD → ARS</span>
                  <div className="flex-1 relative">
                    <input
                      type="number" step="0.01" min="1"
                      defaultValue={local.tasas?.usdToArs || 1453.73}
                      onBlur={e => updateTasa('usdToArs', e.target.value)}
                      className="input-premium w-full text-sm font-mono"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-silver-dim font-mono w-20 flex-shrink-0">USDT → USD</span>
                  <div className="flex-1 relative">
                    <input
                      type="number" step="0.0001" min="0.1" max="2"
                      defaultValue={local.tasas?.usdtToUsd || 0.999}
                      onBlur={e => updateTasa('usdtToUsd', e.target.value)}
                      className="input-premium w-full text-sm font-mono"
                    />
                  </div>
                </div>

                {/* Otras tasas para monedas activas */}
                {(local.monedasActivas || [])
                  .filter(c => !['USD', 'ARS', 'USDT'].includes(c))
                  .map(code => {
                    const m = (local.monedasDisponibles || []).find(x => x.code === code);
                    if (!m) return null;
                    return (
                      <div key={code} className="flex items-center gap-3">
                        <span className="text-xs text-silver-dim font-mono w-20 flex-shrink-0">{code}</span>
                        <div className="flex-1">
                          <input
                            type="number" step="0.000001" min="0.000001"
                            defaultValue={m.tasaVsUSD || 1}
                            onBlur={e => {
                              const n = parseFloat(e.target.value);
                              if (!isNaN(n) && n > 0) {
                                setLocal(prev => ({
                                  ...prev,
                                  monedasDisponibles: prev.monedasDisponibles.map(x =>
                                    x.code === code ? { ...x, tasaVsUSD: n } : x
                                  )
                                }));
                              }
                            }}
                            className="input-premium w-full text-sm font-mono"
                          />
                        </div>
                        <span className="text-[10px] text-silver-dim/50 w-16 text-right">vs USD</span>
                      </div>
                    );
                  })
                }
              </div>
            </div>

            {/* Toggle monedas activas */}
            <div className="glass-card rounded-premium p-5 border border-white/[0.06]">
              <div className="flex items-center gap-2 mb-4">
                <ChevronUpDownIcon className="w-4 h-4 text-silver-dim" />
                <span className="text-[10px] text-silver-dim tracking-widest font-semibold uppercase">Monedas Activas</span>
              </div>
              <p className="text-dark-textSecondary text-[10px] mb-4">Activa las monedas que usas. Solo aparecerán en formularios y selectors.</p>
              <div className="space-y-2">
                {(local.monedasDisponibles || []).map(moneda => (
                  <CurrencyToggle
                    key={moneda.code}
                    moneda={moneda}
                    activa={(local.monedasActivas || []).includes(moneda.code)}
                    onToggle={() => toggleMoneda(moneda.code)}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── Botón Guardar flotante ── */}
        <div className="fixed bottom-20 left-0 right-0 px-4 pointer-events-none">
          <div className="max-w-lg mx-auto pointer-events-auto">
            <button onClick={handleSave}
              className={`w-full py-4 rounded-premium font-display font-semibold text-sm tracking-widest transition-premium shadow-elevation-3 flex items-center justify-center gap-2 ${
                saved
                  ? 'bg-gradient-to-r from-green-800/80 to-green-700/80 border border-green-500/30 text-green-300'
                  : 'btn-premium shadow-glow-silver'
              }`}>
              {saved ? (
                <>
                  <CheckIcon className="w-5 h-5" />
                  GUARDADO
                </>
              ) : (
                <>
                  <Cog6ToothIcon className="w-4 h-4" />
                  GUARDAR CAMBIOS
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Configuracion;
