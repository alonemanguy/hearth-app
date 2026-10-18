import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { springs } from '../lib/motion';

type Status = 'online' | 'offline' | 'back';

/**
 * Listens to the browser's connectivity events. Offline slides a banner in
 * from the top; reconnecting swaps it for a short confirmation that exits
 * the same way.
 */
export function OnlineStatus() {
  const reduce = useReducedMotion();
  const [status, setStatus] = useState<Status>('online');

  useEffect(() => {
    const goOffline = () => setStatus('offline');
    const goOnline = () => {
      setStatus((prev) => (prev === 'offline' ? 'back' : 'online'));
    };
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  useEffect(() => {
    if (status !== 'back') return;
    const timer = setTimeout(() => setStatus('online'), 2600);
    return () => clearTimeout(timer);
  }, [status]);

  return (
    <AnimatePresence>
      {status !== 'online' && (
        <motion.div
          className={`offline-banner${
            status === 'back' ? ' offline-banner--back' : ''
          }`}
          role="status"
          initial={reduce ? false : { y: '-100%' }}
          animate={{ y: 0 }}
          exit={reduce ? { opacity: 0 } : { y: '-100%' }}
          transition={springs.gentle}
        >
          {status === 'back'
            ? 'Back online.'
            : "You're offline. Changes won't save until you're back."}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default OnlineStatus;
