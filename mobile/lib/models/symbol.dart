class Symbol {
  final int id;
  final String name;
  final String meaning;
  final String category;
  final String imageUrl;
  final String origin;

  const Symbol({
    required this.id,
    required this.name,
    this.meaning = '',
    this.category = '',
    this.imageUrl = '',
    this.origin = '',
  });

  factory Symbol.fromJson(Map<String, dynamic> json) => Symbol(
        id: json['id'] ?? json['ID'] ?? 0,
        name: json['name'] ?? '',
        meaning: json['meaning'] ?? '',
        category: json['category'] ?? '',
        imageUrl: json['imageUrl'] ?? '',
        origin: json['origin'] ?? '',
      );
}
