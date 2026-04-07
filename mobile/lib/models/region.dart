
class Region {
  final int id;
  final String name;
  final String description;

  const Region({required this.id, required this.name, this.description = ''});

  factory Region.fromJson(Map<String, dynamic> json) => Region(
        id: json['id'] ?? json['ID'] ?? 0,
        name: json['name'] ?? '',
        description: json['description'] ?? '',
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'description': description,
      };
}
