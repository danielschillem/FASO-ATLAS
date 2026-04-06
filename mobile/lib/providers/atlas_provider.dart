import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/constants/api_endpoints.dart';
import '../core/network/dio_client.dart';

final atlasEventsProvider = FutureProvider<List<dynamic>>((ref) async {
  final response = await DioClient.instance.get(ApiEndpoints.atlasEvents);
  return response.data as List<dynamic>;
});
