import { motion, useReducedMotion } from 'motion/react';
import { ReactNode } from 'react';
import { durations, easings, reducedMotionVariants } from '../lib/motion';

type Props = { children: ReactNode };

export default function PageTransition({ children }: Props) {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <motion.div
        variants={reducedMotionVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: durations.fast }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: durations.base, ease: easings.easeOutExpo }}
      style={{ willChange: 'opacity, transform' }}
    >
      {children}
    </motion.div>
  );
}