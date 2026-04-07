import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/constants/app_colors.dart';
import '../../models/establishment.dart';
import '../../models/reservation.dart';
import '../../providers/establishment_provider.dart';
import '../../providers/reservation_provider.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/common/shimmer_placeholder.dart';
import '../../widgets/common/error_display.dart';
import '../../widgets/common/star_rating.dart';

class ReservationScreen extends ConsumerWidget {
  const ReservationScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authProvider);

    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Réservation'),
          bottom: const TabBar(
            indicatorColor: AppColors.or,
            labelColor: AppColors.blanc,
            unselectedLabelColor: AppColors.gris,
            tabs: [
              Tab(text: 'Hébergements'),
              Tab(text: 'Mes réservations'),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            _EstablishmentsList(),
            auth.isAuthenticated
                ? _MyReservations()
                : const Center(
                    child: Text('Connectez-vous pour voir vos réservations',
                        style: TextStyle(color: AppColors.gris)),
                  ),
          ],
        ),
      ),
    );
  }
}

class _EstablishmentsList extends ConsumerWidget {
  static const _types = [
    {'type': 'hotel', 'label': 'Hôtels'},
    {'type': 'restaurant', 'label': 'Restaurants'},
    {'type': 'gite', 'label': 'Gîtes'},
    {'type': 'camp', 'label': 'Camps'},
  ];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final filters = ref.watch(establishmentFiltersProvider);
    final dataAsync = ref.watch(establishmentsProvider(filters));

    return Column(
      children: [
        // Type filter
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: _types.map((t) {
                final isActive = filters.type == t['type'];
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: ChoiceChip(
                    label: Text(t['label']!),
                    selected: isActive,
                    onSelected: (_) => ref
                        .read(establishmentFiltersProvider.notifier)
                        .setType(t['type']!),
                    selectedColor: AppColors.rouge.withValues(alpha: 0.2),
                    labelStyle: TextStyle(
                      color: isActive ? AppColors.rouge : AppColors.gris,
                      fontSize: 12,
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
        ),
        // Establishments list
        Expanded(
          child: dataAsync.when(
            loading: () => const ListShimmer(count: 3),
            error: (e, _) => ErrorDisplay(
              message: 'Erreur de chargement',
              onRetry: () =>
                  ref.invalidate(establishmentsProvider(filters)),
            ),
            data: (raw) {
              final items = (raw['data'] as List<dynamic>?)
                      ?.map((e) =>
                          Establishment.fromJson(e as Map<String, dynamic>))
                      .toList() ??
                  [];
              if (items.isEmpty) {
                return const Center(
                  child: Text('Aucun établissement trouvé',
                      style: TextStyle(color: AppColors.gris)),
                );
              }
              return ListView.separated(
                padding: const EdgeInsets.all(12),
                itemCount: items.length,
                separatorBuilder: (_, __) => const SizedBox(height: 8),
                itemBuilder: (_, i) =>
                    _EstablishmentCard(establishment: items[i], ref: ref),
              );
            },
          ),
        ),
      ],
    );
  }
}

class _EstablishmentCard extends StatelessWidget {
  final Establishment establishment;
  final WidgetRef ref;
  const _EstablishmentCard({required this.establishment, required this.ref});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(establishment.name,
                      style: Theme.of(context).textTheme.titleMedium),
                ),
                if (establishment.stars > 0)
                  Row(
                    children: List.generate(
                        establishment.stars,
                        (_) => const Icon(Icons.star,
                            size: 14, color: AppColors.or)),
                  ),
              ],
            ),
            const SizedBox(height: 4),
            if (establishment.address.isNotEmpty)
              Text(establishment.address,
                  style: Theme.of(context).textTheme.bodySmall),
            if (establishment.rating > 0) ...[
              const SizedBox(height: 6),
              StarRating(rating: establishment.rating, size: 14),
            ],
            if (establishment.priceMin > 0) ...[
              const SizedBox(height: 6),
              Text(
                'À partir de ${establishment.priceMin.toInt()} FCFA / nuit',
                style: TextStyle(
                    fontSize: 13,
                    color: AppColors.vert,
                    fontWeight: FontWeight.w600),
              ),
            ],
            const SizedBox(height: 10),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  ref
                      .read(reservationProvider.notifier)
                      .setEstablishment(establishment.id);
                  _showBookingSheet(context, ref);
                },
                child: const Text('Réserver'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showBookingSheet(BuildContext context, WidgetRef ref) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (_) => const _BookingSheet(),
    );
  }
}

class _BookingSheet extends ConsumerStatefulWidget {
  const _BookingSheet();
  @override
  ConsumerState<_BookingSheet> createState() => _BookingSheetState();
}

class _BookingSheetState extends ConsumerState<_BookingSheet> {
  final _checkInCtrl = TextEditingController();
  final _checkOutCtrl = TextEditingController();
  final _guestsCtrl = TextEditingController(text: '1');
  final _notesCtrl = TextEditingController();

  @override
  Widget build(BuildContext context) {
    final formState = ref.watch(reservationProvider);

    return Padding(
      padding: EdgeInsets.only(
        left: 16,
        right: 16,
        top: 24,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Nouvelle réservation',
              style: Theme.of(context).textTheme.headlineMedium),
          const SizedBox(height: 16),
          TextField(
            controller: _checkInCtrl,
            decoration: const InputDecoration(
              hintText: 'Date d\'arrivée (AAAA-MM-JJ)',
              prefixIcon: Icon(Icons.calendar_today_outlined, size: 18),
            ),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _checkOutCtrl,
            decoration: const InputDecoration(
              hintText: 'Date de départ (AAAA-MM-JJ)',
              prefixIcon: Icon(Icons.calendar_today_outlined, size: 18),
            ),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _guestsCtrl,
            decoration: const InputDecoration(
              hintText: 'Nombre de personnes',
              prefixIcon: Icon(Icons.people_outline, size: 18),
            ),
            keyboardType: TextInputType.number,
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _notesCtrl,
            decoration: const InputDecoration(
              hintText: 'Demandes spéciales (optionnel)',
            ),
            maxLines: 2,
          ),
          if (formState.error != null) ...[
            const SizedBox(height: 8),
            Text(formState.error!,
                style: const TextStyle(color: AppColors.rouge, fontSize: 13)),
          ],
          if (formState.isSuccess) ...[
            const SizedBox(height: 8),
            const Text('Réservation envoyée !',
                style: TextStyle(color: AppColors.vert, fontSize: 13, fontWeight: FontWeight.w600)),
          ],
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: formState.isLoading
                  ? null
                  : () {
                      ref
                          .read(reservationProvider.notifier)
                        ..setCheckIn(_checkInCtrl.text.trim())
                        ..setCheckOut(_checkOutCtrl.text.trim())
                        ..setGuests(
                            int.tryParse(_guestsCtrl.text.trim()) ?? 1)
                        ..setNotes(_notesCtrl.text.trim())
                        ..submit();
                    },
              child: formState.isLoading
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                          color: Colors.white, strokeWidth: 2))
                  : const Text('Confirmer la réservation'),
            ),
          ),
        ],
      ),
    );
  }
}

class _MyReservations extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final reservationsAsync = ref.watch(myReservationsProvider);

    return reservationsAsync.when(
      loading: () => const ListShimmer(count: 3),
      error: (e, _) => ErrorDisplay(
        message: 'Erreur de chargement',
        onRetry: () => ref.invalidate(myReservationsProvider),
      ),
      data: (raw) {
        final items = raw
            .map((e) => Reservation.fromJson(e as Map<String, dynamic>))
            .toList();
        if (items.isEmpty) {
          return const Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.hotel_outlined, size: 56, color: AppColors.sable2),
                SizedBox(height: 12),
                Text('Aucune réservation'),
              ],
            ),
          );
        }
        return ListView.separated(
          padding: const EdgeInsets.all(16),
          itemCount: items.length,
          separatorBuilder: (_, __) => const SizedBox(height: 8),
          itemBuilder: (_, i) => _ReservationCard(reservation: items[i]),
        );
      },
    );
  }
}

class _ReservationCard extends StatelessWidget {
  final Reservation reservation;
  const _ReservationCard({required this.reservation});

  Color _statusColor(String s) {
    switch (s) {
      case 'confirmed':
        return AppColors.vert;
      case 'cancelled':
        return AppColors.rouge;
      case 'completed':
        return AppColors.gris;
      default:
        return AppColors.or;
    }
  }

  String _statusLabel(String s) {
    switch (s) {
      case 'pending':
        return 'En attente';
      case 'confirmed':
        return 'Confirmée';
      case 'cancelled':
        return 'Annulée';
      case 'completed':
        return 'Terminée';
      default:
        return s;
    }
  }

  @override
  Widget build(BuildContext context) {
    final color = _statusColor(reservation.status);
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    reservation.establishmentName.isNotEmpty
                        ? reservation.establishmentName
                        : 'Réservation #${reservation.id}',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                ),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: color.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(100),
                  ),
                  child: Text(_statusLabel(reservation.status),
                      style: TextStyle(
                          color: color,
                          fontSize: 11,
                          fontWeight: FontWeight.w600)),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                const Icon(Icons.calendar_today_outlined,
                    size: 13, color: AppColors.gris),
                const SizedBox(width: 4),
                Text(
                  '${reservation.checkInDate.split('T').first} → ${reservation.checkOutDate.split('T').first}',
                  style:
                      const TextStyle(fontSize: 12, color: AppColors.gris),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                const Icon(Icons.people_outline,
                    size: 13, color: AppColors.gris),
                const SizedBox(width: 4),
                Text('${reservation.guestsCount} personne(s)',
                    style: const TextStyle(
                        fontSize: 12, color: AppColors.gris)),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
