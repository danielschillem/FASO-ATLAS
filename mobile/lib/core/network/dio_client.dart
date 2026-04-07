import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../constants/api_endpoints.dart';

class DioClient {
  static Dio? _instance;
  static final _storage = const FlutterSecureStorage();
  static bool _isRefreshing = false;
  static final List<void Function(String)> _refreshQueue = [];

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
      onError: (error, handler) async {
        if (error.response?.statusCode == 401 &&
            !error.requestOptions.path.contains('/auth/')) {
          final refreshToken = await _storage.read(key: 'refreshToken');
          if (refreshToken != null && !_isRefreshing) {
            _isRefreshing = true;
            try {
              final refreshDio = Dio(BaseOptions(
                baseUrl: ApiEndpoints.baseUrl,
                headers: {'Content-Type': 'application/json'},
              ));
              final res = await refreshDio.post(
                '/auth/refresh',
                data: {'refreshToken': refreshToken},
              );
              final newAccess = res.data['accessToken'] as String;
              final newRefresh = res.data['refreshToken'] as String?;
              await setTokens(newAccess, newRefresh);
              _isRefreshing = false;
              for (final cb in _refreshQueue) {
                cb(newAccess);
              }
              _refreshQueue.clear();
              error.requestOptions.headers['Authorization'] = 'Bearer $newAccess';
              final retryRes = await instance.fetch(error.requestOptions);
              return handler.resolve(retryRes);
            } catch (_) {
              _isRefreshing = false;
              _refreshQueue.clear();
              await clearTokens();
            }
          } else if (refreshToken == null) {
            await clearTokens();
          }
        }
        handler.next(error);
      },
    ));

    return dio;
  }

  static Future<void> setTokens(String access, String? refresh) async {
    await _storage.write(key: 'accessToken', value: access);
    if (refresh != null) {
      await _storage.write(key: 'refreshToken', value: refresh);
    }
  }

  static Future<void> setToken(String token) =>
      _storage.write(key: 'accessToken', value: token);

  static Future<void> clearTokens() async {
    await _storage.delete(key: 'accessToken');
    await _storage.delete(key: 'refreshToken');
  }

  static Future<void> clearToken() => clearTokens();

  static Future<String?> getToken() =>
      _storage.read(key: 'accessToken');
}
