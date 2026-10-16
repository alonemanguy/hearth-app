import { motion, useReducedMotion } from 'motion/react';

type Status = 'due' | 'overdue' | 'done';

const labels = { due: 'Due soon', overdue: 'Overdue', done: 'Done' };

export default function StatusPill({ status }: { status: Status }) {
  const reduce = useReducedMotion();

  const animate =
    status === 'overdue' && !reduce
      ? { scale: [1, 1.06, 1] }
      : { scale: 1 };

  return (
    <motion.span
      className={`status-pill status-pill--${status}`}
      animate={animate}
      transition={{
        duration: 2.2,
        repeat: status === 'overdue' ? Infinity : 0,
        ease: 'easeInOut',
      }}
    >
      {labels[status]}
    </motion.span>
  );
}

export { StatusPill };