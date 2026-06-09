import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DARK_THEME, LIGHT_THEME, RADIUS, SPACING, FONT_SIZE, SHADOW } from '../constants/theme';
import { useMovieStore } from '../hooks/useMovieStore';

export interface Cinema {
  name: string;
  address: string;
  distance: number;
  nextShowtime: string;
  mapsUrl?: string;
}

interface CinemaCardProps {
  cinema: Cinema;
}

export function CinemaCard({ cinema }: CinemaCardProps) {
  const theme = useMovieStore((s) => s.theme);
  const colors = theme === 'dark' ? DARK_THEME : LIGHT_THEME;

  const distanceLabel =
    cinema.distance < 1
      ? `${Math.round(cinema.distance * 1000)} m`
      : `${cinema.distance.toFixed(1)} km`;

  const handleDirections = async () => {
    const query = encodeURIComponent(cinema.address);
    const url = `https://maps.google.com/?q=${query}`;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) Linking.openURL(url);
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card }, SHADOW.sm]}>
      <View style={[styles.iconContainer, { backgroundColor: colors.accent + '20' }]}>
        <Ionicons name="film-outline" size={24} color={colors.accent} />
      </View>
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {cinema.name}
        </Text>
        <Text style={[styles.address, { color: colors.textSec }]} numberOfLines={1}>
          {cinema.address}
        </Text>
        <View style={styles.metaRow}>
          <View style={styles.meta}>
            <Ionicons name="location-outline" size={12} color={colors.green} />
            <Text style={[styles.metaText, { color: colors.green }]}>{distanceLabel}</Text>
          </View>
          <View style={styles.meta}>
            <Ionicons name="time-outline" size={12} color={colors.gold} />
            <Text style={[styles.metaText, { color: colors.gold }]}>{cinema.nextShowtime}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity
        style={[styles.dirBtn, { borderColor: colors.border }]}
        onPress={handleDirections}
        activeOpacity={0.7}
      >
        <Ionicons name="navigate-outline" size={16} color={colors.accent} />
      </TouchableOpacity>
    </View>
  );
}

export function CinemaCardSkeleton() {
  const theme = useMovieStore((s) => s.theme);
  const colors = theme === 'dark' ? DARK_THEME : LIGHT_THEME;

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={[styles.iconContainer, { backgroundColor: colors.badge }]} />
      <View style={styles.info}>
        <View style={[styles.skeletonLine, { width: '70%', backgroundColor: colors.badge }]} />
        <View style={[styles.skeletonLine, { width: '50%', backgroundColor: colors.badge, height: 10 }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
  address: {
    fontSize: FONT_SIZE.sm,
  },
  metaRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: 2,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '500',
  },
  dirBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skeletonLine: {
    height: 14,
    borderRadius: 7,
    marginBottom: 4,
  },
});
