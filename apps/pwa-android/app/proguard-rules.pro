# Bubblewrap-generated TWAs ship without R8/Proguard enabled by default
# (see app/build.gradle.kts: isMinifyEnabled = false). Rules below apply
# only if release builds opt back in.

# Keep the launcher + delegation classes referenced from
# AndroidManifest.xml so a future minify pass doesn't strip them out.
-keep class com.icssc.antalmanac.LauncherActivity
-keep class com.icssc.antalmanac.DelegationService
