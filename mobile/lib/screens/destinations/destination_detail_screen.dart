import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
class DestinationDetailScreen extends StatelessWidget {
    final String slug;
    const DestinationDetailScreen({super.key, required this.slug});
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('DestinationDetailScreen')),
      body: const Center(child: Text('En construction', style: TextStyle(color: AppColors.gris))),
    );
  }
}
