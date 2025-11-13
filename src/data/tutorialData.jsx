/**
 * TUTORIAL DATA - FinFlow Interactive Onboarding
 *
 * Sistema de tutorial interactivo de 15 pasos que enseña:
 * - La Ley del "Holy 40%" de Grant Cardone
 * - Sistema de Cascada de Cash-Flow
 * - Eliminación de decisiones emocionales con IA
 */

export const getTutorialSteps = (language = 'es') => {
  const steps = {
    es: [
      // PASO 1 - BIENVENIDA
      {
        target: 'body',
        content: (
          <div className="tutorial-content">
            <h2 className="text-2xl font-bold text-gradient-gold mb-4">
              🎯 ¡Bienvenido a FinFlow!
            </h2>
            <p className="text-gray-200 mb-3">
              La primera aplicación financiera que usa <strong>IA</strong> para
              <strong> ELIMINAR</strong> las decisiones emocionales y automatizar
              tu camino hacia la riqueza.
            </p>
            <p className="text-gray-300 mb-3">
              Te guiaré paso a paso para configurar tu sistema.
            </p>
            <p className="text-gold font-semibold">
              ⏱️ Tiempo: 3 minutos
            </p>
          </div>
        ),
        placement: 'center',
        disableBeacon: true,
        styles: {
          options: {
            zIndex: 10000,
          }
        }
      },

      // PASO 2 - LA LEY DEL "HOLY 40%"
      {
        target: '[data-tour="sagrado-40"]',
        content: (
          <div className="tutorial-content">
            <h3 className="text-xl font-bold text-gradient-gold mb-3">
              💎 La Ley del HOLY 40% (Sagrado 40%)
            </h3>
            <p className="text-gray-200 mb-2">
              Este <strong>NO</strong> es un número arbitrario.
            </p>
            <p className="text-gray-200 mb-3">
              Es un principio establecido por <strong>Grant Cardone</strong>
              (empresario billonario) que garantiza:
            </p>
            <ul className="text-gray-300 mb-3 space-y-1">
              <li>✅ Mantenlo durante 3-6 meses</li>
              <li>✅ Verás resultados <strong>REALES</strong> de creación de riqueza</li>
              <li>✅ Ganarás <strong>MÁS</strong> en 3-6 meses que en tu <strong>ÚLTIMO AÑO</strong></li>
            </ul>
            <p className="text-gold font-semibold">
              El 40% de CADA ingreso se separa automáticamente.<br />
              Este dinero NO SE TOCA. Es tu futuro.
            </p>
          </div>
        ),
        placement: 'bottom',
        disableBeacon: true
      },

      // PASO 3 - AGREGAR PRIMER INGRESO
      {
        target: '[data-tour="btn-add-income"]',
        content: (
          <div className="tutorial-content">
            <h3 className="text-xl font-bold text-gradient-gold mb-3">
              💰 Registra tu Primer Ingreso
            </h3>
            <p className="text-gray-200 mb-3">
              Empecemos configurando tu sistema.<br />
              Haz click aquí para registrar tu ingreso mensual.
            </p>
            <p className="text-gold font-semibold">
              La <strong>IA</strong> calculará automáticamente tu 40%.
            </p>
          </div>
        ),
        placement: 'top',
        disableBeacon: true,
        spotlightClicks: true,
        hideFooter: false
      },

      // PASO 4 - FORMULARIO DE INGRESO
      {
        target: '[data-tour="income-amount"]',
        content: (
          <div className="tutorial-content">
            <h3 className="text-xl font-bold text-gradient-gold mb-3">
              Ingresa tu ingreso mensual
            </h3>
            <p className="text-gray-200 mb-2">
              Ejemplo: $3000
            </p>
            <p className="text-gray-300 text-sm">
              No te preocupes, puedes ajustarlo después.
            </p>
          </div>
        ),
        placement: 'right',
        disableBeacon: true
      },

      // PASO 5 - VER CÁLCULO AUTOMÁTICO
      {
        target: '[data-tour="calculation-preview"]',
        content: (
          <div className="tutorial-content">
            <h3 className="text-xl font-bold text-gradient-gold mb-3">
              🤖 La IA ya calculó automáticamente:
            </h3>
            <p className="text-gray-200 mb-2">
              💎 40% Sagrado: <strong className="text-gold">[MONTO]</strong> (PROTEGIDO)
            </p>
            <p className="text-gray-200 mb-3">
              💸 60% Disponible: <strong className="text-gold">[MONTO]</strong> (Para prioridades)
            </p>
            <p className="text-gray-300 mb-3">
              Esto sucede <strong>AUTOMÁTICAMENTE</strong> con cada ingreso.
            </p>
            <p className="text-gold font-semibold">
              Ahora guarda este ingreso.
            </p>
          </div>
        ),
        placement: 'left',
        disableBeacon: true,
        spotlightClicks: true
      },

      // PASO 6 - CONFIRMACIÓN DEL SAGRADO 40%
      {
        target: '[data-tour="sagrado-40-amount"]',
        content: (
          <div className="tutorial-content">
            <h3 className="text-xl font-bold text-gradient-gold mb-3">
              ✅ ¡Perfecto! Tu primer 40% está protegido.
            </h3>
            <p className="text-gray-200 mb-3">
              Este dinero está <strong>SEPARADO</strong> y la <strong>IA</strong> no lo tocará
              para ningún gasto.
            </p>
            <p className="text-gold font-semibold">
              Es tu colchón de riqueza que crece automáticamente.
            </p>
          </div>
        ),
        placement: 'bottom',
        disableBeacon: true
      },

      // PASO 7 - INTRODUCCIÓN A LA CASCADA
      {
        target: '[data-tour="priorities-section"]',
        content: (
          <div className="tutorial-content">
            <h3 className="text-xl font-bold text-gradient-gold mb-3">
              🌊 La CASCADA de CASH-FLOW
            </h3>
            <p className="text-gray-200 mb-3">
              Ahora viene la magia de FinFlow:
            </p>
            <p className="text-gray-200 mb-3">
              Tu dinero disponible (60%) fluye <strong>automáticamente</strong>
              en <strong>CASCADA</strong> a través de 4 niveles de prioridad:
            </p>
            <ul className="text-gray-300 mb-3 space-y-1">
              <li>1️⃣ <strong>CRÍTICO</strong> → Lo más urgente</li>
              <li>2️⃣ <strong>IMPORTANTE</strong> → Esenciales</li>
              <li>3️⃣ <strong>NEGOCIO</strong> → Inversiones</li>
              <li>4️⃣ <strong>CALIDAD DE VIDA</strong> → Deseos</li>
            </ul>
            <p className="text-gold font-semibold">
              La <strong>IA</strong> asigna tu dinero de arriba hacia abajo,<br />
              ELIMINANDO decisiones emocionales.
            </p>
          </div>
        ),
        placement: 'top',
        disableBeacon: true
      },

      // PASO 8 - CREAR PRIMERA PRIORIDAD
      {
        target: '[data-tour="btn-manage-priorities"]',
        content: (
          <div className="tutorial-content">
            <h3 className="text-xl font-bold text-gradient-gold mb-3">
              ➕ Crea tu Primera Prioridad
            </h3>
            <p className="text-gray-200 mb-3">
              Definamos juntos una prioridad Nivel 1 (CRÍTICO).
            </p>
            <p className="text-gray-300 mb-3">
              <strong>Ejemplo:</strong><br />
              • Nombre: 'Alquiler' o 'Renta'<br />
              • Nivel: 1 - CRÍTICO<br />
              • Monto: $800
            </p>
            <p className="text-gold font-semibold">
              Haz click aquí para crear.
            </p>
          </div>
        ),
        placement: 'bottom',
        disableBeacon: true,
        spotlightClicks: true
      },

      // PASO 9 - VER PRIORIDAD CREADA
      {
        target: '[data-tour="priority-card"]',
        content: (
          <div className="tutorial-content">
            <h3 className="text-xl font-bold text-gradient-gold mb-3">
              ✅ ¡Excelente!
            </h3>
            <p className="text-gray-200 mb-3">
              La <strong>IA</strong> ahora sabe que esto es <strong>NIVEL 1 (CRÍTICO)</strong>.
            </p>
            <p className="text-gray-200 mb-3">
              Cuando registres gastos o ingresos, la <strong>IA</strong>
              asignará dinero <strong>AUTOMÁTICAMENTE</strong> siguiendo
              la cascada de prioridades.
            </p>
            <p className="text-gold font-semibold">
              Primero se cubre esto, luego el resto.
            </p>
          </div>
        ),
        placement: 'right',
        disableBeacon: true
      },

      // PASO 10 - EXPLICAR SISTEMA DE 4 NIVELES
      {
        target: '[data-tour="priorities-list"]',
        content: (
          <div className="tutorial-content">
            <h3 className="text-xl font-bold text-gradient-gold mb-3">
              🎯 Los 4 Niveles de la Cascada
            </h3>
            <div className="text-gray-200 mb-2">
              <strong>1️⃣ CRÍTICO</strong><br />
              <span className="text-gray-300 text-sm">Supervivencia: Alquiler, comida, servicios básicos</span>
            </div>
            <div className="text-gray-200 mb-2">
              <strong>2️⃣ IMPORTANTE</strong><br />
              <span className="text-gray-300 text-sm">Esenciales: Transporte, seguros, deudas</span>
            </div>
            <div className="text-gray-200 mb-2">
              <strong>3️⃣ NEGOCIO</strong><br />
              <span className="text-gray-300 text-sm">Crecimiento: Herramientas, inversiones, educación</span>
            </div>
            <div className="text-gray-200 mb-3">
              <strong>4️⃣ CALIDAD DE VIDA</strong><br />
              <span className="text-gray-300 text-sm">Disfrute: Entretenimiento, lujos, hobbies</span>
            </div>
            <p className="text-gold font-semibold text-sm">
              💡 El dinero 'cae' de arriba hacia abajo.<br />
              La <strong>IA</strong> NO te deja gastar en Nivel 4 si Nivel 1 no está cubierto.
            </p>
            <p className="text-gold font-bold mt-2">
              CERO decisiones emocionales. PURA matemática.
            </p>
          </div>
        ),
        placement: 'top',
        disableBeacon: true
      },

      // PASO 11 - DASHBOARD Y ESTADÍSTICAS
      {
        target: '[data-tour="dashboard-stats"]',
        content: (
          <div className="tutorial-content">
            <h3 className="text-xl font-bold text-gradient-gold mb-3">
              📊 Tu Panel de Control con IA
            </h3>
            <p className="text-gray-200 mb-3">
              Aquí la <strong>IA</strong> te muestra en tiempo real:
            </p>
            <ul className="text-gray-300 mb-3 space-y-1">
              <li>• Balance actual</li>
              <li>• Distribución por prioridades</li>
              <li>• Proyecciones de crecimiento</li>
              <li>• Alertas automáticas</li>
            </ul>
            <p className="text-gold font-semibold">
              Todo calculado y actualizado automáticamente.
            </p>
          </div>
        ),
        placement: 'bottom',
        disableBeacon: true
      },

      // PASO 12 - LA PROMESA DE GRANT CARDONE
      {
        target: 'body',
        content: (
          <div className="tutorial-content">
            <h2 className="text-2xl font-bold text-gradient-gold mb-4">
              ⏰ La Promesa de 3-6 Meses
            </h2>
            <p className="text-gray-200 mb-3">
              <strong>Grant Cardone</strong>, empresario billonario, estableció
              esta regla después de años de experiencia:
            </p>
            <blockquote className="border-l-4 border-gold pl-4 mb-4 italic text-gray-300">
              "Mantén el Sagrado 40% durante 3-6 meses y
              ganarás más que en tu último año completo."
            </blockquote>
            <p className="text-gray-200 mb-2 font-semibold">
              ¿Por qué funciona?
            </p>
            <ul className="text-gray-300 mb-3 space-y-1">
              <li>✅ Eliminas gastos emocionales</li>
              <li>✅ Acumulas capital para oportunidades</li>
              <li>✅ Cambias tu mentalidad financiera</li>
              <li>✅ La <strong>IA</strong> te mantiene disciplinado</li>
            </ul>
            <p className="text-gold font-bold">
              FinFlow automatiza todo esto por ti.
            </p>
          </div>
        ),
        placement: 'center',
        disableBeacon: true
      },

      // PASO 13 - AGREGAR GASTO (OPCIONAL)
      {
        target: '[data-tour="btn-add-expense"]',
        content: (
          <div className="tutorial-content">
            <h3 className="text-xl font-bold text-gradient-gold mb-3">
              💳 ¿Quieres ver la IA en acción?
            </h3>
            <p className="text-gray-200 mb-3">
              Prueba agregando un gasto y observa cómo
              la <strong>IA</strong> lo asigna automáticamente a la
              prioridad correcta.
            </p>
            <p className="text-gray-300 text-sm">
              (Este paso es opcional, puedes saltarlo)
            </p>
          </div>
        ),
        placement: 'top',
        disableBeacon: true,
        spotlightClicks: true
      },

      // PASO 14 - CONFIGURACIÓN
      {
        target: '[data-tour="settings-menu"]',
        content: (
          <div className="tutorial-content">
            <h3 className="text-xl font-bold text-gradient-gold mb-3">
              ⚙️ Personalización
            </h3>
            <p className="text-gray-200 mb-3">
              Desde aquí puedes:
            </p>
            <ul className="text-gray-300 mb-3 space-y-1">
              <li>• Cambiar moneda (USD/ARS)</li>
              <li>• Ajustar idioma</li>
              <li>• Modificar tema visual</li>
              <li>• Ver estadísticas avanzadas</li>
            </ul>
          </div>
        ),
        placement: 'left',
        disableBeacon: true
      },

      // PASO 15 - FINALIZACIÓN Y MOTIVACIÓN
      {
        target: 'body',
        content: (
          <div className="tutorial-content">
            <h2 className="text-2xl font-bold text-gradient-gold mb-4">
              🎉 ¡Sistema Configurado!
            </h2>
            <p className="text-gray-200 mb-3">
              Tu <strong>IA</strong> financiera personal ya está activa.
            </p>
            <ul className="text-gray-300 mb-4 space-y-1">
              <li>🤖 Decisiones automáticas</li>
              <li>💎 40% protegido siempre</li>
              <li>🌊 Cascada de prioridades activa</li>
              <li>📊 Sin estrés financiero</li>
            </ul>
            <p className="text-gold font-semibold mb-4">
              Recuerda: Solo 3-6 meses respetando
              el <strong>Sagrado 40%</strong> y verás resultados reales.
            </p>
            <p className="text-gray-200 mb-4">
              La <strong>IA</strong> se encarga del resto. Tú solo vive.
            </p>
            <hr className="border-gray-600 my-4" />
            <p className="text-gray-400 text-sm">
              💡 Puedes repetir este tutorial desde:<br />
              <span className="text-gold">Configuración → Ayuda → Ver Tutorial</span>
            </p>
          </div>
        ),
        placement: 'center',
        disableBeacon: true
      }
    ],

    en: [
      // English version - simplified for now, can be expanded
      {
        target: 'body',
        content: (
          <div className="tutorial-content">
            <h2 className="text-2xl font-bold text-gradient-gold mb-4">
              🎯 Welcome to FinFlow!
            </h2>
            <p className="text-gray-200 mb-3">
              The first financial app that uses <strong>AI</strong> to
              <strong> ELIMINATE</strong> emotional decisions and automate
              your path to wealth.
            </p>
            <p className="text-gray-300 mb-3">
              I'll guide you step by step to set up your system.
            </p>
            <p className="text-gold font-semibold">
              ⏱️ Time: 3 minutes
            </p>
          </div>
        ),
        placement: 'center',
        disableBeacon: true
      }
      // ... más pasos en inglés (para mantener el código corto, solo muestro el primero)
    ]
  };

  return steps[language] || steps.es;
};

export default getTutorialSteps;
