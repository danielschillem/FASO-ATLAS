import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/constants/api_endpoints.dart';
import '../core/network/dio_client.dart';

class FavoriteState {
  final List<Map<String, dynamic>> favorites;
  final bool isLoading;
  final String? error;

  const FavoriteState({
    this.favorites = const [],
    this.isLoading = false,
    this.error,
  });

  FavoriteState copyWith({
    List<Map<String, dynamic>>? favorites,
    bool? isLoading,
    String? error,
  }) =>
      FavoriteState(
        favorites: favorites ?? this.favorites,
        isLoading: isLoading ?? this.isLoading,
        error: error,
      );
}

class FavoriteNotifier extends StateNotifier<FavoriteState> {
  FavoriteNotifier() : super(const FavoriteState());

  final Set<String> _checkedKeys = {};

  String _key(int targetId, String targetType) => '$targetType:$targetId';

  bool isFavorited(int targetId, String targetType) {
    return _checkedKeys.contains(_key(targetId, targetType));
  }

  Future<void> loadFavorites() async {
    state = state.copyWith(isLoading: true);
    try {
      final res = await DioClient.instance
          .get(ApiEndpoints.favorites, queryParameters: {'limit': 100});
      final data = res.data as Map<String, dynamic>;
      final list = List<Map<String, dynamic>>.from(
        (data['data'] as List).map((e) => Map<String, dynamic>.from(e as Map)),
      );
      _checkedKeys.clear();
      for (final f in list) {
        _checkedKeys.add(_key(f['targetId'] as int, f['targetType'] as String));
      }
      state = state.copyWith(favorites: list, isLoading: false);
    } catch (_) {
      state = state.copyWith(isLoading: false, error: 'Erreur de chargement');
    }
  }

  Future<bool> check(int targetId, String targetType) async {
    try {
      final res = await DioClient.instance.get(
        '${ApiEndpoints.favoritesCheck}/$targetId',
        queryParameters: {'type': targetType},
      );
      final favorited = res.data['favorited'] as bool;
      if (favorited) {
        _checkedKeys.add(_key(targetId, targetType));
      } else {
        _checkedKeys.remove(_key(targetId, targetType));
      }
      state = state.copyWith(); // trigger rebuild
      return favorited;
    } catch (_) {
      return false;
    }
  }

  Future<bool> toggle(int targetId, String targetType) async {
    try {
      final res = await DioClient.instance.post(
        ApiEndpoints.favoritesToggle,
        data: {'targetId': targetId, 'targetType': targetType},
      );
      final favorited = res.data['favorited'] as bool;
      if (favorited) {
        _checkedKeys.add(_key(targetId, targetType));
      } else {
        _checkedKeys.remove(_key(targetId, targetType));
      }
      await loadFavorites();
      return favorited;
    } catch (_) {
      return false;
    }
  }
}

final favoriteProvider =
    StateNotifierProvider<FavoriteNotifier, FavoriteState>(
  (_) => FavoriteNotifier(),
);
