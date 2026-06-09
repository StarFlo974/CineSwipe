/**
 * Boutons d'action du swipe — Figma écran 01/05
 */
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useMovieStore } from '../hooks/useMovieStore';
import { DARK_THEME, LIGHT_THEME, FONT_SIZE, FONT_WEIGHT, LAYOUT } from '../constants/theme';

const AnimBtn = Animated.createAnimatedComponent(TouchableOpacity);
const BTN_SIZE = 64; // Figma: 64×64

function PressableBtn({
  onPress,
  children,
  style,
}: {
  onPress: () => void;
  children: React.ReactNode;
  style?: object;
}) {
  const scale = useSharedValue(1);
  const anim  = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <AnimBtn
      style={[styles.btn, style, anim]}
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.88, { damping: 15, stiffness: 300 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 15, stiffness: 300 }); }}
      activeOpacity={1}
    >
      {children}
    </AnimBtn>
  );
}

interface Props {
  onSkip:      () => void;  // ✕  — Déjà vu / ignorer
  onIndiff:    () => void;  // ▼  — Indiférent (bouton central rouge)
  onLike:      () => void;  // ♥  — À voir
}

export function SwipeButtons({ onSkip, onIndiff, onLike }: Props) {
  const theme = useMovieStore((s) => s.theme);
  const C     = theme === 'dark' ? DARK_THEME : LIGHT_THEME;

  return (
    <View style={styles.row}>
      {/* ✕ Déjà vu — bg=card, icon=accent */}
      <PressableBtn onPress={onSkip} style={{ backgroundColor: C.card }}>
        <Text style={[styles.icon, { color: C.accent }]}>✕</Text>
        <Text style={[styles.label, { color: C.textSec }]}>Déjà vu</Text>
      </PressableBtn>

      {/* ▼ Indiférent — bg=accent PLEIN (bouton central, légèrement plus grand visuellement) */}
      <PressableBtn onPress={onIndiff} style={{ backgroundColor: C.accent, transform: [{ scale: 1 }] }}>
        {/* Triangle inversé = ▼ via rotation */}
        <Text style={[styles.iconCenter, { color: '#fff' }]}>▼</Text>
        <Text style={[styles.label, { color: C.accent }]}>Indiférent</Text>
      </PressableBtn>

      {/* ♥ À voir — bg=card, icon=green */}
      <PressableBtn onPress={onLike} style={{ backgroundColor: C.card }}>
        <Text style={[styles.icon, { color: C.green }]}>♥</Text>
        <Text style={[styles.label, { color: C.textSec }]}>À voir</Text>
      </PressableBtn>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 44,            // ~108px centre-à-centre pour un écran 390px
    paddingVertical: 8,
  },
  btn: {
    width: BTN_SIZE,
    height: BTN_SIZE,
    borderRadius: BTN_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: FONT_SIZE.xxxl, // 24px (Figma: ✕ et ♥ sont 24/22px)
    fontWeight: FONT_WEIGHT.bold,
    lineHeight: 30,
  },
  iconCenter: {
    fontSize: FONT_SIZE.xl,   // 20px, triangle blanc
    fontWeight: FONT_WEIGHT.bold,
    lineHeight: 26,
    transform: [{ rotate: '180deg' }], // ▲ → ▼
  },
  label: {
    position: 'absolute',
    bottom: -20,
    fontSize: FONT_SIZE.xs,  // 11px (Figma)
    fontWeight: FONT_WEIGHT.regular,
    width: 80,
    textAlign: 'center',
  },
});
