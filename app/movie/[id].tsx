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
import { Image }             from 'expo-image';
import { LinearGradient }    from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons }          from '@expo/vector-icons';
import * as WebBrowser       from 'expo-web-browser';
import { useMovieStore }     from '../../hooks/useMovieStore';
import { useMovieDetail }    from '../../hooks/useWatchProviders';
import {
  DARK_THEME, LIGHT_THEME,
  SPACING, FONT_SIZE, FONT_WEIGHT, RADIUS, LAYOUT, SHADOW,
} from '../../constants/theme';
import { backdropUrl, profileUrl, tmdb } from '../../services/tmdb';
import { CastMember, Genre } from '../../types/movie';

const { width: largeurEcran } = Dimensions.get('window');
const HAUTEUR_HERO = 260;
const LARGEUR_CAST = 76;

export default function MovieDetailScreen() {
  const { id }   = useLocalSearchParams<{ id: string }>();
  const insets   = useSafeAreaInsets();
  const router   = useRouter();
  const theme    = useMovieStore((s) => s.theme);
  const couleurs = theme === 'dark' ? DARK_THEME : LIGHT_THEME;

  const idFilm = parseInt(id ?? '0');
  const { film, chargement, erreur } = useMovieDetail(idFilm);
  const { addToWatchlist, markAsWatched, ignore, isInWatchlist, isWatched } = useMovieStore();

  const [synopsisEtendu, setSynopsisEtendu] = useState(false);
  const [trailerEnCours, setTrailerEnCours] = useState(false);

  const dansLaListe  = isInWatchlist(idFilm);
  const dejaVu       = isWatched(idFilm);

  async function ouvrirTrailer() {
    if (!film) return;
    setTrailerEnCours(true);
    try {
      const cle = await tmdb.getYoutubeTrailerKey(film.id);
      if (cle) await WebBrowser.openBrowserAsync(`https://www.youtube.com/watch?v=${cle}`);
    } finally {
      setTrailerEnCours(false);
    }
  }

  function ajouterAVoir()  { if (film && !dansLaListe) addToWatchlist(film); }
  function marquerVu()     { if (film) markAsWatched(film, 3); }
  function ignorerFilm()   { if (film) { ignore(film.id); router.back(); } }

  if (chargement) {
    return (
      <View style={[styles.centre, { backgroundColor: couleurs.bg }]}>
        <ActivityIndicator size="large" color={couleurs.accent} />
      </View>
    );
  }

  if (erreur || !film) {
    return (
      <View style={[styles.centre, { backgroundColor: couleurs.bg }]}>
        <Ionicons name="alert-circle-outline" size={56} color={couleurs.textSec} />
        <Text style={[styles.txtErreur, { color: couleurs.text }]}>Film introuvable</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: couleurs.accent, fontSize: FONT_SIZE.md }}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const realisateur = tmdb.getDirector(film);
  const duree       = film.runtime ? tmdb.formatRuntime(film.runtime) : '';
  const annee       = tmdb.getReleaseYear(film);
  const imageHero   = backdropUrl(film.backdrop_path ?? film.poster_path) ?? undefined;
  const casting     = film.credits?.cast.slice(0, 12) ?? [];

  // Convertir la note TMDB /10 en étoiles /5
  const nbEtoiles = Math.round(film.vote_average / 2);
  const etoiles   = '★'.repeat(nbEtoiles) + '☆'.repeat(5 - nbEtoiles);

  function rendreMembre({ item }: { item: CastMember }) {
    const photo = profileUrl(item.profile_path, 'w185');
    return (
      <View style={styles.membreCast}>
        <View style={[styles.photoCast, { backgroundColor: couleurs.card }]}>
          {photo ? (
            <Image source={{ uri: photo }} style={StyleSheet.absoluteFill} contentFit="cover" transition={150} />
          ) : (
            <Ionicons name="person" size={24} color={couleurs.textSec} />
          )}
        </View>
        <Text style={[styles.nomCast, { color: couleurs.textSec }]} numberOfLines={2}>
          {item.name}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: couleurs.bg }]}>
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>

        {/* Image hero avec dégradé */}
        <View style={styles.hero}>
          <Image source={{ uri: imageHero }} style={StyleSheet.absoluteFill} contentFit="cover" transition={300} />
          <LinearGradient
            colors={['transparent', couleurs.bg]}
            style={styles.degrade}
            locations={[0.55, 1]}
          />
          <TouchableOpacity
            style={[styles.boutonRetour, { top: insets.top + 36 }]}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={[styles.txtRetour, { color: couleurs.textSec }]}>← Retour</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.boutonTrailer} onPress={ouvrirTrailer} activeOpacity={0.8}>
            {trailerEnCours
              ? <ActivityIndicator size="small" color="#fff" />
              : <Text style={styles.txtTrailer}>▶  Voir la bande-annonce</Text>
            }
          </TouchableOpacity>
        </View>

        {/* Contenu */}
        <View style={styles.corps}>

          <Text style={[styles.titre, { color: couleurs.text }]}>{film.title}</Text>

          <Text style={[styles.meta, { color: couleurs.textSec }]}>
            {[annee, duree, realisateur !== 'Inconnu' ? realisateur : null].filter(Boolean).join('  ·  ')}
          </Text>

          <Text style={[styles.note, { color: couleurs.gold }]}>
            {`${etoiles}  ${film.vote_average.toFixed(1)}/10`}
          </Text>

          {(film.genres ?? []).length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.genres}>
              {(film.genres ?? []).map((genre: Genre) => (
                <View key={genre.id} style={[styles.pillGenre, { backgroundColor: couleurs.card }]}>
                  <Text style={[styles.txtGenre, { color: couleurs.textSec }]}>{genre.name}</Text>
                </View>
              ))}
            </ScrollView>
          )}

          {film.overview ? (
            <View>
              <Text style={[styles.sousTitre, { color: couleurs.text }]}>Synopsis</Text>
              <Text
                style={[styles.synopsis, { color: couleurs.textSec }]}
                numberOfLines={synopsisEtendu ? undefined : 3}
              >
                {film.overview}
              </Text>
              {film.overview.length > 180 && (
                <TouchableOpacity onPress={() => setSynopsisEtendu((prev) => !prev)}>
                  <Text style={[styles.voirPlus, { color: couleurs.accent }]}>
                    {synopsisEtendu ? 'Voir moins' : 'Voir plus'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : null}

          {casting.length > 0 && (
            <View>
              <Text style={[styles.sousTitre, { color: couleurs.text }]}>Casting</Text>
              <FlatList
                data={casting}
                renderItem={rendreMembre}
                keyExtractor={(membre) => String(membre.id)}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: SPACING.sm, paddingRight: SPACING.lg }}
              />
            </View>
          )}

          <TouchableOpacity
            style={[styles.boutonOuRegarder, { backgroundColor: couleurs.card }]}
            onPress={() => router.push({ pathname: '/movie/where-to-watch', params: { id: idFilm, title: film.title } })}
            activeOpacity={0.8}
          >
            <Ionicons name="tv-outline" size={18} color={couleurs.accent} />
            <Text style={[styles.txtOuRegarder, { color: couleurs.text }]}>Où regarder ?</Text>
            <Ionicons name="chevron-forward" size={16} color={couleurs.textSec} />
          </TouchableOpacity>

          <View style={styles.rangeeActions}>
            <TouchableOpacity
              style={[styles.btnAction, {
                backgroundColor: dejaVu ? couleurs.card : couleurs.watchedBtn,
                borderColor: dejaVu ? couleurs.green : 'transparent',
                borderWidth: dejaVu ? 1 : 0,
              }]}
              onPress={marquerVu}
              activeOpacity={0.85}
            >
              <Text style={[styles.txtAction, { color: dejaVu ? couleurs.green : couleurs.textSec }]}>
                {dejaVu ? '✓ Vu' : '✓  Déjà vu'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btnAction, { backgroundColor: couleurs.accent }]}
              onPress={ignorerFilm}
              activeOpacity={0.85}
            >
              <Text style={[styles.txtAction, { color: '#fff' }]}>Indifférent</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btnAction, {
                backgroundColor: dansLaListe ? couleurs.card : couleurs.watchlistBtn,
                borderColor: dansLaListe ? couleurs.green : 'transparent',
                borderWidth: dansLaListe ? 1 : 0,
              }]}
              onPress={ajouterAVoir}
              activeOpacity={0.85}
            >
              <Text style={[styles.txtAction, { color: dansLaListe ? couleurs.green : '#fff' }]}>
                {dansLaListe ? '♥ Ajouté' : '♥  À voir'}
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
  centre:    { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.md },
  txtErreur: { fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.semiBold },

  hero: {
    width:    largeurEcran,
    height:   HAUTEUR_HERO,
    position: 'relative',
  },
  degrade: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    height: 120,
  },
  boutonRetour: {
    position: 'absolute',
    left:     SPACING.lg,
  },
  txtRetour: {
    fontSize:   FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.medium,
  },
  boutonTrailer: {
    position:  'absolute',
    bottom:    24,
    alignSelf: 'center',
  },
  txtTrailer: {
    color:      '#fff',
    fontSize:   FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semiBold,
  },

  corps: {
    paddingHorizontal: SPACING.lg,
    paddingTop:        SPACING.md,
    gap:               SPACING.md,
  },
  titre: {
    fontSize:   FONT_SIZE.xxxl,
    fontWeight: FONT_WEIGHT.bold,
    lineHeight: 30,
  },
  meta: { fontSize: FONT_SIZE.sm },
  note: {
    fontSize:      FONT_SIZE.md,
    fontWeight:    FONT_WEIGHT.semiBold,
    letterSpacing: 1,
  },

  genres: {
    gap:          SPACING.sm,
    paddingRight: SPACING.lg,
  },
  pillGenre: {
    paddingHorizontal: SPACING.sm,
    paddingVertical:   4,
    borderRadius:      RADIUS.full,
  },
  txtGenre: { fontSize: FONT_SIZE.sm },

  sousTitre: {
    fontSize:     FONT_SIZE.lg,
    fontWeight:   FONT_WEIGHT.semiBold,
    marginBottom: SPACING.sm,
  },
  synopsis: {
    fontSize:   FONT_SIZE.md,
    lineHeight: 22,
  },
  voirPlus: {
    fontSize:   FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semiBold,
    marginTop:  SPACING.xs,
  },

  membreCast: {
    width:      LARGEUR_CAST,
    alignItems: 'center',
    gap:        6,
  },
  photoCast: {
    width:          LARGEUR_CAST,
    height:         LARGEUR_CAST,
    borderRadius:   RADIUS.card,
    overflow:       'hidden',
    alignItems:     'center',
    justifyContent: 'center',
  },
  nomCast: {
    fontSize:   FONT_SIZE.xxs,
    textAlign:  'center',
    lineHeight: 14,
  },

  boutonOuRegarder: {
    flexDirection: 'row',
    alignItems:    'center',
    padding:       SPACING.md,
    borderRadius:  RADIUS.item,
    gap:           SPACING.sm,
  },
  txtOuRegarder: {
    flex:       1,
    fontSize:   FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
  },

  rangeeActions: {
    flexDirection: 'row',
    gap:           SPACING.sm,
    marginTop:     SPACING.sm,
  },
  btnAction: {
    flex:           1,
    height:         LAYOUT.ctaBtnH,
    borderRadius:   RADIUS.btn,
    alignItems:     'center',
    justifyContent: 'center',
  },
  txtAction: {
    fontSize:   FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semiBold,
  },
});
