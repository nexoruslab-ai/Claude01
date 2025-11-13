import React, { useState, useEffect } from 'react';
import Joyride, { ACTIONS, EVENTS, STATUS } from 'react-joyride';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { getTutorialSteps } from '../../data/tutorialData.jsx';
import './TutorialTooltip.jsx';
import TutorialTooltip from './TutorialTooltip.jsx';

/**
 * COMPONENTE DE TUTORIAL INTERACTIVO
 *
 * Sistema de tutorial con React Joyride que guía al usuario
 * a través de 15 pasos explicando:
 * - La Ley del Holy 40% de Grant Cardone
 * - Sistema de IA y automatización
 * - Cascade Cash-Flow de 4 niveles
 * - Promesa: 3-6 meses = más que el último año completo
 *
 * Características:
 * - Guarda progreso en Firestore
 * - Puede pausarse y reanudarse
 * - Botón "Saltar Tutorial" siempre visible
 * - Se reinicia desde Settings
 */

const Tutorial = ({
  isOpen,
  onComplete,
  onSkip,
  language = 'es',
  forceRestart = false
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
            console.log('📚 Tutorial - Ya completado, no se inicia');
            setRun(false);
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
        showProgress={true}
        showSkipButton={true}
        scrollToFirstStep={true}
        scrollOffset={100}
        disableOverlayClose={false}
        disableCloseOnEsc={false}
        spotlightClicks={true}
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
            arrowColor: 'rgba(17, 24, 39, 0.95)', // gray-900 con transparencia
            backgroundColor: 'rgba(17, 24, 39, 0.95)',
            overlayColor: 'rgba(0, 0, 0, 0.7)',
            primaryColor: '#D4AF37', // gold color
            textColor: '#F3F4F6', // gray-100
            width: 480,
            zIndex: 10000,
          },
          spotlight: {
            borderRadius: '12px',
          },
        }}
      />
    </>
  );
};

export default Tutorial;
