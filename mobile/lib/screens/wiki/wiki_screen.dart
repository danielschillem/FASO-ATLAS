import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants/app_colors.dart';
import '../../models/wiki_article.dart';
import '../../providers/wiki_provider.dart';
import '../../widgets/common/shimmer_placeholder.dart';
import '../../widgets/common/error_display.dart';

class WikiScreen extends ConsumerWidget {
  const WikiScreen({super.key});

  static const _categories = <Map<String, String?>>[
    {'key': null, 'label': 'Toutes'},
    {'key': 'histoire', 'label': 'Histoire'},
    {'key': 'culture', 'label': 'Culture'},
    {'key': 'geographie', 'label': 'Géographie'},
    {'key': 'peuple', 'label': 'Peuples'},
  ];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final category = ref.watch(wikiCategoryProvider);
    final articlesAsync = ref.watch(wikiArticlesProvider(category));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Wiki Faso'),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(48),
          child: Container(
            color: AppColors.nuit,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: _categories.map((c) {
                  final isActive = category == c['key'];
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: FilterChip(
                      label: Text(c['label']!),
                      selected: isActive,
                      onSelected: (_) => ref
                          .read(wikiCategoryProvider.notifier)
                          .state = c['key'],
                      backgroundColor: AppColors.nuit,
                      selectedColor: AppColors.rouge.withValues(alpha: 0.2),
                      checkmarkColor: AppColors.orVif,
                      labelStyle: TextStyle(
                        color: isActive ? AppColors.orVif : AppColors.gris,
                        fontSize: 12,
                        fontWeight:
                            isActive ? FontWeight.w600 : FontWeight.normal,
                      ),
                      side: BorderSide(
                        color: isActive
                            ? AppColors.orVif
                            : AppColors.gris.withValues(alpha: 0.3),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
          ),
        ),
      ),
      body: articlesAsync.when(
        loading: () => const ListShimmer(count: 5),
        error: (e, _) => ErrorDisplay(
          message: 'Erreur de chargement',
          onRetry: () => ref.invalidate(wikiArticlesProvider(category)),
        ),
        data: (raw) {
          final articles = (raw['data'] as List<dynamic>?)
                  ?.map((e) => WikiArticle.fromJson(e as Map<String, dynamic>))
                  .toList() ??
              [];
          if (articles.isEmpty) {
            return const Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.menu_book_outlined,
                      size: 56, color: AppColors.sable2),
                  SizedBox(height: 12),
                  Text('Aucun article trouvé'),
                ],
              ),
            );
          }
          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: articles.length,
            separatorBuilder: (_, __) => const SizedBox(height: 8),
            itemBuilder: (_, i) {
              final art = articles[i];
              return _WikiCard(article: art);
            },
          );
        },
      ),
    );
  }
}

class _WikiCard extends StatelessWidget {
  final WikiArticle article;
  const _WikiCard({required this.article});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => context.go('/wiki/${article.slug}'),
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Icon
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: AppColors.or.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child:
                    const Icon(Icons.article_outlined, color: AppColors.or),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(article.title,
                        style: Theme.of(context).textTheme.titleMedium,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis),
                    if (article.category.isNotEmpty) ...[
                      const SizedBox(height: 4),
                      Text(article.category,
                          style: TextStyle(
                              fontSize: 11,
                              color: AppColors.gris,
                              fontWeight: FontWeight.w600)),
                    ],
                    if (article.summary.isNotEmpty) ...[
                      const SizedBox(height: 6),
                      Text(article.summary,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: Theme.of(context).textTheme.bodySmall),
                    ],
                  ],
                ),
              ),
              const Icon(Icons.chevron_right, color: AppColors.gris, size: 20),
            ],
          ),
        ),
      ),
    );
  }
}
