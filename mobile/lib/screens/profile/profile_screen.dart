import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants/app_colors.dart';
import '../../providers/auth_provider.dart';
import '../../providers/reservation_provider.dart';
import '../../models/reservation.dart';
import '../../widgets/common/error_display.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authProvider);

    if (!auth.isAuthenticated) {
      return Scaffold(
        appBar: AppBar(title: const Text('Profil')),
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.person_outline,
                  size: 64, color: AppColors.sable2),
              const SizedBox(height: 16),
              Text('Non connecté',
                  style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 8),
              Text('Connectez-vous pour accéder à votre profil',
                  style: Theme.of(context).textTheme.bodySmall),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () => context.go('/login'),
                child: const Text('Se connecter'),
              ),
            ],
          ),
        ),
      );
    }

    final user = auth.user!;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Mon profil'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout, color: AppColors.rouge),
            onPressed: () async {
              await ref.read(authProvider.notifier).logout();
              if (context.mounted) context.go('/login');
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // User card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [AppColors.nuit, AppColors.brun],
                ),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 30,
                    backgroundColor: AppColors.rouge.withValues(alpha: 0.3),
                    child: Text(
                      user.firstName.isNotEmpty
                          ? user.firstName[0].toUpperCase()
                          : '?',
                      style: const TextStyle(
                          color: AppColors.blanc,
                          fontSize: 24,
                          fontWeight: FontWeight.bold),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '${user.firstName} ${user.lastName}'.trim(),
                          style: Theme.of(context)
                              .textTheme
                              .titleLarge
                              ?.copyWith(color: AppColors.blanc),
                        ),
                        const SizedBox(height: 4),
                        Text(user.email,
                            style: const TextStyle(
                                color: AppColors.gris, fontSize: 13)),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            Icon(
                              user.isVerified
                                  ? Icons.verified
                                  : Icons.pending_outlined,
                              size: 14,
                              color: user.isVerified
                                  ? AppColors.vert
                                  : AppColors.or,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              user.isVerified ? 'Vérifié' : 'Non vérifié',
                              style: TextStyle(
                                  color: user.isVerified
                                      ? AppColors.vert
                                      : AppColors.or,
                                  fontSize: 12),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Quick links
            Text('Activités',
                style: Theme.of(context).textTheme.headlineMedium),
            const SizedBox(height: 12),
            _QuickLink(
              icon: Icons.hotel_outlined,
              label: 'Mes réservations',
              onTap: () => context.go('/reservation'),
            ),
            _QuickLink(
              icon: Icons.route_outlined,
              label: 'Mes itinéraires',
              onTap: () => context.go('/itineraires'),
            ),
            _QuickLink(
              icon: Icons.map_outlined,
              label: 'Explorer la carte',
              onTap: () => context.go('/carte'),
            ),

            const SizedBox(height: 24),

            // Recent reservations
            Text('Dernières réservations',
                style: Theme.of(context).textTheme.headlineMedium),
            const SizedBox(height: 12),
            _RecentReservations(),
          ],
        ),
      ),
    );
  }
}

class _QuickLink extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  const _QuickLink(
      {required this.icon, required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: EdgeInsets.zero,
      leading: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: AppColors.rouge.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Icon(icon, color: AppColors.rouge, size: 20),
      ),
      title: Text(label, style: Theme.of(context).textTheme.titleMedium),
      trailing: const Icon(Icons.chevron_right, color: AppColors.gris),
      onTap: onTap,
    );
  }
}

class _RecentReservations extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final resAsync = ref.watch(myReservationsProvider);

    return resAsync.when(
      loading: () =>
          const Center(child: CircularProgressIndicator(color: AppColors.or)),
      error: (_, __) => const ErrorDisplay(message: 'Erreur de chargement'),
      data: (raw) {
        final items = raw
            .map((e) => Reservation.fromJson(e as Map<String, dynamic>))
            .take(3)
            .toList();
        if (items.isEmpty) {
          return const Padding(
            padding: EdgeInsets.all(16),
            child: Text('Aucune réservation récente',
                style: TextStyle(color: AppColors.gris)),
          );
        }
        return Column(
          children: items
              .map((r) => Card(
                    child: ListTile(
                      title: Text(r.establishmentName.isNotEmpty
                          ? r.establishmentName
                          : 'Réservation #${r.id}'),
                      subtitle: Text(r.checkInDate.split('T').first),
                      trailing: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: (r.status == 'confirmed'
                                  ? AppColors.vert
                                  : AppColors.or)
                              .withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(100),
                        ),
                        child: Text(r.status,
                            style: TextStyle(
                                color: r.status == 'confirmed'
                                    ? AppColors.vert
                                    : AppColors.or,
                                fontSize: 11)),
                      ),
                    ),
                  ))
              .toList(),
        );
      },
    );
  }
}
