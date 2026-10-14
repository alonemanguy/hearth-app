import { motion, useReducedMotion } from 'motion/react';
import { easings } from '../lib/motion';
import Logo from './Logo';

type Props = {
  size?: number;
  animated?: boolean;
  color?: string;
  accent?: string;
  showText?: boolean;
};

export function Wordmark({
  size = 32,
  animated = false,
  color = '#1F4D3A',
  accent = '#C9A227',
  showText = true,
}: Props) {
  const reduce = useReducedMotion();
  const shouldAnimate = animated && !reduce;

  return (
    <div className="wordmark">
      <Logo
        size={size}
        animated={animated}
        color={color}
        accent={accent}
      />
      {showText && (
        <motion.span
          className="wordmark-text"
          style={{ color }}
          initial={shouldAnimate ? { opacity: 0, x: -6 } : false}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: 0.5,
            ease: easings.easeOutExpo,
            delay: shouldAnimate ? 0.85 : 0,
          }}
        >
          Hearth
        </motion.span>
      )}
    </div>
  );
}

export default Wordmark;