import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/constants/api_endpoints.dart';
import '../core/network/dio_client.dart';
import '../models/user.dart';

// ── State ─────────────────────────────────────────────────────────────
class AuthState {
  final User? user;
  final bool isLoading;
  final String? error;

  const AuthState({this.user, this.isLoading = false, this.error});

  bool get isAuthenticated => user != null;

  AuthState copyWith({User? user, bool? isLoading, String? error, bool clearUser = false}) =>
      AuthState(
        user:      clearUser ? null : (user ?? this.user),
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
      state = state.copyWith(user: User.fromJson(res.data as Map<String, dynamic>));
    } catch (_) {
      await DioClient.clearTokens();
    }
  }

  Future<bool> login(String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final res = await DioClient.instance.post(ApiEndpoints.login, data: {
        'email': email,
        'password': password,
      });
      final data = res.data as Map<String, dynamic>;
      await DioClient.setTokens(
        data['accessToken'] as String,
        data['refreshToken'] as String?,
      );
      state = state.copyWith(
        user: User.fromJson(data['user'] as Map<String, dynamic>),
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
    state = state.copyWith(isLoading: true, error: null);
    try {
      final res = await DioClient.instance.post(ApiEndpoints.register, data: {
        'email': email, 'password': password,
        'firstName': firstName, 'lastName': lastName ?? '',
        'role': role,
      });
      final data = res.data as Map<String, dynamic>;
      await DioClient.setTokens(
        data['accessToken'] as String,
        data['refreshToken'] as String?,
      );
      state = state.copyWith(
        user: User.fromJson(data['user'] as Map<String, dynamic>),
        isLoading: false,
      );
      return true;
    } catch (_) {
      state = state.copyWith(isLoading: false, error: 'Inscription échouée');
      return false;
    }
  }

  Future<void> logout() async {
    await DioClient.clearTokens();
    state = const AuthState();
  }
}

// ── Provider ──────────────────────────────────────────────────────────
final authProvider = StateNotifierProvider<AuthNotifier, AuthState>(
  (_) => AuthNotifier(),
);
