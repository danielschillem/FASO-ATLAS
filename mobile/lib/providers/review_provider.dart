import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/constants/api_endpoints.dart';
import '../core/network/dio_client.dart';
import '../models/review.dart';

final placeReviewsProvider =
    FutureProvider.autoDispose.family<List<Review>, int>((ref, placeId) async {
  final res = await DioClient.instance
      .get('${ApiEndpoints.reviews}/places/$placeId');
  final list = res.data as List<dynamic>;
  return list.map((e) => Review.fromJson(e as Map<String, dynamic>)).toList();
});

final establishmentReviewsProvider =
    FutureProvider.autoDispose.family<List<Review>, int>((ref, estabId) async {
  final res = await DioClient.instance
      .get('${ApiEndpoints.reviews}/establishments/$estabId');
  final list = res.data as List<dynamic>;
  return list.map((e) => Review.fromJson(e as Map<String, dynamic>)).toList();
});

class ReviewFormState {
  final bool isLoading;
  final bool isSuccess;
  final String? error;
  const ReviewFormState({this.isLoading = false, this.isSuccess = false, this.error});
}

class ReviewFormNotifier extends StateNotifier<ReviewFormState> {
  ReviewFormNotifier() : super(const ReviewFormState());

  Future<void> submitReview({
    int? placeId,
    int? establishmentId,
    required int rating,
    required String comment,
  }) async {
    state = const ReviewFormState(isLoading: true);
    try {
      await DioClient.instance.post(ApiEndpoints.reviews, data: {
        if (placeId != null) 'placeId': placeId,
        if (establishmentId != null) 'establishmentId': establishmentId,
        'rating': rating,
        'comment': comment,
      });
      state = const ReviewFormState(isSuccess: true);
    } catch (_) {
      state = const ReviewFormState(error: 'Erreur lors de la soumission');
    }
  }
}

final reviewFormProvider =
    StateNotifierProvider.autoDispose<ReviewFormNotifier, ReviewFormState>(
  (_) => ReviewFormNotifier(),
);
