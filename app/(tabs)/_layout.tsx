/**
 * Onglets : Découvrir | À voir | Vus | Profil
 */
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMovieStore } from '../../hooks/useMovieStore';
import { DARK_THEME, LIGHT_THEME, FONT_SIZE, FONT_WEIGHT, LAYOUT } from '../../constants/theme';

export default function TabLayout() {
  const theme = useMovieStore((s) => s.theme);
  const C     = theme === 'dark' ? DARK_THEME : LIGHT_THEME;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: C.surface,
          borderTopColor: C.border,
          borderTopWidth: 1,
          height: LAYOUT.tabBarH,   // 84px
          paddingBottom: 12,
          paddingTop: 10,
        },
        tabBarActiveTintColor:   C.accent,
        tabBarInactiveTintColor: C.textSec,
        tabBarLabelStyle: {
          fontSize: FONT_SIZE.xxs,  // 10px
          fontWeight: FONT_WEIGHT.regular,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Découvrir',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'film' : 'film-outline'} size={22} color={color} />
          ),
          tabBarLabelStyle: {
            fontSize: FONT_SIZE.xxs,
            fontWeight: FONT_WEIGHT.semiBold,
          },
        }}
      />
      <Tabs.Screen
        name="watchlist"
        options={{
          title: 'À voir',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'bookmark' : 'bookmark-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="watched"
        options={{
          title: 'Vus',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'checkmark-circle' : 'checkmark-circle-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
