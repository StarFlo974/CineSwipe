import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DARK_THEME, LIGHT_THEME, SPACING, FONT_SIZE } from '../constants/theme';
import { useMovieStore } from '../hooks/useMovieStore';

interface TabItem {
  name: string;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  iconActive: React.ComponentProps<typeof Ionicons>['name'];
}

const TABS: TabItem[] = [
  { name: 'index', label: 'Découvrir', icon: 'film-outline', iconActive: 'film' },
  { name: 'watchlist', label: 'À voir', icon: 'bookmark-outline', iconActive: 'bookmark' },
  { name: 'watched', label: 'Vus', icon: 'checkmark-circle-outline', iconActive: 'checkmark-circle' },
  { name: 'profile', label: 'Profil', icon: 'person-outline', iconActive: 'person' },
];

interface BottomNavProps {
  activeTab: string;
  onNavigate: (name: string) => void;
}

export function BottomNav({ activeTab, onNavigate }: BottomNavProps) {
  const insets = useSafeAreaInsets();
  const theme = useMovieStore((s) => s.theme);
  const colors = theme === 'dark' ? DARK_THEME : LIGHT_THEME;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: insets.bottom > 0 ? insets.bottom : SPACING.sm,
        },
      ]}
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.name;
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => onNavigate(tab.name)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isActive ? tab.iconActive : tab.icon}
              size={24}
              color={isActive ? colors.accent : colors.textSec}
            />
            <Text
              style={[
                styles.label,
                { color: isActive ? colors.accent : colors.textSec },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: SPACING.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  label: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '500',
  },
});
