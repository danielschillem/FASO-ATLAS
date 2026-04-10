## Flutter-specific ProGuard rules

# Keep Flutter engine
-keep class io.flutter.** { *; }
-keep class io.flutter.plugins.** { *; }
-dontwarn io.flutter.embedding.**

# Keep Gson / JSON serialization (if used by plugins)
-keepattributes Signature
-keepattributes *Annotation*
