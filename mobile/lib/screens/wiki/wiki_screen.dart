import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
class WikiScreen extends StatelessWidget {
  const WikiScreen({super.key});
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('WikiScreen')),
      body: const Center(child: Text('En construction', style: TextStyle(color: AppColors.gris))),
    );
  }
}
