import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/constants/api_endpoints.dart';
import '../core/network/dio_client.dart';
import '../models/notification.dart';

final notificationsProvider = FutureProvider.autoDispose<List<AppNotification>>(
  (ref) async {
    final res = await DioClient.instance.get(ApiEndpoints.notifications);
    final data = res.data;
    final list = (data['data'] as List<dynamic>?) ?? [];
    return list
        .map((e) => AppNotification.fromJson(e as Map<String, dynamic>))
        .toList();
  },
);

final unreadCountProvider = FutureProvider.autoDispose<int>((ref) async {
  final res =
      await DioClient.instance.get('${ApiEndpoints.notifications}/unread-count');
  return res.data['count'] ?? 0;
});

class NotificationNotifier extends StateNotifier<AsyncValue<void>> {
  NotificationNotifier() : super(const AsyncValue.data(null));

  Future<void> markRead(int id) async {
    state = const AsyncValue.loading();
    try {
      await DioClient.instance.put('${ApiEndpoints.notifications}/$id/read');
      state = const AsyncValue.data(null);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> markAllRead() async {
    state = const AsyncValue.loading();
    try {
      await DioClient.instance.put('${ApiEndpoints.notifications}/read-all');
      state = const AsyncValue.data(null);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
}

final notificationActionsProvider =
    StateNotifierProvider.autoDispose<NotificationNotifier, AsyncValue<void>>(
  (_) => NotificationNotifier(),
);
