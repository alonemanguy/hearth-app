import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import Screen from '../components/Screen';
import Header from '../components/Header';
import Input from '../components/Input';
import Card from '../components/Card';
import TaskRow from '../components/TaskRow';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { Task, Appliance, CATEGORY_LABELS } from '../lib/types';
import { CATEGORY_ICON_NAMES, Icon } from '../lib/icons';
import { easings } from '../lib/motion';

export default function Search() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const reduce = useReducedMotion();
  const [query, setQuery] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    void fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    const [tasksRes, appliancesRes] = await Promise.all([
      supabase.from('tasks').select('*').order('due_date', { ascending: true }),
      supabase.from('appliances').select('*').order('created_at', { ascending: false }),
    ]);
    setTasks((tasksRes.data as Task[]) ?? []);
    setAppliances((appliancesRes.data as Appliance[]) ?? []);
    setLoading(false);
  };

  const q = query.trim().toLowerCase();
  const filteredTasks = q
    ? tasks.filter((t) => t.title.toLowerCase().includes(q))
    : [];
  const filteredAppliances = q
    ? appliances.filter((a) => a.name.toLowerCase().includes(q))
    : [];

  if (loading) {
    return (
      <Screen>
        <Header title="Search" onBack={() => navigate(-1)} />
        <Skeleton height={56} />
        <div style={{ height: 20 }} />
        <Skeleton height="140px" />
      </Screen>
    );
  }

  return (
    <Screen>
      <Header title="Search" onBack={() => navigate(-1)} />
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: easings.easeOutExpo }}
      >
        <Input
          label="Search tasks and appliances"
          value={query}
          onChange={setQuery}
          placeholder="e.g. HVAC filter, fridge..."
          autoFocus
        />

        {q === '' && (
          <EmptyState
            icon="search"
            title="Find anything at home"
            body="Search by task or appliance name, like 'filter' or 'fridge'."
          />
        )}

        {q !== '' && filteredTasks.length === 0 && filteredAppliances.length === 0 && (
          <EmptyState
            icon="search"
            title="No matches"
            body={`Nothing matches "${query.trim()}". Try a shorter word.`}
          />
        )}

        {filteredTasks.length > 0 && (
          <div className="section">
            <h2 className="section-title">Tasks</h2>
            <Card>
              {filteredTasks.map((t) => (
                <TaskRow
                  key={t.id}
                  id={t.id}
                  icon="task"
                  title={t.title}
                  subtitle={`Due ${new Date(t.due_date).toLocaleDateString(
                    'en-US',
                    { month: 'short', day: 'numeric' }
                  )}`}
                  status={t.status}
                />
              ))}
            </Card>
          </div>
        )}

        {filteredAppliances.length > 0 && (
          <div className="section">
            <h2 className="section-title">Appliances</h2>
            <Card>
              {filteredAppliances.map((a) => (
                <div
                  key={a.id}
                  className="task-row"
                  onClick={() => navigate(`/appliance/${a.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="task-icon">
                    <Icon name={CATEGORY_ICON_NAMES[a.category]} size={20} />
                  </div>
                  <div className="task-info">
                    <div className="task-title">{a.name}</div>
                    <div className="task-subtitle">
                      {CATEGORY_LABELS[a.category]}
                    </div>
                  </div>
                  <Icon name="chevronRight" size={16} className="row-chevron" />
                </div>
              ))}
            </Card>
          </div>
        )}
      </motion.div>
    </Screen>
  );
}
