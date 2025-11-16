package com.example.liftly

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            LiftlyTheme {
                // A surface container using the 'background' color from the theme
                Surface(color = MaterialTheme.colorScheme.background) {
                    val navController = rememberNavController()
                    NavHost(navController = navController, startDestination = "first_screen") {
                        composable("first_screen") {
                            FirstScreen(onNavigateToSecondScreen = { navController.navigate("second_screen") })
                        }
                        composable("second_screen") {
                            SecondScreen(onNavigateToFirstScreen = { navController.navigate("first_screen") })
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun LiftlyTheme(content: @Composable () -> Unit) {
    MaterialTheme {
        content()
    }
}
