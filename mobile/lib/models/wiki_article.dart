class WikiArticle {
  final int id;
  final String title;
  final String slug;
  final String bodyHtml;
  final String summary;
  final String category;
  final String imageUrl;
  final String createdAt;
  final String updatedAt;

  const WikiArticle({
    required this.id,
    required this.title,
    this.slug = '',
    this.bodyHtml = '',
    this.summary = '',
    this.category = '',
    this.imageUrl = '',
    this.createdAt = '',
    this.updatedAt = '',
  });

  factory WikiArticle.fromJson(Map<String, dynamic> json) => WikiArticle(
        id: json['id'] ?? json['ID'] ?? 0,
        title: json['title'] ?? '',
        slug: json['slug'] ?? '',
        bodyHtml: json['bodyHtml'] ?? json['body_html'] ?? '',
        summary: json['summary'] ?? '',
        category: json['category'] ?? '',
        imageUrl: json['imageUrl'] ?? '',
        createdAt: json['createdAt'] ?? json['CreatedAt'] ?? '',
        updatedAt: json['updatedAt'] ?? json['UpdatedAt'] ?? '',
      );
}
