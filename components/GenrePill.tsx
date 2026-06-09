import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DARK_THEME, LIGHT_THEME, RADIUS, FONT_SIZE } from '../constants/theme';
import { TMDB_GENRES } from '../types/movie';
import { useMovieStore } from '../hooks/useMovieStore';

interface GenrePillProps {
  genreId: number;
  selected?: boolean;
  onPress?: () => void;
}

export function GenrePill({ genreId, selected = false, onPress }: GenrePillProps) {
  const theme = useMovieStore((s) => s.theme);
  const colors = theme === 'dark' ? DARK_THEME : LIGHT_THEME;
  const name = TMDB_GENRES.find((g) => g.id === genreId)?.name ?? String(genreId);

  if (onPress) {
    return (
      <TouchableOpacity
        style={[
          styles.pill,
          {
            backgroundColor: selected ? colors.accent : colors.badge,
            borderColor: selected ? colors.accent : 'transparent',
          },
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text style={[styles.text, { color: selected ? '#FFF' : colors.textSec }]}>
          {name}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.pill, { backgroundColor: colors.badge }]}>
      <Text style={[styles.text, { color: colors.textSec }]}>{name}</Text>
    </View>
  );
}

interface GenreNamePillProps {
  name: string;
  small?: boolean;
}

export function GenreNamePill({ name, small = false }: GenreNamePillProps) {
  const theme = useMovieStore((s) => s.theme);
  const colors = theme === 'dark' ? DARK_THEME : LIGHT_THEME;

  return (
    <View style={[styles.pill, { backgroundColor: colors.badge }, small && styles.small]}>
      <Text style={[styles.text, { color: colors.textSec }, small && styles.smallText]}>
        {name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  small: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  text: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '500',
  },
  smallText: {
    fontSize: FONT_SIZE.xs,
  },
});
