import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';

export function NotificationBell({ count }: { count: number }) {
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  return (
    <motion.button
      className="notification-bell"
      onClick={() => navigate('/notifications')}
      whileTap={reduce ? undefined : { scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      aria-label={`Notifications${count > 0 ? `, ${count} unread` : ''}`}
    >
      <span className="notification-bell-icon">🔔</span>
      {count > 0 && (
        <motion.span
          className="notification-badge"
          initial={reduce ? false : { scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 22 }}
        >
          {count > 9 ? '9+' : count}
        </motion.span>
      )}
    </motion.button>
  );
}

export default NotificationBell;