# CineSwipe

[![CI](https://github.com/StarFlo974/CineSwipe/actions/workflows/ci.yml/badge.svg)](https://github.com/StarFlo974/CineSwipe/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Available on IzzyOnDroid](https://img.shields.io/badge/IzzyOnDroid-available-green)](https://apt.izzysoft.de/fdroid/index/apk/com.florian.cineswipe)

Application mobile de découverte de films. Swipez pour découvrir, gérez votre liste et trouvez où regarder — sans compte, sans tracking.

---

## Installation

### IzzyOnDroid (recommandé)

1. Ajoute le dépôt IzzyOnDroid dans ton client F-Droid :
   `https://apt.izzysoft.de/fdroid/repo`
2. Recherche **CineSwipe** et installe

### APK direct

Télécharge le dernier APK depuis les [GitHub Releases](https://github.com/StarFlo974/CineSwipe/releases/latest).

> Pense à activer **"Sources inconnues"** dans Paramètres → Sécurité avant l'installation.

---

## Utilisation

| Geste | Action |
|-------|--------|
| Swipe droite | Ajouter à la liste à voir |
| Swipe gauche | Marquer comme vu + noter (1–5 ★) |
| Swipe haut | Ignorer ce film |
| Tap sur la carte | Ouvrir la fiche détaillée |

**Écrans :**
- **Découvrir** — deck de swipe infini (films tendance + découverte TMDB), filtre par genre
- **À voir** — ta watchlist
- **Vus** — historique avec notes et statistiques
- **Profil** — note moyenne, genre favori, mode sombre/clair

---

## Stack technique

| Technologie | Version | Rôle |
|-------------|---------|------|
| Expo | ~54.0.0 | Framework React Native |
| React Native | 0.81.5 | UI natif |
| TypeScript | ~5.9.2 | Typage statique |
| Expo Router | ~6.0.23 | Navigation file-based |
| Zustand | ^4.5.4 | State management (persisté) |
| react-native-reanimated | ~3.19.5 | Animations swipe |
| TMDB API | v3/v4 | Données films & streaming |

---

## Contribuer

### Prérequis

- Node.js 18+
- npm
- Compte TMDB + token Bearer (gratuit sur [themoviedb.org](https://www.themoviedb.org/settings/api))

### Installation locale

```bash
git clone https://github.com/StarFlo974/CineSwipe.git
cd CineSwipe
npm install --legacy-peer-deps

# Configurer la clé API TMDB
cp .env.example .env
# Édite .env et renseigne ton token Bearer TMDB

# Lancer l'app
npx expo start
```

### Tests

```bash
npm test           # mode watch
npm run test:ci    # avec couverture (utilisé en CI)
```

46 cas de tests fonctionnels couvrant : watchlist, films vus, ignorés, profil, thème, genres, statistiques, URLs TMDB.

### Build Android (release)

Voir [SIGNING.md](SIGNING.md) pour la configuration de la keystore, puis :

```bash
bash scripts/build-release.sh
```

L'APK est généré dans `release/cineswipe-v<version>.apk`.

### Workflow CI/CD

- Push sur `develop` → tests TypeScript + Jest → auto-merge vers `main` si tout passe
- Push d'un tag `v*` → build APK signé → GitHub Release créée automatiquement

---

## Architecture

```
cineswipe/
├── app/(tabs)/
│   ├── index.tsx          # Écran Swipe principal
│   ├── watchlist.tsx      # Films à voir
│   ├── watched.tsx        # Films vus + stats
│   └── profile.tsx        # Profil & préférences
├── components/            # MovieCard, SwipeButtons, StarRating…
├── hooks/
│   ├── useMovieStore.ts   # Zustand store (persisté AsyncStorage)
│   ├── useMovies.ts       # Deck TMDB + filtres
│   └── useWatchProviders.ts
├── services/tmdb.ts       # Client API TMDB (Bearer auth)
├── plugins/               # Config plugins Expo (prebuild)
├── scripts/               # Scripts de build
├── fastlane/metadata/     # Métadonnées IzzyOnDroid / F-Droid
└── __tests__/             # 46 tests fonctionnels
```

---

## Données & confidentialité

- Aucune donnée personnelle envoyée à des serveurs tiers
- Watchlist et notes stockées uniquement en local (AsyncStorage)
- Appels API TMDB en lecture seule
- Pas de Google Services, pas de Firebase, pas d'analytics

---

## Licence

MIT © 2025 Florian Startnort — voir [LICENSE](LICENSE)

*Cette application utilise l'API [TMDB](https://www.themoviedb.org/). Elle n'est pas approuvée ni certifiée par TMDB.*
