import 'package:flutter/material.dart';

class AppColors {
  AppColors._();

  // Burkina Faso national palette
  static const rouge    = Color(0xFFC1272D);
  static const vert     = Color(0xFF006B3C);
  static const or       = Color(0xFFD4A017);
  static const orVif    = Color(0xFFF0B429);
  static const terre    = Color(0xFF7C3B1E);
  static const sable    = Color(0xFFF5E6C8);
  static const sable2   = Color(0xFFEDD9A3);
  static const nuit     = Color(0xFF160A00);
  static const brun     = Color(0xFF2A1200);
  static const gris     = Color(0xFF8A7060);
  static const blanc    = Color(0xFFFDFAF5);

  // Map pin colors (matches web)
  static const pinSite    = rouge;
  static const pinHotel   = vert;
  static const pinNature  = or;
  static const pinCulture = Color(0xFF7C3BBF);

  // Status colors
  static const statusPending   = Color(0xFFD4A017);
  static const statusConfirmed = Color(0xFF006B3C);
  static const statusCancelled = Color(0xFFC1272D);
  static const statusCompleted = Color(0xFF8A7060);

  static Color pinColor(String type) {
    switch (type) {
      case 'site':    return pinSite;
      case 'hotel':   return pinHotel;
      case 'nature':  return pinNature;
      case 'culture': return pinCulture;
      default:        return gris;
    }
  }
}
