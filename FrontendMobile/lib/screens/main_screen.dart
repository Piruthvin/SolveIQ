import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../widgets/bottom_nav_bar.dart';
import 'home_screen.dart';
import 'quiz_play_screen.dart';
import 'leaderboard_screen.dart';
import 'profile_screen.dart';
import 'admin_screen.dart';
import '../providers/auth_provider.dart';

class MainScreen extends StatefulWidget {
  const MainScreen({Key? key}) : super(key: key);

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _selectedIndex = 0;

  List<Widget> _getScreens(bool isAdmin) {
    final screens = [
      HomeScreen(),
      QuizPlayScreen(),
      LeaderboardScreen(),
      ProfileScreen(),
    ];
    if (isAdmin) {
      screens.add(AdminScreen());
    }
    return screens;
  }

  @override
  Widget build(BuildContext context) {
    final user = Provider.of<AuthProvider>(context).user;
    final isAdmin = user != null && user['role'] == 'ADMIN';
    final screens = _getScreens(isAdmin);
    return Scaffold(
      body: screens[_selectedIndex],
      bottomNavigationBar: BottomNavBar(
        currentIndex: _selectedIndex,
        onTap: (index) => setState(() => _selectedIndex = index),
        isAdmin: isAdmin,
      ),
    );
  }
} 