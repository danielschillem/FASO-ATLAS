import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants/app_colors.dart';
import '../../models/itinerary.dart';
import '../../providers/itinerary_provider.dart';
import '../../widgets/common/shimmer_placeholder.dart';
import '../../widgets/common/error_display.dart';

class ItinerariesScreen extends ConsumerStatefulWidget {
  const ItinerariesScreen({super.key});
  @override
  ConsumerState<ItinerariesScreen> createState() => _ItinerariesScreenState();
}

class _ItinerariesScreenState extends ConsumerState<ItinerariesScreen> {
  String _difficulty = '';

  static const _difficultyFilters = ['', 'facile', 'modéré', 'difficile'];
  static const _difficultyLabels = ['Tous', 'Facile', 'Modéré', 'Difficile'];

  @override
  Widget build(BuildContext context) {
    final params = <String, dynamic>{};
    if (_difficulty.isNotEmpty) params['difficulty'] = _difficulty;

    final dataAsync = ref.watch(itinerariesProvider(params));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Itinéraires'),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(48),
          child: Container(
            color: AppColors.nuit,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: List.generate(_difficultyFilters.length, (i) {
                  final isActive = _difficulty == _difficultyFilters[i];
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: FilterChip(
                      label: Text(_difficultyLabels[i]),
                      selected: isActive,
                      onSelected: (_) =>
                          setState(() => _difficulty = _difficultyFilters[i]),
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
                }),
              ),
            ),
          ),
        ),
      ),
      body: dataAsync.when(
        loading: () => const ListShimmer(count: 4),
        error: (e, _) => ErrorDisplay(
          message: 'Erreur de chargement',
          onRetry: () => ref.invalidate(itinerariesProvider(params)),
        ),
        data: (raw) {
          final items = (raw['data'] as List<dynamic>?)
                  ?.map((e) => Itinerary.fromJson(e as Map<String, dynamic>))
                  .toList() ??
              [];
          if (items.isEmpty) {
            return const Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.route_outlined, size: 56, color: AppColors.sable2),
                  SizedBox(height: 12),
                  Text('Aucun itinéraire trouvé'),
                ],
              ),
            );
          }
          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: items.length,
            separatorBuilder: (_, __) => const SizedBox(height: 10),
            itemBuilder: (_, i) => _ItineraryCard(itinerary: items[i]),
          );
        },
      ),
    );
  }
}

class _ItineraryCard extends StatelessWidget {
  final Itinerary itinerary;
  const _ItineraryCard({required this.itinerary});

  Color _difficultyColor(String d) {
    switch (d) {
      case 'facile':
        return AppColors.vert;
      case 'modéré':
        return AppColors.or;
      case 'difficile':
        return AppColors.rouge;
      default:
        return AppColors.gris;
    }
  }

  @override
  Widget build(BuildContext context) {
    final diffColor = _difficultyColor(itinerary.difficulty);
    return GestureDetector(
      onTap: () => context.go('/itineraires/${itinerary.id}'),
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(itinerary.title,
                        style: Theme.of(context).textTheme.titleMedium,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis),
                  ),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: diffColor.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(100),
                    ),
                    child: Text(itinerary.difficulty,
                        style: TextStyle(
                            color: diffColor,
                            fontSize: 11,
                            fontWeight: FontWeight.w600)),
                  ),
                ],
              ),
              if (itinerary.description.isNotEmpty) ...[
                const SizedBox(height: 6),
                Text(itinerary.description,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context).textTheme.bodySmall),
              ],
              const SizedBox(height: 10),
              Row(
                children: [
                  _InfoChip(
                      icon: Icons.calendar_today_outlined,
                      label: '${itinerary.durationDays} jours'),
                  const SizedBox(width: 12),
                  _InfoChip(
                      icon: Icons.pin_drop_outlined,
                      label: '${itinerary.stops.length} étapes'),
                  if (itinerary.budgetFcfa > 0) ...[
                    const SizedBox(width: 12),
                    _InfoChip(
                        icon: Icons.payments_outlined,
                        label:
                            '${itinerary.budgetFcfa.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]} ')} FCFA'),
                  ],
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _InfoChip extends StatelessWidget {
  final IconData icon;
  final String label;
  const _InfoChip({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14, color: AppColors.gris),
        const SizedBox(width: 4),
        Text(label, style: const TextStyle(fontSize: 12, color: AppColors.gris)),
      ],
    );
  }
}
