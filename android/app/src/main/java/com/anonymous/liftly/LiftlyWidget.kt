package com.anonymous.liftly

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.graphics.*
import android.net.Uri
import android.util.Log
import android.view.View
import android.widget.RemoteViews
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import java.text.SimpleDateFormat
import java.util.*

class LiftlyWidget : AppWidgetProvider() {
    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    companion object {
        fun updateAppWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            appWidgetId: Int
        ) {
            val views = RemoteViews(context.packageName, R.layout.widget_layout)
            
            // Set up click intent
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse("liftly://web?path=workout"))
            val pendingIntent = PendingIntent.getActivity(
                context, 
                0, 
                intent, 
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_button, pendingIntent)

            // Fetch data and update heatmap
            fetchWorkoutsAndUpdateHeatmap(context, appWidgetManager, appWidgetId, views)
        }

        private fun fetchWorkoutsAndUpdateHeatmap(
            context: Context,
            appWidgetManager: AppWidgetManager,
            appWidgetId: Int,
            views: RemoteViews
        ) {
            val user = FirebaseAuth.getInstance().currentUser
            if (user == null) {
                Log.d("LiftlyWidget", "No user logged in")
                views.setTextViewText(R.id.widget_error, "Please log in to see your heatmap")
                views.setViewVisibility(R.id.widget_error, View.VISIBLE)
                views.setViewVisibility(R.id.heatmap_image, View.GONE)
                appWidgetManager.updateAppWidget(appWidgetId, views)
                return
            }

            val db = FirebaseFirestore.getInstance()
            
            // We fetch all workouts for the user and filter locally to avoid index requirements
            db.collection("workouts")
                .whereEqualTo("userId", user.uid)
                .get()
                .addOnSuccessListener { documents ->
                    val workoutDates = mutableSetOf<String>()
                    val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.US)
                    
                    val cal = Calendar.getInstance()
                    cal.add(Calendar.YEAR, -1)
                    val oneYearAgo = cal.time

                    for (doc in documents) {
                        val timestamp = doc.getTimestamp("date")
                        if (timestamp != null) {
                            val date = timestamp.toDate()
                            if (date.after(oneYearAgo)) {
                                workoutDates.add(sdf.format(date))
                            }
                        }
                    }
                    
                    val bitmap = generateHeatmapBitmap(workoutDates)
                    views.setImageViewBitmap(R.id.heatmap_image, bitmap)
                    views.setViewVisibility(R.id.widget_error, View.GONE)
                    views.setViewVisibility(R.id.heatmap_image, View.VISIBLE)
                    appWidgetManager.updateAppWidget(appWidgetId, views)
                }
                .addOnFailureListener { e ->
                    Log.e("LiftlyWidget", "Error fetching workouts", e)
                    views.setTextViewText(R.id.widget_error, "Error: ${e.message}")
                    views.setViewVisibility(R.id.widget_error, View.VISIBLE)
                    views.setViewVisibility(R.id.heatmap_image, View.GONE)
                    appWidgetManager.updateAppWidget(appWidgetId, views)
                }
        }

        private fun generateHeatmapBitmap(workoutDates: Set<String>): Bitmap {
            val weeks = 53
            val days = 7
            val cellSize = 20f
            val cellGap = 4f
            val padding = 10f
            
            val width = (weeks * (cellSize + cellGap)) + (padding * 2)
            val height = (days * (cellSize + cellGap)) + (padding * 2)
            
            val bitmap = Bitmap.createBitmap(width.toInt(), height.toInt(), Bitmap.Config.ARGB_8888)
            val canvas = Canvas(bitmap)
            val paint = Paint(Paint.ANTI_ALIAS_FLAG)
            
            val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.US)
            val today = Calendar.getInstance()
            
            // Start iterating from 1 year ago, aligned to the start of the week
            val iter = Calendar.getInstance()
            iter.add(Calendar.YEAR, -1)
            iter.add(Calendar.DAY_OF_YEAR, 1)
            val startOfPeriod = iter.timeInMillis

            // Align to start of week (Sunday)
            while (iter.get(Calendar.DAY_OF_WEEK) != Calendar.SUNDAY) {
                iter.add(Calendar.DAY_OF_YEAR, -1)
            }
            
            for (w in 0 until weeks) {
                for (d in 0 until days) {
                    val x = padding + (w * (cellSize + cellGap))
                    val y = padding + (d * (cellSize + cellGap))
                    
                    val dateStr = sdf.format(iter.time)
                    
                    if (iter.after(today) || iter.timeInMillis < startOfPeriod) {
                        // Out of range - don't draw
                    } else {
                        paint.color = if (workoutDates.contains(dateStr)) {
                            Color.parseColor("#216e39") // GitHub Green
                        } else {
                            Color.parseColor("#30363d") // GitHub Dark mode empty cell
                        }
                        
                        val rect = RectF(x, y, x + cellSize, y + cellSize)
                        canvas.drawRoundRect(rect, 4f, 4f, paint)
                    }
                    iter.add(Calendar.DAY_OF_YEAR, 1)
                }
            }
            
            return bitmap
        }
    }
}
