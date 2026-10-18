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
        initial={reduce ? false : { opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: easings.easeOutExpo }}
      >
        <Icon name={icon} size={26} strokeWidth={1.8} />
      </motion.div>

      <motion.h2
        className="empty-title"
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.45, ease: easings.easeOutExpo }}
      >
        {title}
      </motion.h2>

      <motion.p
        className="empty-body"
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16, duration: 0.45, ease: easings.easeOutExpo }}
      >
        {body}
      </motion.p>

      {ctaLabel && onCta && (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24, duration: 0.45, ease: easings.easeOutExpo }}
          style={{ width: '100%', maxWidth: 240, marginTop: 8 }}
        >
          <Button onClick={onCta}>{ctaLabel}</Button>
        </motion.div>
      )}
    </div>
  );
}

export default EmptyState;
