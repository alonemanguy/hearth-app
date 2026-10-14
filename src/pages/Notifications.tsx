import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import Screen from '../components/Screen';
import Header from '../components/Header';
import Card from '../components/Card';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { easings } from '../lib/motion';
import { Task, Appliance } from '../lib/types';
import {
  AppNotification,
  computeNotifications,
  getOrCreatePreferences,
} from '../lib/notifications';
import { Icon, SEVERITY_ICON_NAMES } from '../lib/icons';

export default function Notifications() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const reduce = useReducedMotion();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<AppNotification[]>([]);

  useEffect(() => {
    if (!user) return;
    void load();
  }, [user]);

  const load = async () => {
    if (!user) return;
    setLoading(true);

    const prefs = await getOrCreatePreferences(user.id);

    const [tasksRes, appliancesRes] = await Promise.all([
      supabase.from('tasks').select('*').neq('status', 'done'),
      supabase.from('appliances').select('*'),
    ]);

    const notifications = computeNotifications(
      (tasksRes.data as Task[]) ?? [],
      (appliancesRes.data as Appliance[]) ?? [],
      prefs
    );

    setItems(notifications);
    setLoading(false);
  };

  if (loading) {
    return (
      <Screen>
        <Header title="Notifications" onBack={() => navigate('/')} />
        <Skeleton height="72px" />
        <div style={{ height: 12 }} />
        <Skeleton height="72px" />
        <div style={{ height: 12 }} />
        <Skeleton height="72px" />
      </Screen>
    );
  }

  if (items.length === 0) {
    return (
      <Screen>
        <Header title="Notifications" onBack={() => navigate('/')} />
        <EmptyState
          icon="sparkles"
          title="All caught up"
          body="No tasks need your attention right now. We'll let you know when something's due."
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <Header title="Notifications" onBack={() => navigate('/')} />

      <motion.div
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, ease: easings.easeOutExpo }}
      >
        {items.map((n, i) => (
          <motion.div
            key={n.id}
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              ease: easings.easeOutExpo,
              delay: reduce ? 0 : i * 0.05,
            }}
            style={{ marginBottom: 12 }}
          >
            <Card
              className={`notification-item notification-item--${n.severity}`}
              onClick={() => navigate(n.linkTo)}
            >
              <div className="notification-item-icon">
                <Icon name={SEVERITY_ICON_NAMES[n.severity]} size={18} />
              </div>
              <div className="notification-item-content">
                <div className="notification-item-title">{n.title}</div>
                <div className="notification-item-body">{n.body}</div>
              </div>
              <Icon name="chevronRight" size={20} style={{ color: '#6B6B6B' }} />
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </Screen>
  );
}