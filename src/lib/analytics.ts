import posthog from 'posthog-js';

let initialized = false;

export function initAnalytics() {
  if (initialized || typeof window === 'undefined') return;
  const phKey = import.meta.env.VITE_POSTHOG_KEY;
  const phHost = import.meta.env.VITE_POSTHOG_HOST;
  if (!phKey || !phHost) return;
  posthog.init(phKey, { api_host: phHost });
  initialized = true;
}

export function track(event: string, properties?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  posthog.capture(event, properties);
}

export function identify(userId: string, properties?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  posthog.identify(userId, properties);
}

export const analytics = { init: initAnalytics, track, identify };