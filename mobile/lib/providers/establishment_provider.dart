import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/constants/api_endpoints.dart';
import '../core/network/dio_client.dart';

class EstablishmentFilters {
  final String type;
  final int? stars;
  final int? regionId;
  final int page;

  const EstablishmentFilters({
    this.type    = 'hotel',
    this.stars,
    this.regionId,
    this.page    = 1,
  });

  EstablishmentFilters copyWith({String? type, int? stars, int? regionId, int? page}) =>
      EstablishmentFilters(
        type:     type     ?? this.type,
        stars:    stars    ?? this.stars,
        regionId: regionId ?? this.regionId,
        page:     page     ?? this.page,
      );

  Map<String, dynamic> toParams() => {
    'type': type,
    if (stars    != null) 'stars':     stars,
    if (regionId != null) 'region_id': regionId,
    'page':  page,
    'limit': 12,
  };
}

class EstablishmentNotifier extends StateNotifier<EstablishmentFilters> {
  EstablishmentNotifier() : super(const EstablishmentFilters());

  void setType(String type)   => state = state.copyWith(type: type, page: 1);
  void setStars(int? stars)   => state = state.copyWith(stars: stars, page: 1);
}

final establishmentFiltersProvider =
    StateNotifierProvider<EstablishmentNotifier, EstablishmentFilters>(
  (_) => EstablishmentNotifier(),
);

final establishmentsProvider = FutureProvider.autoDispose
    .family<Map<String, dynamic>, EstablishmentFilters>((ref, filters) async {
  final res = await DioClient.instance.get(
    ApiEndpoints.establishments,
    queryParameters: filters.toParams(),
  );
  return res.data as Map<String, dynamic>;
});

final establishmentDetailProvider =
    FutureProvider.autoDispose.family<Map<String, dynamic>, int>((ref, id) async {
  final res = await DioClient.instance.get('${ApiEndpoints.establishments}/$id');
  return res.data as Map<String, dynamic>;
});
