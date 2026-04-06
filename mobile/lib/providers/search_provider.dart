import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/constants/api_endpoints.dart';
import '../core/network/dio_client.dart';

class SearchState {
  final String query;
  final String category;
  final Map<String, dynamic>? results;
  final bool isLoading;
  final String? error;

  const SearchState({
    this.query    = '',
    this.category = '',
    this.results,
    this.isLoading = false,
    this.error,
  });

  SearchState copyWith({
    String? query, String? category,
    Map<String, dynamic>? results,
    bool? isLoading, String? error,
  }) => SearchState(
    query:     query     ?? this.query,
    category:  category  ?? this.category,
    results:   results   ?? this.results,
    isLoading: isLoading ?? this.isLoading,
    error:     error,
  );

  int get totalCount {
    if (results == null) return 0;
    return ((results!['places']     as List?)?.length ?? 0) +
           ((results!['establishments'] as List?)?.length ?? 0) +
           ((results!['wiki']       as List?)?.length ?? 0) +
           ((results!['itineraries'] as List?)?.length ?? 0);
  }
}

class SearchNotifier extends StateNotifier<SearchState> {
  SearchNotifier() : super(const SearchState());

  void setCategory(String c) {
    state = state.copyWith(category: c);
    if (state.query.trim().length >= 2) search(state.query);
  }

  Future<void> search(String q) async {
    if (q.trim().length < 2) {
      state = state.copyWith(query: q, results: null);
      return;
    }
    state = state.copyWith(query: q, isLoading: true);
    try {
      final params = <String, dynamic>{'q': q};
      if (state.category.isNotEmpty) params['type'] = state.category;
      final res = await DioClient.instance.get(ApiEndpoints.search, queryParameters: params);
      state = state.copyWith(
        isLoading: false,
        results: res.data as Map<String, dynamic>,
      );
    } catch (_) {
      state = state.copyWith(isLoading: false, error: 'Erreur de recherche');
    }
  }

  void clear() => state = const SearchState();
}

final searchProvider = StateNotifierProvider<SearchNotifier, SearchState>(
  (_) => SearchNotifier(),
);
