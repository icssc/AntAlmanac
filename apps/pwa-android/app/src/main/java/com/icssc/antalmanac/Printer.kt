package com.icssc.antalmanac

import android.content.Context
import android.print.PrintAttributes
import android.print.PrintManager
import android.webkit.WebView

/**
 * Print bridge. Direct port of apps/pwa/src/AntAlmanac/Printer.swift —
 * triggered from the JS bridge when the web app calls
 * `window.AntAlmanacBridge.print()`.
 *
 * Android's print framework hands the actual rendering to a system service,
 * so all this needs to do is create the [PrintManager.print] job with the
 * adapter the [WebView] exposes.
 */
fun printWebView(context: Context, webView: WebView) {
    val printManager = context.getSystemService(Context.PRINT_SERVICE) as PrintManager

    val jobName = webView.url ?: context.getString(R.string.app_name)
    val adapter = webView.createPrintDocumentAdapter(jobName)

    val attributes = PrintAttributes.Builder()
        .setMediaSize(PrintAttributes.MediaSize.UNKNOWN_PORTRAIT)
        .build()

    printManager.print(jobName, adapter, attributes)
}
