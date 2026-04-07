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

class DestinationsScreen extends ConsumerWidget {
  const DestinationsScreen({super.key});

  static const _typeFilters = [
    {'type': '', 'label': 'Tous'},
    {'type': 'site', 'label': 'Sites'},
    {'type': 'hotel', 'label': 'Hébergement'},
    {'type': 'nature', 'label': 'Nature'},
    {'type': 'culture', 'label': 'Culture'},
  ];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final filters = ref.watch(destinationFiltersProvider);
    final dataAsync = ref.watch(destinationsProvider(filters));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Destinations'),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(48),
          child: Container(
            color: AppColors.nuit,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: _typeFilters.map((opt) {
                  final isActive = filters.type == opt['type'];
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: FilterChip(
                      label: Text(opt['label']!),
                      selected: isActive,
                      onSelected: (_) => ref
                          .read(destinationFiltersProvider.notifier)
                          .setType(opt['type']!),
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
      body: dataAsync.when(
        loading: () => const ListShimmer(count: 4),
        error: (e, _) => ErrorDisplay(
          message: 'Erreur de chargement',
          onRetry: () => ref.invalidate(destinationsProvider(filters)),
        ),
        data: (raw) {
          final items = (raw['data'] as List<dynamic>?)
                  ?.map((e) => Place.fromJson(e as Map<String, dynamic>))
                  .toList() ??
              [];
          if (items.isEmpty) {
            return const Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.place_outlined, size: 56, color: AppColors.sable2),
                  SizedBox(height: 12),
                  Text('Aucune destination trouvée'),
                ],
              ),
            );
          }
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: items.length + 1,
            itemBuilder: (context, index) {
              if (index == items.length) {
                return Padding(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      if (filters.page > 1)
                        TextButton.icon(
                          onPressed: () => ref
                              .read(destinationFiltersProvider.notifier)
                              .prevPage(),
                          icon: const Icon(Icons.arrow_back, size: 16),
                          label: const Text('Précédent'),
                        ),
                      const SizedBox(width: 12),
                      Text('Page ${filters.page}',
                          style: Theme.of(context).textTheme.bodySmall),
                      const SizedBox(width: 12),
                      TextButton.icon(
                        onPressed: () => ref
                            .read(destinationFiltersProvider.notifier)
                            .nextPage(),
                        icon: const Icon(Icons.arrow_forward, size: 16),
                        label: const Text('Suivant'),
                      ),
                    ],
                  ),
                );
              }
              final place = items[index];
              return _DestinationCard(place: place);
            },
          );
        },
      ),
    );
  }
}

class _DestinationCard extends StatelessWidget {
  final Place place;
  const _DestinationCard({required this.place});

  static const _typeLabels = {
    'site': 'Site touristique',
    'hotel': 'Hébergement',
    'nature': 'Nature & Réserve',
    'culture': 'Culture & Arts',
  };

  @override
  Widget build(BuildContext context) {
    final color = AppColors.pinColor(place.type);
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: GestureDetector(
        onTap: () => context.go('/destinations/${place.slug}'),
        child: Card(
          clipBehavior: Clip.antiAlias,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Image
              SizedBox(
                height: 160,
                width: double.infinity,
                child: place.imageUrl.isNotEmpty
                    ? CachedNetworkImage(
                        imageUrl: place.imageUrl,
                        fit: BoxFit.cover,
                        placeholder: (_, __) =>
                            Container(color: AppColors.sable),
                        errorWidget: (_, __, ___) => Container(
                          color: AppColors.sable,
                          child: const Icon(Icons.image_not_supported_outlined,
                              color: AppColors.gris),
                        ),
                      )
                    : Container(
                        color: AppColors.sable,
                        child: const Icon(Icons.landscape,
                            size: 40, color: AppColors.gris),
                      ),
              ),
              Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: color.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(100),
                          ),
                          child: Text(
                            _typeLabels[place.type] ?? place.type,
                            style: TextStyle(
                                color: color,
                                fontSize: 11,
                                fontWeight: FontWeight.w600),
                          ),
                        ),
                        const Spacer(),
                        if (place.rating > 0)
                          StarRating(
                              rating: place.rating,
                              size: 14,
                              reviewCount: place.reviewCount),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(place.name,
                        style: Theme.of(context).textTheme.titleMedium,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis),
                    if (place.region != null) ...[
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          const Icon(Icons.location_on_outlined,
                              size: 14, color: AppColors.gris),
                          const SizedBox(width: 4),
                          Text(place.region!.name,
                              style: Theme.of(context).textTheme.bodySmall),
                        ],
                      ),
                    ],
                    if (place.description.isNotEmpty) ...[
                      const SizedBox(height: 6),
                      Text(place.description,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: Theme.of(context).textTheme.bodySmall),
                    ],
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
