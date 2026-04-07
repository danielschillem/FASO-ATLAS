import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/constants/api_endpoints.dart';
import '../services/cached_api.dart';

final itinerariesProvider = FutureProvider.autoDispose
    .family<Map<String, dynamic>, Map<String, dynamic>>((ref, params) async {
  return cachedGet(
    ApiEndpoints.itineraries,
    queryParameters: {...params, 'limit': 12},
    cacheKey: 'itineraries:${params.entries.map((e) => '${e.key}=${e.value}').join(',')}',
  );
});

final itineraryDetailProvider =
    FutureProvider.autoDispose.family<Map<String, dynamic>, int>((ref, id) async {
  return cachedGet(
    '${ApiEndpoints.itineraries}/$id',
    cacheKey: 'itinerary:$id',
  );
});
