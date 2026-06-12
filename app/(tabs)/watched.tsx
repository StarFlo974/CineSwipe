/**
 * Écrans 11 · Vus — Dark  /  12 · Vus — Light
 */
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
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
import { WatchedMovie, TMDB_GENRES } from '../../types/movie';
import { StarRating } from '../../components/StarRating';

type FilterKey = 'all' | '5star' | '4plus' | 'recent';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all',    label: 'Tous' },
  { key: '5star',  label: '5★' },
  { key: '4plus',  label: '4+★' },
  { key: 'recent', label: 'Récents' },
];

const { width: SW } = Dimensions.get('window');

export default function WatchedScreen() {
  const insets = useSafeAreaInsets();
  const router  = useRouter();
  const theme   = useMovieStore((s) => s.theme);
  const C       = theme === 'dark' ? DARK_THEME : LIGHT_THEME;

  const { watched, removeFromWatched, markAsWatched, getAverageRating, getGenreStats } = useMovieStore();

  const [query,      setQuery]      = useState('');
  const [filter,     setFilter]     = useState<FilterKey>('all');
  const [editItem,   setEditItem]   = useState<WatchedMovie | null>(null);
  const [newRating,  setNewRating]  = useState(3);

  // Stats for header bar
  const avgRating   = getAverageRating();
  const genreStats  = getGenreStats();
  const topGenreId  = Object.entries(genreStats).sort(([,a],[,b]) => b - a)[0]?.[0];
  const topGenreName = topGenreId
    ? TMDB_GENRES.find((g) => g.id === parseInt(topGenreId))?.name ?? '—'
    : '—';

  const filtered = useMemo(() => {
    let list = [...watched].sort(
      (a, b) => new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime()
    );
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((w) => w.movie.title.toLowerCase().includes(q));
    }
    switch (filter) {
      case '5star':  list = list.filter((w) => w.rating === 5); break;
      case '4plus':  list = list.filter((w) => w.rating >= 4); break;
      case 'recent': list = list.slice(0, 20); break;
    }
    return list;
  }, [watched, query, filter]);

  const genreLabel = (ids: number[]) =>
    ids.slice(0, 1).map((id) => TMDB_GENRES.find((g) => g.id === id)?.name).filter(Boolean).join('');

  const openEdit = (item: WatchedMovie) => {
    setNewRating(item.rating);
    setEditItem(item);
  };

  const handleSave = () => {
    if (!editItem) return;
    markAsWatched(editItem.movie, newRating);
    setEditItem(null);
  };

  const renderItem = ({ item }: { item: WatchedMovie }) => {
    const imgUri = posterUrl(item.movie.poster_path, 'w342');
    const genre  = genreLabel(item.movie.genre_ids ?? []);
    const year   = item.movie.release_date?.slice(0, 4) ?? '';
    const starsN = item.rating;
    const stars  = '★'.repeat(starsN) + '☆'.repeat(5 - starsN);

    return (
      <TouchableOpacity
        style={[styles.item, { backgroundColor: C.card }, SHADOW.sm]}
        onPress={() => router.push({ pathname: '/movie/[id]', params: { id: item.movie.id } })}
        activeOpacity={0.82}
      >
        <View style={[styles.thumb, { backgroundColor: C.posterPlaceholder }]}>
          {imgUri ? (
            <Image source={{ uri: imgUri }} style={StyleSheet.absoluteFill} contentFit="cover" transition={150} />
          ) : (
            <Ionicons name="film-outline" size={22} color={C.textSec} />
          )}
        </View>
        <View style={styles.info}>
          <Text style={[styles.itemTitle, { color: C.text }]} numberOfLines={1}>
            {item.movie.title}
          </Text>
          <Text style={[styles.itemMeta, { color: C.textSec }]}>
            {[year, genre].filter(Boolean).join(' · ')}
          </Text>
          <Text style={[styles.itemStars, { color: C.gold }]}>{stars}</Text>
        </View>
        <TouchableOpacity
          style={[styles.editBtn, { backgroundColor: C.accent }]}
          onPress={() => openEdit(item)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="pencil" size={12} color="#fff" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: C.bg }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <Text style={[styles.pageTitle, { color: C.text }]}>Vus</Text>
        <Text style={[styles.count, { color: C.textSec }]}>
          {watched.length} film{watched.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Search */}
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

      {/* Stats bar */}
      {watched.length > 0 && (
        <View style={[styles.statsBar, { backgroundColor: C.card }]}>
          <View style={styles.statCell}>
            <Text style={[styles.statValue, { color: C.text }]}>{watched.length}</Text>
            <Text style={[styles.statLabel, { color: C.textSec }]}>films vus</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: C.badge }]} />
          <View style={styles.statCell}>
            <Text style={[styles.statValue, { color: C.gold }]}>
              {avgRating > 0 ? `${avgRating.toFixed(1)}★` : '—'}
            </Text>
            <Text style={[styles.statLabel, { color: C.textSec }]}>note moy.</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: C.badge }]} />
          <View style={styles.statCell}>
            <Text
              style={[styles.statValue, { color: C.text }]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.65}
            >
              {topGenreName}
            </Text>
            <Text style={[styles.statLabel, { color: C.textSec }]}>genre favori</Text>
          </View>
        </View>
      )}

      {/* Filter chips */}
      <View style={styles.chips}>
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              style={[styles.chip, { backgroundColor: active ? C.accent : C.badge }]}
              onPress={() => setFilter(f.key)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.chipText,
                  {
                    color: active ? '#fff' : C.textSec,
                    fontWeight: active ? FONT_WEIGHT.semiBold : FONT_WEIGHT.regular,
                  },
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* List */}
      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="checkmark-circle-outline" size={68} color={C.textSec} />
          <Text style={[styles.emptyTitle, { color: C.text }]}>
            {watched.length === 0 ? 'Aucun film vu' : 'Aucun résultat'}
          </Text>
          <Text style={[styles.emptyBody, { color: C.textSec }]}>
            {watched.length === 0
              ? 'Swipez vers le haut pour noter un film'
              : 'Essayez un autre filtre'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={(w) => String(w.movie.id)}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: insets.bottom + SPACING.xl },
          ]}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: SPACING.sm }} />}
        />
      )}

      {/* Edit rating modal */}
      <Modal
        visible={editItem !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setEditItem(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: C.surface }]}>
            <Text style={[styles.modalTitle, { color: C.text }]}>Modifier la note</Text>
            <Text style={[styles.modalMovieName, { color: C.textSec }]} numberOfLines={2}>
              {editItem?.movie.title}
            </Text>
            <StarRating
              rating={newRating}
              interactive
              starSize={40}
              color={C.gold}
              onRate={setNewRating}
            />
            <Text style={[styles.modalRatingValue, { color: C.gold }]}>{newRating} / 5</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, { borderColor: C.border, borderWidth: 1 }]}
                onPress={() => {
                  removeFromWatched(editItem!.movie.id);
                  setEditItem(null);
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="trash-outline" size={15} color={C.accent} />
                <Text style={[styles.modalBtnText, { color: C.accent }]}>Supprimer</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: C.accent }]}
                onPress={handleSave}
                activeOpacity={0.8}
              >
                <Text style={[styles.modalBtnText, { color: '#fff' }]}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  pageTitle: { fontSize: FONT_SIZE.xxl, fontWeight: FONT_WEIGHT.bold },
  count:     { fontSize: FONT_SIZE.md },

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
  searchInput: { flex: 1, fontSize: FONT_SIZE.md },

  // Stats bar — Figma 350×64 radius=14
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    height: LAYOUT.statCardH - 10, // 64px
    borderRadius: RADIUS.item,
    marginBottom: SPACING.sm,
    overflow: 'hidden',
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: { fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.bold },
  statLabel: { fontSize: FONT_SIZE.xs },
  statDivider: { width: 1, height: 34 },

  chips: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  chip: {
    width: 82,
    height: LAYOUT.chipH,
    borderRadius: RADIUS.chip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: { fontSize: FONT_SIZE.xs },

  list: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.xs },

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
  info: { flex: 1, gap: 4, paddingVertical: SPACING.sm },
  itemTitle: { fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.semiBold },
  itemMeta:  { fontSize: FONT_SIZE.xs },
  itemStars: { fontSize: FONT_SIZE.sm, letterSpacing: 1 },
  editBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
  },

  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: { fontSize: FONT_SIZE.xxl, fontWeight: FONT_WEIGHT.bold, textAlign: 'center' },
  emptyBody:  { fontSize: FONT_SIZE.md, textAlign: 'center', lineHeight: 22 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: SW - 48,
    borderRadius: RADIUS.item,
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.md,
  },
  modalTitle:       { fontSize: FONT_SIZE.xxl, fontWeight: FONT_WEIGHT.bold },
  modalMovieName:   { fontSize: FONT_SIZE.md, textAlign: 'center' },
  modalRatingValue: { fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.bold },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    width: '100%',
    marginTop: SPACING.sm,
  },
  modalBtn: {
    flex: 1,
    height: LAYOUT.ctaBtnH,
    borderRadius: RADIUS.btn,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  modalBtnText: { fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.semiBold },
});
