/**
 * Écrans 04 · Profil — Dark  /  08 · Profil — Light
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMovieStore } from '../../hooks/useMovieStore';
import {
  DARK_THEME, LIGHT_THEME,
  SPACING, FONT_SIZE, FONT_WEIGHT, RADIUS, LAYOUT,
} from '../../constants/theme';
import { TMDB_GENRES } from '../../types/movie';

const { width: SW } = Dimensions.get('window');

const GENRE_EMOJI: Record<number, string> = {
  18:    '🎭',
  878:   '🚀',
  53:    '🔪',
  35:    '😂',
  28:    '💥',
  27:    '👻',
  10749: '❤️',
  12:    '🗺️',
  16:    '🎨',
  80:    '🔍',
  14:    '🧙',
  99:    '📽️',
  36:    '🏛️',
};

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router  = useRouter();
  const theme   = useMovieStore((s) => s.theme);
  const C       = theme === 'dark' ? DARK_THEME : LIGHT_THEME;

  const {
    watchlist, watched,
    username, email,
    toggleTheme, setProfile,
    getAverageRating,
    getGenreStats,
  } = useMovieStore();

  const [editVisible,  setEditVisible]  = useState(false);
  const [tempUsername, setTempUsername] = useState('');
  const [tempEmail,    setTempEmail]    = useState('');

  const openEdit = () => {
    setTempUsername(username);
    setTempEmail(email);
    setEditVisible(true);
  };

  const saveEdit = () => {
    if (tempUsername.trim()) setProfile(tempUsername.trim(), tempEmail.trim());
    setEditVisible(false);
  };

  const avgRating  = getAverageRating();
  const genreStats = getGenreStats();

  const topGenres = Object.entries(genreStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)
    .map(([id, count]) => {
      const gid   = parseInt(id);
      const total = Object.values(genreStats).reduce((s, n) => s + n, 0);
      return {
        id:    gid,
        name:  TMDB_GENRES.find((g) => g.id === gid)?.name ?? 'Autre',
        emoji: GENRE_EMOJI[gid] ?? '🎬',
        pct:   total > 0 ? Math.round((count / total) * 100) : 0,
        count,
      };
    });

  const maxPct = topGenres[0]?.pct ?? 1;

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: C.bg }]}
        contentContainerStyle={{ paddingBottom: insets.bottom + SPACING.xl }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
          <View style={{ width: 44 }} />
          <Text style={[styles.pageTitle, { color: C.text }]}>Mon Profil</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={[styles.avatar, { backgroundColor: C.accent }]}>
            <Text style={styles.avatarLetter}>{username.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.usernameRow}>
            <Text style={[styles.username, { color: C.text }]}>{username}</Text>
            <TouchableOpacity onPress={openEdit} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="pencil-outline" size={16} color={C.textSec} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.tagline, { color: C.textSec }]}>
            {email.trim() ? email : 'Cinéphile depuis 2024'}
          </Text>
        </View>

        {/* Stat cards */}
        <View style={styles.statsRow}>
          {[
            { value: String(watchlist.length), label: 'À voir' },
            { value: String(watched.length),   label: 'Vus' },
            {
              value: avgRating > 0 ? `${avgRating.toFixed(1)}★` : '—',
              label: 'Note moy.',
              gold: true,
            },
          ].map((stat) => (
            <View key={stat.label} style={[styles.statCard, { backgroundColor: C.card }]}>
              <Text style={[styles.statValue, { color: stat.gold ? C.gold : C.text }]}>
                {stat.value}
              </Text>
              <Text style={[styles.statLabel, { color: C.textSec }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Genres préférés */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: C.text }]}>Genres préférés</Text>
          {topGenres.length === 0 ? (
            <Text style={[styles.noData, { color: C.textSec }]}>
              Notez des films pour voir vos genres préférés
            </Text>
          ) : (
            topGenres.map((g) => (
              <View key={g.id} style={[styles.genreRow, { backgroundColor: C.card }]}>
                <Text style={styles.genreEmoji}>{g.emoji}</Text>
                <Text style={[styles.genreName, { color: C.text }]}>{g.name}</Text>
                <View style={styles.progressWrap}>
                  <View style={[styles.progressTrack, { backgroundColor: C.badge }]}>
                    <View
                      style={[
                        styles.progressFill,
                        { backgroundColor: C.accent, width: `${(g.pct / maxPct) * 100}%` as any },
                      ]}
                    />
                  </View>
                </View>
                <Text style={[styles.genrePct, { color: C.accent }]}>{g.pct}%</Text>
              </View>
            ))
          )}
        </View>

        {/* Voir toutes mes listes */}
        <TouchableOpacity
          style={styles.listsLink}
          onPress={() => router.push('/(tabs)/watchlist')}
          activeOpacity={0.7}
        >
          <Text style={[styles.listsLinkText, { color: C.accent }]}>
            Voir toutes mes listes →
          </Text>
        </TouchableOpacity>

        {/* Paramètres */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: C.text }]}>Paramètres</Text>
          <View style={[styles.settingRow, { backgroundColor: C.card }]}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingEmoji}>{theme === 'dark' ? '🌙' : '☀️'}</Text>
              <Text style={[styles.settingLabel, { color: C.text }]}>Mode sombre</Text>
            </View>
            <Switch
              value={theme === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: C.badge, true: C.accent }}
              thumbColor="#fff"
              style={{ alignSelf: 'center' }}
            />
          </View>
        </View>

        {/* Quick access */}
        <View style={styles.section}>
          {[
            { label: 'Films à voir', count: watchlist.length, route: '/(tabs)/watchlist' as const, emoji: '🎞' },
            { label: 'Films vus',    count: watched.length,   route: '/(tabs)/watched'   as const, emoji: '✓' },
          ].map((link) => (
            <TouchableOpacity
              key={link.label}
              style={[styles.quickLink, { backgroundColor: C.card }]}
              onPress={() => router.push(link.route)}
              activeOpacity={0.8}
            >
              <Text style={styles.quickEmoji}>{link.emoji}</Text>
              <Text style={[styles.quickLabel, { color: C.text }]}>{link.label}</Text>
              <Text style={[styles.quickCount, { color: C.textSec }]}>{link.count}</Text>
              <Ionicons name="chevron-forward" size={16} color={C.textSec} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Modal édition profil */}
      <Modal
        visible={editVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={[styles.modalCard, { backgroundColor: C.surface }]}>
            <Text style={[styles.modalTitle, { color: C.text }]}>Modifier le profil</Text>

            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: C.textSec }]}>Nom d'utilisateur</Text>
              <TextInput
                style={[styles.fieldInput, { backgroundColor: C.card, color: C.text, borderColor: C.border }]}
                value={tempUsername}
                onChangeText={setTempUsername}
                placeholder="Ton prénom"
                placeholderTextColor={C.textSec}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: C.textSec }]}>Adresse e-mail</Text>
              <TextInput
                style={[styles.fieldInput, { backgroundColor: C.card, color: C.text, borderColor: C.border }]}
                value={tempEmail}
                onChangeText={setTempEmail}
                placeholder="exemple@mail.com"
                placeholderTextColor={C.textSec}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={saveEdit}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, { borderColor: C.border, borderWidth: 1 }]}
                onPress={() => setEditVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={[styles.modalBtnText, { color: C.textSec }]}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: C.accent }]}
                onPress={saveEdit}
                activeOpacity={0.8}
              >
                <Text style={[styles.modalBtnText, { color: '#fff' }]}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  pageTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.semiBold,
    flex: 1,
    textAlign: 'center',
  },

  avatarSection: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    gap: SPACING.xs,
  },
  avatar: {
    width: LAYOUT.avatarS,
    height: LAYOUT.avatarS,
    borderRadius: RADIUS.avatar,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  avatarLetter: {
    color: '#fff',
    fontSize: FONT_SIZE.hero,
    fontWeight: FONT_WEIGHT.bold,
    lineHeight: 42,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  username: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.semiBold,
  },
  tagline: { fontSize: FONT_SIZE.md },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    gap: 10,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    height: LAYOUT.statCardH,
    borderRadius: RADIUS.item,
    paddingTop: 14,
    paddingLeft: 16,
    gap: 4,
  },
  statValue: { fontSize: FONT_SIZE.xxl, fontWeight: FONT_WEIGHT.bold },
  statLabel: { fontSize: FONT_SIZE.xs },

  section: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semiBold,
    marginBottom: SPACING.xs,
  },

  genreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: LAYOUT.genreRowH,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
    overflow: 'hidden',
  },
  genreEmoji: { fontSize: 20, width: 32, textAlign: 'center' },
  genreName: { fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.medium, width: 80 },
  progressWrap: { flex: 1, paddingHorizontal: SPACING.xs },
  progressTrack: { height: LAYOUT.progressH, borderRadius: 2, overflow: 'hidden' },
  progressFill:  { height: '100%', borderRadius: 2 },
  genrePct: { fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.semiBold, width: 36, textAlign: 'right' },

  noData: { fontSize: FONT_SIZE.md, textAlign: 'center', paddingVertical: SPACING.lg },

  listsLink: { alignItems: 'center', paddingVertical: SPACING.sm, marginBottom: SPACING.lg },
  listsLinkText: { fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.medium },

  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: LAYOUT.genreRowH,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  settingEmoji: { fontSize: 20 },
  settingLabel: { fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.medium },

  quickLink: {
    flexDirection: 'row',
    alignItems: 'center',
    height: LAYOUT.genreRowH,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  quickEmoji: { fontSize: 18, width: 24, textAlign: 'center' },
  quickLabel: { flex: 1, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.medium },
  quickCount: { fontSize: FONT_SIZE.md },

  // Modal édition profil
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
    gap: SPACING.md,
  },
  modalTitle: { fontSize: FONT_SIZE.xxl, fontWeight: FONT_WEIGHT.bold },
  fieldGroup: { gap: SPACING.xs },
  fieldLabel: { fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.medium },
  fieldInput: {
    height: 44,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    fontSize: FONT_SIZE.md,
  },
  modalActions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.xs },
  modalBtn: {
    flex: 1,
    height: LAYOUT.ctaBtnH,
    borderRadius: RADIUS.btn,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnText: { fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.semiBold },
});
