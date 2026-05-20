// Bubblewrap-generated app module config. Every value here that's relevant
// to the PWA itself (application ID, launcher name, theme/navigation
// colours, default URL, host) is sourced from `../twa-manifest.json` and
// re-emitted by `bubblewrap update`. Keep changes in sync there if you
// want them to stick across regeneration.

plugins {
    id("com.android.application")
}

android {
    namespace = "com.icssc.antalmanac"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.icssc.antalmanac"
        // Bubblewrap defaults to 23 (Android 6.0). androidbrowserhelper
        // itself requires 19+, but 23 is the floor where TWA works
        // reliably with stable Chrome.
        minSdk = 23
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        // Placeholder substitutions for AndroidManifest.xml. Bubblewrap
        // sources every one of these from twa-manifest.json. Updating the
        // manifest by hand is fine for small tweaks but `bubblewrap
        // update` will overwrite them.
        manifestPlaceholders["hostName"] = "antalmanac.com"
        manifestPlaceholders["defaultUrl"] = "https://antalmanac.com/"
        manifestPlaceholders["launchUrl"] = "/"
        manifestPlaceholders["launcherName"] = "AntAlmanac"
        manifestPlaceholders["appName"] = "AntAlmanac"
        manifestPlaceholders["appNameXmlSafe"] = "AntAlmanac"
        manifestPlaceholders["providerAuthority"] = "com.icssc.antalmanac.fileprovider"
        manifestPlaceholders["enableNotifications"] = "true"
        manifestPlaceholders["enableSiteSettingsShortcut"] = "true"
        manifestPlaceholders["orientation"] = "unspecified"
        manifestPlaceholders["fallbackType"] = "customtabs"
        manifestPlaceholders["displayMode"] = "standalone"
    }

    buildTypes {
        getByName("debug") {
            applicationIdSuffix = ".debug"
            isMinifyEnabled = false
        }
        getByName("release") {
            isMinifyEnabled = false
            isShrinkResources = false
            // signingConfig = signingConfigs.getByName("release")
            // Bubblewrap's `build` command wires this to the keystore at
            // ../android.keystore using credentials from twa-manifest.json
            // (signingKey.alias) + an interactive password prompt.
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

dependencies {
    implementation("androidx.appcompat:appcompat:1.7.0")
    // The library that ships LauncherActivity, DelegationService, splash
    // handling, status-bar tinting, share intent forwarding, and all the
    // other plumbing that makes a TWA feel native. Maintained by the
    // Chrome team.
    implementation("com.google.androidbrowserhelper:androidbrowserhelper:2.6.0")
    // Lets the PWA call navigator.geolocation without a permission prompt
    // by delegating to Android's location provider. Pulled in because
    // twa-manifest.json sets `features.locationDelegation.enabled = true`.
    implementation("com.google.androidbrowserhelper:locationdelegation:2.6.0")
}
