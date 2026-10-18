import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  getApplianceTemplates,
  REPEAT_LABELS,
  firstDueDate,
} from '../lib/suggestions';
import { CATEGORY_ICONS, Icon } from '../lib/icons';
import { easings } from '../lib/motion';

type Props = {
  selectedId: string | null;
  /** Task ids (template task ids) that will be scheduled on save. */
  pickedTaskIds: string[];
  onSelect: (id: string) => void;
  onToggleTask: (taskId: string) => void;
  /** Install or purchase date. First due dates count from here when set. */
  dueBase?: string | null;
  /** Add Appliance shows picks as toggleable rows; onboarding too. */
  pickable?: boolean;
};

function firstDueLabel(days: number, base?: string | null): string {
  return firstDueDate(days, base).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function ApplianceTemplateGrid({
  selectedId,
  pickedTaskIds,
  onSelect,
  onToggleTask,
  dueBase,
  pickable = true,
}: Props) {
  const reduce = useReducedMotion();
  const templates = getApplianceTemplates();
  const selected = templates.find((t) => t.id === selectedId) ?? null;

  return (
    <div className="template-block">
      <div className="template-grid">
        {templates.map((t) => {
          const isSelected = selectedId === t.id;
          const TemplateIcon = CATEGORY_ICONS[t.category];
          const first = t.tasks[0];
          return (
            <button
              key={t.id}
              type="button"
              className={`template-card ${isSelected ? 'template-card--active' : ''}`}
              onClick={() => onSelect(t.id)}
              aria-pressed={isSelected}
            >
              <div className="template-icon">
                <TemplateIcon size={24} strokeWidth={1.8} />
              </div>
              <div className="template-info">
                <div className="template-title">{t.label}</div>
                <div className="template-task">{first.title}</div>
                <div className="template-interval">
                  {REPEAT_LABELS[first.repeat]}
                  {' \u00b7 '}
                  first due {firstDueLabel(first.dueInDays, dueBase)}
                  {t.tasks.length > 1 ? ` +${t.tasks.length - 1} more` : ''}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <AnimatePresence initial={false}>
        {selected && (
          <motion.div
            key={selected.id}
            className="template-tasks"
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reduce ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: easings.easeOutExpo }}
          >
            <div className="template-tasks-inner">
              <div className="template-tasks-head">
                Reminders we'll set up for the {selected.label.toLowerCase()}
              </div>
              {selected.tasks.map((task) => {
                const picked = pickedTaskIds.includes(task.id);
                return (
                  <button
                    key={task.id}
                    type="button"
                    className={`template-task-row ${picked ? 'template-task-row--picked' : ''}`}
                    onClick={() => onToggleTask(task.id)}
                    disabled={!pickable}
                    aria-pressed={picked}
                  >
                    <span className="template-task-check">
                      <Icon
                        name={picked ? 'checkCircle' : 'circle'}
                        size={18}
                        strokeWidth={picked ? 2.2 : 1.6}
                      />
                    </span>
                    <span className="template-task-copy">
                      <span className="template-task-title">{task.title}</span>
                      <span className="template-task-meta">
                        {REPEAT_LABELS[task.repeat]}
                        {' \u00b7 '}
                        first due {firstDueLabel(task.dueInDays, dueBase)}
                      </span>
                      <span className="template-task-why">{task.reason}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ApplianceTemplateGrid;
