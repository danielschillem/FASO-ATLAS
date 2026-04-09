import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/search_provider.dart';
import '../../core/constants/app_colors.dart';

class SearchScreen extends ConsumerStatefulWidget {
  const SearchScreen({super.key});

  @override
  ConsumerState<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends ConsumerState<SearchScreen> {
  final _controller = TextEditingController();
  final _categories = [
    {'value': '', 'label': 'Tout'},
    {'value': 'place', 'label': 'Lieux'},
    {'value': 'establishment', 'label': 'Séjours'},
    {'value': 'wiki', 'label': 'Wiki'},
    {'value': 'itinerary', 'label': 'Itinéraires'},
  ];

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(searchProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Recherche'),
      ),
      body: Column(
        children: [
          // Search bar
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _controller,
              onChanged: (q) => ref.read(searchProvider.notifier).search(q),
              decoration: InputDecoration(
                hintText: 'Rechercher un lieu, article, itinéraire…',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _controller.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.close),
                        onPressed: () {
                          _controller.clear();
                          ref.read(searchProvider.notifier).clear();
                        },
                      )
                    : null,
              ),
            ),
          ),

          // Category chips
          SizedBox(
            height: 40,
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              scrollDirection: Axis.horizontal,
              itemCount: _categories.length,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (_, i) {
                final cat = _categories[i];
                final active = state.category == cat['value'];
                return ChoiceChip(
                  label: Text(cat['label']!),
                  selected: active,
                  onSelected: (_) => ref
                      .read(searchProvider.notifier)
                      .setCategory(cat['value']!),
                  selectedColor: AppColors.rouge,
                  labelStyle: TextStyle(
                    color: active ? Colors.white : AppColors.nuit,
                    fontSize: 13,
                  ),
                );
              },
            ),
          ),

          const SizedBox(height: 8),

          // Results
          Expanded(
            child: state.isLoading
                ? const Center(
                    child: CircularProgressIndicator(color: AppColors.rouge))
                : state.results == null
                    ? Center(
                        child: Text(
                          state.query.length < 2
                              ? 'Tapez au moins 2 caractères'
                              : 'Aucun résultat',
                          style: TextStyle(color: AppColors.gris),
                        ),
                      )
                    : state.totalCount == 0
                        ? Center(
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.search_off,
                                    size: 48, color: AppColors.gris),
                                const SizedBox(height: 12),
                                Text('Aucun résultat pour « ${state.query} »',
                                    style: TextStyle(color: AppColors.gris)),
                              ],
                            ),
                          )
                        : ListView(
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            children: [
                              _buildSection(
                                'Lieux',
                                Icons.place,
                                AppColors.rouge,
                                state.results!['places'] as List? ?? [],
                                (item) => ListTile(
                                  title: Text(item['name'] ?? ''),
                                  subtitle: Text(
                                    item['region']?['name'] ?? '',
                                    style: const TextStyle(fontSize: 12),
                                  ),
                                  trailing: const Icon(
                                      Icons.chevron_right, size: 20),
                                  onTap: () => context
                                      .go('/destinations/${item['slug']}'),
                                ),
                              ),
                              _buildSection(
                                'Hébergements',
                                Icons.hotel,
                                AppColors.vert,
                                state.results!['establishments'] as List? ?? [],
                                (item) => ListTile(
                                  title:
                                      Text(item['place']?['name'] ?? item['name'] ?? ''),
                                  subtitle: Text(
                                    '${item['type'] ?? ''} · ${item['priceMinFcfa'] ?? ''} FCFA',
                                    style: const TextStyle(fontSize: 12),
                                  ),
                                  onTap: () => context.go('/reservation'),
                                ),
                              ),
                              _buildSection(
                                'Wiki',
                                Icons.menu_book,
                                AppColors.or,
                                state.results!['wiki'] as List? ?? [],
                                (item) => ListTile(
                                  title: Text(item['title'] ?? ''),
                                  subtitle: Text(
                                    item['category'] ?? '',
                                    style: const TextStyle(fontSize: 12),
                                  ),
                                  trailing: const Icon(
                                      Icons.chevron_right, size: 20),
                                  onTap: () =>
                                      context.go('/wiki/${item['slug']}'),
                                ),
                              ),
                              _buildSection(
                                'Itinéraires',
                                Icons.explore,
                                AppColors.terre,
                                state.results!['itineraries'] as List? ?? [],
                                (item) => ListTile(
                                  title: Text(item['title'] ?? ''),
                                  subtitle: Text(
                                    '${item['durationDays'] ?? ''} jours · ${item['difficulty'] ?? ''}',
                                    style: const TextStyle(fontSize: 12),
                                  ),
                                  trailing: const Icon(
                                      Icons.chevron_right, size: 20),
                                  onTap: () =>
                                      context.go('/itineraires/${item['id']}'),
                                ),
                              ),
                            ],
                          ),
          ),
        ],
      ),
    );
  }

  Widget _buildSection(
    String title,
    IconData icon,
    Color color,
    List items,
    Widget Function(dynamic) itemBuilder,
  ) {
    if (items.isEmpty) return const SizedBox.shrink();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(top: 12, bottom: 4),
          child: Row(
            children: [
              Icon(icon, size: 18, color: color),
              const SizedBox(width: 8),
              Text('$title (${items.length})',
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    color: AppColors.nuit,
                  )),
            ],
          ),
        ),
        ...items.map(itemBuilder),
        const Divider(),
      ],
    );
  }
}
