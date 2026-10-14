import { motion, useReducedMotion } from 'motion/react';
import { easings } from '../lib/motion';

type Props = {
  score: number;
  size?: number;
  strokeWidth?: number;
  animated?: boolean;
  showNumber?: boolean;
};

export function scoreColor(score: number): string {
  if (score >= 85) return '#2E7D32';
  if (score >= 70) return '#1F4D3A';
  if (score >= 50) return '#C9A227';
  return '#B3261E';
}

export default function ScoreRing({
  score,
  size = 180,
  strokeWidth = 12,
  animated = true,
  showNumber = true,
}: Props) {
  const reduce = useReducedMotion();
  const clamped = Math.max(0, Math.min(100, score));
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);
  const color = scoreColor(clamped);
  const shouldAnimate = animated && !reduce;

  return (
    <div className="score-ring" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: 'rotate(-90deg)' }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(31, 77, 58, 0.08)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={
            shouldAnimate
              ? { strokeDashoffset: circumference }
              : { strokeDashoffset: offset }
          }
          animate={{ strokeDashoffset: offset }}
          transition={{
            duration: 1.4,
            ease: easings.easeOutExpo,
            delay: shouldAnimate ? 0.15 : 0,
          }}
        />
      </svg>
      {showNumber && (
        <div className="score-ring-number">
          <motion.span
            style={{ color }}
            initial={shouldAnimate ? { opacity: 0, scale: 0.85 } : false}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.6,
              ease: easings.easeOutExpo,
              delay: shouldAnimate ? 0.6 : 0,
            }}
          >
            {clamped}
          </motion.span>
        </div>
      )}
    </div>
  );
}