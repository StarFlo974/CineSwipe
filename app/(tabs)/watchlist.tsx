/**
 * Écrans 09 · À voir — Dark  /  10 · À voir — Light
 */
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMovieStore } from '../../hooks/useMovieStore';
import {
  DARK_THEME, LIGHT_THEME,
  SPACING, FONT_SIZE, FONT_WEIGHT, RADIUS, LAYOUT, SHADOW,
} from '../../constants/theme';
import { posterUrl } from '../../services/tmdb';
import { Movie, TMDB_GENRES } from '../../types/movie';

type SortKey = 'date' | 'rating' | 'title';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'date',   label: 'Date ajout' },
  { key: 'rating', label: 'Note' },
  { key: 'title',  label: 'Titre' },
];

export default function WatchlistScreen() {
  const insets = useSafeAreaInsets();
  const router  = useRouter();
  const theme   = useMovieStore((s) => s.theme);
  const C       = theme === 'dark' ? DARK_THEME : LIGHT_THEME;

  const { watchlist, removeFromWatchlist } = useMovieStore();

  const [query,   setQuery]   = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('date');

  const filtered = useMemo(() => {
    let list = [...watchlist];
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((m) => m.title.toLowerCase().includes(q));
    }
    switch (sortKey) {
      case 'rating': list.sort((a, b) => b.vote_average - a.vote_average); break;
      case 'title':  list.sort((a, b) => a.title.localeCompare(b.title)); break;
      default:       break; // date = insertion order (already reversed on add)
    }
    return list;
  }, [watchlist, query, sortKey]);

  const genreLabel = (ids: number[]) =>
    ids.slice(0, 1)
       .map((id) => TMDB_GENRES.find((g) => g.id === id)?.name)
       .filter(Boolean)
       .join('');

  const renderItem = ({ item: movie }: { item: Movie }) => {
    const imgUri = posterUrl(movie.poster_path, 'w342');
    const genre  = genreLabel(movie.genre_ids ?? []);
    const year   = movie.release_date?.slice(0, 4) ?? '';
    const starsN = Math.round(movie.vote_average / 2);
    const stars  = '★'.repeat(starsN) + '☆'.repeat(5 - starsN);

    return (
      <TouchableOpacity
        style={[styles.item, { backgroundColor: C.card }, SHADOW.sm]}
        onPress={() => router.push({ pathname: '/movie/[id]', params: { id: movie.id } })}
        activeOpacity={0.82}
      >
        {/* Thumbnail */}
        <View style={[styles.thumb, { backgroundColor: C.posterPlaceholder }]}>
          {imgUri ? (
            <Image source={{ uri: imgUri }} style={StyleSheet.absoluteFill} contentFit="cover" transition={150} />
          ) : (
            <Ionicons name="film-outline" size={22} color={C.textSec} />
          )}
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={[styles.itemTitle, { color: C.text }]} numberOfLines={1}>
            {movie.title}
          </Text>
          <Text style={[styles.itemMeta, { color: C.textSec }]}>
            {[year, genre].filter(Boolean).join(' · ')}
          </Text>
          <Text style={[styles.itemStars, { color: C.gold }]}>{stars}</Text>
        </View>

        {/* Remove */}
        <TouchableOpacity
          style={styles.removeBtn}
          onPress={() => removeFromWatchlist(movie.id)}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="close" size={16} color={C.textSec} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: C.bg }]}>
      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <Text style={[styles.pageTitle, { color: C.text }]}>À voir</Text>
        <Text style={[styles.count, { color: C.textSec }]}>
          {watchlist.length} film{watchlist.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* ── Search ── */}
      <View style={[styles.searchBar, { backgroundColor: C.card }]}>
        <Ionicons name="search-outline" size={16} color={C.textSec} />
        <TextInput
          style={[styles.searchInput, { color: C.text }]}
          placeholder="Rechercher..."
          placeholderTextColor={C.textSec}
          value={query}
          onChangeText={setQuery}
          clearButtonMode="while-editing"
        />
      </View>

      {/* ── Sort chips ── */}
      <View style={styles.chips}>
        {SORT_OPTIONS.map((opt) => {
          const active = sortKey === opt.key;
          return (
            <TouchableOpacity
              key={opt.key}
              style={[
                styles.chip,
                { backgroundColor: active ? C.accent : C.badge },
              ]}
              onPress={() => setSortKey(opt.key)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: active ? '#fff' : C.textSec, fontWeight: active ? FONT_WEIGHT.semiBold : FONT_WEIGHT.regular },
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── List ── */}
      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="bookmark-outline" size={68} color={C.textSec} />
          <Text style={[styles.emptyTitle, { color: C.text }]}>
            {query ? 'Aucun résultat' : 'Votre liste est vide'}
          </Text>
          <Text style={[styles.emptyBody, { color: C.textSec }]}>
            {query
              ? 'Essayez un autre terme de recherche'
              : 'Swipez à droite sur les films qui vous intéressent'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={(m) => String(m.id)}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: insets.bottom + SPACING.xl },
          ]}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: SPACING.sm }} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    gap: SPACING.md,
  },
  pageTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
  },
  count: {
    fontSize: FONT_SIZE.md,
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    height: LAYOUT.searchBarH,
    borderRadius: RADIUS.search,
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZE.md,
  },

  chips: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  chip: {
    height: LAYOUT.chipH,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.chip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontSize: FONT_SIZE.xs,
  },

  list: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xs,
  },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    height: LAYOUT.listItemH,
    borderRadius: RADIUS.item,
    overflow: 'hidden',
    paddingRight: SPACING.md,
  },
  thumb: {
    width: LAYOUT.listThumbW,
    height: LAYOUT.listThumbH,
    margin: 10,
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 4,
    paddingVertical: SPACING.sm,
  },
  itemTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semiBold,
  },
  itemMeta: {
    fontSize: FONT_SIZE.xs,
  },
  itemStars: {
    fontSize: FONT_SIZE.sm,
    letterSpacing: 1,
  },
  removeBtn: {
    padding: SPACING.xs,
  },

  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    textAlign: 'center',
  },
  emptyBody: {
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
    lineHeight: 22,
  },
});
