import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/constants/api_endpoints.dart';
import '../services/cached_api.dart';

final symbolsProvider = FutureProvider<List<dynamic>>((ref) async {
  return cachedGetList(ApiEndpoints.symbols, cacheKey: 'symbols:all');
});
