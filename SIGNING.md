# Guide de signature — CineSwipe Android

Ce document explique comment générer une keystore, configurer l'environnement local pour les builds de release, et ajouter les secrets GitHub pour le workflow CI.

---

## 1. Générer la keystore avec keytool

`keytool` est inclus avec Java (JDK). Exécute cette commande **une seule fois** et conserve le fichier en lieu sûr.

```bash
keytool -genkey -v \
  -keystore cineswipe-release.keystore \
  -alias cineswipe \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

Réponds aux questions (nom, organisation, pays…). Note bien :
- le **chemin absolu** de ton fichier `.keystore`
- l'**alias** choisi (ex: `cineswipe`)
- le **mot de passe du store** (storePassword)
- le **mot de passe de la clé** (keyPassword)

> ⚠️ Ne committe jamais le fichier `.keystore` ni les mots de passe dans Git.

---

## 2. Configurer les variables d'environnement locales

### Option A — Variables d'environnement shell

Ajoute dans ton `~/.bashrc`, `~/.zshrc` ou équivalent :

```bash
export RELEASE_STORE_FILE=/chemin/absolu/vers/cineswipe-release.keystore
export RELEASE_STORE_PASSWORD=ton_store_password
export RELEASE_KEY_ALIAS=cineswipe
export RELEASE_KEY_PASSWORD=ton_key_password
```

Puis recharge ton shell (`source ~/.zshrc`) et lance :

```bash
bash scripts/build-release.sh
```

### Option B — Fichier android/gradle.properties (local uniquement)

Après avoir lancé `npx expo prebuild --platform android`, crée ou complète `android/gradle.properties` :

```properties
RELEASE_STORE_FILE=/chemin/absolu/vers/cineswipe-release.keystore
RELEASE_STORE_PASSWORD=ton_store_password
RELEASE_KEY_ALIAS=cineswipe
RELEASE_KEY_PASSWORD=ton_key_password
```

> `android/` est dans `.gitignore` — ce fichier ne sera jamais commité.

Puis build directement :

```bash
cd android && ./gradlew assembleRelease
```

L'APK se trouve dans `android/app/build/outputs/apk/release/app-release.apk`.

---

## 3. Ajouter les secrets GitHub pour le workflow CI

Le workflow `.github/workflows/release.yml` se déclenche sur les tags `v*` et nécessite ces secrets dans **Settings → Secrets and variables → Actions** de ton repo :

| Secret | Description |
|--------|-------------|
| `EXPO_PUBLIC_TMDB_KEY` | Token Bearer TMDB (commence par `eyJ...`) |
| `KEYSTORE_BASE64` | Contenu de la keystore encodé en base64 |
| `STORE_PASSWORD` | Mot de passe du store |
| `KEY_ALIAS` | Alias de la clé (ex: `cineswipe`) |
| `KEY_PASSWORD` | Mot de passe de la clé |

### Encoder la keystore en base64

**Linux / macOS :**
```bash
base64 -i cineswipe-release.keystore | pbcopy   # macOS (copie dans le presse-papier)
base64 -i cineswipe-release.keystore            # Linux (affiche dans le terminal)
```

**Windows (PowerShell) :**
```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("cineswipe-release.keystore")) | Set-Clipboard
```

Colle la valeur dans le secret `KEYSTORE_BASE64`.

---

## 4. Créer une release

Une fois les secrets configurés, crée un tag pour déclencher le build :

```bash
git tag v1.0.0
git push origin v1.0.0
```

Le workflow GitHub Actions va :
1. Installer Node 18 + Java 17
2. Lancer `expo prebuild`
3. Décoder la keystore depuis `KEYSTORE_BASE64`
4. Builder l'APK signé avec Gradle
5. Créer automatiquement une GitHub Release avec l'APK en pièce jointe

---

## 5. Vérifier la signature d'un APK

```bash
keytool -printcert -jarfile release/cineswipe-v1.0.0.apk
```

Le certificat doit correspondre à ta keystore.
