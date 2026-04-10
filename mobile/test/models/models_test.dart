import 'package:flutter_test/flutter_test.dart';
import 'package:faso_trip/models/user.dart';
import 'package:faso_trip/models/place.dart';
import 'package:faso_trip/models/reservation.dart';
import 'package:faso_trip/models/symbol.dart';
import 'package:faso_trip/models/wiki_article.dart';
import 'package:faso_trip/models/atlas_event.dart';

void main() {
  group('User model', () {
    test('fromJson parses correctly', () {
      final json = {
        'id': 1,
        'email': 'test@example.com',
        'firstName': 'John',
        'lastName': 'Doe',
        'phone': '+226 70 00 00 00',
        'role': 'tourist',
        'avatarUrl': 'https://example.com/avatar.jpg',
        'isVerified': true,
        'createdAt': '2026-01-01T00:00:00Z',
      };
      final user = User.fromJson(json);
      expect(user.id, 1);
      expect(user.email, 'test@example.com');
      expect(user.firstName, 'John');
      expect(user.lastName, 'Doe');
      expect(user.role, 'tourist');
      expect(user.isVerified, true);
    });

    test('fromJson handles ID key (uppercase)', () {
      final json = {'ID': 42, 'email': 'a@b.com', 'firstName': 'A'};
      final user = User.fromJson(json);
      expect(user.id, 42);
    });

    test('firstName and lastName parsed correctly', () {
      final user = User.fromJson({
        'id': 1,
        'firstName': 'John',
        'lastName': 'Doe',
        'email': 'j@d.com',
      });
      expect(user.firstName, 'John');
      expect(user.lastName, 'Doe');
    });
  });

  group('Place model', () {
    test('fromJson parses all fields', () {
      final json = {
        'id': 10,
        'name': 'Nazinga',
        'slug': 'nazinga',
        'type': 'nature',
        'description': 'Game ranch',
        'lat': 11.15,
        'lng': -1.6,
        'rating': 4.5,
        'reviewCount': 12,
        'tags': ['wildlife', 'safari'],
        'regionId': 3,
        'images': [
          {'id': 1, 'url': 'https://img.com/1.jpg', 'caption': 'Photo 1'}
        ],
      };
      final place = Place.fromJson(json);
      expect(place.name, 'Nazinga');
      expect(place.slug, 'nazinga');
      expect(place.lat, 11.15);
      expect(place.rating, 4.5);
      expect(place.tags, ['wildlife', 'safari']);
      expect(place.images.length, 1);
      expect(place.imageUrl, 'https://img.com/1.jpg');
    });

    test('imageUrl returns empty string when no images', () {
      final place = Place.fromJson({
        'id': 1,
        'name': 'Test',
        'slug': 'test',
        'type': 'site',
        'lat': 0.0,
        'lng': 0.0,
        'images': [],
      });
      expect(place.imageUrl, '');
    });
  });

  group('Reservation model', () {
    test('fromJson parses correctly', () {
      final json = {
        'id': 5,
        'establishmentId': 2,
        'checkInDate': '2026-06-01T00:00:00Z',
        'guestsCount': 3,
        'status': 'confirmed',
        'specialRequests': 'Late check-in',
        'createdAt': '2026-05-01T00:00:00Z',
      };
      final resa = Reservation.fromJson(json);
      expect(resa.id, 5);
      expect(resa.establishmentId, 2);
      expect(resa.guestsCount, 3);
      expect(resa.status, 'confirmed');
    });
  });

  group('Symbol model', () {
    test('fromJson parses correctly', () {
      final json = {
        'id': 1,
        'name': 'Crocodile',
        'meaning': 'Power',
        'category': 'animal',
        'imageUrl': 'https://img.com/croco.svg',
        'origin': 'Mossi',
      };
      final symbol = Symbol.fromJson(json);
      expect(symbol.name, 'Crocodile');
      expect(symbol.meaning, 'Power');
      expect(symbol.category, 'animal');
    });
  });

  group('WikiArticle model', () {
    test('fromJson parses correctly', () {
      final json = {
        'id': 1,
        'title': 'Les Masques',
        'slug': 'les-masques',
        'bodyHtml': '<p>Content</p>',
        'summary': 'About masks',
        'category': 'culture',
        'imageUrl': 'https://img.com/mask.jpg',
        'createdAt': '2026-01-01T00:00:00Z',
        'updatedAt': '2026-02-01T00:00:00Z',
      };
      final article = WikiArticle.fromJson(json);
      expect(article.title, 'Les Masques');
      expect(article.slug, 'les-masques');
      expect(article.category, 'culture');
    });
  });

  group('AtlasEvent model', () {
    test('fromJson parses correctly', () {
      final json = {
        'id': 1,
        'title': 'Empire Mossi',
        'description': 'Foundation of the Mossi kingdoms',
        'year': 1200,
        'era': 'medieval',
        'imageUrl': 'https://img.com/mossi.jpg',
        'lat': 12.37,
        'lng': -1.52,
      };
      final event = AtlasEvent.fromJson(json);
      expect(event.title, 'Empire Mossi');
      expect(event.year, 1200);
      expect(event.era, 'medieval');
      expect(event.lat, 12.37);
    });
  });
}
