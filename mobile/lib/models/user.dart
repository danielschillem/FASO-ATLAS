class User {
  final int id;
  final String email;

  final String firstName;

  final String lastName;

  final String phone;

  final String role;

  final String avatarUrl;

  final bool isVerified;

  final String createdAt;

  const User({
    required this.id,
    required this.email,
    required this.firstName,
    this.lastName = '',
    this.phone = '',
    this.role = 'tourist',
    this.avatarUrl = '',
    this.isVerified = false,
    this.createdAt = '',
  });

  factory User.fromJson(Map<String, dynamic> json) => User(
        id: json['id'] ?? json['ID'] ?? 0,
        email: json['email'] ?? '',
        firstName: json['firstName'] ?? '',
        lastName: json['lastName'] ?? '',
        phone: json['phone'] ?? '',
        role: json['role'] ?? 'tourist',
        avatarUrl: json['avatarUrl'] ?? '',
        isVerified: json['isVerified'] ?? false,
        createdAt: json['createdAt'] ?? json['CreatedAt'] ?? '',
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'email': email,
        'firstName': firstName,
        'lastName': lastName,
        'phone': phone,
        'role': role,
        'avatarUrl': avatarUrl,
        'isVerified': isVerified,
        'createdAt': createdAt,
      };
}
