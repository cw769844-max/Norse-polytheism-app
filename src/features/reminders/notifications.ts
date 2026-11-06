import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import type { TFunction } from 'i18next';
import { Platform } from 'react-native';

import type { PlannedReminder } from './plan';

/** Local reminders work in the native apps only. */
export const remindersSupported = Platform.OS === 'ios' || Platform.OS === 'android';

const CHANNEL_ID = 'holy-tides';
const ID_PREFIX = 'tide:';

/** Show reminders that arrive while the app is open, quietly. */
export function configureNotificationHandler(): void {
  if (!remindersSupported) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

async function ensureChannel(t: TFunction): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: t('reminders.channelName'),
    description: t('reminders.channelDescription'),
    importance: AndroidImportance.DEFAULT,
  });
}

export type PermissionResult = 'granted' | 'denied' | 'blocked';

/** Ask for notification permission. "blocked" means the user must change it in system settings. */
export async function requestReminderPermission(t: TFunction): Promise<PermissionResult> {
  if (!remindersSupported) return 'blocked';
  // Android 13+ only shows the permission prompt once a channel exists.
  await ensureChannel(t);
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return 'granted';
  if (!current.canAskAgain) return 'blocked';
  const result = await Notifications.requestPermissionsAsync();
  if (result.granted) return 'granted';
  return result.canAskAgain ? 'denied' : 'blocked';
}

export async function hasReminderPermission(): Promise<boolean> {
  if (!remindersSupported) return false;
  return (await Notifications.getPermissionsAsync()).granted;
}

/**
 * Replace this app's scheduled holy-tide reminders with `plans`.
 * Reminders carry the tide's route so tapping one opens it.
 */
export async function syncReminders(plans: PlannedReminder[], t: TFunction): Promise<void> {
  if (!remindersSupported) return;

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((n) => n.identifier.startsWith(ID_PREFIX))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );

  if (plans.length === 0 || !(await hasReminderPermission())) return;
  await ensureChannel(t);

  for (const plan of plans) {
    const name = t(`tides.${plan.tideId}.name`);
    await Notifications.scheduleNotificationAsync({
      identifier: plan.id,
      content: {
        title:
          plan.kind === 'day'
            ? t('reminders.dayTitle', { name })
            : t('reminders.leadTitle', { name, count: plan.daysBefore }),
        body: plan.kind === 'day' ? t(`tides.${plan.tideId}.summary`) : t('reminders.leadBody'),
        data: { url: `/tide/${plan.tideId}` },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: plan.fireAt,
        channelId: CHANNEL_ID,
      },
    });
  }
}
