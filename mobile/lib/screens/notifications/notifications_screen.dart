import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/notification_provider.dart';
import '../../core/constants/app_colors.dart';
import '../../models/notification.dart';

class NotificationsScreen extends ConsumerWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notifs = ref.watch(notificationsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
        actions: [
          TextButton(
            onPressed: () {
              ref.read(notificationActionsProvider.notifier).markAllRead();
              ref.invalidate(notificationsProvider);
              ref.invalidate(unreadCountProvider);
            },
            child: const Text('Tout lire',
                style: TextStyle(color: AppColors.blanc)),
          ),
        ],
      ),
      body: notifs.when(
        loading: () =>
            const Center(child: CircularProgressIndicator(color: AppColors.rouge)),
        error: (e, _) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.error_outline, size: 48, color: AppColors.gris),
              const SizedBox(height: 12),
              Text('Erreur de chargement', style: TextStyle(color: AppColors.gris)),
              const SizedBox(height: 8),
              ElevatedButton(
                onPressed: () => ref.invalidate(notificationsProvider),
                child: const Text('Réessayer'),
              ),
            ],
          ),
        ),
        data: (list) => list.isEmpty
            ? Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.notifications_none,
                        size: 48, color: AppColors.gris),
                    const SizedBox(height: 12),
                    Text('Aucune notification',
                        style: TextStyle(color: AppColors.gris)),
                  ],
                ),
              )
            : RefreshIndicator(
                onRefresh: () async {
                  ref.invalidate(notificationsProvider);
                  ref.invalidate(unreadCountProvider);
                },
                child: ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: list.length,
                  separatorBuilder: (_, __) => const Divider(height: 1),
                  itemBuilder: (context, index) =>
                      _NotifTile(notif: list[index], ref: ref),
                ),
              ),
      ),
    );
  }
}

class _NotifTile extends StatelessWidget {
  final AppNotification notif;
  final WidgetRef ref;

  const _NotifTile({required this.notif, required this.ref});

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: CircleAvatar(
        backgroundColor: notif.isRead ? AppColors.sable : AppColors.rouge.withValues(alpha: 0.1),
        child: Icon(_iconForType(notif.type),
            color: notif.isRead ? AppColors.gris : AppColors.rouge, size: 20),
      ),
      title: Text(
        notif.title,
        style: TextStyle(
          fontWeight: notif.isRead ? FontWeight.normal : FontWeight.w600,
          color: AppColors.nuit,
        ),
      ),
      subtitle: Text(notif.body,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
          style: TextStyle(fontSize: 13, color: AppColors.gris)),
      trailing: notif.isRead
          ? null
          : Container(
              width: 8,
              height: 8,
              decoration: const BoxDecoration(
                color: AppColors.rouge,
                shape: BoxShape.circle,
              ),
            ),
      onTap: () {
        if (!notif.isRead) {
          ref.read(notificationActionsProvider.notifier).markRead(notif.id);
          ref.invalidate(notificationsProvider);
          ref.invalidate(unreadCountProvider);
        }
      },
    );
  }

  IconData _iconForType(String type) {
    switch (type) {
      case 'reservation_confirmed':
        return Icons.check_circle;
      case 'reservation_cancelled':
        return Icons.cancel;
      case 'departure_reminder':
        return Icons.flight_takeoff;
      case 'new_review':
        return Icons.rate_review;
      case 'review_reply':
        return Icons.reply;
      default:
        return Icons.notifications;
    }
  }
}
