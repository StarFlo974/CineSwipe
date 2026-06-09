#!/usr/bin/env bash
# build-release.sh — Génère l'APK de release signé pour CineSwipe
# Usage : bash scripts/build-release.sh
# Prérequis : RELEASE_STORE_FILE, RELEASE_STORE_PASSWORD, RELEASE_KEY_ALIAS,
#             RELEASE_KEY_PASSWORD définis dans l'environnement ou dans
#             android/gradle.properties (voir SIGNING.md)

set -euo pipefail

VERSION=$(node -p "require('./package.json').version")
APK_NAME="cineswipe-v${VERSION}.apk"
RELEASE_DIR="$(pwd)/release"

echo "==> CineSwipe release build v${VERSION}"

# 1. Vérifier que le .env existe (clé TMDB requise)
if [ ! -f ".env" ]; then
  echo "ERREUR : fichier .env manquant. Crée-le avec EXPO_PUBLIC_TMDB_KEY=..."
  exit 1
fi

# 2. Nettoyer et régénérer le projet Android
echo "==> expo prebuild --platform android --clean"
npx expo prebuild --platform android --clean

# 3. Injecter les propriétés de signature dans android/gradle.properties
#    (si les variables d'env sont définies — sinon gradle.properties doit déjà exister)
if [ -n "${RELEASE_STORE_FILE:-}" ]; then
  cat >> android/gradle.properties <<EOF

RELEASE_STORE_FILE=${RELEASE_STORE_FILE}
RELEASE_STORE_PASSWORD=${RELEASE_STORE_PASSWORD}
RELEASE_KEY_ALIAS=${RELEASE_KEY_ALIAS}
RELEASE_KEY_PASSWORD=${RELEASE_KEY_PASSWORD}
EOF
  echo "==> Propriétés de signature injectées dans android/gradle.properties"
fi

# 4. Build APK release
echo "==> ./gradlew assembleRelease"
cd android
./gradlew assembleRelease
cd ..

# 5. Copier l'APK dans release/
mkdir -p "$RELEASE_DIR"
APK_SOURCE="android/app/build/outputs/apk/release/app-release.apk"

if [ ! -f "$APK_SOURCE" ]; then
  echo "ERREUR : APK introuvable à ${APK_SOURCE}"
  exit 1
fi

cp "$APK_SOURCE" "${RELEASE_DIR}/${APK_NAME}"

echo ""
echo "✅  APK généré :"
echo "    ${RELEASE_DIR}/${APK_NAME}"
