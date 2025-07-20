import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/quiz_provider.dart';
import '../providers/auth_provider.dart';
import '../utils/constants.dart';

class SolvedQuizzesScreen extends StatefulWidget {
  const SolvedQuizzesScreen({super.key});

  @override
  State<SolvedQuizzesScreen> createState() => _SolvedQuizzesScreenState();
}

class _SolvedQuizzesScreenState extends State<SolvedQuizzesScreen> {
  @override
  void initState() {
    super.initState();
    _loadSolvedQuizzes();
  }

  Future<void> _loadSolvedQuizzes() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final quizProvider = Provider.of<QuizProvider>(context, listen: false);

    if (authProvider.user != null) {
      await quizProvider.fetchSolvedQuizzes(authProvider.user!['userId']);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Solved Quizzes'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        foregroundColor: AppColors.textPrimary,
      ),
      body: Consumer<QuizProvider>(
        builder: (context, quizProvider, child) {
          if (quizProvider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          final solvedQuizzes = quizProvider.solvedQuizzes ?? [];
          if (solvedQuizzes.isEmpty) {
            return Center(child: Text('No solved quizzes yet'));
          }

          return RefreshIndicator(
            onRefresh: _loadSolvedQuizzes,
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: solvedQuizzes.length,
              itemBuilder: (context, index) {
                final quiz = solvedQuizzes[index];
                return _buildSolvedQuizCard(quiz);
              },
            ),
          );
        },
      ),
    );
  }

  Widget _buildSolvedQuizCard(Map<String, dynamic> quiz) {
    final score = quiz['score'] ?? 0;
    final dateSolved = quiz['dateSolved'] ?? '';
    final topic = quiz['topic'] ?? 'Unknown';
    final difficulty = quiz['difficulty'] ?? 'Unknown';
    final title = quiz['title'] ?? 'Quiz';

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.textSecondary.withOpacity(0.1)),
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
              Expanded(
                child: Text(
                  title,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: _getDifficultyColor(difficulty).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  difficulty,
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: _getDifficultyColor(difficulty),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              const Icon(
                Icons.category_outlined,
                size: 16,
                color: AppColors.textSecondary,
              ),
              const SizedBox(width: 4),
              Text(
                topic,
                style: const TextStyle(
                  fontSize: 14,
                  color: AppColors.textSecondary,
                ),
              ),
              const Spacer(),
              const Icon(
                Icons.calendar_today_outlined,
                size: 16,
                color: AppColors.textSecondary,
              ),
              const SizedBox(width: 4),
              Text(
                _formatDate(dateSolved),
                style: const TextStyle(
                  fontSize: 14,
                  color: AppColors.textSecondary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: AppColors.success.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(
                      Icons.check_circle,
                      size: 16,
                      color: AppColors.success,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      'Score: $score',
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: AppColors.success,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Color _getDifficultyColor(String difficulty) {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return AppColors.success;
      case 'medium':
        return AppColors.warning;
      case 'hard':
        return AppColors.error;
      default:
        return AppColors.textSecondary;
    }
  }

  String _formatDate(String dateString) {
    if (dateString.isEmpty) return 'Unknown date';
    try {
      final date = DateTime.parse(dateString);
      return '${date.day}/${date.month}/${date.year}';
    } catch (e) {
      return 'Invalid date';
    }
  }
}
