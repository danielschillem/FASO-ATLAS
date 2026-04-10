import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:faso_trip/widgets/common/star_rating.dart';

void main() {
  group('StarRating', () {
    testWidgets('renders 5 stars', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(home: Scaffold(body: StarRating(rating: 3.5))),
      );

      final icons = find.byType(Icon);
      expect(icons, findsNWidgets(5));
    });

    testWidgets('shows review count when provided', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(body: StarRating(rating: 4.0, reviewCount: 42)),
        ),
      );

      expect(find.text('(42)'), findsOneWidget);
    });

    testWidgets('hides review count when null', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(home: Scaffold(body: StarRating(rating: 4.0))),
      );

      expect(find.textContaining('('), findsNothing);
    });
  });

  group('InteractiveStarRating', () {
    testWidgets('renders 5 stars', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: InteractiveStarRating(value: 3, onChanged: (_) {}),
          ),
        ),
      );

      final icons = find.byType(Icon);
      expect(icons, findsNWidgets(5));
    });

    testWidgets('tapping a star calls onChanged', (tester) async {
      int? tappedValue;
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: InteractiveStarRating(
              value: 2,
              onChanged: (v) => tappedValue = v,
            ),
          ),
        ),
      );

      // Tap the 4th star (index 3)
      final gestures = find.byType(GestureDetector);
      await tester.tap(gestures.at(3));
      expect(tappedValue, 4);
    });
  });
}
