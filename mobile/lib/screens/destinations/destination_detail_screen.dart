import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../core/constants/app_colors.dart';
import '../../models/place.dart';
import '../../providers/destination_provider.dart';
import '../../widgets/common/shimmer_placeholder.dart';
import '../../widgets/common/error_display.dart';
import '../../widgets/common/star_rating.dart';

class DestinationDetailScreen extends ConsumerWidget {
  final String slug;
  const DestinationDetailScreen({super.key, required this.slug});

  static const _typeLabels = {
    'site': 'Site touristique',
    'hotel': 'Hébergement',
    'nature': 'Nature & Réserve',
    'culture': 'Culture & Arts',
  };

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final detailAsync = ref.watch(destinationDetailProvider(slug));

    return detailAsync.when(
      loading: () => Scaffold(
        appBar: AppBar(),
        body: const SingleChildScrollView(
          padding: EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ShimmerPlaceholder(height: 220, borderRadius: 12),
              SizedBox(height: 16),
              ShimmerPlaceholder(height: 28, width: 250),
              SizedBox(height: 12),
              ShimmerPlaceholder(height: 16, width: 150),
              SizedBox(height: 24),
              ShimmerPlaceholder(height: 14),
              SizedBox(height: 8),
              ShimmerPlaceholder(height: 14),
              SizedBox(height: 8),
              ShimmerPlaceholder(height: 14, width: 200),
            ],
          ),
        ),
      ),
      error: (e, _) => Scaffold(
        appBar: AppBar(),
        body: ErrorDisplay(
          message: 'Impossible de charger cette destination',
          onRetry: () => ref.invalidate(destinationDetailProvider(slug)),
        ),
      ),
      data: (raw) {
        final place = Place.fromJson(raw);
        final color = AppColors.pinColor(place.type);

        return Scaffold(
          body: CustomScrollView(
            slivers: [
              // Hero image
              SliverAppBar(
                expandedHeight: 280,
                pinned: true,
                flexibleSpace: FlexibleSpaceBar(
                  background: place.imageUrl.isNotEmpty
                      ? CachedNetworkImage(
                          imageUrl: place.imageUrl,
                          fit: BoxFit.cover,
                          color: Colors.black26,
                          colorBlendMode: BlendMode.darken,
                        )
                      : Container(
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                              colors: [
                                color.withValues(alpha: 0.3),
                                AppColors.nuit,
                              ],
                            ),
                          ),
                        ),
                ),
              ),

              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Type badge
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: color.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(100),
                        ),
                        child: Text(
                          _typeLabels[place.type] ?? place.type,
                          style: TextStyle(
                              color: color,
                              fontSize: 12,
                              fontWeight: FontWeight.w600),
                        ),
                      ),
                      const SizedBox(height: 12),

                      // Name
                      Text(place.name,
                          style: Theme.of(context).textTheme.displayMedium),
                      const SizedBox(height: 8),

                      // Region
                      if (place.region != null)
                        Row(
                          children: [
                            const Icon(Icons.location_on_outlined,
                                size: 16, color: AppColors.gris),
                            const SizedBox(width: 4),
                            Text(place.region!.name,
                                style: Theme.of(context).textTheme.bodySmall),
                          ],
                        ),

                      // Rating
                      if (place.rating > 0) ...[
                        const SizedBox(height: 16),
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: AppColors.sable,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Row(
                            children: [
                              Text(place.rating.toStringAsFixed(1),
                                  style: Theme.of(context)
                                      .textTheme
                                      .headlineLarge
                                      ?.copyWith(color: AppColors.or)),
                              const SizedBox(width: 12),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  StarRating(rating: place.rating, size: 16),
                                  const SizedBox(height: 2),
                                  Text('${place.reviewCount} avis',
                                      style: Theme.of(context)
                                          .textTheme
                                          .bodySmall),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],

                      // Description
                      const SizedBox(height: 20),
                      Text('À propos',
                          style: Theme.of(context).textTheme.headlineMedium),
                      const SizedBox(height: 8),
                      Text(place.description,
                          style: Theme.of(context).textTheme.bodyLarge),

                      // Tags
                      if (place.tags.isNotEmpty) ...[
                        const SizedBox(height: 16),
                        Wrap(
                          spacing: 8,
                          runSpacing: 6,
                          children: place.tags
                              .map((tag) => Chip(
                                    label: Text(tag,
                                        style: const TextStyle(fontSize: 12)),
                                    backgroundColor: AppColors.sable,
                                    side:
                                        const BorderSide(color: AppColors.sable2),
                                    padding: EdgeInsets.zero,
                                    materialTapTargetSize:
                                        MaterialTapTargetSize.shrinkWrap,
                                  ))
                              .toList(),
                        ),
                      ],

                      // Gallery
                      if (place.images.length > 1) ...[
                        const SizedBox(height: 24),
                        Text('Galerie',
                            style: Theme.of(context).textTheme.headlineMedium),
                        const SizedBox(height: 12),
                        SizedBox(
                          height: 120,
                          child: ListView.separated(
                            scrollDirection: Axis.horizontal,
                            itemCount: place.images.length - 1,
                            separatorBuilder: (_, __) =>
                                const SizedBox(width: 8),
                            itemBuilder: (_, i) {
                              final img = place.images[i + 1];
                              return ClipRRect(
                                borderRadius: BorderRadius.circular(8),
                                child: CachedNetworkImage(
                                  imageUrl: img.url,
                                  width: 160,
                                  fit: BoxFit.cover,
                                ),
                              );
                            },
                          ),
                        ),
                      ],

                      // Action buttons
                      const SizedBox(height: 24),
                      Row(
                        children: [
                          Expanded(
                            child: ElevatedButton.icon(
                              onPressed: () => context
                                  .go('/carte'),
                              icon: const Icon(Icons.map_outlined, size: 18),
                              label: const Text('Voir sur la carte'),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: OutlinedButton.icon(
                              onPressed: () =>
                                  context.go('/itineraires'),
                              icon: const Icon(Icons.route_outlined, size: 18),
                              label: const Text('Itinéraire'),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 32),
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
