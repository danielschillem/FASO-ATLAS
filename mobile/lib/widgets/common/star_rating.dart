import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';

class StarRating extends StatelessWidget {
  final double rating;
  final double size;
  final int? reviewCount;

  const StarRating({super.key, required this.rating, this.size = 16, this.reviewCount});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        ...List.generate(5, (i) {
          final fill = rating - i;
          return Icon(
            fill >= 1 ? Icons.star_rounded : (fill >= 0.5 ? Icons.star_half_rounded : Icons.star_outline_rounded),
            color: AppColors.or,
            size: size,
          );
        }),
        if (reviewCount != null) ...[
          const SizedBox(width: 4),
          Text('($reviewCount)', style: TextStyle(fontSize: size * 0.7, color: AppColors.gris)),
        ],
      ],
    );
  }
}

class InteractiveStarRating extends StatelessWidget {
  final int value;
  final ValueChanged<int> onChanged;
  final double size;

  const InteractiveStarRating({
    super.key,
    required this.value,
    required this.onChanged,
    this.size = 32,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(5, (i) {
        final star = i + 1;
        return GestureDetector(
          onTap: () => onChanged(star),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 2),
            child: Icon(
              star <= value ? Icons.star_rounded : Icons.star_outline_rounded,
              color: AppColors.or,
              size: size,
            ),
          ),
        );
      }),
    );
  }
}
