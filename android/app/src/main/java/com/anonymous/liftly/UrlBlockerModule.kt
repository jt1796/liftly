package com.anonymous.liftly

import android.content.Context
import android.content.Intent
import android.provider.Settings
import android.text.TextUtils
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.Promise

class UrlBlockerModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "UrlBlockerModule"
    }

    @ReactMethod
    fun setBlockedUrls(regexList: ReadableArray) {
        val regexSet = mutableSetOf<String>()
        for (i in 0 until regexList.size()) {
            regexList.getString(i)?.let { regexSet.add(it) }
        }

        val sharedPref = reactApplicationContext.getSharedPreferences("UrlBlockerPrefs", Context.MODE_PRIVATE)
        with(sharedPref.edit()) {
            putStringSet("blockedRegex", regexSet)
            apply()
        }
    }

    @ReactMethod
    fun getBlockedUrls(promise: Promise) {
        val sharedPref = reactApplicationContext.getSharedPreferences("UrlBlockerPrefs", Context.MODE_PRIVATE)
        val regexSet = sharedPref.getStringSet("blockedRegex", emptySet()) ?: emptySet()
        val array = com.facebook.react.bridge.Arguments.createArray()
        regexSet.forEach { array.pushString(it) }
        promise.resolve(array)
    }

    @ReactMethod
    fun isAccessibilityServiceEnabled(promise: Promise) {
        val context = reactApplicationContext
        val expectedComponentName = context.packageName + "/" + UrlBlockerService::class.java.canonicalName
        val enabledServices = Settings.Secure.getString(context.contentResolver, Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES)
        
        val isEnabled = enabledServices?.let {
            val colonSplitter = TextUtils.SimpleStringSplitter(':')
            colonSplitter.setString(it)
            var found = false
            while (colonSplitter.hasNext()) {
                val componentName = colonSplitter.next()
                if (componentName.equals(expectedComponentName, ignoreCase = true)) {
                    found = true
                    break
                }
            }
            found
        } ?: false
        
        promise.resolve(isEnabled)
    }

    @ReactMethod
    fun openAccessibilitySettings() {
        val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        reactApplicationContext.startActivity(intent)
    }
}
