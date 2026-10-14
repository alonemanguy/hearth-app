import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import Screen from '../components/Screen';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import Skeleton from '../components/Skeleton';
import Toast from '../components/Toast';
import { useAuth } from '../lib/auth';
import { easings } from '../lib/motion';
import {
  NotificationPreferences as Prefs,
  getOrCreatePreferences,
  updatePreferences,
} from '../lib/notifications';
import {
  isPushSupported,
  getPermission,
  isSubscribed,
  subscribeToPush,
  unsubscribeFromPush,
} from '../lib/push';
import { Icon } from '../lib/icons';

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

export default function NotificationPreferences() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const reduce = useReducedMotion();

  const [loading, setLoading] = useState(true);
  const [prefs, setPrefs] = useState<Prefs | null>(null);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);
  const [pushError, setPushError] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);

  const pushSupported = isPushSupported();

  useEffect(() => {
    if (!user) return;
    (async () => {
      const p = await getOrCreatePreferences(user.id);
      setPrefs(p);
      const subbed = await isSubscribed();
      setPushEnabled(subbed);
      setLoading(false);
    })();
  }, [user]);

  const update = (patch: Partial<Prefs>) => {
    if (!prefs || !user) return;
    const next = { ...prefs, ...patch };
    setPrefs(next);
    void updatePreferences(user.id, patch);
  };

  const handleEnablePush = async () => {
    setPushError(null);
    setPushBusy(true);
    const { error } = await subscribeToPush();
    setPushBusy(false);
    if (error) {
      setPushError(error);
      return;
    }
    setPushEnabled(true);
    setToastVisible(true);
  };

  const handleDisablePush = async () => {
    setPushBusy(true);
    await unsubscribeFromPush();
    setPushBusy(false);
    setPushEnabled(false);
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

  const permission = getPermission();

  return (
    <Screen>
      <Header title="Notifications" onBack={() => navigate('/profile')} />

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: easings.easeOutExpo }}
      >
        {pushSupported ? (
          <Card className="push-card">
            <div className="push-card-header">
              <div className="push-card-icon">
                <Icon name="phone" size={22} />
              </div>
              <div className="push-card-text">
                <div className="push-card-title">Push notifications</div>
                <div className="push-card-desc">
                  {pushEnabled
                    ? "You'll get reminders on this device."
                    : 'Get reminders on your phone even when Hearth is closed.'}
                </div>
              </div>
            </div>

            {pushError && (
              <div
                className="auth-error"
                role="alert"
                style={{ marginTop: 12 }}
              >
                {pushError}
              </div>
            )}

            {permission === 'denied' && !pushEnabled && (
              <p className="input-hint" style={{ marginTop: 12 }}>
                Notifications are blocked in your browser. Enable them in your
                browser settings, then try again.
              </p>
            )}

            <div style={{ marginTop: 16 }}>
              {pushEnabled ? (
                <Button
                  variant="secondary"
                  onClick={handleDisablePush}
                  disabled={pushBusy}
                >
                  {pushBusy ? 'Disabling...' : 'Disable push'}
                </Button>
              ) : (
                <Button onClick={handleEnablePush} disabled={pushBusy}>
                  {pushBusy ? 'Enabling...' : 'Enable push notifications'}
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <Card className="push-card">
            <div className="push-card-header">
              <div className="push-card-icon">
                <Icon name="desktop" size={22} />
              </div>
              <div className="push-card-text">
                <div className="push-card-title">Push not supported here</div>
                <div className="push-card-desc">
                  Add Hearth to your home screen for the best experience —
                  you'll get real reminders on supported devices.
                </div>
              </div>
            </div>
          </Card>
        )}

        <Card style={{ marginTop: 16 }}>
          <div className="pref-row">
            <div className="pref-row-text">
              <div className="pref-row-title">Due date reminders</div>
              <div className="pref-row-desc">
                Remind me before tasks are due
              </div>
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
              <div className="pref-row-desc">
                Tell me when tasks slip past due
              </div>
            </div>
            <Toggle
              value={prefs.overdue_alerts}
              onChange={(v) => update({ overdue_alerts: v })}
            />
          </div>

          <div className="pref-row">
            <div className="pref-row-text">
              <div className="pref-row-title">Warranty expiry</div>
              <div className="pref-row-desc">
                Alert me before warranties lapse
              </div>
            </div>
            <Toggle
              value={prefs.warranty_expiry}
              onChange={(v) => update({ warranty_expiry: v })}
            />
          </div>

          <div className="pref-row">
            <div className="pref-row-text">
              <div className="pref-row-title">Weekly digest</div>
              <div className="pref-row-desc">
                Sunday summary of what's coming up
              </div>
            </div>
            <Toggle
              value={prefs.weekly_digest}
              onChange={(v) => update({ weekly_digest: v })}
            />
          </div>
        </Card>
      </motion.div>

      <Toast
        message="Push notifications enabled"
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />
    </Screen>
  );
}