/**
 * Écrans 02 · Film Detail — Dark  /  06 · Film Detail — Light
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { Image }              from 'expo-image';
import { LinearGradient }     from 'expo-linear-gradient';
import { useSafeAreaInsets }  from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons }           from '@expo/vector-icons';
import * as WebBrowser        from 'expo-web-browser';
import { useMovieStore }      from '../../hooks/useMovieStore';
import { useMovieDetail }     from '../../hooks/useWatchProviders';
import {
  DARK_THEME, LIGHT_THEME,
  SPACING, FONT_SIZE, FONT_WEIGHT, RADIUS, LAYOUT, SHADOW,
} from '../../constants/theme';
import { backdropUrl, profileUrl, tmdb } from '../../services/tmdb';
import { CastMember }         from '../../types/movie';

const { width: SW, height: SH } = Dimensions.get('window');
const HERO_H   = 260;   // Figma exact
const CAST_W   = 76;    // Figma: 76×76

export default function MovieDetailScreen() {
  const { id }    = useLocalSearchParams<{ id: string }>();
  const insets    = useSafeAreaInsets();
  const router    = useRouter();
  const theme     = useMovieStore((s) => s.theme);
  const C         = theme === 'dark' ? DARK_THEME : LIGHT_THEME;

  const movieId = parseInt(id ?? '0');
  const { movie, loading, error } = useMovieDetail(movieId);
  const { addToWatchlist, markAsWatched, ignore, isInWatchlist, isWatched } = useMovieStore();

  const [expanded, setExpanded]     = useState(false);
  const [trailerBusy, setTrailerBusy] = useState(false);

  const inList    = isInWatchlist(movieId);
  const alreadyWatched = isWatched(movieId);

  const handleTrailer = async () => {
    if (!movie) return;
    setTrailerBusy(true);
    try {
      const key = await tmdb.getYoutubeTrailerKey(movie.id);
      if (key) await WebBrowser.openBrowserAsync(`https://www.youtube.com/watch?v=${key}`);
    } finally {
      setTrailerBusy(false);
    }
  };

  const handleWatchlist = () => { if (movie && !inList) addToWatchlist(movie); };
  const handleWatched   = () => { if (movie) markAsWatched(movie, 3); };
  const handleIgnore    = () => { if (movie) { ignore(movie.id); router.back(); } };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: C.bg }]}>
        <ActivityIndicator size="large" color={C.accent} />
      </View>
    );
  }
  if (error || !movie) {
    return (
      <View style={[styles.centered, { backgroundColor: C.bg }]}>
        <Ionicons name="alert-circle-outline" size={56} color={C.textSec} />
        <Text style={[styles.errorTxt, { color: C.text }]}>Film introuvable</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: C.accent, fontSize: FONT_SIZE.md }}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const director = tmdb.getDirector(movie);
  const runtime  = movie.runtime ? tmdb.formatRuntime(movie.runtime) : '';
  const year     = tmdb.getReleaseYear(movie);
  const heroUri  = backdropUrl(movie.backdrop_path ?? movie.poster_path) ?? undefined;
  const cast     = movie.credits?.cast.slice(0, 12) ?? [];

  // Rating stars display (TMDB /10 → /5)
  const starsN   = Math.round(movie.vote_average / 2);
  const stars    = '★'.repeat(starsN) + '☆'.repeat(5 - starsN);

  const renderCast = ({ item }: { item: CastMember }) => {
    const photoUri = profileUrl(item.profile_path, 'w185');
    return (
      <View style={styles.castItem}>
        <View style={[styles.castPhoto, { backgroundColor: C.card }]}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={StyleSheet.absoluteFill} contentFit="cover" transition={150} />
          ) : (
            <Ionicons name="person" size={24} color={C.textSec} />
          )}
        </View>
        <Text style={[styles.castName, { color: C.textSec }]} numberOfLines={2}>
          {item.name}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: C.bg }]}>
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        {/* ── Hero 390×260 (Figma) ── */}
        <View style={styles.hero}>
          <Image source={{ uri: heroUri }} style={StyleSheet.absoluteFill} contentFit="cover" transition={300} />

          {/* Gradient bas du hero (Figma: 80px bas = opaque bg) */}
          <LinearGradient
            colors={['transparent', C.bg]}
            style={styles.heroGradient}
            locations={[0.55, 1]}
          />

          {/* ← Retour — Figma: 14px medium textSec à y=50 */}
          <TouchableOpacity
            style={[styles.back, { top: insets.top + 36 }]}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={[styles.backTxt, { color: C.textSec }]}>← Retour</Text>
          </TouchableOpacity>

          {/* ▶ Voir la bande-annonce — Figma: 13px semibold centré à y=232 */}
          <TouchableOpacity
            style={styles.trailerBtn}
            onPress={handleTrailer}
            activeOpacity={0.8}
          >
            {trailerBusy
              ? <ActivityIndicator size="small" color="#fff" />
              : <Text style={styles.trailerTxt}>▶  Voir la bande-annonce</Text>
            }
          </TouchableOpacity>
        </View>

        {/* ── Content ── */}
        <View style={styles.body}>
          {/* Titre 24px Bold */}
          <Text style={[styles.title, { color: C.text }]}>{movie.title}</Text>

          {/* Meta : année · durée · réalisateur — 12px textSec */}
          <Text style={[styles.meta, { color: C.textSec }]}>
            {[year, runtime, director !== 'Inconnu' ? director : null].filter(Boolean).join('  ·  ')}
          </Text>

          {/* Rating — 13px semibold gold */}
          <Text style={[styles.rating, { color: C.gold }]}>
            {`${stars}  ${movie.vote_average.toFixed(1)}/10`}
          </Text>

          {/* Genres — pills textSec */}
          {(movie.genres ?? []).length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.genres}>
              {(movie.genres ?? []).map((g) => (
                <View key={g.id} style={[styles.genrePill, { backgroundColor: C.card }]}>
                  <Text style={[styles.genreTxt, { color: C.textSec }]}>{g.name}</Text>
                </View>
              ))}
            </ScrollView>
          )}

          {/* Synopsis */}
          {movie.overview ? (
            <View>
              <Text style={[styles.sectionTitle, { color: C.text }]}>Synopsis</Text>
              <Text
                style={[styles.synopsis, { color: C.textSec }]}
                numberOfLines={expanded ? undefined : 3}
              >
                {movie.overview}
              </Text>
              {movie.overview.length > 180 && (
                <TouchableOpacity onPress={() => setExpanded((p) => !p)}>
                  <Text style={[styles.readMore, { color: C.accent }]}>
                    {expanded ? 'Voir moins' : 'Voir plus'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : null}

          {/* Casting */}
          {cast.length > 0 && (
            <View>
              <Text style={[styles.sectionTitle, { color: C.text }]}>Casting</Text>
              <FlatList
                data={cast}
                renderItem={renderCast}
                keyExtractor={(c) => String(c.id)}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: SPACING.sm, paddingRight: SPACING.lg }}
                ItemSeparatorComponent={() => null}
              />
            </View>
          )}

          {/* Où regarder */}
          <TouchableOpacity
            style={[styles.whereBtn, { backgroundColor: C.card }]}
            onPress={() =>
              router.push({
                pathname: '/movie/where-to-watch',
                params: { id: movieId, title: movie.title },
              })
            }
            activeOpacity={0.8}
          >
            <Ionicons name="tv-outline" size={18} color={C.accent} />
            <Text style={[styles.whereTxt, { color: C.text }]}>Où regarder ?</Text>
            <Ionicons name="chevron-forward" size={16} color={C.textSec} />
          </TouchableOpacity>

          {/* ── 3 CTA buttons — Figma: 118×48 radius=24 ── */}
          {/* [Déjà vu — badge] [Indiférent — accent] [♥ À voir — green] */}
          <View style={styles.ctaRow}>
            {/* Déjà vu */}
            <TouchableOpacity
              style={[
                styles.ctaBtn,
                {
                  backgroundColor: alreadyWatched ? C.card : C.watchedBtn,
                  borderColor: alreadyWatched ? C.green : 'transparent',
                  borderWidth: alreadyWatched ? 1 : 0,
                },
              ]}
              onPress={handleWatched}
              activeOpacity={0.85}
            >
              <Text style={[styles.ctaTxt, { color: alreadyWatched ? C.green : C.textSec }]}>
                {alreadyWatched ? '✓ Vu' : '✓  Déjà vu'}
              </Text>
            </TouchableOpacity>

            {/* Indiférent — rouge plein (Figma: bg=#e51a1a) */}
            <TouchableOpacity
              style={[styles.ctaBtn, { backgroundColor: C.accent }]}
              onPress={handleIgnore}
              activeOpacity={0.85}
            >
              <Text style={[styles.ctaTxt, { color: '#fff' }]}>Indiférent</Text>
            </TouchableOpacity>

            {/* À voir — vert plein */}
            <TouchableOpacity
              style={[
                styles.ctaBtn,
                {
                  backgroundColor: inList ? C.card : C.watchlistBtn,
                  borderColor: inList ? C.green : 'transparent',
                  borderWidth: inList ? 1 : 0,
                },
              ]}
              onPress={handleWatchlist}
              activeOpacity={0.85}
            >
              <Text style={[styles.ctaTxt, { color: inList ? C.green : '#fff' }]}>
                {inList ? '♥ Ajouté' : '♥  À voir'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: insets.bottom + SPACING.xl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered:  { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.md },
  errorTxt:  { fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.semiBold },

  // Hero — Figma: 390×260 full width
  hero: {
    width: SW,
    height: HERO_H,
    position: 'relative',
  },
  heroGradient: {
    position: 'absolute',
    left: 0, right: 0,
    bottom: 0,
    height: 120,
  },
  back: {
    position: 'absolute',
    left: SPACING.lg,
  },
  backTxt: {
    fontSize: FONT_SIZE.lg,    // 14px
    fontWeight: FONT_WEIGHT.medium,
  },
  trailerBtn: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
  },
  trailerTxt: {
    color: '#fff',
    fontSize: FONT_SIZE.md,    // 13px
    fontWeight: FONT_WEIGHT.semiBold,
  },

  // Body
  body: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    gap: SPACING.md,
  },

  title: {
    fontSize: FONT_SIZE.xxxl,  // 24px
    fontWeight: FONT_WEIGHT.bold,
    lineHeight: 30,
  },
  meta: {
    fontSize: FONT_SIZE.sm,    // 12px
  },
  rating: {
    fontSize: FONT_SIZE.md,    // 13px
    fontWeight: FONT_WEIGHT.semiBold,
    letterSpacing: 1,
  },

  genres: {
    gap: SPACING.sm,
    paddingRight: SPACING.lg,
  },
  genrePill: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  genreTxt: {
    fontSize: FONT_SIZE.sm,    // 12px
  },

  sectionTitle: {
    fontSize: FONT_SIZE.lg,    // 14px
    fontWeight: FONT_WEIGHT.semiBold,
    marginBottom: SPACING.sm,
  },
  synopsis: {
    fontSize: FONT_SIZE.md,    // 13px
    lineHeight: 22,
  },
  readMore: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semiBold,
    marginTop: SPACING.xs,
  },

  // Cast — Figma: 76×76 radius=12
  castItem: {
    width: CAST_W,
    alignItems: 'center',
    gap: 6,
  },
  castPhoto: {
    width: CAST_W,
    height: CAST_W,
    borderRadius: RADIUS.card,  // 12px
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  castName: {
    fontSize: FONT_SIZE.xxs,   // 10px
    textAlign: 'center',
    lineHeight: 14,
  },

  whereBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.item,
    gap: SPACING.sm,
  },
  whereTxt: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
  },

  // CTA row — Figma: 3 buttons 118×48 radius=24
  ctaRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  ctaBtn: {
    flex: 1,
    height: LAYOUT.ctaBtnH,   // 48px
    borderRadius: RADIUS.btn, // 24px
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaTxt: {
    fontSize: FONT_SIZE.md,   // 13-14px
    fontWeight: FONT_WEIGHT.semiBold,
  },
});
