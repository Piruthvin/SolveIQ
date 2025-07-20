import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../providers/auth_provider.dart';
import '../providers/quiz_provider.dart';
import '../providers/profile_provider.dart';
import '../providers/theme_provider.dart';
import '../utils/constants.dart';
import '../utils/theme_colors.dart';
import '../utils/ui_utils.dart';
import '../utils/widget_utils.dart';
import '../utils/screen_utils.dart';
import '../widgets/custom_button.dart';
import '../widgets/chatbot_widget.dart';
import 'profile_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int totalQuizzes = 0;
  int solved = 0;
  int topicsCount = 0;
  int currentQuizIndex = 0;
  bool showingRandomQuizzes = false;

  @override
  void initState() {
    super.initState();
    _fetchInitialData();
  }

  Future<void> _fetchInitialData() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final quizProvider = Provider.of<QuizProvider>(context, listen: false);
    final profileProvider = Provider.of<ProfileProvider>(context, listen: false);
    if (authProvider.user != null) {
      final userId = authProvider.user!['userId'];
      await Future.wait([
        quizProvider.fetchQuizzes(),
        quizProvider.fetchSolvedQuizzes(userId),
        profileProvider.fetchUserProfile(userId, context: context),
      ]);
      await _fetchHomeStats();
    }
  }

  Future<void> _loadData() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final quizProvider = Provider.of<QuizProvider>(context, listen: false);
    final profileProvider = Provider.of<ProfileProvider>(context, listen: false);
    if (authProvider.user != null) {
      final userId = authProvider.user!['userId'];
      await Future.wait([
        quizProvider.fetchQuizzes(),
        quizProvider.fetchSolvedQuizzes(userId),
        profileProvider.fetchUserProfile(userId, context: context),
      ]);
    }
    await _fetchHomeStats();
  }

  Future<void> _fetchHomeStats() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final token = authProvider.token;
    final userId = authProvider.user?['userId'];
    if (userId == null) return;
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
        totalQuizzes = stats['totalQuizzes'] ?? 0;
        solved = stats['solved'] ?? 0;
        topicsCount = stats['topicsCount'] ?? 0;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return ScreenUtils.getScaffold(
      context: context,
      title: 'QuizApp',
      automaticallyImplyLeading: false,
      actions: [
        IconButton(
          icon: const Icon(Icons.notifications_outlined),
          onPressed: () {
            // Notifications feature coming soon
          },
        ),
        IconButton(
          icon: const Icon(Icons.person_outline),
          onPressed: () {
            Navigator.pushNamed(context, '/search-profile');
          },
        ),
      ],
      body: Consumer<AuthProvider>(
        builder: (context, authProvider, child) {
          if (authProvider.user == null) {
            return UIUtils.getFullScreenLoading();
          }

          return RefreshIndicator(
            onRefresh: _fetchInitialData,
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                _buildWelcomeSection(authProvider),
                const SizedBox(height: 12),
                _buildStatsSection(),
                const SizedBox(height: 12),
                Consumer<ProfileProvider>(
                  builder: (context, profileProvider, child) {
                    return Column(
                      children: [
                        buildStreakSection(profileProvider.userProfile),
                        const SizedBox(height: 8),
                        ElevatedButton.icon(
                          icon: const Icon(Icons.visibility),
                          label: const Text('View Full Streak'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: ThemeColors.getPrimaryColor(context),
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          onPressed: () {
                            Navigator.pushNamed(context, '/profile');
                          },
                        ),
                      ],
                    );
                  },
                ),
                const SizedBox(height: 12),
                const ChatbotWidget(),
                const SizedBox(height: 12),
                _buildRandomQuizzesSection(),
                const SizedBox(height: 12),
                if (showingRandomQuizzes) _buildRandomQuizDisplay(),
                const SizedBox(height: 12),
                ElevatedButton.icon(
                  icon: Icon(Icons.class_),
                  label: Text('Go to Classroom'),
                  style: ElevatedButton.styleFrom(
                    minimumSize: Size(double.infinity, 48),
                    backgroundColor: ThemeColors.getPrimaryColor(context),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  onPressed: () {
                    Navigator.pushNamed(context, '/classroom');
                  },
                ),
                const SizedBox(height: 12),
                ElevatedButton.icon(
                  icon: Icon(Icons.link),
                  label: Text('Join Classroom'),
                  style: ElevatedButton.styleFrom(
                    minimumSize: Size(double.infinity, 48),
                    backgroundColor: ThemeColors.getAccentColor(context),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  onPressed: _showJoinClassroomDialog,
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildWelcomeSection(AuthProvider authProvider) {
    final user = authProvider.user!;
    final userName = (user['name'] as String?)?.trim();
    final displayName = (userName != null && userName.isNotEmpty)
        ? userName
        : (user['email'] ?? 'User');

    Widget _buildAvatar(String? name) {
      if (name != null && name.isNotEmpty) {
        return CircleAvatar(
          radius: 24,
          backgroundColor: Colors.white.withOpacity(0.2),
          child: Text(
            name[0].toUpperCase(),
            style: const TextStyle(fontSize: 24, color: Colors.white, fontWeight: FontWeight.bold),
          ),
        );
      } else {
        return const CircleAvatar(
          radius: 24,
          backgroundColor: Colors.white24,
          child: Icon(Icons.person, size: 24, color: Colors.white),
        );
      }
    }

    return Container(
      width: double.infinity,
      margin: const EdgeInsets.symmetric(vertical: 8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        gradient: LinearGradient(
          colors: [
            ThemeColors.getPrimaryColor(context),
            ThemeColors.getSecondaryColor(context),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Row(
        children: [
          _buildAvatar(userName),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Welcome back,',
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.8),
                    fontSize: 13,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  displayName,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 18,
                    color: Colors.white,
                  ),
                  overflow: TextOverflow.ellipsis,
                  maxLines: 1,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatsSection() {
    return Row(
      children: [
        Expanded(
          child: _buildStatCard('Total Quizzes', totalQuizzes, Icons.quiz, AppColors.info),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: _buildStatCard('Solved', solved, Icons.check_circle, AppColors.success),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: _buildStatCard('Topics', topicsCount, Icons.play_circle, AppColors.warning),
        ),
      ],
    );
  }

  Widget _buildStatCard(String title, int value, IconData icon, Color color) {
    return ProfileStatsCard(
      title: title,
      value: value.toString(),
      icon: icon,
      color: color,
      compact: true,
    );
  }

  Widget _buildRandomQuizzesSection() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: ThemeColors.getAccentColor(context).withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: ThemeColors.getAccentColor(context).withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.shuffle, color: ThemeColors.getAccentColor(context), size: 20),
              const SizedBox(width: 8),
              Text(
                'Random Unsolved Quizzes',
                style: TextStyle(
                  color: ThemeColors.getTextPrimaryColor(context),
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            'Get random quizzes you haven\'t solved yet',
            style: TextStyle(
              color: ThemeColors.getTextSecondaryColor(context),
              fontSize: 13,
            ),
          ),
          const SizedBox(height: 12),
          CustomButton(
            text: 'Get Random Quizzes',
            onPressed: _showRandomQuizzesDialog,
            backgroundColor: ThemeColors.getAccentColor(context),
          ),
        ],
      ),
    );
  }

  void _showRandomQuizzesDialog() {
    String topic = '';
    String numQuestions = '5';

    showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setState) {
            return AlertDialog(
              title: const Text('Get Random Unsolved Quizzes'),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    TextFormField(
                      decoration: const InputDecoration(
                        labelText: 'Topic (Optional)',
                        hintText: 'Leave empty for any topic',
                      ),
                      onChanged: (val) => topic = val,
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      decoration: const InputDecoration(
                        labelText: 'Number of Questions',
                        hintText: 'How many quizzes to get',
                      ),
                      keyboardType: TextInputType.number,
                      controller: TextEditingController(text: numQuestions),
                      onChanged: (val) => numQuestions = val,
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
                    _getRandomQuizzes(
                      topic: topic.isEmpty ? null : topic,
                      count: int.tryParse(numQuestions) ?? 5,
                    );
                    Navigator.pop(context);
                  },
                  child: const Text('Get Quizzes'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  void _getRandomQuizzes({
    String? topic,
    required int count,
  }) {
    final quizProvider = Provider.of<QuizProvider>(context, listen: false);
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final userId = authProvider.user?['userId'];
    final token = authProvider.token;
    
    if (userId != null && token != null) {
      quizProvider.fetchRandomUnsolvedQuizzes(
        userId: userId,
        token: token,
        topic: topic,
        count: count,
      );
      
      // Stay on home screen - the UI will update to show random quizzes
      setState(() {
        showingRandomQuizzes = true;
        currentQuizIndex = 0;
      });
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Please login to get random quizzes'),
          backgroundColor: ThemeColors.getErrorColor(context),
        ),
      );
    }
  }

  Widget _buildRandomQuizDisplay() {
    final quizProvider = Provider.of<QuizProvider>(context);
    final randomQuizzes = quizProvider.quizzes;
    
    if (randomQuizzes.isEmpty) {
      return Container();
    }
    
    final currentQuiz = randomQuizzes[currentQuizIndex];
    
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: ThemeColors.getCardColor(context),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: ThemeColors.getShadowColor(context),
            spreadRadius: 1,
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
              Icon(Icons.quiz, color: ThemeColors.getAccentColor(context)),
              const SizedBox(width: 8),
              Text(
                'Random Quiz ${currentQuizIndex + 1}/${randomQuizzes.length}',
                style: TextStyle(
                  color: ThemeColors.getTextPrimaryColor(context),
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const Spacer(),
              IconButton(
                icon: const Icon(Icons.close),
                onPressed: () {
                  setState(() {
                    showingRandomQuizzes = false;
                    currentQuizIndex = 0;
                  });
                  quizProvider.clearRandomQuizzes();
                },
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            currentQuiz['question'] ?? '',
            style: TextStyle(
              color: ThemeColors.getTextPrimaryColor(context),
              fontSize: 16,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Topic: ${currentQuiz['topic'] ?? ''}',
            style: TextStyle(
              color: ThemeColors.getTextSecondaryColor(context),
              fontSize: 14,
            ),
          ),
          const SizedBox(height: 16),
          _buildQuizOptions(currentQuiz),
          const SizedBox(height: 16),
          Row(
            children: [
              if (currentQuizIndex > 0)
                Expanded(
                  child: CustomButton(
                    text: 'Previous',
                    onPressed: () {
                      setState(() {
                        currentQuizIndex--;
                      });
                    },
                    backgroundColor: ThemeColors.getTextSecondaryColor(context),
                  ),
                ),
              if (currentQuizIndex > 0) const SizedBox(width: 8),
              Expanded(
                child: CustomButton(
                  text: currentQuizIndex < randomQuizzes.length - 1 ? 'Next' : 'Finish',
                  onPressed: () {
                    if (currentQuizIndex < randomQuizzes.length - 1) {
                      setState(() {
                        currentQuizIndex++;
                      });
                    } else {
                      // Finish - refresh the list
                      _refreshRandomQuizzes();
                    }
                  },
                  backgroundColor: ThemeColors.getAccentColor(context),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildQuizOptions(Map<String, dynamic> quiz) {
    final options = [
      quiz['option1'],
      quiz['option2'],
      quiz['option3'],
      quiz['option4'],
    ].where((option) => option != null && option.isNotEmpty).toList();
    
    return Column(
      children: options.asMap().entries.map((entry) {
        final index = entry.key;
        final option = entry.value;
        return Container(
          width: double.infinity,
          margin: const EdgeInsets.only(bottom: 8),
          child: CustomButton(
            text: option,
            onPressed: () => _solveQuiz(quiz, option),
            backgroundColor: ThemeColors.getDividerColor(context),
            textColor: ThemeColors.getTextPrimaryColor(context),
          ),
        );
      }).toList(),
    );
  }

  void _solveQuiz(Map<String, dynamic> quiz, String selectedAnswer) async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final profileProvider = Provider.of<ProfileProvider>(context, listen: false);
    final userId = authProvider.user?['userId'];
    final token = authProvider.token;
    
    if (userId == null || token == null) return;
    
    try {
      final response = await http.post(
        Uri.parse('${ApiEndpoints.quiz}/solve'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: json.encode({
          'userId': userId,
          'quizId': quiz['id'],
          'answer': selectedAnswer,
        }),
      );
      
      if (response.statusCode == 200) {
        final result = json.decode(response.body);
        final isCorrect = result['correct'] ?? false;
        final explanation = result['explanation'];
        
        // Refresh profile to update streak if answer is correct
        if (isCorrect) {
          await profileProvider.fetchUserProfile(userId, context: context);
        }
        
        // Show result dialog
        _showQuizResultDialog(isCorrect, explanation, selectedAnswer, quiz);
      }
    } catch (e) {
      print('Error solving quiz: $e');
    }
  }

  void _showQuizResultDialog(bool isCorrect, String? explanation, String selectedAnswer, Map<String, dynamic> quiz) {
    final quizProvider = Provider.of<QuizProvider>(context, listen: false);
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(isCorrect ? 'Correct!' : 'Incorrect'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Your answer: $selectedAnswer',
              style: TextStyle(
                color: isCorrect ? Colors.green : Colors.red,
                fontWeight: FontWeight.bold,
              ),
            ),
            if (isCorrect && explanation != null) ...[
              const SizedBox(height: 12),
              Text(
                'Explanation:',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 4),
              Text(explanation),
            ],
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              // Move to next quiz or finish
              if (currentQuizIndex < quizProvider.quizzes.length - 1) {
                setState(() {
                  currentQuizIndex++;
                });
              } else {
                _refreshRandomQuizzes();
              }
            },
            child: Text(currentQuizIndex < quizProvider.quizzes.length - 1 ? 'Next Quiz' : 'Finish'),
          ),
        ],
      ),
    );
  }

  void _refreshRandomQuizzes() async {
    final quizProvider = Provider.of<QuizProvider>(context, listen: false);
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final userId = authProvider.user?['userId'];
    final token = authProvider.token;
    
    if (userId != null && token != null) {
      // Fetch fresh random quizzes
      await quizProvider.fetchRandomUnsolvedQuizzes(
        userId: userId,
        token: token,
        count: 5,
      );
      
      setState(() {
        currentQuizIndex = 0;
      });
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Refreshed with new random quizzes!'),
          backgroundColor: ThemeColors.getSuccessColor(context),
        ),
      );
    }
  }

  void _showJoinClassroomDialog() {
    final joinLinkController = TextEditingController();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Join Classroom'),
        content: TextField(
          controller: joinLinkController,
          decoration: const InputDecoration(
            labelText: 'Enter Join Link',
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
              final joinLink = joinLinkController.text.trim();
              if (joinLink.isNotEmpty) {
                final authProvider = Provider.of<AuthProvider>(context, listen: false);
                final token = authProvider.token;
                final userId = authProvider.user?['userId'];
                final url = Uri.parse('${ApiEndpoints.classroom}/join?joinLink=$joinLink&studentId=$userId');
                final response = await http.post(
                  url,
                  headers: {'Authorization': 'Bearer $token'},
                );
                if (response.statusCode == 200) {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: const Text('Joined classroom successfully!'), backgroundColor: ThemeColors.getSuccessColor(context)),
                  );
                  // Navigate to classroom screen
                  Navigator.pushNamed(context, '/classroom');
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Failed to join classroom: \\${response.body}'), backgroundColor: ThemeColors.getErrorColor(context)),
                  );
                }
              }
            },
            child: const Text('Join'),
          ),
        ],
      ),
    );
  }

  Widget buildStreakSection(Map<String, dynamic>? profile) {
    final currentStreak = profile?['currentStreak'] ?? 0;
    final streakEmoji = _getStreakEmoji(currentStreak);

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: ThemeColors.getCardColor(context),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: ThemeColors.getShadowColor(context),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: ThemeColors.getPrimaryColor(context).withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(streakEmoji, style: const TextStyle(fontSize: 32)),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Current Streak',
                  style: TextStyle(
                    color: ThemeColors.getTextSecondaryColor(context),
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '$currentStreak days',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: ThemeColors.getTextPrimaryColor(context),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Keep it up! 🔥',
                  style: TextStyle(
                    fontSize: 12,
                    color: ThemeColors.getSuccessColor(context),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _getStreakEmoji(int streak) {
    if (streak == 0) {
      return '🌙';
    } else if (streak == 1) {
      return '🔥';
    } else {
      return '🔥' * streak;
    }
  }
}

class ProfileStatsCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color color;
  final bool compact;

  const ProfileStatsCard({
    super.key,
    required this.title,
    required this.value,
    required this.icon,
    required this.color,
    this.compact = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(
              fontSize: compact ? 18 : 24,
              fontWeight: FontWeight.bold,
              color: ThemeColors.getTextPrimaryColor(context),
            ),
          ),
          const SizedBox(height: 4),
          Text(
            title,
            style: TextStyle(
              fontSize: compact ? 10 : 12,
              color: ThemeColors.getTextSecondaryColor(context),
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
