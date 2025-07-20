import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../utils/constants.dart';

class AuthProvider extends ChangeNotifier {
  bool _isLoading = false;
  bool _isAuthenticated = false;
  String? _token;
  Map<String, dynamic>? _user;
  String? error;

  bool get isLoading => _isLoading;
  bool get isAuthenticated => _isAuthenticated;
  String? get token => _token;
  Map<String, dynamic>? get user => _user;

  Future<void> checkAuthStatus() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('token');
    final userData = prefs.getString('user');
    if (_token != null && userData != null) {
      _user = json.decode(userData);
      _isAuthenticated = true;
      notifyListeners();
    }
  }

  Future<bool> login(String email, String password) async {
    error = null;
    _isLoading = true;
    notifyListeners();

    try {
      final response = await http.post(
        Uri.parse('${ApiEndpoints.auth}/login'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'email': email,
          'password': password,
        }),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        _token = data['token'];
        _user = data['user']; // Store user info from backend
        _isAuthenticated = true;
        error = null;
        // Save to SharedPreferences
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('token', _token!);
        await prefs.setString('user', json.encode(_user));
        // Fetch user data
        await _fetchUserData();
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        error = 'Login failed';
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      error = 'Login failed';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> register({
    required String name,
    required String email,
    required String password,
    required String college,
    required String mobileNumber,
    required String role,
  }) async {
    error = null;
    _isLoading = true;
    notifyListeners();

    try {
      final response = await http.post(
        Uri.parse('${ApiEndpoints.auth}/register'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'name': name,
          'email': email,
          'password': password,
          'college': college,
          'mobileNumber': mobileNumber,
          'role': role,
        }),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        _token = data['token'];
        _isAuthenticated = true;
        error = null;
        
        // Save to SharedPreferences
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('token', _token!);
        
        // Fetch user data
        await _fetchUserData();
        
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        error = 'Registration failed';
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      error = 'Registration failed';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> googleSignIn({
    required String idToken,
    required String name,
    required String email,
    required String college,
    required String mobileNumber,
    required String role,
  }) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await http.post(
        Uri.parse('${ApiEndpoints.auth}/google-signin'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'idToken': idToken,
          'name': name,
          'email': email,
          'college': college,
          'mobileNumber': mobileNumber,
          'role': role,
        }),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        _token = data['token'];
        _isAuthenticated = true;
        
        // Save to SharedPreferences
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('token', _token!);
        
        // Fetch user data
        await _fetchUserData();
        
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> loginWithGoogleBackendResponse(Map<String, dynamic> data) async {
    _token = data['token'];
    _user = data['user'] ?? data['profile'] ?? {};
    _isAuthenticated = true;
    error = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('token', _token!);
    await prefs.setString('user', json.encode(_user));
    notifyListeners();
  }

  Future<void> _fetchUserData() async {
    if (_token == null) return;

    try {
      final url = '${ApiEndpoints.profile}?userId=${_user?['userId']}';
      final response = await http.get(
        Uri.parse(url),
        headers: {
          'Authorization': 'Bearer $_token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        _user = json.decode(response.body);
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('user', json.encode(_user));
        notifyListeners();
      }
    } catch (e) {
      // Error fetching user data
    }
  }

  Future<void> logout() async {
    _isAuthenticated = false;
    _token = null;
    _user = null;
    
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    await prefs.remove('user');
    
    notifyListeners();
  }

  Future<void> sendVerificationEmail(String email) async {
    try {
      await http.post(
        Uri.parse('${ApiEndpoints.auth}/send-verification-email'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'email': email}),
      );
    } catch (e) {
      // Error sending verification email
    }
  }

  Future<bool> changePassword(String currentPassword, String newPassword) async {
    if (_user == null || _user!['email'] == null) {
      return false;
    }

    try {
      final requestBody = {
        'email': _user!['email'],
        'currentPassword': currentPassword,
        'newPassword': newPassword,
      };
      
      final response = await http.post(
        Uri.parse('${ApiEndpoints.auth}/change-password'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $_token',
        },
        body: json.encode(requestBody),
      );

      if (response.statusCode == 200) {
        return true;
      } else {
        final errorData = json.decode(response.body);
        error = errorData['message'] ?? 'Failed to change password';
        return false;
      }
    } catch (e) {
      error = 'Network error. Please check your connection.';
      return false;
    }
  }
} 