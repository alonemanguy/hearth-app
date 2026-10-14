import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, animate, useReducedMotion } from 'motion/react';
import Screen from '../components/Screen';
import Header from '../components/Header';
import Card from '../components/Card';
import TaskRow from '../components/TaskRow';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import NotificationBell from '../components/NotificationBell';
import OverdueBanner from '../components/OverdueBanner';
import { supabase } from '../lib/supabase';
import { useAuth, HelpLevel } from '../lib/auth';
import { easings } from '../lib/motion';
import { Appliance, Task } from '../lib/types';
import { CATEGORY_ICON_NAMES, Icon, IconName } from '../lib/icons';
import { computeNotifications, getOrCreatePreferences } from '../lib/notifications';

type ViewState = 'loading' | 'error' | 'empty' | 'populated';

const EMPTY_COPY: Record<HelpLevel, { body: string; cta: string }> = {
  basic: {
    body: 'Add your first task to get started.',
    cta: 'Add task',
  },
  guided: {
    body: 'Add your first task to start staying on top of your home.',
    cta: 'Add your first task',
  },
  detailed: {
    body: 'Add your first task. We\u2019ll track what needs doing, when it\u2019s due, and remind you before it matters.',
    cta: 'Add your first task',
  },
};

const listContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.15 },
  },
};

const listItem = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.42, ease: easings.easeOutExpo },
  },
};

function Odometer({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) {
      setDisplay(value);
      return;
    }
    const controls = animate(0, value, {
      duration: 1.1,
      ease: easings.easeOutExpo,
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [value, reduce]);

  return (
    <motion.div
      className="summary-number"
      key={value}
      initial={reduce ? false : { filter: 'blur(6px)', opacity: 0.4 }}
      animate={{ filter: 'blur(0px)', opacity: 1 }}
      transition={{ duration: 0.45, ease: easings.easeOutExpo }}
    >
      {display}
    </motion.div>
  );
}

function ApplianceCard({ appliance }: { appliance: Appliance }) {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const categoryIconName: IconName = CATEGORY_ICON_NAMES[appliance.category];
  return (
    <motion.div
      className="card appliance-card"
      whileHover={reduce ? undefined : { y: -4, scale: 1.02 }}
      whileTap={reduce ? undefined : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 26 }}
      onClick={() => navigate(`/appliance/${appliance.id}`)}
    >
      <Icon name={categoryIconName} size={28} strokeWidth={1.8} />
      <div className="appliance-name">{appliance.name}</div>
    </motion.div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { helpLevel, user } = useAuth();
  const [state, setState] = useState<ViewState>('loading');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [propertyName, setPropertyName] = useState<string | null>(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [overdueCount, setOverdueCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    void fetchAll();
  }, [user]);

  const fetchAll = async () => {
    if (!user) return;
    setState('loading');

    const [tasksRes, appliancesRes, propertyRes, prefs] = await Promise.all([
      supabase.from('tasks').select('*').order('due_date', { ascending: true }),
      supabase
        .from('appliances')
        .select('*')
        .order('created_at', { ascending: false }),
      supabase
        .from('properties')
        .select('nickname')
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle(),
      getOrCreatePreferences(user.id),
    ]);

    if (tasksRes.error) {
      console.error('Error fetching tasks:', tasksRes.error);
      setState('error');
      return;
    }

    const tasksData = (tasksRes.data as Task[]) ?? [];
    const appliancesData = (appliancesRes.data as Appliance[]) ?? [];

    setTasks(tasksData);
    setAppliances(appliancesData);
    setPropertyName(propertyRes.data?.nickname ?? null);

    const notifications = computeNotifications(tasksData, appliancesData, prefs);
    setNotificationCount(notifications.length);
    setOverdueCount(notifications.filter((n) => n.severity === 'error').length);

    if (tasksData.length === 0) {
      setState('empty');
      return;
    }

    setTimeout(() => setState('populated'), 180);
  };

  const activeCount = tasks.filter((t) => t.status !== 'done').length;
  const emptyCopy = EMPTY_COPY[helpLevel];
  const userName = user?.email?.split('@')[0] ?? 'there';
  const greeting = `Good morning, ${userName}`;

  const applianceById = Object.fromEntries(appliances.map((a) => [a.id, a]));

  const taskIcon = (task: Task): IconName => {
    if (task.appliance_id && applianceById[task.appliance_id]) {
      return CATEGORY_ICON_NAMES[applianceById[task.appliance_id].category];
    }
    return 'wrench';
  };

  return (
    <Screen>
      <Header
        title={greeting}
        right={<NotificationBell count={notificationCount} />}
      />

      {overdueCount > 0 && <OverdueBanner count={overdueCount} />}

      {propertyName && (
        <motion.div
          className="home-context"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: easings.easeOutExpo }}
        >
          <Icon name="home" size={14} strokeWidth={2.2} />
          <span className="home-context-name">{propertyName}</span>
        </motion.div>
      )}

      {state === 'loading' && (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, ease: easings.easeOutExpo }}
        >
          <Card className="summary-card">
            <Skeleton width="60px" height="48px" radius="8px" />
            <div style={{ height: 8 }} />
            <Skeleton width="140px" height="16px" radius="8px" />
          </Card>
          <div className="section">
            <h2 className="section-title">Upcoming Tasks</h2>
            <Card>
              <Skeleton height="56px" />
              <div style={{ height: 12 }} />
              <Skeleton height="56px" />
              <div style={{ height: 12 }} />
              <Skeleton height="56px" />
            </Card>
          </div>
        </motion.div>
      )}

      {state === 'error' && (
        <motion.div
          key="error"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: easings.easeOutExpo }}
        >
          <EmptyState
            icon="alert"
            title="Couldn't load tasks"
            body="Check your connection and try again."
            ctaLabel="Retry"
            onCta={fetchAll}
          />
        </motion.div>
      )}

      {state === 'empty' && (
        <motion.div
          key="empty"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: easings.easeOutExpo }}
        >
          <EmptyState
            icon="home"
            title="No tasks yet"
            body={emptyCopy.body}
            ctaLabel={emptyCopy.cta}
            onCta={() => navigate('/add')}
          />
        </motion.div>
      )}

      {state === 'populated' && (
        <motion.div
          key="populated"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: easings.easeOutExpo }}
        >
          <Card className="summary-card">
            <Odometer value={activeCount} />
            <div className="summary-label">tasks due this week</div>
          </Card>

          <div className="section">
            <h2 className="section-title">Upcoming Tasks</h2>
            <Card>
              <motion.div variants={listContainer} initial="hidden" animate="show">
                {tasks.map((task) => (
                  <motion.div key={task.id} variants={listItem}>
                    <TaskRow
                      id={task.id}
                      icon={taskIcon(task)}
                      title={task.title}
                      subtitle={`Due ${new Date(task.due_date).toLocaleDateString(
                        'en-US',
                        { month: 'short', day: 'numeric' }
                      )}`}
                      status={task.status}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </Card>
          </div>
        </motion.div>
      )}

      {appliances.length > 0 && (
        <motion.div
          className="section"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easings.easeOutExpo, delay: 0.2 }}
        >
          <div className="section-header-row">
            <h2 className="section-title" style={{ marginBottom: 0 }}>
              My Appliances
            </h2>
            <button
              className="section-action"
              onClick={() => navigate('/appliances')}
            >
              See all
            </button>
          </div>
          <div className="appliance-scroll">
            {appliances.map((a) => (
              <ApplianceCard key={a.id} appliance={a} />
            ))}
          </div>
        </motion.div>
      )}

      {appliances.length === 0 && state === 'populated' && (
        <motion.div
          className="section"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easings.easeOutExpo, delay: 0.2 }}
        >
          <h2 className="section-title">My Appliances</h2>
          <Card
            className="empty-appliance-cta"
            onClick={() => navigate('/appliance/new')}
          >
            <div className="empty-appliance-icon">
              <Icon name="appliance" size={22} />
            </div>
            <div className="empty-appliance-text">
              <div className="empty-appliance-title">Add your first appliance</div>
              <div className="empty-appliance-sub">
                Track maintenance, warranties, and service history.
              </div>
            </div>
            <Icon name="chevronRight" size={20} />
          </Card>
        </motion.div>
      )}
    </Screen>
  );
}

export { Home };