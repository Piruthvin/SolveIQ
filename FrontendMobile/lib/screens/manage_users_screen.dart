import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../utils/constants.dart';
import '../providers/auth_provider.dart';
import 'package:provider/provider.dart';

class ManageUsersScreen extends StatefulWidget {
  @override
  _ManageUsersScreenState createState() => _ManageUsersScreenState();
}

class _ManageUsersScreenState extends State<ManageUsersScreen> {
  List<dynamic> users = [];
  bool isLoading = true;
  String message = '';

  @override
  void initState() {
    super.initState();
    fetchUsers();
  }

  Future<void> fetchUsers() async {
    setState(() => isLoading = true);
    final token = Provider.of<AuthProvider>(context, listen: false).token;
    final response = await http.get(
      Uri.parse(ApiEndpoints.users),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );
    if (response.statusCode == 200) {
      setState(() {
        users = jsonDecode(response.body);
        isLoading = false;
      });
    } else {
      setState(() {
        isLoading = false;
        message = 'Failed to fetch users';
      });
    }
  }

  Future<void> deleteUser(int userId) async {
    final token = Provider.of<AuthProvider>(context, listen: false).token;
    final response = await http.delete(
      Uri.parse('${ApiEndpoints.users}/$userId'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );
    if (response.statusCode == 200) {
      setState(() {
        users.removeWhere((u) => u['id'] == userId);
      });
    } else {
      setState(() {
        message = 'Failed to delete user';
      });
    }
  }

  void _showAddUserDialog() {
    String name = '', email = '', password = '', role = 'STUDENT', college = '';
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Add User'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  decoration: const InputDecoration(labelText: 'Name'),
                  onChanged: (val) => name = val,
                ),
                TextField(
                  decoration: const InputDecoration(labelText: 'Email'),
                  onChanged: (val) => email = val,
                ),
                TextField(
                  decoration: const InputDecoration(labelText: 'Password'),
                  obscureText: true,
                  onChanged: (val) => password = val,
                ),
                TextField(
                  decoration: const InputDecoration(labelText: 'College'),
                  onChanged: (val) => college = val,
                ),
                DropdownButtonFormField<String>(
                  value: role,
                  items: const [
                    DropdownMenuItem(value: 'STUDENT', child: Text('Student')),
                    DropdownMenuItem(value: 'TEACHER', child: Text('Teacher')),
                    DropdownMenuItem(value: 'ADMIN', child: Text('Admin')),
                  ],
                  onChanged: (val) => role = val!,
                  decoration: const InputDecoration(labelText: 'Role'),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () async {
                final token = Provider.of<AuthProvider>(context, listen: false).token;
                final response = await http.post(
                  Uri.parse(ApiEndpoints.users),
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer $token',
                  },
                  body: jsonEncode({
                    'name': name,
                    'email': email,
                    'password': password,
                    'role': role,
                    'college': college,
                  }),
                );
                if (response.statusCode == 200) {
                  Navigator.pop(context);
                  fetchUsers();
                } else {
                  setState(() {
                    message = 'Failed to add user';
                  });
                }
              },
              child: const Text('Add'),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Manage Users'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: _showAddUserDialog,
            tooltip: 'Add User',
          ),
        ],
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : ListView.builder(
              itemCount: users.length,
              itemBuilder: (context, index) {
                final user = users[index];
                return ListTile(
                  title: Text(user['name'] ?? ''),
                  subtitle: Text('${user['email'] ?? ''} | ${user['role'] ?? ''} | ${user['college'] ?? ''}'),
                  trailing: IconButton(
                    icon: const Icon(Icons.delete, color: Colors.red),
                    onPressed: () async {
                      final confirmed = await showDialog<bool>(
                        context: context,
                        builder: (context) => AlertDialog(
                          title: const Text('Delete User'),
                          content: const Text('Are you sure you want to delete this user?'),
                          actions: [
                            TextButton(
                              onPressed: () => Navigator.pop(context, false),
                              child: const Text('Cancel'),
                            ),
                            ElevatedButton(
                              onPressed: () => Navigator.pop(context, true),
                              child: const Text('Delete'),
                            ),
                          ],
                        ),
                      );
                      if (confirmed == true) {
                        await deleteUser(user['id']);
                      }
                    },
                  ),
                );
              },
            ),
      bottomNavigationBar: message.isNotEmpty
          ? Container(
              color: Colors.red,
              padding: const EdgeInsets.all(12),
              child: Text(
                message,
                style: const TextStyle(color: Colors.white),
                textAlign: TextAlign.center,
              ),
            )
          : null,
    );
  }
} 