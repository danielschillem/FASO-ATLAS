import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../constants/app_colors.dart';

class AppTheme {
  AppTheme._();

  static ThemeData get light => ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: AppColors.rouge,
      primary: AppColors.rouge,
      secondary: AppColors.or,
      tertiary: AppColors.vert,
      surface: AppColors.blanc,
      onPrimary: Colors.white,
      onSurface: AppColors.nuit,
    ),
    scaffoldBackgroundColor: AppColors.blanc,
    appBarTheme: AppBarTheme(
      backgroundColor: AppColors.nuit,
      foregroundColor: AppColors.blanc,
      elevation: 0,
      centerTitle: false,
      titleTextStyle: GoogleFonts.cormorantGaramond(
        fontSize: 22,
        fontWeight: FontWeight.w600,
        color: AppColors.blanc,
      ),
    ),
    textTheme: TextTheme(
      displayLarge: GoogleFonts.cormorantGaramond(
        fontSize: 40, fontWeight: FontWeight.w700, color: AppColors.nuit,
      ),
      displayMedium: GoogleFonts.cormorantGaramond(
        fontSize: 32, fontWeight: FontWeight.w600, color: AppColors.nuit,
      ),
      headlineLarge: GoogleFonts.cormorantGaramond(
        fontSize: 26, fontWeight: FontWeight.w600, color: AppColors.nuit,
      ),
      headlineMedium: GoogleFonts.cormorantGaramond(
        fontSize: 22, fontWeight: FontWeight.w500, color: AppColors.nuit,
      ),
      titleLarge: GoogleFonts.outfit(
        fontSize: 18, fontWeight: FontWeight.w600, color: AppColors.nuit,
      ),
      titleMedium: GoogleFonts.outfit(
        fontSize: 16, fontWeight: FontWeight.w500, color: AppColors.nuit,
      ),
      bodyLarge: GoogleFonts.outfit(
        fontSize: 16, color: AppColors.nuit, height: 1.6,
      ),
      bodyMedium: GoogleFonts.outfit(
        fontSize: 14, color: AppColors.nuit, height: 1.5,
      ),
      bodySmall: GoogleFonts.outfit(
        fontSize: 12, color: AppColors.gris,
      ),
      labelLarge: GoogleFonts.outfit(
        fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.blanc,
      ),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.rouge,
        foregroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        textStyle: GoogleFonts.outfit(fontWeight: FontWeight.w600, fontSize: 14),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: AppColors.rouge,
        side: const BorderSide(color: AppColors.rouge),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
      ),
    ),
    cardTheme: CardThemeData(
      color: AppColors.blanc,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: AppColors.sable2),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: AppColors.sable,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(6),
        borderSide: BorderSide(color: AppColors.sable2),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(6),
        borderSide: BorderSide(color: AppColors.sable2),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(6),
        borderSide: const BorderSide(color: AppColors.or, width: 1.5),
      ),
      hintStyle: GoogleFonts.outfit(color: AppColors.gris, fontSize: 14),
    ),
    dividerColor: AppColors.sable2,
    dividerTheme: const DividerThemeData(color: AppColors.sable2, space: 0),
  );

  static ThemeData get dark => ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: AppColors.rouge,
      brightness: Brightness.dark,
      primary: AppColors.rouge,
      secondary: AppColors.or,
      surface: AppColors.nuit,
    ),
    scaffoldBackgroundColor: AppColors.nuit,
  );
}
