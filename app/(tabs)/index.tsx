/**
 * Écrans 01 · Swipe — Dark  /  05 · Swipe — Light
 */
import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MovieCard, MovieCardSkeleton } from '../../components/MovieCard';
import { SwipeButtons }               from '../../components/SwipeButtons';
import { StarRating }                 from '../../components/StarRating';
import { GenrePill }                  from '../../components/GenrePill';
import { useMovies }                  from '../../hooks/useMovies';
import { useMovieStore }              from '../../hooks/useMovieStore';
import {
  DARK_THEME, LIGHT_THEME,
  SPACING, FONT_SIZE, FONT_WEIGHT, RADIUS, LAYOUT,
} from '../../constants/theme';
import { Movie, TMDB_GENRES } from '../../types/movie';

const { width: SW, height: SH } = Dimensions.get('window');
const MAX_VISIBLE = 5;

export default function SwipeScreen() {
  const insets = useSafeAreaInsets();
  const router  = useRouter();
  const theme   = useMovieStore((s) => s.theme);
  const C       = theme === 'dark' ? DARK_THEME : LIGHT_THEME;

  const {
    addToWatchlist, markAsWatched, ignore,
    selectedGenres, setSelectedGenres,
    isInWatchlist, isWatched,
  } = useMovieStore();

  const { movies, loading, error, initialize, onCardConsumed, removeTopMovie } = useMovies();

  const [ratingModal, setRatingModal] = useState<Movie | null>(null);
  const [pendingRating, setPendingRating] = useState(3);
  const ratingFromSwipe = useRef(false);
  const [filterModal, setFilterModal] = useState(false);
  const [tempGenres, setTempGenres] = useState<number[]>([]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { initialize(); }, []);

  const visible = movies.slice(0, MAX_VISIBLE);

  // ── Swipe handlers ──────────────────────────────────────────────────────
  const handleComplete = useCallback(() => {
    removeTopMovie();
    onCardConsumed(movies.length - 1);
  }, [movies.length, removeTopMovie, onCardConsumed]);

  const handleRight = useCallback((movie: Movie) => {
    addToWatchlist(movie);
  }, [addToWatchlist]);

  // Swipe gauche = Déjà vu → ouvre le modal de notation
  const handleLeft = useCallback((movie: Movie) => {
    ratingFromSwipe.current = true;
    setPendingRating(3);
    setRatingModal(movie);
  }, []);

  // Swipe haut = Ignorer
  const handleUp = useCallback((movie: Movie) => {
    ignore(movie.id);
  }, [ignore]);

  const handleTap = useCallback((movie: Movie) => {
    router.push({ pathname: '/movie/[id]', params: { id: movie.id } });
  }, [router]);

  // ── Boutons manuels ──────────────────────────────────────────────────────
  // Bouton ✕ "Déjà vu" → ouvre le modal (la carte n'est pas encore retirée)
  const handleSkipBtn = useCallback(() => {
    if (!visible[0]) return;
    ratingFromSwipe.current = false;
    setPendingRating(3);
    setRatingModal(visible[0]);
  }, [visible]);

  const handleIndiffBtn = useCallback(() => {
    // Indiférent = ignorer sans notation (même comportement que swipe gauche)
    if (!visible[0]) return;
    ignore(visible[0].id);
    handleComplete();
  }, [visible, ignore, handleComplete]);

  const handleLikeBtn = useCallback(() => {
    if (!visible[0]) return;
    addToWatchlist(visible[0]);
    handleComplete();
  }, [visible, addToWatchlist, handleComplete]);

  const confirmRating = useCallback(() => {
    if (!ratingModal) return;
    markAsWatched(ratingModal, pendingRating);
    // Si on vient du bouton, la carte n'a pas encore été retirée par le swipe
    if (!ratingFromSwipe.current) handleComplete();
    setRatingModal(null);
  }, [ratingModal, pendingRating, markAsWatched, handleComplete]);

  const applyFilter = useCallback(() => {
    setSelectedGenres(tempGenres);
    setFilterModal(false);
    initialize(tempGenres);
  }, [tempGenres, setSelectedGenres, initialize]);

  return (
    <View style={[styles.container, { backgroundColor: C.bg }]}>
      {/* ── App bar ── */}
      <View style={[styles.appBar, { paddingTop: insets.top + SPACING.xs }]}>
        <View style={{ width: 40 }} />
        <Text style={[styles.logo, { color: C.accent }]}>CineSwipe</Text>
        <TouchableOpacity
          style={[styles.filterBtn, { backgroundColor: C.card }]}
          onPress={() => { setTempGenres(selectedGenres); setFilterModal(true); }}
          activeOpacity={0.8}
        >
          <Ionicons name="options-outline" size={18} color={C.text} />
          {selectedGenres.length > 0 && (
            <View style={[styles.filterDot, { backgroundColor: C.accent }]}>
              <Text style={styles.filterDotText}>{selectedGenres.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* ── Card deck ── */}
      <View style={styles.deck}>
        {loading && visible.length === 0 ? (
          <MovieCardSkeleton />
        ) : error && visible.length === 0 ? (
          <View style={styles.state}>
            <Ionicons name="cloud-offline-outline" size={60} color={C.textSec} />
            <Text style={[styles.stateTitle, { color: C.text }]}>Connexion impossible</Text>
            <TouchableOpacity
              style={[styles.retryBtn, { backgroundColor: C.accent }]}
              onPress={() => initialize()}
              activeOpacity={0.8}
            >
              <Text style={styles.retryText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        ) : visible.length === 0 ? (
          <View style={styles.state}>
            <Ionicons name="checkmark-done-circle-outline" size={60} color={C.textSec} />
            <Text style={[styles.stateTitle, { color: C.text }]}>Tout vu !</Text>
            <Text style={[styles.stateBody, { color: C.textSec }]}>
              Vous avez parcouru tous les films disponibles
            </Text>
            <TouchableOpacity
              style={[styles.retryBtn, { backgroundColor: C.accent }]}
              onPress={() => initialize()}
              activeOpacity={0.8}
            >
              <Text style={styles.retryText}>Recommencer</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Rendre du bas vers le haut pour que la top card soit au-dessus
          [...visible].reverse().map((movie, revIdx) => {
            const deckIdx = visible.length - 1 - revIdx;
            return (
              <MovieCard
                key={movie.id}
                movie={movie}
                isTop={deckIdx === 0}
                deckIndex={deckIdx}
                onSwipeLeft={handleLeft}
                onSwipeRight={handleRight}
                onSwipeUp={handleUp}
                onTap={handleTap}
                onSwipeComplete={handleComplete}
              />
            );
          })
        )}
      </View>

      {/* ── Action buttons (Figma: y≈568) ── */}
      {visible.length > 0 && (
        <View style={styles.buttons}>
          <SwipeButtons
            onSkip={handleSkipBtn}
            onIndiff={handleIndiffBtn}
            onLike={handleLikeBtn}
          />
        </View>
      )}

      {/* ── Rating modal (swipe haut) ── */}
      <Modal
        visible={ratingModal !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setRatingModal(null)}
      >
        <View style={styles.overlay}>
          <View style={[styles.modalCard, { backgroundColor: C.surface }]}>
            <Text style={[styles.modalTitle, { color: C.text }]}>Votre note</Text>
            <Text style={[styles.modalMovie, { color: C.textSec }]} numberOfLines={2}>
              {ratingModal?.title}
            </Text>
            <StarRating
              rating={pendingRating}
              interactive
              starSize={40}
              color={C.gold}
              onRate={setPendingRating}
            />
            <Text style={[styles.modalRating, { color: C.gold }]}>
              {pendingRating} / 5
            </Text>
            <View style={styles.modalRow}>
              <TouchableOpacity
                style={[styles.modalBtn, { borderColor: C.badge, borderWidth: 1 }]}
                onPress={() => setRatingModal(null)}
                activeOpacity={0.8}
              >
                <Text style={[styles.modalBtnTxt, { color: C.textSec }]}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: C.accent }]}
                onPress={confirmRating}
                activeOpacity={0.8}
              >
                <Text style={[styles.modalBtnTxt, { color: '#fff' }]}>Confirmer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Filter modal ── */}
      <Modal
        visible={filterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterModal(false)}
      >
        <View style={styles.overlay}>
          <View
            style={[
              styles.filterSheet,
              { backgroundColor: C.surface, paddingBottom: insets.bottom + SPACING.md },
            ]}
          >
            <View style={styles.filterHeader}>
              <Text style={[styles.filterTitle, { color: C.text }]}>Filtrer par genre</Text>
              <TouchableOpacity onPress={() => setFilterModal(false)}>
                <Ionicons name="close" size={22} color={C.textSec} />
              </TouchableOpacity>
            </View>
            <ScrollView
              contentContainerStyle={styles.genreGrid}
              showsVerticalScrollIndicator={false}
            >
              {TMDB_GENRES.map((g) => (
                <GenrePill
                  key={g.id}
                  genreId={g.id}
                  selected={tempGenres.includes(g.id)}
                  onPress={() =>
                    setTempGenres((prev) =>
                      prev.includes(g.id)
                        ? prev.filter((x) => x !== g.id)
                        : [...prev, g.id]
                    )
                  }
                />
              ))}
            </ScrollView>
            <View style={styles.filterFooter}>
              <TouchableOpacity
                style={[styles.filterClear, { borderColor: C.badge, borderWidth: 1 }]}
                onPress={() => setTempGenres([])}
                activeOpacity={0.8}
              >
                <Text style={[styles.filterClearTxt, { color: C.textSec }]}>Tout effacer</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterApply, { backgroundColor: C.accent }]}
                onPress={applyFilter}
                activeOpacity={0.8}
              >
                <Text style={styles.filterApplyTxt}>
                  Appliquer{tempGenres.length > 0 ? ` (${tempGenres.length})` : ''}
                </Text>
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

  // App bar — Figma: logo centré, filtre bouton droit
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    justifyContent: 'center',
  },
  logo: {
    flex: 1,
    textAlign: 'center',
    fontSize: FONT_SIZE.xxxl,   // 24px
    fontWeight: FONT_WEIGHT.bold,
  },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterDotText: { color: '#fff', fontSize: 9, fontWeight: FONT_WEIGHT.bold },

  // Deck — centré, prend toute la hauteur disponible
  deck: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Buttons area
  buttons: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingTop: SPACING.xl,
  },

  // Empty / error states
  state: {
    alignItems: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.xl,
  },
  stateTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    textAlign: 'center',
  },
  stateBody: {
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryBtn: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.btn,
    marginTop: SPACING.sm,
  },
  retryText: {
    color: '#fff',
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semiBold,
  },

  // Overlay + modal card
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.62)',
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
  modalTitle:  { fontSize: FONT_SIZE.xxl, fontWeight: FONT_WEIGHT.bold },
  modalMovie:  { fontSize: FONT_SIZE.md, textAlign: 'center' },
  modalRating: { fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.bold },
  modalRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    width: '100%',
    marginTop: SPACING.sm,
  },
  modalBtn: {
    flex: 1,
    height: LAYOUT.ctaBtnH,
    borderRadius: RADIUS.btn,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnTxt: { fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.semiBold },

  // Filter bottom sheet
  filterSheet: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    paddingTop: SPACING.lg,
    maxHeight: SH * 0.72,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  filterTitle: { fontSize: FONT_SIZE.xxl, fontWeight: FONT_WEIGHT.bold },
  genreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
    paddingBottom: SPACING.lg,
  },
  filterFooter: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    gap: SPACING.sm,
  },
  filterClear: {
    flex: 1,
    height: LAYOUT.ctaBtnH,
    borderRadius: RADIUS.btn,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterClearTxt: { fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.semiBold },
  filterApply: {
    flex: 2,
    height: LAYOUT.ctaBtnH,
    borderRadius: RADIUS.btn,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterApplyTxt: { color: '#fff', fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.semiBold },
});
