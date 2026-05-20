plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    // Uncomment once a google-services.json from the Firebase console is
    // dropped into apps/pwa-android/app/ (mirrors GoogleService-Info.plist on
    // iOS). Without it the build will fail because the plugin requires the
    // file to exist.
    // id("com.google.gms.google-services")
}

android {
    namespace = "com.icssc.antalmanac"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.icssc.antalmanac"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"

        resourceConfigurations += listOf("en")
    }

    buildTypes {
        getByName("debug") {
            applicationIdSuffix = ".debug"
            isMinifyEnabled = false
        }
        getByName("release") {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro",
            )
            // signingConfig = signingConfigs.getByName("release")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        viewBinding = true
        // Needed to reference BuildConfig.DEBUG from WebViewFactory.kt under
        // AGP 8+, which made buildConfig generation opt-in.
        buildConfig = true
    }

    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("com.google.android.material:material:1.12.0")
    implementation("androidx.constraintlayout:constraintlayout:2.1.4")
    implementation("androidx.swiperefreshlayout:swiperefreshlayout:1.1.0")
    implementation("androidx.webkit:webkit:1.11.0")
    implementation("androidx.core:core-splashscreen:1.0.1")

    // Chrome Custom Tabs — the Android analogue of iOS's
    // ASWebAuthenticationSession. Used by MainActivity.startAuthSession() to
    // run OAuth in a real Chrome context (so Google's embedded-webview ban
    // doesn't trip) while still returning to the app via App Links.
    implementation("androidx.browser:browser:1.8.0")

    // Firebase Cloud Messaging — mirrors the FirebaseMessaging cocoapod on
    // iOS. The BoM keeps every Firebase artifact aligned to one release.
    // Uncomment along with the google-services plugin once google-services.json
    // is committed.
    // implementation(platform("com.google.firebase:firebase-bom:33.3.0"))
    // implementation("com.google.firebase:firebase-messaging-ktx")
}
