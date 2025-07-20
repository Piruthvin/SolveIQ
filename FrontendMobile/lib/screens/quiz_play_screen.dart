import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/quiz_provider.dart';
import '../providers/auth_provider.dart';
import '../utils/constants.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'quiz_solve_screen.dart';

class QuizPlayScreen extends StatefulWidget {
  const QuizPlayScreen({super.key});

  @override
  State<QuizPlayScreen> createState() => _QuizPlayScreenState();
}

class _QuizPlayScreenState extends State<QuizPlayScreen> {
  String? selectedTopic;
  String? selectedKnowledgeLevel;
  List<String> topics = [];
  final List<String> knowledgeLevels = ['EASY', 'MEDIUM', 'HARD'];

  @override
  void initState() {
    super.initState();
    // Check if we have random quizzes loaded, if not fetch regular quizzes
    final quizProvider = Provider.of<QuizProvider>(context, listen: false);
    if (quizProvider.quizzes.isEmpty) {
      _fetchTopicsAndQuizzes();
    }
  }

  Future<void> _fetchTopicsAndQuizzes() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final quizProvider = Provider.of<QuizProvider>(context, listen: false);
    final token = authProvider.token ?? '';
    final userId = authProvider.user?['userId'];
    if (userId == null || token.isEmpty) return;
    // Fetch topics from stats endpoint
    final response = await http.get(
      Uri.parse('${ApiEndpoints.baseUrl}/stats/home?userId=$userId'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );
    if (response.statusCode == 200) {
      final stats = jsonDecode(response.body);
      setState(() {
        topics = List<String>.from(stats['topics'] ?? []);
      });
    }
    // Fetch all quizzes
    await quizProvider.fetchQuizList(userId: userId, token: token);
  }

  Future<void> _onFilterChanged() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final quizProvider = Provider.of<QuizProvider>(context, listen: false);
    final token = authProvider.token ?? '';
    final userId = authProvider.user?['userId'];
    if (userId == null || token.isEmpty) return;
    await quizProvider.fetchQuizList(
      topic: selectedTopic,
      knowledgeLevel: selectedKnowledgeLevel,
      userId: userId,
      token: token,
    );
  }

  @override
  Widget build(BuildContext context) {
    final quizProvider = Provider.of<QuizProvider>(context);
    final quizList = quizProvider.quizList;
    final randomQuizzes = quizProvider.quizzes;
    
    // Determine which quizzes to show
    final quizzesToShow = randomQuizzes.isNotEmpty ? randomQuizzes : quizList;
    final isRandomQuizzes = randomQuizzes.isNotEmpty;
    
    return Scaffold(
      appBar: AppBar(
        title: Text(isRandomQuizzes ? 'Random Unsolved Quizzes' : 'Quiz'),
        actions: [
          if (isRandomQuizzes)
            IconButton(
              icon: const Icon(Icons.refresh),
              onPressed: () {
                // Clear random quizzes and go back to regular quiz list
                quizProvider.clearRandomQuizzes();
                _fetchTopicsAndQuizzes();
              },
              tooltip: 'Back to All Quizzes',
            ),
        ],
      ),
      body: Column(
        children: [
          if (!isRandomQuizzes) // Only show filters for regular quiz list
            Card(
              margin: const EdgeInsets.all(12),
              elevation: 2,
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  children: [
                    DropdownButtonFormField<String>(
                      value: selectedKnowledgeLevel,
                      hint: const Text('Filter by Knowledge Level'),
                      items: [
                        const DropdownMenuItem(value: null, child: Text('All Levels')),
                        ...knowledgeLevels.map((k) => DropdownMenuItem(value: k, child: Text(k))).toList(),
                      ],
                      onChanged: (val) {
                        setState(() => selectedKnowledgeLevel = val);
                        _onFilterChanged();
                      },
                      isExpanded: true,
                    ),
                    const SizedBox(height: 12),
                    DropdownButtonFormField<String>(
                      value: selectedTopic,
                      hint: const Text('Filter by Topic'),
                      items: [
                        const DropdownMenuItem(value: null, child: Text('All Topics')),
                        ...topics.map((t) => DropdownMenuItem(value: t, child: Text(t))).toList(),
                      ],
                      onChanged: (val) {
                        setState(() => selectedTopic = val);
                        _onFilterChanged();
                      },
                      isExpanded: true,
                    ),
                  ],
                ),
              ),
            ),
          if (isRandomQuizzes)
            Container(
              margin: const EdgeInsets.all(12),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.accent.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.accent.withOpacity(0.3)),
              ),
              child: Row(
                children: [
                  Icon(Icons.shuffle, color: AppColors.accent),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      '${randomQuizzes.length} random unsolved quizzes selected for you!',
                      style: TextStyle(
                        color: AppColors.textPrimary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          Expanded(
            child: quizProvider.isLoading
                ? const Center(child: CircularProgressIndicator())
                : quizzesToShow.isEmpty
                    ? const Center(child: Text('No quizzes available.'))
                    : ListView.builder(
                        itemCount: quizzesToShow.length,
                        itemBuilder: (context, index) {
                          final quiz = quizzesToShow[index];
                          return Card(
                            margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            elevation: 3,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            child: ListTile(
                              leading: CircleAvatar(
                                backgroundColor: isRandomQuizzes ? Colors.blue : (quiz['status'] == 'Solved' ? Colors.green : Colors.orange),
                                child: Text(
                                  isRandomQuizzes ? (index + 1).toString() : quiz['questionNumber'].toString(),
                                  style: const TextStyle(color: Colors.white),
                                ),
                              ),
                              title: Text(quiz['question'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold)),
                              subtitle: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text('Topic: ${quiz['topic'] ?? ''}'),
                                  Text('Level: ${quiz['knowledgeLevel'] ?? ''}'),
                                ],
                              ),
                              trailing: isRandomQuizzes
                                  ? Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                      decoration: BoxDecoration(
                                        color: Colors.blue,
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      child: const Text(
                                        'Unsolved',
                                        style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                                      ),
                                    )
                                  : Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                      decoration: BoxDecoration(
                                        color: quiz['status'] == 'Solved' ? Colors.green : Colors.orange,
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      child: Text(
                                        quiz['status'],
                                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                                      ),
                                    ),
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => QuizSolveScreen(quiz: quiz),
                                  ),
                                );
                              },
                            ),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }
}