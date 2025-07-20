import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../providers/auth_provider.dart';
import '../providers/profile_provider.dart';
import '../providers/theme_provider.dart';
import '../utils/constants.dart';
import '../utils/theme_colors.dart';
import '../utils/ui_utils.dart';
import '../utils/screen_utils.dart';
import '../widgets/custom_button.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final profileProvider = Provider.of<ProfileProvider>(context, listen: false);
    if (authProvider.user != null) {
      await profileProvider.fetchUserProfile(authProvider.user!['userId'], context: context);
    }
  }

  @override
  Widget build(BuildContext context) {
    return ScreenUtils.getScaffold(
      context: context,
      title: 'Profile',
      body: Consumer<AuthProvider>(
        builder: (context, authProvider, child) {
          if (authProvider.user == null) {
            return UIUtils.getFullScreenLoading();
          }

          return RefreshIndicator(
            onRefresh: _loadProfile,
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                _buildProfileHeader(authProvider),
                const SizedBox(height: 24),
                _buildStatsSection(),
                const SizedBox(height: 24),
                _buildStreakSection(),
                const SizedBox(height: 24),
                _buildSettingsSection(),
                const SizedBox(height: 24),
                _buildLogoutButton(authProvider),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildProfileHeader(AuthProvider authProvider) {
    final user = authProvider.user!;
    final userName = (user['name'] as String?)?.trim();
    final displayName = (userName != null && userName.isNotEmpty)
        ? userName
        : (user['email'] ?? 'User');

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        gradient: LinearGradient(
          colors: [
            ThemeColors.getPrimaryColor(context),
            ThemeColors.getSecondaryColor(context),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        boxShadow: [
          BoxShadow(
            color: ThemeColors.getShadowColor(context),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        children: [
          CircleAvatar(
            radius: 50,
            backgroundColor: Colors.white.withOpacity(0.2),
            child: Text(
              displayName[0].toUpperCase(),
              style: const TextStyle(
                fontSize: 40,
                color: Colors.white,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          const SizedBox(height: 16),
          Text(
            displayName,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            user['email'] ?? '',
            style: TextStyle(
              fontSize: 16,
              color: Colors.white.withOpacity(0.8),
            ),
          ),
          const SizedBox(height: 16),
          _buildContactInfo(),
        ],
      ),
    );
  }

  Widget _buildContactInfo() {
    return Consumer<ProfileProvider>(
      builder: (context, profileProvider, child) {
        final profile = profileProvider.userProfile;
        final mobileNumber = profile?['mobileNumber'] ?? '';
        
        // Handle different possible formats for links
        List<String> links = [];
        final linksData = profile?['links'];
        if (linksData != null) {
          if (linksData is List) {
            links = linksData.cast<String>();
          } else if (linksData is String) {
            // If it's a string, try to parse it as JSON
            try {
              final parsed = json.decode(linksData) as List;
              links = parsed.cast<String>();
            } catch (e) {
              // If parsing fails, treat it as a single link
              links = [linksData];
            }
          }
        }
        
        // Debug print to see what data we're getting
        print('Profile data: $profile');
        print('Links data: $links');
        print('Links type: ${links.runtimeType}');

        return Column(
          children: [
            // Mobile Number
            if (mobileNumber.isNotEmpty) ...[
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.phone, color: Colors.white, size: 18),
                  const SizedBox(width: 8),
                  Text(
                    mobileNumber,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                    ),
                  ),
                  const SizedBox(width: 8),
                  GestureDetector(
                    onTap: () => _showEditFieldDialog('Mobile Number', mobileNumber, (value) => _updateProfileField('mobileNumber', value)),
                    child: const Icon(Icons.edit, color: Colors.white, size: 16),
                  ),
                ],
              ),
              const SizedBox(height: 8),
            ] else ...[
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.phone, color: Colors.white, size: 18),
                  const SizedBox(width: 8),
                  const Text(
                    'Add mobile number',
                    style: TextStyle(color: Colors.white, fontSize: 14),
                  ),
                  const SizedBox(width: 8),
                  GestureDetector(
                    onTap: () => _showEditFieldDialog('Mobile Number', '', (value) => _updateProfileField('mobileNumber', value)),
                    child: const Icon(Icons.add, color: Colors.white, size: 16),
                  ),
                ],
              ),
              const SizedBox(height: 8),
            ],
            // Links
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.link, color: Colors.white, size: 18),
                const SizedBox(width: 8),
                if (links.isNotEmpty) ...[
                  Expanded(
                    child: Wrap(
                      spacing: 4,
                      children: links.take(3).map((link) => Container(
                        margin: const EdgeInsets.only(bottom: 4),
                        child: Chip(
                          label: Text(
                            link.length > 20 ? '${link.substring(0, 20)}...' : link,
                            style: const TextStyle(color: Colors.white, fontSize: 10),
                          ),
                          backgroundColor: Colors.white.withOpacity(0.2),
                          deleteIcon: const Icon(Icons.close, color: Colors.white, size: 14),
                          onDeleted: () => _removeLink(link, links),
                        ),
                      )).toList(),
                    ),
                  ),
                ] else ...[
                  const Expanded(
                    child: Text(
                      'No links added',
                      style: TextStyle(color: Colors.white, fontSize: 14),
                    ),
                  ),
                ],
                const SizedBox(width: 8),
                GestureDetector(
                  onTap: () => _showAddLinkDialog(links),
                  child: const Icon(Icons.add, color: Colors.white, size: 16),
                ),
                // Debug button to add a test link
                const SizedBox(width: 8),
                GestureDetector(
                  onTap: () => _addTestLink(links),
                  child: const Icon(Icons.bug_report, color: Colors.yellow, size: 16),
                ),
              ],
            ),
          ],
        );
      },
    );
  }

  Widget _buildStatsSection() {
    return Consumer<ProfileProvider>(
      builder: (context, profileProvider, child) {
        final profile = profileProvider.userProfile;
        
        return Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: ThemeColors.getCardColor(context),
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: ThemeColors.getShadowColor(context),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Statistics',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: ThemeColors.getTextPrimaryColor(context),
                ),
              ),
              const SizedBox(height: 20),
              Row(
                children: [
                  Expanded(
                    child: _buildStatCard(
                      'Total Quizzes',
                      profile?['totalQuizzesSolved']?.toString() ?? '0',
                      Icons.quiz,
                      ThemeColors.getInfoColor(context),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildStatCard(
                      'Days Active',
                      profile?['daysActive']?.toString() ?? '0',
                      Icons.calendar_today,
                      ThemeColors.getSuccessColor(context),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: _buildStatCard(
                      'Current Streak',
                      profile?['currentStreak']?.toString() ?? '0',
                      Icons.local_fire_department,
                      ThemeColors.getWarningColor(context),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildStatCard(
                      'Best Streak',
                      profile?['bestStreak']?.toString() ?? '0',
                      Icons.emoji_events,
                      ThemeColors.getAccentColor(context),
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 32),
          const SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: ThemeColors.getTextPrimaryColor(context),
            ),
          ),
          const SizedBox(height: 4),
          Text(
            title,
            style: TextStyle(
              fontSize: 12,
              color: ThemeColors.getTextSecondaryColor(context),
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildStreakSection() {
    return Consumer<ProfileProvider>(
      builder: (context, profileProvider, child) {
        final profile = profileProvider.userProfile;
        final currentStreak = profile?['currentStreak'] ?? 0;
        
        return Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: ThemeColors.getCardColor(context),
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: ThemeColors.getShadowColor(context),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(
                    Icons.local_fire_department,
                    color: ThemeColors.getWarningColor(context),
                    size: 24,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'Current Streak',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: ThemeColors.getTextPrimaryColor(context),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Text(
                    '$currentStreak',
                    style: TextStyle(
                      fontSize: 48,
                      fontWeight: FontWeight.bold,
                      color: ThemeColors.getWarningColor(context),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'days',
                        style: TextStyle(
                          fontSize: 16,
                          color: ThemeColors.getTextSecondaryColor(context),
                        ),
                      ),
                      if (currentStreak > 0)
                        Text(
                          'Keep it up! 🔥',
                          style: TextStyle(
                            fontSize: 14,
                            color: ThemeColors.getSuccessColor(context),
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                    ],
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildSettingsSection() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: ThemeColors.getCardColor(context),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: ThemeColors.getShadowColor(context),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Settings',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: ThemeColors.getTextPrimaryColor(context),
            ),
          ),
          const SizedBox(height: 16),
          _buildSettingTile(
            icon: Icons.dark_mode,
            title: 'Dark Mode',
            subtitle: 'Switch between light and dark themes',
            trailing: Consumer<ThemeProvider>(
              builder: (context, themeProvider, child) {
                return Switch(
                  value: themeProvider.isDarkMode,
                  onChanged: (value) => themeProvider.toggleTheme(),
                  activeColor: ThemeColors.getPrimaryColor(context),
                );
              },
            ),
          ),
          const SizedBox(height: 12),
          _buildSettingTile(
            icon: Icons.notifications,
            title: 'Notifications',
            subtitle: 'Manage notification preferences',
            trailing: Icon(
              Icons.arrow_forward_ios,
              color: ThemeColors.getTextSecondaryColor(context),
              size: 16,
            ),
            onTap: () {
              // TODO: Implement notifications settings
            },
          ),
          const SizedBox(height: 12),
          _buildSettingTile(
            icon: Icons.security,
            title: 'Privacy',
            subtitle: 'Manage your privacy settings',
            trailing: Icon(
              Icons.arrow_forward_ios,
              color: ThemeColors.getTextSecondaryColor(context),
              size: 16,
            ),
            onTap: () {
              // TODO: Implement privacy settings
            },
          ),
        ],
      ),
    );
  }

  Widget _buildSettingTile({
    required IconData icon,
    required String title,
    required String subtitle,
    Widget? trailing,
    VoidCallback? onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: ThemeColors.getDividerColor(context).withOpacity(0.3),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            Icon(
              icon,
              color: ThemeColors.getPrimaryColor(context),
              size: 24,
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: ThemeColors.getTextPrimaryColor(context),
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: TextStyle(
                      fontSize: 14,
                      color: ThemeColors.getTextSecondaryColor(context),
                    ),
                  ),
                ],
              ),
            ),
            if (trailing != null) trailing,
          ],
        ),
      ),
    );
  }

  Widget _buildLogoutButton(AuthProvider authProvider) {
    return CustomButton(
      text: 'Logout',
      onPressed: () async {
        final confirmed = await showDialog<bool>(
          context: context,
          builder: (context) => AlertDialog(
            title: Text(
              'Logout',
              style: TextStyle(
                color: ThemeColors.getTextPrimaryColor(context),
              ),
            ),
            content: Text(
              'Are you sure you want to logout?',
              style: TextStyle(
                color: ThemeColors.getTextSecondaryColor(context),
              ),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context, false),
                child: Text(
                  'Cancel',
                  style: TextStyle(
                    color: ThemeColors.getTextSecondaryColor(context),
                  ),
                ),
              ),
              ElevatedButton(
                onPressed: () => Navigator.pop(context, true),
                style: ElevatedButton.styleFrom(
                  backgroundColor: ThemeColors.getErrorColor(context),
                ),
                child: const Text('Logout'),
              ),
            ],
          ),
        );

        if (confirmed == true) {
          authProvider.logout();
          Navigator.pushNamedAndRemoveUntil(context, '/login', (route) => false);
        }
      },
      backgroundColor: ThemeColors.getErrorColor(context),
    );
  }

  void _showEditFieldDialog(String field, String currentValue, Function(String) onSave) {
    final controller = TextEditingController(text: currentValue);
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(
          'Edit $field',
          style: TextStyle(
            color: ThemeColors.getTextPrimaryColor(context),
          ),
        ),
        content: TextField(
          controller: controller,
          decoration: InputDecoration(
            labelText: field,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(
              'Cancel',
              style: TextStyle(
                color: ThemeColors.getTextSecondaryColor(context),
              ),
            ),
          ),
          ElevatedButton(
            onPressed: () {
              onSave(controller.text.trim());
              Navigator.pop(context);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: ThemeColors.getPrimaryColor(context),
            ),
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  void _showAddLinkDialog(List<String> currentLinks) {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(
          'Add Link',
          style: TextStyle(
            color: ThemeColors.getTextPrimaryColor(context),
          ),
        ),
        content: TextField(
          controller: controller,
          decoration: InputDecoration(
            labelText: 'Link URL',
            hintText: 'https://example.com',
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(
              'Cancel',
              style: TextStyle(
                color: ThemeColors.getTextSecondaryColor(context),
              ),
            ),
          ),
          ElevatedButton(
            onPressed: () {
              final newLink = controller.text.trim();
              if (newLink.isNotEmpty && !currentLinks.contains(newLink)) {
                final updatedLinks = List<String>.from(currentLinks)..add(newLink);
                _updateProfileField('links', updatedLinks);
              }
              Navigator.pop(context);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: ThemeColors.getPrimaryColor(context),
            ),
            child: const Text('Add'),
          ),
        ],
      ),
    );
  }

  void _removeLink(String link, List<String> currentLinks) {
    final updatedLinks = List<String>.from(currentLinks)..remove(link);
    _updateProfileField('links', updatedLinks);
  }

  void _addTestLink(List<String> currentLinks) {
    final testLink = 'https://test-link-${DateTime.now().millisecondsSinceEpoch}.com';
    final updatedLinks = List<String>.from(currentLinks)..add(testLink);
    _updateProfileField('links', updatedLinks);
  }

  Future<void> _updateProfileField(String field, dynamic value) async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final profileProvider = Provider.of<ProfileProvider>(context, listen: false);
    final token = authProvider.token;
    final userId = authProvider.user?['userId'];
    
    if (userId == null || token == null) return;
    
    try {
      final url = Uri.parse('${ApiEndpoints.profile}/update');
      final body = {'userId': userId};
      
      if (field == 'mobileNumber') body['mobileNumber'] = value;
      if (field == 'links') body['links'] = value;
      
      final response = await http.patch(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: json.encode(body),
      );
      
      if (response.statusCode == 200) {
        // Refresh profile data
        await profileProvider.fetchUserProfile(userId, context: context);
        
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Profile updated successfully!'),
            backgroundColor: ThemeColors.getSuccessColor(context),
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Failed to update profile.'),
            backgroundColor: ThemeColors.getErrorColor(context),
          ),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Network error. Please try again.'),
          backgroundColor: ThemeColors.getErrorColor(context),
        ),
      );
    }
  }
}