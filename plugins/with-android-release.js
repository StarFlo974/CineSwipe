const { withAppBuildGradle } = require('@expo/config-plugins');

/**
 * Expo config plugin applied during `expo prebuild`:
 * 1. Adds dependenciesInfo block (required by IzzyOnDroid / F-Droid)
 * 2. Adds signing config that reads from gradle.properties (for release builds)
 */
const withAndroidRelease = (config) => {
  return withAppBuildGradle(config, (mod) => {
    let contents = mod.modResults.contents;

    // 1. dependenciesInfo — strip Google dependency metadata from APK/AAB
    if (!contents.includes('dependenciesInfo')) {
      contents = contents.replace(
        /(android\s*\{)/,
        `$1\n    dependenciesInfo {\n        includeInApk = false\n        includeInBundle = false\n    }\n`
      );
    }

    // 2. Signing config reading from gradle.properties
    if (!contents.includes('signingConfigs')) {
      const signingBlock = `
    signingConfigs {
        release {
            if (project.hasProperty("RELEASE_STORE_FILE")) {
                storeFile file(RELEASE_STORE_FILE)
                storePassword project.property("RELEASE_STORE_PASSWORD")
                keyAlias project.property("RELEASE_KEY_ALIAS")
                keyPassword project.property("RELEASE_KEY_PASSWORD")
            }
        }
    }`;
      contents = contents.replace(
        /(android\s*\{)/,
        `$1${signingBlock}\n`
      );
    }

    // 3. Wire signingConfig.release into the release buildType
    contents = contents.replace(
      /buildTypes\s*\{[\s\S]*?release\s*\{/,
      (match) => {
        if (match.includes('signingConfig signingConfigs.release')) return match;
        return match + '\n            signingConfig signingConfigs.release';
      }
    );

    mod.modResults.contents = contents;
    return mod;
  });
};

module.exports = withAndroidRelease;
