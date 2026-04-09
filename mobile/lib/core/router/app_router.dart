import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../screens/splash/splash_screen.dart';
import '../../screens/auth/login_screen.dart';
import '../../screens/auth/register_screen.dart';
import '../../screens/auth/forgot_password_screen.dart';
import '../../screens/auth/reset_password_screen.dart';
import '../../screens/auth/email_verification_screen.dart';
import '../../screens/home/home_screen.dart';
import '../../screens/map/map_screen.dart';
import '../../screens/destinations/destinations_screen.dart';
import '../../screens/destinations/destination_detail_screen.dart';
import '../../screens/itineraries/itineraries_screen.dart';
import '../../screens/itineraries/itinerary_detail_screen.dart';
import '../../screens/reservation/reservation_screen.dart';
import '../../screens/atlas/atlas_screen.dart';
import '../../screens/wiki/wiki_screen.dart';
import '../../screens/wiki/wiki_article_screen.dart';
import '../../screens/symbols/symbols_screen.dart';
import '../../screens/profile/profile_screen.dart';
import '../../screens/search/search_screen.dart';
import '../../screens/favorites/favorites_screen.dart';
import '../../screens/notifications/notifications_screen.dart';

final appRouter = GoRouter(
  initialLocation: '/splash',
  routes: [
    GoRoute(
      path: '/splash',
      builder: (_, __) => const SplashScreen(),
    ),
    GoRoute(
      path: '/login',
      builder: (_, __) => const LoginScreen(),
    ),
    GoRoute(
      path: '/register',
      builder: (_, __) => const RegisterScreen(),
    ),
    GoRoute(
      path: '/forgot-password',
      builder: (_, __) => const ForgotPasswordScreen(),
    ),
    GoRoute(
      path: '/reset-password/:token',
      builder: (_, state) => ResetPasswordScreen(
        token: state.pathParameters['token']!,
      ),
    ),
    GoRoute(
      path: '/verify-email',
      builder: (_, state) => EmailVerificationScreen(
        token: state.uri.queryParameters['token'],
      ),
    ),
    ShellRoute(
      builder: (context, state, child) => HomeScreen(child: child),
      routes: [
        GoRoute(
          path: '/carte',
          builder: (_, __) => const MapScreen(),
        ),
        GoRoute(
          path: '/destinations',
          builder: (_, __) => const DestinationsScreen(),
          routes: [
            GoRoute(
              path: ':slug',
              builder: (_, state) => DestinationDetailScreen(
                slug: state.pathParameters['slug']!,
              ),
            ),
          ],
        ),
        GoRoute(
          path: '/itineraires',
          builder: (_, __) => const ItinerariesScreen(),
          routes: [
            GoRoute(
              path: ':id',
              builder: (_, state) => ItineraryDetailScreen(
                id: int.parse(state.pathParameters['id']!),
              ),
            ),
          ],
        ),
        GoRoute(
          path: '/reservation',
          builder: (_, __) => const ReservationScreen(),
        ),
        GoRoute(
          path: '/atlas',
          builder: (_, __) => const AtlasScreen(),
        ),
        GoRoute(
          path: '/wiki',
          builder: (_, __) => const WikiScreen(),
          routes: [
            GoRoute(
              path: ':slug',
              builder: (_, state) => WikiArticleScreen(
                slug: state.pathParameters['slug']!,
              ),
            ),
          ],
        ),
        GoRoute(
          path: '/symboles',
          builder: (_, __) => const SymbolsScreen(),
        ),
        GoRoute(
          path: '/profil',
          builder: (_, __) => const ProfileScreen(),
        ),
        GoRoute(
          path: '/recherche',
          builder: (_, __) => const SearchScreen(),
        ),
        GoRoute(
          path: '/favoris',
          builder: (_, __) => const FavoritesScreen(),
        ),
        GoRoute(
          path: '/notifications',
          builder: (_, __) => const NotificationsScreen(),
        ),
      ],
    ),
  ],
  errorBuilder: (context, state) => Scaffold(
    body: Center(child: Text('Page non trouvée: ${state.uri}')),
  ),
);
