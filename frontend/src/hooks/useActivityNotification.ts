import { useState, useEffect, useCallback } from 'react';

interface ActivityNotificationState {
  unreadCount: number;
  hasNewActivity: boolean;
  lastCheckTime: string | null;
  lastEventCount: number;
}

/**
 * Hook to manage activity notifications via localStorage
 * 
 * Tracks:
 * - last_activity_check: ISO timestamp of last dashboard visit
 * - last_activity_count: Total event count at last check
 * 
 * Compares with current activity count to show unread badge
 */
export const useActivityNotification = (
  currentEventCount: number
): ActivityNotificationState & { markAsRead: () => void } => {
  
  const [state, setState] = useState<ActivityNotificationState>({
    unreadCount: 0,
    hasNewActivity: false,
    lastCheckTime: null,
    lastEventCount: 0
  });

  // Initialize from localStorage on mount
  useEffect(() => {
    const lastCheck = localStorage.getItem('last_activity_check');
    const lastCount = parseInt(localStorage.getItem('last_activity_count') || '0', 10);

    setState(prev => ({
      ...prev,
      lastCheckTime: lastCheck,
      lastEventCount: lastCount
    }));

    // Calculate unread
    if (currentEventCount > lastCount) {
      const unread = currentEventCount - lastCount;
      setState(prev => ({
        ...prev,
        unreadCount: unread,
        hasNewActivity: unread > 0
      }));
    }
  }, [currentEventCount]);

  // Mark all as read and update localStorage
  const markAsRead = useCallback(() => {
    const now = new Date().toISOString();
    localStorage.setItem('last_activity_check', now);
    localStorage.setItem('last_activity_count', String(currentEventCount));
    
    setState(prev => ({
      ...prev,
      unreadCount: 0,
      hasNewActivity: false,
      lastCheckTime: now,
      lastEventCount: currentEventCount
    }));
  }, [currentEventCount]);

  return {
    ...state,
    markAsRead
  };
};
