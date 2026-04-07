import 'place.dart';

class ItineraryStop {
  final int id;
  final int placeId;
  final int order;
  final int dayNumber;
  final String duration;
  final String notes;
  final Place? place;

  const ItineraryStop({
    required this.id,
    this.placeId = 0,
    this.order = 0,
    this.dayNumber = 1,
    this.duration = '',
    this.notes = '',
    this.place,
  });

  factory ItineraryStop.fromJson(Map<String, dynamic> json) => ItineraryStop(
        id: json['id'] ?? json['ID'] ?? 0,
        placeId: json['placeId'] ?? 0,
        order: json['order'] ?? 0,
        dayNumber: json['dayNumber'] ?? 1,
        duration: json['duration'] ?? '',
        notes: json['notes'] ?? '',
        place: json['place'] != null ? Place.fromJson(json['place']) : null,
      );
}

class Itinerary {
  final int id;
  final String title;
  final String description;
  final int durationDays;
  final String difficulty;
  final int budgetFcfa;
  final bool isPublic;
  final int userId;
  final List<ItineraryStop> stops;
  final String createdAt;

  const Itinerary({
    required this.id,
    required this.title,
    this.description = '',
    this.durationDays = 1,
    this.difficulty = 'modéré',
    this.budgetFcfa = 0,
    this.isPublic = true,
    this.userId = 0,
    this.stops = const [],
    this.createdAt = '',
  });

  factory Itinerary.fromJson(Map<String, dynamic> json) => Itinerary(
        id: json['id'] ?? json['ID'] ?? 0,
        title: json['title'] ?? '',
        description: json['description'] ?? '',
        durationDays: json['durationDays'] ?? 1,
        difficulty: json['difficulty'] ?? 'modéré',
        budgetFcfa: json['budgetFcfa'] ?? 0,
        isPublic: json['isPublic'] ?? true,
        userId: json['userId'] ?? 0,
        stops: (json['stops'] as List<dynamic>?)
                ?.map((e) => ItineraryStop.fromJson(e))
                .toList() ??
            [],
        createdAt: json['createdAt'] ?? json['CreatedAt'] ?? '',
      );
}
