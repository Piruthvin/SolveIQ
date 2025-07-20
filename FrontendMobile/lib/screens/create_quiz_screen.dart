import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../utils/constants.dart';
import '../providers/auth_provider.dart';
import '../providers/quiz_provider.dart';

class CreateQuizScreen extends StatefulWidget {
  @override
  _CreateQuizScreenState createState() => _CreateQuizScreenState();
}

class _CreateQuizScreenState extends State<CreateQuizScreen> {
  final _formKey = GlobalKey<FormState>();
  String topic = '';
  String question = '';
  String option1 = '';
  String option2 = '';
  String option3 = '';
  String option4 = '';
  String correctAnswer = '';
  String explanation = '';
  String knowledgeLevel = 'EASY';
  String message = '';
  bool isLoading = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Create Quiz'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextFormField(
                decoration: const InputDecoration(labelText: 'Topic'),
                onChanged: (val) => topic = val,
                validator: (val) => val == null || val.isEmpty ? 'Required' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                decoration: const InputDecoration(labelText: 'Question'),
                onChanged: (val) => question = val,
                validator: (val) => val == null || val.isEmpty ? 'Required' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                decoration: const InputDecoration(labelText: 'Option 1'),
                onChanged: (val) => option1 = val,
                validator: (val) => val == null || val.isEmpty ? 'Required' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                decoration: const InputDecoration(labelText: 'Option 2'),
                onChanged: (val) => option2 = val,
                validator: (val) => val == null || val.isEmpty ? 'Required' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                decoration: const InputDecoration(labelText: 'Option 3'),
                onChanged: (val) => option3 = val,
                validator: (val) => val == null || val.isEmpty ? 'Required' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                decoration: const InputDecoration(labelText: 'Option 4'),
                onChanged: (val) => option4 = val,
                validator: (val) => val == null || val.isEmpty ? 'Required' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                decoration: const InputDecoration(labelText: 'Correct Answer'),
                onChanged: (val) => correctAnswer = val,
                validator: (val) => val == null || val.isEmpty ? 'Required' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                decoration: const InputDecoration(labelText: 'Explanation'),
                onChanged: (val) => explanation = val,
                validator: (val) => val == null || val.isEmpty ? 'Required' : null,
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                value: knowledgeLevel,
                items: const [
                  DropdownMenuItem(value: 'EASY', child: Text('Easy')),
                  DropdownMenuItem(value: 'MEDIUM', child: Text('Medium')),
                  DropdownMenuItem(value: 'HARD', child: Text('Hard')),
                ],
                onChanged: (val) => setState(() => knowledgeLevel = val!),
                decoration: const InputDecoration(labelText: 'Knowledge Level'),
              ),
              if (message.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.only(top: 12),
                  child: Text(
                    message,
                    style: TextStyle(color: message.contains('created') ? Colors.green : Colors.red),
                  ),
                ),
              const SizedBox(height: 24),
              isLoading
                  ? const CircularProgressIndicator()
                  : Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        TextButton(
                          onPressed: () => Navigator.pop(context),
                          child: const Text('Cancel'),
                        ),
                        ElevatedButton(
                          onPressed: () async {
                            if (_formKey.currentState!.validate()) {
                              setState(() => isLoading = true);
                              final token = Provider.of<AuthProvider>(context, listen: false).token;
                              final response = await http.post(
                                Uri.parse('${ApiEndpoints.quiz}/create'),
                                headers: {
                                  'Content-Type': 'application/json',
                                  'Authorization': 'Bearer $token',
                                },
                                body: jsonEncode({
                                  'topic': topic,
                                  'question': question,
                                  'option1': option1,
                                  'option2': option2,
                                  'option3': option3,
                                  'option4': option4,
                                  'correctAnswer': correctAnswer,
                                  'explanation': explanation,
                                  'knowledgeLevel': knowledgeLevel,
                                }),
                              );
                              setState(() => isLoading = false);
                              if (response.statusCode == 200) {
                                setState(() => message = 'Quiz created!');
                                if (mounted) {
                                  final quizProvider = Provider.of<QuizProvider>(context, listen: false);
                                  await quizProvider.fetchQuizzes();
                                }
                                Navigator.pop(context);
                              } else {
                                setState(() => message = 'Failed to create quiz');
                              }
                            }
                          },
                          child: const Text('Create'),
                        ),
                      ],
                    ),
            ],
          ),
        ),
      ),
    );
  }
} 