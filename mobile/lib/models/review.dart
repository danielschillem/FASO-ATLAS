import 'user.dart';

class Review {
  final int id;
  final int userId;
  final User? user;
  final int? placeId;
  final int? establishmentId;
  final int rating;
  final String comment;
  final String createdAt;

  const Review({
    required this.id,
    this.userId = 0,
    this.user,
    this.placeId,
    this.establishmentId,
    this.rating = 0,
    this.comment = '',
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
        createdAt: json['createdAt'] ?? json['CreatedAt'] ?? '',
      );
}
