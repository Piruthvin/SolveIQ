import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../utils/constants.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';

class ProfileProvider extends ChangeNotifier {
  bool _isLoading = false;
  Map<String, dynamic>? _userProfile;
  List<Map<String, dynamic>> _searchResults = [];
  bool get isLoading => _isLoading;
  Map<String, dynamic>? get userProfile => _userProfile;
  List<Map<String, dynamic>> get searchResults => _searchResults;

  Future<void> fetchUserProfile(int userId, {BuildContext? context}) async {
    _isLoading = true;
    notifyListeners();

    try {
      String? token;
      if (context != null) {
        final authProvider = Provider.of<AuthProvider>(context, listen: false);
        token = authProvider.token;
      }
      print("=== PROFILE PROVIDER DEBUG: Fetching profile for user $userId ===");
      final response = await http.get(
        Uri.parse('${ApiEndpoints.profile}?userId=$userId'),
        headers: token != null ? {'Authorization': 'Bearer $token'} : {},
      );
      print("Profile response status: ${response.statusCode}");
      if (response.statusCode == 200) {
        _userProfile = json.decode(response.body);
        print("Profile data received: $_userProfile");
        print("Current streak from API: ${_userProfile?['currentStreak']}");
        if (_userProfile != null && _userProfile!['links'] is List) {
          _userProfile!['links'] = List<String>.from(_userProfile!['links']);
        } else {
          _userProfile!['links'] = <String>[];
        }
      } else {
        print("Profile fetch failed with status: ${response.statusCode}");
        _userProfile = null;
      }
    } catch (e) {
      print("Profile fetch error: $e");
      _userProfile = null;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> searchStudents(String query, {BuildContext? context}) async {
    _isLoading = true;
    notifyListeners();

    try {
      String? token;
      if (context != null) {
        final authProvider = Provider.of<AuthProvider>(context, listen: false);
        token = authProvider.token;
      }
      final response = await http.get(
        Uri.parse('${ApiEndpoints.profile}/search?query=$query'),
        headers: token != null ? {'Authorization': 'Bearer $token'} : {},
      );
      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        _searchResults = data.cast<Map<String, dynamic>>();
      }
    } catch (e) {
      // Error searching students
    }

    _isLoading = false;
    notifyListeners();
  }

  
  Future<Map<String, dynamic>?> getPublicProfile(int userId, {BuildContext? context}) async {
    try {
      String? token;
      if (context != null) {
        final authProvider = Provider.of<AuthProvider>(context, listen: false);
        token = authProvider.token;
      }
      final response = await http.get(
        Uri.parse('${ApiEndpoints.profile}/public/$userId'),
        headers: token != null ? {'Authorization': 'Bearer $token'} : {},
      );
      if (response.statusCode ==200) {
        return json.decode(response.body);
      }
    } catch (e) {
      // Error fetching public profile
    }
    return null;
  }



  Future<List<Map<String, dynamic>>> fetchAllProfiles({BuildContext? context}) async {
    try {
      String? token;
      if (context != null) {
        final authProvider = Provider.of<AuthProvider>(context, listen: false);
        token = authProvider.token;
      }
      final response = await http.get(
        Uri.parse('${ApiEndpoints.profile}/all'),
        headers: token != null ? {'Authorization': 'Bearer $token'} : {},
      );
      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.cast<Map<String, dynamic>>();
      }
    } catch (e) {
      // Error fetching all profiles
    }
    return [];
  }

  void clearSearchResults() {
    _searchResults = [];
    notifyListeners();
  }

  String getStreakEmoji(int streak) {
    if (streak >=10) return '🔥��🔥';
    if (streak >= 50) return '🔥🔥';
    if (streak >=10) return '🔥';
    if (streak >= 5) return '⚡';
    return '📚';
  }

  String getRankColor(String rank) {
    if (rank.contains('Top 10')) return '#FFD700'; // Gold
    if (rank.contains('Top 50')) return '#C0C0C0'; // Silver
    if (rank.contains('Top 100')) return '#CD7F32'; // Bronze
    return '#686868'; // Gray
  }



  Future<void> uploadProfilePicture(int userId, String token, String filePath) async {
    _isLoading = true;
    notifyListeners();
    try {
      var request = http.MultipartRequest(
        'PATCH',
        Uri.parse('${ApiEndpoints.profile}/profile-picture?userId=$userId'),
      );
      request.headers['Authorization'] = 'Bearer $token';
      request.files.add(await http.MultipartFile.fromPath('file', filePath));
      var response = await request.send();
      if (response.statusCode == 200) {
        final respStr = await response.stream.bytesToString();
        _userProfile = json.decode(respStr);
        // Ensure links is always a List<String>
        if (_userProfile != null && _userProfile!['links'] is List) {
          _userProfile!['links'] = List<String>.from(_userProfile!['links']);
        } else {
          _userProfile!['links'] = <String>[];
        }
      }
    } catch (e) {
      // Error uploading profile picture
    }
    _isLoading = false;
    notifyListeners();
  }
} 