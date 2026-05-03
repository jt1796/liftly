package com.anonymous.liftly

import android.accessibilityservice.AccessibilityService
import android.content.Context
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import java.util.regex.Pattern

class UrlBlockerService : AccessibilityService() {

    private val TAG = "UrlBlockerService"
    private var blockedPatterns: List<Pattern> = emptyList()

    override fun onServiceConnected() {
        super.onServiceConnected()
        Log.d(TAG, "Accessibility Service Connected")
        loadBlockedPatterns()
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent) {
        if (event.eventType == AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED ||
            event.eventType == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED
        ) {
            val rootNode = rootInActiveWindow ?: return
            
            // Re-load patterns occasionally or based on some trigger if needed, 
            // but for now we'll load them here or assume they are updated via SharedPreferences
            loadBlockedPatterns()

            if (blockedPatterns.isEmpty()) return

            val packageName = event.packageName?.toString() ?: ""
            if (isBrowser(packageName)) {
                analyzeNode(rootNode)
            }
        }
    }

    private fun isBrowser(packageName: String): Boolean {
        return packageName == "com.android.chrome" ||
               packageName == "com.sec.android.app.sbrowser" ||
               packageName == "org.mozilla.firefox" ||
               packageName == "com.opera.browser"
    }

    private fun analyzeNode(node: AccessibilityNodeInfo) {
        val nodeId = node.viewIdResourceName ?: ""

        if (isUrlBar(nodeId, node)) {
            val nodeText = node.text?.toString() ?: ""
            // Only block if the URL bar is NOT focused. 
            // This prevents blocking while the user is actively typing/seeing suggestions.
            if (!node.isFocused && shouldBlock(nodeText)) {
                blockAccess()
                return
            }
        }

        for (i in 0 until node.childCount) {
            val child = node.getChild(i)
            if (child != null) {
                analyzeNode(child)
            }
        }
    }

    private fun isUrlBar(nodeId: String, node: AccessibilityNodeInfo): Boolean {
        // Specific IDs for known browsers
        if (nodeId == "com.android.chrome:id/url_bar" ||
            nodeId == "com.android.chrome:id/search_box_text" ||
            nodeId == "com.sec.android.app.sbrowser:id/location_bar_edit_text" ||
            nodeId == "org.mozilla.firefox:id/url_bar_title"
        ) {
            return true
        }

        // Generic check: prioritize EditTexts for URL bars.
        // Suggestions are usually not EditTexts.
        if (node.className == "android.widget.EditText") {
            val idLower = nodeId.lowercase()
            if (idLower.contains("url") || idLower.contains("address") || idLower.contains("location")) {
                return true
            }
        }
        
        return false
    }

    private fun shouldBlock(url: String): Boolean {
        for (pattern in blockedPatterns) {
            if (pattern.matcher(url).find()) {
                return true
            }
        }
        return false
    }

    private fun blockAccess() {
        Log.d(TAG, "Blocking access!")
        // For now, just go back. A better way would be to show an overlay.
        performGlobalAction(GLOBAL_ACTION_BACK)
    }

    private fun loadBlockedPatterns() {
        val sharedPref = getSharedPreferences("UrlBlockerPrefs", Context.MODE_PRIVATE)
        val regexSet = sharedPref.getStringSet("blockedRegex", emptySet()) ?: emptySet()
        blockedPatterns = regexSet.mapNotNull { 
            try { Pattern.compile(it, Pattern.CASE_INSENSITIVE) } catch (e: Exception) { null }
        }
    }

    override fun onInterrupt() {}
}
