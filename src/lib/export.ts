import { supabase } from './supabase';

export type ExportPayload = {
  exported_at: string;
  account: {
    id: string;
    email: string;
  };
  property: unknown | null;
  appliances: unknown[];
  tasks: unknown[];
  notifications: unknown[];
  notification_preferences: unknown | null;
  push_subscriptions: unknown[];
};

export async function exportUserData(): Promise<{
  error: string | null;
  data?: ExportPayload;
}> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not signed in.' };

  const [
    propertyRes,
    appliancesRes,
    tasksRes,
    notificationsRes,
    prefsRes,
    pushRes,
  ] = await Promise.all([
    supabase.from('properties').select('*'),
    supabase.from('appliances').select('*'),
    supabase.from('tasks').select('*'),
    supabase.from('notifications').select('*'),
    supabase.from('notification_preferences').select('*').maybeSingle(),
    supabase
      .from('push_subscriptions')
      .select('id, user_agent, created_at, last_used_at'),
  ]);

  const payload: ExportPayload = {
    exported_at: new Date().toISOString(),
    account: {
      id: user.id,
      email: user.email ?? '',
    },
    property: propertyRes.data?.[0] ?? null,
    appliances: appliancesRes.data ?? [],
    tasks: tasksRes.data ?? [],
    notifications: notificationsRes.data ?? [],
    notification_preferences: prefsRes.data ?? null,
    push_subscriptions: pushRes.data ?? [],
  };

  return { error: null, data: payload };
}

export function downloadJson(payload: ExportPayload, filename: string) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}