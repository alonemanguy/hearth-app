import { supabase } from './supabase';
import { Task, Appliance } from './types';

export type NotificationType =
  | 'overdue'
  | 'due_soon'
  | 'warranty_expired'
  | 'warranty_expiring';

export type AppNotification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  linkTo: string;
  severity: 'error' | 'warning' | 'info';
};

export type NotificationPreferences = {
  id: string;
  user_id: string;
  due_date_reminders: boolean;
  reminder_lead_days: number;
  overdue_alerts: boolean;
  warranty_expiry: boolean;
  weekly_digest: boolean;
  created_at: string;
  updated_at: string;
};

const DEFAULT_PREFS = {
  due_date_reminders: true,
  reminder_lead_days: 3,
  overdue_alerts: true,
  warranty_expiry: true,
  weekly_digest: false,
};

export async function getOrCreatePreferences(
  userId: string
): Promise<NotificationPreferences> {
  const { data, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching prefs:', error);
  }

  if (data) return data as NotificationPreferences;

  const { data: inserted, error: insertError } = await supabase
    .from('notification_preferences')
    .insert({ user_id: userId, ...DEFAULT_PREFS })
    .select()
    .single();

  if (insertError || !inserted) {
    console.error('Error creating prefs:', insertError);
    return {
      id: 'temp',
      user_id: userId,
      ...DEFAULT_PREFS,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  return inserted as NotificationPreferences;
}

export async function updatePreferences(
  userId: string,
  patch: Partial<NotificationPreferences>
) {
  const { error } = await supabase
    .from('notification_preferences')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('user_id', userId);
  if (error) console.error('Error updating prefs:', error);
}

function startOfDay(d: Date): number {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy.getTime();
}

export function computeNotifications(
  tasks: Task[],
  appliances: Appliance[],
  prefs: NotificationPreferences
): AppNotification[] {
  const out: AppNotification[] = [];
  const today = startOfDay(new Date());

  if (prefs.overdue_alerts) {
    tasks.forEach((t) => {
      if (t.status === 'done') return;
      const due = startOfDay(new Date(t.due_date));
      if (due < today) {
        const days = Math.round((today - due) / 86400000);
        out.push({
          id: `overdue-${t.id}`,
          type: 'overdue',
          title: t.title,
          body: `Overdue by ${days} day${days === 1 ? '' : 's'}`,
          linkTo: `/detail/${t.id}`,
          severity: 'error',
        });
      }
    });
  }

  if (prefs.due_date_reminders) {
    tasks.forEach((t) => {
      if (t.status === 'done') return;
      const due = startOfDay(new Date(t.due_date));
      const days = Math.round((due - today) / 86400000);
      if (days >= 0 && days <= prefs.reminder_lead_days) {
        out.push({
          id: `due-${t.id}`,
          type: 'due_soon',
          title: t.title,
          body: days === 0 ? 'Due today' : `Due in ${days} day${days === 1 ? '' : 's'}`,
          linkTo: `/detail/${t.id}`,
          severity: 'warning',
        });
      }
    });
  }

  if (prefs.warranty_expiry) {
    appliances.forEach((a) => {
      if (!a.warranty_expires_at) return;
      const exp = startOfDay(new Date(a.warranty_expires_at));
      const days = Math.round((exp - today) / 86400000);
      if (days < 0) {
        out.push({
          id: `warranty-exp-${a.id}`,
          type: 'warranty_expired',
          title: `${a.name} warranty`,
          body: `Expired ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} ago`,
          linkTo: `/appliance/${a.id}`,
          severity: 'error',
        });
      } else if (days <= 30) {
        out.push({
          id: `warranty-${a.id}`,
          type: 'warranty_expiring',
          title: `${a.name} warranty`,
          body: `${days} day${days === 1 ? '' : 's'} left`,
          linkTo: `/appliance/${a.id}`,
          severity: 'warning',
        });
      }
    });
  }

  out.sort((a, b) => {
    const order = { error: 0, warning: 1, info: 2 };
    return order[a.severity] - order[b.severity];
  });

  return out;
}