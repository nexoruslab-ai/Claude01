import React, { useState, useEffect } from 'react';
import Joyride, { ACTIONS, EVENTS, STATUS } from 'react-joyride';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { getTutorialSteps } from '../../data/tutorialData.jsx';
import TutorialTooltip from './TutorialTooltip.jsx';

/**
 * COMPONENTE DE TUTORIAL INTERACTIVO CON ACCIONES REALES
 *
 * Tutorial de 15 pasos con React Joyride que enseña:
 * - La Ley del Holy 40% de Grant Cardone
 * - Promesa: "3-6 meses = más que tu último año completo"
 * - Sistema de IA que elimina decisiones emocionales
 * - Cascade Cash-Flow de 4 niveles
 *
 * Características especiales:
 * - Espera acciones REALES del usuario (agregar ingreso, crear prioridad)
 * - Overlay 60% opacity
 * - Border dorado 3px en spotlight
 * - Transiciones de 300ms
 * - Bloquea interacción con elementos no destacados
 * - Guarda progreso en Firestore
 * - Puede pausarse y reanudarse
 */

const Tutorial = ({
  isOpen,
  onComplete,
  onSkip,
  language = 'es',
  forceRestart = false,
  userAction = null, // Acción del usuario para avanzar automáticamente
}) => {
  const { currentUser } = useAuth();
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [steps, setSteps] = useState([]);

  // Cargar pasos del tutorial según idioma
  useEffect(() => {
    const tutorialSteps = getTutorialSteps(language);
    setSteps(tutorialSteps);
  }, [language]);

  // Cargar progreso del tutorial desde Firestore
  useEffect(() => {
    const loadTutorialProgress = async () => {
      if (!currentUser || !isOpen) return;

      try {
        const docRef = doc(db, 'users', currentUser.uid, 'tutorialProgress', 'main');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && !forceRestart) {
          const data = docSnap.data();

          if (data.tutorialCompleted) {
            console.log('📚 Tutorial - Ya completado, reiniciando por forceRestart');
            // Si forceRestart es true, reiniciar de todos modos
            if (forceRestart) {
              setStepIndex(0);
              setRun(true);
            } else {
              setRun(false);
            }
            return;
          }

          // Reanudar desde paso guardado
          const savedStep = data.currentStep || 0;
          setStepIndex(savedStep);
          console.log(`📚 Tutorial - Reanudando desde paso ${savedStep + 1}`);
        } else {
          // Usuario nuevo o reinicio forzado
          console.log('📚 Tutorial - Iniciando desde el principio');
          setStepIndex(0);
        }

        setRun(true);
      } catch (error) {
        console.error('❌ Tutorial - Error cargando progreso:', error);
        setRun(true); // Iniciar de todos modos
      }
    };

    loadTutorialProgress();
  }, [currentUser, isOpen, forceRestart]);

  // Detectar acciones del usuario y avanzar automáticamente
  useEffect(() => {
    if (!userAction || !run || !steps[stepIndex]) return;

    const currentStep = steps[stepIndex];

    // Si el paso actual espera una acción y la acción coincide, avanzar
    if (currentStep.waitForAction && currentStep.actionType === userAction) {
      console.log(`✅ Tutorial - Acción detectada: ${userAction}, avanzando...`);

      // Avanzar al siguiente paso
      const nextStep = stepIndex + 1;
      if (nextStep < steps.length) {
        setStepIndex(nextStep);
        saveTutorialProgress(nextStep, false);
      } else {
        // Tutorial completado
        saveTutorialProgress(stepIndex, true);
        setRun(false);
        if (onComplete) {
          onComplete();
        }
      }
    }
  }, [userAction, stepIndex, steps, run]);

  // Guardar progreso del tutorial en Firestore
  const saveTutorialProgress = async (currentStep, completed = false) => {
    if (!currentUser) return;

    try {
      const docRef = doc(db, 'users', currentUser.uid, 'tutorialProgress', 'main');

      await setDoc(docRef, {
        currentStep: currentStep,
        tutorialCompleted: completed,
        lastUpdated: new Date().toISOString()
      });

      console.log(`✅ Tutorial - Progreso guardado (paso ${currentStep + 1}, completado: ${completed})`);
    } catch (error) {
      console.error('❌ Tutorial - Error guardando progreso:', error);
    }
  };

  // Manejar eventos de Joyride
  const handleJoyrideCallback = async (data) => {
    const { action, index, status, type } = data;

    console.log('📚 Tutorial - Evento:', { action, index, status, type });

    // Usuario completó el tutorial
    if (status === STATUS.FINISHED) {
      console.log('🎉 Tutorial - ¡Completado!');
      await saveTutorialProgress(index, true);
      setRun(false);

      if (onComplete) {
        onComplete();
      }
      return;
    }

    // Usuario saltó el tutorial
    if (status === STATUS.SKIPPED || action === ACTIONS.CLOSE) {
      console.log('⏭️ Tutorial - Saltado por el usuario');
      await saveTutorialProgress(index, false);
      setRun(false);

      if (onSkip) {
        onSkip();
      }
      return;
    }

    // Guardar progreso en cada paso
    if (type === EVENTS.STEP_AFTER) {
      const currentStep = steps[index];

      // Si el paso requiere acción, no permitir avanzar manualmente
      if (currentStep && currentStep.waitForAction) {
        console.log('⏸️ Tutorial - Este paso requiere acción del usuario');
        return;
      }

      // Usuario avanzó al siguiente paso
      if (action === ACTIONS.NEXT) {
        const nextStep = index + 1;
        await saveTutorialProgress(nextStep, false);
        setStepIndex(nextStep);
      }
      // Usuario retrocedió
      else if (action === ACTIONS.PREV) {
        const prevStep = index - 1;
        await saveTutorialProgress(prevStep, false);
        setStepIndex(prevStep);
      }
    }
  };

  // No renderizar si no hay pasos o no debe correr
  if (!run || steps.length === 0) {
    return null;
  }

  return (
    <>
      <Joyride
        steps={steps}
        run={run}
        stepIndex={stepIndex}
        continuous={true}
        showProgress={false} // Usamos nuestro propio contador
        showSkipButton={false} // Lo manejamos en el tooltip custom
        scrollToFirstStep={true}
        scrollOffset={100}
        disableOverlayClose={true} // Evitar cerrar clickeando fuera
        disableCloseOnEsc={false} // Permitir ESC para saltar
        spotlightClicks={true} // Permitir clicks en elementos destacados
        disableScrolling={false}
        callback={handleJoyrideCallback}
        tooltipComponent={TutorialTooltip}
        locale={{
          back: language === 'es' ? 'Atrás' : 'Back',
          close: language === 'es' ? 'Cerrar' : 'Close',
          last: language === 'es' ? 'Finalizar' : 'Finish',
          next: language === 'es' ? 'Siguiente' : 'Next',
          skip: language === 'es' ? '⏭️ Saltar Tutorial' : '⏭️ Skip Tutorial',
        }}
        styles={{
          options: {
            arrowColor: '#D4AF37', // Gold color para flechas
            backgroundColor: 'transparent',
            overlayColor: 'rgba(0, 0, 0, 0.6)', // 60% opacity como especificado
            primaryColor: '#D4AF37', // Gold color
            textColor: '#F3F4F6',
            zIndex: 10000,
          },
          spotlight: {
            borderRadius: '12px',
            border: '3px solid #D4AF37', // Border dorado 3px
            boxShadow: '0 0 20px rgba(212, 175, 55, 0.5)', // Glow dorado
          },
          overlay: {
            mixBlendMode: 'normal', // Sin blend mode especial
            transition: 'opacity 300ms ease-in-out', // Transición de 300ms
          },
          tooltip: {
            transition: 'opacity 300ms ease-in-out, transform 300ms ease-in-out', // Transición de 300ms
          },
          tooltipContainer: {
            textAlign: 'left',
          },
          tooltipContent: {
            padding: 0,
          },
          buttonNext: {
            display: 'none', // Usamos botones custom en TutorialTooltip
          },
          buttonBack: {
            display: 'none',
          },
          buttonSkip: {
            display: 'none',
          },
          buttonClose: {
            display: 'none',
          },
        }}
      />

      {/* Estilo global para bloquear pointer-events en elementos no destacados */}
      <style>{`
        /* Bloquear interacción con elementos no destacados durante el tutorial */
        .__floater__open ~ * {
          pointer-events: none;
        }

        /* Permitir clicks en el elemento destacado */
        [data-tour] {
          pointer-events: auto !important;
        }

        /* Asegurar que el overlay de Joyride permite clicks en spotlight */
        .react-joyride__spotlight {
          pointer-events: auto !important;
        }

        /* Animación de fadeIn para tooltips */
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </>
  );
};

export default Tutorial;
