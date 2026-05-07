import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Props {
  /** Pool of strings to flicker through before settling on the final value */
  pool: string[];
  /** The final value to land on */
  value: string;
  /** Animation duration ms */
  duration?: number;
  className?: string;
}

/**
 * Slot-machine style reveal: flickers through random pool entries,
 * then settles on the real value with a pop.
 */
export function SlotReveal({ pool, value, duration = 900, className = "" }: Props) {
  const [display, setDisplay] = useState(value);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDone(false);
    const start = Date.now();
    const iv = setInterval(() => {
      const elapsed = Date.now() - start;
      if (elapsed >= duration) {
        clearInterval(iv);
        setDisplay(value);
        setDone(true);
      } else {
        setDisplay(pool[Math.floor(Math.random() * pool.length)] ?? value);
      }
    }, 60);
    return () => clearInterval(iv);
  }, [value, duration, pool]);

  return (
    <motion.div
      key={value}
      initial={{ scale: 0.9, opacity: 0.6 }}
      animate={done ? { scale: [1.15, 1], opacity: 1 } : { scale: 1, opacity: 1 }}
      transition={{ duration: 0.35 }}
      className={className}
      style={done ? { textShadow: "0 0 30px var(--accent)" } : undefined}
    >
      {display}
    </motion.div>
  );
}
