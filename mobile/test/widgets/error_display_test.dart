import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:faso_trip/widgets/common/error_display.dart';

void main() {
  group('ErrorDisplay', () {
    testWidgets('shows error message', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(body: ErrorDisplay(message: 'Something went wrong')),
        ),
      );

      expect(find.text('Something went wrong'), findsOneWidget);
      expect(find.byIcon(Icons.error_outline), findsOneWidget);
    });

    testWidgets('shows retry button when onRetry provided', (tester) async {
      bool retried = false;
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ErrorDisplay(
              message: 'Network error',
              onRetry: () => retried = true,
            ),
          ),
        ),
      );

      expect(find.text('Réessayer'), findsOneWidget);
      await tester.tap(find.text('Réessayer'));
      expect(retried, true);
    });

    testWidgets('hides retry button when onRetry is null', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(body: ErrorDisplay(message: 'Error')),
        ),
      );

      expect(find.text('Réessayer'), findsNothing);
    });
  });

  group('EmptyState', () {
    testWidgets('shows icon and title', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: EmptyState(icon: Icons.inbox, title: 'Aucun résultat'),
          ),
        ),
      );

      expect(find.byIcon(Icons.inbox), findsOneWidget);
      expect(find.text('Aucun résultat'), findsOneWidget);
    });

    testWidgets('shows subtitle when provided', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: EmptyState(
              icon: Icons.inbox,
              title: 'Vide',
              subtitle: 'Essayez autre chose',
            ),
          ),
        ),
      );

      expect(find.text('Essayez autre chose'), findsOneWidget);
    });
  });
}
