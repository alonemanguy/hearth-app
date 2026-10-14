import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { easings } from '../lib/motion';
import { Icon } from '../lib/icons';

export function OverdueBanner({ count }: { count: number }) {
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="overdue-banner"
      onClick={() => navigate('/notifications')}
      initial={reduce ? false : { opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: easings.easeOutExpo }}
      whileTap={reduce ? undefined : { scale: 0.99 }}
    >
      <div className="overdue-banner-icon">
        <Icon name="alert" size={18} />
      </div>
      <div className="overdue-banner-text">
        <div className="overdue-banner-title">
          {count} task{count === 1 ? '' : 's'} need your attention
        </div>
        <div className="overdue-banner-sub">Tap to review</div>
      </div>
      <Icon name="chevronRight" size={20} />
    </motion.div>
  );
}

export default OverdueBanner;