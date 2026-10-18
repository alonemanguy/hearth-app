import { motion, AnimatePresence } from 'motion/react';
import { useEffect } from 'react';
import { springs } from '../lib/motion';
import { Icon } from '../lib/icons';

type Props = {
  message: string;
  visible: boolean;
  onHide: () => void;
  tone?: 'default' | 'error';
};

export function Toast({ message, visible, onHide, tone = 'default' }: Props) {
  const isError = tone === 'error';

  useEffect(() => {
    if (!visible) return;
    // Errors stay a little longer than confirmations — they ask for an action.
    const timer = setTimeout(onHide, isError ? 4000 : 2500);
    return () => clearTimeout(timer);
  }, [visible, onHide, isError]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={`toast${isError ? ' toast--error' : ''}`}
          role={isError ? 'alert' : 'status'}
          initial={{ opacity: 0, y: 40, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={springs.gentle}
        >
          <span className={`toast-icon${isError ? ' toast-icon--error' : ''}`}>
            <Icon
              name={isError ? 'alert' : 'check'}
              size={isError ? 14 : 12}
              strokeWidth={isError ? 2.4 : 3}
            />
          </span>
          <span className="toast-message">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Toast;
