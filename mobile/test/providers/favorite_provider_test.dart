import 'package:flutter_test/flutter_test.dart';
import 'package:faso_atlas/providers/favorite_provider.dart';

void main() {
  group('FavoriteState', () {
    test('default state has empty favorites and not loading', () {
      final state = FavoriteState();
      expect(state.favorites, isEmpty);
      expect(state.isLoading, false);
      expect(state.error, isNull);
    });

    test('copyWith preserves unchanged fields', () {
      final state = FavoriteState(
        favorites: [
          {'targetId': 1, 'targetType': 'place'},
        ],
      );
      final updated = state.copyWith(isLoading: true);
      expect(updated.favorites.length, 1);
      expect(updated.isLoading, true);
    });

    test('copyWith with new favorites replaces list', () {
      final state = FavoriteState(
        favorites: [
          {'targetId': 1, 'targetType': 'place'},
        ],
      );
      final updated = state.copyWith(favorites: []);
      expect(updated.favorites, isEmpty);
    });
  });

  group('FavoriteNotifier', () {
    test('isFavorited returns false for unchecked items', () {
      final notifier = FavoriteNotifier();
      expect(notifier.isFavorited(1, 'place'), false);
    });
  });
}
