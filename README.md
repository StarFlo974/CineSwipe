# CineSwipe

Application mobile de découverte de films inspirée de Tinder. Swipez pour découvrir des films, constituez votre liste de films à voir et retrouvez où les regarder.

## Aperçu

| Découverte | Fiche film | Où regarder | Profil |
|:-:|:-:|:-:|:-:|
| Swipe gauche/droite/haut | Détails complets | Streaming & cinémas | Stats & préférences |

## Prérequis

- **Node.js** 18+ — [nodejs.org](https://nodejs.org)
- **Expo CLI** — `npm install -g expo-cli`
- **Expo Go** sur votre téléphone — [iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)
- Compte **TMDB** gratuit — [themoviedb.org](https://www.themoviedb.org/signup)

## Installation

```bash
# 1. Cloner le projet
git clone <repo-url>
cd cineswipe

# 2. Installer les dépendances
npm install

# 3. Configurer les clés API
cp .env.example .env
# Éditez .env et remplissez vos clés
```

## Configuration des clés API

### TMDB (obligatoire)

1. Créez un compte sur [themoviedb.org](https://www.themoviedb.org/signup)
2. Allez dans **Paramètres → API** sur votre profil
3. Demandez une clé API (version 3) — gratuit et instantané
4. Copiez la **API Key (v3 auth)** dans votre `.env` :

```env
EXPO_PUBLIC_TMDB_KEY=votre_clé_tmdb_ici
```

## Lancement

```bash
npx expo start
```

Une QR code apparaît dans le terminal. Scannez-le avec :
- **Android** : l'application Expo Go
- **iOS** : l'appareil photo natif

### Autres modes

```bash
# Émulateur Android (Android Studio requis)
npx expo start --android

# Simulateur iOS (macOS + Xcode requis)
npx expo start --ios

# Navigateur web (fonctionnalités limitées)
npx expo start --web
```

## Utilisation

### Gestes de swipe

| Geste | Action |
|-------|--------|
| Swipe droite | Ajouter à "À voir" |
| Swipe gauche | Ignorer le film |
| Swipe haut | Marquer "Déjà vu" + noter |
| Tap sur la carte | Voir la fiche détaillée |

### Boutons d'action

- **✕ (rouge)** : Ignorer
- **★ (bleu)** : Déjà vu + notation
- **♥ (vert)** : Ajouter à ma liste

### Filtres

Appuyez sur l'icône filtre en haut à droite de l'écran Découverte pour filtrer par genre.

## Build pour production

### Prérequis

```bash
npm install -g eas-cli
eas login
```

### APK Android

```bash
eas build --platform android --profile preview
```

### AAB Android (Google Play)

```bash
eas build --platform android
```

### IPA iOS

```bash
eas build --platform ios
```

### Les deux plateformes

```bash
eas build --platform all
```

## Architecture

```
cineswipe/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx          # Écran Swipe principal
│   │   ├── watchlist.tsx      # Films à voir
│   │   ├── watched.tsx        # Films vus + notes
│   │   └── profile.tsx        # Profil & statistiques
│   ├── movie/
│   │   ├── [id].tsx           # Fiche film détaillée
│   │   └── where-to-watch.tsx # Où regarder
│   └── _layout.tsx            # Layout racine
├── components/
│   ├── MovieCard.tsx          # Carte swipeable (Reanimated 3)
│   ├── SwipeButtons.tsx       # Boutons ✕ ★ ♥
│   ├── StarRating.tsx         # Notation étoiles
│   ├── GenrePill.tsx          # Badge genre
│   ├── StreamingCard.tsx      # Carte service streaming
│   ├── CinemaCard.tsx         # Carte cinéma
│   └── BottomNav.tsx          # Navigation tabs
├── hooks/
│   ├── useMovieStore.ts       # Zustand store (persisté AsyncStorage)
│   ├── useMovies.ts           # Fetch & gestion du deck TMDB
│   └── useWatchProviders.ts   # Fetch fournisseurs streaming
├── services/
│   └── tmdb.ts                # Client API TMDB
├── types/
│   └── movie.ts               # Types TypeScript complets
└── constants/
    └── theme.ts               # Design tokens (dark/light)
```

## Stack technique

| Outil | Version | Rôle |
|-------|---------|------|
| Expo | ~51.0 | Framework RN |
| Expo Router | ~3.5 | Navigation file-based |
| Reanimated | ~3.10 | Animations fluides |
| Gesture Handler | ~2.16 | Détection des gestes |
| Zustand | ^4.5 | State management |
| AsyncStorage | 1.23 | Persistance locale |
| expo-location | ~17.0 | Géolocalisation cinémas |
| expo-image | ~1.12 | Images optimisées |

## Données & confidentialité

- Aucune donnée personnelle n'est envoyée à des serveurs
- Toutes les listes (À voir, Vus, Ignorés) sont stockées localement sur l'appareil
- L'appel API TMDB est en lecture seule

## Troubleshooting

**"Cannot find module 'expo-router/entry'"**
```bash
npm install
npx expo install
```

**Erreur de chargement des films**
→ Vérifiez que `EXPO_PUBLIC_TMDB_KEY` est correctement configuré dans votre fichier `.env`

**Les animations saccadent**
→ Assurez-vous d'utiliser Expo Go (pas le navigateur web) et que `react-native-reanimated/plugin` est dans `babel.config.js`

**Erreur de géolocalisation**
→ Acceptez les permissions de localisation quand l'app les demande, ou accédez directement à "Où regarder" depuis la fiche film

## Licence

MIT — Projet éducatif
