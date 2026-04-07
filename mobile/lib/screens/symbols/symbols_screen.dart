import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../core/constants/app_colors.dart';
import '../../models/symbol.dart';
import '../../providers/symbol_provider.dart';
import '../../widgets/common/shimmer_placeholder.dart';
import '../../widgets/common/error_display.dart';

class SymbolsScreen extends ConsumerWidget {
  const SymbolsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final symbolsAsync = ref.watch(symbolsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Symboles culturels')),
      body: symbolsAsync.when(
        loading: () => const ListShimmer(count: 4),
        error: (e, _) => ErrorDisplay(
          message: 'Erreur de chargement',
          onRetry: () => ref.invalidate(symbolsProvider),
        ),
        data: (raw) {
          final items = raw
              .map((e) => Symbol.fromJson(e as Map<String, dynamic>))
              .toList();
          if (items.isEmpty) {
            return const Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.auto_awesome_outlined,
                      size: 56, color: AppColors.sable2),
                  SizedBox(height: 12),
                  Text('Aucun symbole trouvé'),
                ],
              ),
            );
          }
          return GridView.builder(
            padding: const EdgeInsets.all(16),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              mainAxisSpacing: 12,
              crossAxisSpacing: 12,
              childAspectRatio: 0.75,
            ),
            itemCount: items.length,
            itemBuilder: (_, i) => _SymbolCard(symbol: items[i]),
          );
        },
      ),
    );
  }
}

class _SymbolCard extends StatelessWidget {
  final Symbol symbol;
  const _SymbolCard({required this.symbol});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => _showDetail(context),
      child: Card(
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Expanded(
              child: symbol.imageUrl.isNotEmpty
                  ? CachedNetworkImage(
                      imageUrl: symbol.imageUrl,
                      fit: BoxFit.cover,
                      placeholder: (_, __) =>
                          Container(color: AppColors.sable),
                      errorWidget: (_, __, ___) => Container(
                        color: AppColors.sable,
                        child: const Icon(Icons.auto_awesome,
                            color: AppColors.or, size: 32),
                      ),
                    )
                  : Container(
                      color: AppColors.sable,
                      child: const Icon(Icons.auto_awesome,
                          color: AppColors.or, size: 32),
                    ),
            ),
            Padding(
              padding: const EdgeInsets.all(10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(symbol.name,
                      style: Theme.of(context).textTheme.titleMedium,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis),
                  if (symbol.category.isNotEmpty) ...[
                    const SizedBox(height: 3),
                    Text(symbol.category,
                        style: const TextStyle(
                            fontSize: 11, color: AppColors.gris)),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showDetail(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => DraggableScrollableSheet(
        expand: false,
        initialChildSize: 0.5,
        minChildSize: 0.3,
        maxChildSize: 0.85,
        builder: (_, ctrl) => ListView(
          controller: ctrl,
          padding: const EdgeInsets.all(20),
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: AppColors.sable2,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            if (symbol.imageUrl.isNotEmpty)
              ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: CachedNetworkImage(
                  imageUrl: symbol.imageUrl,
                  height: 180,
                  fit: BoxFit.cover,
                ),
              ),
            const SizedBox(height: 16),
            Text(symbol.name,
                style: Theme.of(context).textTheme.displayMedium),
            if (symbol.origin.isNotEmpty) ...[
              const SizedBox(height: 6),
              Text('Origine : ${symbol.origin}',
                  style: const TextStyle(
                      fontSize: 13,
                      color: AppColors.gris,
                      fontStyle: FontStyle.italic)),
            ],
            if (symbol.category.isNotEmpty) ...[
              const SizedBox(height: 8),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.or.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(100),
                ),
                child: Text(symbol.category,
                    style: const TextStyle(
                        color: AppColors.or,
                        fontSize: 12,
                        fontWeight: FontWeight.w600)),
              ),
            ],
            const SizedBox(height: 16),
            if (symbol.meaning.isNotEmpty)
              Text(symbol.meaning,
                  style: Theme.of(context).textTheme.bodyLarge),
          ],
        ),
      ),
    );
  }
}
