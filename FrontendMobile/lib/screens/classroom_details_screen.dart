import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../utils/constants.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';

class ClassroomDetailsScreen extends StatefulWidget {
  const ClassroomDetailsScreen({super.key});

  @override
  State<ClassroomDetailsScreen> createState() => _ClassroomDetailsScreenState();
}

class _ClassroomDetailsScreenState extends State<ClassroomDetailsScreen> {
  Map<String, dynamic>? classroom;
  bool isLoading = true;
  int? classroomId;
  bool isOwner = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final args = ModalRoute.of(context)?.settings.arguments as Map<String, dynamic>?;
    if (args != null) {
      classroomId = args['classroomId'] as int?;
      isOwner = args['isOwner'] == true;
      if (classroomId != null) {
        fetchClassroomDetails();
      } else {
        setState(() {
          isLoading = false;
        });
      }
    } else {
      setState(() {
        isLoading = false;
      });
    }
  }

  Future<void> fetchClassroomDetails() async {
    setState(() { isLoading = true; });
    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final token = authProvider.token;
      final url = Uri.parse('${ApiEndpoints.classroom}/${classroomId}');
      final response = await http.get(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );
      if (response.statusCode == 200) {
        setState(() {
          classroom = json.decode(response.body);
          isLoading = false;
        });
      } else {
        setState(() { isLoading = false; });
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Failed to load classroom details: ${response.statusCode}'),
              backgroundColor: AppColors.error,
            ),
          );
        }
      }
    } catch (e) {
      setState(() { isLoading = false; });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error loading classroom details: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(classroom?['name'] ?? classroom?['title'] ?? 'Classroom Details'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        foregroundColor: AppColors.textPrimary,
        actions: [
          if (isOwner)
            IconButton(
              icon: const Icon(Icons.edit),
              onPressed: () {
                // TODO: Implement edit classroom
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Edit feature coming soon!')),
                );
              },
            ),
        ],
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : classroom == null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.error_outline, size: 64, color: AppColors.error),
                      const SizedBox(height: 16),
                      const Text(
                        'Failed to load classroom details',
                        style: TextStyle(fontSize: 18, color: AppColors.textPrimary),
                      ),
                      const SizedBox(height: 8),
                      ElevatedButton(
                        onPressed: fetchClassroomDetails,
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: fetchClassroomDetails,
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: AppColors.surface,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: AppColors.textSecondary.withOpacity(0.1)),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                classroom!['name'] ?? classroom!['title'] ?? 'Classroom',
                                style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'Code: ${classroom!['code'] ?? 'N/A'}',
                                style: const TextStyle(fontSize: 16, color: AppColors.textSecondary),
                              ),
                              if (classroom!['description'] != null && classroom!['description'].isNotEmpty) ...[
                                const SizedBox(height: 8),
                                Text(
                                  classroom!['description'],
                                  style: const TextStyle(fontSize: 14, color: AppColors.textSecondary),
                                ),
                              ],
                            ],
                          ),
                        ),
                        const SizedBox(height: 16),
                      Text(
                        'Actions',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: AppColors.textPrimary),
                      ),
                      const SizedBox(height: 12),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: [
                          if (isOwner) ...[
                            ElevatedButton.icon(
                              icon: const Icon(Icons.person_add, size: 18),
                              label: const Text('Add Students'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.primary,
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                              ),
                              onPressed: () => _showAddStudentsDialog(),
                            ),
                            ElevatedButton.icon(
                              icon: const Icon(Icons.quiz, size: 18),
                              label: const Text('Generate Quiz'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.accent,
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                              ),
                              onPressed: () => _showGenerateQuizDialog(),
                            ),
                            ElevatedButton.icon(
                              icon: const Icon(Icons.remove_circle, size: 18),
                              label: const Text('Remove Student'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.error,
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                              ),
                              onPressed: () => _showRemoveStudentDialog(),
                            ),
                          ],
                          ElevatedButton.icon(
                            icon: const Icon(Icons.leaderboard, size: 18),
                            label: const Text('View Leaderboard'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.info,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                            ),
                            onPressed: () => _showLeaderboardDialog(),
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),
                      Text(
                        'Students (${(classroom!['students'] as List?)?.length ?? 0})',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: AppColors.textPrimary),
                      ),
                      const SizedBox(height: 12),
                      if (classroom!['students'] == null || (classroom!['students'] as List).isEmpty)
                        Container(
                          padding: const EdgeInsets.all(32),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(Icons.people_outline, size: 64, color: AppColors.textSecondary),
                              const SizedBox(height: 16),
                              const Text(
                                'No students in this classroom',
                                style: TextStyle(fontSize: 16, color: AppColors.textSecondary),
                              ),
                              if (isOwner) ...[
                                const SizedBox(height: 8),
                                const Text(
                                  'Add students to get started',
                                  style: TextStyle(fontSize: 14, color: AppColors.textSecondary),
                                ),
                              ],
                            ],
                          ),
                        )
                      else
                        ...(classroom!['students'] as List).map<Widget>((student) => Card(
                          margin: const EdgeInsets.only(bottom: 8),
                          child: ListTile(
                            leading: CircleAvatar(
                              backgroundColor: AppColors.primary.withOpacity(0.1),
                              child: Text(
                                (student['name'] ?? 'S')[0].toUpperCase(),
                                style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold),
                              ),
                            ),
                            title: Text(
                              student['name'] ?? 'Student',
                              style: const TextStyle(fontWeight: FontWeight.w600),
                            ),
                            subtitle: Text(student['email'] ?? ''),
                            trailing: isOwner
                                ? IconButton(
                                    icon: const Icon(Icons.remove_circle, color: AppColors.error),
                                    onPressed: () => _removeStudent(student['id']),
                                    tooltip: 'Remove student',
                                  )
                                : null,
                          ),
                        )).toList(),
                      const SizedBox(height: 24),
                      Text(
                        'Quizzes (${(classroom!['quizzes'] as List?)?.length ?? 0})',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: AppColors.textPrimary),
                      ),
                      const SizedBox(height: 12),
                      if (classroom!['quizzes'] == null || (classroom!['quizzes'] as List).isEmpty)
                        Container(
                          padding: const EdgeInsets.all(32),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(Icons.quiz_outlined, size: 64, color: AppColors.textSecondary),
                              const SizedBox(height: 16),
                              const Text(
                                'No quizzes in this classroom',
                                style: TextStyle(fontSize: 16, color: AppColors.textSecondary),
                              ),
                              if (isOwner) ...[
                                const SizedBox(height: 8),
                                const Text(
                                  'Create quizzes to test your students',
                                  style: TextStyle(fontSize: 14, color: AppColors.textSecondary),
                                ),
                              ],
                            ],
                          ),
                        )
                      else
                        ...(classroom!['quizzes'] as List).map<Widget>((quiz) => Card(
                          margin: const EdgeInsets.only(bottom: 8),
                          child: ListTile(
                            leading: CircleAvatar(
                              backgroundColor: AppColors.accent.withOpacity(0.1),
                              child: Icon(Icons.quiz, color: AppColors.accent),
                            ),
                            title: Text(
                              quiz['title'] ?? 'Quiz',
                              style: const TextStyle(fontWeight: FontWeight.w600),
                            ),
                            subtitle: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('Difficulty: ${quiz['difficulty'] ?? 'Easy'}'),
                                Text('Questions: ${(quiz['questions'] as List?)?.length ?? 0}'),
                                Text('Created: ${_formatDate(quiz['createdAt'])}'),
                              ],
                            ),
                            trailing: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                if (isOwner)
                                  IconButton(
                                    icon: const Icon(Icons.edit, color: AppColors.primary),
                                    onPressed: () => _editQuiz(quiz),
                                    tooltip: 'Edit quiz',
                                  ),
                                if (isOwner)
                                  IconButton(
                                    icon: const Icon(Icons.delete, color: AppColors.error),
                                    onPressed: () => _deleteQuiz(quiz),
                                    tooltip: 'Delete quiz',
                                  ),
                                ElevatedButton(
                                  onPressed: () => _startQuiz(quiz),
                                  child: const Text('Start'),
                                ),
                              ],
                            ),
                          ),
                        )).toList(),
                    ],
                  ),
                ),
              ),
    );
  }

  void _showAddStudentsDialog() {
    final emailController = TextEditingController();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Add Students'),
        content: TextField(
          controller: emailController,
          decoration: const InputDecoration(
            labelText: 'Student Email(s)',
            hintText: 'Enter comma-separated emails',
            border: OutlineInputBorder(),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              final emails = emailController.text.split(',').map((e) => e.trim()).where((e) => e.isNotEmpty).toList();
              if (emails.isNotEmpty) {
                try {
                  final authProvider = Provider.of<AuthProvider>(context, listen: false);
                  final token = authProvider.token;
                  final url = Uri.parse('${ApiEndpoints.classroom}/${classroomId}/add-students');
                  final response = await http.post(
                    url,
                    body: json.encode({'emails': emails}),
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': 'Bearer $token',
                    },
                  );
                  if (response.statusCode == 200) {
                    await fetchClassroomDetails();
                    if (mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Students added successfully!'),
                          backgroundColor: AppColors.success,
                        ),
                      );
                    }
                  } else {
                    if (mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text('Failed to add students: ${response.statusCode}'),
                          backgroundColor: AppColors.error,
                        ),
                      );
                    }
                  }
                } catch (e) {
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Error adding students: $e'),
                        backgroundColor: AppColors.error,
                      ),
                    );
                  }
                }
              }
              Navigator.pop(context);
            },
            child: const Text('Add'),
          ),
        ],
      ),
    );
  }

  void _showGenerateQuizDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Create Manual Quiz'),
        content: const Text('Choose how you want to create the quiz:'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _showManualQuizDialog();
            },
            child: const Text('Manual Quiz'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _showAutoGenerateDialog();
            },
            child: const Text('Auto Generate'),
          ),
        ],
      ),
    );
  }

  void _showManualQuizDialog() {
    final titleController = TextEditingController();
    final difficultyController = TextEditingController(text: 'Easy');
    List<Map<String, dynamic>> questions = [];
    
    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          title: const Text('Create Manual Quiz'),
          content: SizedBox(
            width: double.maxFinite,
            height: 400,
            child: Column(
              children: [
                TextField(
                  controller: titleController,
                  decoration: const InputDecoration(
                    labelText: 'Quiz Title',
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 16),
                DropdownButtonFormField<String>(
                  value: difficultyController.text,
                  items: ['Easy', 'Medium', 'Hard']
                      .map((d) => DropdownMenuItem(value: d, child: Text(d)))
                      .toList(),
                  onChanged: (val) => difficultyController.text = val!,
                  decoration: const InputDecoration(labelText: 'Difficulty'),
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Questions (${questions.length})'),
                    ElevatedButton(
                      onPressed: () {
                        setState(() {
                          questions.add({
                            'questionText': '',
                            'options': ['', '', '', ''],
                            'correctAnswer': '',
                          });
                        });
                      },
                      child: const Text('Add Question'),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Expanded(
                  child: ListView.builder(
                    itemCount: questions.length,
                    itemBuilder: (context, index) {
                      final question = questions[index];
                      return Card(
                        margin: const EdgeInsets.only(bottom: 8),
                        child: Padding(
                          padding: const EdgeInsets.all(8.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Question ${index + 1}'),
                              const SizedBox(height: 8),
                              TextField(
                                decoration: const InputDecoration(
                                  labelText: 'Question',
                                  border: OutlineInputBorder(),
                                ),
                                onChanged: (value) => question['questionText'] = value,
                              ),
                              const SizedBox(height: 8),
                              ...List.generate(4, (optionIndex) {
                                return Padding(
                                  padding: const EdgeInsets.only(bottom: 4),
                                  child: Row(
                                    children: [
                                      Radio<String>(
                                        value: 'Option ${optionIndex + 1}',
                                        groupValue: question['correctAnswer'],
                                        onChanged: (value) {
                                          setState(() {
                                            question['correctAnswer'] = value!;
                                          });
                                        },
                                      ),
                                      Expanded(
                                        child: TextField(
                                          decoration: InputDecoration(
                                            labelText: 'Option ${optionIndex + 1}',
                                            border: const OutlineInputBorder(),
                                          ),
                                          onChanged: (value) => question['options'][optionIndex] = value,
                                        ),
                                      ),
                                    ],
                                  ),
                                );
                              }),
                              const SizedBox(height: 8),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.end,
                                children: [
                                  TextButton(
                                    onPressed: () {
                                      setState(() {
                                        questions.removeAt(index);
                                      });
                                    },
                                    child: const Text('Remove'),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () {
                if (titleController.text.isNotEmpty && questions.isNotEmpty) {
                  _createManualQuiz(titleController.text, difficultyController.text, questions);
                  Navigator.pop(context);
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Please fill in quiz title and add at least one question'),
                      backgroundColor: AppColors.error,
                    ),
                  );
                }
              },
              child: const Text('Create Quiz'),
            ),
          ],
        ),
      ),
    );
  }

  void _showAutoGenerateDialog() {
    final titleController = TextEditingController();
    final questionCountController = TextEditingController();
    String selectedDifficulty = 'Easy';
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Auto Generate Quiz'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: titleController,
              decoration: const InputDecoration(
                labelText: 'Quiz Title',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: questionCountController,
              decoration: const InputDecoration(
                labelText: 'Number of Questions',
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              value: selectedDifficulty,
              items: ['Easy', 'Medium', 'Hard']
                  .map((d) => DropdownMenuItem(value: d, child: Text(d)))
                  .toList(),
              onChanged: (val) => selectedDifficulty = val!,
              decoration: const InputDecoration(labelText: 'Difficulty'),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              try {
                final authProvider = Provider.of<AuthProvider>(context, listen: false);
                final token = authProvider.token;
                final url = Uri.parse('${ApiEndpoints.classroom}/${classroomId}/generate-quiz');
                final response = await http.post(
                  url,
                  body: json.encode({
                    'title': titleController.text,
                    'questionCount': int.tryParse(questionCountController.text) ?? 5,
                    'difficulty': selectedDifficulty,
                  }),
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer $token',
                  },
                );
                if (response.statusCode == 200) {
                  await fetchClassroomDetails();
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Quiz generated successfully!'),
                        backgroundColor: AppColors.success,
                      ),
                    );
                  }
                } else {
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Failed to generate quiz: ${response.statusCode}'),
                        backgroundColor: AppColors.error,
                      ),
                    );
                  }
                }
              } catch (e) {
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Error generating quiz: $e'),
                      backgroundColor: AppColors.error,
                    ),
                  );
                }
              }
              Navigator.pop(context);
            },
            child: const Text('Generate'),
          ),
        ],
      ),
    );
  }

  void _createManualQuiz(String title, String difficulty, List<Map<String, dynamic>> questions) {
    // Create quiz object for frontend storage
    final quiz = {
      'id': DateTime.now().millisecondsSinceEpoch,
      'title': title,
      'difficulty': difficulty,
      'questions': questions,
      'createdAt': DateTime.now().toIso8601String(),
      'isActive': true,
    };

    // Add quiz to classroom's quizzes list
    setState(() {
      if (classroom != null) {
        if (classroom!['quizzes'] == null) {
          classroom!['quizzes'] = [];
        }
        classroom!['quizzes'].add(quiz);
      }
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Quiz "$title" created successfully!'),
        backgroundColor: AppColors.success,
      ),
    );
  }

  String _formatDate(String? dateString) {
    if (dateString == null) return 'Unknown';
    try {
      final date = DateTime.parse(dateString);
      return '${date.day}/${date.month}/${date.year}';
    } catch (e) {
      return 'Invalid date';
    }
  }

  void _editQuiz(Map<String, dynamic> quiz) {
    // TODO: Implement edit quiz functionality
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Edit quiz feature coming soon!'),
        backgroundColor: AppColors.info,
      ),
    );
  }

  void _deleteQuiz(Map<String, dynamic> quiz) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Quiz'),
        content: Text('Are you sure you want to delete "${quiz['title']}"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              setState(() {
                classroom!['quizzes'].removeWhere((q) => q['id'] == quiz['id']);
              });
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Quiz "${quiz['title']}" deleted successfully!'),
                  backgroundColor: AppColors.success,
                ),
              );
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.error),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }

  void _startQuiz(Map<String, dynamic> quiz) {
    // TODO: Navigate to quiz play screen
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Starting quiz: ${quiz['title']}'),
        backgroundColor: AppColors.info,
      ),
    );
  }

  void _showRemoveStudentDialog() {
    if (classroom == null || classroom!['students'] == null) return;
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Remove Student'),
        content: SizedBox(
          width: 300,
          child: ListView.builder(
            shrinkWrap: true,
            itemCount: (classroom!['students'] as List).length,
            itemBuilder: (context, index) {
              final student = (classroom!['students'] as List)[index];
              return ListTile(
                leading: const Icon(Icons.person),
                title: Text(student['name'] ?? 'Student'),
                subtitle: Text(student['email'] ?? ''),
                trailing: IconButton(
                  icon: const Icon(Icons.remove_circle, color: Colors.red),
                  onPressed: () async {
                    await _removeStudent(student['id']);
                    Navigator.pop(context);
                  },
                ),
              );
            },
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  Future<void> _removeStudent(dynamic studentId) async {
    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final token = authProvider.token;
      final url = Uri.parse('${ApiEndpoints.classroom}/${classroomId}/students/$studentId');
      final response = await http.delete(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );
      if (response.statusCode == 200) {
        await fetchClassroomDetails();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Student removed successfully!'),
              backgroundColor: AppColors.success,
            ),
          );
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Failed to remove student: ${response.statusCode}'),
              backgroundColor: AppColors.error,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error removing student: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  void _showLeaderboardDialog() async {
    showDialog(
      context: context,
      builder: (context) {
        return FutureBuilder<http.Response>(
          future: () async {
            final authProvider = Provider.of<AuthProvider>(context, listen: false);
            final token = authProvider.token;
            return await http.get(
              Uri.parse('${ApiEndpoints.classroom}/leaderboard/$classroomId'),
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer $token',
              },
            );
          }(),
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const AlertDialog(
                title: Text('Classroom Leaderboard'),
                content: SizedBox(height: 100, child: Center(child: CircularProgressIndicator())),
              );
            }
            if (!snapshot.hasData || snapshot.data!.statusCode != 200) {
              return AlertDialog(
                title: const Text('Classroom Leaderboard'),
                content: const Text('Failed to load leaderboard.'),
                actions: [TextButton(onPressed: () => Navigator.pop(context), child: const Text('Close'))],
              );
            }
            final List<dynamic> leaderboard = json.decode(snapshot.data!.body);
            return AlertDialog(
              title: const Text('Leaderboard'),
              content: leaderboard.isEmpty
                  ? const Text('No students found.')
                  : SizedBox(
                      width: 300,
                      child: DataTable(
                        columns: const [
                          DataColumn(label: Text('Rank')),
                          DataColumn(label: Text('Name')),
                          DataColumn(label: Text('Score')),
                        ],
                        rows: [
                          for (int i = 0; i < leaderboard.length; i++)
                            DataRow(cells: [
                              DataCell(Text('${i + 1}')),
                              DataCell(Text(leaderboard[i]['name'] ?? '')),
                              DataCell(Text('${leaderboard[i]['score'] ?? 0}')),
                            ]),
                        ],
                      ),
                    ),
              actions: [TextButton(onPressed: () => Navigator.pop(context), child: const Text('Close'))],
            );
          },
        );
      },
    );
  }
} 