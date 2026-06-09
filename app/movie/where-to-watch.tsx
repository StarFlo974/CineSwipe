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
import { useMovieStore } from '../../hooks/useMovieStore';
import { useWatchProviders } from '../../hooks/useWatchProviders';
import { DARK_THEME, LIGHT_THEME, SPACING, FONT_SIZE, RADIUS } from '../../constants/theme';
import { TMDBStreamingCard } from '../../components/StreamingCard';
import { CinemaCard, CinemaCardSkeleton, Cinema } from '../../components/CinemaCard';
import { WatchProvider } from '../../types/movie';

// Simulated nearby cinema data based on location
const MOCK_CINEMAS: Cinema[] = [
  { name: 'UGC Ciné Cité', address: '2 Place de la Défense, 92800 Puteaux', distance: 0.8, nextShowtime: '14h30' },
  { name: 'Pathé Gaumont', address: '5 Av. des Ternes, 75017 Paris', distance: 1.4, nextShowtime: '16h00' },
  { name: 'MK2 Bibliothèque', address: '128-162 Av. de France, 75013 Paris', distance: 2.1, nextShowtime: '17h45' },
  { name: 'Cinéma Le Rex', address: '12 Rue de la Paix, 75002 Paris', distance: 3.2, nextShowtime: '20h15' },
];

export default function WhereToWatchScreen() {
  const { id, title } = useLocalSearchParams<{ id: string; title: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const theme = useMovieStore((s) => s.theme);
  const colors = theme === 'dark' ? DARK_THEME : LIGHT_THEME;

  const movieId = parseInt(id ?? '0');
  const { tmdb: tmdbProviders, loading } = useWatchProviders(movieId);

  const [locationGranted, setLocationGranted] = useState<boolean | null>(null);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [cinemasLoading, setCinemasLoading] = useState(false);

  useEffect(() => {
    const requestLocation = async () => {
      setCinemasLoading(true);
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          setLocationGranted(true);
          // In production, you'd call a cinema API with the coordinates
          // We simulate with mock data sorted by distance
          const mockSorted = [...MOCK_CINEMAS].sort((a, b) => a.distance - b.distance);
          setCinemas(mockSorted);
        } else {
          setLocationGranted(false);
        }
      } catch {
        setLocationGranted(false);
      } finally {
        setCinemasLoading(false);
      }
    };
    requestLocation();
  }, []);

  const streaming = tmdbProviders?.flatrate ?? [];
  const rental = tmdbProviders?.rent ?? [];
  const purchase = tmdbProviders?.buy ?? [];

  const hasStreaming = streaming.length > 0;
  const hasRent = rental.length > 0;
  const hasBuy = purchase.length > 0;
  const hasVod = hasRent || hasBuy;

  const deduplicateProviders = (providers: WatchProvider[]): WatchProvider[] => {
    const seen = new Set<number>();
    return providers.filter((p) => {
      if (seen.has(p.provider_id)) return false;
      seen.add(p.provider_id);
      return true;
    });
  };

  const uniqueStreaming = deduplicateProviders(streaming);
  const uniqueRental = deduplicateProviders(rental);
  const uniquePurchase = deduplicateProviders(purchase);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: colors.surface }]}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={[styles.title, { color: colors.text }]}>Où regarder</Text>
          {title && (
            <Text style={[styles.movieTitle, { color: colors.textSec }]} numberOfLines={1}>
              {title}
            </Text>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.loadingText, { color: colors.textSec }]}>
            Recherche des disponibilités...
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + SPACING.xl },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Streaming section */}
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: colors.green + '20' }]}>
                <Ionicons name="play-circle" size={20} color={colors.green} />
              </View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Streaming inclus</Text>
            </View>

            {hasStreaming ? (
              <>
                {uniqueStreaming.map((p) => (
                  <TMDBStreamingCard key={p.provider_id} provider={p} type="streaming" />
                ))}
              </>
            ) : (
              <View style={styles.unavailable}>
                <Text style={[styles.unavailableText, { color: colors.textSec }]}>
                  Non disponible en streaming en France actuellement
                </Text>
              </View>
            )}
          </View>

          {/* Location & Purchase section */}
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: colors.gold + '20' }]}>
                <Ionicons name="cart" size={20} color={colors.gold} />
              </View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Location & Achat</Text>
            </View>

            {hasVod ? (
              <>
                {uniqueRental.length > 0 && (
                  <View>
                    <Text style={[styles.subSectionLabel, { color: colors.textSec }]}>Location</Text>
                    {uniqueRental.map((p) => (
                      <TMDBStreamingCard key={p.provider_id} provider={p} type="rent" />
                    ))}
                  </View>
                )}
                {uniquePurchase.length > 0 && (
                  <View>
                    <Text style={[styles.subSectionLabel, { color: colors.textSec }]}>Achat</Text>
                    {uniquePurchase.map((p) => (
                      <TMDBStreamingCard key={p.provider_id} provider={p} type="buy" />
                    ))}
                  </View>
                )}
              </>
            ) : (
              <View style={styles.unavailable}>
                <Text style={[styles.unavailableText, { color: colors.textSec }]}>
                  Non disponible à la vente/location en France actuellement
                </Text>
              </View>
            )}
          </View>

          {/* Cinemas section */}
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: colors.accent + '20' }]}>
                <Ionicons name="film" size={20} color={colors.accent} />
              </View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Cinémas à proximité</Text>
            </View>

            {cinemasLoading ? (
              <>
                <CinemaCardSkeleton />
                <CinemaCardSkeleton />
              </>
            ) : locationGranted === false ? (
              <View style={styles.unavailable}>
                <Ionicons name="location-outline" size={32} color={colors.textSec} />
                <Text style={[styles.unavailableText, { color: colors.textSec }]}>
                  Accès à la localisation requis pour afficher les cinémas proches
                </Text>
              </View>
            ) : cinemas.length === 0 ? (
              <View style={styles.unavailable}>
                <Text style={[styles.unavailableText, { color: colors.textSec }]}>
                  Aucun cinéma disponible à proximité
                </Text>
              </View>
            ) : (
              cinemas.map((cinema) => (
                <CinemaCard key={cinema.name} cinema={cinema} />
              ))
            )}
          </View>

          {/* Attribution */}
          <Text style={[styles.attribution, { color: colors.textSec }]}>
            Données streaming fournies par TMDB. Les disponibilités peuvent varier.
          </Text>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    gap: SPACING.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
  },
  movieTitle: {
    fontSize: FONT_SIZE.sm,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  loadingText: {
    fontSize: FONT_SIZE.md,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  section: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
  },
  subSectionLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
    marginTop: SPACING.xs,
  },
  unavailable: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  unavailableText: {
    fontSize: FONT_SIZE.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  attribution: {
    fontSize: FONT_SIZE.xs,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: SPACING.sm,
  },
});
