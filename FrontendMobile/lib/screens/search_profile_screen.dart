import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../utils/constants.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../providers/auth_provider.dart';

class SearchProfileScreen extends StatefulWidget {
  const SearchProfileScreen({super.key});

  @override
  State<SearchProfileScreen> createState() => _SearchProfileScreenState();
}

class _SearchProfileScreenState extends State<SearchProfileScreen> {
  final TextEditingController _searchController = TextEditingController();
  bool _isSearching = false;
  List<Map<String, dynamic>> _searchResults = [];

  @override
  void initState() {
    super.initState();
    _loadAllProfiles();
  }

  Future<void> _loadAllProfiles() async {
    setState(() {
      _isSearching = true;
    });
    try {
      final response = await http.get(Uri.parse('${ApiEndpoints.profile}/all'));
      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        setState(() {
          _searchResults = data.cast<Map<String, dynamic>>();
          _isSearching = false;
        });
      } else {
        setState(() {
          _searchResults = [];
          _isSearching = false;
        });
      }
    } catch (e) {
      setState(() {
        _searchResults = [];
        _isSearching = false;
      });
    }
  }

  void _performSearch(String query) async {
    query = query.trim();
    if (query.isEmpty) {
      _loadAllProfiles();
      return;
    }
    if (query.length < 3) {
      setState(() {
        _searchResults = [];
      });
      return;
    }
    setState(() {
      _isSearching = true;
    });
    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final token = authProvider.token;
      final response = await http.get(
        Uri.parse('${ApiEndpoints.profile}/search?query=$query'),
        headers: {'Authorization': 'Bearer $token'},
      );
      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        setState(() {
          _searchResults = data.cast<Map<String, dynamic>>();
          _isSearching = false;
        });
      } else {
        setState(() {
          _searchResults = [];
          _isSearching = false;
        });
      }
    } catch (e) {
      setState(() {
        _searchResults = [];
        _isSearching = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Search Students'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        foregroundColor: AppColors.textPrimary,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: Column(
        children: [
          // Search Bar
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Search by name, email, or college...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          _searchController.clear();
                          _loadAllProfiles();
                        },
                      )
                    : null,
              ),
              onChanged: _performSearch,
            ),
          ),
          // Results
          Expanded(
            child: _isSearching
                ? const Center(child: CircularProgressIndicator())
                : _searchResults.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const SizedBox(height: 16),
                            const Text('No results found', style: TextStyle(fontSize: 18, color: AppColors.textSecondary)),
                            const SizedBox(height: 8),
                            const Text('Try a different search term', style: TextStyle(fontSize: 14, color: AppColors.textSecondary)),
                          ],
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _searchResults.length,
                        itemBuilder: (context, index) {
                          return _buildSearchResultCard(_searchResults[index]);
                        },
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchResultCard(Map<String, dynamic> user) {
    final name = user['name'] ?? 'Unknown';
    final email = user['email'] ?? '';
    final college = user['college'] ?? '';
    final role = user['role'] ?? '';
    final score = user['score'] ?? 0;
    final rank = user['rank'] ?? 'N/A';

    final displayInitial = (name.isNotEmpty) ? name[0].toUpperCase() : '?';

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        contentPadding: const EdgeInsets.all(16),
        leading: CircleAvatar(
          radius: 25,
          backgroundColor: AppColors.primary.withOpacity(0.1),
          child: Text(
            displayInitial,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppColors.primary,
            ),
          ),
        ),
        title: Text(
          name,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (email.isNotEmpty)
              Text(
                email,
                style: TextStyle(
                  fontSize: 12,
                  color: AppColors.textSecondary,
                ),
              ),
            if (college.isNotEmpty)
              Text(
                college,
                style: TextStyle(
                  fontSize: 12,
                  color: AppColors.textSecondary,
                ),
              ),
            const SizedBox(height: 8),
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    role,
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w600,
                      color: AppColors.primary,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  'Score: $score',
                  style: TextStyle(
                    fontSize: 12,
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  'Rank: $rank',
                  style: TextStyle(
                    fontSize: 12,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ],
        ),
        trailing: IconButton(
          icon: const Icon(Icons.visibility),
          onPressed: () => _viewUserProfile(user),
        ),
        onTap: () => _viewUserProfile(user),
      ),
    );
  }

  void _viewUserProfile(Map<String, dynamic> user) {
    // Navigate to user profile view
    // For now, show a dialog with user details
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(user['name'] ?? 'User Profile'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Email: ${user['email'] ?? 'N/A'}'),
            Text('College: ${user['college'] ?? 'N/A'}'),
            Text('Role: ${user['role'] ?? 'N/A'}'),
            Text('Score: ${user['score'] ?? 0}'),
            Text('Rank: ${user['rank'] ?? 'N/A'}'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }
}
