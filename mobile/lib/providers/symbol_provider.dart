import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/constants/api_endpoints.dart';
import '../core/network/dio_client.dart';

final symbolsProvider = FutureProvider<List<dynamic>>((ref) async {
  final res = await DioClient.instance.get(ApiEndpoints.symbols);
  return res.data as List<dynamic>;
});
