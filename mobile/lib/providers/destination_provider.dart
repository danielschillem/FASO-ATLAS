import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/constants/api_endpoints.dart';
import '../core/network/dio_client.dart';

// ── Filters state ─────────────────────────────────────────────────────
class DestinationFilters {
  final String type;
  final int? regionId;
  final int page;
  final int limit;

  const DestinationFilters({
    this.type    = '',
    this.regionId,
    this.page    = 1,
    this.limit   = 12,
  });

  DestinationFilters copyWith({String? type, int? regionId, int? page, int? limit}) =>
      DestinationFilters(
        type:     type     ?? this.type,
        regionId: regionId ?? this.regionId,
        page:     page     ?? this.page,
        limit:    limit    ?? this.limit,
      );

  Map<String, dynamic> toParams() => {
    if (type.isNotEmpty) 'type': type,
    if (regionId != null) 'region_id': regionId,
    'page':  page,
    'limit': limit,
  };
}

// ── Notifier ──────────────────────────────────────────────────────────
class DestinationNotifier extends StateNotifier<DestinationFilters> {
  DestinationNotifier() : super(const DestinationFilters());

  void setType(String type) => state = state.copyWith(type: type, page: 1);
  void setRegion(int? regionId) => state = state.copyWith(regionId: regionId, page: 1);
  void nextPage() => state = state.copyWith(page: state.page + 1);
  void prevPage() {
    if (state.page > 1) state = state.copyWith(page: state.page - 1);
  }
}

// ── Providers ─────────────────────────────────────────────────────────
final destinationFiltersProvider =
    StateNotifierProvider<DestinationNotifier, DestinationFilters>(
  (_) => DestinationNotifier(),
);

final destinationsProvider = FutureProvider.autoDispose
    .family<Map<String, dynamic>, DestinationFilters>((ref, filters) async {
  final res = await DioClient.instance.get(
    ApiEndpoints.destinations,
    queryParameters: filters.toParams(),
  );
  return res.data as Map<String, dynamic>;
});

final destinationDetailProvider =
    FutureProvider.autoDispose.family<Map<String, dynamic>, String>((ref, slug) async {
  final res = await DioClient.instance.get('${ApiEndpoints.destinations}/$slug');
  return res.data as Map<String, dynamic>;
});
