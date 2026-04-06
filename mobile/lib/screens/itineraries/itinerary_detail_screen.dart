import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
class ItineraryDetailScreen extends StatelessWidget {
    final int id;
    const ItineraryDetailScreen({super.key, required this.id});
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('ItineraryDetailScreen')),
      body: const Center(child: Text('En construction', style: TextStyle(color: AppColors.gris))),
    );
  }
}
