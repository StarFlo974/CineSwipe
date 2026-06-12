import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useMovieStore }    from '../../hooks/useMovieStore';
import { useWatchProviders } from '../../hooks/useWatchProviders';
import { DARK_THEME, LIGHT_THEME, SPACING, FONT_SIZE, RADIUS } from '../../constants/theme';
import { TMDBStreamingCard } from '../../components/StreamingCard';
import { CinemaCard, CinemaCardSkeleton, Cinema } from '../../components/CinemaCard';
import { WatchProvider } from '../../types/movie';

// Cinémas fictifs — à remplacer par un vrai appel API de cinémas
const CINEMAS_MOCK: Cinema[] = [
  { name: 'UGC Ciné Cité',    address: '2 Place de la Défense, 92800 Puteaux', distance: 0.8, nextShowtime: '14h30' },
  { name: 'Pathé Gaumont',    address: '5 Av. des Ternes, 75017 Paris',        distance: 1.4, nextShowtime: '16h00' },
  { name: 'MK2 Bibliothèque', address: '128-162 Av. de France, 75013 Paris',   distance: 2.1, nextShowtime: '17h45' },
  { name: 'Cinéma Le Rex',    address: '12 Rue de la Paix, 75002 Paris',       distance: 3.2, nextShowtime: '20h15' },
];

export default function WhereToWatchScreen() {
  const { id, title } = useLocalSearchParams<{ id: string; title: string }>();
  const insets   = useSafeAreaInsets();
  const router   = useRouter();
  const theme    = useMovieStore((s) => s.theme);
  const couleurs = theme === 'dark' ? DARK_THEME : LIGHT_THEME;

  const idFilm = parseInt(id ?? '0');
  const { fournisseurs, chargement } = useWatchProviders(idFilm);

  const [localisationAccordee, setLocalisationAccordee] = useState<boolean | null>(null);
  const [cinemas, setCinemas]                           = useState<Cinema[]>([]);
  const [cinemasEnChargement, setCinemasEnChargement]   = useState(false);

  useEffect(() => {
    async function demanderLocalisation() {
      setCinemasEnChargement(true);
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          setLocalisationAccordee(true);
          // En production, appeler une API cinémas avec les coordonnées GPS
          setCinemas([...CINEMAS_MOCK].sort((a, b) => a.distance - b.distance));
        } else {
          setLocalisationAccordee(false);
        }
      } catch {
        setLocalisationAccordee(false);
      } finally {
        setCinemasEnChargement(false);
      }
    }
    demanderLocalisation();
  }, []);

  // Supprime les doublons dans une liste de fournisseurs
  function dedoublonner(liste: WatchProvider[]): WatchProvider[] {
    const dejaVus = new Set<number>();
    return liste.filter((fournisseur) => {
      if (dejaVus.has(fournisseur.provider_id)) return false;
      dejaVus.add(fournisseur.provider_id);
      return true;
    });
  }

  const enStreaming = dedoublonner(fournisseurs?.flatrate ?? []);
  const enLocation  = dedoublonner(fournisseurs?.rent ?? []);
  const enAchat     = dedoublonner(fournisseurs?.buy ?? []);

  return (
    <View style={[styles.container, { backgroundColor: couleurs.bg }]}>

      {/* En-tête */}
      <View style={[styles.entete, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity
          style={[styles.boutonRetour, { backgroundColor: couleurs.surface }]}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={22} color={couleurs.text} />
        </TouchableOpacity>
        <View style={styles.titreEntete}>
          <Text style={[styles.titre, { color: couleurs.text }]}>Où regarder</Text>
          {title && (
            <Text style={[styles.titrFilm, { color: couleurs.textSec }]} numberOfLines={1}>
              {title}
            </Text>
          )}
        </View>
      </View>

      {chargement ? (
        <View style={styles.chargementVue}>
          <ActivityIndicator size="large" color={couleurs.accent} />
          <Text style={[styles.txtChargement, { color: couleurs.textSec }]}>
            Recherche des disponibilités...
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.contenu, { paddingBottom: insets.bottom + SPACING.xl }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Streaming inclus */}
          <View style={[styles.section, { backgroundColor: couleurs.surface }]}>
            <View style={styles.enteteSection}>
              <View style={[styles.iconeSection, { backgroundColor: couleurs.green + '20' }]}>
                <Ionicons name="play-circle" size={20} color={couleurs.green} />
              </View>
              <Text style={[styles.titreSection, { color: couleurs.text }]}>Streaming inclus</Text>
            </View>
            {enStreaming.length > 0 ? (
              enStreaming.map((p) => <TMDBStreamingCard key={p.provider_id} provider={p} type="streaming" />)
            ) : (
              <View style={styles.indisponible}>
                <Text style={[styles.txtIndisponible, { color: couleurs.textSec }]}>
                  Non disponible en streaming en France actuellement
                </Text>
              </View>
            )}
          </View>

          {/* Location et achat */}
          <View style={[styles.section, { backgroundColor: couleurs.surface }]}>
            <View style={styles.enteteSection}>
              <View style={[styles.iconeSection, { backgroundColor: couleurs.gold + '20' }]}>
                <Ionicons name="cart" size={20} color={couleurs.gold} />
              </View>
              <Text style={[styles.titreSection, { color: couleurs.text }]}>Location & Achat</Text>
            </View>
            {enLocation.length > 0 || enAchat.length > 0 ? (
              <>
                {enLocation.length > 0 && (
                  <View>
                    <Text style={[styles.sousTitreSection, { color: couleurs.textSec }]}>Location</Text>
                    {enLocation.map((p) => <TMDBStreamingCard key={p.provider_id} provider={p} type="rent" />)}
                  </View>
                )}
                {enAchat.length > 0 && (
                  <View>
                    <Text style={[styles.sousTitreSection, { color: couleurs.textSec }]}>Achat</Text>
                    {enAchat.map((p) => <TMDBStreamingCard key={p.provider_id} provider={p} type="buy" />)}
                  </View>
                )}
              </>
            ) : (
              <View style={styles.indisponible}>
                <Text style={[styles.txtIndisponible, { color: couleurs.textSec }]}>
                  Non disponible à la vente/location en France actuellement
                </Text>
              </View>
            )}
          </View>

          {/* Cinémas à proximité */}
          <View style={[styles.section, { backgroundColor: couleurs.surface }]}>
            <View style={styles.enteteSection}>
              <View style={[styles.iconeSection, { backgroundColor: couleurs.accent + '20' }]}>
                <Ionicons name="film" size={20} color={couleurs.accent} />
              </View>
              <Text style={[styles.titreSection, { color: couleurs.text }]}>Cinémas à proximité</Text>
            </View>
            {cinemasEnChargement ? (
              <>
                <CinemaCardSkeleton />
                <CinemaCardSkeleton />
              </>
            ) : localisationAccordee === false ? (
              <View style={styles.indisponible}>
                <Ionicons name="location-outline" size={32} color={couleurs.textSec} />
                <Text style={[styles.txtIndisponible, { color: couleurs.textSec }]}>
                  Accès à la localisation requis pour afficher les cinémas proches
                </Text>
              </View>
            ) : cinemas.length === 0 ? (
              <View style={styles.indisponible}>
                <Text style={[styles.txtIndisponible, { color: couleurs.textSec }]}>
                  Aucun cinéma disponible à proximité
                </Text>
              </View>
            ) : (
              cinemas.map((cinema) => <CinemaCard key={cinema.name} cinema={cinema} />)
            )}
          </View>

          <Text style={[styles.attribution, { color: couleurs.textSec }]}>
            Données streaming fournies par TMDB. Les disponibilités peuvent varier.
          </Text>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  entete: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom:     SPACING.lg,
    gap:               SPACING.md,
  },
  boutonRetour: {
    width:          40,
    height:         40,
    borderRadius:   20,
    alignItems:     'center',
    justifyContent: 'center',
  },
  titreEntete: { flex: 1, gap: 2 },
  titre:       { fontSize: FONT_SIZE.xl, fontWeight: '700' },
  titrFilm:    { fontSize: FONT_SIZE.sm },

  chargementVue: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    gap:            SPACING.md,
  },
  txtChargement: { fontSize: FONT_SIZE.md },

  contenu: {
    paddingHorizontal: SPACING.lg,
    gap:               SPACING.md,
  },
  section: {
    borderRadius: RADIUS.lg,
    padding:      SPACING.md,
    gap:          SPACING.sm,
  },
  enteteSection: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           SPACING.sm,
    marginBottom:  SPACING.xs,
  },
  iconeSection: {
    width:          36,
    height:         36,
    borderRadius:   RADIUS.sm,
    alignItems:     'center',
    justifyContent: 'center',
  },
  titreSection: {
    fontSize:   FONT_SIZE.lg,
    fontWeight: '700',
  },
  sousTitreSection: {
    fontSize:      FONT_SIZE.sm,
    fontWeight:    '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom:  SPACING.xs,
    marginTop:     SPACING.xs,
  },
  indisponible: {
    alignItems:    'center',
    paddingVertical: SPACING.lg,
    gap:           SPACING.sm,
  },
  txtIndisponible: {
    fontSize:   FONT_SIZE.sm,
    textAlign:  'center',
    lineHeight: 20,
  },
  attribution: {
    fontSize:          FONT_SIZE.xs,
    textAlign:         'center',
    lineHeight:        18,
    paddingHorizontal: SPACING.sm,
  },
});
