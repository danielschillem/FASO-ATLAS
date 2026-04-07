import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants/app_colors.dart';

class HomeScreen extends StatelessWidget {
  final Widget child;
  const HomeScreen({super.key, required this.child});

  static const _tabs = [
    _Tab(icon: Icons.map_outlined,         label: 'Carte',         route: '/carte'),
    _Tab(icon: Icons.place_outlined,       label: 'Destinations',  route: '/destinations'),
    _Tab(icon: Icons.route_outlined,       label: 'Itinéraires',   route: '/itineraires'),
    _Tab(icon: Icons.hotel_outlined,       label: 'Réservation',   route: '/reservation'),
    _Tab(icon: Icons.person_outline,       label: 'Profil',        route: '/profil'),
  ];

  int _tabIndex(String location) {
    for (var i = 0; i < _tabs.length; i++) {
      if (location.startsWith(_tabs[i].route)) return i;
    }
    return 0;
  }

  @override
  Widget build(BuildContext context) {
    final location = GoRouterState.of(context).uri.toString();
    final current = _tabIndex(location);

    return Scaffold(
      body: child,
      bottomNavigationBar: NavigationBar(
        backgroundColor: AppColors.nuit,
        indicatorColor: AppColors.rouge.withValues(alpha: 0.2),
        selectedIndex: current,
        labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
        onDestinationSelected: (i) => context.go(_tabs[i].route),
        destinations: _tabs.map((tab) => NavigationDestination(
          icon: Icon(tab.icon, color: AppColors.gris),
          selectedIcon: Icon(tab.icon, color: AppColors.orVif),
          label: tab.label,
        )).toList(),
      ),
    );
  }
}

class _Tab {
  final IconData icon;
  final String label;
  final String route;
  const _Tab({required this.icon, required this.label, required this.route});
}
