import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../constants/api_endpoints.dart';

class DioClient {
  static Dio? _instance;
  static final _storage = const FlutterSecureStorage();

  static Dio get instance {
    _instance ??= _createDio();
    return _instance!;
  }

  static Dio _createDio() {
    final dio = Dio(BaseOptions(
      baseUrl: ApiEndpoints.baseUrl,
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 15),
      headers: {'Content-Type': 'application/json'},
    ));

    dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await _storage.read(key: 'accessToken');
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
      onError: (error, handler) {
        // Handle 401 — token expired
        if (error.response?.statusCode == 401) {
          _storage.delete(key: 'accessToken');
        }
        handler.next(error);
      },
    ));

    return dio;
  }

  static Future<void> setToken(String token) =>
      _storage.write(key: 'accessToken', value: token);

  static Future<void> clearToken() =>
      _storage.delete(key: 'accessToken');

  static Future<String?> getToken() =>
      _storage.read(key: 'accessToken');
}
