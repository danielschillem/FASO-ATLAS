import 'dart:convert';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:connectivity_plus/connectivity_plus.dart';

class OfflineCache {
  static const _boxName = 'offline_cache';
  static Box? _box;

  static Future<void> init() async {
    await Hive.initFlutter();
    _box = await Hive.openBox(_boxName);
  }

  static Future<void> put(String key, dynamic data, {Duration ttl = const Duration(hours: 6)}) async {
    final box = _box;
    if (box == null) return;
    await box.put(key, jsonEncode({
      'data': data,
      'expiresAt': DateTime.now().add(ttl).millisecondsSinceEpoch,
    }));
  }

  static dynamic get(String key) {
    final box = _box;
    if (box == null) return null;
    final raw = box.get(key);
    if (raw == null) return null;
    try {
      final decoded = jsonDecode(raw as String);
      final expiresAt = decoded['expiresAt'] as int;
      if (DateTime.now().millisecondsSinceEpoch > expiresAt) {
        box.delete(key);
        return null;
      }
      return decoded['data'];
    } catch (_) {
      return null;
    }
  }

  static Future<void> clear() async {
    await _box?.clear();
  }

  static Future<bool> isOnline() async {
    final result = await Connectivity().checkConnectivity();
    return !result.contains(ConnectivityResult.none);
  }
}
