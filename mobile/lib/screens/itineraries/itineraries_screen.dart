import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
class ItinerariesScreen extends StatelessWidget {
  const ItinerariesScreen({super.key});
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('ItinerariesScreen')),
      body: const Center(child: Text('En construction', style: TextStyle(color: AppColors.gris))),
    );
  }
}
