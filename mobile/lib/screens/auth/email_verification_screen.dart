import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/auth_provider.dart';
import '../../core/constants/app_colors.dart';

class EmailVerificationScreen extends ConsumerStatefulWidget {
  final String? token;
  const EmailVerificationScreen({super.key, this.token});

  @override
  ConsumerState<EmailVerificationScreen> createState() =>
      _EmailVerificationScreenState();
}

class _EmailVerificationScreenState
    extends ConsumerState<EmailVerificationScreen> {
  bool _verified = false;
  bool _checking = false;
  bool _resent = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    if (widget.token != null) _verifyToken();
  }

  Future<void> _verifyToken() async {
    setState(() {
      _checking = true;
      _error = null;
    });
    final ok =
        await ref.read(authProvider.notifier).verifyEmail(widget.token!);
    if (mounted) {
      setState(() {
        _checking = false;
        _verified = ok;
        if (!ok) _error = 'Lien invalide ou expiré';
      });
    }
  }

  Future<void> _resend() async {
    final ok = await ref.read(authProvider.notifier).requestVerification();
    if (ok && mounted) setState(() => _resent = true);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Vérification email')),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: _checking
              ? const Center(
                  child:
                      CircularProgressIndicator(color: AppColors.rouge))
              : _verified
                  ? Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.verified,
                            size: 64, color: AppColors.vert),
                        const SizedBox(height: 16),
                        Text('Email vérifié !',
                            style:
                                Theme.of(context).textTheme.headlineMedium),
                        const SizedBox(height: 8),
                        Text(
                          'Votre adresse email a été vérifiée avec succès.',
                          textAlign: TextAlign.center,
                          style: Theme.of(context)
                              .textTheme
                              .bodyMedium
                              ?.copyWith(color: AppColors.gris),
                        ),
                        const SizedBox(height: 24),
                        ElevatedButton(
                          onPressed: () => context.go('/carte'),
                          child: const Text('Continuer'),
                        ),
                      ],
                    )
                  : Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.email_outlined,
                            size: 64, color: AppColors.or),
                        const SizedBox(height: 16),
                        Text('Vérifiez votre email',
                            style:
                                Theme.of(context).textTheme.headlineMedium),
                        const SizedBox(height: 8),
                        Text(
                          widget.token != null && _error != null
                              ? _error!
                              : 'Un email de vérification a été envoyé.\nCliquez sur le lien pour activer votre compte.',
                          textAlign: TextAlign.center,
                          style: Theme.of(context)
                              .textTheme
                              .bodyMedium
                              ?.copyWith(color: AppColors.gris),
                        ),
                        const SizedBox(height: 24),
                        if (_resent)
                          const Padding(
                            padding: EdgeInsets.only(bottom: 16),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.check_circle,
                                    size: 18, color: AppColors.vert),
                                SizedBox(width: 6),
                                Text('Email renvoyé',
                                    style: TextStyle(color: AppColors.vert)),
                              ],
                            ),
                          ),
                        OutlinedButton(
                          onPressed: _resend,
                          child: const Text('Renvoyer l\'email'),
                        ),
                        const SizedBox(height: 12),
                        TextButton(
                          onPressed: () => context.go('/carte'),
                          child: const Text('Plus tard'),
                        ),
                      ],
                    ),
        ),
      ),
    );
  }
}
