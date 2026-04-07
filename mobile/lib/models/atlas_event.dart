class AtlasEvent {
  final int id;
  final String title;
  final String description;
  final int year;
  final String era;
  final String imageUrl;
  final double? lat;
  final double? lng;

  const AtlasEvent({
    required this.id,
    required this.title,
    this.description = '',
    this.year = 0,
    this.era = '',
    this.imageUrl = '',
    this.lat,
    this.lng,
  });

  factory AtlasEvent.fromJson(Map<String, dynamic> json) => AtlasEvent(
        id: json['id'] ?? json['ID'] ?? 0,
        title: json['title'] ?? '',
        description: json['description'] ?? '',
        year: json['year'] ?? 0,
        era: json['era'] ?? '',
        imageUrl: json['imageUrl'] ?? '',
        lat: (json['lat'] as num?)?.toDouble(),
        lng: (json['lng'] as num?)?.toDouble(),
      );
}
