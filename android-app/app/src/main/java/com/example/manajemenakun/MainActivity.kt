package com.example.manajemenakun

import android.annotation.SuppressLint
import android.os.Bundle
import android.view.ViewGroup
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import android.content.Intent
import android.webkit.WebResourceRequest
import android.net.Uri
import com.example.manajemenakun.theme.ManajemenAkunTheme

class MainActivity : ComponentActivity() {
    private var webView: WebView? = null

    companion object {
        const val PRODUCTION_URL = "https://farid-shop.vercel.app"
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        enableEdgeToEdge()
        setContent {
            ManajemenAkunTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    AndroidView(factory = {
                        WebView(it).apply {
                            webView = this
                            layoutParams = ViewGroup.LayoutParams(
                                ViewGroup.LayoutParams.MATCH_PARENT,
                                ViewGroup.LayoutParams.MATCH_PARENT
                            )
                            settings.javaScriptEnabled = true
                            settings.domStorageEnabled = true
                            settings.allowFileAccess = true
                            settings.allowContentAccess = true
                            
                            // Custom User-Agent to bypass Google OAuth WebView block
                            settings.userAgentString = "Mozilla/5.0 (Linux; Android 13; Pixel 7 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36"
                            
                            webViewClient = object : WebViewClient() {
                                @Deprecated("Deprecated in Java")
                                override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
                                    if (url != null) {
                                        if (url.startsWith("manajemenakun://")) {
                                            val hash = url.substringAfter("manajemenakun://login-callback", "")
                                            view?.evaluateJavascript("window.location.hash = '$hash';", null)
                                            return true
                                        } else if (url.contains("supabase.co/auth/v1/authorize")) {
                                            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                                            view?.context?.startActivity(intent)
                                            return true
                                        }
                                    }
                                    return false
                                }

                                override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                                    val url = request?.url?.toString() ?: ""
                                    if (url.startsWith("manajemenakun://")) {
                                        val hash = url.substringAfter("manajemenakun://login-callback", "")
                                        view?.evaluateJavascript("window.location.hash = '$hash';", null)
                                        return true
                                    } else if (url.contains("supabase.co/auth/v1/authorize")) {
                                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                                        view?.context?.startActivity(intent)
                                        return true
                                    }
                                    return super.shouldOverrideUrlLoading(view, request)
                                }
                            }
                            
                            webChromeClient = WebChromeClient()
                            
                            // Handle initial deep link if app is launched from it
                            val intentUrl = intent?.data?.toString()
                            if (intentUrl != null && intentUrl.startsWith("manajemenakun://")) {
                                val hash = intentUrl.substringAfter("manajemenakun://login-callback", "")
                                loadUrl("$PRODUCTION_URL#$hash")
                            } else {
                                loadUrl(PRODUCTION_URL)
                            }
                        }
                    }, update = {
                        // Empty to prevent WebView reload on recomposition
                    })
                }
            }
        }
    }

    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent)
        setIntent(intent)
        val intentUrl = intent?.data?.toString()
        if (intentUrl != null && intentUrl.startsWith("manajemenakun://")) {
            val hash = intentUrl.substringAfter("manajemenakun://login-callback", "")
            webView?.post {
                webView?.evaluateJavascript("window.location.hash = '$hash';", null)
            }
        }
    }
}
