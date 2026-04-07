import 'region.dart';

class PlaceImage {
  final int id;
  final String url;
  final String caption;

  const PlaceImage({required this.id, required this.url, this.caption = ''});

  factory PlaceImage.fromJson(Map<String, dynamic> json) => PlaceImage(
        id: json['id'] ?? json['ID'] ?? 0,
        url: json['url'] ?? '',
        caption: json['caption'] ?? '',
      );
}

class Place {
  final int id;
  final String name;
  final String slug;
  final String type;
  final String description;
  final double lat;
  final double lng;
  final double rating;
  final int reviewCount;
  final List<String> tags;
  final int regionId;
  final Region? region;
  final List<PlaceImage> images;

  const Place({
    required this.id,
    required this.name,
    this.slug = '',
    this.type = 'site',
    this.description = '',
    this.lat = 0,
    this.lng = 0,
    this.rating = 0,
    this.reviewCount = 0,
    this.tags = const [],
    this.regionId = 0,
    this.region,
    this.images = const [],
  });

  factory Place.fromJson(Map<String, dynamic> json) => Place(
        id: json['id'] ?? json['ID'] ?? 0,
        name: json['name'] ?? '',
        slug: json['slug'] ?? '',
        type: json['type'] ?? 'site',
        description: json['description'] ?? '',
        lat: (json['lat'] ?? 0).toDouble(),
        lng: (json['lng'] ?? 0).toDouble(),
        rating: (json['rating'] ?? 0).toDouble(),
        reviewCount: json['reviewCount'] ?? 0,
        tags: (json['tags'] as List<dynamic>?)?.cast<String>() ?? [],
        regionId: json['regionId'] ?? 0,
        region: json['region'] != null ? Region.fromJson(json['region']) : null,
        images: (json['images'] as List<dynamic>?)
                ?.map((e) => PlaceImage.fromJson(e))
                .toList() ??
            [],
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'slug': slug,
        'type': type,
        'description': description,
        'lat': lat,
        'lng': lng,
        'rating': rating,
        'reviewCount': reviewCount,
        'tags': tags,
        'regionId': regionId,
      };

  String get imageUrl =>
      images.isNotEmpty ? images.first.url : '';
}
