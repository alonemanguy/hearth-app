import posthog from 'posthog-js';

const CONSENT_KEY = 'hearth.cookie_consent.v1';

let initialized = false;

function getConsent(): 'accepted' | 'essential-only' | null {
  if (typeof window === 'undefined') return null;
  const val = localStorage.getItem(CONSENT_KEY);
  return (val === 'accepted' || val === 'essential-only') ? val : null;
}

export function initAnalytics() {
  if (initialized || typeof window === 'undefined') return;
  const consent = getConsent();
  if (consent !== 'accepted') return;
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