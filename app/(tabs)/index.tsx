import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MovieCard, MovieCardSkeleton } from '../../components/MovieCard';
import { SwipeButtons }                 from '../../components/SwipeButtons';
import { StarRating }                   from '../../components/StarRating';
import { GenrePill }                    from '../../components/GenrePill';
import { useMovies }                    from '../../hooks/useMovies';
import { useMovieStore }                from '../../hooks/useMovieStore';
import {
  DARK_THEME, LIGHT_THEME,
  SPACING, FONT_SIZE, FONT_WEIGHT, RADIUS, LAYOUT,
} from '../../constants/theme';
import { Movie, TMDB_GENRES } from '../../types/movie';

const { width: largeurEcran, height: hauteurEcran } = Dimensions.get('window');
const MAX_CARTES_VISIBLES = 5;

export default function SwipeScreen() {
  const insets  = useSafeAreaInsets();
  const router  = useRouter();
  const theme   = useMovieStore((s) => s.theme);
  const couleurs = theme === 'dark' ? DARK_THEME : LIGHT_THEME;

  const {
    addToWatchlist, markAsWatched, ignore,
    selectedGenres, setSelectedGenres,
  } = useMovieStore();

  const { films, chargement, erreur, initialiser, surCarteConsommee, supprimerPremierFilm } = useMovies();

  const [filmANoter, setFilmANoter]             = useState<Movie | null>(null);
  const [noteEnAttente, setNoteEnAttente]        = useState(3);
  const swipeEnCours                            = useRef(false);
  const [modalFiltreVisible, setModalFiltre]    = useState(false);
  const [genresTemp, setGenresTemp]             = useState<number[]>([]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { initialiser(); }, []);

  const filmsVisibles = films.slice(0, MAX_CARTES_VISIBLES);

  // Retire la première carte du deck et vérifie si on doit précharger la suite
  function terminerCarte() {
    supprimerPremierFilm();
    surCarteConsommee(films.length - 1);
  }

  // Swipe droite : ajouter à la liste à voir
  function swipeDroite(film: Movie) {
    addToWatchlist(film);
  }

  // Swipe gauche : déjà vu → ouvre le modal de notation
  function swipeGauche(film: Movie) {
    swipeEnCours.current = true;
    setNoteEnAttente(3);
    setFilmANoter(film);
  }

  // Swipe haut : ignorer ce film
  function swipeHaut(film: Movie) {
    ignore(film.id);
  }

  // Tap sur la carte : ouvre la fiche détaillée
  function ouvrirFiche(film: Movie) {
    router.push({ pathname: '/movie/[id]', params: { id: film.id } });
  }

  // Bouton "Déjà vu" : ouvre le modal (la carte reste en place jusqu'à confirmation)
  function boutonDejaVu() {
    if (!filmsVisibles[0]) return;
    swipeEnCours.current = false;
    setNoteEnAttente(3);
    setFilmANoter(filmsVisibles[0]);
  }

  // Bouton "Indifférent" : ignorer sans notation
  function boutonIndifferent() {
    if (!filmsVisibles[0]) return;
    ignore(filmsVisibles[0].id);
    terminerCarte();
  }

  // Bouton "À voir" : ajouter à la watchlist
  function boutonAVoir() {
    if (!filmsVisibles[0]) return;
    addToWatchlist(filmsVisibles[0]);
    terminerCarte();
  }

  // Valide la note et retire la carte si elle n'a pas déjà été retirée par le swipe
  function confirmerNote() {
    if (!filmANoter) return;
    markAsWatched(filmANoter, noteEnAttente);
    if (!swipeEnCours.current) terminerCarte();
    setFilmANoter(null);
  }

  // Applique le filtre de genres et recharge le deck
  function appliquerFiltre() {
    setSelectedGenres(genresTemp);
    setModalFiltre(false);
    initialiser(genresTemp);
  }

  // Bascule un genre dans la sélection temporaire
  function toggleGenre(idGenre: number) {
    setGenresTemp((prev) =>
      prev.includes(idGenre) ? prev.filter((x) => x !== idGenre) : [...prev, idGenre]
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: couleurs.bg }]}>

      {/* Barre du haut avec logo et bouton filtre */}
      <View style={[styles.appBar, { paddingTop: insets.top + SPACING.xs }]}>
        <View style={{ width: 40 }} />
        <Text style={[styles.logo, { color: couleurs.accent }]}>CineSwipe</Text>
        <TouchableOpacity
          style={[styles.boutonFiltre, { backgroundColor: couleurs.card }]}
          onPress={() => { setGenresTemp(selectedGenres); setModalFiltre(true); }}
          activeOpacity={0.8}
        >
          <Ionicons name="options-outline" size={18} color={couleurs.text} />
          {selectedGenres.length > 0 && (
            <View style={[styles.pastilleFiltre, { backgroundColor: couleurs.accent }]}>
              <Text style={styles.pastilleTxt}>{selectedGenres.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Deck de cartes */}
      <View style={styles.deck}>
        {chargement && filmsVisibles.length === 0 ? (
          <MovieCardSkeleton />
        ) : erreur && filmsVisibles.length === 0 ? (
          <View style={styles.etat}>
            <Ionicons name="cloud-offline-outline" size={60} color={couleurs.textSec} />
            <Text style={[styles.etatTitre, { color: couleurs.text }]}>Connexion impossible</Text>
            <TouchableOpacity
              style={[styles.boutonReessayer, { backgroundColor: couleurs.accent }]}
              onPress={() => initialiser()}
              activeOpacity={0.8}
            >
              <Text style={styles.boutonReessayerTxt}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        ) : filmsVisibles.length === 0 ? (
          <View style={styles.etat}>
            <Ionicons name="checkmark-done-circle-outline" size={60} color={couleurs.textSec} />
            <Text style={[styles.etatTitre, { color: couleurs.text }]}>Tout vu !</Text>
            <Text style={[styles.etatCorps, { color: couleurs.textSec }]}>
              Vous avez parcouru tous les films disponibles
            </Text>
            <TouchableOpacity
              style={[styles.boutonReessayer, { backgroundColor: couleurs.accent }]}
              onPress={() => initialiser()}
              activeOpacity={0.8}
            >
              <Text style={styles.boutonReessayerTxt}>Recommencer</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Rendu du bas vers le haut pour que la première carte soit au-dessus
          [...filmsVisibles].reverse().map((film, indexInverse) => {
            const indexDeck = filmsVisibles.length - 1 - indexInverse;
            return (
              <MovieCard
                key={film.id}
                movie={film}
                isTop={indexDeck === 0}
                deckIndex={indexDeck}
                onSwipeLeft={swipeGauche}
                onSwipeRight={swipeDroite}
                onSwipeUp={swipeHaut}
                onTap={ouvrirFiche}
                onSwipeComplete={terminerCarte}
              />
            );
          })
        )}
      </View>

      {/* Boutons d'action */}
      {filmsVisibles.length > 0 && (
        <View style={styles.boutons}>
          <SwipeButtons
            onSkip={boutonDejaVu}
            onIndiff={boutonIndifferent}
            onLike={boutonAVoir}
          />
        </View>
      )}

      {/* Modal de notation */}
      <Modal
        visible={filmANoter !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setFilmANoter(null)}
      >
        <View style={styles.overlay}>
          <View style={[styles.carteModal, { backgroundColor: couleurs.surface }]}>
            <Text style={[styles.modalTitre, { color: couleurs.text }]}>Votre note</Text>
            <Text style={[styles.modalFilm, { color: couleurs.textSec }]} numberOfLines={2}>
              {filmANoter?.title}
            </Text>
            <StarRating
              rating={noteEnAttente}
              interactive
              starSize={40}
              color={couleurs.gold}
              onRate={setNoteEnAttente}
            />
            <Text style={[styles.modalNote, { color: couleurs.gold }]}>
              {noteEnAttente} / 5
            </Text>
            <View style={styles.modalBoutons}>
              <TouchableOpacity
                style={[styles.btnModal, { borderColor: couleurs.badge, borderWidth: 1 }]}
                onPress={() => setFilmANoter(null)}
                activeOpacity={0.8}
              >
                <Text style={[styles.btnModalTxt, { color: couleurs.textSec }]}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btnModal, { backgroundColor: couleurs.accent }]}
                onPress={confirmerNote}
                activeOpacity={0.8}
              >
                <Text style={[styles.btnModalTxt, { color: '#fff' }]}>Confirmer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de filtre par genre */}
      <Modal
        visible={modalFiltreVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalFiltre(false)}
      >
        <View style={styles.overlay}>
          <View style={[
            styles.panneauFiltre,
            { backgroundColor: couleurs.surface, paddingBottom: insets.bottom + SPACING.md },
          ]}>
            <View style={styles.filtreEntete}>
              <Text style={[styles.filtreTitre, { color: couleurs.text }]}>Filtrer par genre</Text>
              <TouchableOpacity onPress={() => setModalFiltre(false)}>
                <Ionicons name="close" size={22} color={couleurs.textSec} />
              </TouchableOpacity>
            </View>
            <ScrollView
              contentContainerStyle={styles.grilleSGenres}
              showsVerticalScrollIndicator={false}
            >
              {TMDB_GENRES.map((genre) => (
                <GenrePill
                  key={genre.id}
                  genreId={genre.id}
                  selected={genresTemp.includes(genre.id)}
                  onPress={() => toggleGenre(genre.id)}
                />
              ))}
            </ScrollView>
            <View style={styles.filtrePied}>
              <TouchableOpacity
                style={[styles.btnEffacer, { borderColor: couleurs.badge, borderWidth: 1 }]}
                onPress={() => setGenresTemp([])}
                activeOpacity={0.8}
              >
                <Text style={[styles.btnEffacerTxt, { color: couleurs.textSec }]}>Tout effacer</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btnAppliquer, { backgroundColor: couleurs.accent }]}
                onPress={appliquerFiltre}
                activeOpacity={0.8}
              >
                <Text style={styles.btnAppliquerTxt}>
                  Appliquer{genresTemp.length > 0 ? ` (${genresTemp.length})` : ''}
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

  appBar: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom:     SPACING.md,
    justifyContent:    'center',
  },
  logo: {
    flex:       1,
    textAlign:  'center',
    fontSize:   FONT_SIZE.xxxl,
    fontWeight: FONT_WEIGHT.bold,
  },
  boutonFiltre: {
    width:          40,
    height:         40,
    borderRadius:   20,
    alignItems:     'center',
    justifyContent: 'center',
  },
  pastilleFiltre: {
    position:       'absolute',
    top:            0,
    right:          0,
    width:          16,
    height:         16,
    borderRadius:   8,
    alignItems:     'center',
    justifyContent: 'center',
  },
  pastilleTxt: { color: '#fff', fontSize: 9, fontWeight: FONT_WEIGHT.bold },

  deck: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
  },

  boutons: {
    paddingHorizontal: SPACING.lg,
    paddingBottom:     SPACING.lg,
    paddingTop:        SPACING.xl,
  },

  etat: {
    alignItems:        'center',
    gap:               SPACING.md,
    paddingHorizontal: SPACING.xl,
  },
  etatTitre: {
    fontSize:   FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    textAlign:  'center',
  },
  etatCorps: {
    fontSize:   FONT_SIZE.md,
    textAlign:  'center',
    lineHeight: 22,
  },
  boutonReessayer: {
    paddingHorizontal: SPACING.xl,
    paddingVertical:   SPACING.md,
    borderRadius:      RADIUS.btn,
    marginTop:         SPACING.sm,
  },
  boutonReessayerTxt: {
    color:      '#fff',
    fontSize:   FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semiBold,
  },

  overlay: {
    flex:            1,
    backgroundColor: 'rgba(0,0,0,0.62)',
    justifyContent:  'center',
    alignItems:      'center',
  },
  carteModal: {
    width:        largeurEcran - 48,
    borderRadius: RADIUS.item,
    padding:      SPACING.xl,
    alignItems:   'center',
    gap:          SPACING.md,
  },
  modalTitre: { fontSize: FONT_SIZE.xxl, fontWeight: FONT_WEIGHT.bold },
  modalFilm:  { fontSize: FONT_SIZE.md, textAlign: 'center' },
  modalNote:  { fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.bold },
  modalBoutons: {
    flexDirection: 'row',
    gap:           SPACING.sm,
    width:         '100%',
    marginTop:     SPACING.sm,
  },
  btnModal: {
    flex:           1,
    height:         LAYOUT.ctaBtnH,
    borderRadius:   RADIUS.btn,
    alignItems:     'center',
    justifyContent: 'center',
  },
  btnModalTxt: { fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.semiBold },

  panneauFiltre: {
    position:            'absolute',
    bottom:              0,
    left:                0,
    right:               0,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius:RADIUS.lg,
    paddingTop:          SPACING.lg,
    maxHeight:           hauteurEcran * 0.72,
  },
  filtreEntete: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: SPACING.lg,
    marginBottom:      SPACING.lg,
  },
  filtreTitre:    { fontSize: FONT_SIZE.xxl, fontWeight: FONT_WEIGHT.bold },
  grilleSGenres:  {
    flexDirection:     'row',
    flexWrap:          'wrap',
    paddingHorizontal: SPACING.lg,
    gap:               SPACING.sm,
    paddingBottom:     SPACING.lg,
  },
  filtrePied: {
    flexDirection:     'row',
    paddingHorizontal: SPACING.lg,
    paddingTop:        SPACING.md,
    gap:               SPACING.sm,
  },
  btnEffacer: {
    flex:           1,
    height:         LAYOUT.ctaBtnH,
    borderRadius:   RADIUS.btn,
    alignItems:     'center',
    justifyContent: 'center',
  },
  btnEffacerTxt:  { fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.semiBold },
  btnAppliquer: {
    flex:           2,
    height:         LAYOUT.ctaBtnH,
    borderRadius:   RADIUS.btn,
    alignItems:     'center',
    justifyContent: 'center',
  },
  btnAppliquerTxt: { color: '#fff', fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.semiBold },
});
