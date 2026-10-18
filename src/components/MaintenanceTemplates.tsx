import { motion, useReducedMotion } from 'motion/react';
import { ApplianceCategory } from '../lib/types';
import {
  MaintenanceTemplate,
  addDays,
  getMaintenanceTemplates,
} from '../lib/suggestions';
import { Icon } from '../lib/icons';
import { easings } from '../lib/motion';

type Props = {
  category: ApplianceCategory;
  selected: string[];
  onToggle: (id: string) => void;
};

const CADENCE: Record<MaintenanceTemplate['repeat'], string> = {
  monthly: 'Every month',
  quarterly: 'Every 3 months',
  yearly: 'Every year',
};

export default function MaintenanceTemplates({
  category,
  selected,
  onToggle,
}: Props) {
  const reduce = useReducedMotion();
  const templates = getMaintenanceTemplates(category);

  if (templates.length === 0) {
    return (
      <div className="template-section">
        <h3 className="section-title">Schedule maintenance</h3>
        <p className="section-sub">
          Nothing standard for this category. You can add a task after
          saving.
        </p>
      </div>
    );
  }

  return (
    <div className="template-section">
      <h3 className="section-title">Schedule maintenance</h3>
      <p className="section-sub">
        Pick what applies. Each one is added as a task when you save.
      </p>
      <div className="template-list">
        {templates.map((t, i) => {
          const active = selected.includes(t.id);
          const due = addDays(new Date(), t.dueInDays);
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
              <span className="template-check">
                <Icon
                  name={active ? 'checkCircle' : 'add'}
                  size={20}
                  strokeWidth={active ? 2 : 1.8}
                />
              </span>
              <span className="template-copy">
                <span className="template-title">{t.title}</span>
                <span className="template-meta">
                  {CADENCE[t.repeat]} · first due{' '}
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
