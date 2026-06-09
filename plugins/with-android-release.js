const { withAppBuildGradle } = require('@expo/config-plugins');

/**
 * Expo config plugin applied during `expo prebuild`:
 * 1. Adds dependenciesInfo block (required by IzzyOnDroid / F-Droid)
 * 2. Injects a release signing config that reads from gradle.properties
 * 3. Wires the release signing config into the release buildType
 */
const withAndroidRelease = (config) => {
  return withAppBuildGradle(config, (mod) => {
    let contents = mod.modResults.contents;

    // 1. dependenciesInfo — strip Google dependency metadata from APK/AAB
    if (!contents.includes('dependenciesInfo')) {
      contents = contents.replace(
        /(android\s*\{)/,
        '$1\n    dependenciesInfo {\n        includeInApk = false\n        includeInBundle = false\n    }\n'
      );
    }

    // 2. Add 'release' signing config inside the existing signingConfigs block.
    //    The Expo-generated build.gradle already has signingConfigs { debug { ... } }.
    //    We inject our release block at the top of that existing block.
    if (!contents.includes('RELEASE_STORE_FILE')) {
      contents = contents.replace(
        /signingConfigs\s*\{/,
        'signingConfigs {\n' +
        '        release {\n' +
        '            if (project.hasProperty("RELEASE_STORE_FILE")) {\n' +
        '                storeFile file(RELEASE_STORE_FILE)\n' +
        '                storePassword project.property("RELEASE_STORE_PASSWORD")\n' +
        '                keyAlias project.property("RELEASE_KEY_ALIAS")\n' +
        '                keyPassword project.property("RELEASE_KEY_PASSWORD")\n' +
        '            }\n' +
        '        }'
      );
    }

    // 3. In the release buildType, replace the default debug signingConfig with release.
    //    The Expo template puts "// Caution!" comment just above signingConfig signingConfigs.debug
    //    inside the release block — this is a reliable anchor to target that specific line.
    contents = contents.replace(
      /(\/\/ Caution!.*\n.*\n\s*)signingConfig signingConfigs\.debug/,
      '$1signingConfig signingConfigs.release'
    );

    mod.modResults.contents = contents;
    return mod;
  });
};

module.exports = withAndroidRelease;
