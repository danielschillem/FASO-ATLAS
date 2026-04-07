
class Establishment {
  final int id;
  final String name;
  final String type;
  final String description;
  final String address;
  final String phone;
  final String email;
  final int stars;
  final double priceMin;
  final double priceMax;
  final double lat;
  final double lng;
  final double rating;
  final String imageUrl;
  final int regionId;

  const Establishment({
    required this.id,
    required this.name,
    this.type = 'hotel',
    this.description = '',
    this.address = '',
    this.phone = '',
    this.email = '',
    this.stars = 0,
    this.priceMin = 0,
    this.priceMax = 0,
    this.lat = 0,
    this.lng = 0,
    this.rating = 0,
    this.imageUrl = '',
    this.regionId = 0,
  });

  factory Establishment.fromJson(Map<String, dynamic> json) => Establishment(
        id: json['id'] ?? json['ID'] ?? 0,
        name: json['name'] ?? '',
        type: json['type'] ?? 'hotel',
        description: json['description'] ?? '',
        address: json['address'] ?? '',
        phone: json['phone'] ?? '',
        email: json['email'] ?? '',
        stars: json['stars'] ?? 0,
        priceMin: (json['priceMin'] ?? 0).toDouble(),
        priceMax: (json['priceMax'] ?? 0).toDouble(),
        lat: (json['lat'] ?? 0).toDouble(),
        lng: (json['lng'] ?? 0).toDouble(),
        rating: (json['rating'] ?? 0).toDouble(),
        imageUrl: json['imageUrl'] ?? '',
        regionId: json['regionId'] ?? 0,
      );
}
