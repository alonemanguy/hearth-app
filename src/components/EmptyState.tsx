import { motion, useReducedMotion } from 'motion/react';
import Button from './Button';
import { easings } from '../lib/motion';
import { Icon, IconName } from '../lib/icons';

type Props = {
  icon: IconName;
  title: string;
  body: string;
  ctaLabel?: string;
  onCta?: () => void;
};

export function EmptyState({ icon, title, body, ctaLabel, onCta }: Props) {
  const reduce = useReducedMotion();

  return (
    <div className="empty-state">
      <motion.div
        className="empty-icon"
        initial={reduce ? false : { opacity: 0, scale: 0.7, y: 12 }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
          ...(reduce ? {} : { translateY: [0, -6, 0] }),
        }}
        transition={{
          opacity: { duration: 0.4, ease: easings.easeOutExpo },
          scale: { duration: 0.5, ease: easings.easeOutExpo },
          y: { duration: 0.5, ease: easings.easeOutExpo },
          translateY: {
            duration: 3.6,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.6,
          },
        }}
      >
        <Icon name={icon} size={48} strokeWidth={1.6} />
      </motion.div>

      <motion.h2
        className="empty-title"
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.45, ease: easings.easeOutExpo }}
      >
        {title}
      </motion.h2>

      <motion.p
        className="empty-body"
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.45, ease: easings.easeOutExpo }}
      >
        {body}
      </motion.p>

      {ctaLabel && onCta && (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.45, ease: easings.easeOutExpo }}
        >
          <Button onClick={onCta}>{ctaLabel}</Button>
        </motion.div>
      )}
    </div>
  );
}

export default EmptyState;