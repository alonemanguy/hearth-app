import { motion, useReducedMotion } from 'motion/react';
import { easings } from '../lib/motion';

type Props = {
  size?: number;
  animated?: boolean;
  color?: string;
  accent?: string;
  ariaLabel?: string;
};

export function Logo({
  size = 64,
  animated = false,
  color = '#1F4D3A',
  accent = '#C9A227',
  ariaLabel = 'Hearth',
}: Props) {
  const reduce = useReducedMotion();
  const shouldAnimate = animated && !reduce;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={ariaLabel}
      style={{ display: 'block' }}
    >
      {/* Arch — the doorway */}
      <motion.path
        d="M 16 58 L 16 26 C 16 17 23 10 32 10 C 41 10 48 17 48 26 L 48 58"
        stroke={color}
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={
          shouldAnimate ? { pathLength: 0, opacity: 0 } : false
        }
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{
          pathLength: { duration: 0.95, ease: easings.easeOutExpo },
          opacity: { duration: 0.25 },
        }}
      />
      {/* Gold crossbar — the H */}
      <motion.line
        x1={24}
        y1={36}
        x2={40}
        y2={36}
        stroke={accent}
        strokeWidth={3}
        strokeLinecap="round"
        initial={
          shouldAnimate ? { pathLength: 0, opacity: 0 } : false
        }
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{
          pathLength: {
            duration: 0.5,
            ease: easings.easeOutExpo,
            delay: shouldAnimate ? 0.5 : 0,
          },
          opacity: {
            duration: 0.2,
            delay: shouldAnimate ? 0.5 : 0,
          },
        }}
      />
    </svg>
  );
}

export default Logo;