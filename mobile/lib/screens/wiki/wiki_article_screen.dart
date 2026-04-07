import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_html/flutter_html.dart';
import '../../core/constants/app_colors.dart';
import '../../models/wiki_article.dart';
import '../../providers/wiki_provider.dart';
import '../../widgets/common/shimmer_placeholder.dart';
import '../../widgets/common/error_display.dart';

class WikiArticleScreen extends ConsumerWidget {
  final String slug;
  const WikiArticleScreen({super.key, required this.slug});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final articleAsync = ref.watch(wikiArticleProvider(slug));

    return articleAsync.when(
      loading: () => Scaffold(
        appBar: AppBar(title: const Text('Article')),
        body: const Padding(
          padding: EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ShimmerPlaceholder(height: 32, width: 250),
              SizedBox(height: 16),
              ShimmerPlaceholder(height: 14),
              SizedBox(height: 8),
              ShimmerPlaceholder(height: 14),
              SizedBox(height: 8),
              ShimmerPlaceholder(height: 14, width: 200),
              SizedBox(height: 16),
              ShimmerPlaceholder(height: 14),
              SizedBox(height: 8),
              ShimmerPlaceholder(height: 14),
            ],
          ),
        ),
      ),
      error: (e, _) => Scaffold(
        appBar: AppBar(),
        body: ErrorDisplay(
          message: 'Impossible de charger cet article',
          onRetry: () => ref.invalidate(wikiArticleProvider(slug)),
        ),
      ),
      data: (raw) {
        final article = WikiArticle.fromJson(raw);
        return Scaffold(
          appBar: AppBar(title: Text(article.title)),
          body: SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Title
                Text(article.title,
                    style: Theme.of(context).textTheme.displayMedium),
                const SizedBox(height: 8),

                // Category badge
                if (article.category.isNotEmpty)
                  Container(
                    margin: const EdgeInsets.only(bottom: 16),
                    padding:
                        const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.or.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(100),
                    ),
                    child: Text(article.category,
                        style: const TextStyle(
                            color: AppColors.or,
                            fontSize: 12,
                            fontWeight: FontWeight.w600)),
                  ),

                const Divider(),
                const SizedBox(height: 8),

                // HTML body
                if (article.bodyHtml.isNotEmpty)
                  Html(
                    data: article.bodyHtml,
                    style: {
                      'body': Style(
                        fontSize: FontSize(15),
                        lineHeight: const LineHeight(1.7),
                        color: AppColors.nuit,
                        margin: Margins.zero,
                        padding: HtmlPaddings.zero,
                      ),
                      'h2': Style(
                        fontSize: FontSize(20),
                        fontWeight: FontWeight.w600,
                        color: AppColors.nuit,
                        margin: Margins.only(top: 20, bottom: 8),
                      ),
                      'h3': Style(
                        fontSize: FontSize(17),
                        fontWeight: FontWeight.w600,
                        margin: Margins.only(top: 16, bottom: 6),
                      ),
                      'a': Style(color: AppColors.rouge),
                      'blockquote': Style(
                        color: AppColors.gris,
                        fontStyle: FontStyle.italic,
                        border: const Border(
                            left: BorderSide(color: AppColors.or, width: 3)),
                        padding: HtmlPaddings.only(left: 12),
                        margin: Margins.symmetric(vertical: 12),
                      ),
                    },
                  )
                else if (article.summary.isNotEmpty)
                  Text(article.summary,
                      style: Theme.of(context).textTheme.bodyLarge),

                const SizedBox(height: 32),

                // Last updated
                if (article.updatedAt.isNotEmpty)
                  Text(
                    'Dernière mise à jour : ${article.updatedAt.split('T').first}',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
              ],
            ),
          ),
        );
      },
    );
  }
}
