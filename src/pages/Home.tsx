import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, animate, useReducedMotion } from 'motion/react';
import Screen from '../components/Screen';
import Header from '../components/Header';
import Card from '../components/Card';
import TaskRow from '../components/TaskRow';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import Toast from '../components/Toast';
import NotificationBell from '../components/NotificationBell';
import OverdueBanner from '../components/OverdueBanner';
import ScoreRing, { scoreColor } from '../components/ScoreRing';
import { supabase } from '../lib/supabase';
import { useAuth, HelpLevel } from '../lib/auth';
import { easings } from '../lib/motion';
import { Appliance, Property, Task, CATEGORY_LABELS } from '../lib/types';
import { CATEGORY_ICON_NAMES, Icon, IconName } from '../lib/icons';
import {
  computeNotifications,
  getOrCreatePreferences,
} from '../lib/notifications';
import { computeHealthReport } from '../lib/health';
import { Suggestion, getSuggestionsForCategory } from '../lib/suggestions';

type ViewState = 'loading' | 'error' | 'empty' | 'populated';

const WELCOME_KEY = 'hearth.welcome.dismissed.v1';

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

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

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

type NextAction = {
  label: string;
  tone: 'warning' | 'error' | 'info' | 'success';
};

function getApplianceNextAction(
  appliance: Appliance,
  tasks: Task[]
): NextAction {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const openTasks = tasks.filter(
    (t) => t.appliance_id === appliance.id && t.status !== 'done'
  );

  // Priority 1: overdue tasks
  const overdue = openTasks.find(
    (t) => new Date(t.due_date).getTime() < now.getTime()
  );
  if (overdue) {
    const days = Math.ceil(
      (now.getTime() - new Date(overdue.due_date).getTime()) / 86400000
    );
    return { label: `${days}d overdue`, tone: 'error' };
  }

  // Priority 2: next task due soon
  const nextTask = openTasks[0];
  if (nextTask) {
    const days = Math.ceil(
      (new Date(nextTask.due_date).getTime() - now.getTime()) / 86400000
    );
    if (days <= 7) {
      return {
        label: days === 0 ? 'Due today' : `Due in ${days}d`,
        tone: 'warning',
      };
    }
    return {
      label: `Next ${new Date(nextTask.due_date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })}`,
      tone: 'info',
    };
  }

  // Priority 3: warranty
  if (appliance.warranty_expires_at) {
    const exp = new Date(appliance.warranty_expires_at);
    const days = Math.ceil((exp.getTime() - now.getTime()) / 86400000);
    if (days < 0) return { label: 'Warranty expired', tone: 'error' };
    if (days <= 30) return { label: `${days}d warranty`, tone: 'warning' };
    return { label: 'Under warranty', tone: 'success' };
  }

  // Priority 4: prompt
  return { label: 'Add warranty', tone: 'info' };
}

function ApplianceCard({
  appliance,
  tasks,
}: {
  appliance: Appliance;
  tasks: Task[];
}) {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const categoryIconName: IconName = CATEGORY_ICON_NAMES[appliance.category];
  const next = getApplianceNextAction(appliance, tasks);

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
      <div className={`appliance-next appliance-next--${next.tone}`}>
        {next.label}
      </div>
    </motion.div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { helpLevel, user, displayName } = useAuth();
  const reduce = useReducedMotion();
  const [state, setState] = useState<ViewState>('loading');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [property, setProperty] = useState<Property | null>(null);
  const [propertyName, setPropertyName] = useState<string | null>(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [overdueCount, setOverdueCount] = useState(0);
  const [addingSuggestion, setAddingSuggestion] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [welcomeDismissed, setWelcomeDismissed] = useState(true);

  useEffect(() => {
    setWelcomeDismissed(Boolean(localStorage.getItem(WELCOME_KEY)));
  }, []);

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
        .select('*')
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
    const propertyData = (propertyRes.data as Property) ?? null;

    setTasks(tasksData);
    setAppliances(appliancesData);
    setProperty(propertyData);
    setPropertyName(propertyData?.nickname ?? null);

    const notifications = computeNotifications(
      tasksData,
      appliancesData,
      prefs
    );
    setNotificationCount(notifications.length);
    setOverdueCount(
      notifications.filter((n) => n.severity === 'error').length
    );

    if (tasksData.length === 0) {
      setState('empty');
      return;
    }

    setTimeout(() => setState('populated'), 180);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
  };

  const dismissWelcome = () => {
    localStorage.setItem(WELCOME_KEY, '1');
    setWelcomeDismissed(true);
  };

  const handleAddSuggestion = async (
    suggestion: Suggestion,
    appliance: Appliance
  ) => {
    if (!user) return;
    if (addingSuggestion) return;
    setAddingSuggestion(suggestion.id);

    const today = new Date().toISOString().split('T')[0];
    const dueDate = addDays(today, suggestion.dueInDays);

    const { error } = await supabase.from('tasks').insert({
      user_id: user.id,
      title: suggestion.title,
      appliance_id: appliance.id,
      appliance: appliance.name,
      due_date: dueDate,
      repeat: suggestion.repeat,
      status: 'due',
    });

    setAddingSuggestion(null);

    if (error) {
      console.error('Error adding suggestion:', error);
      showToast('Could not add task');
      return;
    }

    dismissWelcome();
    showToast('Task added');
    await fetchAll();
  };

  const activeCount = tasks.filter((t) => t.status !== 'done').length;
  const emptyCopy = EMPTY_COPY[helpLevel];

  const greetingName = displayName?.trim() || 'there';
  const greeting = `Good morning, ${greetingName}`;

  const applianceById = Object.fromEntries(appliances.map((a) => [a.id, a]));

  const taskIcon = (task: Task): IconName => {
    if (task.appliance_id && applianceById[task.appliance_id]) {
      return CATEGORY_ICON_NAMES[applianceById[task.appliance_id].category];
    }
    return 'wrench';
  };

  const health = computeHealthReport(property, appliances, tasks);
  const healthColor = scoreColor(health.total);

  const dataPoints = appliances.length + tasks.length;
  const showHealthScore = dataPoints >= 3;

  const showSuggestions = state === 'empty' && appliances.length > 0;
  const suggestions: { suggestion: Suggestion; appliance: Appliance }[] = [];
  if (showSuggestions) {
    const seenTitles = new Set<string>();
    for (const appliance of appliances.slice(0, 3)) {
      const categorySuggestions = getSuggestionsForCategory(appliance.category);
      for (const s of categorySuggestions) {
        if (!seenTitles.has(s.title)) {
          seenTitles.add(s.title);
          suggestions.push({ suggestion: s, appliance });
        }
      }
    }
  }

  // Show the welcome hint if user is fresh (< 2 data points) and hasn't dismissed
  const isFresh = dataPoints < 2;
  const showWelcomeCard = !welcomeDismissed && isFresh && state !== 'loading';

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
          initial={reduce ? false : { opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: easings.easeOutExpo }}
        >
          <Icon name="home" size={14} strokeWidth={2.2} />
          <span className="home-context-name">{propertyName}</span>
        </motion.div>
      )}

      {showWelcomeCard && (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: easings.easeOutExpo }}
        >
          <Card className="home-welcome">
            <button
              className="home-welcome-close"
              onClick={dismissWelcome}
              aria-label="Dismiss"
              type="button"
            >
              <Icon name="close" size={16} />
            </button>
            <div className="home-welcome-title">
              Hearth gets useful fast
            </div>
            <div className="home-welcome-sub">
              Start with one of these — takes less than a minute.
            </div>
            <div className="home-welcome-actions">
              <button
                className="home-welcome-action"
                onClick={() => navigate('/appliance/new')}
                type="button"
              >
                <span className="home-welcome-action-icon">
                  <Icon name="appliance" size={18} />
                </span>
                <span>Add an appliance</span>
                <Icon name="chevronRight" size={16} />
              </button>
              <button
                className="home-welcome-action"
                onClick={() => navigate('/add')}
                type="button"
              >
                <span className="home-welcome-action-icon">
                  <Icon name="add" size={18} />
                </span>
                <span>Add a task</span>
                <Icon name="chevronRight" size={16} />
              </button>
              <button
                className="home-welcome-action"
                onClick={() => navigate('/health')}
                type="button"
              >
                <span className="home-welcome-action-icon">
                  <Icon name="sparkles" size={18} />
                </span>
                <span>See Home Health</span>
                <Icon name="chevronRight" size={16} />
              </button>
            </div>
          </Card>
        </motion.div>
      )}

      {showHealthScore && (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.45,
            ease: easings.easeOutExpo,
            delay: reduce ? 0 : 0.05,
          }}
        >
          <Card
            className="health-preview"
            onClick={() => navigate('/health')}
            style={{ borderLeft: `3px solid ${healthColor}` }}
          >
            <ScoreRing
              score={health.total}
              size={56}
              strokeWidth={6}
              showNumber={false}
            />
            <div className="health-preview-body">
              <div className="health-preview-eyebrow">HOME HEALTH</div>
              <div
                className="health-preview-title"
                style={{ color: healthColor }}
              >
                {health.categoryLabel}
              </div>
              <div className="health-preview-sub">{health.total} / 100</div>
            </div>
            <Icon name="chevronRight" size={20} />
          </Card>
          <p className="health-explainer">
            Improves as you add appliances, track warranties, and complete
            tasks.
          </p>
        </motion.div>
      )}

      {!showHealthScore && !showWelcomeCard && (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.45,
            ease: easings.easeOutExpo,
            delay: reduce ? 0 : 0.05,
          }}
        >
          <Card className="health-starting" onClick={() => navigate('/health')}>
            <div className="health-starting-icon">
              <Icon name="sparkles" size={22} />
            </div>
            <div className="health-starting-body">
              <div className="health-starting-eyebrow">HOME HEALTH</div>
              <div className="health-starting-title">Just getting started</div>
              <div className="health-starting-sub">
                Add a few appliances and tasks to unlock your home's score.
              </div>
            </div>
            <Icon name="chevronRight" size={20} />
          </Card>
          <p className="health-explainer">
            Home Health goes up as you add appliances, track warranties, and
            complete tasks.
          </p>
        </motion.div>
      )}

      {state === 'loading' && (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, ease: easings.easeOutExpo }}
        >
          <Card className="summary-card" style={{ marginTop: 16 }}>
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

      {state === 'empty' && !showSuggestions && !showWelcomeCard && (
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

      {state === 'empty' && showSuggestions && !showWelcomeCard && (
        <motion.div
          key="suggestions"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: easings.easeOutExpo }}
        >
          <div className="section">
            <h2 className="section-title">Start with these</h2>
            <p className="section-sub">
              Common tasks for the appliances you added. Tap to add.
            </p>
            <div className="suggestions-list">
              {suggestions.map((item, i) => (
                <motion.div
                  key={`${item.appliance.id}-${item.suggestion.id}`}
                  initial={reduce ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    ease: easings.easeOutExpo,
                    delay: reduce ? 0 : i * 0.06,
                  }}
                >
                  <Card
                    className="suggestion-card"
                    onClick={() =>
                      handleAddSuggestion(item.suggestion, item.appliance)
                    }
                    style={{
                      opacity:
                        addingSuggestion === item.suggestion.id ? 0.5 : 1,
                      pointerEvents: addingSuggestion ? 'none' : 'auto',
                    }}
                  >
                    <div className="suggestion-icon">
                      <Icon name={item.suggestion.icon} size={20} />
                    </div>
                    <div className="suggestion-info">
                      <div className="suggestion-title">
                        {item.suggestion.title}
                      </div>
                      <div className="suggestion-reason">
                        {item.suggestion.reason}
                      </div>
                    </div>
                    <div className="suggestion-add">
                      <Icon name="add" size={16} strokeWidth={2.4} />
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="section">
            <button
              className="section-action"
              onClick={() => navigate('/add')}
            >
              Or add your own task →
            </button>
          </div>
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
              <motion.div
                variants={listContainer}
                initial="hidden"
                animate="show"
              >
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
              <ApplianceCard key={a.id} appliance={a} tasks={tasks} />
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
              <div className="empty-appliance-title">
                Add your first appliance
              </div>
              <div className="empty-appliance-sub">
                Track maintenance, warranties, and service history.
              </div>
            </div>
            <Icon name="chevronRight" size={20} />
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