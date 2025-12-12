/**
 * Analytics Service - Centralized event tracking
 * 
 * Usage:
 * import { analyticsService } from '../services/analytics';
 * 
 * // Track event with properties
 * analyticsService.trackEvent('signup_completed', {
 *   method: 'email',
 *   user_id: 123,
 * });
 * 
 * // Track page view
 * analyticsService.trackPageView('CertificationsPage', {
 *   category: 'certifications',
 * });
 * 
 * // Track conversion
 * analyticsService.trackConversion('certification_enrolled', {
 *   program_id: 45,
 *   amount: 150.00,
 * });
 */

interface AnalyticsEvent {
  event_name: string;
  event_properties?: Record<string, any>;
  timestamp?: number;
  user_id?: string | number;
}

class AnalyticsService {
  private debug = process.env.NODE_ENV === 'development';
  private enabled = true;

  /**
   * Initialize analytics (called once in App startup)
   * Add external providers here (Mixpanel, Google Analytics, etc)
   */
  public initialize() {
    // TODO: Initialize Mixpanel
    // if (window.mixpanel) {
    //   mixpanel.init('YOUR_TOKEN');
    // }

    // TODO: Initialize Google Analytics 4
    // window.gtag?.('config', 'G-XXXXXXXXXX');

    if (this.debug) {
      console.log('[Analytics] Service initialized');
    }
  }

  /**
   * Disable analytics (for testing or user preference)
   */
  public disable() {
    this.enabled = false;
  }

  /**
   * Enable analytics
   */
  public enable() {
    this.enabled = true;
  }

  /**
   * Track a custom event
   */
  public trackEvent(eventName: string, properties?: Record<string, any>) {
    if (!this.enabled) return;

    const event: AnalyticsEvent = {
      event_name: eventName,
      event_properties: properties,
      timestamp: Date.now(),
      user_id: this.getUserId() ?? undefined,
    };

    if (this.debug) {
      console.log('[Analytics Event]', event);
    }

    // Send to external providers
    this.sendToMixpanel(event);
    this.sendToGoogleAnalytics(event);
    this.sendToLocalStorage(event);
  }

  /**
   * Track page view
   */
  public trackPageView(pageName: string, properties?: Record<string, any>) {
    this.trackEvent('page_view', {
      page_name: pageName,
      ...properties,
    });

    // Also send to Google Analytics
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: pageName,
        page_path: window.location.pathname,
      });
    }
  }

  /**
   * Track conversion events (signup, purchase, enrollment, etc)
   */
  public trackConversion(conversionName: string, properties?: Record<string, any>) {
    this.trackEvent(`conversion_${conversionName}`, {
      conversion_type: conversionName,
      ...properties,
    });

    // Send to Google Analytics
    if (window.gtag) {
      window.gtag('event', 'conversion', {
        conversion_id: conversionName,
        value: properties?.amount || 0,
        currency: properties?.currency || 'AOA',
      });
    }
  }

  /**
   * Track user identity
   */
  public setUser(userId: string | number, properties?: Record<string, any>) {
    localStorage.setItem('analytics_user_id', String(userId));

    if (this.debug) {
      console.log('[Analytics] User set:', userId, properties);
    }

    // Send to external providers
    if (window.mixpanel) {
      window.mixpanel?.identify(userId);
      if (properties) {
        window.mixpanel?.people?.set(properties);
      }
    }
  }

  /**
   * Clear user identity
   */
  public clearUser() {
    localStorage.removeItem('analytics_user_id');

    if (window.mixpanel) {
      window.mixpanel?.reset();
    }
  }

  /**
   * Get current user ID
   */
  private getUserId(): string | number | null {
    return localStorage.getItem('analytics_user_id');
  }

  /**
   * Send event to Mixpanel (when implemented)
   */
  private sendToMixpanel(event: AnalyticsEvent) {
    // TODO: Implement Mixpanel integration
    // if (window.mixpanel && this.enabled) {
    //   mixpanel.track(event.event_name, event.event_properties);
    // }
  }

  /**
   * Send event to Google Analytics 4
   */
  private sendToGoogleAnalytics(event: AnalyticsEvent) {
    if (window.gtag && this.enabled) {
      window.gtag('event', event.event_name, event.event_properties);
    }
  }

  /**
   * Store events locally for debugging/testing
   */
  private sendToLocalStorage(event: AnalyticsEvent) {
    if (process.env.NODE_ENV === 'development') {
      const stored = localStorage.getItem('_analytics_events') || '[]';
      const events = JSON.parse(stored);
      events.push(event);
      // Keep only last 50 events
      if (events.length > 50) {
        events.shift();
      }
      localStorage.setItem('_analytics_events', JSON.stringify(events));
    }
  }
}

export const analyticsService = new AnalyticsService();

/**
 * Predefined event names for consistency
 */
export const ANALYTICS_EVENTS = {
  // Authentication
  SIGNUP_COMPLETED: 'signup_completed',
  LOGIN_COMPLETED: 'login_completed',
  LOGOUT_COMPLETED: 'logout_completed',
  PASSWORD_RESET: 'password_reset',

  // Page Views
  HOMEPAGE_VIEW: 'homepage_view',
  DASHBOARD_VIEW: 'dashboard_view',
  CERTIFICATIONS_VIEW: 'certifications_view',
  MARKETPLACE_VIEW: 'marketplace_view',
  KIXIKILA_VIEW: 'kixikila_view',
  VOTING_VIEW: 'voting_view',
  GAMES_VIEW: 'games_view',

  // Module Interactions
  MODULE_CARD_CLICKED: 'module_card_clicked',
  HERO_CTA_CLICKED: 'hero_cta_clicked',

  // Certifications
  CERTIFICATION_BROWSED: 'certification_browsed',
  CERTIFICATION_DETAIL_VIEWED: 'certification_detail_viewed',
  CERTIFICATION_ENROLLED: 'certification_enrolled',
  CERTIFICATION_COMPLETED: 'certification_completed',

  // Marketplace
  MARKETPLACE_PRODUCT_VIEWED: 'marketplace_product_viewed',
  MARKETPLACE_SEARCH: 'marketplace_search',
  MARKETPLACE_FILTER_APPLIED: 'marketplace_filter_applied',
  MARKETPLACE_ORDER_PLACED: 'marketplace_order_placed',
  MARKETPLACE_REVIEW_SUBMITTED: 'marketplace_review_submitted',

  // Kixikila
  KIXIKILA_GROUP_VIEWED: 'kixikila_group_viewed',
  KIXIKILA_GROUP_JOINED: 'kixikila_group_joined',
  KIXIKILA_CONTRIBUTION_MADE: 'kixikila_contribution_made',

  // Voting & Games
  VOTE_SUBMITTED: 'vote_submitted',
  GAME_STARTED: 'game_started',
  GAME_COMPLETED: 'game_completed',
  GAME_SHARED: 'game_shared',

  // Donations
  DONATION_CAMPAIGN_VIEWED: 'donation_campaign_viewed',
  DONATION_COMPLETED: 'donation_completed',

  // General
  SHARE_CLICKED: 'share_clicked',
  FEEDBACK_SUBMITTED: 'feedback_submitted',
  ERROR_OCCURRED: 'error_occurred',
};

// Declare global gtag for TypeScript
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    mixpanel?: {
      init: (token: string) => void;
      track: (event: string, properties?: Record<string, any>) => void;
      identify: (id: string | number) => void;
      people?: {
        set: (properties: Record<string, any>) => void;
      };
      reset: () => void;
    };
  }
}
