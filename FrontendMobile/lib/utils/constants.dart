import 'package:flutter/material.dart';

class AppColors {
  static const Color primary = Color(0xFF2563EB);
  static const Color secondary = Color(0xFF3B82F6);
  static const Color accent = Color(0xFF10B981);
  static const Color background = Color(0xFFF8FAFC);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color textPrimary = Color(0xFF1E293B);
  static const Color textSecondary = Color(0xFF64748B);
  static const Color error = Color(0xFFEF4444);
  static const Color success = Color(0xFF10B981);
  static const Color warning = Color(0xFFF59E0B);
  static const Color info = Color(0xFF3B82F6);
}

class ApiEndpoints {
  static const String baseUrl = 'http://10.0.2.2:8800/api';
  static const String auth = '$baseUrl/auth';
  static const String analytics = '$baseUrl/admin/analytics';
  static const String users = '$baseUrl/admin/users';
  static const String quiz = '$baseUrl/quiz';
  static const String profile = '$baseUrl/profile';
  static const String leaderboard = '$baseUrl/leaderboard';
  static const String classroom = '$baseUrl/classroom';
  static const String admin = '$baseUrl/admin';
  static const String chatbot = '$baseUrl/chatbot';
}

class AppConstants {
  static const String appName = 'QuizApp';
  static const String appVersion = '1.0.0';
  static const int maxStreakDays = 365;
  static const int dailyQuizTarget = 5;
}

class QuizCategories {
  static const List<String> categories = [
    'Algorithms',
    'Data Structures',
    'Database',
    'System Design',
    'Frontend',
    'Backend',
    'DevOps',
    'Mobile',
  ];
}

class QuizDifficulties {
  static const List<String> difficulties = [
    'Easy',
    'Medium',
    'Hard',
  ];
}
