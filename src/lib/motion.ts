// Easing curves — hand-picked, not defaults
export const easings = {
  // Apple-style snappy out — for entrances
  easeOutExpo: [0.16, 1, 0.3, 1] as const,
  // Dramatic in-out — for hero transitions
  easeInOutQuart: [0.76, 0, 0.24, 1] as const,
  // Soft, gentle out — for large surfaces
  easeOutQuint: [0.22, 1, 0.36, 1] as const,
};

// Spring physics — tuned per use case
export const springs = {
  snappy: { type: 'spring' as const, stiffness: 500, damping: 30, mass: 0.6 },
  gentle: { type: 'spring' as const, stiffness: 260, damping: 28 },
  hero: { type: 'spring' as const, stiffness: 180, damping: 24 },
};

// Durations in seconds (Motion uses seconds, not ms)
export const durations = {
  instant: 0.12,
  fast: 0.22,
  base: 0.32,
  slow: 0.5,
  lazy: 0.8,
};

// Stagger timing — how far apart siblings animate
export const stagger = {
  tight: 0.03,
  base: 0.06,
  loose: 0.12,
};

// Common choreography variants
export const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

// Reduced motion fallback — everything just fades
export const reducedMotionVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};