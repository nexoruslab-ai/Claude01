import { useState, useEffect, useRef } from 'react';

/**
 * useCountUp — Anima un número desde 0 hasta el valor objetivo.
 *
 * @param {number}  target    — Valor final
 * @param {number}  duration  — Duración en ms (default 900)
 * @param {boolean} enabled   — Solo anima si es true (default true)
 * @returns {number}          — Valor actual de la animación
 */
const useCountUp = (target, duration = 900, enabled = true) => {
  const [current, setCurrent] = useState(enabled ? 0 : target);
  const rafRef   = useRef(null);
  const startRef = useRef(null);
  const prevRef  = useRef(target);

  useEffect(() => {
    if (!enabled) {
      setCurrent(target);
      return;
    }

    // Solo animar si el valor cambió
    const from = prevRef.current === target ? 0 : prevRef.current;
    prevRef.current = target;

    startRef.current = null;
    const startVal = from;
    const delta    = target - startVal;

    const animate = (timestamp) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed  = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      setCurrent(startVal + delta * ease);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setCurrent(target);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration, enabled]);

  return current;
};

export default useCountUp;
