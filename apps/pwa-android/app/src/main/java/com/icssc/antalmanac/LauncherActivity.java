package com.icssc.antalmanac;

/**
 * TWA launcher. Bubblewrap emits this exact one-line class — every actual
 * launch detail (default URL, splash screen, colour scheme, share target,
 * scope) is read out of the AndroidManifest meta-data tags by the
 * superclass.
 *
 * If you find yourself wanting to override `onCreate` or any of the
 * extension points here, prefer adding the equivalent
 * `<meta-data android:name="android.support.customtabs.trusted.…">` tag
 * in AndroidManifest.xml so the configuration survives a future
 * `bubblewrap update`.
 */
public class LauncherActivity
    extends com.google.androidbrowserhelper.trusted.LauncherActivity {
}
