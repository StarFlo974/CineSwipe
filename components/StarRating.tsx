import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  starSize?: number;
  color?: string;
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

export function StarRating({
  rating,
  maxStars = 5,
  starSize = 24,
  color = '#FFCC33',
  interactive = false,
  onRate,
}: StarRatingProps) {
  const stars = Array.from({ length: maxStars }, (_, i) => i + 1);

  const getIconName = (star: number): 'star' | 'star-half' | 'star-outline' => {
    if (rating >= star) return 'star';
    if (rating >= star - 0.5) return 'star-half';
    return 'star-outline';
  };

  return (
    <View style={styles.container}>
      {stars.map((star) =>
        interactive ? (
          <TouchableOpacity
            key={star}
            onPress={() => onRate?.(star)}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
          >
            <Ionicons
              name={getIconName(star)}
              size={starSize}
              color={rating >= star ? color : '#555565'}
            />
          </TouchableOpacity>
        ) : (
          <Ionicons
            key={star}
            name={getIconName(star)}
            size={starSize}
            color={rating >= star ? color : '#555565'}
          />
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
});
