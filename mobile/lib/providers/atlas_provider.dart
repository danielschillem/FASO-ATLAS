import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/constants/api_endpoints.dart';
import '../services/cached_api.dart';

final atlasEventsProvider = FutureProvider<List<dynamic>>((ref) async {
  return cachedGetList(ApiEndpoints.atlasEvents, cacheKey: 'atlas:events');
});
