import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;

import '../providers/auth_provider.dart' as local_auth;
import '../utils/constants.dart';
import '../utils/ui_utils.dart';
import '../utils/widget_utils.dart';
import '../utils/screen_utils.dart';
import '../widgets/custom_button.dart';
import '../widgets/custom_text_field.dart';
import 'main_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;

  @override
  Widget build(BuildContext context) {
    return ScreenUtils.getScaffoldWithoutAppBar(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: UIUtils.paddingAllLarge,
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 60),
                Center(
                  child: Column(
                    children: [
                      Container(
                        width: 80,
                        height: 80,
                        decoration: BoxDecoration(
                          color: AppColors.primary,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: const Icon(
                          Icons.quiz,
                          size: 40,
                          color: Colors.white,
                        ),
                      ),
                      WidgetUtils.spaceLarge,
                      Text(
                        'Welcome Back!',
                        style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                              color: AppColors.textPrimary,
                            ),
                      ),
                      WidgetUtils.spaceSmall,
                      Text(
                        'Sign in to continue your learning journey',
                        style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                              color: AppColors.textSecondary,
                            ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 48),
                CustomTextField(
                  controller: _emailController,
                  labelText: 'Email',
                  hintText: 'Enter your email',
                  prefixIcon: Icons.email_outlined,
                  keyboardType: TextInputType.emailAddress,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter your email';
                    }
                    if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(value)) {
                      return 'Please enter a valid email';
                    }
                    return null;
                  },
                ),
                WidgetUtils.spaceMedium,
                CustomTextField(
                  controller: _passwordController,
                  labelText: 'Password',
                  hintText: 'Enter your password',
                  prefixIcon: Icons.lock_outlined,
                  obscureText: _obscurePassword,
                  suffixIcon: IconButton(
                    icon: Icon(
                      _obscurePassword ? Icons.visibility : Icons.visibility_off,
                      color: AppColors.textSecondary,
                    ),
                    onPressed: () {
                      setState(() {
                        _obscurePassword = !_obscurePassword;
                      });
                    },
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter your password';
                    }
                    if (value.length < 6) {
                      return 'Password must be at least 6 characters';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 24),
                Consumer<local_auth.AuthProvider>(
                  builder: (context, authProvider, child) {
                    final error = authProvider?.error ?? '';
                    if (error.isNotEmpty) {
                      // Show error message
                    }
                    return CustomButton(
                      text: 'Sign In',
                      isLoading: authProvider?.isLoading ?? false,
                      onPressed: () => _handleLogin(authProvider!),
                    );
                  },
                ),
                const SizedBox(height: 24),
                Row(
                  children: [
                    Expanded(child: Divider(color: AppColors.textSecondary.withAlpha(76))),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: Text(
                        'OR',
                        style: TextStyle(color: AppColors.textSecondary),
                      ),
                    ),
                    Expanded(child: Divider(color: AppColors.textSecondary.withAlpha(76))),
                  ],
                ),
                const SizedBox(height: 24),
                OutlinedButton.icon(
                  onPressed: _handleGoogleSignIn,
                  icon: Image.asset(
                    'assets/icons/google.png',
                    height: 24,
                    width: 24,
                  ),
                  label: const Text('Continue with Google'),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    side: BorderSide(color: AppColors.textSecondary.withAlpha(76)),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
                const SizedBox(height: 32),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      "Don't have an account? ",
                      style: TextStyle(color: AppColors.textSecondary),
                    ),
                    GestureDetector(
                      onTap: () => Navigator.pushNamed(context, '/signup'),
                      child: Text(
                        'Sign Up',
                        style: TextStyle(
                          color: AppColors.primary,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _handleLogin(local_auth.AuthProvider authProvider) async {
    if (!_formKey.currentState!.validate()) return;

    final loginSuccess = await authProvider.login(
      _emailController.text.trim(),
      _passwordController.text,
    );

    if (loginSuccess && mounted) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => MainScreen()),
      );
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Login failed. Please check your credentials.'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  Future<void> _handleGoogleSignIn() async {
    try {
      final GoogleSignIn googleSignIn = GoogleSignIn();
      final GoogleSignInAccount? account = await googleSignIn.signIn();

      if (account != null) {
        final GoogleSignInAuthentication googleAuth = await account.authentication;
        // Use Firebase Auth to get a real idToken
        final credential = GoogleAuthProvider.credential(
          accessToken: googleAuth.accessToken,
          idToken: googleAuth.idToken,
        );
        final userCredential = await FirebaseAuth.instance.signInWithCredential(credential);
        final idToken = await userCredential.user?.getIdToken();

        // Prompt for extra fields
        final result = await _showGoogleSignInDialog(account);

        if (result != null && mounted && idToken != null) {
          final authProvider = Provider.of<local_auth.AuthProvider>(context, listen: false);
          final success = await authProvider.googleSignIn(
            idToken: idToken,
            name: result['name']!,
            email: account.email,
            college: result['college']!,
            mobileNumber: result['mobileNumber']!,
            role: result['role']!,
          );

          if (success && mounted) {
            Navigator.pushReplacementNamed(context, '/home');
          }
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Google Sign-In failed: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  Future<Map<String, String>?> _showGoogleSignInDialog(GoogleSignInAccount account) async {
    final nameController = TextEditingController(text: account.displayName);
    final collegeController = TextEditingController();
    final mobileController = TextEditingController();
    String selectedRole = 'STUDENT';

    return showDialog<Map<String, String>>(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: const Text('Complete Your Profile'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            CustomTextField(
              controller: nameController,
              labelText: 'Full Name',
              hintText: 'Enter your full name',
            ),
            const SizedBox(height: 16),
            CustomTextField(
              controller: collegeController,
              labelText: 'College',
              hintText: 'Enter your college name',
            ),
            const SizedBox(height: 16),
            CustomTextField(
              controller: mobileController,
              labelText: 'Mobile Number',
              hintText: 'Enter your mobile number',
              keyboardType: TextInputType.phone,
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              value: selectedRole,
              decoration: const InputDecoration(
                labelText: 'Role',
                border: OutlineInputBorder(),
              ),
              items: const [
                DropdownMenuItem(value: 'STUDENT', child: Text('Student')),
                DropdownMenuItem(value: 'TEACHER', child: Text('Teacher')),
              ],
              onChanged: (value) => selectedRole = value!,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              if (nameController.text.isNotEmpty &&
                  collegeController.text.isNotEmpty &&
                  mobileController.text.isNotEmpty) {
                Navigator.pop(context, {
                  'name': nameController.text,
                  'college': collegeController.text,
                  'mobileNumber': mobileController.text,
                  'role': selectedRole,
                });
              }
            },
            child: const Text('Continue'),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }
}
