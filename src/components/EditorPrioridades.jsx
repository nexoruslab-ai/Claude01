import React, { useState } from 'react';
import { useTranslation } from '../utils/i18n.js';
import { XMarkIcon, PlusIcon, PencilIcon, TrashIcon, SparklesIcon } from '@heroicons/react/24/outline';
import {
  groupByLevel,
  addCategory,
  updateCategory,
  deleteCategory,
  addPriorityLevel,
  updatePriorityLevel,
  deletePriorityLevel,
  validateNoDuplicates,
  COLOR_PALETTES,
  EMOJI_SUGGESTIONS
} from '../utils/prioritiesManager.js';

const EditorPrioridades = ({ priorities, onSave, onClose, language }) => {
  const { t } = useTranslation(language);
  const [prioridadesLocales, setPrioridadesLocales] = useState(priorities);
  const [modalAbierto, setModalAbierto] = useState(null); // 'categoria', 'prioridad', 'editar-categoria', 'editar-prioridad'
  const [prioridadSeleccionada, setPrioridadSeleccionada] = useState(null);
  const [categoriaEditando, setCategoriaEditando] = useState(null);
  const [mostrarEmojiPicker, setMostrarEmojiPicker] = useState(false);

  // Formulario para nueva categoría
  const [formCategoria, setFormCategoria] = useState({
    nombre: '',
    nombreEn: '',
    meta: 0,
    emoji: ''
  });

  // Formulario para nueva prioridad
  const [formPrioridad, setFormPrioridad] = useState({
    nombre: '',
    color: '#6b7280',
    colorBg: '#f3f4f6',
    emoji: ''
  });

  const nivelesPrioridad = groupByLevel(prioridadesLocales);

  const handleAgregarCategoria = () => {
    if (!formCategoria.nombre.trim()) {
      alert('Por favor ingresa un nombre para la categoría');
      return;
    }

    if (!validateNoDuplicates(prioridadesLocales, formCategoria.nombre, prioridadSeleccionada)) {
      alert('Ya existe una categoría con ese nombre en esta prioridad');
      return;
    }

    try {
      const nuevasPrioridades = addCategory(prioridadesLocales, prioridadSeleccionada, formCategoria);
      setPrioridadesLocales(nuevasPrioridades);
      setModalAbierto(null);
      setFormCategoria({ nombre: '', nombreEn: '', meta: 0, emoji: '' });
    } catch (error) {
      alert(error.message);
    }
  };

  const handleEditarCategoria = () => {
    if (!formCategoria.nombre.trim()) {
      alert('Por favor ingresa un nombre para la categoría');
      return;
    }

    if (!validateNoDuplicates(prioridadesLocales, formCategoria.nombre, prioridadSeleccionada, categoriaEditando.numero)) {
      alert('Ya existe una categoría con ese nombre en esta prioridad');
      return;
    }

    try {
      const nuevasPrioridades = updateCategory(prioridadesLocales, categoriaEditando.numero, {
        categoria: formCategoria.nombre,
        nombreEn: formCategoria.nombreEn || formCategoria.nombre,
        meta: Number(formCategoria.meta),
        emoji: formCategoria.emoji
      });
      setPrioridadesLocales(nuevasPrioridades);
      setModalAbierto(null);
      setCategoriaEditando(null);
      setFormCategoria({ nombre: '', nombreEn: '', meta: 0, emoji: '' });
    } catch (error) {
      alert(error.message);
    }
  };

  const handleEliminarCategoria = (categoria) => {
    if (window.confirm(`¿Eliminar categoría "${categoria.categoria}"?`)) {
      try {
        const nuevasPrioridades = deleteCategory(prioridadesLocales, categoria.numero);
        setPrioridadesLocales(nuevasPrioridades);
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const handleAgregarPrioridad = () => {
    if (!formPrioridad.nombre.trim()) {
      alert('Por favor ingresa un nombre para la prioridad');
      return;
    }

    try {
      const nuevasPrioridades = addPriorityLevel(prioridadesLocales, formPrioridad);
      setPrioridadesLocales(nuevasPrioridades);
      setModalAbierto(null);
      setFormPrioridad({ nombre: '', color: '#6b7280', colorBg: '#f3f4f6', emoji: '' });
    } catch (error) {
      alert(error.message);
    }
  };

  const handleEditarPrioridad = () => {
    if (!formPrioridad.nombre.trim()) {
      alert('Por favor ingresa un nombre para la prioridad');
      return;
    }

    try {
      const nuevasPrioridades = updatePriorityLevel(prioridadesLocales, prioridadSeleccionada, formPrioridad);
      setPrioridadesLocales(nuevasPrioridades);
      setModalAbierto(null);
      setFormPrioridad({ nombre: '', color: '#6b7280', colorBg: '#f3f4f6', emoji: '' });
    } catch (error) {
      alert(error.message);
    }
  };

  const handleEliminarPrioridad = (nivel) => {
    const prioridad = nivelesPrioridad[nivel];
    const mensaje = prioridad.categorias.length > 0
      ? `¿Eliminar PRIORIDAD ${String(nivel).padStart(2, '0')}? Tiene ${prioridad.categorias.length} categorías que también se eliminarán.`
      : `¿Eliminar PRIORIDAD ${String(nivel).padStart(2, '0')}?`;

    if (window.confirm(mensaje)) {
      try {
        const nuevasPrioridades = deletePriorityLevel(prioridadesLocales, nivel);
        setPrioridadesLocales(nuevasPrioridades);
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const abrirModalAgregarCategoria = (nivelPrioridad) => {
    setPrioridadSeleccionada(nivelPrioridad);
    setFormCategoria({ nombre: '', nombreEn: '', meta: 0, emoji: '' });
    setModalAbierto('categoria');
  };

  const abrirModalEditarCategoria = (categoria) => {
    setCategoriaEditando(categoria);
    setPrioridadSeleccionada(categoria.prioridad);
    setFormCategoria({
      nombre: categoria.categoria,
      nombreEn: categoria.nombreEn || categoria.categoria,
      meta: categoria.meta,
      emoji: categoria.emoji || ''
    });
    setModalAbierto('editar-categoria');
  };

  const abrirModalEditarPrioridad = (nivel) => {
    const prioridad = nivelesPrioridad[nivel];
    setPrioridadSeleccionada(nivel);
    setFormPrioridad({
      nombre: prioridad.nombre,
      color: prioridad.color,
      colorBg: prioridad.colorBg,
      emoji: prioridad.emoji || ''
    });
    setModalAbierto('editar-prioridad');
  };

  const aplicarPaleta = (paleta) => {
    setFormPrioridad(prev => ({
      ...prev,
      color: paleta.color,
      colorBg: paleta.colorBg
    }));
  };

  const handleGuardarCambios = () => {
    onSave(prioridadesLocales);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-6xl mx-auto glass-card dark:glass-card rounded-premium p-6 border border-gold/20 shadow-glow-gold">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gradient-gold flex items-center gap-2">
                <SparklesIcon className="w-8 h-8" />
                {t('priorities.editor.title') || '🎯 Editor de Prioridades'}
              </h2>
              <p className="text-sm text-dark-textSecondary dark:text-dark-textSecondary mt-1">
                {t('priorities.editor.subtitle') || 'Gestiona tus categorías, prioridades y personaliza colores'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="glass-card dark:glass-card p-2 rounded-button hover:shadow-elevation-1 transition-premium border border-white/10"
            >
              <XMarkIcon className="w-6 h-6 text-dark-text dark:text-dark-text" />
            </button>
          </div>

          {/* Botón agregar nueva prioridad */}
          <button
            onClick={() => setModalAbierto('prioridad')}
            className="w-full mb-6 bg-gradient-gold text-black py-3 px-6 rounded-button font-semibold hover:brightness-110 transition-all shadow-elevation-1 flex items-center justify-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            {t('priorities.editor.addPriority') || 'Agregar Nueva Prioridad'}
          </button>

          {/* Lista de prioridades */}
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {Object.keys(nivelesPrioridad).sort((a, b) => Number(a) - Number(b)).map(nivel => {
              const prioridad = nivelesPrioridad[nivel];

              return (
                <div key={nivel} className="glass-card dark:glass-card rounded-premium overflow-hidden border border-white/10">
                  {/* Header de la prioridad */}
                  <div
                    className="px-4 py-3 flex items-center justify-between"
                    style={{ backgroundColor: prioridad.color }}
                  >
                    <span className="font-bold text-white flex items-center gap-2">
                      {prioridad.emoji && <span className="text-xl">{prioridad.emoji}</span>}
                      {prioridad.nombre}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => abrirModalEditarPrioridad(nivel)}
                        className="p-1 hover:bg-white/20 rounded transition-colors"
                        title="Editar prioridad"
                      >
                        <PencilIcon className="w-4 h-4 text-white" />
                      </button>
                      {Number(nivel) > 1 && (
                        <button
                          onClick={() => handleEliminarPrioridad(nivel)}
                          className="p-1 hover:bg-white/20 rounded transition-colors"
                          title="Eliminar prioridad"
                        >
                          <TrashIcon className="w-4 h-4 text-white" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Categorías */}
                  <div className="p-4 space-y-2">
                    {prioridad.categorias.map(cat => (
                      <div
                        key={cat.numero}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:shadow-elevation-1 transition-premium"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {cat.emoji && <span className="text-lg">{cat.emoji}</span>}
                            <span className="font-medium text-dark-text dark:text-dark-text">
                              {cat.categoria}
                            </span>
                          </div>
                          <div className="text-sm text-dark-textSecondary dark:text-dark-textSecondary mt-1">
                            Meta: ${cat.meta}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => abrirModalEditarCategoria(cat)}
                            className="p-2 text-gold hover:bg-gold/10 rounded transition-colors"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEliminarCategoria(cat)}
                            className="p-2 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Botón agregar categoría */}
                    <button
                      onClick={() => abrirModalAgregarCategoria(nivel)}
                      className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-dark-textSecondary dark:text-dark-textSecondary hover:border-gold hover:text-gold transition-colors flex items-center justify-center gap-2"
                    >
                      <PlusIcon className="w-4 h-4" />
                      <span className="text-sm font-medium">Agregar Categoría</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Botones de acción */}
          <div className="flex gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleGuardarCambios}
              className="flex-1 bg-gradient-gold text-black py-3 px-6 rounded-button font-semibold hover:brightness-110 transition-all shadow-elevation-1"
            >
              {t('forms.save') || 'Guardar Cambios'}
            </button>
            <button
              onClick={onClose}
              className="flex-1 glass-card dark:glass-card text-dark-text dark:text-dark-text py-3 px-6 rounded-button font-semibold hover:shadow-elevation-1 transition-premium border border-white/10"
            >
              {t('forms.cancel') || 'Cancelar'}
            </button>
          </div>
        </div>
      </div>

      {/* Modal Agregar/Editar Categoría */}
      {(modalAbierto === 'categoria' || modalAbierto === 'editar-categoria') && (
        <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4" onClick={() => setModalAbierto(null)}>
          <div className="glass-card dark:glass-card rounded-premium p-6 max-w-md w-full border border-gold/20" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-gradient-gold mb-4">
              {modalAbierto === 'categoria' ? 'Nueva Categoría' : 'Editar Categoría'}
            </h3>

            <div className="space-y-4">
              {/* Emoji */}
              <div>
                <label className="block text-sm font-medium text-dark-textSecondary dark:text-dark-textSecondary mb-2">
                  Emoji (opcional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formCategoria.emoji}
                    onChange={(e) => setFormCategoria(prev => ({ ...prev, emoji: e.target.value }))}
                    placeholder="😊"
                    maxLength={2}
                    className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-center text-2xl"
                  />
                  <button
                    onClick={() => setMostrarEmojiPicker(!mostrarEmojiPicker)}
                    className="px-4 py-2 glass-card dark:glass-card rounded-button text-sm border border-white/10"
                  >
                    Sugerencias
                  </button>
                </div>
                {mostrarEmojiPicker && (
                  <div className="mt-2 grid grid-cols-8 gap-2 p-2 glass-card dark:glass-card rounded-lg border border-white/10">
                    {Object.values(EMOJI_SUGGESTIONS).map((emoji, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setFormCategoria(prev => ({ ...prev, emoji }));
                          setMostrarEmojiPicker(false);
                        }}
                        className="text-2xl hover:scale-125 transition-transform"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-dark-textSecondary dark:text-dark-textSecondary mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formCategoria.nombre}
                  onChange={(e) => setFormCategoria(prev => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Ej: Terapia"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gold bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>

              {/* Nombre en inglés */}
              <div>
                <label className="block text-sm font-medium text-dark-textSecondary dark:text-dark-textSecondary mb-2">
                  Nombre en inglés (opcional)
                </label>
                <input
                  type="text"
                  value={formCategoria.nombreEn}
                  onChange={(e) => setFormCategoria(prev => ({ ...prev, nombreEn: e.target.value }))}
                  placeholder="Ex: Therapy"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gold bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>

              {/* Meta */}
              <div>
                <label className="block text-sm font-medium text-dark-textSecondary dark:text-dark-textSecondary mb-2">
                  Meta Mensual (USD)
                </label>
                <input
                  type="number"
                  value={formCategoria.meta}
                  onChange={(e) => setFormCategoria(prev => ({ ...prev, meta: e.target.value }))}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gold bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={modalAbierto === 'categoria' ? handleAgregarCategoria : handleEditarCategoria}
                className="flex-1 bg-gradient-gold text-black py-2 px-4 rounded-button font-semibold hover:brightness-110 transition-all"
              >
                {modalAbierto === 'categoria' ? 'Agregar' : 'Actualizar'}
              </button>
              <button
                onClick={() => {
                  setModalAbierto(null);
                  setCategoriaEditando(null);
                  setFormCategoria({ nombre: '', nombreEn: '', meta: 0, emoji: '' });
                }}
                className="flex-1 glass-card dark:glass-card py-2 px-4 rounded-button border border-white/10"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Agregar/Editar Prioridad */}
      {(modalAbierto === 'prioridad' || modalAbierto === 'editar-prioridad') && (
        <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4" onClick={() => setModalAbierto(null)}>
          <div className="glass-card dark:glass-card rounded-premium p-6 max-w-md w-full border border-gold/20" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-gradient-gold mb-4">
              {modalAbierto === 'prioridad' ? 'Nueva Prioridad' : 'Editar Prioridad'}
            </h3>

            <div className="space-y-4">
              {/* Emoji */}
              <div>
                <label className="block text-sm font-medium text-dark-textSecondary dark:text-dark-textSecondary mb-2">
                  Emoji (opcional)
                </label>
                <input
                  type="text"
                  value={formPrioridad.emoji}
                  onChange={(e) => setFormPrioridad(prev => ({ ...prev, emoji: e.target.value }))}
                  placeholder="🎯"
                  maxLength={2}
                  className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-center text-2xl"
                />
              </div>

              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-dark-textSecondary dark:text-dark-textSecondary mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formPrioridad.nombre}
                  onChange={(e) => setFormPrioridad(prev => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Ej: PRIORIDAD 05 - Extras"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gold bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>

              {/* Paletas de colores */}
              <div>
                <label className="block text-sm font-medium text-dark-textSecondary dark:text-dark-textSecondary mb-2">
                  Paleta de Colores
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {Object.entries(COLOR_PALETTES).map(([key, paleta]) => (
                    <button
                      key={key}
                      onClick={() => aplicarPaleta(paleta)}
                      className="h-12 rounded-lg border-2 transition-all hover:scale-105"
                      style={{
                        backgroundColor: paleta.color,
                        borderColor: formPrioridad.color === paleta.color ? '#d4af37' : 'transparent'
                      }}
                      title={paleta.nombre}
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="p-4 rounded-lg" style={{ backgroundColor: formPrioridad.color }}>
                <span className="font-bold text-white flex items-center gap-2">
                  {formPrioridad.emoji && <span className="text-xl">{formPrioridad.emoji}</span>}
                  {formPrioridad.nombre || 'Vista Previa'}
                </span>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={modalAbierto === 'prioridad' ? handleAgregarPrioridad : handleEditarPrioridad}
                className="flex-1 bg-gradient-gold text-black py-2 px-4 rounded-button font-semibold hover:brightness-110 transition-all"
              >
                {modalAbierto === 'prioridad' ? 'Agregar' : 'Actualizar'}
              </button>
              <button
                onClick={() => {
                  setModalAbierto(null);
                  setFormPrioridad({ nombre: '', color: '#6b7280', colorBg: '#f3f4f6', emoji: '' });
                }}
                className="flex-1 glass-card dark:glass-card py-2 px-4 rounded-button border border-white/10"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditorPrioridades;
