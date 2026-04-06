import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants/app_colors.dart';
import '../../core/network/dio_client.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _navigate();
  }

  Future<void> _navigate() async {
    await Future.delayed(const Duration(milliseconds: 1800));
    if (!mounted) return;
    final token = await DioClient.getToken();
    context.go(token != null ? '/carte' : '/carte');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.nuit,
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Logo
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: AppColors.or, width: 2),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(height: 12, width: 40, color: AppColors.rouge),
                  Container(height: 12, width: 40, color: AppColors.vert),
                ],
              ),
            ),
            const SizedBox(height: 24),
            Text(
              'Faso Atlas',
              style: Theme.of(context).textTheme.displayMedium?.copyWith(
                color: AppColors.blanc,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Pays des Hommes Intègres',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: AppColors.gris,
                letterSpacing: 1.5,
              ),
            ),
            const SizedBox(height: 48),
            const CircularProgressIndicator(
              color: AppColors.or,
              strokeWidth: 2,
            ),
          ],
        ),
      ),
    );
  }
}
