class AppNotification {
  final int id;
  final int userId;
  final String type;
  final String title;
  final String body;
  final Map<String, dynamic> data;
  final bool isRead;
  final String createdAt;

  const AppNotification({
    required this.id,
    this.userId = 0,
    this.type = '',
    this.title = '',
    this.body = '',
    this.data = const {},
    this.isRead = false,
    this.createdAt = '',
  });

  factory AppNotification.fromJson(Map<String, dynamic> json) =>
      AppNotification(
        id: json['id'] ?? json['ID'] ?? 0,
        userId: json['userId'] ?? 0,
        type: json['type'] ?? '',
        title: json['title'] ?? '',
        body: json['body'] ?? '',
        data: json['data'] is Map<String, dynamic>
            ? json['data']
            : <String, dynamic>{},
        isRead: json['isRead'] ?? false,
        createdAt: json['createdAt'] ?? json['CreatedAt'] ?? '',
      );
}
