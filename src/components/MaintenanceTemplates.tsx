import { motion, useReducedMotion } from 'motion/react';
import {
  MaintenanceTemplate,
  REPEAT_LABELS,
  firstDueDate,
} from '../lib/suggestions';
import { Icon } from '../lib/icons';
import { easings } from '../lib/motion';

type Props = {
  tasks: MaintenanceTemplate[];
  selected: string[];
  onToggle: (id: string) => void;
  /** Install or purchase date. First due dates count from here when set. */
  dueBase?: string | null;
  heading?: string;
  sub?: string;
};

export default function MaintenanceTemplates({
  tasks,
  selected,
  onToggle,
  dueBase,
  heading = 'Schedule maintenance',
  sub = 'Pick what applies. Each one is added as a task when you save.',
}: Props) {
  const reduce = useReducedMotion();

  if (tasks.length === 0) {
    return (
      <div className="template-section">
        <h3 className="section-title">{heading}</h3>
        <p className="section-sub">
          Nothing standard for this category. You can add a task after
          saving.
        </p>
      </div>
    );
  }

  return (
    <div className="template-section">
      <h3 className="section-title">{heading}</h3>
      <p className="section-sub">{sub}</p>
      <div className="template-list">
        {tasks.map((t, i) => {
          const active = selected.includes(t.id);
          const due = firstDueDate(t.dueInDays, dueBase);
          return (
            <motion.button
              key={t.id}
              type="button"
              className={`template-row${active ? ' template-row--active' : ''}`}
              aria-pressed={active}
              onClick={() => onToggle(t.id)}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.35,
                ease: easings.easeOutExpo,
                delay: reduce ? 0 : i * 0.05,
              }}
              whileTap={reduce ? undefined : { scale: 0.99 }}
            >
              <motion.span
                className="template-check"
                animate={
                  reduce
                    ? undefined
                    : { scale: active ? [1, 1.18, 1] : 1 }
                }
                transition={{ duration: 0.28, ease: 'easeOut' }}
              >
                <Icon
                  name={active ? 'checkCircle' : 'add'}
                  size={20}
                  strokeWidth={active ? 2 : 1.8}
                />
              </motion.span>
              <span className="template-copy">
                <span className="template-title">{t.title}</span>
                <span className="template-meta">
                  {REPEAT_LABELS[t.repeat]} · first due{' '}
                  {due.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <span className="template-reason">{t.reason}</span>
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
