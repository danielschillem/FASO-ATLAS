import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/constants/api_endpoints.dart';
import '../core/network/dio_client.dart';

// ── My reservations ───────────────────────────────────────────────────
final myReservationsProvider = FutureProvider.autoDispose<List<dynamic>>((ref) async {
  final res = await DioClient.instance.get('${ApiEndpoints.reservations}/me');
  return res.data as List<dynamic>;
});

// ── Create reservation ────────────────────────────────────────────────
class ReservationFormState {
  final int? establishmentId;
  final String checkInDate;
  final String checkOutDate;
  final int guestsCount;
  final String specialRequests;
  final bool isLoading;
  final bool isSuccess;
  final String? error;

  const ReservationFormState({
    this.establishmentId,
    this.checkInDate    = '',
    this.checkOutDate   = '',
    this.guestsCount    = 1,
    this.specialRequests = '',
    this.isLoading      = false,
    this.isSuccess      = false,
    this.error,
  });

  ReservationFormState copyWith({
    int? establishmentId,
    String? checkInDate,
    String? checkOutDate,
    int? guestsCount,
    String? specialRequests,
    bool? isLoading,
    bool? isSuccess,
    String? error,
  }) => ReservationFormState(
    establishmentId:  establishmentId  ?? this.establishmentId,
    checkInDate:      checkInDate      ?? this.checkInDate,
    checkOutDate:     checkOutDate     ?? this.checkOutDate,
    guestsCount:      guestsCount      ?? this.guestsCount,
    specialRequests:  specialRequests  ?? this.specialRequests,
    isLoading:        isLoading        ?? this.isLoading,
    isSuccess:        isSuccess        ?? this.isSuccess,
    error:            error,
  );

  int get nights {
    if (checkInDate.isEmpty || checkOutDate.isEmpty) return 0;
    final i = DateTime.tryParse(checkInDate);
    final o = DateTime.tryParse(checkOutDate);
    if (i == null || o == null) return 0;
    return o.difference(i).inDays;
  }
}

class ReservationNotifier extends StateNotifier<ReservationFormState> {
  ReservationNotifier() : super(const ReservationFormState());

  void setEstablishment(int id) => state = state.copyWith(establishmentId: id);
  void setCheckIn(String d)     => state = state.copyWith(checkInDate: d);
  void setCheckOut(String d)    => state = state.copyWith(checkOutDate: d);
  void setGuests(int n)         => state = state.copyWith(guestsCount: n);
  void setNotes(String n)       => state = state.copyWith(specialRequests: n);
  void reset()                  => state = const ReservationFormState();

  Future<void> submit() async {
    if (state.establishmentId == null || state.checkInDate.isEmpty) {
      state = state.copyWith(error: 'Veuillez remplir les champs requis');
      return;
    }
    state = state.copyWith(isLoading: true);
    try {
      await DioClient.instance.post(ApiEndpoints.reservations, data: {
        'establishmentId': state.establishmentId,
        'checkInDate':     state.checkInDate,
        if (state.checkOutDate.isNotEmpty) 'checkOutDate': state.checkOutDate,
        'guestsCount':     state.guestsCount,
        'specialRequests': state.specialRequests,
      });
      state = state.copyWith(isLoading: false, isSuccess: true);
    } catch (_) {
      state = state.copyWith(isLoading: false, error: 'Erreur lors de la réservation');
    }
  }
}

final reservationProvider =
    StateNotifierProvider.autoDispose<ReservationNotifier, ReservationFormState>(
  (_) => ReservationNotifier(),
);
