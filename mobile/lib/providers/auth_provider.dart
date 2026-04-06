import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../core/constants/api_endpoints.dart';
import '../core/network/dio_client.dart';

// ── State ─────────────────────────────────────────────────────────────
class AuthState {
  final Map<String, dynamic>? user;
  final bool isLoading;
  final String? error;

  const AuthState({this.user, this.isLoading = false, this.error});

  bool get isAuthenticated => user != null;

  AuthState copyWith({Map<String, dynamic>? user, bool? isLoading, String? error}) =>
      AuthState(
        user:      user      ?? this.user,
        isLoading: isLoading ?? this.isLoading,
        error:     error,
      );
}

// ── Notifier ──────────────────────────────────────────────────────────
class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier() : super(const AuthState()) {
    _init();
  }

  Future<void> _init() async {
    final token = await DioClient.getToken();
    if (token == null) return;
    try {
      final res = await DioClient.instance.get(ApiEndpoints.me);
      state = state.copyWith(user: res.data as Map<String, dynamic>);
    } catch (_) {
      await DioClient.clearToken();
    }
  }

  Future<bool> login(String email, String password) async {
    state = state.copyWith(isLoading: true);
    try {
      final res = await DioClient.instance.post(ApiEndpoints.login, data: {
        'email': email,
        'password': password,
      });
      await DioClient.setToken(res.data['accessToken'] as String);
      state = state.copyWith(
        user:      res.data['user'] as Map<String, dynamic>,
        isLoading: false,
      );
      return true;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: 'Identifiants incorrects');
      return false;
    }
  }

  Future<bool> register({
    required String email,
    required String password,
    required String firstName,
    String? lastName,
    String role = 'tourist',
  }) async {
    state = state.copyWith(isLoading: true);
    try {
      final res = await DioClient.instance.post(ApiEndpoints.register, data: {
        'email': email, 'password': password,
        'firstName': firstName, 'lastName': lastName ?? '',
        'role': role,
      });
      await DioClient.setToken(res.data['accessToken'] as String);
      state = state.copyWith(
        user:      res.data['user'] as Map<String, dynamic>,
        isLoading: false,
      );
      return true;
    } catch (_) {
      state = state.copyWith(isLoading: false, error: 'Inscription échouée');
      return false;
    }
  }

  Future<void> logout() async {
    await DioClient.clearToken();
    state = const AuthState();
  }
}

// ── Provider ──────────────────────────────────────────────────────────
final authProvider = StateNotifierProvider<AuthNotifier, AuthState>(
  (_) => AuthNotifier(),
);
