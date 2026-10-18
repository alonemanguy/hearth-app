import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import Screen from '../components/Screen';
import Header from '../components/Header';
import Card from '../components/Card';
import Toast from '../components/Toast';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { Task } from '../lib/types';
import { Icon } from '../lib/icons';
import { easings } from '../lib/motion';

export default function Completed() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const reduce = useReducedMotion();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [toastTone, setToastTone] = useState<'default' | 'error'>('default');
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    if (!user) return;
    void fetchCompleted();
  }, [user]);

  const fetchCompleted = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('status', 'done')
      .order('last_completed', { ascending: false });

    if (error) {
      console.error('Error fetching completed tasks:', error);
      setLoading(false);
      return;
    }

    setTasks((data as Task[]) ?? []);
    setLoading(false);
  };

  const showToast = (msg: string, tone: 'default' | 'error' = 'default') => {
    setToastMessage(msg);
    setToastTone(tone);
    setToastVisible(true);
  };

  const handleRestore = async (task: Task) => {
    if (!user) return;
    const { error } = await supabase
      .from('tasks')
      .update({ status: 'due', last_completed: null })
      .eq('id', task.id);

    if (error) {
      console.error('Error restoring task:', error);
      showToast('Could not restore task', 'error');
      return;
    }

    showToast('Task restored');
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
  };

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <Screen>
        <Header title="Completed" onBack={() => navigate(-1)} />
        <Skeleton height="160px" />
      </Screen>
    );
  }

  return (
    <Screen>
      <Header title="Completed" onBack={() => navigate(-1)} />
      {tasks.length === 0 ? (
        <EmptyState
          icon="check"
          title="No completed tasks yet"
          body="When you mark a task done, it'll appear here."
          ctaLabel="Back to home"
          onCta={() => navigate('/')}
        />
      ) : (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: easings.easeOutExpo }}
          className="section"
        >
          <h2 className="section-title">Completed tasks</h2>
          <Card>
            {tasks.map((task) => (
              <motion.div
                key={task.id}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: reduce ? 0 : 0.02 }}
                className="task-row"
              >
                <div className="task-icon">
                  <Icon name="check" size={20} />
                </div>
                <div className="task-info">
                  <div className="task-title">{task.title}</div>
                  <div className="task-subtitle">
                    Completed {formatDate(task.last_completed)}
                  </div>
                </div>
                <button
                  type="button"
                  className="row-action"
                  onClick={() => void handleRestore(task)}
                >
                  Restore
                </button>
              </motion.div>
            ))}
          </Card>
        </motion.div>
      )}
      <Toast
        message={toastMessage}
        visible={toastVisible}
        tone={toastTone}
        onHide={() => setToastVisible(false)}
      />
    </Screen>
  );
}
