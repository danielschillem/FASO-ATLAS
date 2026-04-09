import 'user.dart';

class ReviewImage {
  final int id;
  final int reviewId;
  final String url;
  final String caption;
  final int sortOrder;

  const ReviewImage({
    required this.id,
    this.reviewId = 0,
    this.url = '',
    this.caption = '',
    this.sortOrder = 0,
  });

  factory ReviewImage.fromJson(Map<String, dynamic> json) => ReviewImage(
        id: json['id'] ?? json['ID'] ?? 0,
        reviewId: json['reviewId'] ?? 0,
        url: json['url'] ?? '',
        caption: json['caption'] ?? '',
        sortOrder: json['sortOrder'] ?? 0,
      );
}

class Review {
  final int id;
  final int userId;
  final User? user;
  final int? placeId;
  final int? establishmentId;
  final int rating;
  final String comment;
  final List<ReviewImage> images;
  final String createdAt;

  const Review({
    required this.id,
    this.userId = 0,
    this.user,
    this.placeId,
    this.establishmentId,
    this.rating = 0,
    this.comment = '',
    this.images = const [],
    this.createdAt = '',
  });

  factory Review.fromJson(Map<String, dynamic> json) => Review(
        id: json['id'] ?? json['ID'] ?? 0,
        userId: json['userId'] ?? 0,
        user: json['user'] != null ? User.fromJson(json['user']) : null,
        placeId: json['placeId'],
        establishmentId: json['establishmentId'],
        rating: json['rating'] ?? 0,
        comment: json['comment'] ?? '',
        images: (json['images'] as List<dynamic>?)
                ?.map((e) => ReviewImage.fromJson(e as Map<String, dynamic>))
                .toList() ??
            [],
        createdAt: json['createdAt'] ?? json['CreatedAt'] ?? '',
      );
}
