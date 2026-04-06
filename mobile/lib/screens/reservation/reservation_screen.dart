import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
class ReservationScreen extends StatelessWidget {
  const ReservationScreen({super.key});
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('ReservationScreen')),
      body: const Center(child: Text('En construction', style: TextStyle(color: AppColors.gris))),
    );
  }
}
