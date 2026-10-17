import { motion, AnimatePresence } from 'motion/react';
import { useEffect } from 'react';
import { springs } from '../lib/motion';
import { Icon } from '../lib/icons';

type Props = {
  message: string;
  visible: boolean;
  onHide: () => void;
  actionLabel?: string;
  onAction?: () => void;
  timeout?: number;
};

export function Toast({
  message,
  visible,
  onHide,
  actionLabel,
  onAction,
  timeout = 2500,
}: Props) {
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onHide, timeout);
    return () => clearTimeout(timer);
  }, [visible, onHide, timeout]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="toast"
          initial={{ opacity: 0, y: 40, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={springs.gentle}
        >
          <span className="toast-icon">
            <Icon name="check" size={12} strokeWidth={3} />
          </span>
          <span className="toast-message">{message}</span>
          {actionLabel && onAction && (
            <button
              type="button"
              className="toast-action"
              onClick={(e) => {
                e.stopPropagation();
                onAction();
              }}
            >
              {actionLabel}
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Toast;