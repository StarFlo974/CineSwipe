// ─── Tokens extraits pixel-perfect du Figma ───────────────────────────────
// Figma file : https://www.figma.com/design/Ry9Ab3azPhFExT0yh4d0kb
// Lecture MCP le 2026-04-28 — valeurs hexadécimales exactes

export const DARK_THEME = {
  // Backgrounds
  bg:      '#12121a',   // canvas principal (frame bg dark)
  surface: '#1f1f29',   // tab bar, nav bar
  card:    '#292936',   // cards, items, search bar, stat boxes
  badge:   '#333342',   // inactive chips, progress track, "Déjà vu" btn

  // Accent / semantic
  accent:  '#ed4242',   // rouge cinéma — CTA primaire, tab actif, skip icon, progress fill
  text:    '#ffffff',   // texte principal
  textSec: '#a6a6b8',   // texte secondaire, meta, tabs inactifs
  gold:    '#ffcc33',   // étoiles, note moyenne (#fc3 en CSS)
  green:   '#21d47a',   // bouton "À voir", icône like
  border:  '#333342',   // séparateurs internes (même teinte que badge)

  // Couleurs spéciales
  skipActive:  '#ed4242',   // bouton central (Indiférent) fond plein
  watchlistBtn:'#21d47a',   // fond bouton "À voir" fiche film
  watchedBtn:  '#333342',   // fond bouton "Déjà vu" fiche film
  posterPlaceholder: '#292936',
} as const;

export const LIGHT_THEME = {
  bg:      '#f7f5f2',
  surface: '#ffffff',
  card:    '#ffffff',
  badge:   '#edebe8',

  accent:  '#e53333',
  text:    '#14141a',
  textSec: '#737380',
  gold:    '#d9990d',
  green:   '#0da659',
  border:  '#dbd9d6',

  skipActive:  '#e53333',
  watchlistBtn:'#0da659',
  watchedBtn:  '#edebe8',
  posterPlaceholder: '#edebe8',
} as const;

export type Theme = typeof DARK_THEME;
export type ThemeMode = 'dark' | 'light';

// ─── Spacing (base 4px) ───────────────────────────────────────────────────
export const SPACING = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  20,   // marge horizontale principale du Figma
  xl:  24,
  xxl: 32,
  xxxl:48,
} as const;

// ─── Border radius ────────────────────────────────────────────────────────
export const RADIUS = {
  xs:   4,
  sm:   8,   // thumbnail poster (58×68)
  md:   10,  // genre row cards dans profil
  card: 12,  // cast photo boxes
  item: 14,  // list items watchlist/vus, stat boxes, sort chips (demi = 14)
  lg:   20,  // swipe card principale
  btn:  24,  // CTA buttons (118×48)
  chip: 14,  // sort chips (demi de h=28)
  search:22, // search bar (demi de h=44)
  avatar:50, // avatar profil (100×100)
  full: 999,
} as const;

// ─── Typographie Inter ────────────────────────────────────────────────────
export const FONT_SIZE = {
  xxs: 10,   // cast name, tab labels
  xs:  11,   // meta secondaire, tab bar labels, chip text
  sm:  12,   // genres, poster meta
  md:  13,   // list item title, synopsis, meta line, sort chips
  lg:  14,   // section titles, CTA button text, rating line
  xl:  18,   // page title "Mon Profil"
  xxl: 22,   // stat values, list screen title
  xxxl:24,   // film title, app name, swipe card title
  hero:34,   // avatar initiale
} as const;

export const FONT_WEIGHT = {
  regular:   '400' as const,
  medium:    '500' as const,
  semiBold:  '600' as const,
  bold:      '700' as const,
} as const;

// ─── Layout figma (390×844) ───────────────────────────────────────────────
export const LAYOUT = {
  screenW:    390,
  screenH:    844,
  cardW:      350,   // 20px margin each side
  tabBarH:    84,
  tabBarTop:  760,
  swipeCardH: 460,
  listItemH:  88,
  listThumbW: 58,
  listThumbH: 68,
  castPhotoS: 76,    // width=height
  ctaBtnW:    118,
  ctaBtnH:    48,
  statCardW:  112,
  statCardH:  74,
  genreRowH:  48,
  searchBarH: 44,
  chipH:      28,
  avatarS:    100,
  progressH:  4,
  progressW:  260,
} as const;

export const SHADOW = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
} as const;
