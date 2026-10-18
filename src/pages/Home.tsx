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
import FeatureTour from '../components/FeatureTour';
import { supabase } from '../lib/supabase';
import { useAuth, HelpLevel } from '../lib/auth';
import { easings } from '../lib/motion';
import { Appliance, Property, Task, CATEGORY_LABELS } from '../lib/types';
import { CATEGORY_ICON_NAMES, CATEGORY_ICONS, Icon, IconName } from '../lib/icons';
import {
  computeNotifications,
  getOrCreatePreferences,
} from '../lib/notifications';
import { computeHealthReport } from '../lib/health';
import {
  Suggestion,
  SeasonalTask,
  getSuggestionsForCategory,
  getCommonApplianceSuggestions,
  getMonthlyFocus,
  getSeasonalChecklist,
  hasAnyWarrantyDocs,
  getSeason,
  seasonLabel,
} from '../lib/suggestions';

type ViewState = 'loading' | 'error' | 'empty' | 'populated';

const WELCOME_KEY = 'hearth.welcome.dismissed.v1';
const TOUR_KEY = 'hearth.tour.seen.v1';

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

  const overdue = openTasks.find(
    (t) => new Date(t.due_date).getTime() < now.getTime()
  );
  if (overdue) {
    const days = Math.ceil(
      (now.getTime() - new Date(overdue.due_date).getTime()) / 86400000
    );
    return { label: `${days}d overdue`, tone: 'error' };
  }

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

  if (appliance.warranty_expires_at) {
    const exp = new Date(appliance.warranty_expires_at);
    const days = Math.ceil((exp.getTime() - now.getTime()) / 86400000);
    if (days < 0) return { label: 'Warranty expired', tone: 'error' };
    if (days <= 30) return { label: `${days}d warranty`, tone: 'warning' };
    return { label: 'Under warranty', tone: 'success' };
  }

  return { label: 'Add warranty', tone: 'info' };
}

function getApplianceSubtitle(appliance: Appliance): string {
  const make = appliance.make?.trim();
  const model = appliance.model?.trim();
  if (make && model) return `${make} · ${model}`;
  if (make) return make;
  if (model) return model;
  return CATEGORY_LABELS[appliance.category];
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
  const subtitle = getApplianceSubtitle(appliance);

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
      <div className="appliance-subtitle">{subtitle}</div>
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
  const [addingSeasonal, setAddingSeasonal] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [welcomeDismissed, setWelcomeDismissed] = useState(true);
  const [tourSeen, setTourSeen] = useState(true);

  useEffect(() => {
    setWelcomeDismissed(Boolean(localStorage.getItem(WELCOME_KEY)));
    setTourSeen(Boolean(localStorage.getItem(TOUR_KEY)));
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

  const dismissTour = () => {
    localStorage.setItem(TOUR_KEY, '1');
    setTourSeen(true);
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

  const handleAddSeasonal = async (s: SeasonalTask) => {
    if (!user) return;
    if (addingSeasonal) return;
    setAddingSeasonal(s.id);

    const today = new Date().toISOString().split('T')[0];
    const dueDate = addDays(today, 7);

    const { error } = await supabase.from('tasks').insert({
      user_id: user.id,
      title: s.title,
      due_date: dueDate,
      repeat: s.repeat,
      status: 'due',
    });

    setAddingSeasonal(null);

    if (error) {
      console.error('Error adding seasonal task:', error);
      showToast('Could not add task');
      return;
    }

    showToast('Added to your tasks');
    await fetchAll();
  };

  const openCount = tasks.filter((t) => t.status !== 'done').length;
  const weekAhead = Date.now() + 7 * 86400000;
  // The summary card says "due this week", so the number has to mean that:
  // open tasks falling on or before seven days from today, overdue included.
  const activeCount = tasks.filter(
    (t) => t.status !== 'done' && new Date(t.due_date).getTime() <= weekAhead
  ).length;
  const emptyCopy = EMPTY_COPY[helpLevel];

  const greetingName = displayName?.trim() || 'there';
  const hour = new Date().getHours();
  const partOfDay =
    hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
  const greeting = `Good ${partOfDay}, ${greetingName}`;

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

  const suggestionSeeds: { suggestion: Suggestion; appliance: Appliance }[] =
    [];
  if (appliances.length > 0 && openCount < 3) {
    const seenTitles = new Set(tasks.map((t) => t.title.toLowerCase()));
    for (const appliance of appliances.slice(0, 3)) {
      const categorySuggestions = getSuggestionsForCategory(appliance.category);
      for (const s of categorySuggestions) {
        if (!seenTitles.has(s.title.toLowerCase())) {
          seenTitles.add(s.title.toLowerCase());
          suggestionSeeds.push({ suggestion: s, appliance });
        }
      }
    }
  }
  const suggestions = suggestionSeeds.slice(0, 3);

  const isFresh = dataPoints < 2;
  const showWelcomeCard = !welcomeDismissed && isFresh && state !== 'loading';
  const showTour = !tourSeen && state !== 'loading' && !showWelcomeCard;

  const commonAppliances = getCommonApplianceSuggestions(appliances);
  const showApplianceSuggestions =
    appliances.length > 0 &&
    appliances.length < 3 &&
    commonAppliances.length > 0;

  const monthlyFocus =
    state !== 'loading' && appliances.length > 0
      ? getMonthlyFocus(appliances, tasks)
      : [];
  const showMonthlyFocus = monthlyFocus.length > 0 && !showWelcomeCard;

  // Seasonal checklist — show if user has fewer than 3 open tasks (they need direction)
  const seasonalTasks =
    openCount < 3 && state !== 'loading'
      ? getSeasonalChecklist(property?.climate_zone)
      : [];
  const showSeasonal = seasonalTasks.length > 0 && !showWelcomeCard;

  // Warranty vault card — show if any appliance has warranty info
  const showWarrantyVault =
    appliances.length > 0 && hasAnyWarrantyDocs(appliances);

  const currentSeason = getSeason();

  return (
    <Screen>
      <Header
        title={greeting}
        right={<NotificationBell count={notificationCount} />}
      />

      {showTour && <FeatureTour onDone={dismissTour} />}

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
            <div className="home-welcome-title">Start with one</div>
            <div className="home-welcome-sub">
              Add an appliance or a task now. The rest can wait.
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
                  <Icon name="checkCircle" size={18} />
                </span>
                <span>See Home Health</span>
                <Icon name="chevronRight" size={16} />
              </button>
            </div>
          </Card>
        </motion.div>
      )}

      {showMonthlyFocus && (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: easings.easeOutExpo }}
          className="section"
        >
          <h2 className="section-title">This month</h2>
          <div className="monthly-focus-list">
            {monthlyFocus.map((focus, i) => (
              <motion.div
                key={focus.id}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  ease: easings.easeOutExpo,
                  delay: reduce ? 0 : i * 0.06,
                }}
              >
                <Card
                  className={`monthly-focus-card monthly-focus-card--${focus.tone}`}
                  onClick={() => navigate(focus.linkTo)}
                >
                  <div className="monthly-focus-icon">
                    <Icon name={focus.icon} size={20} />
                  </div>
                  <div className="monthly-focus-content">
                    <div className="monthly-focus-title">{focus.title}</div>
                    <div className="monthly-focus-body">{focus.body}</div>
                  </div>
                  <Icon name="chevronRight" size={20} />
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {showWarrantyVault && (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.45,
            ease: easings.easeOutExpo,
            delay: reduce ? 0 : 0.05,
          }}
          className="section"
        >
          <Card
            className="warranty-vault-card"
            onClick={() => navigate('/warranties')}
          >
            <div className="warranty-vault-icon">
              <Icon name="warranty" size={22} />
            </div>
            <div className="warranty-vault-content">
              <div className="warranty-vault-title">Warranty vault</div>
              <div className="warranty-vault-body">
                Track coverage and store warranty PDFs for each appliance.
              </div>
            </div>
            <Icon name="chevronRight" size={20} />
          </Card>
        </motion.div>
      )}

      {showSeasonal && (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.45,
            ease: easings.easeOutExpo,
            delay: reduce ? 0 : 0.08,
          }}
          className="section"
        >
          <h2 className="section-title">
            {seasonLabel(currentSeason)} checklist
          </h2>
          <p className="section-sub">
            Things homes usually need this season. Tap to add.
          </p>
          <div className="seasonal-list">
            {seasonalTasks.map((s, i) => (
              <motion.div
                key={s.id}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  ease: easings.easeOutExpo,
                  delay: reduce ? 0 : i * 0.05,
                }}
              >
                <Card
                  className="seasonal-card"
                  onClick={() => handleAddSeasonal(s)}
                  style={{
                    opacity: addingSeasonal === s.id ? 0.5 : 1,
                    pointerEvents: addingSeasonal ? 'none' : 'auto',
                  }}
                >
                  <div className="seasonal-icon">
                    <Icon name={s.icon} size={20} />
                  </div>
                  <div className="seasonal-info">
                    <div className="seasonal-title">{s.title}</div>
                    <div className="seasonal-reason">{s.reason}</div>
                  </div>
                  <div className="suggestion-add">
                    <Icon name="add" size={16} strokeWidth={2.4} />
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
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
          <Card className="health-preview" onClick={() => navigate('/health')}>
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
              <Icon name="checkCircle" size={22} />
            </div>
            <div className="health-starting-body">
              <div className="health-starting-eyebrow">HOME HEALTH</div>
              <div className="health-starting-title">Not enough to score yet</div>
              <div className="health-starting-sub">
                The score needs at least three items. An appliance, a task, or a
                warranty date all count.
              </div>
            </div>
            <Icon name="chevronRight" size={20} />
          </Card>
          <p className="health-explainer">
            Counts what you have documented, covered, and finished.
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
            <h2 className="section-title">Upcoming tasks</h2>
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

      {state === 'empty' &&
        !showWelcomeCard &&
        !showSeasonal &&
        appliances.length === 0 && (
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
            <h2 className="section-title">Upcoming tasks</h2>
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

      {suggestions.length > 0 && !showWelcomeCard && !showSeasonal && (
        <motion.div
          className="section"
          key="suggestions"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: easings.easeOutExpo }}
        >
          <h2 className="section-title">Suggested tasks</h2>
          <p className="section-sub">
            Tap to add one. You can change the due date later.
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
              My appliances
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

      {showApplianceSuggestions && (
        <motion.div
          className="section"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easings.easeOutExpo, delay: 0.3 }}
        >
          <h2 className="section-title">Common appliances</h2>
          <p className="section-sub">
            Most homes have these. Tap to add one.
          </p>
          <div className="common-appliances">
            {commonAppliances.map((c) => {
              const CategoryIcon = CATEGORY_ICONS[c.category];
              return (
                <button
                  key={c.key}
                  type="button"
                  className="common-appliance-chip"
                  onClick={() =>
                    navigate(`/appliance/new?category=${c.category}`)
                  }
                >
                  <CategoryIcon size={18} strokeWidth={1.8} />
                  <span>{c.label}</span>
                  <Icon name="add" size={14} strokeWidth={2.4} />
                </button>
              );
            })}
          </div>
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