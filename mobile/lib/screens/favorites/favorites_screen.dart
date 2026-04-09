import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/favorite_provider.dart';
import '../../core/constants/app_colors.dart';

class FavoritesScreen extends ConsumerStatefulWidget {
  const FavoritesScreen({super.key});

  @override
  ConsumerState<FavoritesScreen> createState() => _FavoritesScreenState();
}

class _FavoritesScreenState extends ConsumerState<FavoritesScreen> {
  @override
  void initState() {
    super.initState();
    ref.read(favoriteProvider.notifier).loadFavorites();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(favoriteProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Mes favoris')),
      body: state.isLoading
          ? const Center(
              child: CircularProgressIndicator(color: AppColors.rouge))
          : state.favorites.isEmpty
              ? Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.favorite_border,
                          size: 48, color: AppColors.gris),
                      const SizedBox(height: 12),
                      Text(
                        'Aucun favori pour le moment',
                        style: TextStyle(color: AppColors.gris),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Explorez les destinations et ajoutez vos coups de cœur !',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                            color: AppColors.gris, fontSize: 13),
                      ),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: () =>
                      ref.read(favoriteProvider.notifier).loadFavorites(),
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: state.favorites.length,
                    itemBuilder: (context, index) {
                      final fav = state.favorites[index];
                      return Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        child: ListTile(
                          leading: CircleAvatar(
                            backgroundColor: AppColors.sable,
                            child: Icon(
                              _iconForType(fav['targetType'] ?? ''),
                              color: AppColors.rouge,
                              size: 20,
                            ),
                          ),
                          title: Text(
                            fav['target']?['name'] ??
                                fav['target']?['title'] ??
                                'Favori',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          subtitle: Text(
                            _labelForType(fav['targetType'] ?? ''),
                            style: const TextStyle(fontSize: 12),
                          ),
                          trailing: IconButton(
                            icon: const Icon(Icons.favorite,
                                color: AppColors.rouge),
                            onPressed: () async {
                              await ref
                                  .read(favoriteProvider.notifier)
                                  .toggle(fav['targetId'], fav['targetType']);
                              ref
                                  .read(favoriteProvider.notifier)
                                  .loadFavorites();
                            },
                          ),
                        ),
                      );
                    },
                  ),
                ),
    );
  }

  IconData _iconForType(String type) {
    switch (type) {
      case 'place':
        return Icons.place;
      case 'establishment':
        return Icons.hotel;
      case 'itinerary':
        return Icons.explore;
      case 'wiki_article':
        return Icons.menu_book;
      default:
        return Icons.favorite;
    }
  }

  String _labelForType(String type) {
    switch (type) {
      case 'place':
        return 'Lieu';
      case 'establishment':
        return 'Hébergement';
      case 'itinerary':
        return 'Itinéraire';
      case 'wiki_article':
        return 'Article Wiki';
      default:
        return 'Favori';
    }
  }
}
