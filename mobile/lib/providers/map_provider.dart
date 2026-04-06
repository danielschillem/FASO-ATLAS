import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/constants/api_endpoints.dart';
import '../core/network/dio_client.dart';

final mapPlacesProvider = FutureProvider.family<Map<String, dynamic>, String>((ref, type) async {
  final params = type != 'all' ? {'type': type} : <String, dynamic>{};
  final response = await DioClient.instance.get(
    ApiEndpoints.mapPlaces,
    queryParameters: params,
  );
  return response.data as Map<String, dynamic>;
});

final mapRegionsProvider = FutureProvider<List<dynamic>>((ref) async {
  final response = await DioClient.instance.get(ApiEndpoints.mapRegions);
  return response.data as List<dynamic>;
});
