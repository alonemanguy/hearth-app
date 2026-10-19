// posthog-js is the largest optional dependency in the app, so it is loaded on
// demand instead of at startup. It only has a reason to exist once a visitor has
// accepted analytics cookies, which is also what the privacy policy promises.
type PostHogClient = typeof import('posthog-js').default;

const CONSENT_KEY = 'hearth.cookie_consent.v1';

let client: PostHogClient | null = null;
let initialized = false;
let loading = false;

// Events fired while the chunk is still downloading are replayed in order, so
// deferring the load does not drop the start of a session.
const pending: Array<() => void> = [];

function queue(replay: () => void) {
  if (!loading || pending.length >= 50) return;
  pending.push(replay);
}

function getConsent(): 'accepted' | 'essential-only' | null {
  if (typeof window === 'undefined') return null;
  const val = localStorage.getItem(CONSENT_KEY);
  return (val === 'accepted' || val === 'essential-only') ? val : null;
}

export function initAnalytics() {
  if (initialized || loading || typeof window === 'undefined') return;
  const consent = getConsent();
  if (consent !== 'accepted') return;
  const phKey = import.meta.env.VITE_POSTHOG_KEY;
  const phHost = import.meta.env.VITE_POSTHOG_HOST;
  if (!phKey || !phHost) return;
  loading = true;
  void import('posthog-js')
    .then((mod) => {
      mod.default.init(phKey, { api_host: phHost });
      client = mod.default;
      initialized = true;
      loading = false;
      for (const replay of pending) replay();
      pending.length = 0;
    })
    .catch(() => {
      // Let a later call retry instead of leaving analytics stuck mid-load.
      loading = false;
    });
}

export function track(event: string, properties?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  if (!client) {
    queue(() => client?.capture(event, properties));
    return;
  }
  client.capture(event, properties);
}

export function identify(userId: string, properties?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  if (!client) {
    queue(() => client?.identify(userId, properties));
    return;
  }
  client.identify(userId, properties);
}

export const analytics = { init: initAnalytics, track, identify };