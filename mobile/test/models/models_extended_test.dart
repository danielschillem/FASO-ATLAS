import 'package:flutter_test/flutter_test.dart';
import 'package:faso_atlas/models/review.dart';
import 'package:faso_atlas/models/establishment.dart';
import 'package:faso_atlas/models/itinerary.dart';
import 'package:faso_atlas/models/region.dart';

void main() {
  group('Review model', () {
    test('fromJson parses correctly', () {
      final json = {
        'id': 10,
        'userId': 1,
        'placeId': 5,
        'rating': 4,
        'comment': 'Superbe lieu !',
        'createdAt': '2025-06-01T12:00:00Z',
      };
      final review = Review.fromJson(json);
      expect(review.id, 10);
      expect(review.userId, 1);
      expect(review.placeId, 5);
      expect(review.rating, 4);
      expect(review.comment, 'Superbe lieu !');
    });

    test('fromJson handles ID key', () {
      final json = {'ID': 7, 'rating': 3};
      final review = Review.fromJson(json);
      expect(review.id, 7);
    });

    test('fromJson with nested user', () {
      final json = {
        'id': 1,
        'rating': 5,
        'user': {
          'id': 2,
          'email': 'test@test.bf',
          'firstName': 'Awa',
        },
      };
      final review = Review.fromJson(json);
      expect(review.user, isNotNull);
      expect(review.user!.firstName, 'Awa');
    });
  });

  group('Region model', () {
    test('fromJson parses correctly', () {
      final json = {
        'id': 1,
        'name': 'Centre',
        'description': 'Région du Centre',
      };
      final region = Region.fromJson(json);
      expect(region.id, 1);
      expect(region.name, 'Centre');
      expect(region.description, 'Région du Centre');
    });
  });

  group('Establishment model', () {
    test('fromJson parses correctly', () {
      final json = {
        'id': 3,
        'name': 'Hôtel Laïco',
        'type': 'hotel',
        'priceMin': 35000,
        'priceMax': 90000,
        'stars': 4,
      };
      final estab = Establishment.fromJson(json);
      expect(estab.id, 3);
      expect(estab.name, 'Hôtel Laïco');
      expect(estab.type, 'hotel');
      expect(estab.priceMin, 35000);
      expect(estab.stars, 4);
    });
  });

  group('Itinerary model', () {
    test('fromJson parses correctly', () {
      final json = {
        'id': 2,
        'title': 'Circuit Cascades',
        'description': 'Découverte des cascades de Banfora',
        'durationDays': 3,
        'difficulty': 'moderate',
        'userId': 1,
      };
      final itin = Itinerary.fromJson(json);
      expect(itin.id, 2);
      expect(itin.title, 'Circuit Cascades');
      expect(itin.durationDays, 3);
      expect(itin.difficulty, 'moderate');
    });
  });
}
