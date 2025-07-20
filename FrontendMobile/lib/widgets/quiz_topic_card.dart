import 'package:flutter/material.dart';
import '../utils/constants.dart';

class QuizTopicCard extends StatelessWidget {
  final String title;
  final int totalQuizzes;
  final int solvedQuizzes;
  final VoidCallback onTap;

  const QuizTopicCard({
    super.key,
    required this.title,
    required this.totalQuizzes,
    required this.solvedQuizzes,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final progress = totalQuizzes > 0 ? solvedQuizzes / totalQuizzes : 0.0;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: AppColors.textSecondary.withOpacity(0.1),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(
                    _getTopicIcon(title),
                    color: AppColors.primary,
                    size: 20,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    title,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimary,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '$solvedQuizzes/$totalQuizzes',
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Solved quizzes',
                        style: TextStyle(
                          fontSize: 12,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: AppColors.success.withOpacity(0.1),
                  ),
                  child: Center(
                    child: Text(
                      '${(progress * 100).toInt()}%',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: AppColors.success,
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            LinearProgressIndicator(
              value: progress,
              backgroundColor: AppColors.textSecondary.withOpacity(0.2),
              valueColor: AlwaysStoppedAnimation<Color>(AppColors.success),
            ),
          ],
        ),
      ),
    );
  }

  IconData _getTopicIcon(String topic) {
    switch (topic.toLowerCase()) {
      case 'algorithms':
        return Icons.functions;
      case 'data structures':
        return Icons.account_tree;
      case 'database':
        return Icons.storage;
      case 'system design':
        return Icons.architecture;
      case 'frontend':
        return Icons.web;
      case 'backend':
        return Icons.dns;
      case 'devops':
        return Icons.cloud;
      case 'mobile':
        return Icons.phone_android;
      default:
        return Icons.quiz;
    }
  }
}
