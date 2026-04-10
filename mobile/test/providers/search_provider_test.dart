import 'package:flutter_test/flutter_test.dart';
import 'package:faso_trip/providers/search_provider.dart';

void main() {
  group('SearchState', () {
    test('default state has empty query and no results', () {
      const state = SearchState();
      expect(state.query, '');
      expect(state.category, '');
      expect(state.results, isNull);
      expect(state.isLoading, false);
      expect(state.error, isNull);
    });

    test('totalCount returns 0 when results is null', () {
      const state = SearchState();
      expect(state.totalCount, 0);
    });

    test('totalCount sums all categories', () {
      final state = SearchState(
        results: {
          'places': [
            {'name': 'Nazinga'},
            {'name': 'Banfora'},
          ],
          'establishments': [
            {'name': 'Hotel'},
          ],
          'wiki': <Map<String, dynamic>>[],
          'itineraries': [
            {'title': 'Tour'},
          ],
        },
      );
      expect(state.totalCount, 4);
    });

    test('totalCount handles missing keys', () {
      final state = SearchState(
        results: {
          'places': [
            {'name': 'Test'},
          ],
        },
      );
      expect(state.totalCount, 1);
    });

    test('copyWith preserves unchanged fields', () {
      final state = SearchState(query: 'hello', category: 'place');
      final updated = state.copyWith(isLoading: true);
      expect(updated.query, 'hello');
      expect(updated.category, 'place');
      expect(updated.isLoading, true);
    });

    test('copyWith clears error when not provided', () {
      final state = SearchState(error: 'oops');
      final updated = state.copyWith(query: 'new');
      expect(updated.error, isNull);
    });
  });

  group('SearchNotifier', () {
    test('clear resets to default state', () {
      final notifier = SearchNotifier();
      notifier.clear();
      expect(notifier.state.query, '');
      expect(notifier.state.category, '');
      expect(notifier.state.results, isNull);
    });

    test('setCategory updates category', () {
      final notifier = SearchNotifier();
      notifier.setCategory('wiki');
      expect(notifier.state.category, 'wiki');
    });

    test('search with short query clears results', () async {
      final notifier = SearchNotifier();
      await notifier.search('a');
      expect(notifier.state.query, 'a');
      expect(notifier.state.results, isNull);
    });
  });
}
