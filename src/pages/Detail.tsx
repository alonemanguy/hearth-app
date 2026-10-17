import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { createPortal } from 'react-dom';
import Screen from '../components/Screen';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import StatusPill from '../components/StatusPill';
import Skeleton from '../components/Skeleton';
import Toast from '../components/Toast';
import { supabase } from '../lib/supabase';
import { easings } from '../lib/motion';
import { Icon } from '../lib/icons';

type Task = {
  id: string;
  title: string;
  appliance: string | null;
  appliance_id: string | null;
  due_date: string;
  status: 'due' | 'overdue' | 'done';
  notes: string | null;
  repeat: string;
  last_completed: string | null;
};

const infoRowVariants = {
  hidden: { opacity: 0, x: -12 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: easings.easeOutExpo },
  },
};

const infoContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.15 } },
};

const REPEAT_LABELS: Record<string, string> = {
  once: 'Once',
  monthly: 'Every month',
  quarterly: 'Every 3 months',
  yearly: 'Every year',
};

function getNextDueDate(dueDate: string, repeat: string): string | null {
  if (repeat === 'once') return null;
  const d = new Date(dueDate);
  if (repeat === 'monthly') d.setMonth(d.getMonth() + 1);
  else if (repeat === 'quarterly') d.setMonth(d.getMonth() + 3);
  else if (repeat === 'yearly') d.setFullYear(d.getFullYear() + 1);
  else return null;
  return d.toISOString().split('T')[0];
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function AnimatedCheck({ reduce }: { reduce: boolean }) {
  if (reduce) {
    return (
      <svg width={18} height={18} viewBox="0 0 24 24" fill="none">
        <path
          d="M 5 13 L 10 18 L 19 7"
          stroke="white"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <motion.path
        d="M 5 13 L 10 18 L 19 7"
        stroke="white"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut', delay: 0.05 }}
      />
    </svg>
  );
}

type SnoozeOption = {
  label: string;
  days: number;
};

const SNOOZE_OPTIONS: SnoozeOption[] = [
  { label: 'Tomorrow', days: 1 },
  { label: 'In 3 days', days: 3 },
  { label: 'Next week', days: 7 },
  { label: 'Next month', days: 30 },
];

type UndoState = {
  task: Task;
  successorId: string | null;
};

export default function Detail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const reduce = useReducedMotion() ?? false;

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [celebrating, setCelebrating] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [snoozeOpen, setSnoozeOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [undoPending, setUndoPending] = useState<UndoState | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchTask = async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching task:', error);
        navigate('/');
        return;
      }

      setTask(data);
      setLoading(false);
    };

    void fetchTask();
  }, [id, navigate]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
  };

  const handleUndo = async () => {
    if (!undoPending || !task) return;

    // Revert the task to due
    const { error: updateError } = await supabase
      .from('tasks')
      .update({ status: 'due', last_completed: null })
      .eq('id', task.id);

    if (updateError) {
      console.error('Error undoing task:', updateError);
      showToast('Could not undo');
      return;
    }

    // Delete the successor task if one was created
    if (undoPending.successorId) {
      await supabase.from('tasks').delete().eq('id', undoPending.successorId);
    }

    setUndoPending(null);
    setCelebrating(false);
    setToastVisible(false);
    showToast('Task restored');
    setTask({ ...task, status: 'due', last_completed: null });
  };

  const markAsDone = async () => {
    if (!task || celebrating) return;

    setCelebrating(true);

    const today = new Date().toISOString().split('T')[0];

    const { error: updateError } = await supabase
      .from('tasks')
      .update({ status: 'done', last_completed: today })
      .eq('id', task.id);

    if (updateError) {
      console.error('Error updating task:', updateError);
      setCelebrating(false);
      return;
    }

    let nextDate: string | null = null;
    let successorId: string | null = null;

    if (task.repeat && task.repeat !== 'once') {
      nextDate = getNextDueDate(task.due_date, task.repeat);

      if (nextDate) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const { data: inserted, error: insertError } = await supabase
          .from('tasks')
          .insert({
            user_id: user?.id,
            title: task.title,
            appliance: task.appliance,
            appliance_id: task.appliance_id,
            due_date: nextDate,
            repeat: task.repeat,
            notes: task.notes,
            status: 'due',
          })
          .select('id')
          .single();

        if (insertError) {
          console.error('Error scheduling next task:', insertError);
        } else {
          successorId = inserted?.id ?? null;
        }
      }
    }

    // Set up 10-second undo window instead of immediate navigation
    setUndoPending({ task: { ...task }, successorId });

    if (nextDate) {
      showToast(`Done — next one ${formatDate(nextDate)}`);
    } else {
      showToast('Task completed');
    }

    // Auto-navigate home after undo window expires
    const undoTimer = setTimeout(() => {
      setUndoPending(null);
      navigate('/');
    }, reduce ? 400 : 10000);

    // Store timer reference so we can clear it if undo is clicked
    // (timer cleanup handled by component unmount or timeout)
  };

  const handleSnooze = async (days: number) => {
    if (!task) return;

    const baseDate = new Date().toISOString().split('T')[0];
    const newDate = addDays(baseDate, days);

    const { error } = await supabase
      .from('tasks')
      .update({
        due_date: newDate,
        status: 'due',
      })
      .eq('id', task.id);

    if (error) {
      console.error('Error snoozing task:', error);
      showToast('Could not snooze');
      return;
    }

    setTask({ ...task, due_date: newDate, status: 'due' });
    setSnoozeOpen(false);
    showToast(`Snoozed to ${formatShort(newDate)}`);
  };

  const handleDelete = async () => {
    if (!task) return;
    if (deleting) return;

    if (
      !confirm(
        `Delete "${task.title}"? This cannot be undone.`
      )
    ) {
      return;
    }

    setDeleting(true);
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', task.id);
    setDeleting(false);

    if (error) {
      console.error('Error deleting task:', error);
      showToast('Could not delete');
      return;
    }

    navigate('/');
  };

  if (loading || !task) {
    return (
      <Screen>
        <Header title="Task Detail" onBack={() => navigate(-1)} />
        <Skeleton height="32px" width="70%" />
        <div style={{ height: 16 }} />
        <Skeleton height="200px" />
      </Screen>
    );
  }

  const snoozePortal =
    snoozeOpen && typeof document !== 'undefined'
      ? createPortal(
          <>
            <div
              className="sheet-backdrop"
              onClick={() => setSnoozeOpen(false)}
            />
            <div className="sheet">
              <div className="sheet-handle" />
              <h3 className="sheet-title">Snooze until when?</h3>

              <div className="snooze-list">
                {SNOOZE_OPTIONS.map((option) => {
                  const date = addDays(
                    new Date().toISOString().split('T')[0],
                    option.days
                  );
                  return (
                    <button
                      key={option.label}
                      type="button"
                      className="snooze-option"
                      onClick={() => handleSnooze(option.days)}
                    >
                      <span className="snooze-option-label">
                        {option.label}
                      </span>
                      <span className="snooze-option-date">
                        {formatShort(date)}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="sheet-actions">
                <button
                  className="sheet-cancel"
                  onClick={() => setSnoozeOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </>,
          document.body
        )
      : null;

  return (
    <Screen>
      <Header title="Task Detail" onBack={() => navigate(-1)} />

      <motion.div
        className="detail-header"
        animate={
          celebrating && !reduce
            ? { scale: 0.96, opacity: 0.6 }
            : { scale: 1, opacity: 1 }
        }
        transition={{ duration: 0.4, ease: easings.easeOutExpo }}
      >
        <h2 className="detail-title">{task.title}</h2>
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.18,
            duration: 0.35,
            ease: easings.easeOutExpo,
          }}
        >
          <StatusPill
            status={undoPending || celebrating ? 'done' : task.status}
          />
        </motion.div>
      </motion.div>

      <motion.div variants={infoContainer} initial="hidden" animate="show">
        <motion.div
          animate={
            (celebrating || undoPending) && !reduce
              ? { scale: 0.97, opacity: 0.5, filter: 'blur(2px)' }
              : { scale: 1, opacity: 1, filter: 'blur(0px)' }
          }
          transition={{ duration: 0.5, ease: easings.easeOutExpo }}
        >
          <Card className="detail-card">
            <motion.div variants={infoRowVariants} className="info-row">
              <span className="info-label">Appliance</span>
              <span className="info-value">{task.appliance || '—'}</span>
            </motion.div>
            <motion.div variants={infoRowVariants} className="info-row">
              <span className="info-label">Due date</span>
              <span className="info-value">{formatDate(task.due_date)}</span>
            </motion.div>
            <motion.div variants={infoRowVariants} className="info-row">
              <span className="info-label">Repeat</span>
              <span className="info-value">
                {REPEAT_LABELS[task.repeat] ?? task.repeat}
              </span>
            </motion.div>
            <motion.div variants={infoRowVariants} className="info-row">
              <span className="info-label">Last completed</span>
              <span className="info-value">
                {task.last_completed ? formatDate(task.last_completed) : 'Never'}
              </span>
            </motion.div>
          </Card>
        </motion.div>
      </motion.div>

      {task.notes && (
        <motion.div
          className="section"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: (celebrating || undoPending) ? 0.4 : 1, y: 0 }}
          transition={{
            delay: 0.35,
            duration: 0.45,
            ease: easings.easeOutExpo,
          }}
        >
          <h3 className="section-title">Notes</h3>
          <Card>
            <p className="notes-text">{task.notes}</p>
          </Card>
        </motion.div>
      )}

      <motion.div
        className="action-buttons"
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.45, ease: easings.easeOutExpo }}
      >
        {!celebrating && !undoPending && (
          <>
            <div className="celebration-wrap">
              <motion.div
                animate={{ backgroundColor: '#1F4D3A' }}
                transition={{ type: 'spring', stiffness: 260, damping: 28 }}
                style={{ borderRadius: '12px', overflow: 'hidden' }}
              >
                <button
                  className="btn btn--primary celebration-btn"
                  onClick={markAsDone}
                >
                  Mark as Done
                </button>
              </motion.div>
            </div>

            <Button
              variant="secondary"
              onClick={() => setSnoozeOpen(true)}
            >
              Snooze
            </Button>

            <Button
              variant="secondary"
              onClick={() => navigate(`/detail/${task.id}/edit`)}
            >
              <Icon name="edit" size={16} />
              Edit task
            </Button>
          </>
        )}

        {undoPending && (
          <div className="celebration-wrap">
            <motion.div
              animate={{ backgroundColor: '#2E7D32', scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
              style={{ borderRadius: '12px', overflow: 'hidden' }}
            >
              <button
                className="btn btn--primary celebration-btn"
                disabled
              >
                <AnimatedCheck reduce={reduce} />
                Done
              </button>
            </motion.div>
          </div>
        )}

        {celebrating && !reduce && !undoPending && (
          <>
            <motion.div
              className="celebration-ring"
              initial={{ scale: 0.8, opacity: 0.6 }}
              animate={{ scale: 1.6, opacity: 0 }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
            />
            <motion.div
              className="celebration-ring celebration-ring--delay"
              initial={{ scale: 0.8, opacity: 0.6 }}
              animate={{ scale: 1.6, opacity: 0 }}
              transition={{ duration: 0.9, ease: 'easeOut', delay: 0.12 }}
            />
          </>
        )}

        {celebrating && !undoPending && (
          <div className="celebration-wrap">
            <motion.div
              animate={{ backgroundColor: '#2E7D32', scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
              style={{ borderRadius: '12px', overflow: 'hidden' }}
            >
              <button
                className="btn btn--primary celebration-btn"
                disabled
              >
                <AnimatedCheck reduce={reduce} />
                Done
              </button>
            </motion.div>
          </div>
        )}
      </motion.div>

      {!celebrating && !undoPending && (
        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <button
            className="danger-link"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete task'}
          </button>
        </div>
      )}

      {snoozePortal}

      <Toast
        message={toastMessage}
        visible={toastVisible}
        onHide={() => {
          setToastVisible(false);
          if (!undoPending) {
            navigate('/');
          }
        }}
        actionLabel={undoPending ? 'Undo' : undefined}
        onAction={undoPending ? handleUndo : undefined}
        timeout={undoPending ? 10000 : 2500}
      />
    </Screen>
  );
}