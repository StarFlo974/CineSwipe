import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { Movie } from '../types/movie';
import { posterUrl } from '../services/tmdb';
import { TMDB_GENRES } from '../types/movie';
import { DARK_THEME, RADIUS, FONT_SIZE, SPACING } from '../constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.62;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;
const SWIPE_UP_THRESHOLD = -SCREEN_HEIGHT * 0.18;

export interface SwipeCardRef {
  swipeLeft: () => void;
  swipeRight: () => void;
  swipeUp: () => void;
}

interface MovieCardProps {
  movie: Movie;
  isTop: boolean;
  deckIndex: number;
  onSwipeLeft: (movie: Movie) => void;
  onSwipeRight: (movie: Movie) => void;
  onSwipeUp: (movie: Movie) => void;
  onTap: (movie: Movie) => void;
  onSwipeComplete: () => void;
}

const MAX_VISIBLE = 4;

export function MovieCard({
  movie,
  isTop,
  deckIndex,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onTap,
  onSwipeComplete,
}: MovieCardProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const colors = DARK_THEME;

  const cardScale = 1 - deckIndex * 0.03;
  const cardTranslateY = deckIndex * 10;

  const fireSwipeLeft = useCallback(() => {
    onSwipeLeft(movie);
    onSwipeComplete();
  }, [movie, onSwipeLeft, onSwipeComplete]);

  const fireSwipeRight = useCallback(() => {
    onSwipeRight(movie);
    onSwipeComplete();
  }, [movie, onSwipeRight, onSwipeComplete]);

  const fireSwipeUp = useCallback(() => {
    onSwipeUp(movie);
    onSwipeComplete();
  }, [movie, onSwipeUp, onSwipeComplete]);

  const gesture = Gesture.Pan()
    .enabled(isTop)
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
    })
    .onEnd((e) => {
      if (e.translationX > SWIPE_THRESHOLD) {
        translateX.value = withTiming(SCREEN_WIDTH * 1.5, { duration: 300 });
        runOnJS(fireSwipeRight)();
      } else if (e.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withTiming(-SCREEN_WIDTH * 1.5, { duration: 300 });
        runOnJS(fireSwipeLeft)();
      } else if (e.translationY < SWIPE_UP_THRESHOLD) {
        translateY.value = withTiming(-SCREEN_HEIGHT * 1.2, { duration: 300 });
        runOnJS(fireSwipeUp)();
      } else {
        translateX.value = withSpring(0, { damping: 15, stiffness: 200 });
        translateY.value = withSpring(0, { damping: 15, stiffness: 200 });
      }
    });

  const animatedCardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      [-15, 0, 15],
      Extrapolation.CLAMP
    );
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: isTop ? translateY.value : cardTranslateY },
        { rotate: isTop ? `${rotate}deg` : '0deg' },
        { scale: isTop ? 1 : cardScale },
      ],
    };
  });

  const likeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD * 0.5],
      [0, 1],
      Extrapolation.CLAMP
    ),
  }));

  const nopeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD * 0.5, 0],
      [1, 0],
      Extrapolation.CLAMP
    ),
  }));

  const superOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [SWIPE_UP_THRESHOLD * 0.5, 0],
      [1, 0],
      Extrapolation.CLAMP
    ),
  }));

  const genreNames = (movie.genre_ids ?? [])
    .slice(0, 3)
    .map((id) => TMDB_GENRES.find((g) => g.id === id)?.name)
    .filter(Boolean);

  const imageUri = posterUrl(movie.poster_path, 'w500');

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.cardContainer, animatedCardStyle]}>
        <TouchableWithoutFeedback onPress={() => isTop && onTap(movie)}>
          <View style={styles.card}>
            <Image
              source={{ uri: imageUri ?? undefined }}
              style={styles.image}
              contentFit="cover"
              transition={200}
              placeholder={{ blurhash: 'LGF5?xYk^6#M@-5c,1Ex@@-;WXs;' }}
            />
            <LinearGradient
              colors={['transparent', 'rgba(18,18,24,0.7)', 'rgba(18,18,24,0.97)']}
              style={styles.gradient}
              locations={[0.35, 0.65, 1]}
            />
            <View style={styles.content}>
              {genreNames.length > 0 && (
                <View style={styles.genres}>
                  {genreNames.map((name) => (
                    <View key={name} style={styles.genreBadge}>
                      <Text style={styles.genreText}>{name}</Text>
                    </View>
                  ))}
                </View>
              )}
              <Text style={styles.title} numberOfLines={2}>
                {movie.title}
              </Text>
              <View style={styles.meta}>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={14} color="#FFCC33" />
                  <Text style={styles.rating}>
                    {movie.vote_average.toFixed(1)}
                  </Text>
                </View>
                {movie.release_date && (
                  <Text style={styles.year}>{movie.release_date.slice(0, 4)}</Text>
                )}
              </View>
            </View>

            {/* Swipe labels */}
            {isTop && (
              <>
                <Animated.View style={[styles.label, styles.likeLabel, likeOpacity]}>
                  <Text style={[styles.labelText, { color: '#21D47A' }]}>À VOIR</Text>
                </Animated.View>
                <Animated.View style={[styles.label, styles.nopeLabel, nopeOpacity]}>
                  <Text style={[styles.labelText, { color: '#4DAAFF' }]}>VU !</Text>
                </Animated.View>
                <Animated.View style={[styles.label, styles.superLabel, superOpacity]}>
                  <Text style={[styles.labelText, { color: '#ED4242' }]}>IGNORER</Text>
                </Animated.View>
              </>
            )}
          </View>
        </TouchableWithoutFeedback>
      </Animated.View>
    </GestureDetector>
  );
}

export function MovieCardSkeleton() {
  return (
    <View style={[styles.cardContainer, styles.skeleton]}>
      <View style={styles.card}>
        <View style={styles.skeletonImage} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    alignSelf: 'center',
  },
  card: {
    flex: 1,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: DARK_THEME.card,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: RADIUS.lg,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: RADIUS.lg,
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.lg,
    gap: SPACING.xs,
  },
  genres: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  genreBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  genreText: {
    color: '#FFF',
    fontSize: FONT_SIZE.xs,
    fontWeight: '500',
  },
  title: {
    color: '#FFF',
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    lineHeight: 30,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    color: '#FFCC33',
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
  year: {
    color: '#A6A6B8',
    fontSize: FONT_SIZE.sm,
  },
  label: {
    position: 'absolute',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
    borderWidth: 3,
  },
  likeLabel: {
    top: 40,
    left: 24,
    borderColor: '#21D47A',
    transform: [{ rotate: '-15deg' }],
  },
  nopeLabel: {
    top: 40,
    right: 24,
    borderColor: '#4DAAFF',
    transform: [{ rotate: '15deg' }],
  },
  superLabel: {
    bottom: 120,
    alignSelf: 'center',
    left: '30%',
    borderColor: '#ED4242',
  },
  labelText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    letterSpacing: 2,
  },
  skeleton: {
    opacity: 0.3,
  },
  skeletonImage: {
    flex: 1,
    backgroundColor: DARK_THEME.card,
    borderRadius: RADIUS.lg,
  },
});

export { CARD_WIDTH, CARD_HEIGHT };
