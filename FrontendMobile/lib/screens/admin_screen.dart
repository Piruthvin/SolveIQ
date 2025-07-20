import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../providers/auth_provider.dart';
import '../utils/constants.dart';
import '../utils/ui_utils.dart';
import '../utils/widget_utils.dart';
import '../utils/screen_utils.dart';
import '../providers/quiz_provider.dart';
import 'manage_users_screen.dart';
import 'create_quiz_screen.dart';

class AdminScreen extends StatefulWidget {
  const AdminScreen({super.key});

  @override
  State<AdminScreen> createState() => _AdminScreenState();
}

class _AdminScreenState extends State<AdminScreen> {
  // Quiz creation form fields
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

  Map<String, dynamic> analytics = {};
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    fetchAnalytics();
  }

  Future<void> fetchAnalytics() async {
    setState(() => isLoading = true);
    try {
      final token = Provider.of<AuthProvider>(context, listen: false).token;
      final response = await http.get(
        Uri.parse(ApiEndpoints.analytics),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );
      if (response.statusCode == 200) {
        setState(() {
          analytics = jsonDecode(response.body);
          isLoading = false;
        });
      } else {
        setState(() => isLoading = false);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Failed to load analytics: ${response.statusCode}'),
              backgroundColor: AppColors.error,
            ),
          );
        }
      }
    } catch (e) {
      setState(() => isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error loading analytics: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  void _showQuizCreateDialog() {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
          ),
          title: const Text('Create Quiz', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
          content: SingleChildScrollView(
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
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
                  ],
                ),
              ),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () async {
                if (_formKey.currentState!.validate()) {
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
                  setState(() {
                    message = response.statusCode == 200 ? 'Quiz created!' : 'Failed to create quiz';
                  });
                  if (response.statusCode == 200) {
                    // Refresh quiz list in frontend
                    if (mounted) {
                      final quizProvider = Provider.of<QuizProvider>(context, listen: false);
                      await quizProvider.fetchQuizzes();
                    }
                    Navigator.pop(context);
                  }
                }
              },
              child: const Text('Create'),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return ScreenUtils.getLoadingScreen();
    }
    return ScreenUtils.getScaffold(
      context: context,
      title: 'Admin Dashboard',
      body: RefreshIndicator(
        onRefresh: fetchAnalytics,
        child: SingleChildScrollView(
          padding: UIUtils.paddingAllMedium,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Analytics Cards
            Row(
              children: [
                Expanded(
                  child: Text(
                    'Analytics Overview',
                    style: UIUtils.headingStyle,
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.refresh),
                  onPressed: fetchAnalytics,
                  tooltip: 'Refresh Analytics',
                ),
              ],
            ),
            WidgetUtils.spaceMedium,
            GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 2,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 1.7,
              children: [
                _buildAnalyticsCard('Total Users', analytics['totalUsers']?.toString() ?? '0', Icons.people, AppColors.primary),
                _buildAnalyticsCard('Total Quizzes', analytics['totalQuizzes']?.toString() ?? '0', Icons.quiz, AppColors.success),
                _buildAnalyticsCard('Total Colleges', analytics['totalColleges']?.toString() ?? '0', Icons.school, AppColors.warning),
                _buildAnalyticsCard('Daily Active', analytics['dailyActive']?.toString() ?? '0', Icons.trending_up, AppColors.accent),
              ],
            ),
            
            WidgetUtils.spaceLarge,
            // Quick Actions
            Text(
              'Quick Actions',
              style: UIUtils.headingStyle,
            ),
            WidgetUtils.spaceMedium,
            _buildActionCard(
              'Manage Users',
              'View and manage all users',
              Icons.people_outline,
              () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => ManageUsersScreen()),
                );
              },
            ),
            
            _buildActionCard(
              'Create Quiz',
              'Generate new quiz content',
              Icons.add_circle_outline,
              () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => CreateQuizScreen()),
                );
              },
            ),
            
            _buildActionCard(
              'Detailed Analytics',
              'View comprehensive analytics data',
              Icons.analytics_outlined,
              () {
                _showDetailedAnalytics();
              },
            ),
            
            _buildActionCard(
              'System Settings',
              'Configure system settings',
              Icons.settings_outlined,
              () {},
            ),
          ],
        ),
        ),
      ),
    );
  }

  Widget _buildAnalyticsCard(String title, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.textSecondary.withOpacity(0.1)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                icon,
                color: color,
                size: 20,
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  title,
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.textSecondary,
                    fontWeight: FontWeight.w500,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionCard(String title, String subtitle, IconData icon, VoidCallback onTap) {
    return WidgetUtils.getListTile(
      title: title,
      subtitle: subtitle,
      leading: Icon(
        icon,
        color: AppColors.primary,
        size: 28,
      ),
      trailing: const Icon(
        Icons.arrow_forward_ios,
        color: AppColors.textSecondary,
        size: 16,
      ),
      onTap: onTap,
    );
  }

  void _showDetailedAnalytics() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Detailed Analytics'),
        content: SizedBox(
          width: double.maxFinite,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildDetailRow('Total Users', analytics['totalUsers']?.toString() ?? '0'),
              _buildDetailRow('Total Quizzes', analytics['totalQuizzes']?.toString() ?? '0'),
              _buildDetailRow('Total Colleges', analytics['totalColleges']?.toString() ?? '0'),
              _buildDetailRow('Daily Active Users', analytics['dailyActive']?.toString() ?? '0'),
              const Divider(),
              const Text(
                'Note: Daily active users are calculated based on users who logged in today.',
                style: TextStyle(
                  fontSize: 12,
                  color: AppColors.textSecondary,
                  fontStyle: FontStyle.italic,
                ),
              ),
            ],
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

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontWeight: FontWeight.w500,
              color: AppColors.textPrimary,
            ),
          ),
          Text(
            value,
            style: const TextStyle(
              fontWeight: FontWeight.bold,
              color: AppColors.primary,
            ),
          ),
        ],
      ),
    );
  }
} 