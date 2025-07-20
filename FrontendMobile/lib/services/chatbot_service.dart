import 'dart:convert';
import 'package:http/http.dart' as http;
import '../utils/constants.dart';

class ChatbotService {
  static const String baseUrl = ApiEndpoints.chatbot;

  static Future<Map<String, dynamic>> sendMessage({
    required String message,
    required String token,
    required String userId,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/chat'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'message': message,
          'userId': int.parse(userId),
        }),
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Failed to send message: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error sending message: $e');
    }
  }

  static Future<Map<String, dynamic>> getExplanation({
    required int questionId,
    required String token,
  }) async {
    try {
      final response = await http.get(
        Uri.parse('${ApiEndpoints.chatbot}/explanation/$questionId'),
        headers: {
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Failed to get explanation: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error getting explanation: $e');
    }
  }
} 