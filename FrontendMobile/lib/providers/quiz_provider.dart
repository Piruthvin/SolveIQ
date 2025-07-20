import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../utils/constants.dart';

class QuizProvider extends ChangeNotifier {
  bool _isLoading = false;
  List<Map<String, dynamic>> _quizzes = [];
  Map<String, dynamic>? _currentQuiz;
  List<Map<String, dynamic>> _solvedQuizzes = [];
  List<Map<String, dynamic>> _questions = [];
  List<Map<String, dynamic>> _quizList = [];

  bool get isLoading => _isLoading;
  List<Map<String, dynamic>> get quizzes => _quizzes;
  List<Map<String, dynamic>> get solvedQuizzes => _solvedQuizzes;
  Map<String, dynamic>? get currentQuiz => _currentQuiz;
  List<Map<String, dynamic>> get questions => _questions;
  List<Map<String, dynamic>> get quizList => _quizList;

  Future<void> fetchQuizzes() async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await http.get(Uri.parse('${ApiEndpoints.quiz}/all'));
      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        _quizzes = data.cast<Map<String, dynamic>>();
      }
    } catch (e) {
      // Error fetching quizzes
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> fetchSolvedQuizzes(int userId) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await http.get(
        Uri.parse('${ApiEndpoints.quiz}/solved?userId=$userId'),
      );
      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        _solvedQuizzes = data.cast<Map<String, dynamic>>();
      }
    } catch (e) {
      // Error fetching solved quizzes
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> generateQuiz({
    required String knowledgeLevel,
    required String difficulty,
    required String topic,
    required int userId,
    int numQuestions = 5,
  }) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await http.post(
        Uri.parse('${ApiEndpoints.chatbot}/generate-quiz'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'knowledgeLevel': knowledgeLevel,
          'difficulty': difficulty,
          'topic': topic,
          'numQuestions': numQuestions,
          'userId': userId,
        }),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        
        _currentQuiz = {
          'id': data['quizId'],
          'title': data['title'],
          'category': data['category'],
          'difficulty': data['difficulty'],
          'knowledgeLevel': data['knowledgeLevel'],
          'questions': data['questions'],
        };
        
        _questions = List<Map<String, dynamic>>.from(_currentQuiz!['questions']);
      } else {
        _generateMockQuiz(knowledgeLevel, difficulty, topic);
      }
    } catch (e) {
      _generateMockQuiz(knowledgeLevel, difficulty, topic);
    }

    _isLoading = false;
    notifyListeners();
  }

  void _generateMockQuiz(String knowledgeLevel, String difficulty, String topic) {
    _currentQuiz = {
      'id': DateTime.now().millisecondsSinceEpoch,
      'title': '$topic Quiz - $difficulty',
      'category': topic,
      'difficulty': difficulty,
      'knowledgeLevel': knowledgeLevel,
      'questions': [
        {
          'id': 1,
          'questionText': 'What is the time complexity of binary search?',
          'options': ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
          'correctAnswer': 'O(log n)',
        },
        {
          'id': 2,
          'questionText': 'Which data structure uses LIFO?',
          'options': ['Queue', 'Stack', 'Tree', 'Graph'],
          'correctAnswer': 'Stack',
        },
        {
          'id': 3,
          'questionText': 'What is the primary purpose of a hash table?',
          'options': ['Sorting', 'Searching', 'Fast lookup', 'Memory management'],
          'correctAnswer': 'Fast lookup',
        },
      ],
    };
    _questions = List<Map<String, dynamic>>.from(_currentQuiz!['questions']);
  }

  Future<String> submitQuiz({
    required int userId,
    required int quizId,
    required Map<int, String> answers,
  }) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await http.post(
        Uri.parse('${ApiEndpoints.quiz}/submit'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'userId': userId,
          'quizId': quizId,
          'answers': answers,
        }),
      );

      if (response.statusCode == 200) {
        final result = response.body;
        _currentQuiz = null;
        _questions = [];
        _isLoading = false;
        notifyListeners();
        return result;
      }
    } catch (e) {
      // Error submitting quiz
    }

    _isLoading = false;
    notifyListeners();
    return 'Submission failed';
  }

  void clearCurrentQuiz() {
    _currentQuiz = null;
    _questions = [];
    notifyListeners();
  }

  void clearRandomQuizzes() {
    _quizzes = [];
    notifyListeners();
  }

  Map<String, int> getQuizStats() {
    final totalQuizzes = _quizzes.length;
    final solvedCount = _solvedQuizzes.length;
    final availableCount = totalQuizzes - solvedCount;

    return {
      'total': totalQuizzes,
      'solved': solvedCount,
      'available': availableCount,
    };
  }

  List<Map<String, dynamic>> getQuizzesByCategory(String category) {
    return _quizzes.where((quiz) => quiz['category'] == category).toList();
  }

  List<Map<String, dynamic>> getQuizzesByDifficulty(String difficulty) {
    return _quizzes.where((quiz) => quiz['difficulty'] == difficulty).toList();
  }

  Future<void> fetchQuizList({String? topic, String? knowledgeLevel, required int userId, required String token}) async {
    _isLoading = true;
    notifyListeners();
    String urlStr = '${ApiEndpoints.quiz}/list?userId=$userId';
    if (topic != null) urlStr += '&topic=$topic';
    if (knowledgeLevel != null) urlStr += '&knowledgeLevel=$knowledgeLevel';
    final url = Uri.parse(urlStr);
    final response = await http.get(url, headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    });
    if (response.statusCode == 200) {
      _quizList = List<Map<String, dynamic>>.from(json.decode(response.body));
    }
    _isLoading = false;
    notifyListeners();
  }

  Future<void> fetchRandomUnsolvedQuizzes({
    required int userId,
    required String token,
    String? topic,
    int count = 5,
  }) async {
    _isLoading = true;
    notifyListeners();
    
    try {
      String urlStr = '${ApiEndpoints.quiz}/random-unsolved?userId=$userId&count=$count';
      if (topic != null && topic.isNotEmpty) {
        urlStr += '&topic=$topic';
      }
      
      final url = Uri.parse(urlStr);
      final response = await http.get(url, headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      });
      
      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        _quizzes = data.cast<Map<String, dynamic>>();
        print('Fetched ${_quizzes.length} random unsolved quizzes');
      } else {
        print('Failed to fetch random unsolved quizzes: ${response.statusCode}');
      }
    } catch (e) {
      print('Error fetching random unsolved quizzes: $e');
    }
    
    _isLoading = false;
    notifyListeners();
  }
} 