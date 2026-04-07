import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/constants/api_endpoints.dart';
import '../services/cached_api.dart';

final mapPlacesProvider = FutureProvider.family<Map<String, dynamic>, String>((ref, type) async {
  final params = type != 'all' ? {'type': type} : <String, dynamic>{};
  return cachedGet(ApiEndpoints.mapPlaces, queryParameters: params, cacheKey: 'map:$type');
});

final mapRegionsProvider = FutureProvider<List<dynamic>>((ref) async {
  return cachedGetList(ApiEndpoints.mapRegions, cacheKey: 'map:regions');
});
