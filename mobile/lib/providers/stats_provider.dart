import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/constants/api_endpoints.dart';
import '../services/cached_api.dart';

final publicStatsProvider =
    FutureProvider<Map<String, dynamic>>((ref) async {
  return cachedGet(ApiEndpoints.stats, cacheKey: 'public:stats');
});
