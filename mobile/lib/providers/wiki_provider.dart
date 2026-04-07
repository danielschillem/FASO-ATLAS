import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/constants/api_endpoints.dart';
import '../core/network/dio_client.dart';
import '../services/cached_api.dart';

// ── Articles list ─────────────────────────────────────────────────────
final wikiCategoryProvider = StateProvider<String?>((ref) => null);

final wikiArticlesProvider = FutureProvider.autoDispose
    .family<Map<String, dynamic>, String?>((ref, category) async {
  final params = <String, dynamic>{'limit': 50};
  if (category != null && category.isNotEmpty) params['category'] = category;
  return cachedGet(
    ApiEndpoints.wikiArticles,
    queryParameters: params,
    cacheKey: 'wiki:list:${category ?? 'all'}',
  );
});

// ── Article detail ────────────────────────────────────────────────────
final wikiArticleProvider =
    FutureProvider.autoDispose.family<Map<String, dynamic>, String>((ref, slug) async {
  return cachedGet(
    '${ApiEndpoints.wikiArticles}/$slug',
    cacheKey: 'wiki:$slug',
  );
});

// ── Submit revision ───────────────────────────────────────────────────
class WikiEditorState {
  final bool isLoading;
  final bool isSuccess;
  final String? error;
  const WikiEditorState({this.isLoading = false, this.isSuccess = false, this.error});
}

class WikiEditorNotifier extends StateNotifier<WikiEditorState> {
  WikiEditorNotifier() : super(const WikiEditorState());

  Future<void> submitRevision(String slug, String bodyHtml, String summary) async {
    state = const WikiEditorState(isLoading: true);
    try {
      await DioClient.instance.post(
        '${ApiEndpoints.wikiArticles}/$slug/revisions',
        data: {'bodyHtml': bodyHtml, 'summary': summary},
      );
      state = const WikiEditorState(isSuccess: true);
    } catch (_) {
      state = const WikiEditorState(error: 'Erreur lors de la soumission');
    }
  }
}

final wikiEditorProvider =
    StateNotifierProvider.autoDispose<WikiEditorNotifier, WikiEditorState>(
  (_) => WikiEditorNotifier(),
);
