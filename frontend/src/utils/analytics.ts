// Lightweight analytics helper: wraps navigator.sendBeacon when available, falls back to fetch.
// Non-blocking, best-effort, no retries.
export interface AnalyticsEvent {
  name: string;
  page?: string;
  label?: string;
  value?: number | string;
  meta?: Record<string, unknown>;
  variant?: 'A' | 'B';
  cta_type?: 'primary' | 'secondary' | 'module' | 'season' | 'upgrade' | 'login' | 'register' | 'vote' | 'filter' | 'unlock';
  primary_engagement?: string;
  personalized?: boolean;
  engagement_percentage?: number;
  // PLG funnel fields
  required_role?: 'participant' | 'mentor' | 'admin' | 'voter' | string;
  target_role?: 'participant' | 'mentor' | 'admin' | 'voter' | string;
  timestamp?: number;
  username?: string;
  participant_id?: string;
  participant_name?: string;
  filter_type?: string;
  error_message?: string;
  user_type?: string;
}

// Determine API base from environment (CRA)
const API_BASE = (typeof process !== 'undefined' && (process as any)?.env?.REACT_APP_API_BASE) || '';
const ANALYTICS_KEY = (typeof process !== 'undefined' && (process as any)?.env?.REACT_APP_ANALYTICS_KEY) || '';
const ANALYTICS_ENDPOINT = API_BASE ? `${API_BASE.replace(/\/$/, '')}/api/analytics/events` : '/api/analytics/events';

export async function trackEvent(event: AnalyticsEvent): Promise<void> {
  try {
    const payload = JSON.stringify({ ...event, ts: Date.now() });
    if (ANALYTICS_KEY) {
      await fetch(ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Analytics-Key': ANALYTICS_KEY },
        body: payload,
        keepalive: true,
      });
      return;
    }
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' });
      navigator.sendBeacon(ANALYTICS_ENDPOINT, blob);
      return;
    }
    await fetch(ANALYTICS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    });
  } catch (err) {
    // Best-effort; swallow errors to avoid impacting UX
    console.debug('trackEvent error (ignored)', err);
  }
}
