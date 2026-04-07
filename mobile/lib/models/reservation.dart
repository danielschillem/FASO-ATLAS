class Reservation {
  final int id;
  final int establishmentId;
  final String establishmentName;
  final String checkInDate;
  final String checkOutDate;
  final int guestsCount;
  final String specialRequests;
  final String status;
  final String createdAt;

  const Reservation({
    required this.id,
    this.establishmentId = 0,
    this.establishmentName = '',
    this.checkInDate = '',
    this.checkOutDate = '',
    this.guestsCount = 1,
    this.specialRequests = '',
    this.status = 'pending',
    this.createdAt = '',
  });

  factory Reservation.fromJson(Map<String, dynamic> json) => Reservation(
        id: json['id'] ?? json['ID'] ?? 0,
        establishmentId: json['establishmentId'] ?? 0,
        establishmentName:
            json['establishment']?['name'] ?? json['establishmentName'] ?? '',
        checkInDate: json['checkInDate'] ?? '',
        checkOutDate: json['checkOutDate'] ?? '',
        guestsCount: json['guestsCount'] ?? 1,
        specialRequests: json['specialRequests'] ?? '',
        status: json['status'] ?? 'pending',
        createdAt: json['createdAt'] ?? json['CreatedAt'] ?? '',
      );
}
