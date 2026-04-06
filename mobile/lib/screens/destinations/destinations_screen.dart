import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
class DestinationsScreen extends StatelessWidget {
  const DestinationsScreen({super.key});
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('DestinationsScreen')),
      body: const Center(child: Text('En construction', style: TextStyle(color: AppColors.gris))),
    );
  }
}
