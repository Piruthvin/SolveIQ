import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'providers/auth_provider.dart';
import 'providers/quiz_provider.dart';
import 'providers/profile_provider.dart';
import 'providers/chatbot_provider.dart';
import 'providers/theme_provider.dart';
import 'screens/login_screen.dart';
import 'screens/signup_screen.dart';
import 'screens/home_screen.dart';
import 'screens/quiz_play_screen.dart';
import 'screens/solved_quizzes_screen.dart';
import 'screens/leaderboard_screen.dart';
import 'screens/profile_screen.dart';
import 'screens/classroom_screen.dart';
import 'screens/classroom_details_screen.dart';
import 'screens/admin_screen.dart';
import 'screens/search_profile_screen.dart';
import 'screens/chatbot_screen.dart';
import 'screens/main_screen.dart';
import 'utils/constants.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await SharedPreferences.getInstance();
  runApp(const QuizApp());
}

class QuizApp extends StatelessWidget {
  const QuizApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => QuizProvider()),
        ChangeNotifierProvider(create: (_) => ProfileProvider()),
        ChangeNotifierProvider(create: (_) => ChatbotProvider()),
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
      ],
      child: Consumer<ThemeProvider>(
        builder: (context, themeProvider, child) {
          return MaterialApp(
            title: 'Quiz App',
            debugShowCheckedModeBanner: false,
            theme: themeProvider.currentTheme.copyWith(
              textTheme: GoogleFonts.poppinsTextTheme(themeProvider.currentTheme.textTheme),
            ),
        initialRoute: '/login',
        routes: {
          '/login': (context) => const LoginScreen(),
          '/signup': (context) => const SignupScreen(),
          '/home': (context) => const HomeScreen(),
          '/quiz': (context) => const QuizPlayScreen(),
          '/solved-quizzes': (context) => const SolvedQuizzesScreen(),
          '/leaderboard': (context) => const LeaderboardScreen(),
          '/profile': (context) => const ProfileScreen(),
          '/classroom': (context) => const ClassroomScreen(),
          '/classroom-details': (context) => const ClassroomDetailsScreen(),
          '/admin': (context) => const AdminScreen(),
          '/search-profile': (context) => const SearchProfileScreen(),
          '/chatbot': (context) => const ChatbotScreen(),
        },
        home: MainScreen(),
          );
        },
      ),
    );
  }
}
