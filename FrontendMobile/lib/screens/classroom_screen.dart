import 'package:flutter/material.dart';
import '../utils/constants.dart';
import '../utils/ui_utils.dart';
import '../utils/widget_utils.dart';
import '../utils/screen_utils.dart';
import '../widgets/custom_button.dart';
import 'package:provider/provider.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../providers/auth_provider.dart';
import 'package:flutter/services.dart';

class ClassroomScreen extends StatefulWidget {
  const ClassroomScreen({super.key});

  @override
  State<ClassroomScreen> createState() => _ClassroomScreenState();
}

class _ClassroomScreenState extends State<ClassroomScreen> {
  List<Map<String, dynamic>> _classrooms = [];
  List<Map<String, dynamic>> _joinedClassrooms = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    fetchClassrooms();
  }

  Future<void> fetchClassrooms() async {
    setState(() {
      _isLoading = true;
    });
    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final user = authProvider.user;
      final userId = user?['userId'];
      final token = authProvider.token;
      if (userId == null) {
        setState(() {
          _classrooms = [];
          _joinedClassrooms = [];
          _isLoading = false;
        });
        return;
      }
      // Fetch classrooms created by me (teacher)
      final teacherUrl = Uri.parse('${ApiEndpoints.classroom}/teacher/$userId');
      final teacherRes = await http.get(teacherUrl, headers: {'Authorization': 'Bearer $token'});
      // Fetch classrooms joined as student
      final studentUrl = Uri.parse('${ApiEndpoints.classroom}/student/$userId');
      final studentRes = await http.get(studentUrl, headers: {'Authorization': 'Bearer $token'});
      List<Map<String, dynamic>> myClassrooms = [];
      List<Map<String, dynamic>> joinedClassrooms = [];
      if (teacherRes.statusCode == 200) {
        myClassrooms = (json.decode(teacherRes.body) as List).cast<Map<String, dynamic>>();
      }
      if (studentRes.statusCode == 200) {
        joinedClassrooms = (json.decode(studentRes.body) as List).cast<Map<String, dynamic>>();
      }
      // Remove duplicates (if any classroom is both created and joined)
      final myIds = myClassrooms.map((c) => c['id']).toSet();
      joinedClassrooms = joinedClassrooms.where((c) => !myIds.contains(c['id'])).toList();
      setState(() {
        _classrooms = myClassrooms;
        _joinedClassrooms = joinedClassrooms;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _classrooms = [];
        _joinedClassrooms = [];
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return ScreenUtils.getScaffold(
      context: context,
      title: 'Classrooms',
      actions: [
        IconButton(
          icon: const Icon(Icons.add),
          onPressed: _showCreateClassroomDialog,
        ),
      ],
      body: _isLoading
          ? UIUtils.getFullScreenLoading()
          : (_classrooms.isEmpty && _joinedClassrooms.isEmpty)
              ? UIUtils.getEmptyState(
                  message: 'No classrooms yet',
                  subtitle: 'Create your first classroom to get started',
                  icon: Icons.class_,
                  onAction: _showCreateClassroomDialog,
                  actionText: 'Create Classroom',
                )
                              : ListView(
                    padding: UIUtils.paddingAllMedium,
                  children: [
                    if (_classrooms.isNotEmpty) ...[
                      Text('My Classrooms', style: UIUtils.subheadingStyle),
                      WidgetUtils.spaceSmall,
                      ..._classrooms.map((classroom) => _buildClassroomCard(classroom, isOwner: true)),
                      WidgetUtils.spaceLarge,
                    ],
                    if (_joinedClassrooms.isNotEmpty) ...[
                      Text('Joined Classrooms', style: UIUtils.subheadingStyle),
                      WidgetUtils.spaceSmall,
                      ..._joinedClassrooms.map((classroom) => _buildClassroomCard(classroom, isOwner: false)),
                    ],
                  ],
                ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(
            Icons.class_,
            size: 64,
            color: AppColors.textSecondary,
          ),
          const SizedBox(height: 16),
          const Text(
            'No classrooms yet',
            style: TextStyle(
              fontSize: 18,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Create your first classroom to get started',
            style: TextStyle(
              fontSize: 14,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 24),
          CustomButton(
            text: 'Create Classroom',
            onPressed: _showCreateClassroomDialog,
          ),
        ],
      ),
    );
  }

  Widget _buildClassroomCard(Map<String, dynamic> classroom, {bool isOwner = false}) {
    final joinLink = classroom['joinLink'] ?? '';
    final quizzes = classroom['quizzes'] ?? [];
    return WidgetUtils.getCard(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      classroom['name'] ?? classroom['title'] ?? 'Classroom',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Code: ${classroom['code'] ?? ''}',
                      style: TextStyle(
                        fontSize: 12,
                        color: AppColors.textSecondary,
                      ),
                    ),
                    if (joinLink.isNotEmpty) ...[
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          const Icon(Icons.link, size: 16, color: AppColors.primary),
                          const SizedBox(width: 4),
                          Expanded(
                            child: Text(
                              joinLink,
                              style: const TextStyle(fontSize: 12, color: AppColors.primary, decoration: TextDecoration.underline),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.copy, size: 16, color: AppColors.primary),
                            onPressed: () {
                              Clipboard.setData(ClipboardData(text: joinLink));
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Join link copied!')),
                              );
                            },
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
              if (isOwner)
                PopupMenuButton<String>(
                  onSelected: (value) => _handleClassroomAction(value, classroom),
                  itemBuilder: (context) => [
                    const PopupMenuItem(
                      value: 'view',
                      child: Row(
                        children: [Icon(Icons.visibility), SizedBox(width: 8), Text('View Details')],
                      ),
                    ),
                    const PopupMenuItem(
                      value: 'edit',
                      child: Row(
                        children: [Icon(Icons.edit), SizedBox(width: 8), Text('Edit')],
                      ),
                    ),
                    const PopupMenuItem(
                      value: 'delete',
                      child: Row(
                        children: [Icon(Icons.delete), SizedBox(width: 8), Text('Delete')],
                      ),
                    ),
                  ],
                ),
            ],
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              _buildStatItem(Icons.people, '${classroom['students']} students', AppColors.primary),
              _buildStatItem(Icons.assignment, '${classroom['activeAssignments']} assignments', AppColors.warning),
              OutlinedButton.icon(
                icon: Icon(Icons.leaderboard, color: AppColors.info),
                label: Text('View Leaderboard', style: TextStyle(color: AppColors.info)),
                style: OutlinedButton.styleFrom(
                  side: BorderSide(color: AppColors.info),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                onPressed: () => _showLeaderboardDialog(classroom['id'], classroom['name'] ?? classroom['title']),
              ),
              if (isOwner) ...[
                OutlinedButton.icon(
                  icon: Icon(Icons.person_add, color: AppColors.primary),
                  label: Text('Add Students', style: TextStyle(color: AppColors.primary)),
                  style: OutlinedButton.styleFrom(
                    side: BorderSide(color: AppColors.primary),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  onPressed: () => _showAddStudentsDialog(classroom),
                ),
                OutlinedButton.icon(
                  icon: Icon(Icons.quiz, color: AppColors.accent),
                  label: Text('Generate Quiz', style: TextStyle(color: AppColors.accent)),
                  style: OutlinedButton.styleFrom(
                    side: BorderSide(color: AppColors.accent),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  onPressed: () => _showGenerateQuizDialog(classroom),
                ),
                ElevatedButton(
                  child: const Text('Manage'),
                  onPressed: () {
                    Navigator.pushNamed(context, '/classroom-details', arguments: {'classroomId': classroom['id'], 'isOwner': true});
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                ),
              ] else ...[
                ElevatedButton(
                  child: const Text('View'),
                  onPressed: () {
                    Navigator.pushNamed(context, '/classroom-details', arguments: {'classroomId': classroom['id'], 'isOwner': false});
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                ),
              ],
            ],
          ),
          if (quizzes.isNotEmpty) ...[
            const SizedBox(height: 16),
            Text('Quizzes (${quizzes.length}):', style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
            ...quizzes.map<Widget>((quiz) => Card(
              margin: const EdgeInsets.only(bottom: 8),
              child: ListTile(
                leading: CircleAvatar(
                  backgroundColor: AppColors.accent.withOpacity(0.1),
                  child: Icon(Icons.quiz, color: AppColors.accent),
                ),
                title: Text(quiz['title'] ?? 'Quiz'),
                subtitle: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Difficulty: ${quiz['difficulty'] ?? 'Easy'}'),
                    Text('Questions: ${(quiz['questions'] as List?)?.length ?? 0}'),
                  ],
                ),
                trailing: ElevatedButton(
                  child: const Text('Start'),
                  onPressed: () {
                    // TODO: Navigate to quiz play screen
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Starting quiz: ${quiz['title']}'),
                        backgroundColor: AppColors.info,
                      ),
                    );
                  },
                ),
              ),
            )),
          ],
        ],
      ),
    );
  }

  Widget _buildStatItem(IconData icon, String text, Color color) {
    return Row(
      children: [
        Icon(icon, size: 16, color: color),
        const SizedBox(width: 4),
        Text(text, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
      ],
    );
  }

  void _showCreateClassroomDialog() {
    final nameController = TextEditingController();
    final descriptionController = TextEditingController();
    final joinLinkController = TextEditingController();
    DateTime? startTime;
    DateTime? endTime;
    bool isActive = true;

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          title: const Text('Create Classroom'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: nameController,
                  decoration: const InputDecoration(
                    labelText: 'Classroom Name',
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: descriptionController,
                  decoration: const InputDecoration(
                    labelText: 'Description (Optional)',
                    border: OutlineInputBorder(),
                  ),
                  maxLines: 3,
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: joinLinkController,
                  decoration: const InputDecoration(
                    labelText: 'Join Link (Optional)',
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: Text(startTime == null
                          ? 'Start Time: Not set'
                          : 'Start Time: ${startTime.toString().substring(0, 16)}'),
                    ),
                    TextButton(
                      onPressed: () async {
                        final picked = await showDatePicker(
                          context: context,
                          initialDate: DateTime.now(),
                          firstDate: DateTime(2020),
                          lastDate: DateTime(2100),
                        );
                        if (picked != null) {
                          final time = await showTimePicker(
                            context: context,
                            initialTime: TimeOfDay.now(),
                          );
                          if (time != null) {
                            setState(() {
                              startTime = DateTime(picked.year, picked.month, picked.day, time.hour, time.minute);
                            });
                          }
                        }
                      },
                      child: const Text('Pick Start'),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(
                      child: Text(endTime == null
                          ? 'End Time: Not set'
                          : 'End Time: ${endTime.toString().substring(0, 16)}'),
                    ),
                    TextButton(
                      onPressed: () async {
                        final picked = await showDatePicker(
                          context: context,
                          initialDate: DateTime.now(),
                          firstDate: DateTime(2020),
                          lastDate: DateTime(2100),
                        );
                        if (picked != null) {
                          final time = await showTimePicker(
                            context: context,
                            initialTime: TimeOfDay.now(),
                          );
                          if (time != null) {
                            setState(() {
                              endTime = DateTime(picked.year, picked.month, picked.day, time.hour, time.minute);
                            });
                          }
                        }
                      },
                      child: const Text('Pick End'),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Checkbox(
                      value: isActive,
                      onChanged: (val) => setState(() => isActive = val ?? true),
                    ),
                    const Text('Is Active'),
                  ],
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
              onPressed: () async {
                if (nameController.text.isNotEmpty && startTime != null && endTime != null) {
                  await _createClassroom(
                    nameController.text,
                    descriptionController.text,
                    joinLinkController.text,
                    startTime!,
                    endTime!,
                    isActive,
                  );
                  Navigator.pop(context);
                }
              },
              child: const Text('Create'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _createClassroom(String name, String description, String joinLink, DateTime startTime, DateTime endTime, bool isActive) async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final token = authProvider.token;
    final teacherId = authProvider.user?['userId'];
    final url = Uri.parse('${ApiEndpoints.classroom}/create');
    final response = await http.post(url,
      headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer $token'},
      body: json.encode({
        'title': name,
        'description': description,
        'teacherId': teacherId,
        'joinLink': joinLink.isNotEmpty ? joinLink : null,
        'startTime': startTime.toIso8601String(),
        'endTime': endTime.toIso8601String(),
        'isActive': isActive,
      }),
    );
    if (response.statusCode == 200) {
      await fetchClassrooms();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Classroom "$name" created successfully!'),
          backgroundColor: AppColors.success,
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Failed to create classroom.'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  void _handleClassroomAction(String action, Map<String, dynamic> classroom) {
    switch (action) {
      case 'view':
        Navigator.pushNamed(context, '/classroom-details', arguments: classroom);
        break;
      case 'edit':
        _showEditClassroomDialog(classroom);
        break;
      case 'delete':
        _showDeleteConfirmation(classroom);
        break;
    }
  }

  void _showEditClassroomDialog(Map<String, dynamic> classroom) {
    final nameController = TextEditingController(text: classroom['name']);

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Edit Classroom'),
        content: TextField(
          controller: nameController,
          decoration: const InputDecoration(
            labelText: 'Classroom Name',
            border: OutlineInputBorder(),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              if (nameController.text.isNotEmpty) {
                _updateClassroom(classroom['id'], nameController.text);
                Navigator.pop(context);
              }
            },
            child: const Text('Update'),
          ),
        ],
      ),
    );
  }

  void _updateClassroom(int id, String newName) {
    setState(() {
      final index = _classrooms.indexWhere((c) => c['id'] == id);
      if (index != -1) {
        _classrooms[index]['name'] = newName;
      }
    });

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Classroom updated successfully!'),
        backgroundColor: AppColors.success,
      ),
    );
  }

  void _showDeleteConfirmation(Map<String, dynamic> classroom) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Classroom'),
        content: Text('Are you sure you want to delete "${classroom['name']}"? This action cannot be undone.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              _deleteClassroom(classroom['id']);
              Navigator.pop(context);
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.error),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }

  void _deleteClassroom(int id) {
    setState(() {
      _classrooms.removeWhere((c) => c['id'] == id);
    });

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Classroom deleted successfully!'),
        backgroundColor: AppColors.success,
      ),
    );
  }

  void _showAddStudentsDialog(Map<String, dynamic> classroom) {
    final emailController = TextEditingController();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Add Students to ${classroom['name']}'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: emailController,
              decoration: const InputDecoration(
                labelText: 'Student Email(s)',
                hintText: 'Enter comma-separated emails',
                border: OutlineInputBorder(),
              ),
            ),
            if (classroom['joinLink'] != null && classroom['joinLink'].isNotEmpty) ...[
              const SizedBox(height: 16),
              Row(
                children: [
                  const Icon(Icons.link, size: 16, color: AppColors.primary),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      classroom['joinLink'],
                      style: const TextStyle(fontSize: 12, color: AppColors.primary, decoration: TextDecoration.underline),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.copy, size: 16, color: AppColors.primary),
                    onPressed: () {
                      Clipboard.setData(ClipboardData(text: classroom['joinLink']));
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Join link copied!')),
                      );
                    },
                  ),
                ],
              ),
            ],
          ],
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
                  final url = Uri.parse('${ApiEndpoints.classroom}/${classroom['id']}/add-students');
                  final response = await http.post(
                    url,
                    body: json.encode({'emails': emails}),
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': 'Bearer $token',
                    },
                  );
                  if (response.statusCode == 200) {
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
              await fetchClassrooms();
            },
            child: const Text('Add'),
          ),
        ],
      ),
    );
  }

  void _showGenerateQuizDialog(Map<String, dynamic> classroom) {
    final titleController = TextEditingController();
    final questionCountController = TextEditingController();
    String selectedDifficulty = 'Easy';
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Generate Quiz for ${classroom['name']}'),
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
                final url = Uri.parse('${ApiEndpoints.classroom}/${classroom['id']}/generate-quiz');
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
              await fetchClassrooms();
            },
            child: const Text('Generate'),
          ),
        ],
      ),
    );
  }

  void _showLeaderboardDialog(dynamic classroomId, String classroomName) async {
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
                title: Text('Classroom Leaderboard'),
                content: const Text('Failed to load leaderboard.'),
                actions: [TextButton(onPressed: () => Navigator.pop(context), child: const Text('Close'))],
              );
            }
            final List<dynamic> leaderboard = json.decode(snapshot.data!.body);
            return AlertDialog(
              title: Text('Leaderboard - $classroomName'),
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