import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/constants/app_colors.dart';
import '../../providers/atlas_provider.dart';

class AtlasScreen extends ConsumerStatefulWidget {
  const AtlasScreen({super.key});

  @override
  ConsumerState<AtlasScreen> createState() => _AtlasScreenState();
}

class _AtlasScreenState extends ConsumerState<AtlasScreen> {
  String _selectedEra = 'mossi';

  static const _eras = [
    {'era': 'mossi',        'year': '~1000', 'label': 'Mossi'},
    {'era': 'bobo',         'year': '~1400', 'label': 'Bobo'},
    {'era': 'colonial',     'year': '1896',  'label': 'Colonial'},
    {'era': 'independance', 'year': '1960',  'label': 'Indépendance'},
    {'era': 'sankara',      'year': '1984',  'label': 'Sankara'},
  ];

  @override
  Widget build(BuildContext context) {
    final eventsAsync = ref.watch(atlasEventsProvider);

    return Scaffold(
      backgroundColor: AppColors.nuit,
      appBar: AppBar(title: const Text('Atlas historique')),
      body: eventsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator(color: AppColors.or)),
        error: (e, _) => Center(child: Text('Erreur: $e', style: const TextStyle(color: AppColors.gris))),
        data: (events) {
          final activeEvent = events.firstWhere(
            (e) => e['era'] == _selectedEra,
            orElse: () => events.isNotEmpty ? events.first : <String, dynamic>{},
          );

          return Column(
            children: [
              // Timeline
              SizedBox(
                height: 80,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                  itemCount: _eras.length,
                  itemBuilder: (context, i) {
                    final era = _eras[i];
                    final isSelected = _selectedEra == era['era'];
                    return GestureDetector(
                      onTap: () => setState(() => _selectedEra = era['era']!),
                      child: Container(
                        margin: const EdgeInsets.only(right: 12),
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        decoration: BoxDecoration(
                          color: isSelected ? AppColors.or : Colors.white.withValues(alpha: 0.05),
                          borderRadius: BorderRadius.circular(100),
                          border: Border.all(
                            color: isSelected ? AppColors.or : Colors.white.withValues(alpha: 0.1),
                          ),
                        ),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              era['year']!,
                              style: TextStyle(
                                color: isSelected ? AppColors.nuit : AppColors.gris,
                                fontSize: 11,
                              ),
                            ),
                            Text(
                              era['label']!,
                              style: TextStyle(
                                color: isSelected ? AppColors.nuit : AppColors.sable2,
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),

              // Feature panel
              if (activeEvent.isNotEmpty)
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(20),
                    child: _EraPanel(event: activeEvent),
                  ),
                ),
            ],
          );
        },
      ),
    );
  }
}

class _EraPanel extends StatelessWidget {
  final Map<String, dynamic> event;
  const _EraPanel({required this.event});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [AppColors.terre, AppColors.nuit],
        ),
        borderRadius: BorderRadius.circular(12),
      ),
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(100),
            ),
            child: Text(
              event['year']?.toString() ?? '',
              style: const TextStyle(color: AppColors.or, fontSize: 12),
            ),
          ),
          const SizedBox(height: 16),
          Text(
            event['title'] ?? '',
            style: Theme.of(context).textTheme.headlineLarge?.copyWith(color: AppColors.blanc),
          ),
          const SizedBox(height: 8),
          Text(
            event['subtitle'] ?? '',
            style: const TextStyle(color: AppColors.orVif, fontWeight: FontWeight.w500),
          ),
          const SizedBox(height: 16),
          Text(
            event['description'] ?? '',
            style: const TextStyle(color: AppColors.sable2, height: 1.7),
          ),
        ],
      ),
    );
  }
}
