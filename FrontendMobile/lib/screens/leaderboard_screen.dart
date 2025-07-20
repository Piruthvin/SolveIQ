import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../providers/auth_provider.dart';
import '../utils/constants.dart';
import '../utils/ui_utils.dart';
import '../utils/widget_utils.dart';
import '../utils/screen_utils.dart';

class LeaderboardScreen extends StatefulWidget {
  const LeaderboardScreen({super.key});

  @override
  State<LeaderboardScreen> createState() => _LeaderboardScreenState();
}

class _LeaderboardScreenState extends State<LeaderboardScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  bool _isLoading = false;
  List<Map<String, dynamic>> _globalLeaderboard = [];
  List<Map<String, dynamic>> _collegeLeaderboard = [];
  Map<String, dynamic>? _userStats;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadLeaderboard();
  }

  Future<void> _loadLeaderboard() async {
    setState(() {
      _isLoading = true;
    });
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final user = authProvider.user;
    final userId = user?['userId'];
    final college = user?['college'];
    final token = authProvider.token;
    try {
      // Global leaderboard
      final globalRes = await http.get(
        Uri.parse('${ApiEndpoints.leaderboard}/daily?userId=$userId'),
        headers: {'Authorization': 'Bearer $token'},
      );
      final collegeRes = await http.get(
        Uri.parse('${ApiEndpoints.leaderboard}/college?college=$college&userId=$userId'),
        headers: {'Authorization': 'Bearer $token'},
      );
      if (globalRes.statusCode == 200 && collegeRes.statusCode == 200) {
        final globalData = json.decode(globalRes.body);
        final collegeData = json.decode(collegeRes.body);
        setState(() {
          _globalLeaderboard = List<Map<String, dynamic>>.from(globalData['top100'] ?? []).where((user) => user['userId'] != null).toList();
          _collegeLeaderboard = List<Map<String, dynamic>>.from(collegeData['top100'] ?? []).where((user) => user['userId'] != null).toList();
          _userStats = globalData['userStats'];
          _isLoading = false;
        });
      } else {
        setState(() {
          _globalLeaderboard = [];
          _collegeLeaderboard = [];
          _userStats = null;
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _globalLeaderboard = [];
        _collegeLeaderboard = [];
        _userStats = null;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: ScreenUtils.getScaffold(
        context: context,
        title: 'Leaderboard',
        body: _isLoading
            ? UIUtils.getFullScreenLoading()
            : Column(
                children: [
                  // Tab Bar
                  TabBar(
                    controller: _tabController,
                    labelColor: AppColors.primary,
                    unselectedLabelColor: AppColors.textSecondary,
                    indicatorColor: AppColors.primary,
                    tabs: const [
                      Tab(text: 'Global'),
                      Tab(text: 'College'),
                    ],
                  ),
                  // User Stats Card
                  if (_userStats != null) _buildUserStatsCard(),
                  
                  // Leaderboard List
                  Expanded(
                    child: TabBarView(
                      controller: _tabController,
                      children: [
                        _buildLeaderboardList(_globalLeaderboard),
                        _buildLeaderboardList(_collegeLeaderboard),
                      ],
                    ),
                  ),
                ],
              ),
      ),
    );
  }

  Widget _buildUserStatsCard() {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [AppColors.primary, AppColors.secondary],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.2),
              borderRadius: BorderRadius.circular(25),
            ),
            child: const Center(
              child: Icon(
                Icons.person,
                color: Colors.white,
                size: 24,
              ),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Your Rank',
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.8),
                    fontSize: 14,
                  ),
                ),
                Text(
                  '#${_userStats!['rank']}',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                'Questions Solved',
                style: TextStyle(
                  color: Colors.white.withOpacity(0.8),
                  fontSize: 14,
                ),
              ),
              Text(
                '${_userStats!['score']}',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildLeaderboardList(List<Map<String, dynamic>> leaderboard) {
    if (leaderboard.isEmpty) {
      return Center(child: Text('No leaderboard data'));
    }
    return RefreshIndicator(
      onRefresh: _loadLeaderboard,
      child: ListView.builder(
        padding: UIUtils.paddingAllMedium,
        itemCount: leaderboard.length,
        itemBuilder: (context, index) {
          final entry = leaderboard[index];
          return _buildLeaderboardItem(entry, index);
        },
      ),
    );
  }

  Widget _buildLeaderboardItem(Map<String, dynamic> user, int index) {
    final rank = index + 1;
    final name = user['userName'] ?? user['name'] ?? 'User';
    final college = user['college'];
    final score = user['score'];
    final userId = user['userId'] ?? user['id'];
    return InkWell(
      onTap: () => _viewUserProfile(userId),
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.textSecondary.withOpacity(0.1)),
        ),
        child: Row(
          children: [
            // Rank
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: _getRankColor(rank).withOpacity(0.1),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Center(
                child: Text(
                  '#$rank',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: _getRankColor(rank),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    name,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  if (college != null && college.isNotEmpty)
                    Text(
                      college,
                      style: TextStyle(
                        fontSize: 12,
                        color: AppColors.textSecondary.withOpacity(0.8),
                      ),
                    ),
                ],
              ),
            ),
            const SizedBox(width: 16),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  'Questions Solved',
                  style: TextStyle(
                    fontSize: 12,
                    color: AppColors.textSecondary,
                  ),
                ),
                Text(
                  '$score',
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                    color: AppColors.primary,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Color _getRankColor(int rank) {
    if (rank == 1) return const Color(0xFFFFD700); // Gold
    if (rank == 2) return const Color(0xFFC0C0C0); // Silver
    if (rank == 3) return const Color(0xFFCD7F32); // Bronze
    return AppColors.textSecondary;
  }

  void _viewUserProfile(dynamic userId) {
    Navigator.pushNamed(context, '/search-profile', arguments: {'userId': userId});
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }
} 