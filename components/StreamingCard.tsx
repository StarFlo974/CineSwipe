import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DARK_THEME, LIGHT_THEME, RADIUS, SPACING, FONT_SIZE, SHADOW } from '../constants/theme';
import { WatchProvider } from '../types/movie';
import { STREAMING_LOGO_BASE } from '../services/tmdb';
import { useMovieStore } from '../hooks/useMovieStore';

interface TMDBStreamingCardProps {
  provider: WatchProvider;
  type: 'streaming' | 'rent' | 'buy';
  price?: number;
}

export function TMDBStreamingCard({ provider, type }: TMDBStreamingCardProps) {
  const theme = useMovieStore((s) => s.theme);
  const colors = theme === 'dark' ? DARK_THEME : LIGHT_THEME;

  const logoUri = `${STREAMING_LOGO_BASE}${provider.logo_path}`;

  const typeConfig = {
    streaming: { label: 'Disponible', color: colors.green, icon: 'checkmark-circle' as const },
    rent: { label: 'Location', color: colors.gold, icon: 'time-outline' as const },
    buy: { label: 'Achat', color: colors.textSec, icon: 'cart-outline' as const },
  };

  const config = typeConfig[type];

  return (
    <View style={[styles.card, { backgroundColor: colors.card }, SHADOW.sm]}>
      <View style={[styles.logoContainer, { backgroundColor: colors.surface }]}>
        <Image
          source={{ uri: logoUri }}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {provider.provider_name}
        </Text>
        <View style={styles.statusRow}>
          <Ionicons name={config.icon} size={12} color={config.color} />
          <Text style={[styles.status, { color: config.color }]}>{config.label}</Text>
        </View>
      </View>
      {type === 'streaming' && (
        <TouchableOpacity
          style={[styles.watchBtn, { backgroundColor: colors.accent }]}
          activeOpacity={0.8}
        >
          <Text style={styles.watchBtnText}>Regarder</Text>
          <Ionicons name="arrow-forward" size={12} color="#FFF" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  logoContainer: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logo: {
    width: 44,
    height: 44,
  },
  fallbackLogo: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
  },
  info: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  status: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '500',
  },
  price: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  watchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  watchBtnText: {
    color: '#FFF',
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
  },
});
