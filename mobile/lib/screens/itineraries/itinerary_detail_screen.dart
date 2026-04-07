import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/constants/app_colors.dart';
import '../../models/itinerary.dart';
import '../../providers/itinerary_provider.dart';
import '../../widgets/common/shimmer_placeholder.dart';
import '../../widgets/common/error_display.dart';

class ItineraryDetailScreen extends ConsumerWidget {
  final int id;
  const ItineraryDetailScreen({super.key, required this.id});

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
  Widget build(BuildContext context, WidgetRef ref) {
    final detailAsync = ref.watch(itineraryDetailProvider(id));

    return detailAsync.when(
      loading: () => Scaffold(
        appBar: AppBar(title: const Text('Itinéraire')),
        body: const Padding(
          padding: EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ShimmerPlaceholder(height: 28, width: 250),
              SizedBox(height: 16),
              ShimmerPlaceholder(height: 14),
              SizedBox(height: 8),
              ShimmerPlaceholder(height: 14, width: 200),
              SizedBox(height: 24),
              ShimmerPlaceholder(height: 80),
              SizedBox(height: 12),
              ShimmerPlaceholder(height: 80),
            ],
          ),
        ),
      ),
      error: (e, _) => Scaffold(
        appBar: AppBar(),
        body: ErrorDisplay(
          message: 'Impossible de charger cet itinéraire',
          onRetry: () => ref.invalidate(itineraryDetailProvider(id)),
        ),
      ),
      data: (raw) {
        final itin = Itinerary.fromJson(raw);
        final diffColor = _difficultyColor(itin.difficulty);

        return Scaffold(
          appBar: AppBar(title: Text(itin.title)),
          body: SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Title
                Text(itin.title,
                    style: Theme.of(context).textTheme.displayMedium),
                const SizedBox(height: 12),

                // Info row
                Wrap(
                  spacing: 12,
                  runSpacing: 8,
                  children: [
                    _InfoBadge(
                        icon: Icons.calendar_today_outlined,
                        label: '${itin.durationDays} jours'),
                    _InfoBadge(
                        icon: Icons.trending_up,
                        label: itin.difficulty,
                        color: diffColor),
                    if (itin.budgetFcfa > 0)
                      _InfoBadge(
                          icon: Icons.payments_outlined,
                          label: '${itin.budgetFcfa} FCFA'),
                    _InfoBadge(
                        icon: Icons.pin_drop_outlined,
                        label: '${itin.stops.length} étapes'),
                  ],
                ),

                // Description
                if (itin.description.isNotEmpty) ...[
                  const SizedBox(height: 20),
                  Text(itin.description,
                      style: Theme.of(context).textTheme.bodyLarge),
                ],

                const SizedBox(height: 24),
                Text('Étapes',
                    style: Theme.of(context).textTheme.headlineMedium),
                const SizedBox(height: 12),

                // Timeline
                if (itin.stops.isEmpty)
                  const Center(
                    child: Padding(
                      padding: EdgeInsets.all(24),
                      child: Text('Aucune étape définie',
                          style: TextStyle(color: AppColors.gris)),
                    ),
                  )
                else
                  ...itin.stops.asMap().entries.map((entry) {
                    final idx = entry.key;
                    final stop = entry.value;
                    final isLast = idx == itin.stops.length - 1;

                    return IntrinsicHeight(
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Timeline line
                          SizedBox(
                            width: 32,
                            child: Column(
                              children: [
                                Container(
                                  width: 24,
                                  height: 24,
                                  decoration: BoxDecoration(
                                    color: AppColors.rouge,
                                    shape: BoxShape.circle,
                                  ),
                                  child: Center(
                                    child: Text('${idx + 1}',
                                        style: const TextStyle(
                                            color: Colors.white,
                                            fontSize: 11,
                                            fontWeight: FontWeight.bold)),
                                  ),
                                ),
                                if (!isLast)
                                  Expanded(
                                    child: Container(
                                        width: 2, color: AppColors.sable2),
                                  ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 12),
                          // Stop card
                          Expanded(
                            child: Container(
                              margin: const EdgeInsets.only(bottom: 16),
                              padding: const EdgeInsets.all(14),
                              decoration: BoxDecoration(
                                color: AppColors.sable,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: AppColors.sable2),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    stop.place?.name ?? 'Étape ${idx + 1}',
                                    style:
                                        Theme.of(context).textTheme.titleMedium,
                                  ),
                                  const SizedBox(height: 6),
                                  Row(
                                    children: [
                                      if (stop.dayNumber > 0) ...[
                                        const Icon(
                                            Icons.calendar_today_outlined,
                                            size: 13,
                                            color: AppColors.gris),
                                        const SizedBox(width: 4),
                                        Text('Jour ${stop.dayNumber}',
                                            style: const TextStyle(
                                                fontSize: 12,
                                                color: AppColors.gris)),
                                        const SizedBox(width: 12),
                                      ],
                                      if (stop.duration.isNotEmpty) ...[
                                        const Icon(Icons.schedule,
                                            size: 13, color: AppColors.gris),
                                        const SizedBox(width: 4),
                                        Text(stop.duration,
                                            style: const TextStyle(
                                                fontSize: 12,
                                                color: AppColors.gris)),
                                      ],
                                    ],
                                  ),
                                  if (stop.notes.isNotEmpty) ...[
                                    const SizedBox(height: 6),
                                    Text(stop.notes,
                                        style: Theme.of(context)
                                            .textTheme
                                            .bodySmall),
                                  ],
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    );
                  }),
                const SizedBox(height: 16),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _InfoBadge extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color? color;
  const _InfoBadge({required this.icon, required this.label, this.color});

  @override
  Widget build(BuildContext context) {
    final c = color ?? AppColors.gris;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: c.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(100),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: c),
          const SizedBox(width: 4),
          Text(label,
              style: TextStyle(
                  color: c, fontSize: 12, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}
