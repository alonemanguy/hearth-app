import { motion, useReducedMotion, AnimatePresence } from 'motion/react';
import { ReactNode, useState, MouseEvent } from 'react';
import { springs } from '../lib/motion';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

type Props = {
  variant?: Variant;
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
};

type Ripple = { id: number; x: number; y: number };

export function Button({
  variant = 'primary',
  children,
  onClick,
  disabled,
  type = 'button',
}: Props) {
  const reduce = useReducedMotion();
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const handlePointerDown = (e: MouseEvent<HTMLButtonElement>) => {
    if (disabled || reduce) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples((r) => [...r, { id, x, y }]);
    setTimeout(() => setRipples((r) => r.filter((rp) => rp.id !== id)), 600);
  };

  return (
    <motion.button
      type={type}
      className={`btn btn--${variant}`}
      onClick={onClick}
      disabled={disabled}
      onPointerDown={handlePointerDown}
      whileTap={
        disabled || reduce ? undefined : { scaleX: 0.97, scaleY: 0.94 }
      }
      whileHover={disabled || reduce ? undefined : { scale: 1.01 }}
      transition={springs.snappy}
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      <AnimatePresence>
        {ripples.map((r) => (
          <motion.span
            key={r.id}
            className="btn-ripple"
            style={{ left: r.x, top: r.y }}
            initial={{ scale: 0, opacity: 0.35 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>
      <span
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        {children}
      </span>
    </motion.button>
  );
}

export default Button;