import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { useSettings } from '@/features/settings/SettingsContext';
import { useUpcomingTides } from '@/features/wheel/useWheel';
import { useToday } from '@/hooks/useToday';

import { configureNotificationHandler, remindersSupported, syncReminders } from './notifications';
import { planReminders } from './plan';

configureNotificationHandler();

/** Open the screen a reminder points to, whether the app was running or launched by the tap. */
export function useNotificationObserver(): void {
  useEffect(() => {
    if (!remindersSupported) return;

    function redirect(notification: Notifications.Notification) {
      const url = notification.request.content.data?.url;
      if (typeof url === 'string' && url.startsWith('/')) {
        router.push(url);
        Notifications.clearLastNotificationResponse();
      }
    }

    const response = Notifications.getLastNotificationResponse();
    if (response?.notification) redirect(response.notification);

    const subscription = Notifications.addNotificationResponseReceivedListener((r) => redirect(r.notification));
    return () => subscription.remove();
  }, []);
}

/** Keep scheduled reminders in step with the calendar, settings and language. */
export function useReminderSync(): void {
  const { settings, loaded } = useSettings();
  const today = useToday();
  const upcoming = useUpcomingTides(today);
  const { t } = useTranslation();
  const queue = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    if (!remindersSupported || !loaded) return;
    const plans = planReminders(upcoming, settings.reminders, new Date());
    // Run syncs one at a time so a quick series of setting changes can't interleave.
    queue.current = queue.current.then(() => syncReminders(plans, t)).catch(() => {});
  }, [loaded, upcoming, settings.reminders, t]);
}
