import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import Screen from '../components/Screen';
import Header from '../components/Header';
import Card from '../components/Card';
import Skeleton from '../components/Skeleton';
import { useAuth } from '../lib/auth';
import { easings } from '../lib/motion';
import {
  NotificationPreferences as Prefs,
  getOrCreatePreferences,
  updatePreferences,
} from '../lib/notifications';

function Toggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  const reduce = useReducedMotion();
  return (
    <button
      type="button"
      className={`toggle ${value ? 'toggle--on' : ''}`}
      onClick={() => onChange(!value)}
      aria-pressed={value}
    >
      <motion.div
        className="toggle-knob"
        animate={{ x: value ? 20 : 0 }}
        transition={
          reduce
            ? { duration: 0 }
            : { type: 'spring', stiffness: 500, damping: 32 }
        }
      />
    </button>
  );
}

export function NotificationPreferences() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const reduce = useReducedMotion();

  const [loading, setLoading] = useState(true);
  const [prefs, setPrefs] = useState<Prefs | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const p = await getOrCreatePreferences(user.id);
      setPrefs(p);
      setLoading(false);
    })();
  }, [user]);

  const update = (patch: Partial<Prefs>) => {
    if (!prefs || !user) return;
    const next = { ...prefs, ...patch };
    setPrefs(next);
    void updatePreferences(user.id, patch);
  };

  if (loading || !prefs) {
    return (
      <Screen>
        <Header title="Notifications" onBack={() => navigate('/profile')} />
        <Skeleton height="72px" />
        <div style={{ height: 12 }} />
        <Skeleton height="72px" />
      </Screen>
    );
  }

  return (
    <Screen>
      <Header title="Notifications" onBack={() => navigate('/profile')} />

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: easings.easeOutExpo }}
      >
        <Card>
          <div className="pref-row">
            <div className="pref-row-text">
              <div className="pref-row-title">Due date reminders</div>
              <div className="pref-row-desc">Remind me before tasks are due</div>
            </div>
            <Toggle
              value={prefs.due_date_reminders}
              onChange={(v) => update({ due_date_reminders: v })}
            />
          </div>

          {prefs.due_date_reminders && (
            <div className="pref-row pref-row--indent">
              <div className="pref-row-text">
                <div className="pref-row-title">Lead time</div>
                <div className="pref-row-desc">Days before due date</div>
              </div>
              <select
                className="pref-select"
                value={prefs.reminder_lead_days}
                onChange={(e) =>
                  update({ reminder_lead_days: parseInt(e.target.value) })
                }
              >
                <option value={1}>1 day</option>
                <option value={3}>3 days</option>
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
              </select>
            </div>
          )}

          <div className="pref-row">
            <div className="pref-row-text">
              <div className="pref-row-title">Overdue alerts</div>
              <div className="pref-row-desc">Tell me when tasks slip past due</div>
            </div>
            <Toggle
              value={prefs.overdue_alerts}
              onChange={(v) => update({ overdue_alerts: v })}
            />
          </div>

          <div className="pref-row">
            <div className="pref-row-text">
              <div className="pref-row-title">Warranty expiry</div>
              <div className="pref-row-desc">Alert me before warranties lapse</div>
            </div>
            <Toggle
              value={prefs.warranty_expiry}
              onChange={(v) => update({ warranty_expiry: v })}
            />
          </div>

          <div className="pref-row">
            <div className="pref-row-text">
              <div className="pref-row-title">Weekly digest</div>
              <div className="pref-row-desc">Sunday summary of what's coming up</div>
            </div>
            <Toggle
              value={prefs.weekly_digest}
              onChange={(v) => update({ weekly_digest: v })}
            />
          </div>
        </Card>

        <div className="pref-note">
          <div className="pref-note-icon">📱</div>
          <div className="pref-note-text">
            <strong>Push notifications coming soon.</strong> Right now these settings
            control what appears in your in-app notification center. When we launch
            on the app stores, you'll get real reminders on your phone.
          </div>
        </div>
      </motion.div>
    </Screen>
  );
}

export default NotificationPreferences;