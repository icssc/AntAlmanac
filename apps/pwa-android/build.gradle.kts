// Top-level Gradle build file. Mirrors the file Bubblewrap (the
// PWABuilder Android generator) emits at the project root.
//
// Source of truth for everything in this directory is `twa-manifest.json`:
// running `bubblewrap update` regenerates Gradle config, manifest, and
// resources from it. Hand-edits below `// MANAGED BY BUBBLEWRAP` markers
// will survive that regeneration; edits above will be clobbered.

plugins {
    id("com.android.application") version "8.9.1" apply false
}
