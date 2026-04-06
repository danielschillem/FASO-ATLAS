import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants/app_colors.dart';
import '../../core/network/dio_client.dart';
import '../../core/constants/api_endpoints.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});
  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _firstCtrl    = TextEditingController();
  final _lastCtrl     = TextEditingController();
  final _emailCtrl    = TextEditingController();
  final _passwordCtrl = TextEditingController();
  bool _loading = false;

  Future<void> _register() async {
    setState(() => _loading = true);
    try {
      final res = await DioClient.instance.post(ApiEndpoints.register, data: {
        'firstName': _firstCtrl.text.trim(),
        'lastName':  _lastCtrl.text.trim(),
        'email':     _emailCtrl.text.trim(),
        'password':  _passwordCtrl.text,
      });
      await DioClient.setToken(res.data['accessToken']);
      if (mounted) context.go('/carte');
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Erreur lors de l\'inscription')),
      );
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.nuit,
      appBar: AppBar(title: const Text('Créer un compte')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            TextField(controller: _firstCtrl, decoration: const InputDecoration(hintText: 'Prénom')),
            const SizedBox(height: 16),
            TextField(controller: _lastCtrl, decoration: const InputDecoration(hintText: 'Nom')),
            const SizedBox(height: 16),
            TextField(controller: _emailCtrl, decoration: const InputDecoration(hintText: 'Email'), keyboardType: TextInputType.emailAddress),
            const SizedBox(height: 16),
            TextField(controller: _passwordCtrl, decoration: const InputDecoration(hintText: 'Mot de passe (8+ caractères)'), obscureText: true),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _loading ? null : _register,
                child: _loading ? const CircularProgressIndicator(color: Colors.white, strokeWidth: 2) : const Text('S\'inscrire'),
              ),
            ),
            TextButton(onPressed: () => context.go('/login'), child: const Text('J\'ai déjà un compte', style: TextStyle(color: AppColors.or))),
          ],
        ),
      ),
    );
  }
}
