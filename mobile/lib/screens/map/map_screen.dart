import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:latlong2/latlong.dart';
import '../../core/constants/app_colors.dart';
import '../../providers/map_provider.dart';

class MapScreen extends ConsumerStatefulWidget {
  const MapScreen({super.key});

  @override
  ConsumerState<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends ConsumerState<MapScreen> {
  String _activeFilter = 'all';
  Map<String, dynamic>? _selectedPlace;

  static const _filterOptions = [
    {'type': 'all',     'label': 'Tous'},
    {'type': 'site',    'label': 'Sites'},
    {'type': 'hotel',   'label': 'Hôtels'},
    {'type': 'nature',  'label': 'Nature'},
    {'type': 'culture', 'label': 'Culture'},
  ];

  @override
  Widget build(BuildContext context) {
    final placesAsync = ref.watch(mapPlacesProvider(_activeFilter));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Carte interactive'),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(48),
          child: Container(
            color: AppColors.nuit,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: _filterOptions.map((opt) {
                  final isActive = _activeFilter == opt['type'];
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: FilterChip(
                      label: Text(opt['label']!),
                      selected: isActive,
                      onSelected: (_) => setState(() => _activeFilter = opt['type']!),
                      backgroundColor: AppColors.nuit,
                      selectedColor: AppColors.rouge.withOpacity(0.2),
                      checkmarkColor: AppColors.orVif,
                      labelStyle: TextStyle(
                        color: isActive ? AppColors.orVif : AppColors.gris,
                        fontSize: 12,
                        fontWeight: isActive ? FontWeight.w600 : FontWeight.normal,
                      ),
                      side: BorderSide(
                        color: isActive ? AppColors.orVif : AppColors.gris.withOpacity(0.3),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
          ),
        ),
      ),
      body: Stack(
        children: [
          // Map
          FlutterMap(
            options: MapOptions(
              initialCenter: const LatLng(12.3647, -1.5334), // Ouagadougou
              initialZoom: 7,
              onTap: (_, __) => setState(() => _selectedPlace = null),
            ),
            children: [
              TileLayer(
                urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                userAgentPackageName: 'bf.fasoatlas.app',
              ),
              placesAsync.when(
                data: (geojson) => MarkerLayer(
                  markers: (geojson['features'] as List<dynamic>).map((feature) {
                    final coords = feature['geometry']['coordinates'] as List;
                    final props = feature['properties'] as Map<String, dynamic>;
                    final type = props['type'] as String;

                    return Marker(
                      point: LatLng(coords[1] as double, coords[0] as double),
                      width: 36,
                      height: 36,
                      child: GestureDetector(
                        onTap: () => setState(() => _selectedPlace = props),
                        child: _MapPin(type: type),
                      ),
                    );
                  }).toList(),
                ),
                loading: () => const MarkerLayer(markers: []),
                error: (_, __) => const MarkerLayer(markers: []),
              ),
            ],
          ),

          // Loading indicator
          if (placesAsync.isLoading)
            const Center(child: CircularProgressIndicator(color: AppColors.rouge)),

          // Selected place card
          if (_selectedPlace != null)
            Positioned(
              left: 12, right: 12, bottom: 16,
              child: _PlaceCard(
                place: _selectedPlace!,
                onClose: () => setState(() => _selectedPlace = null),
              ),
            ),
        ],
      ),
    );
  }
}

class _MapPin extends StatelessWidget {
  final String type;
  const _MapPin({required this.type});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 32,
      height: 32,
      decoration: BoxDecoration(
        color: AppColors.pinColor(type),
        shape: BoxShape.circle,
        border: Border.all(color: Colors.white, width: 2.5),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.25),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Icon(
        _iconForType(type),
        color: Colors.white,
        size: 14,
      ),
    );
  }

  IconData _iconForType(String type) {
    switch (type) {
      case 'site':    return Icons.star_rounded;
      case 'hotel':   return Icons.hotel;
      case 'nature':  return Icons.nature;
      case 'culture': return Icons.theater_comedy;
      default:        return Icons.place;
    }
  }
}

class _PlaceCard extends StatelessWidget {
  final Map<String, dynamic> place;
  final VoidCallback onClose;
  const _PlaceCard({required this.place, required this.onClose});

  @override
  Widget build(BuildContext context) {
    final type = place['type'] as String? ?? 'site';
    final color = AppColors.pinColor(type);

    return Card(
      elevation: 8,
      shadowColor: Colors.black26,
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              children: [
                Container(
                  width: 10,
                  height: 10,
                  decoration: BoxDecoration(color: color, shape: BoxShape.circle),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    place['name'] ?? '',
                    style: Theme.of(context).textTheme.titleMedium,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                IconButton(
                  onPressed: onClose,
                  icon: const Icon(Icons.close, size: 18),
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              place['region'] ?? '',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.gris),
            ),
            const SizedBox(height: 8),
            Text(
              place['description'] ?? '',
              style: Theme.of(context).textTheme.bodySmall,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            if ((place['rating'] ?? 0) > 0) ...[
              const SizedBox(height: 8),
              Row(
                children: [
                  const Icon(Icons.star_rounded, color: AppColors.orVif, size: 16),
                  const SizedBox(width: 4),
                  Text(
                    '${(place['rating'] as num).toStringAsFixed(1)}',
                    style: const TextStyle(color: AppColors.or, fontWeight: FontWeight.w600, fontSize: 13),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    '(${place['reviewCount']} avis)',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }
}
