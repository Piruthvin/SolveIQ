import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../utils/constants.dart';
import '../providers/auth_provider.dart';
import '../providers/profile_provider.dart';

class QuizSolveScreen extends StatefulWidget {
  final Map<String, dynamic> quiz;
  const QuizSolveScreen({required this.quiz, Key? key}) : super(key: key);

  @override
  State<QuizSolveScreen> createState() => _QuizSolveScreenState();
}

class _QuizSolveScreenState extends State<QuizSolveScreen> {
  String? selectedAnswer;
  String? resultMessage;
  String? explanation;
  bool isSubmitting = false;

  Future<void> submitAnswer() async {
    setState(() => isSubmitting = true);
    final token = Provider.of<AuthProvider>(context, listen: false).token;
    final userId = Provider.of<AuthProvider>(context, listen: false).user?['userId'];
    final response = await http.post(
      Uri.parse('${ApiEndpoints.quiz}/solve'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({
        'userId': userId,
        'quizId': widget.quiz['id'],
        'answer': selectedAnswer,
      }),
    );
    setState(() => isSubmitting = false);
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      setState(() {
        resultMessage = data['correct'] ? 'Correct!' : 'Incorrect!';
        // Only set explanation if answer is correct (explanation will be null for incorrect answers)
        explanation = data['correct'] ? data['explanation'] : null;
      });
      
      // Refresh profile data to update streak and stats
      if (data['correct']) {
        print("=== FRONTEND DEBUG: Answer is correct, refreshing profile ===");
        final profileProvider = Provider.of<ProfileProvider>(context, listen: false);
        final userId = Provider.of<AuthProvider>(context, listen: false).user?['userId'];
        if (userId != null) {
          print("Fetching profile for user ID: $userId");
          await profileProvider.fetchUserProfile(userId, context: context);
          print("Profile fetched. Current streak: ${profileProvider.userProfile?['currentStreak']}");
        } else {
          print("User ID is null");
        }
      } else {
        print("=== FRONTEND DEBUG: Answer is incorrect, no profile refresh ===");
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final options = [
      widget.quiz['option1'],
      widget.quiz['option2'],
      widget.quiz['option3'],
      widget.quiz['option4'],
    ];
    return Scaffold(
      appBar: AppBar(title: Text('Solve Quiz')),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(widget.quiz['question'], style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 24),
            ...options.map((opt) => RadioListTile<String>(
              value: opt,
              groupValue: selectedAnswer,
              onChanged: (val) => setState(() => selectedAnswer = val),
              title: Text(opt ?? ''),
            )),
            const SizedBox(height: 16),
            if (resultMessage != null)
              Text(resultMessage!, style: TextStyle(fontSize: 18, color: resultMessage == 'Correct!' ? Colors.green : Colors.red)),
            if (explanation != null)
              Padding(
                padding: const EdgeInsets.only(top: 8),
                child: Text('Explanation: $explanation', style: TextStyle(fontSize: 16)),
              ),
            const Spacer(),
            ElevatedButton(
              onPressed: isSubmitting ? null : submitAnswer,
              child: isSubmitting ? CircularProgressIndicator() : Text('Submit'),
            ),
          ],
        ),
      ),
    );
  }
} 