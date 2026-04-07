import '../services/offline_cache.dart';
import '../core/network/dio_client.dart';

/// Wraps an API GET call with offline cache.
/// On success: caches the response. On failure: returns cached data if available.
Future<T> cachedApiGet<T>(
  String cacheKey,
  Future<T> Function() apiCall, {
  T Function(dynamic json)? fromCache,
  Duration ttl = const Duration(hours: 6),
}) async {
  try {
    final result = await apiCall();
    // Cache raw result
    if (result is Map || result is List) {
      await OfflineCache.put(cacheKey, result, ttl: ttl);
    }
    return result;
  } catch (e) {
    // Try cache
    final cached = OfflineCache.get(cacheKey);
    if (cached != null && fromCache != null) {
      return fromCache(cached);
    }
    if (cached != null) {
      return cached as T;
    }
    rethrow;
  }
}

/// Same pattern but for Dio response.data
Future<Map<String, dynamic>> cachedGet(
  String endpoint, {
  Map<String, dynamic>? queryParameters,
  String? cacheKey,
  Duration ttl = const Duration(hours: 6),
}) async {
  final key = cacheKey ?? '$endpoint${queryParameters ?? ''}';
  try {
    final isOnline = await OfflineCache.isOnline();
    if (!isOnline) {
      final cached = OfflineCache.get(key);
      if (cached != null) {
        return Map<String, dynamic>.from(cached as Map);
      }
    }
    final res = await DioClient.instance
        .get(endpoint, queryParameters: queryParameters);
    final data = res.data;
    if (data is Map<String, dynamic>) {
      await OfflineCache.put(key, data, ttl: ttl);
      return data;
    }
    return {'data': data};
  } catch (e) {
    final cached = OfflineCache.get(key);
    if (cached != null) {
      return Map<String, dynamic>.from(cached as Map);
    }
    rethrow;
  }
}

/// For list endpoints that return List<dynamic>
Future<List<dynamic>> cachedGetList(
  String endpoint, {
  Map<String, dynamic>? queryParameters,
  String? cacheKey,
  Duration ttl = const Duration(hours: 6),
}) async {
  final key = cacheKey ?? 'list:$endpoint${queryParameters ?? ''}';
  try {
    final isOnline = await OfflineCache.isOnline();
    if (!isOnline) {
      final cached = OfflineCache.get(key);
      if (cached != null) return List<dynamic>.from(cached as List);
    }
    final res = await DioClient.instance
        .get(endpoint, queryParameters: queryParameters);
    final data = res.data;
    if (data is List) {
      await OfflineCache.put(key, data, ttl: ttl);
      return data;
    }
    return [data];
  } catch (e) {
    final cached = OfflineCache.get(key);
    if (cached != null) return List<dynamic>.from(cached as List);
    rethrow;
  }
}
