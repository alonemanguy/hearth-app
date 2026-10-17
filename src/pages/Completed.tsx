import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import Screen from '../components/Screen';
import Header from '../components/Header';
import Card from '../components/Card';
import Toast from '../components/Toast';
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
      .order('last_completed', { ascending: false })
      .maybeSingle();

    if (error) {
      console.error('Error fetching completed tasks:', error);
      setLoading(false);
      return;
    }

    setTasks((data as Task[]) ?? []);
    setLoading(false);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
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
      showToast('Could not restore task');
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
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
        </div>
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
          className="p-4"
        >
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Completed tasks
          </h2>
          <Card>
            {tasks.map((task) => (
              <motion.div
                key={task.id}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: reduce ? 0 : 0.02 }}
                className="flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <Icon name="check" size={18} className="text-green-500" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {task.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      Completed {formatDate(task.last_completed)}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRestore(task)}
                  className="text-xs text-green-600 hover:text-green-800 font-medium px-2 py-1"
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
        onHide={() => setToastVisible(false)}
      />
    </Screen>
  );
}