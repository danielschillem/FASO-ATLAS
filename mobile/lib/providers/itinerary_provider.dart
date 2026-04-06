import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/constants/api_endpoints.dart';
import '../core/network/dio_client.dart';

final itinerariesProvider = FutureProvider.autoDispose
    .family<Map<String, dynamic>, Map<String, dynamic>>((ref, params) async {
  final res = await DioClient.instance.get(
    ApiEndpoints.itineraries,
    queryParameters: {...params, 'limit': 12},
  );
  return res.data as Map<String, dynamic>;
});

final itineraryDetailProvider =
    FutureProvider.autoDispose.family<Map<String, dynamic>, int>((ref, id) async {
  final res = await DioClient.instance.get('${ApiEndpoints.itineraries}/$id');
  return res.data as Map<String, dynamic>;
});
