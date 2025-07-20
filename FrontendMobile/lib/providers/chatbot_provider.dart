import 'package:flutter/foundation.dart';
import '../services/chatbot_service.dart';

class ChatMessage {
  final String message;
  final bool isUser;
  final DateTime timestamp;

  ChatMessage({
    required this.message,
    required this.isUser,
    required this.timestamp,
  });
}

class ChatbotProvider with ChangeNotifier {
  List<ChatMessage> _messages = [];
  bool _isLoading = false;
  String? _error;

  List<ChatMessage> get messages => _messages;
  bool get isLoading => _isLoading;
  String? get error => _error;

  void addUserMessage(String message) {
    _messages.add(ChatMessage(
      message: message,
      isUser: true,
      timestamp: DateTime.now(),
    ));
    notifyListeners();
  }

  void addBotMessage(String message) {
    _messages.add(ChatMessage(
      message: message,
      isUser: false,
      timestamp: DateTime.now(),
    ));
    notifyListeners();
  }

  Future<void> sendMessage(String message, String token, String userId) async {
    if (message.trim().isEmpty) return;

    _isLoading = true;
    _error = null;
    notifyListeners();

    addUserMessage(message);

    try {
      final response = await ChatbotService.sendMessage(
        message: message,
        token: token,
        userId: userId,
      );

      final botResponse = response['response'] ?? 'Sorry, I could not process your request.';
      addBotMessage(botResponse);
    } catch (e) {
      _error = e.toString();
      addBotMessage('Sorry, I encountered an error. Please try again.');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> getExplanation(int questionId, String token) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await ChatbotService.getExplanation(
        questionId: questionId,
        token: token,
      );

      final explanation = response['explanation'] ?? 'No explanation available.';
      addBotMessage(explanation);
    } catch (e) {
      _error = e.toString();
      addBotMessage('Sorry, I could not get the explanation for this question.');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void clearMessages() {
    _messages.clear();
    _error = null;
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
} 