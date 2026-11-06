import { Tabs } from 'expo-router/tabs';
import { useTranslation } from 'react-i18next';

import { TabIcon, type TabIconName } from '@/components/TabIcon';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts } from '@/theme/tokens';

const TABS: { name: string; icon: TabIconName; titleKey: string }[] = [
  { name: 'index', icon: 'hearth', titleKey: 'tabs.hearth' },
  { name: 'wheel', icon: 'wheel', titleKey: 'tabs.wheel' },
  { name: 'well', icon: 'well', titleKey: 'tabs.well' },
  { name: 'runes', icon: 'runes', titleKey: 'tabs.runes' },
  { name: 'settings', icon: 'settings', titleKey: 'tabs.settings' },
];

export default function TabLayout() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarLabelStyle: { fontFamily: fonts.bodyMedium, fontSize: 11 },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: t(tab.titleKey),
            tabBarIcon: ({ color }) => <TabIcon name={tab.icon} color={color} />,
          }}
        />
      ))}
    </Tabs>
  );
}
